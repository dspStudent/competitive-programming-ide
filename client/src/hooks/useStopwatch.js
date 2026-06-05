import { useState, useRef, useCallback } from 'react';

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    startTimeRef.current = Date.now() - elapsed;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 100);
  }, [running, elapsed]);

  const stop = useCallback(() => {
    if (!running) return;
    setRunning(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, [running]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (running) stop();
    else start();
  }, [running, start, stop]);

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return { elapsed, running, start, stop, reset, toggle, formatted: formatTime(elapsed) };
}
