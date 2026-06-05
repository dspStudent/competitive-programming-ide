import { useState, useCallback, useEffect, useRef } from 'react';
import { STORAGE_KEYS, DEFAULT_FILENAME, DEFAULT_TEMPLATE } from '../utils/constants';

export function useFileSystem() {
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OPEN_FILES);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFile, setActiveFile] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_FILE) || '';
  });
  const [fileContents, setFileContents] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef({});

  // Persist open files and active file to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPEN_FILES, JSON.stringify(openFiles));
  }, [openFiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, activeFile);
  }, [activeFile]);

  // Fetch file list from server
  const fetchFileList = useCallback(async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data.files || []);
      return data.files || [];
    } catch (err) {
      console.error('Failed to fetch file list:', err);
      return [];
    }
  }, []);

  // Open a file (fetch content if not cached, add to tabs)
  const openFile = useCallback(async (filename) => {
    if (!fileContents[filename]) {
      try {
        const response = await fetch(`/api/files/${encodeURIComponent(filename)}`);
        const data = await response.json();
        if (data.content !== undefined) {
          setFileContents(prev => ({ ...prev, [filename]: data.content }));
        }
      } catch (err) {
        console.error(`Failed to open file ${filename}:`, err);
        return;
      }
    }
    setOpenFiles(prev => prev.includes(filename) ? prev : [...prev, filename]);
    setActiveFile(filename);
  }, [fileContents]);

  // Save file to server
  const saveFile = useCallback(async (filename, content) => {
    setSaving(true);
    try {
      await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setUnsavedChanges(prev => ({ ...prev, [filename]: false }));
      // Notify that a save happened (for git status refresh)
      window.dispatchEvent(new Event('cp-ide-file-saved'));
    } catch (err) {
      console.error(`Failed to save file ${filename}:`, err);
    } finally {
      setSaving(false);
    }
  }, []);

  // Create a new file using the Settings template with %s replaced by class name
  const createFile = useCallback(async (filename) => {
    try {
      const className = filename.replace('.java', '');
      const template = localStorage.getItem(STORAGE_KEYS.TEMPLATE) || DEFAULT_TEMPLATE;
      const content = template.replace(/%s/g, className);
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }
      await fetchFileList();
      await openFile(filename);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchFileList, openFile]);

  // Delete a file
  const deleteFile = useCallback(async (filename) => {
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }
      // Close tab
      setOpenFiles(prev => prev.filter(f => f !== filename));
      setFileContents(prev => {
        const copy = { ...prev };
        delete copy[filename];
        return copy;
      });
      setUnsavedChanges(prev => {
        const copy = { ...prev };
        delete copy[filename];
        return copy;
      });
      // Switch active file
      if (activeFile === filename) {
        setActiveFile(prev => {
          const remaining = openFiles.filter(f => f !== filename);
          return remaining.length > 0 ? remaining[remaining.length - 1] : '';
        });
      }
      await fetchFileList();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [activeFile, openFiles, fetchFileList]);

  // Rename a file (create new, copy content, delete old)
  const renameFile = useCallback(async (oldName, newName) => {
    try {
      const content = fileContents[oldName] || '';
      // Update class name in content
      const updatedContent = content.replace(
        new RegExp(`public\\s+class\\s+${oldName.replace('.java', '')}`),
        `public class ${newName.replace('.java', '')}`
      );
      const createResp = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: newName, content: updatedContent }),
      });
      if (!createResp.ok) {
        const err = await createResp.json();
        throw new Error(err.error);
      }
      await fetch(`/api/files/${encodeURIComponent(oldName)}`, { method: 'DELETE' });
      // Update state
      setFileContents(prev => {
        const copy = { ...prev };
        copy[newName] = updatedContent;
        delete copy[oldName];
        return copy;
      });
      setOpenFiles(prev => prev.map(f => f === oldName ? newName : f));
      if (activeFile === oldName) {
        setActiveFile(newName);
      }
      await fetchFileList();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fileContents, activeFile, fetchFileList]);

  // Close a tab
  const closeTab = useCallback((filename) => {
    setOpenFiles(prev => {
      const updated = prev.filter(f => f !== filename);
      if (activeFile === filename) {
        const idx = prev.indexOf(filename);
        const next = updated[Math.min(idx, updated.length - 1)] || '';
        setActiveFile(next);
      }
      return updated;
    });
  }, [activeFile]);

  // Update file content in cache and trigger debounced auto-save
  const updateFileContent = useCallback((filename, content) => {
    setFileContents(prev => ({ ...prev, [filename]: content }));
    setUnsavedChanges(prev => ({ ...prev, [filename]: true }));

    // Debounced auto-save (1 second)
    if (saveTimerRef.current[filename]) {
      clearTimeout(saveTimerRef.current[filename]);
    }
    saveTimerRef.current[filename] = setTimeout(() => {
      saveFile(filename, content);
    }, 1000);
  }, [saveFile]);

  // Get content of active file
  const activeFileContent = fileContents[activeFile] || '';

  return {
    files,
    openFiles,
    activeFile,
    fileContents,
    unsavedChanges,
    saving,
    activeFileContent,
    fetchFileList,
    openFile,
    saveFile,
    createFile,
    deleteFile,
    renameFile,
    closeTab,
    setActiveFile,
    updateFileContent,
  };
}
