const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
const upload = multer({ dest: 'uploads/' });

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ 
    message: 'File uploaded!',
    filename: req.file.filename 
  });
});

// Start server
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});