import React from 'react';

export default function FileTabs({ openFiles, activeFile, unsavedChanges, onTabClick, onTabClose }) {
  if (openFiles.length === 0) return null;

  return (
    <div className="file-tabs">
      {openFiles.map(filename => (
        <div
          key={filename}
          className={`file-tab ${filename === activeFile ? 'file-tab-active' : ''}`}
          onClick={() => onTabClick(filename)}
          onMouseDown={e => {
            // Middle-click to close
            if (e.button === 1) {
              e.preventDefault();
              onTabClose(filename);
            }
          }}
        >
          <span className="file-tab-name">
            {unsavedChanges[filename] && <span className="unsaved-dot" />}
            {filename}
          </span>
          <button
            className="file-tab-close"
            onClick={e => { e.stopPropagation(); onTabClose(filename); }}
            title="Close tab"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
