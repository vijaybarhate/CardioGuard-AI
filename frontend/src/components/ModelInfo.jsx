import React from 'react';
import { Cpu, GitBranch, Layers, Target } from 'lucide-react';

const INFO = {
  'Logistic Regression': {
    module: 'Module 4 - Baseline',
    short: 'Probabilistic linear classifier. Outputs probability via sigmoid.',
    how: 'Computes a weighted sum of features (z = w-x + b) and passes through sigmoid σ(z)=1/(1+e⁻ᶻ) to get P(y=1|x). Trained by minimizing log loss with gradient descent.',
    needs: 'Scaled features (distance/gradient based). Fast, interpretable; coefficients show feature importance direction.',
    diagram: (
      <svg viewBox="0 0 320 120" width="100%" height="120" role="img" aria-label="Logistic regression sigmoid">
        <line x1="20" y1="100" x2="300" y2="100" stroke="#2a3655" strokeWidth="1" />
        <line x1="20" y1="20" x2="20" y2="100" stroke="#2a3655" strokeWidth="1" />
        <text x="160" y="115" fill="#8a94ad" fontSize="10" textAnchor="middle">z = w-x + b</text>
        <text x="10" y="18" fill="#8a94ad" fontSize="10">P</text>
        <path d="M20,95 C60,94 110,88 150,60 C190,32 240,22 300,20" fill="none" stroke="#14b8a6" strokeWidth="2.5" />
        <line x1="20" y1="60" x2="300" y2="60" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
        <text x="305" y="63" fill="#f59e0b" fontSize="9">0.5</text>
      </svg>
    ),
  },
  'SVM': {
    module: 'Module 4 - SVM',
    short: 'Maximum-margin hyperplane classifier. RBF kernel for non-linear data.',
    how: 'Finds the hyperplane w-x+b=0 that maximizes margin 2/||w|| to nearest points (support vectors). RBF kernel K(x,z)=exp(-γ||x-z||²) maps data to high-dim space (kernel trick) so non-linear boundaries become linear.',
    needs: 'Scaled features. C controls margin vs errors; γ controls RBF width. Only support vectors matter.',
    diagram: (
      <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="SVM margin">
        <line x1="40" y1="70" x2="280" y2="70" stroke="#14b8a6" strokeWidth="2" />
        <line x1="40" y1="40" x2="280" y2="40" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="40" y1="100" x2="280" y2="100" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" />
        <text x="285" y="43" fill="#22d3ee" fontSize="9">margin +1</text>
        <text x="285" y="73" fill="#14b8a6" fontSize="9">hyperplane</text>
        <text x="285" y="103" fill="#22d3ee" fontSize="9">margin -1</text>
        <circle cx="90" cy="40" r="5" fill="#f43f5e" />
        <circle cx="130" cy="40" r="5" fill="#f43f5e" />
        <circle cx="200" cy="100" r="5" fill="#22c55e" />
        <circle cx="240" cy="100" r="5" fill="#22c55e" />
        <text x="110" y="30" fill="#8a94ad" fontSize="9">support vectors</text>
      </svg>
    ),
  },
  'Decision Tree': {
    module: 'Module 3 - Base learner',
    short: 'Single tree: splits on Gini/entropy. Interpretable if-else rules.',
    how: 'Recursively splits data on the feature/threshold that best separates classes (max information gain / min Gini). Stops at max_depth or pure leaves. Prediction = majority class in the leaf.',
    needs: 'No scaling needed. Prone to overfitting; used as base learner in ensembles.',
    diagram: (
      <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Decision tree">
        <rect x="120" y="10" width="80" height="24" rx="6" fill="#14b8a6" />
        <text x="160" y="26" fill="#042f2e" fontSize="10" textAnchor="middle" fontWeight="600">Age &gt; 50?</text>
        <line x1="130" y1="34" x2="90" y2="55" stroke="#8a94ad" strokeWidth="1" />
        <line x1="190" y1="34" x2="230" y2="55" stroke="#8a94ad" strokeWidth="1" />
        <text x="100" y="50" fill="#8a94ad" fontSize="9">Yes</text>
        <text x="215" y="50" fill="#8a94ad" fontSize="9">No</text>
        <rect x="60" y="55" width="70" height="22" rx="5" fill="#1a2236" stroke="#2a3655" />
        <text x="95" y="70" fill="#e6eaf2" fontSize="9" textAnchor="middle">Chol&gt;200?</text>
        <rect x="195" y="55" width="70" height="22" rx="5" fill="#1a2236" stroke="#2a3655" />
        <text x="230" y="70" fill="#e6eaf2" fontSize="9" textAnchor="middle">MaxHR&lt;140?</text>
        <line x1="75" y1="77" x2="60" y2="95" stroke="#8a94ad" strokeWidth="1" />
        <line x1="115" y1="77" x2="130" y2="95" stroke="#8a94ad" strokeWidth="1" />
        <rect x="45" y="95" width="40" height="20" rx="4" fill="#f43f5e" />
        <text x="65" y="109" fill="#fff" fontSize="9" textAnchor="middle">High</text>
        <rect x="115" y="95" width="40" height="20" rx="4" fill="#22c55e" />
        <text x="135" y="109" fill="#042f2e" fontSize="9" textAnchor="middle">Low</text>
      </svg>
    ),
  },
  'Random Forest': {
    module: 'Module 3 - Ensemble (Bagging)',
    short: 'Bagging of many decision trees with random feature subsets. Reduces variance.',
    how: 'Builds T trees on bootstrap samples (with replacement, ~63% unique), considering only √M (or M/3) random features per split. Final prediction = majority vote (classification) / mean (regression). OOB samples give free validation error.',
    needs: 'No scaling needed. Robust, gives feature importance, rarely overfits. Slower & less interpretable.',
    diagram: (
      <svg viewBox="0 0 320 130" width="100%" height="130" role="img" aria-label="Random forest ensemble">
        <rect x="10" y="10" width="60" height="26" rx="5" fill="#1a2236" stroke="#2a3655" />
        <text x="40" y="27" fill="#e6eaf2" fontSize="9" textAnchor="middle">Tree 1</text>
        <rect x="80" y="10" width="60" height="26" rx="5" fill="#1a2236" stroke="#2a3655" />
        <text x="110" y="27" fill="#e6eaf2" fontSize="9" textAnchor="middle">Tree 2</text>
        <rect x="150" y="10" width="60" height="26" rx="5" fill="#1a2236" stroke="#2a3655" />
        <text x="180" y="27" fill="#e6eaf2" fontSize="9" textAnchor="middle">Tree 3</text>
        <text x="225" y="27" fill="#8a94ad" fontSize="12">...</text>
        <rect x="245" y="10" width="60" height="26" rx="5" fill="#1a2236" stroke="#2a3655" />
        <text x="275" y="27" fill="#e6eaf2" fontSize="9" textAnchor="middle">Tree T</text>
        <line x1="40" y1="36" x2="160" y2="70" stroke="#8a94ad" strokeWidth="1" />
        <line x1="110" y1="36" x2="160" y2="70" stroke="#8a94ad" strokeWidth="1" />
        <line x1="180" y1="36" x2="160" y2="70" stroke="#8a94ad" strokeWidth="1" />
        <line x1="275" y1="36" x2="160" y2="70" stroke="#8a94ad" strokeWidth="1" />
        <rect x="120" y="70" width="80" height="26" rx="6" fill="#14b8a6" />
        <text x="160" y="87" fill="#042f2e" fontSize="10" textAnchor="middle" fontWeight="600">Majority vote</text>
        <line x1="160" y1="96" x2="160" y2="110" stroke="#8a94ad" strokeWidth="1" />
        <rect x="120" y="110" width="80" height="18" rx="4" fill="#22c55e" />
        <text x="160" y="123" fill="#042f2e" fontSize="9" textAnchor="middle">High / Low</text>
      </svg>
    ),
  },
};

export default function ModelInfo({ model }) {
  const info = INFO[model];
  if (!info) return null;
  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
      <div className="card-title"><Cpu size={18} aria-hidden="true" /> {model} - how it works</div>
      <div className="card-sub">{info.module} - {info.short}</div>
      <div style={{ marginBottom: '1rem' }}>{info.diagram}</div>
      <div className="content" style={{ maxWidth: 'none' }}>
        <h3 style={{ marginTop: 0 }}>Algorithm</h3>
        <p>{info.how}</p>
        <h3>Requirements / notes</h3>
        <p>{info.needs}</p>
      </div>
    </div>
  );
}
