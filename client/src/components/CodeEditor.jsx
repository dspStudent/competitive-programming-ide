import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, onChange, theme, fontSize, tabSize, wordWrap, onRun }) {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // Add Ctrl+Enter keybinding for Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      window.dispatchEvent(new CustomEvent('cp-ide-run'));
    });

    // Add F5 keybinding for Run
    editor.addCommand(monaco.KeyCode.F5, () => {
      window.dispatchEvent(new CustomEvent('cp-ide-run'));
    });

    editor.focus();
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language="java"
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: fontSize || 14,
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
