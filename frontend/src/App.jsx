import React, { useState } from 'react';
import { Heart, Activity, BookOpen, Info, Upload } from 'lucide-react';
import PredictionForm from './components/PredictionForm';
import BatchUpload from './components/BatchUpload';
import Learn from './components/Learn';
import About from './components/About';
import ModelInfo from './components/ModelInfo';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import BackendStatus from './components/BackendStatus';
import './index.css';

const NAV = [
  { id: 'predict', label: 'Predict', icon: Activity, title: 'Single patient risk prediction' },
  { id: 'batch', label: 'Batch', icon: Upload, title: 'Bulk CSV analysis' },
  { id: 'learn', label: 'Learn', icon: BookOpen, title: 'How the ML pipeline works' },
  { id: 'about', label: 'About', icon: Info, title: 'Project info, run and deploy' },
];

const MODEL_HINT = {
  'Logistic Regression': 'Linear probabilistic baseline. Needs scaled features.',
  'SVM': 'Max-margin classifier with RBF kernel. Needs scaling.',
  'Decision Tree': 'Single interpretable tree. No scaling needed.',
  'Random Forest': 'Bagging of trees. Usually best accuracy. No scaling.',
};

export default function App() {
  const [tab, setTab] = useState('predict');
  const [model, setModel] = useState('Random Forest');
  const models = ['Logistic Regression', 'SVM', 'Decision Tree', 'Random Forest'];

  const go = (id) => {
    setTab(id);
    document.getElementById('main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to main content</a>
      <header className="header">
        <div className="brand">
          <img src="/logo.svg" alt="CardioGuard AI logo" className="brand-mark" width="40" height="40" />
          <div>
            <h1>CardioGuard AI</h1>
            <p>Heart disease risk predictor - CSC701 Machine Learning mini project</p>
          </div>
        </div>
        <div className="header-actions">
          <BackendStatus />
          <span className="badge" title="Research demo only - not a medical diagnosis">
            <Heart size={12} aria-hidden="true" /> Research demo, not diagnosis
          </span>
        </div>
      </header>

      <Hero
        onPredict={() => go('predict')}
        onBatch={() => go('batch')}
        onLearn={() => go('learn')}
      />

      <nav className="nav" role="tablist" aria-label="Main sections">
        {NAV.map(({ id, label, icon: Icon, title }) => (
          <button key={id} role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} title={title}
            className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            <Icon size={15} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {label}
          </button>
        ))}
      </nav>

      {(tab === 'predict' || tab === 'batch') && (
        <section className="card" style={{ marginBottom: '1.25rem' }} aria-labelledby="model-select-heading">
          <div className="card-title" id="model-select-heading">Model: Random Forest <span className="meta-pill" style={{ marginLeft: '0.4rem' }}>Module 3 - Ensemble (primary)</span></div>
          <div className="card-sub">This project is built on <strong>Random Forest</strong> (bagging ensemble). It runs by default. Other models are only for baseline comparison.</div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }} role="group" aria-label="Model selection">
            <button className={`btn ${model === 'Random Forest' ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={model === 'Random Forest'}
              onClick={() => setModel('Random Forest')} title="Primary model - bagging of decision trees"
              style={{ padding: '0.5rem 1rem' }}>
              Random Forest (default)
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-mute)' }}>running: <strong>{model}</strong></span>
          </div>
          <details style={{ marginTop: '0.9rem' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-soft)', fontWeight: 600 }}>
              Compare with other models (advanced, for viva demo)
            </summary>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.7rem' }} role="group" aria-label="Baseline models">
              {models.filter(m => m !== 'Random Forest').map(m => (
                <button key={m} className={`btn ${model === m ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setModel(m)} aria-pressed={model === m} title={MODEL_HINT[m]}
                  style={{ padding: '0.5rem 1rem' }}>
                  {m}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-mute)', marginTop: '0.6rem' }}>
              Baselines: LR (Module 4 baseline), SVM (Module 4), Decision Tree (RF ka base learner). Same patient pe chalake confidence compare karo.
            </p>
          </details>
          {tab === 'predict' && <ModelInfo model={model} />}
        </section>
      )}

      <main id="main">
        <ErrorBoundary>
          {tab === 'predict' && <PredictionForm selectedModel={model} />}
          {tab === 'batch' && <BatchUpload selectedModel={model} />}
          {tab === 'learn' && <Learn />}
          {tab === 'about' && <About />}
        </ErrorBoundary>
      </main>

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-mute)', fontSize: '0.78rem' }}>
        CardioGuard AI - Built for CSC701 Machine Learning (Sem 7) - Not a medical diagnosis.
        <br />UI patterns inspired by 21st.dev dashboard kits, rebuilt with pure CSS + lucide + SVG.
      </footer>
    </div>
  );
}
