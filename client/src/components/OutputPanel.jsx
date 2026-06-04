import React from 'react';

const STATUS_LABELS = {
  OK: { text: 'Accepted', className: 'badge-ok' },
  CE: { text: 'Compilation Error', className: 'badge-ce' },
  RTE: { text: 'Runtime Error', className: 'badge-rte' },
  TLE: { text: 'Time Limit Exceeded', className: 'badge-tle' },
  MLE: { text: 'Memory Limit Exceeded', className: 'badge-mle' },
  ERROR: { text: 'Error', className: 'badge-error' },
  RUNNING: { text: 'Running...', className: 'badge-running' },
  STOPPED: { text: 'Terminated', className: 'badge-error' },
};

export default function OutputPanel({ output, error, status }) {
  const statusInfo = STATUS_LABELS[status];
  const displayText = error ? error : output;

  function copyToClipboard() {
    navigator.clipboard.writeText(displayText);
  }

  return (
    <div className="panel output-panel">
      <div className="panel-header">
        <span>
          Output
          {statusInfo && (
            <span className={`status-badge ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
          )}
        </span>
        <button className="btn-small" onClick={copyToClipboard} title="Copy output">
          Copy
        </button>
      </div>
      <pre className={`panel-output ${error ? 'output-error' : ''}`}>
        {displayText || 'Run your code to see output here...'}
      </pre>
    </div>
  );
}
