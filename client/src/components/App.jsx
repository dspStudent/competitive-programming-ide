import React, { useState, useEffect, useCallback } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import CodeEditor from './CodeEditor';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import AlertModal from './AlertModal';
import SettingsModal from './SettingsModal';
import { useCodeRunner } from '../hooks/useCodeRunner';
import { STORAGE_KEYS, DEFAULT_TEMPLATE, EXECUTION_LIMITS } from '../utils/constants';

function getInitialCode() {
  return localStorage.getItem(STORAGE_KEYS.CODE) ||
    localStorage.getItem(STORAGE_KEYS.TEMPLATE) ||
    DEFAULT_TEMPLATE;
}

export default function App() {
  const [code, setCode] = useState(getInitialCode);
  const [input, setInput] = useState(() => localStorage.getItem(STORAGE_KEYS.INPUT) || '');
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'dark');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.FONT_SIZE)) || 14);
  const [tabSize, setTabSize] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.TAB_SIZE)) || 4);
  const [wordWrap, setWordWrap] = useState(() => localStorage.getItem(STORAGE_KEYS.WORD_WRAP) === 'true');
  const [timeLimit, setTimeLimit] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.TIME_LIMIT)) || EXECUTION_LIMITS.TIME_LIMIT_MS);
  const [memoryLimit, setMemoryLimit] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.MEMORY_LIMIT)) || EXECUTION_LIMITS.MEMORY_LIMIT_MB);
  const [alertType, setAlertType] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { output, status, error, executionTime, isRunning, runCode, stopCode } = useCodeRunner();

  // Persist code and input to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CODE, code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INPUT, input);
  }, [input]);

  // Set theme attribute on document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Show alert for TLE/MLE
  useEffect(() => {
    if (status === 'TLE' || status === 'MLE') {
      setAlertType(status);
    }
  }, [status]);

  // Run handler
  const handleRun = useCallback(async () => {
    if (isRunning) return;
    await runCode(code, input, timeLimit, memoryLimit);
  }, [code, input, isRunning, runCode, timeLimit, memoryLimit]);

  // Stop handler
  const handleStop = useCallback(() => {
    stopCode();
  }, [stopCode]);

  // Listen for custom run event from editor keybindings
  useEffect(() => {
    function onRunEvent() {
      handleRun();
    }
    window.addEventListener('cp-ide-run', onRunEvent);
    return () => window.removeEventListener('cp-ide-run', onRunEvent);
  }, [handleRun]);

  function handleThemeToggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  function handleNewFile() {
    const template = localStorage.getItem(STORAGE_KEYS.TEMPLATE) || DEFAULT_TEMPLATE;
    if (code.trim() !== '' && code !== template) {
      if (!window.confirm('Replace current code with default template?')) return;
    }
    setCode(template);
  }

  function handleSettingsChange({ fontSize: fs, tabSize: ts, wordWrap: ww, timeLimit: tl, memoryLimit: ml }) {
    setFontSize(fs);
    setTabSize(ts);
    setWordWrap(ww);
    setTimeLimit(tl);
    setMemoryLimit(ml);
  }

  return (
    <div className="app-container">
      <Toolbar
        onRun={handleRun}
        onStop={handleStop}
        isRunning={isRunning}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onNewFile={handleNewFile}
        onOpenSettings={() => setShowSettings(true)}
        timeLimit={timeLimit}
        memoryLimit={memoryLimit}
      />

      <div className="main-content">
        <Allotment defaultSizes={[65, 35]}>
          <Allotment.Pane minSize={300}>
            <CodeEditor
              code={code}
              onChange={(val) => setCode(val || '')}
              theme={theme}
              fontSize={fontSize}
              tabSize={tabSize}
              wordWrap={wordWrap}
              onRun={handleRun}
            />
          </Allotment.Pane>
          <Allotment.Pane minSize={200}>
            <Allotment vertical defaultSizes={[50, 50]}>
              <Allotment.Pane minSize={80}>
                <InputPanel input={input} onChange={setInput} />
              </Allotment.Pane>
              <Allotment.Pane minSize={80}>
                <OutputPanel output={output} error={error} status={status} />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
        </Allotment>
      </div>

      <StatusBar
        status={status}
        executionTime={executionTime}
        isRunning={isRunning}
        timeLimit={timeLimit}
        memoryLimit={memoryLimit}
      />

      {alertType && (
        <AlertModal type={alertType} onClose={() => setAlertType(null)} />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          theme={theme}
          fontSize={fontSize}
          tabSize={tabSize}
          wordWrap={wordWrap}
          timeLimit={timeLimit}
          memoryLimit={memoryLimit}
          onSettingsChange={handleSettingsChange}
        />
      )}
    </div>
  );
}
