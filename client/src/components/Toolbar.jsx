import React from 'react';

export default function Toolbar({ onRun, onStop, isRunning, theme, onThemeToggle, onNewFile, onOpenSettings, timeLimit, memoryLimit }) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <span className="toolbar-title">CP IDE</span>
        <span className="toolbar-separator">|</span>
        <span className="toolbar-lang">DSP Java</span>
        <span className="toolbar-separator">|</span>
        <span className="toolbar-limits">{(timeLimit / 1000).toFixed(1)}s / {memoryLimit}MB</span>
      </div>
      <div className="toolbar-center">
        {isRunning ? (
          <button
            className="btn-stop"
            onClick={onStop}
            title="Stop program (kill)"
          >
            Stop
          </button>
        ) : (
          <button
            className="btn-run"
            onClick={onRun}
            title="Run (Ctrl+Enter or F5)"
          >
            Run
          </button>
        )}
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
