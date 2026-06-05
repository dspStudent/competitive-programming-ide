import React, { useState } from 'react';

export default function FileExplorer({ files, activeFile, unsavedChanges, onFileClick, onCreate, onDelete, onRename }) {
  const [creating, setCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [error, setError] = useState('');

  function handleCreateSubmit(e) {
    e.preventDefault();
    const name = newFileName.trim();
    if (!name) return;
    const filename = name.endsWith('.java') ? name : name + '.java';
    onCreate(filename).then(result => {
      if (result.success) {
        setCreating(false);
        setNewFileName('');
        setError('');
      } else {
        setError(result.error);
      }
    });
  }

  function handleRenameSubmit(e) {
    e.preventDefault();
    const name = renameValue.trim();
    if (!name) return;
    const filename = name.endsWith('.java') ? name : name + '.java';
    onRename(renamingFile, filename).then(result => {
      if (result.success) {
        setRenamingFile(null);
        setRenameValue('');
        setError('');
      } else {
        setError(result.error);
      }
    });
  }

  function handleDeleteClick(filename) {
    if (window.confirm(`Delete ${filename}?`)) {
      onDelete(filename);
    }
  }

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span>Files</span>
        <button
          className="btn-file-action"
          onClick={() => { setCreating(true); setError(''); }}
          title="New file"
        >
          +
        </button>
      </div>

      {error && <div className="file-explorer-error">{error}</div>}

      {creating && (
        <form className="file-create-form" onSubmit={handleCreateSubmit}>
          <input
            type="text"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="ClassName.java"
            autoFocus
            onBlur={() => { if (!newFileName.trim()) setCreating(false); }}
            onKeyDown={e => { if (e.key === 'Escape') { setCreating(false); setNewFileName(''); } }}
          />
        </form>
      )}

      <div className="file-list">
        {files.map(file => (
          <div
            key={file.filename}
            className={`file-item ${file.filename === activeFile ? 'file-item-active' : ''}`}
            onClick={() => onFileClick(file.filename)}
          >
            {renamingFile === file.filename ? (
              <form className="file-rename-form" onSubmit={handleRenameSubmit} onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  autoFocus
                  onBlur={() => setRenamingFile(null)}
                  onKeyDown={e => { if (e.key === 'Escape') setRenamingFile(null); }}
                />
              </form>
            ) : (
              <>
                <span className="file-item-name">
                  {unsavedChanges[file.filename] && <span className="unsaved-dot" title="Unsaved changes" />}
                  {file.filename}
                </span>
                <span className="file-item-actions">
                  <button
                    className="btn-file-action"
                    onClick={e => { e.stopPropagation(); setRenamingFile(file.filename); setRenameValue(file.filename); setError(''); }}
                    title="Rename"
                  >
                    R
                  </button>
                  <button
                    className="btn-file-action btn-file-delete"
                    onClick={e => { e.stopPropagation(); handleDeleteClick(file.filename); }}
                    title="Delete"
                  >
                    x
                  </button>
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
