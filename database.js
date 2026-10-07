const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

const initialData = {
  documents: [],
  access_logs: [],
  students: []
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.students) data.students = [];
    return data;
  } catch (err) {
    console.error('Error reading DB file:', err);
    return initialData;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

const db = {
  getDocuments: () => {
    const data = readDB();
    return data.documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getDocumentById: (id) => {
    const data = readDB();
    return data.documents.find(doc => doc.id === id);
  },

  addDocument: (doc) => {
    const data = readDB();
    const newDoc = {
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: doc.title,
      description: doc.description || '',
      grade: doc.grade,
      subject: doc.subject || 'Artificial Intelligence',
      chapterNumber: doc.chapterNumber || 'Chapter 1',
      chapterTitle: doc.chapterTitle || 'General',
      fileType: doc.fileType,
      fileName: doc.fileName,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      createdAt: new Date().toISOString()
    };
    data.documents.push(newDoc);
    writeDB(data);
    return newDoc;
  },

  deleteDocument: (id) => {
    const data = readDB();
    const index = data.documents.findIndex(d => d.id === id);
    if (index !== -1) {
      const deleted = data.documents.splice(index, 1)[0];
      data.access_logs = data.access_logs.filter(log => log.documentId !== id);
      writeDB(data);
      return deleted;
    }
    return null;
  },

  // Student Registration & Authentication
  registerStudent: ({ name, rollNumber, grade, section }) => {
    const data = readDB();
    const cleanName = name.trim();
    const cleanRoll = rollNumber.trim();
    const cleanSection = section.toUpperCase() === 'B' ? 'B' : 'A';
    const studentClass = `${grade}${cleanSection}`; // e.g. "10A", "10B", "11A", "12B"

    // Check if student already exists by name and roll
    let existing = data.students.find(
      s => s.name.toLowerCase() === cleanName.toLowerCase() && s.rollNumber.toLowerCase() === cleanRoll.toLowerCase()
    );

    if (existing) {
      existing.grade = grade;
      existing.section = cleanSection;
      existing.studentClass = studentClass;
      writeDB(data);
      return { student: existing, isNew: false };
    }

    const newStudent = {
      id: 'stu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: cleanName,
      rollNumber: cleanRoll,
      grade,
      section: cleanSection,
      studentClass,
      registeredAt: new Date().toISOString()
    };

    data.students.push(newStudent);
    writeDB(data);
    return { student: newStudent, isNew: true };
  },

  loginStudent: ({ name, rollNumber }) => {
    const data = readDB();
    const cleanName = name.trim().toLowerCase();
    const cleanRoll = rollNumber.trim().toLowerCase();

    const student = data.students.find(
      s => s.name.toLowerCase() === cleanName && s.rollNumber.toLowerCase() === cleanRoll
    );

    return student || null;
  },

  getStudents: () => {
    const data = readDB();
    return data.students;
  },

  logAccess: ({ documentId, studentName, rollNumber, studentClass }) => {
    const data = readDB();
    const doc = data.documents.find(d => d.id === documentId);
    if (!doc) return null;

    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      documentId,
      studentName: studentName.trim(),
      rollNumber: rollNumber ? rollNumber.trim() : 'N/A',
      studentClass: studentClass || doc.grade,
      timestamp: new Date().toISOString()
    };

    data.access_logs.push(logEntry);
    writeDB(data);
    return logEntry;
  },

  getAnalytics: () => {
    const data = readDB();
    const documents = data.documents;
    const logs = data.access_logs;
    const students = data.students || [];

    const totalDocuments = documents.length;
    const totalAccesses = logs.length;

    // Document view statistics
    const docsWithStats = documents.map(doc => {
      const docLogs = logs.filter(l => l.documentId === doc.id);
      
      const studentMap = {};
      docLogs.forEach(l => {
        const key = `${l.studentName} (${l.rollNumber || 'N/A'}) - Section ${l.studentClass}`;
        if (!studentMap[key]) {
          studentMap[key] = {
            studentName: l.studentName,
            rollNumber: l.rollNumber,
            studentClass: l.studentClass,
            count: 0,
            lastAccessedAt: l.timestamp
          };
        }
        studentMap[key].count += 1;
        if (new Date(l.timestamp) > new Date(studentMap[key].lastAccessedAt)) {
          studentMap[key].lastAccessedAt = l.timestamp;
        }
      });

      const studentsList = Object.values(studentMap).sort((a, b) => b.count - a.count);

      return {
        ...doc,
        totalViews: docLogs.length,
        uniqueStudentsCount: studentsList.length,
        studentsList
      };
    });

    // 1. TOPIC / CHAPTER-WISE ANALYSIS
    const topicMap = {};
    logs.forEach(log => {
      const doc = documents.find(d => d.id === log.documentId);
      if (doc) {
        const topicKey = `${doc.grade} | ${doc.subject} | ${doc.chapterNumber}: ${doc.chapterTitle}`;
        if (!topicMap[topicKey]) {
          topicMap[topicKey] = {
            topicKey,
            grade: doc.grade,
            subject: doc.subject,
            chapterNumber: doc.chapterNumber,
            chapterTitle: doc.chapterTitle,
            documentTitle: doc.title,
            accessCount: 0,
            students: new Set()
          };
        }
        topicMap[topicKey].accessCount += 1;
        topicMap[topicKey].students.add(`${log.studentName}_${log.rollNumber}`);
      }
    });

    const topicStats = Object.values(topicMap).map(t => ({
      ...t,
      uniqueStudentsCount: t.students.size
    })).sort((a, b) => b.accessCount - a.accessCount);

    // 2. USER-WISE DETAILED ANALYSIS
    const userMap = {};
    logs.forEach(log => {
      const userKey = `${log.studentName.toLowerCase()}_${(log.rollNumber || 'na').toLowerCase()}_${log.studentClass}`;
      if (!userMap[userKey]) {
        userMap[userKey] = {
          studentName: log.studentName,
          rollNumber: log.rollNumber || 'N/A',
          studentClass: log.studentClass,
          totalVisits: 0,
          lastActive: log.timestamp,
          topicsMap: {}
        };
      }
      userMap[userKey].totalVisits += 1;
      if (new Date(log.timestamp) > new Date(userMap[userKey].lastActive)) {
        userMap[userKey].lastActive = log.timestamp;
      }

      const doc = documents.find(d => d.id === log.documentId);
      const topicName = doc ? `${doc.chapterNumber}: ${doc.chapterTitle}` : 'General Material';
      if (!userMap[userKey].topicsMap[topicName]) {
        userMap[userKey].topicsMap[topicName] = 0;
      }
      userMap[userKey].topicsMap[topicName] += 1;
    });

    const userWiseStats = Object.values(userMap).map(u => {
      const topicsList = Object.entries(u.topicsMap).map(([topicName, count]) => ({
        topicName,
        count
      })).sort((a, b) => b.count - a.count);

      return {
        studentName: u.studentName,
        rollNumber: u.rollNumber,
        studentClass: u.studentClass,
        totalVisits: u.totalVisits,
        lastActive: u.lastActive,
        topicsList
      };
    }).sort((a, b) => b.totalVisits - a.totalVisits);

    // 3. SECTION-WISE BREAKDOWN
    const sectionStatsMap = {};
    logs.forEach(log => {
      const sec = log.studentClass || '10A';
      if (!sectionStatsMap[sec]) {
        sectionStatsMap[sec] = {
          sectionName: sec,
          totalViews: 0,
          uniqueStudents: new Set(),
          topicsMap: {}
        };
      }
      sectionStatsMap[sec].totalViews += 1;
      sectionStatsMap[sec].uniqueStudents.add(`${log.studentName}_${log.rollNumber}`);

      const doc = documents.find(d => d.id === log.documentId);
      if (doc) {
        const tName = `${doc.chapterNumber}: ${doc.chapterTitle}`;
        sectionStatsMap[sec].topicsMap[tName] = (sectionStatsMap[sec].topicsMap[tName] || 0) + 1;
      }
    });

    const sectionWiseStats = Object.values(sectionStatsMap).map(s => {
      const topTopicsSorted = Object.entries(s.topicsMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return {
        sectionName: s.sectionName,
        totalViews: s.totalViews,
        uniqueStudentsCount: s.uniqueStudents.size,
        topTopics: topTopicsSorted
      };
    }).sort((a, b) => b.totalViews - a.totalViews);

    // Recent logs
    const recentLogs = [...logs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50)
      .map(log => {
        const doc = documents.find(d => d.id === log.documentId);
        return {
          ...log,
          documentTitle: doc ? doc.title : 'Deleted File',
          subject: doc ? doc.subject : 'N/A',
          grade: doc ? doc.grade : 'N/A',
          chapterNumber: doc ? doc.chapterNumber : 'N/A',
          chapterTitle: doc ? doc.chapterTitle : 'N/A',
          fileType: doc ? doc.fileType : 'unknown'
        };
      });

    return {
      totalDocuments,
      totalAccesses,
      totalStudentsCount: Math.max(students.length, userWiseStats.length),
      registeredStudentsCount: students.length,
      sectionWiseStats,
      topicStats,
      userWiseStats,
      docsWithStats,
      recentLogs
    };
  }
};

module.exports = db;
