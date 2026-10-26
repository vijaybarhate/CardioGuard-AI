import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export default function BackendStatus() {
  const [state, setState] = useState('checking');
  const [latency, setLatency] = useState(null);
  const alive = useRef(true);
  const timer = useRef(null);

  const check = useCallback(async (retries = 2) => {
    const t0 = performance.now();
    try {
      const ctrl = new AbortController();
      const killer = setTimeout(() => ctrl.abort(), 60000);
      const res = await fetch(`${API_URL}/health`, { signal: ctrl.signal });
      clearTimeout(killer);
      const ms = Math.round(performance.now() - t0);
      if (!alive.current) return;
      if (res.ok) {
        setState('online');
        setLatency(ms);
      } else {
        throw new Error(`status ${res.status}`);
      }
    } catch {
      if (!alive.current) return;
      if (retries > 0) {
        timer.current = setTimeout(() => { if (alive.current) check(retries - 1); }, 6000);
        return;
      }
      setState('offline');
      setLatency(null);
    }
    if (alive.current) {
      timer.current = setTimeout(() => { if (alive.current) check(2); }, 30000);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    check();
    return () => { alive.current = false; clearTimeout(timer.current); };
  }, [check]);

  const retryNow = () => {
    clearTimeout(timer.current);
    setState('checking');
    check();
  };

  const dotClass = state === 'online' ? 'dot-live' : state === 'checking' ? 'dot-checking' : 'dot-down';
  const label = state === 'online'
    ? `Backend online${latency != null ? ` - ${latency}ms` : ''}. Click to re-check.`
    : 'Backend unreachable (Render free tier sleeps when idle - first wake takes ~40s). Click to retry now.';

  return (
    <span className="status-pill" role="status" aria-live="polite" title={label}>
      <button type="button" className="status-pill-btn" onClick={retryNow} aria-label={label}>
        <span className={`status-dot ${dotClass}`} aria-hidden="true" />
        {state === 'online' && <Wifi size={12} aria-hidden="true" />}
        {state === 'offline' && <WifiOff size={12} aria-hidden="true" />}
        {state === 'checking' && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
        <span>{state === 'online' ? `API online${latency != null ? ` - ${latency}ms` : ''}` : state === 'checking' ? 'Connecting API' : 'API offline - click to retry'}</span>
      </button>
    </span>
  );
}
