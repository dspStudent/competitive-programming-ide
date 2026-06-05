const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.join(__dirname, '..', '..', 'workspace');

const DEFAULT_MAIN = `public class Main {
    public static void main(String[] args) {

    }
}`;

function initWorkspace() {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
  const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.java'));
  if (files.length === 0) {
    fs.writeFileSync(path.join(WORKSPACE_DIR, 'Main.java'), DEFAULT_MAIN, 'utf-8');
  }
}

function validateFilename(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Filename is required' };
  }
  if (/[/\\:*?"<>|]/.test(name)) {
    return { valid: false, error: 'Filename contains invalid characters' };
  }
  if (!name.match(/^[A-Z][A-Za-z0-9_]*\.java$/)) {
    return { valid: false, error: 'Filename must start with uppercase letter and end with .java (e.g. Solution.java)' };
  }
  return { valid: true };
}

function listFiles() {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    initWorkspace();
  }
  const entries = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.java'));
  return entries.map(filename => {
    const filePath = path.join(WORKSPACE_DIR, filename);
    const stat = fs.statSync(filePath);
    return {
      filename,
      lastModified: stat.mtime.toISOString(),
      size: stat.size,
    };
  });
}

function readFile(filename) {
  const validation = validateFilename(filename);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const filePath = path.join(WORKSPACE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filename}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

function createFile(filename, content = '') {
  const validation = validateFilename(filename);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const filePath = path.join(WORKSPACE_DIR, filename);
  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: ${filename}`);
  }
  const fileContent = content || `public class ${filename.replace('.java', '')} {\n    public static void main(String[] args) {\n\n    }\n}`;
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  return { filename, size: Buffer.byteLength(fileContent, 'utf-8') };
}

function updateFile(filename, content) {
  const validation = validateFilename(filename);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const filePath = path.join(WORKSPACE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filename}`);
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  return { filename, size: Buffer.byteLength(content, 'utf-8') };
}

function deleteFile(filename) {
  const validation = validateFilename(filename);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const filePath = path.join(WORKSPACE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filename}`);
  }
  fs.unlinkSync(filePath);
  return { filename };
}

module.exports = {
  WORKSPACE_DIR,
  initWorkspace,
  validateFilename,
  listFiles,
  readFile,
  createFile,
  updateFile,
  deleteFile,
};
