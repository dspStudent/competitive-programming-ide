const express = require('express');
const router = express.Router();
const { getStatus, commitAndPush } = require('../services/gitService');

// GET /api/git/status - Get git status for workspace
router.get('/git/status', async (req, res) => {
  try {
    const status = await getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/git/commit-and-push - Commit all workspace changes and push
router.post('/git/commit-and-push', async (req, res) => {
  try {
    const { elapsedTime } = req.body || {};
    const result = await commitAndPush(elapsedTime);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
