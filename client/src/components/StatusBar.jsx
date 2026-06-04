import React from 'react';

function formatTime(ms) {
  if (ms === null || ms === undefined) return '';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function StatusBar({ status, executionTime, isRunning, timeLimit, memoryLimit }) {
  function getStatusText() {
    if (isRunning) return 'Compiling & Running...';
    if (!status) return 'Ready';
    switch (status) {
      case 'OK': return 'Accepted';
      case 'CE': return 'Compilation Error';
      case 'RTE': return 'Runtime Error';
      case 'TLE': return 'Time Limit Exceeded';
      case 'MLE': return 'Memory Limit Exceeded';
      case 'STOPPED': return 'Terminated';
      case 'ERROR': return 'Error';
      default: return 'Ready';
    }
  }

  function getStatusClass() {
    if (isRunning) return 'status-running';
    switch (status) {
      case 'OK': return 'status-ok';
      case 'CE': case 'RTE': case 'TLE': case 'MLE': case 'ERROR': return 'status-error';
      case 'STOPPED': return 'status-warn';
      default: return '';
    }
  }

  return (
    <div className="statusbar">
      <span className={`statusbar-status ${getStatusClass()}`}>{getStatusText()}</span>
      <span className="statusbar-right">
        {executionTime !== null && (
          <span className={`statusbar-time ${executionTime > timeLimit ? 'time-exceeded' : ''}`}>
            Time: {formatTime(executionTime)}
          </span>
        )}
        <span className="statusbar-limits">Limit: {(timeLimit / 1000).toFixed(1)}s | {memoryLimit}MB</span>
        <span className="statusbar-lang">Java | UTF-8</span>
      </span>
    </div>
  );
}
