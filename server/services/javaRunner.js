const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { runProcess } = require('../utils/processManager');

const COMPILE_TIMEOUT = 15000;

// Store the current running process so we can kill it
let currentProcess = null;

function extractClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : 'Main';
}

/**
 * Kill the currently running process
 */
function stopCurrentProcess() {
  if (currentProcess) {
    try {
      currentProcess.kill('SIGKILL');
    } catch (e) {}
    currentProcess = null;
    return true;
  }
  return false;
}

/**
 * Compiles and runs Java code with configurable limits.
 * @param {string} code - Java source code
 * @param {string} input - stdin input
 * @param {number} timeLimit - time limit in milliseconds
 * @param {number} memoryLimit - memory limit in MB
 */
async function compileAndRun(code, input = '', timeLimit = 10000, memoryLimit = 256) {
  const tempId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `cp-ide-${tempId}`);
  const className = extractClassName(code);
  const javaFile = path.join(tempDir, `${className}.java`);

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(javaFile, code, 'utf-8');

    // Compilation
    const compileResult = await runProcess('javac', [javaFile], {
      timeout: COMPILE_TIMEOUT,
      cwd: tempDir,
    });

    if (compileResult.timedOut) {
      return {
        status: 'CE',
        output: '',
        error: 'Compilation timed out (15s limit)',
        executionTime: null,
      };
    }

    if (compileResult.exitCode !== 0) {
      return {
        status: 'CE',
        output: '',
        error: compileResult.stderr.replace(new RegExp(tempDir.replace(/[\\\/]/g, '[\\\\\\/]'), 'g'), ''),
        executionTime: null,
      };
    }

    // Execution with configurable limits
    const startTime = Date.now();
    const execResult = await new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let killed = false;

      const proc = spawn('java', [`-Xmx${memoryLimit}m`, '-cp', tempDir, className], {
        cwd: tempDir,
        shell: true,
      });

      currentProcess = proc;

      const timer = setTimeout(() => {
        timedOut = true;
        killed = true;
        try { proc.kill('SIGKILL'); } catch (e) {}
      }, timeLimit);

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        if (stdout.length > 1024 * 1024) {
          killed = true;
          try { proc.kill('SIGKILL'); } catch (e) {}
        }
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      if (input) {
        proc.stdin.write(input);
      }
      proc.stdin.end();

      proc.on('close', (exitCode) => {
        clearTimeout(timer);
        currentProcess = null;
        resolve({ stdout: stdout.substring(0, 1024 * 1024), stderr, exitCode, timedOut, killed });
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        currentProcess = null;
        resolve({ stdout: '', stderr: err.message, exitCode: -1, timedOut: false, killed: false });
      });
    });

    const executionTime = Date.now() - startTime;

    if (execResult.timedOut) {
      return {
        status: 'TLE',
        output: execResult.stdout,
        error: `Time Limit Exceeded (${(timeLimit / 1000).toFixed(1)}s limit)`,
        executionTime,
      };
    }

    if (execResult.stderr.includes('OutOfMemoryError')) {
      return {
        status: 'MLE',
        output: execResult.stdout,
        error: `Memory Limit Exceeded (${memoryLimit}MB limit)`,
        executionTime,
      };
    }

    if (execResult.exitCode !== 0) {
      return {
        status: 'RTE',
        output: execResult.stdout,
        error: execResult.stderr,
        executionTime,
      };
    }

    return {
      status: 'OK',
      output: execResult.stdout,
      error: '',
      executionTime,
    };
  } finally {
    currentProcess = null;
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

module.exports = { compileAndRun, stopCurrentProcess };
