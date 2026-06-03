import React from 'react';

export default function StatusBar({ status, executionTime, isRunning }) {
  function getStatusText() {
    if (isRunning) return 'Compiling & Running...';
    if (!status) return 'Ready';
    switch (status) {
      case 'OK': return 'Execution successful';
      case 'CE': return 'Compilation failed';
      case 'RTE': return 'Runtime error';
      case 'TLE': return 'Time limit exceeded';
      case 'MLE': return 'Memory limit exceeded';
      case 'ERROR': return 'Error occurred';
      default: return 'Ready';
    }
  }

  return (
    <div className="statusbar">
      <span className="statusbar-status">{getStatusText()}</span>
      <span className="statusbar-right">
        {executionTime !== null && (
          <span className="statusbar-time">{executionTime} ms</span>
        )}
        <span className="statusbar-lang">Java | UTF-8</span>
      </span>
    </div>
  );
}
