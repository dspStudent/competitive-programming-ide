const express = require('express');
const router = express.Router();
const { listFiles, readFile, createFile, updateFile, deleteFile } = require('../services/fileService');

// GET /api/files - List all files in workspace
router.get('/files', (req, res) => {
  try {
    const files = listFiles();
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/files/:filename - Read a file
router.get('/files/:filename', (req, res) => {
  try {
    const content = readFile(req.params.filename);
    res.json({ filename: req.params.filename, content });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// POST /api/files - Create a new file
router.post('/files', (req, res) => {
  try {
    const { filename, content } = req.body;
    const result = createFile(filename, content);
    res.status(201).json({ filename: result.filename, message: `Created ${result.filename}` });
  } catch (err) {
    const status = err.message.includes('already exists') ? 409 : 400;
    res.status(status).json({ error: err.message });
  }
});

// PUT /api/files/:filename - Update a file
router.put('/files/:filename', (req, res) => {
  try {
    const { content } = req.body;
    if (content === undefined || content === null) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const result = updateFile(req.params.filename, content);
    res.json({ filename: result.filename, message: `Updated ${result.filename}` });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// DELETE /api/files/:filename - Delete a file
router.delete('/files/:filename', (req, res) => {
  try {
    const result = deleteFile(req.params.filename);
    res.json({ filename: result.filename, message: `Deleted ${result.filename}` });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;
