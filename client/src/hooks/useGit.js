import { useState, useCallback } from 'react';

export function useGit() {
  const [gitStatus, setGitStatus] = useState({ hasChanges: false, changes: [] });
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/git/status');
      const data = await response.json();
      setGitStatus(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch git status:', err);
      return { hasChanges: false, changes: [] };
    }
  }, []);

  const commitAndPush = useCallback(async (elapsedTime) => {
    setPushing(true);
    setPushResult(null);
    try {
      const response = await fetch('/api/git/commit-and-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsedTime }),
      });
      const data = await response.json();
      setPushResult(data);
      if (data.success) {
        setGitStatus({ hasChanges: false, changes: [] });
      }
      return data;
    } catch (err) {
      const result = { success: false, error: err.message };
      setPushResult(result);
      return result;
    } finally {
      setPushing(false);
    }
  }, []);

  return { gitStatus, pushing, pushResult, fetchStatus, commitAndPush };
}
