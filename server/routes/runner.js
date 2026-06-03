const express = require('express');
const router = express.Router();
const { compileAndRun } = require('../services/javaRunner');

let isRunning = false;

router.post('/run', async (req, res) => {
  if (isRunning) {
    return res.status(429).json({
      status: 'ERROR',
      output: '',
      error: 'A program is already running. Please wait.',
      executionTime: null,
    });
  }

  const { code, input } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      status: 'ERROR',
      output: '',
      error: 'No code provided',
      executionTime: null,
    });
  }

  try {
    isRunning = true;
    const result = await compileAndRun(code, input || '');
    res.json(result);
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      output: '',
      error: `Server error: ${err.message}`,
      executionTime: null,
    });
  } finally {
    isRunning = false;
  }
});

module.exports = router;
