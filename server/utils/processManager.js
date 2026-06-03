const { spawn } = require('child_process');

/**
 * Spawns a child process with timeout and captures stdout/stderr.
 * Returns { stdout, stderr, exitCode, timedOut }
 */
function runProcess(command, args, options = {}) {
  const { timeout = 10000, input = '', cwd } = options;

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let killed = false;

    const proc = spawn(command, args, {
      cwd,
      shell: true,
    });

    let timer = null;
    if (timeout > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        killed = true;
        proc.kill('SIGKILL');
      }, timeout);
    }

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > 1024 * 1024) {
        killed = true;
        proc.kill('SIGKILL');
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
      if (timer) clearTimeout(timer);
      resolve({
        stdout: stdout.substring(0, 1024 * 1024),
        stderr,
        exitCode,
        timedOut,
        killed,
      });
    });

    proc.on('error', (err) => {
      if (timer) clearTimeout(timer);
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: -1,
        timedOut: false,
        killed: false,
      });
    });
  });
}

module.exports = { runProcess };
