import React, { useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, onChange, theme, fontSize, tabSize, wordWrap, onRun }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const checkTimerRef = useRef(null);

  const checkErrors = useCallback(async (currentCode) => {
    if (!monacoRef.current || !editorRef.current) return;
    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode }),
      });
      const { errors } = await response.json();
      const model = editorRef.current.getModel();
      if (!model) return;

      const markers = errors.map((err) => ({
        severity: err.severity,
        startLineNumber: err.line,
        startColumn: err.column || 1,
        endLineNumber: err.line,
        endColumn: err.endColumn || model.getLineMaxColumn(err.line) || 1,
        message: err.message,
        source: 'javac',
      }));

      monacoRef.current.editor.setModelMarkers(model, 'javac', markers);
    } catch (e) {
      // Silently ignore check failures
    }
  }, []);

  const cleanupCode = useCallback(async () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;
    const currentCode = model.getValue();
    try {
      const response = await fetch('/api/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode }),
      });
      const result = await response.json();
      if (result.removed > 0 && result.code !== currentCode) {
        // Use executeEdits so it's undoable with Ctrl+Z
        const fullRange = model.getFullModelRange();
        editor.executeEdits('cleanup', [{
          range: fullRange,
          text: result.code,
        }]);
      }
    } catch (e) {
      // Silently ignore
    }
  }, []);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add Ctrl+Enter keybinding for Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      window.dispatchEvent(new CustomEvent('cp-ide-run'));
    });

    // Add F5 keybinding for Run
    editor.addCommand(monaco.KeyCode.F5, () => {
      window.dispatchEvent(new CustomEvent('cp-ide-run'));
    });

    // Ctrl+Alt+O - Remove unused imports/variables (like IntelliJ)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyO, () => {
      window.dispatchEvent(new CustomEvent('cp-ide-cleanup'));
    });

    editor.focus();

    // Initial check
    checkErrors(editor.getValue());
  }

  // Listen for cleanup event
  useEffect(() => {
    function onCleanup() {
      cleanupCode();
    }
    window.addEventListener('cp-ide-cleanup', onCleanup);
    return () => window.removeEventListener('cp-ide-cleanup', onCleanup);
  }, [cleanupCode]);

  // Debounced error checking on code change
  useEffect(() => {
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
    }
    checkTimerRef.current = setTimeout(() => {
      checkErrors(code);
    }, 1500);

    return () => {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current);
      }
    };
  }, [code, checkErrors]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language="java"
        theme={theme === 'dark' ? 'cp-darcula' : 'cp-intellij-light'}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        beforeMount={(monaco) => {
          // IntelliJ Darcula theme
          monaco.editor.defineTheme('cp-darcula', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '808080', fontStyle: 'italic' },
              { token: 'keyword', foreground: 'CC7832' },
              { token: 'string', foreground: '6A8759' },
              { token: 'number', foreground: '6897BB' },
              { token: 'type', foreground: 'A9B7C6' },
              { token: 'class', foreground: 'FFC66D' },
              { token: 'function', foreground: 'FFC66D' },
              { token: 'variable', foreground: 'A9B7C6' },
              { token: 'annotation', foreground: 'BBB529' },
            ],
            colors: {
              'editor.background': '#2B2B2B',
              'editor.foreground': '#A9B7C6',
              'editor.lineHighlightBackground': '#323232',
              'editor.selectionBackground': '#214283',
              'editorCursor.foreground': '#BBBBBB',
              'editorIndentGuide.background': '#3B3B3B',
              'editorIndentGuide.activeBackground': '#505050',
              'editorLineNumber.foreground': '#606366',
              'editorLineNumber.activeForeground': '#A4A3A3',
              'editorGutter.background': '#313335',
              'editor.selectionHighlightBackground': '#32593D',
              'editorBracketMatch.background': '#3B514D',
              'editorBracketMatch.border': '#3B514D',
            },
          });

          // IntelliJ Light theme
          monaco.editor.defineTheme('cp-intellij-light', {
            base: 'vs',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '808080', fontStyle: 'italic' },
              { token: 'keyword', foreground: '0000FF' },
              { token: 'string', foreground: '008000' },
              { token: 'number', foreground: '0000FF' },
              { token: 'type', foreground: '000000' },
              { token: 'class', foreground: '000000', fontStyle: 'bold' },
              { token: 'function', foreground: '7A7A43' },
              { token: 'variable', foreground: '000000' },
              { token: 'annotation', foreground: '808000' },
            ],
            colors: {
              'editor.background': '#FFFFFF',
              'editor.foreground': '#000000',
              'editor.lineHighlightBackground': '#FCFAED',
              'editor.selectionBackground': '#A6D2FF',
              'editorCursor.foreground': '#000000',
              'editorIndentGuide.background': '#E8E8E8',
              'editorIndentGuide.activeBackground': '#CCCCCC',
              'editorLineNumber.foreground': '#999999',
              'editorLineNumber.activeForeground': '#000000',
              'editorGutter.background': '#F0F0F0',
              'editor.selectionHighlightBackground': '#CCE5FF',
              'editorBracketMatch.background': '#FFEF28',
              'editorBracketMatch.border': '#FFEF28',
            },
          });
        }}
        options={{
          fontSize: fontSize || 14,
          fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
          tabSize: tabSize || 4,
          wordWrap: wordWrap ? 'on' : 'off',
          matchBrackets: 'always',
          'bracketPairColorization.enabled': true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          minimap: { enabled: true },
          folding: true,
          guides: { indentation: true, bracketPairs: true },
          renderLineHighlight: 'all',
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          formatOnPaste: true,
          autoIndent: 'full',
          renderWhitespace: 'selection',
          quickSuggestions: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
