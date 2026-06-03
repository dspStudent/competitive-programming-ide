import React from 'react';

export default function InputPanel({ input, onChange }) {
  return (
    <div className="panel input-panel">
      <div className="panel-header">
        <span>Input</span>
        <button className="btn-small" onClick={() => onChange('')} title="Clear input">
          Clear
        </button>
      </div>
      <textarea
        className="panel-textarea"
        value={input}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter test input here..."
        spellCheck={false}
      />
    </div>
  );
}
