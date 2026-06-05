import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { STORAGE_KEYS, DEFAULT_TEMPLATE } from '../utils/constants';

const TIME_PRESETS = [1000, 2000, 3000, 5000, 10000];
const MEMORY_PRESETS = [128, 256, 512, 1024];
const TAB_SIZE_OPTIONS = [2, 4, 8];

export default function SettingsModal({
  onClose, theme, fontSize, tabSize, wordWrap, minimap,
  timeLimit, memoryLimit, caseInsensitive, trimWhitespace, ignoreBlankLines,
  onSettingsChange,
}) {
  const [activeTab, setActiveTab] = useState('execution');
  const [template, setTemplate] = useState('');
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localTabSize, setLocalTabSize] = useState(tabSize);
  const [localWordWrap, setLocalWordWrap] = useState(wordWrap);
  const [localMinimap, setLocalMinimap] = useState(minimap);
  const [localTimeLimit, setLocalTimeLimit] = useState(timeLimit);
  const [localMemoryLimit, setLocalMemoryLimit] = useState(memoryLimit);
  const [localCaseInsensitive, setLocalCaseInsensitive] = useState(caseInsensitive);
  const [localTrimWhitespace, setLocalTrimWhitespace] = useState(trimWhitespace);
  const [localIgnoreBlankLines, setLocalIgnoreBlankLines] = useState(ignoreBlankLines);
  const [customTime, setCustomTime] = useState(!TIME_PRESETS.includes(timeLimit));
  const [customMemory, setCustomMemory] = useState(!MEMORY_PRESETS.includes(memoryLimit));

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
    localStorage.setItem(STORAGE_KEYS.MINIMAP, localMinimap.toString());
    localStorage.setItem(STORAGE_KEYS.TIME_LIMIT, localTimeLimit.toString());
    localStorage.setItem(STORAGE_KEYS.MEMORY_LIMIT, localMemoryLimit.toString());
    localStorage.setItem(STORAGE_KEYS.CASE_INSENSITIVE, localCaseInsensitive.toString());
    localStorage.setItem(STORAGE_KEYS.TRIM_WHITESPACE, localTrimWhitespace.toString());
    localStorage.setItem(STORAGE_KEYS.IGNORE_BLANK_LINES, localIgnoreBlankLines.toString());
    onSettingsChange({
      fontSize: localFontSize,
      tabSize: localTabSize,
      wordWrap: localWordWrap,
      minimap: localMinimap,
      timeLimit: localTimeLimit,
      memoryLimit: localMemoryLimit,
      caseInsensitive: localCaseInsensitive,
      trimWhitespace: localTrimWhitespace,
      ignoreBlankLines: localIgnoreBlankLines,
    });
    onClose();
  }

  function renderExecutionTab() {
    return (
      <div className="settings-tab-content">
        <div className="settings-card">
          <h4 className="settings-card-title">Time Limit</h4>
          <p className="settings-hint">Maximum execution time before TLE</p>
          <div className="preset-group">
            {TIME_PRESETS.map((val) => (
              <button
                key={val}
                className={`preset-btn ${!customTime && localTimeLimit === val ? 'preset-active' : ''}`}
                onClick={() => { setLocalTimeLimit(val); setCustomTime(false); }}
              >
                {val / 1000}s
              </button>
            ))}
            <button
              className={`preset-btn ${customTime ? 'preset-active' : ''}`}
              onClick={() => setCustomTime(true)}
            >
              Custom
            </button>
          </div>
          {customTime && (
            <div className="custom-input-row">
              <input
                type="number"
                min="500"
                max="30000"
                step="500"
                value={localTimeLimit}
                onChange={(e) => setLocalTimeLimit(Number(e.target.value))}
                className="custom-number-input"
              />
              <span className="input-suffix">ms</span>
              <span className="settings-value-hint">({(localTimeLimit / 1000).toFixed(1)}s)</span>
            </div>
          )}
        </div>

        <div className="settings-card">
          <h4 className="settings-card-title">Memory Limit</h4>
          <p className="settings-hint">Maximum heap size before MLE</p>
          <div className="preset-group">
            {MEMORY_PRESETS.map((val) => (
              <button
                key={val}
                className={`preset-btn ${!customMemory && localMemoryLimit === val ? 'preset-active' : ''}`}
                onClick={() => { setLocalMemoryLimit(val); setCustomMemory(false); }}
              >
                {val}MB
              </button>
            ))}
            <button
              className={`preset-btn ${customMemory ? 'preset-active' : ''}`}
              onClick={() => setCustomMemory(true)}
            >
              Custom
            </button>
          </div>
          {customMemory && (
            <div className="custom-input-row">
              <input
                type="number"
                min="64"
                max="2048"
                step="64"
                value={localMemoryLimit}
                onChange={(e) => setLocalMemoryLimit(Number(e.target.value))}
                className="custom-number-input"
              />
              <span className="input-suffix">MB</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderEditorTab() {
    return (
      <div className="settings-tab-content">
        <div className="settings-card">
          <h4 className="settings-card-title">Font Size</h4>
          <div className="slider-row">
            <input
              type="range"
              min="10"
              max="24"
              value={localFontSize}
              onChange={(e) => setLocalFontSize(Number(e.target.value))}
              className="settings-slider"
            />
            <span className="slider-value">{localFontSize}px</span>
          </div>
          <div className="font-preview" style={{ fontSize: `${localFontSize}px` }}>
            Preview: The quick brown fox
          </div>
        </div>

        <div className="settings-card">
          <h4 className="settings-card-title">Tab Size</h4>
          <div className="preset-group">
            {TAB_SIZE_OPTIONS.map((val) => (
              <button
                key={val}
                className={`preset-btn ${localTabSize === val ? 'preset-active' : ''}`}
                onClick={() => setLocalTabSize(val)}
              >
                {val} spaces
              </button>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h4 className="settings-card-title">Display</h4>
          <div className="toggle-row">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={localWordWrap}
                onChange={(e) => setLocalWordWrap(e.target.checked)}
              />
              <span className="toggle-text">Word Wrap</span>
            </label>
          </div>
          <div className="toggle-row">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={localMinimap}
                onChange={(e) => setLocalMinimap(e.target.checked)}
              />
              <span className="toggle-text">Minimap</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  function renderTemplateTab() {
    return (
      <div className="settings-tab-content settings-tab-template">
        <div className="settings-card settings-card-full">
          <h4 className="settings-card-title">Default Template</h4>
          <p className="settings-hint">This template loads when you create a new file. Use %s as placeholder for the class name.</p>
          <div className="settings-editor">
            <Editor
              height="300px"
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
      </div>
    );
  }

  function renderComparisonTab() {
    return (
      <div className="settings-tab-content">
        <div className="settings-card">
          <h4 className="settings-card-title">Output Comparison</h4>
          <p className="settings-hint">
            Configure how expected output is compared against actual output
          </p>
          <div className="toggle-row">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={localCaseInsensitive}
                onChange={(e) => setLocalCaseInsensitive(e.target.checked)}
              />
              <span className="toggle-text">Case Insensitive</span>
              <span className="toggle-desc">Ignore uppercase/lowercase differences</span>
            </label>
          </div>
          <div className="toggle-row">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={localTrimWhitespace}
                onChange={(e) => setLocalTrimWhitespace(e.target.checked)}
              />
              <span className="toggle-text">Trim Whitespace</span>
              <span className="toggle-desc">Remove trailing spaces and blank trailing lines</span>
            </label>
          </div>
          <div className="toggle-row">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={localIgnoreBlankLines}
                onChange={(e) => setLocalIgnoreBlankLines(e.target.checked)}
              />
              <span className="toggle-text">Ignore Blank Lines</span>
              <span className="toggle-desc">Skip empty lines during comparison</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'execution', label: 'Execution' },
    { id: 'editor', label: 'Editor' },
    { id: 'template', label: 'Template' },
    { id: 'comparison', label: 'Comparison' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-settings" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="modal-title">Settings</h2>
          <button className="btn-close" onClick={onClose} title="Close">&times;</button>
        </div>

        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'settings-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-body">
          {activeTab === 'execution' && renderExecutionTab()}
          {activeTab === 'editor' && renderEditorTab()}
          {activeTab === 'template' && renderTemplateTab()}
          {activeTab === 'comparison' && renderComparisonTab()}
        </div>

        <div className="modal-actions">
          <button className="btn-modal-save" onClick={handleSave}>Save</button>
          <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
