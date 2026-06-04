import React from 'react';

export default function ExpectedOutputPanel({ expectedOutput, onChange }) {
  return (
    <div className="panel expected-output-panel">
      <div className="panel-header">
        <span>Expected Output</span>
        <button className="btn-small" onClick={() => onChange('')} title="Clear expected output">
          Clear
        </button>
      </div>
      <textarea
        className="panel-textarea"
        value={expectedOutput}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste expected output here to compare after run..."
        spellCheck={false}
      />
    </div>
  );
}
