import React from 'react';

export default function Toolbar({ onRun, onStop, isRunning, theme, onThemeToggle, onNewFile, onOpenSettings, timeLimit, memoryLimit, onPush, pushing, gitStatus, stopwatch }) {
  const changeCount = gitStatus?.changes?.length || 0;
  const noGit = gitStatus?.noGit;

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
        <span className="toolbar-separator">|</span>
        <div className="stopwatch">
          <span className={`stopwatch-display ${stopwatch.running ? 'stopwatch-running' : ''}`}>
            {stopwatch.formatted}
          </span>
          <button
            className={`btn-stopwatch ${stopwatch.running ? 'btn-stopwatch-active' : ''}`}
            onClick={stopwatch.toggle}
            title={stopwatch.running ? 'Pause' : 'Start'}
          >
            {stopwatch.running ? '||' : '▶'}
          </button>
          <button
            className="btn-stopwatch"
            onClick={stopwatch.reset}
            title="Reset"
          >
            ↺
          </button>
        </div>
      </div>
      <div className="toolbar-right">
        <button
          className="btn-push"
          onClick={onPush}
          disabled={pushing || !gitStatus?.hasChanges || noGit}
          title={noGit ? 'No git repo - run git init & add remote first' : changeCount > 0 ? `Push ${changeCount} changed file(s)` : 'No changes to push'}
        >
          {pushing ? 'Pushing...' : noGit ? 'No Git' : `Push${changeCount > 0 ? ` (${changeCount})` : ''}`}
        </button>
        <button className="btn-toolbar" onClick={onNewFile} title="New File (create in workspace)">
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
