import React, { useMemo } from 'react';

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

function compareOutputs(actual, expected, { caseInsensitive, trimWhitespace, ignoreBlankLines }) {
  if (!expected || !expected.trim()) return null;
  if (!actual && actual !== '') return null;

  let actualLines = actual.split('\n');
  let expectedLines = expected.split('\n');

  if (trimWhitespace) {
    actualLines = actualLines.map((l) => l.trimEnd());
    expectedLines = expectedLines.map((l) => l.trimEnd());
    // Remove trailing empty lines
    while (actualLines.length > 0 && actualLines[actualLines.length - 1] === '') actualLines.pop();
    while (expectedLines.length > 0 && expectedLines[expectedLines.length - 1] === '') expectedLines.pop();
  }

  if (ignoreBlankLines) {
    actualLines = actualLines.filter((l) => l.trim() !== '');
    expectedLines = expectedLines.filter((l) => l.trim() !== '');
  }

  for (let i = 0; i < Math.max(actualLines.length, expectedLines.length); i++) {
    const a = i < actualLines.length ? actualLines[i] : '';
    const e = i < expectedLines.length ? expectedLines[i] : '';
    const aComp = caseInsensitive ? a.toLowerCase() : a;
    const eComp = caseInsensitive ? e.toLowerCase() : e;
    if (aComp !== eComp) {
      return { passed: false, mismatchLine: i + 1 };
    }
  }

  return { passed: true, mismatchLine: null };
}

export default function OutputPanel({ output, error, status, expectedOutput, comparisonSettings }) {
  const statusInfo = STATUS_LABELS[status];
  const displayText = error ? error : output;

  const comparisonResult = useMemo(() => {
    if (!expectedOutput || !expectedOutput.trim()) return null;
    if (status !== 'OK') return null;
    return compareOutputs(output || '', expectedOutput, comparisonSettings);
  }, [output, expectedOutput, status, comparisonSettings]);

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
          {comparisonResult && (
            <span className={`status-badge ${comparisonResult.passed ? 'badge-passed' : 'badge-wrong-answer'}`}>
              {comparisonResult.passed
                ? 'Passed'
                : `Wrong Answer (line ${comparisonResult.mismatchLine})`}
            </span>
          )}
        </span>
        <button className="btn-small" onClick={copyToClipboard} title="Copy output">
          Copy
        </button>
      </div>
      <pre className={`panel-output ${error ? 'output-error' : ''} ${comparisonResult && !comparisonResult.passed ? 'output-diff' : ''}`}>
        {displayText || 'Run your code to see output here...'}
      </pre>
    </div>
  );
}
