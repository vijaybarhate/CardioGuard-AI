import React, { useState, useEffect } from 'react';

export default function RiskGauge({ probability, risk }) {
  const pct = Math.max(0, Math.min(100, Math.round(probability * 100)));
  const [display, setDisplay] = useState(0);
  const isHigh = risk === 'High';

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * pct));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = C - (C * display) / 100;
  const color = isHigh ? 'var(--danger)' : 'var(--success)';

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 140 140" width="148" height="148" role="img"
        aria-label={`Confidence ${display} percent, ${risk} risk`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--border)" strokeWidth="12" />
        <circle cx="70" cy="70" r={R} fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
          transform="rotate(-90 70 70)" className="gauge-arc" />
        <text x="70" y="66" textAnchor="middle" fill="var(--text)" fontSize="26" fontWeight="700"
          fontFamily="'Bricolage Grotesque', sans-serif">{display}%</text>
        <text x="70" y="86" textAnchor="middle" fill="var(--text-mute)" fontSize="11">confidence</text>
      </svg>
      <div className={`risk-pill ${isHigh ? 'pill-high' : 'pill-low'}`}>
        <span className="risk-dot" aria-hidden="true" />
        {risk} Risk
      </div>
    </div>
  );
}
