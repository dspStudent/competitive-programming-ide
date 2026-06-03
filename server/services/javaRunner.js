const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { runProcess } = require('../utils/processManager');

const COMPILE_TIMEOUT = 15000;
const EXECUTION_TIMEOUT = 10000;

/**
 * Extracts the public class name from Java source code.
 * Falls back to "Main" if no public class found.
 */
function extractClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : 'Main';
}

/**
 * Compiles and runs Java code with the given input.
 * Returns { status, output, error, executionTime }
 */
async function compileAndRun(code, input = '') {
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

    // Execution
    const startTime = Date.now();
    const execResult = await runProcess(
      'java',
      ['-Xmx256m', '-cp', tempDir, className],
      {
        timeout: EXECUTION_TIMEOUT,
        input,
        cwd: tempDir,
      }
    );
    const executionTime = Date.now() - startTime;

    if (execResult.timedOut) {
      return {
        status: 'TLE',
        output: execResult.stdout,
        error: `Time Limit Exceeded (${EXECUTION_TIMEOUT / 1000}s limit)`,
        executionTime,
      };
    }

    if (execResult.stderr.includes('OutOfMemoryError')) {
      return {
        status: 'MLE',
        output: execResult.stdout,
        error: 'Memory Limit Exceeded (256MB limit)',
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
    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

module.exports = { compileAndRun };
