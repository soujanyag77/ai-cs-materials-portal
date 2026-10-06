const fs = require('fs');
const path = require('path');
const db = require('./database');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Minimal valid PDF binary string helper
function createSamplePDF(title, contentText) {
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 180 >>
stream
BT
/F1 20 Tf
50 720 Td
(${title.replace(/[\(\)]/g, '')}) Tj
0 -35 Td
/F1 12 Tf
(CBSE Curriculum Study Material) Tj
0 -25 Td
(${contentText.substring(0, 70).replace(/[\(\)]/g, '')}) Tj
0 -20 Td
(Key Topics: Python Programming, Data Structures, SQL, System Architecture) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000246 00000 n 
0000000477 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
556
%%EOF`;
  return Buffer.from(pdfContent);
}

// Sample HTML interactive file helper
function createSampleHTML(title, chapterName, labType) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 2rem; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-top: 0; }
    .badge { background: #6366f1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; display: inline-block; font-weight: 600; margin-bottom: 1rem; }
    .demo-box { background: #0f172a; border-radius: 8px; padding: 1.5rem; margin-top: 1.5rem; text-align: center; border: 1px dashed #6366f1; }
    button { background: linear-gradient(135deg, #6366f1, #38bdf8); border: none; color: white; font-weight: bold; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; transition: transform 0.2s; margin: 4px; }
    button:hover { transform: scale(1.05); }
    .output { margin-top: 1rem; font-size: 1.1rem; font-weight: bold; color: #4ade80; min-height: 40px; font-family: monospace; background: #090d16; padding: 1rem; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">${chapterName}</span>
    <h1>${title}</h1>
    <p>Welcome to the practical interactive laboratory for CBSE Computer Science & AI.</p>
    
    <div class="demo-box">
      <h3>${labType === 'sql' ? 'Interactive SQL Query Simulator' : 'Interactive Neural Network Simulator'}</h3>
      <p>${labType === 'sql' ? 'Execute sample MySQL SELECT queries on Student Database Table below:' : 'Click below to test perceptron activation weights.'}</p>
      
      ${labType === 'sql' ? `
        <button onclick="runQuery('SELECT * FROM Student WHERE Marks > 85;')">SELECT * WHERE Marks &gt; 85</button>
        <button onclick="runQuery('SELECT Stream, COUNT(*) FROM Student GROUP BY Stream;')">GROUP BY Stream</button>
      ` : `
        <button onclick="runPerceptron()">Run Perceptron Activation</button>
      `}

      <div id="result" class="output">Select an action above</div>
    </div>
  </div>

  <script>
    function runQuery(q) {
      if (q.includes('WHERE')) {
        document.getElementById('result').innerHTML = 'QUERY: ' + q + '<br/>&rarr; Returned 3 rows: [101: Rahul (92%), 104: Priya (88%), 205: Rohan (91%)]';
      } else {
        document.getElementById('result').innerHTML = 'QUERY: ' + q + '<br/>&rarr; [CS: 14 students, AI: 18 students, IP: 9 students]';
      }
    }
    function runPerceptron() {
      const z = (Math.random() * 2 - 1).toFixed(3);
      document.getElementById('result').innerHTML = 'Output Activation Z = ' + z + ' &rarr; Sigmoid: ' + (1/(1+Math.exp(-z))).toFixed(4);
    }
  </script>
</body>
</html>`;
}

