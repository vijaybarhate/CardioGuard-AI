import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export default function BackendStatus() {
  const [state, setState] = useState('checking');
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_URL}/health`, { method: 'GET' });
        const ms = Math.round(performance.now() - t0);
        if (!alive) return;
        if (res.ok) {
          setState('online');
          setLatency(ms);
        } else {
          setState('degraded');
          setLatency(ms);
        }
      } catch (e) {
        if (!alive) return;
        setState('offline');
        setLatency(null);
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const dotClass = state === 'online' ? 'dot-live' : state === 'checking' ? 'dot-checking' : 'dot-down';

  return (
    <span className="status-pill" role="status" aria-live="polite"
      title={state === 'online' ? `Backend online${latency != null ? ` - ${latency}ms` : ''}` : state === 'checking' ? 'Checking backend' : 'Backend unreachable - start uvicorn or wait for Render cold start'}>
      <span className={`status-dot ${dotClass}`} aria-hidden="true" />
      {state === 'online' && <Wifi size={12} aria-hidden="true" />}
      {state === 'offline' && <WifiOff size={12} aria-hidden="true" />}
      {state === 'checking' && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
      <span>{state === 'online' ? `API online${latency != null ? ` - ${latency}ms` : ''}` : state === 'checking' ? 'Connecting API' : 'API offline'}</span>
    </span>
  );
}
