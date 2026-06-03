import { useState, useCallback } from 'react';

export function useCodeRunner() {
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = useCallback(async (code, input) => {
    setIsRunning(true);
    setOutput('');
    setError('');
    setStatus('RUNNING');
    setExecutionTime(null);

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input }),
      });

      const result = await response.json();
      setOutput(result.output || '');
      setError(result.error || '');
      setStatus(result.status);
      setExecutionTime(result.executionTime);

      return result;
    } catch (err) {
      setStatus('ERROR');
      setError(`Network error: ${err.message}. Is the server running?`);
      return { status: 'ERROR', output: '', error: err.message, executionTime: null };
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { output, status, error, executionTime, isRunning, runCode };
}
