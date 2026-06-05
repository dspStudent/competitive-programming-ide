const path = require('path');
const { runProcess } = require('../utils/processManager');

const PROJECT_ROOT = path.join(__dirname, '..', '..');

async function isGitRepo() {
  const result = await runProcess('git', ['rev-parse', '--is-inside-work-tree'], {
    timeout: 5000,
    cwd: PROJECT_ROOT,
  });
  return result.exitCode === 0 && result.stdout.trim() === 'true';
}

async function getStatus() {
  const isRepo = await isGitRepo();
  if (!isRepo) {
    return { hasChanges: false, changes: [], noGit: true };
  }

  const result = await runProcess('git', ['status', '--porcelain', '-u', 'workspace/'], {
    timeout: 10000,
    cwd: PROJECT_ROOT,
  });

  if (result.exitCode !== 0 && result.stderr) {
    throw new Error(`Git error: ${result.stderr}`);
  }

  const lines = (result.stdout || '').trim().split('\n').filter(l => l.trim());
  const changes = lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const filePath = parts.slice(1).join(' ');
    return path.basename(filePath);
  }).filter(f => f.endsWith('.java'));

  return {
    hasChanges: changes.length > 0,
    changes,
  };
}

function formatElapsed(ms) {
  if (!ms || ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

async function commitAndPush(elapsedTime) {
  // Stage workspace files
  const addResult = await runProcess('git', ['add', 'workspace/'], {
    timeout: 10000,
    cwd: PROJECT_ROOT,
  });

  if (addResult.exitCode !== 0) {
    throw new Error(`Git add failed: ${addResult.stderr}`);
  }

  // Check if there are staged changes
  const diffResult = await runProcess('git', ['diff', '--cached', '--name-only', 'workspace/'], {
    timeout: 10000,
    cwd: PROJECT_ROOT,
  });

  const stagedFiles = (diffResult.stdout || '').trim().split('\n').filter(l => l.trim());
  const filenames = stagedFiles.map(f => path.basename(f)).filter(f => f);

  if (filenames.length === 0) {
    return { success: true, commitMessage: null, pushed: false, message: 'No changes to commit' };
  }

  const timeStr = formatElapsed(elapsedTime);
  const commitMessage = timeStr
    ? `Updated: ${filenames.join(', ')} [${timeStr}]`
    : `Updated: ${filenames.join(', ')}`;

  // Commit - wrap message in quotes to prevent shell splitting
  const commitResult = await runProcess('git', ['commit', '-m', `"${commitMessage}"`], {
    timeout: 15000,
    cwd: PROJECT_ROOT,
  });

  if (commitResult.exitCode !== 0) {
    throw new Error(`Git commit failed: ${commitResult.stderr}`);
  }

  // Push
  const pushResult = await runProcess('git', ['push'], {
    timeout: 30000,
    cwd: PROJECT_ROOT,
  });

  if (pushResult.exitCode !== 0) {
    throw new Error(`Git push failed: ${pushResult.stderr}`);
  }

  return {
    success: true,
    commitMessage,
    pushed: true,
    filesCommitted: filenames,
  };
}

module.exports = { getStatus, commitAndPush };
