import { useState, useCallback, useEffect } from 'react';

async function getToken() {
  const { supabase } = await import('../lib/supabase.js');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function apiFetch(path, opts = {}) {
  const token = await getToken();
  const resp = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err.slice(0, 200));
  }
  return resp.json();
}

export function useWorkflow() {
  const [workflows, setWorkflows]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [running, setRunning]         = useState(false);
  const [runStatus, setRunStatus]     = useState(null);  // null | { taskId, steps, status }
  const [error, setError]             = useState('');

  // Load workflow list
  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/workflows');
      setWorkflows(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkflows(); }, [loadWorkflows]);

  // Save (create or update)
  const saveWorkflow = useCallback(async ({ id, name, description, definition }) => {
    setSaving(true);
    setError('');
    try {
      if (id) {
        await apiFetch(`/api/workflows/${id}`, {
          method: 'PUT', body: JSON.stringify({ name, description, definition }),
        });
        setWorkflows(prev => prev.map(w => w.id === id
          ? { ...w, name, description, updated_at: new Date().toISOString() } : w));
        return id;
      } else {
        const { id: newId } = await apiFetch('/api/workflows', {
          method: 'POST', body: JSON.stringify({ name, description, definition }),
        });
        await loadWorkflows();
        return newId;
      }
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }, [loadWorkflows]);

  // Delete
  const deleteWorkflow = useCallback(async (id) => {
    try {
      await apiFetch(`/api/workflows/${id}`, { method: 'DELETE' });
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // Run
  const runWorkflow = useCallback(async (id, overrides = {}) => {
    setRunning(true);
    setRunStatus({ taskId: null, steps: [], status: 'queued' });
    setError('');
    try {
      const { taskId } = await apiFetch(`/api/workflows/${id}/run`, {
        method: 'POST', body: JSON.stringify({ overrides }),
      });
      setRunStatus(prev => ({ ...prev, taskId }));

      // Poll task status
      const poll = setInterval(async () => {
        try {
          const token = await getToken();
          const resp = await fetch(`/api/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!resp.ok) return;
          const task = await resp.json();
          setRunStatus({
            taskId,
            steps: task.meta?.steps || [],
            status: task.status,
            output: task.output,
            error: task.error,
          });
          if (task.status === 'done' || task.status === 'failed') {
            clearInterval(poll);
            setRunning(false);
            if (task.status === 'done') {
              window.dispatchEvent(new Event('atlas-reports-updated'));
            }
          }
        } catch {}
      }, 2500);
    } catch (e) {
      setError(e.message);
      setRunning(false);
    }
  }, []);

  // Get single workflow (with definition)
  const getWorkflow = useCallback(async (id) => {
    return apiFetch(`/api/workflows/${id}`);
  }, []);

  return {
    workflows, loading, saving, running, runStatus, error,
    loadWorkflows, saveWorkflow, deleteWorkflow, runWorkflow, getWorkflow,
  };
}
