import React from 'react';
import { Cpu, Database, Layers, ArrowRight, FileSpreadsheet, FlaskConical, Gauge } from 'lucide-react';

const STATS = [
  {
    icon: Cpu,
    label: 'Primary model',
    value: 'RF',
    sub: 'Random Forest default, 3 more to compare',
    spark: [12, 22, 18, 30, 26, 38, 34, 46],
  },
  {
    icon: Layers,
    label: 'Clinical features',
    value: '11',
    sub: 'Age, BP, cholesterol, ECG, angina and more',
    spark: [20, 26, 24, 32, 30, 36, 42, 40],
  },
  {
    icon: Database,
    label: 'Training patients',
    value: '918',
    sub: 'UCI Heart Disease Cleveland set',
    spark: [14, 18, 26, 24, 34, 32, 40, 46],
  },
  {
    icon: Gauge,
    label: 'Prediction modes',
    value: '2',
    sub: 'Single form + bulk CSV batch scoring',
    spark: [10, 16, 14, 24, 28, 26, 36, 44],
  },
];

function Spark({ points }) {
  const w = 120;
  const h = 36;
  const max = Math.max(...points);
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - (p / max) * (h - 6) - 3).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="36" aria-hidden="true" preserveAspectRatio="none">
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="var(--accent)" opacity="0.12" stroke="none" />
    </svg>
  );
}

const STEPS = [
  {
    icon: FlaskConical,
    n: '01',
    title: 'Enter patient data',
    desc: 'Fill the 11 field form or drop a CSV. Inline hints explain every clinical field.',
  },
  {
    icon: Cpu,
    n: '02',
    title: 'Pick a model',
    desc: 'Random Forest runs by default. Open advanced compare to run LR, SVM or DT on the same input.',
  },
  {
    icon: Gauge,
    n: '03',
    title: 'Get risk + reason',
    desc: 'Instant High/Low label with animated confidence gauge and viva ready explanation.',
  },
];

export default function Hero({ onPredict, onBatch, onLearn }) {
  return (
    <div className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-orb orb-a" />
        <div className="hero-orb orb-b" />
      </div>
      <div className="hero-inner">
        <div className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          CSC701 Machine Learning - Sem 7 Mini Project
        </div>
        <h2 className="hero-title">
          Heart disease risk, <span className="hero-accent">explained by 4 models.</span>
        </h2>
        <p className="hero-sub">
          Heart disease prediction built on Random Forest. One UI with preprocessing,
          confidence gauge and batch CSV scoring, plus 3 extra models to compare.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={onPredict}>
            Predict now <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button className="btn btn-ghost" onClick={onBatch}>
            <FileSpreadsheet size={16} aria-hidden="true" /> Try sample CSV
          </button>
          <button className="btn btn-ghost" onClick={onLearn}>
            How it works
          </button>
        </div>
        <div className="hero-meta">
          <span className="meta-pill">UCI Heart dataset - 918 patients</span>
          <span className="meta-pill">FastAPI + scikit-learn</span>
          <span className="meta-pill">React + Vite</span>
          <span className="meta-pill">Render + Vercel ready</span>
        </div>
      </div>

      <div className="stats-bento">
        {STATS.map(({ icon: Icon, label, value, sub, spark }) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span className="stat-icon" aria-hidden="true"><Icon size={16} /></span>
              <span className="stat-label">{label}</span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
            <div className="stat-spark"><Spark points={spark} /></div>
          </div>
        ))}
      </div>

      <div className="steps-row">
        {STEPS.map(({ icon: Icon, n, title, desc }) => (
          <div className="step-card" key={n}>
            <div className="step-head">
              <span className="step-icon" aria-hidden="true"><Icon size={16} /></span>
              <span className="step-n">{n}</span>
            </div>
            <div className="step-title">{title}</div>
            <div className="step-desc">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
