import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

export function useCodeRunner() {
  const [output, setOutput] = useState(() => localStorage.getItem(STORAGE_KEYS.OUTPUT) || '');
  const [status, setStatus] = useState(() => localStorage.getItem(STORAGE_KEYS.OUTPUT_STATUS) || null);
  const [error, setError] = useState(() => localStorage.getItem(STORAGE_KEYS.OUTPUT_ERROR) || '');
  const [executionTime, setExecutionTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXECUTION_TIME);
    return saved ? Number(saved) : null;
  });
  const [isRunning, setIsRunning] = useState(false);

  const runCode = useCallback(async (code, input, timeLimit, memoryLimit) => {
    setIsRunning(true);
    setOutput('');
    setError('');
    setStatus('RUNNING');
    setExecutionTime(null);

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input, timeLimit, memoryLimit }),
      });

      const result = await response.json();
      setOutput(result.output || '');
      setError(result.error || '');
      setStatus(result.status);
      setExecutionTime(result.executionTime);

      localStorage.setItem(STORAGE_KEYS.OUTPUT, result.output || '');
      localStorage.setItem(STORAGE_KEYS.OUTPUT_ERROR, result.error || '');
      localStorage.setItem(STORAGE_KEYS.OUTPUT_STATUS, result.status || '');
      localStorage.setItem(STORAGE_KEYS.EXECUTION_TIME, result.executionTime != null ? String(result.executionTime) : '');

      return result;
    } catch (err) {
      const errMsg = `Network error: ${err.message}. Is the server running?`;
      setStatus('ERROR');
      setError(errMsg);
      localStorage.setItem(STORAGE_KEYS.OUTPUT, '');
      localStorage.setItem(STORAGE_KEYS.OUTPUT_ERROR, errMsg);
      localStorage.setItem(STORAGE_KEYS.OUTPUT_STATUS, 'ERROR');
      localStorage.setItem(STORAGE_KEYS.EXECUTION_TIME, '');
      return { status: 'ERROR', output: '', error: err.message, executionTime: null };
    } finally {
      setIsRunning(false);
    }
  }, []);

  const stopCode = useCallback(async () => {
    try {
      await fetch('/api/stop', { method: 'POST' });
    } catch (e) {}
    setIsRunning(false);
    setStatus('STOPPED');
    setError('Program terminated by user.');
    localStorage.setItem(STORAGE_KEYS.OUTPUT_STATUS, 'STOPPED');
    localStorage.setItem(STORAGE_KEYS.OUTPUT_ERROR, 'Program terminated by user.');
  }, []);

  return { output, status, error, executionTime, isRunning, runCode, stopCode };
}
