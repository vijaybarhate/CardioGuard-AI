import React from 'react';
import { Cpu, Database, Layers, ArrowRight, FileSpreadsheet, FlaskConical, Gauge } from 'lucide-react';

const STATS = [
  {
    icon: Cpu,
    label: 'Primary model',
    value: 'RF',
    sub: 'Random Forest default, 3 more to compare',
  },
  {
    icon: Layers,
    label: 'Clinical features',
    value: '11',
    sub: 'Age, BP, cholesterol, ECG, angina and more',
  },
  {
    icon: Database,
    label: 'Training patients',
    value: '918',
    sub: 'UCI Heart Disease Cleveland set',
  },
  {
    icon: Gauge,
    label: 'Prediction modes',
    value: '2',
    sub: 'Single form + bulk CSV batch scoring',
  },
];

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
        {STATS.map(({ icon: Icon, label, value, sub }) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span className="stat-icon" aria-hidden="true"><Icon size={16} /></span>
              <span className="stat-label">{label}</span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
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
