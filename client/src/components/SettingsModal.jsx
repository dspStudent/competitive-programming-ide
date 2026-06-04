import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { STORAGE_KEYS, DEFAULT_TEMPLATE } from '../utils/constants';

export default function SettingsModal({ onClose, theme, fontSize, tabSize, wordWrap, timeLimit, memoryLimit, onSettingsChange }) {
  const [template, setTemplate] = useState('');
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localTabSize, setLocalTabSize] = useState(tabSize);
  const [localWordWrap, setLocalWordWrap] = useState(wordWrap);
  const [localTimeLimit, setLocalTimeLimit] = useState(timeLimit);
  const [localMemoryLimit, setLocalMemoryLimit] = useState(memoryLimit);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATE);
    setTemplate(saved || DEFAULT_TEMPLATE);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSave() {
    localStorage.setItem(STORAGE_KEYS.TEMPLATE, template);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, localFontSize.toString());
    localStorage.setItem(STORAGE_KEYS.TAB_SIZE, localTabSize.toString());
    localStorage.setItem(STORAGE_KEYS.WORD_WRAP, localWordWrap.toString());
    localStorage.setItem(STORAGE_KEYS.TIME_LIMIT, localTimeLimit.toString());
    localStorage.setItem(STORAGE_KEYS.MEMORY_LIMIT, localMemoryLimit.toString());
    onSettingsChange({
      fontSize: localFontSize,
      tabSize: localTabSize,
      wordWrap: localWordWrap,
      timeLimit: localTimeLimit,
      memoryLimit: localMemoryLimit,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-settings" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Settings</h2>

        <div className="settings-section">
          <h3>Execution Limits</h3>
          <p className="settings-hint">
            Configure TLE and MLE thresholds for your runs
          </p>
          <div className="settings-row">
            <label>Time Limit (ms):</label>
            <input
              type="number"
              min="500"
              max="30000"
              step="500"
              value={localTimeLimit}
              onChange={(e) => setLocalTimeLimit(Number(e.target.value))}
            />
            <span className="settings-value-hint">{(localTimeLimit / 1000).toFixed(1)}s</span>
          </div>
          <div className="settings-row">
            <label>Memory Limit (MB):</label>
            <input
              type="number"
              min="64"
              max="1024"
              step="64"
              value={localMemoryLimit}
              onChange={(e) => setLocalMemoryLimit(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Default Template</h3>
          <p className="settings-hint">
            This template loads when you click "New File"
          </p>
          <div className="settings-editor">
            <Editor
              height="200px"
              language="java"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={template}
              onChange={(val) => setTemplate(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Editor Preferences</h3>
          <div className="settings-row">
            <label>Font Size:</label>
            <input
              type="number"
              min="10"
              max="30"
              value={localFontSize}
              onChange={(e) => setLocalFontSize(Number(e.target.value))}
            />
          </div>
          <div className="settings-row">
            <label>Tab Size:</label>
            <input
              type="number"
              min="2"
              max="8"
              value={localTabSize}
              onChange={(e) => setLocalTabSize(Number(e.target.value))}
            />
          </div>
          <div className="settings-row">
            <label>Word Wrap:</label>
            <input
              type="checkbox"
              checked={localWordWrap}
              onChange={(e) => setLocalWordWrap(e.target.checked)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-modal-save" onClick={handleSave}>Save</button>
          <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
