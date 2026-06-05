const express = require('express');
const router = express.Router();
const { compileAndRun, stopCurrentProcess } = require('../services/javaRunner');

let isRunning = false;

router.post('/run', async (req, res) => {
  if (isRunning) {
    return res.status(429).json({
      status: 'ERROR',
      output: '',
      error: 'A program is already running. Please wait or click Stop.',
      executionTime: null,
    });
  }

  const { code, input, timeLimit, memoryLimit, filename } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      status: 'ERROR',
      output: '',
      error: 'No code provided',
      executionTime: null,
    });
  }

  const tl = Math.max(500, Math.min(30000, timeLimit || 10000));
  const ml = Math.max(64, Math.min(1024, memoryLimit || 256));

  try {
    isRunning = true;
    const result = await compileAndRun(code, input || '', tl, ml);
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

// POST /api/stop - Kill the currently running program
router.post('/stop', (req, res) => {
  const killed = stopCurrentProcess();
  isRunning = false;
  res.json({ stopped: killed });
});

router.post('/check', async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.json({ errors: [] });
  }

  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const { v4: uuidv4 } = require('uuid');
  const { runProcess } = require('../utils/processManager');

  const tempId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `cp-ide-check-${tempId}`);
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : 'Main';
  const javaFile = path.join(tempDir, `${className}.java`);

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(javaFile, code, 'utf-8');

    const result = await runProcess('javac', ['-Xlint:all', javaFile], {
      timeout: 10000,
      cwd: tempDir,
    });

    const errors = [];
    const stderr = result.stderr || '';

    if (stderr) {
      const lines = stderr.split('\n');
      let i = 0;
      while (i < lines.length) {
        const match = lines[i].match(/:(\d+): (error|warning): (.+)/);
        if (match) {
          let message = match[3];
          let column = 1;
          let endColumn = null;
          // Collect follow-up detail lines (symbol:, location:, caret ^)
          let j = i + 1;
          while (j < lines.length && !lines[j].match(/:(\d+): (error|warning):/) && !lines[j].match(/^\d+ error/)) {
            const detail = lines[j].trim();
            if (detail === '') { j++; continue; }
            if (detail.startsWith('symbol:') || detail.startsWith('location:')) {
              message += ' | ' + detail;
            }
            // Caret line tells us the column
            if (detail.match(/^\^+$/)) {
              column = lines[j].indexOf('^') + 1;
              endColumn = column + detail.length;
            }
            j++;
          }
          errors.push({
            line: parseInt(match[1], 10),
            column: column,
            endColumn: endColumn,
            severity: match[2] === 'error' ? 8 : 4,
            message: message,
          });
          i = j;
        } else {
          i++;
        }
      }
    }

    return res.json({ errors });
  } catch (err) {
    res.json({ errors: [] });
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
});

// POST /api/cleanup - Remove unused imports and variables
router.post('/cleanup', async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.json({ code });
  }

  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const { v4: uuidv4 } = require('uuid');
  const { runProcess } = require('../utils/processManager');

  const tempId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `cp-ide-cleanup-${tempId}`);
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : 'Main';
  const javaFile = path.join(tempDir, `${className}.java`);

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(javaFile, code, 'utf-8');

    const result = await runProcess('javac', ['-Xlint:all', javaFile], {
      timeout: 10000,
      cwd: tempDir,
    });

    const stderr = result.stderr || '';
    const lines = code.split('\n');

    // Collect lines to remove (unused imports and unused variables)
    const linesToRemove = new Set();
    const stderrLines = stderr.split('\n');

    for (const line of stderrLines) {
      // Unused import: "warning: [unused] import java.util.List is never used"
      const unusedImport = line.match(/:(\d+): warning:.*(?:unused|is never used)/i);
      if (unusedImport) {
        const lineNum = parseInt(unusedImport[1], 10);
        const codeLine = lines[lineNum - 1];
        if (codeLine && codeLine.trim().startsWith('import ')) {
          linesToRemove.add(lineNum - 1);
        }
      }
    }

    // Also detect unused variables via pattern: variable 'x' is never used / not used
    for (const line of stderrLines) {
      const unusedVar = line.match(/:(\d+): warning:.*variable (\w+).*(?:never used|not used)/i);
      if (unusedVar) {
        linesToRemove.add(parseInt(unusedVar[1], 10) - 1);
      }
    }

    // Detect unused private methods (not called anywhere else in the code)
    const methodRegex = /^\s*private\s+(?:static\s+)?(?:\w+(?:<[^>]*>)?)\s+(\w+)\s*\(/;
    for (let idx = 0; idx < lines.length; idx++) {
      const methodMatch = lines[idx].match(methodRegex);
      if (methodMatch) {
        const methodName = methodMatch[1];
        // Check if this method is called anywhere else in the code
        let calledElsewhere = false;
        for (let k = 0; k < lines.length; k++) {
          if (k === idx) continue;
          // Look for method call pattern: methodName(
          if (lines[k].includes(methodName + '(') || lines[k].includes(methodName + ' (')) {
            calledElsewhere = true;
            break;
          }
        }
        if (!calledElsewhere) {
          // Remove the entire method body (find matching closing brace)
          let braceCount = 0;
          let started = false;
          for (let m = idx; m < lines.length; m++) {
            for (const ch of lines[m]) {
              if (ch === '{') { braceCount++; started = true; }
              if (ch === '}') braceCount--;
            }
            linesToRemove.add(m);
            if (started && braceCount === 0) break;
          }
        }
      }
    }

    if (linesToRemove.size === 0) {
      return res.json({ code, removed: 0 });
    }

    // Remove the lines and clean up consecutive blank lines
    const newLines = lines.filter((_, idx) => !linesToRemove.has(idx));

    // Remove consecutive blank lines left behind
    const cleanedLines = [];
    let prevBlank = false;
    for (const l of newLines) {
      const isBlank = l.trim() === '';
      if (isBlank && prevBlank) continue;
      cleanedLines.push(l);
      prevBlank = isBlank;
    }

    return res.json({ code: cleanedLines.join('\n'), removed: linesToRemove.size });
  } catch (err) {
    res.json({ code, removed: 0 });
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
});

module.exports = router;
