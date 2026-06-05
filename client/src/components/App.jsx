import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import CodeEditor from './CodeEditor';
import InputPanel from './InputPanel';
import ExpectedOutputPanel from './ExpectedOutputPanel';
import OutputPanel from './OutputPanel';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import AlertModal from './AlertModal';
import SettingsModal from './SettingsModal';
import FileExplorer from './FileExplorer';
import FileTabs from './FileTabs';
import { useCodeRunner } from '../hooks/useCodeRunner';
import { useFileSystem } from '../hooks/useFileSystem';
import { useGit } from '../hooks/useGit';
import { useStopwatch } from '../hooks/useStopwatch';
import { STORAGE_KEYS, DEFAULT_FILENAME, EXECUTION_LIMITS } from '../utils/constants';

export default function App() {
  const [input, setInput] = useState(() => localStorage.getItem(STORAGE_KEYS.INPUT) || '');
  const [expectedOutput, setExpectedOutput] = useState(() => localStorage.getItem(STORAGE_KEYS.EXPECTED_OUTPUT) || '');
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'dark');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.FONT_SIZE)) || 14);
  const [tabSize, setTabSize] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.TAB_SIZE)) || 4);
  const [wordWrap, setWordWrap] = useState(() => localStorage.getItem(STORAGE_KEYS.WORD_WRAP) === 'true');
  const [minimap, setMinimap] = useState(() => localStorage.getItem(STORAGE_KEYS.MINIMAP) !== 'false');
  const [timeLimit, setTimeLimit] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.TIME_LIMIT)) || EXECUTION_LIMITS.TIME_LIMIT_MS);
  const [memoryLimit, setMemoryLimit] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.MEMORY_LIMIT)) || EXECUTION_LIMITS.MEMORY_LIMIT_MB);
  const [caseInsensitive, setCaseInsensitive] = useState(() => localStorage.getItem(STORAGE_KEYS.CASE_INSENSITIVE) === 'true');
  const [trimWhitespace, setTrimWhitespace] = useState(() => localStorage.getItem(STORAGE_KEYS.TRIM_WHITESPACE) !== 'false');
  const [ignoreBlankLines, setIgnoreBlankLines] = useState(() => localStorage.getItem(STORAGE_KEYS.IGNORE_BLANK_LINES) === 'true');
  const [alertType, setAlertType] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { output, status, error, executionTime, isRunning, runCode, stopCode } = useCodeRunner();
  const fileSystem = useFileSystem();
  const { gitStatus, pushing, pushResult, fetchStatus, commitAndPush } = useGit();
  const stopwatch = useStopwatch();

  const comparisonSettings = useMemo(() => ({
    caseInsensitive,
    trimWhitespace,
    ignoreBlankLines,
  }), [caseInsensitive, trimWhitespace, ignoreBlankLines]);

  // Initialize: fetch file list and open default file
  useEffect(() => {
    async function init() {
      const files = await fileSystem.fetchFileList();
      if (files.length > 0) {
        const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_FILE);
        const targetFile = savedActive && files.some(f => f.filename === savedActive)
          ? savedActive
          : DEFAULT_FILENAME;
        if (files.some(f => f.filename === targetFile)) {
          await fileSystem.openFile(targetFile);
        } else {
          await fileSystem.openFile(files[0].filename);
        }
      }
      fetchStatus();
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh git status after file saves
  useEffect(() => {
    function onFileSaved() {
      fetchStatus();
    }
    window.addEventListener('cp-ide-file-saved', onFileSaved);
    return () => window.removeEventListener('cp-ide-file-saved', onFileSaved);
  }, [fetchStatus]);

  // Persist input and expected output
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INPUT, input);
  }, [input]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPECTED_OUTPUT, expectedOutput);
  }, [expectedOutput]);

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

  // Run handler - use active file's content
  const handleRun = useCallback(async () => {
    if (isRunning) return;
    const code = fileSystem.activeFileContent;
    const filename = fileSystem.activeFile;
    await runCode(code, input, timeLimit, memoryLimit, filename);
  }, [fileSystem.activeFileContent, fileSystem.activeFile, input, isRunning, runCode, timeLimit, memoryLimit]);

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

  // New file - prompt for name, create on server
  function handleNewFile() {
    const name = window.prompt('Enter filename (e.g. Solution.java):');
    if (!name) return;
    const filename = name.endsWith('.java') ? name : name + '.java';
    fileSystem.createFile(filename).then(result => {
      if (!result.success) {
        alert(result.error);
      }
    });
  }

  // Push handler - include stopwatch time, reset after success
  async function handlePush() {
    const result = await commitAndPush(stopwatch.elapsed);
    if (result.success && result.pushed) {
      stopwatch.reset();
      fetchStatus();
    } else if (result.error) {
      alert(`Push failed: ${result.error}`);
    }
  }

  // Code change handler - update file content
  function handleCodeChange(value) {
    if (fileSystem.activeFile) {
      fileSystem.updateFileContent(fileSystem.activeFile, value || '');
    }
  }

  function handleSettingsChange(settings) {
    setFontSize(settings.fontSize);
    setTabSize(settings.tabSize);
    setWordWrap(settings.wordWrap);
    setMinimap(settings.minimap);
    setTimeLimit(settings.timeLimit);
    setMemoryLimit(settings.memoryLimit);
    setCaseInsensitive(settings.caseInsensitive);
    setTrimWhitespace(settings.trimWhitespace);
    setIgnoreBlankLines(settings.ignoreBlankLines);
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
        onPush={handlePush}
        pushing={pushing}
        gitStatus={gitStatus}
        stopwatch={stopwatch}
      />

      <div className="main-content">
        <Allotment defaultSizes={[15, 50, 35]}>
          <Allotment.Pane minSize={120} maxSize={300}>
            <FileExplorer
              files={fileSystem.files}
              activeFile={fileSystem.activeFile}
              unsavedChanges={fileSystem.unsavedChanges}
              onFileClick={(filename) => fileSystem.openFile(filename)}
              onCreate={(filename) => fileSystem.createFile(filename)}
              onDelete={(filename) => fileSystem.deleteFile(filename)}
              onRename={(oldName, newName) => fileSystem.renameFile(oldName, newName)}
            />
          </Allotment.Pane>
          <Allotment.Pane minSize={300}>
            <div className="editor-area">
              <FileTabs
                openFiles={fileSystem.openFiles}
                activeFile={fileSystem.activeFile}
                unsavedChanges={fileSystem.unsavedChanges}
                onTabClick={(filename) => fileSystem.openFile(filename)}
                onTabClose={(filename) => fileSystem.closeTab(filename)}
              />
              <div className="editor-wrapper">
                <CodeEditor
                  code={fileSystem.activeFileContent}
                  onChange={handleCodeChange}
                  theme={theme}
                  fontSize={fontSize}
                  tabSize={tabSize}
                  wordWrap={wordWrap}
                  onRun={handleRun}
                />
              </div>
            </div>
          </Allotment.Pane>
          <Allotment.Pane minSize={200}>
            <Allotment vertical defaultSizes={[33, 33, 34]}>
              <Allotment.Pane minSize={60}>
                <InputPanel input={input} onChange={setInput} />
              </Allotment.Pane>
              <Allotment.Pane minSize={60}>
                <ExpectedOutputPanel expectedOutput={expectedOutput} onChange={setExpectedOutput} />
              </Allotment.Pane>
              <Allotment.Pane minSize={60}>
                <OutputPanel
                  output={output}
                  error={error}
                  status={status}
                  expectedOutput={expectedOutput}
                  comparisonSettings={comparisonSettings}
                />
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
        activeFile={fileSystem.activeFile}
        saving={fileSystem.saving}
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
          minimap={minimap}
          timeLimit={timeLimit}
          memoryLimit={memoryLimit}
          caseInsensitive={caseInsensitive}
          trimWhitespace={trimWhitespace}
          ignoreBlankLines={ignoreBlankLines}
          onSettingsChange={handleSettingsChange}
        />
      )}
    </div>
  );
}
