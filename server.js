const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./database');
const seedSampleData = require('./seed-data');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = Date.now() + '_' + Math.random().toString(36).substring(2, 8) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.ppt', '.pptx', '.docx', '.doc', '.html', '.htm'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PPT, DOCX, and HTML files are allowed.'));
    }
  }
});

seedSampleData();

// --- REST API ENDPOINTS ---

// 1. Teacher Authentication Endpoint (Username: CSGS, Password: GS@123)
app.post('/api/auth/teacher-login', (req, res) => {
  const { username, password, pin } = req.body;
  
  const userValid = !username || username.trim() === 'CSGS';
  const passValid = (password && password.trim() === 'GS@123') || (pin && (pin.trim() === 'GS@123' || pin.trim() === 'CSGS' || pin.trim() === '1234'));

  if (userValid && passValid) {
    return res.json({
      success: true,
      role: 'teacher',
      token: 'teacher_session_' + Date.now(),
      message: 'Teacher authenticated successfully!'
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid Teacher Credentials. Use Username: CSGS and Password: GS@123'
  });
});

// 2. Student Registration Endpoint
app.post('/api/auth/student-register', (req, res) => {
  try {
    const { name, rollNumber, grade, section } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full Name is required.' });
    }
    if (!rollNumber || !rollNumber.trim()) {
      return res.status(400).json({ error: 'Roll Number is required.' });
    }

    const { student, isNew } = db.registerStudent({
      name,
      rollNumber,
      grade: grade || '10',
      section: section || 'A'
    });

    res.json({
      success: true,
      isNew,
      student,
      message: isNew ? 'Student registered successfully!' : 'Student account retrieved!'
    });
  } catch (err) {
    console.error('Error registering student:', err);
    res.status(500).json({ error: 'Failed to register student.' });
  }
});

// 3. Student Login Endpoint
app.post('/api/auth/student-login', (req, res) => {
  try {
    const { name, rollNumber } = req.body;

    if (!name || !rollNumber) {
      return res.status(400).json({ error: 'Name and Roll Number are required to login.' });
    }

    const student = db.loginStudent({ name, rollNumber });

    if (!student) {
      return res.status(404).json({ error: 'No student account found. Please register first.' });
    }

    res.json({
      success: true,
      student,
      message: 'Student logged in successfully!'
    });
  } catch (err) {
    console.error('Error logging in student:', err);
    res.status(500).json({ error: 'Failed to login student.' });
  }
});

// Get All Documents
app.get('/api/documents', (req, res) => {
  try {
    let docs = db.getDocuments();
    const { grade, chapter, fileType, subject, search } = req.query;

    if (grade && grade !== 'All') {
      docs = docs.filter(d => d.grade.toLowerCase() === grade.toLowerCase());
    }

    if (subject && subject !== 'All') {
      docs = docs.filter(d => (d.subject || 'Artificial Intelligence').toLowerCase() === subject.toLowerCase());
    }

    if (chapter && chapter !== 'All') {
      docs = docs.filter(d => d.chapterNumber.toLowerCase() === chapter.toLowerCase());
    }

    if (fileType && fileType !== 'All') {
      docs = docs.filter(d => d.fileType.toLowerCase() === fileType.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.description.toLowerCase().includes(q) ||
        d.chapterTitle.toLowerCase().includes(q)
      );
    }

    const analytics = db.getAnalytics();
    const docsWithCounts = docs.map(doc => {
      const stat = analytics.docsWithStats.find(s => s.id === doc.id);
      return {
        ...doc,
        totalViews: stat ? stat.totalViews : 0,
        uniqueStudentsCount: stat ? stat.uniqueStudentsCount : 0
      };
    });

    res.json(docsWithCounts);
  } catch (err) {
    console.error('Error getting documents:', err);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// Upload Document
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }

    const { title, description, grade, chapterNumber, chapterTitle, subject } = req.body;

    if (!title || !grade) {
      return res.status(400).json({ error: 'Title and Grade level are required.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    let fileType = 'pdf';
    if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
    else if (['docx', 'doc'].includes(ext)) fileType = 'docx';
    else if (['html', 'htm'].includes(ext)) fileType = 'html';
    else if (ext === 'pdf') fileType = 'pdf';

    const newDoc = db.addDocument({
      title: title.trim(),
      description: description ? description.trim() : '',
      grade: grade,
      subject: subject || 'Artificial Intelligence',
      chapterNumber: chapterNumber ? chapterNumber.trim() : 'Chapter 1',
      chapterTitle: chapterTitle ? chapterTitle.trim() : 'General Topic',
      fileType,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size
    });

    res.status(201).json({ message: 'Material uploaded successfully!', document: newDoc });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

// Get / View Raw File Content
app.get('/api/documents/:id/file', (req, res) => {
  try {
    const doc = db.getDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).send('Document not found');
    }

    const filePath = path.join(UPLOADS_DIR, doc.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File missing from disk');
    }

    const ext = path.extname(doc.fileName).toLowerCase();
    const contentTypeMap = {
      '.pdf': 'application/pdf',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.ppt': 'application/vnd.ms-powerpoint'
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Error serving file:', err);
    res.status(500).send('Error reading file');
  }
});

// Log Student Access
app.post('/api/access', (req, res) => {
  try {
    const { documentId, studentName, rollNumber, studentClass } = req.body;

    if (!documentId || !studentName) {
      return res.status(400).json({ error: 'Document ID and Student Name are required to record access.' });
    }

    const logEntry = db.logAccess({
      documentId,
      studentName,
      rollNumber,
      studentClass
    });

    if (!logEntry) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.json({ message: 'Access logged successfully', logEntry });
  } catch (err) {
    console.error('Error logging access:', err);
    res.status(500).json({ error: 'Failed to record student access.' });
  }
});

// Get Analytics Data
app.get('/api/analytics', (req, res) => {
  try {
    const analytics = db.getAnalytics();
    res.json(analytics);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics.' });
  }
});

// Delete Document
app.delete('/api/documents/:id', (req, res) => {
  try {
    const deleted = db.deleteDocument(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const filePath = path.join(UPLOADS_DIR, deleted.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Document deleted successfully', deleted });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
});

// Serve frontend build static files in production
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`AI & CS Study Portal Server running on http://localhost:${PORT}`);
});