function seedSampleData() {
  const existingDocs = db.getDocuments();
  // If database has AI docs but missing CS docs, let's append CS docs!
  const hasCSDocs = existingDocs.some(d => d.subject === 'Computer Science');

  if (existingDocs.length > 0 && hasCSDocs) {
    console.log('Database already populated with AI & CS materials.');
    return;
  }

  console.log('Seeding initial Class 10, 11, and 12 AI & CS materials...');

  // If DB has no documents at all, add AI docs first
  if (existingDocs.length === 0) {
    // 1. Class 10 AI PDF
    const pdfFileName = 'class10_ai_unit1.pdf';
    const pdfPath = path.join(UPLOADS_DIR, pdfFileName);
    fs.writeFileSync(pdfPath, createSamplePDF('Class 10 AI Unit 1 Notes', 'Complete overview of Artificial Intelligence domains and ethics for Class 10 CBSE.'));
    
    const doc1 = db.addDocument({
      title: 'Class 10 AI - Unit 1: Introduction to AI & Project Cycle',
      description: 'Comprehensive study guide covering AI Domains (Data, CV, NLP), Sustainable Development Goals (SDGs), and the 5 stages of the AI Project Cycle.',
      grade: 'Class 10',
      chapterNumber: 'Chapter 1',
      chapterTitle: 'Introduction to AI & Project Cycle',
      subject: 'Artificial Intelligence',
      fileType: 'pdf',
      fileName: pdfFileName,
      originalName: 'Class_10_AI_Unit_1_Notes.pdf',
      fileSize: fs.statSync(pdfPath).size
    });

    // 2. Class 10 AI HTML
    const htmlFileName10 = 'class10_cv_chapter5.html';
    const htmlPath10 = path.join(UPLOADS_DIR, htmlFileName10);
    fs.writeFileSync(htmlPath10, createSampleHTML('Class 10 AI - Unit 5: Computer Vision Basics', 'Chapter 5: Computer Vision', 'ai'));

    const doc2 = db.addDocument({
      title: 'Class 10 AI - Unit 5: Computer Vision & Image Processing',
      description: 'Detailed study chapter explaining RGB image channels, pixel arrays, grayscale conversion, image classification vs object detection.',
      grade: 'Class 10',
      chapterNumber: 'Chapter 5',
      chapterTitle: 'Computer Vision',
      subject: 'Artificial Intelligence',
      fileType: 'html',
      fileName: htmlFileName10,
      originalName: 'Class_10_Computer_Vision.html',
      fileSize: fs.statSync(htmlPath10).size
    });

    // 3. Class 11 AI Presentation
    const pptFileName = 'class11_python_ml.html';
    const pptPath = path.join(UPLOADS_DIR, pptFileName);
    fs.writeFileSync(pptPath, `<!DOCTYPE html><html><head><style>body { background: #090d16; color: #fff; font-family: system-ui; padding: 2rem; } .slide { background: #131b2e; border-left: 4px solid #6366f1; border-radius: 8px; padding: 2rem; margin-bottom: 1.5rem; } h2 { color: #818cf8; margin-top: 0; } code { background: #1e293b; padding: 4px 8px; border-radius: 4px; color: #38bdf8; font-family: monospace; }</style></head><body><div class="slide"><h2>Slide 1: Python Libraries for AI & Machine Learning</h2><p>Essential packages for CBSE Class 11 AI Curriculum:</p><ul><li><code>NumPy</code>: High performance N-dimensional array manipulation</li><li><code>Pandas</code>: Data structures (DataFrames & Series) for data cleaning</li><li><code>Matplotlib</code>: Data visualization and plot generation</li></ul></div></body></html>`);

    const doc3 = db.addDocument({
      title: 'Class 11 AI - Unit 2: Python for Machine Learning (Slide Deck)',
      description: 'Presentation slides explaining NumPy arrays, Pandas DataFrames, Data Cleaning, and Matplotlib data visualization techniques.',
      grade: 'Class 11',
      chapterNumber: 'Chapter 2',
      chapterTitle: 'Python Programming for ML',
      subject: 'Artificial Intelligence',
      fileType: 'ppt',
      fileName: pptFileName,
      originalName: 'Class_11_Python_ML_Presentation.ppt',
      fileSize: fs.statSync(pptPath).size
    });

    // 4. Class 12 AI PDF
    const pdf12FileName = 'class12_neural_nets.pdf';
    const pdf12Path = path.join(UPLOADS_DIR, pdf12FileName);
    fs.writeFileSync(pdf12Path, createSamplePDF('Class 12 AI - Deep Learning Notes', 'In-depth guide on Artificial Neural Networks, Perceptrons, Activation Functions, and Training.'));

    const doc4 = db.addDocument({
      title: 'Class 12 AI - Unit 3: Artificial Neural Networks & Deep Learning',
      description: 'Advanced study material detailing Perceptron architecture, Forward/Backward propagation, Gradient Descent, and Activation functions.',
      grade: 'Class 12',
      chapterNumber: 'Chapter 3',
      chapterTitle: 'Artificial Neural Networks',
      subject: 'Artificial Intelligence',
      fileType: 'pdf',
      fileName: pdf12FileName,
      originalName: 'Class_12_Neural_Networks.pdf',
      fileSize: fs.statSync(pdf12Path).size
    });

    // Initial log access for sample AI docs
    db.logAccess({ documentId: doc1.id, studentName: 'Aarav Sharma', rollNumber: '101', studentClass: 'Class 10' });
    db.logAccess({ documentId: doc3.id, studentName: 'Rohan Gupta', rollNumber: '205', studentClass: 'Class 11' });
  }

  // --- SEED COMPUTER SCIENCE (CS CODE 083) MATERIALS FOR CLASS 11 & CLASS 12 ---

  // CS 1. Class 11 CS PDF - Computer Systems
  const cs11PdfName = 'class11_cs_computer_systems.pdf';
  const cs11PdfPath = path.join(UPLOADS_DIR, cs11PdfName);
  fs.writeFileSync(cs11PdfPath, createSamplePDF('Class 11 Computer Science - Unit 1 Notes', 'Complete overview of Computer Systems, Boolean Logic Gates, and Operating Systems for CBSE CS 083.'));

  const csDoc1 = db.addDocument({
    title: 'Class 11 CS - Unit 1: Computer Systems Organisation & Logic Gates',
    description: 'CBSE Class 11 CS (Code 083) notes covering CPU registers, Bus architecture, RAM/ROM memory hierarchy, Truth tables, and De Morgan Laws.',
    grade: 'Class 11',
    chapterNumber: 'Chapter 1',
    chapterTitle: 'Computer System Organisation',
    subject: 'Computer Science',
    fileType: 'pdf',
    fileName: cs11PdfName,
    originalName: 'Class_11_CS_Computer_Systems.pdf',
    fileSize: fs.statSync(cs11PdfPath).size
  });

  // CS 2. Class 11 CS HTML / DOCX - Python Functions & Strings
  const cs11HtmlName = 'class11_cs_python_functions.html';
  const cs11HtmlPath = path.join(UPLOADS_DIR, cs11HtmlName);
  fs.writeFileSync(cs11HtmlPath, `<!DOCTYPE html><html><head><style>body { background:#0f172a; color:#f8fafc; font-family:system-ui; padding:2rem; } h1 { color:#38bdf8; } pre { background:#1e293b; padding:1rem; border-radius:8px; color:#4ade80; }</style></head><body><h1>Class 11 CS - Python Functions & Scope</h1><p>Functions allow code reusability. Parameters can be positional, default, or keyword arguments.</p><h3>Scope Example:</h3><pre>x = 100 # Global variable\ndef update():\n    global x\n    x = 200 # Mutates global x\nupdate()\nprint(x) # Output: 200</pre></body></html>`);

  const csDoc2 = db.addDocument({
    title: 'Class 11 CS - Unit 2: Python Functions, Scope & Modules',
    description: 'Detailed study guide explaining function parameters, default values, global vs local variable scope, and math/random modules.',
    grade: 'Class 11',
    chapterNumber: 'Chapter 2',
    chapterTitle: 'Computational Thinking & Functions',
    subject: 'Computer Science',
    fileType: 'html',
    fileName: cs11HtmlName,
    originalName: 'Class_11_CS_Python_Functions.html',
    fileSize: fs.statSync(cs11HtmlPath).size
  });

  // CS 3. Class 12 CS PPT Presentation - Data Structures (Stack)
  const cs12PptName = 'class12_cs_stack_datastructure.html';
  const cs12PptPath = path.join(UPLOADS_DIR, cs12PptName);
  fs.writeFileSync(cs12PptPath, `<!DOCTYPE html><html><head><style>body { background:#090d16; color:#fff; font-family:system-ui; padding:2rem; } .slide { background:#1e1b4b; border-left:4px solid #818cf8; border-radius:12px; padding:2rem; margin-bottom:1.5rem; } h2 { color:#c084fc; margin-top:0; } code { background:#0f172a; padding:4px 8px; border-radius:4px; color:#38bdf8; font-family:monospace; }</style></head><body><div class="slide"><h2>Slide 1: Stack Data Structure in Python (LIFO)</h2><p>A Stack is a linear data structure following <b>Last In First Out (LIFO)</b> order.</p><ul><li><code>push(item)</code>: Append element to top of stack</li><li><code>pop()</code>: Remove element from top of stack (Check Underflow!)</li><li><code>peek()</code>: View top element without removing</li></ul></div><div class="slide"><h2>Slide 2: Python Stack Implementation</h2><pre style="background:#090d16; padding:1rem; border-radius:8px; color:#4ade80;">stack = []
def push_item(element):
    stack.append(element)
def pop_item():
    if not stack:
        return "Underflow!"
    return stack.pop()</pre></div></body></html>`);

  const csDoc3 = db.addDocument({
    title: 'Class 12 CS - Unit 1: Data Structures - Stack Implementation in Python',
    description: 'Presentation slide deck explaining LIFO principles, Stack Push/Pop operations using Python Lists, Overflow & Underflow exception handling.',
    grade: 'Class 12',
    chapterNumber: 'Chapter 1',
    chapterTitle: 'Data Structures: Stack',
    subject: 'Computer Science',
    fileType: 'ppt',
    fileName: cs12PptName,
    originalName: 'Class_12_CS_Stack_DataStructure.ppt',
    fileSize: fs.statSync(cs12PptPath).size
  });

  // CS 4. Class 12 CS Interactive Lab - SQL Queries & Relational Database
  const cs12SqlName = 'class12_cs_sql_queries_lab.html';
  const cs12SqlPath = path.join(UPLOADS_DIR, cs12SqlName);
  fs.writeFileSync(cs12SqlPath, createSampleHTML('Class 12 CS - Database Management & SQL Lab', 'Chapter 2: Database Management & SQL', 'sql'));

  const csDoc4 = db.addDocument({
    title: 'Class 12 CS - Unit 2: Relational Databases & SQL Queries Lab',
    description: 'Interactive SQL Query Simulator covering DDL, DML, GROUP BY, HAVING, and INNER JOIN clauses for CBSE Class 12 CS Practical.',
    grade: 'Class 12',
    chapterNumber: 'Chapter 2',
    chapterTitle: 'Database Management & SQL',
    subject: 'Computer Science',
    fileType: 'html',
    fileName: cs12SqlName,
    originalName: 'Class_12_CS_SQL_Queries_Lab.html',
    fileSize: fs.statSync(cs12SqlPath).size
  });

  // Log sample accesses for CS materials
  db.logAccess({ documentId: csDoc1.id, studentName: 'Aditya Varma', rollNumber: '202', studentClass: 'Class 11' });
  db.logAccess({ documentId: csDoc3.id, studentName: 'Divya Nair', rollNumber: '308', studentClass: 'Class 12' });
  db.logAccess({ documentId: csDoc4.id, studentName: 'Divya Nair', rollNumber: '308', studentClass: 'Class 12' });

  console.log('Sample Class 11 & Class 12 Computer Science materials seeded successfully!');
}

module.exports = seedSampleData;
