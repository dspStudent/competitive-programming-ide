import React from 'react';

export default function Toolbar({ onRun, isRunning, theme, onThemeToggle, onNewFile, onOpenSettings }) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <span className="toolbar-title">CP IDE</span>
        <span className="toolbar-separator">|</span>
        <span className="toolbar-lang">DSP Java</span>
      </div>
      <div className="toolbar-center">
        <button
          className="btn-run"
          onClick={onRun}
          disabled={isRunning}
          title="Run (Ctrl+Enter or F5)"
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
      <div className="toolbar-right">
        <button className="btn-toolbar" onClick={onNewFile} title="New File (load default template)">
          New
        </button>
        <button className="btn-toolbar" onClick={onThemeToggle} title="Toggle theme">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button className="btn-toolbar" onClick={onOpenSettings} title="Settings">
          Settings
        </button>
      </div>
    </div>
  );
}
