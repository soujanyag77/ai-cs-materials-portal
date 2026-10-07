const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function seedSampleData() {
  // Production mode: Start with a clean database ready for user uploads
  console.log('Database initialized in clean production mode.');
}

module.exports = seedSampleData;
