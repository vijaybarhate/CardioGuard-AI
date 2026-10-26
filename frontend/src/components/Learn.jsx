import React from 'react';
import { Cpu, Database, Sliders, GitBranch, Layers } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="card">
    <div className="card-title"><Icon size={18} /> {title}</div>
    <div className="content">{children}</div>
  </div>
);

export default function Learn() {
  return (
    <div>
      <Section icon={Database} title="1. Problem & Dataset">
        <p>
          We predict whether a patient has <strong>heart disease</strong> (binary: 0 = no, 1 = yes) from 11 clinical
          features. Dataset: <strong>UCI Heart Disease (Cleveland)</strong>, ~918 patients. This is a
          <em> supervised classification</em> problem taught in CSC701.
        </p>
        <div className="callout">
          <strong>Why heart disease?</strong> Classic, small, clean, well-studied dataset. Easy to explain in viva
          and maps directly to syllabus (SVM, Random Forest, Decision Tree, Logistic Regression).
        </div>
      </Section>

      <Section icon={Sliders} title="2. Preprocessing Pipeline (backend/preprocess)">
        <svg viewBox="0 0 760 60" width="100%" height="60" role="img" aria-label="Preprocessing pipeline" style={{ margin: '0.5rem 0 1rem' }}>
          {['Raw input', 'Map cats', '0→NaN', 'Clip', 'KNN impute', 'Scale (SVM/LR)'].map((t, i, arr) => {
            const x = 10 + i * 126;
            return (
              <g key={t}>
                <rect x={x} y={12} width={116} height={30} rx={6} fill="#1a2236" stroke="#2a3655" />
                <text x={x + 58} y={31} fill="#e6eaf2" fontSize="10" textAnchor="middle">{t}</text>
                {i < arr.length - 1 && <line x1={x + 116} y1={27} x2={x + 126} y2={27} stroke="#14b8a6" strokeWidth="1.5" markerEnd="url(#arrow2)" />}
              </g>
            );
          })}
          <defs>
            <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#14b8a6" />
            </marker>
          </defs>
        </svg>
        <ol>
          <li><strong>Map categoricals</strong> - Sex (M/F→1/0), ChestPainType, RestingECG, ExerciseAngina, ST_Slope → numbers using a saved mapping.</li>
          <li><strong>Handle zeros</strong> - Cholesterol/RestingBP = 0 treated as missing (NaN), because 0 is medically impossible.</li>
          <li><strong>Clip outliers</strong> - Age, BP, Cholesterol, MaxHR, Oldpeak clipped to biological limits (prevents garbage input from breaking the model).</li>
          <li><strong>KNN Imputation</strong> - missing values filled using nearest neighbours (distance-based).</li>
          <li><strong>StandardScaler</strong> - applied only for distance-based models (SVM, Logistic Regression). Tree models use raw values.</li>
        </ol>
        <div className="callout warn">
          <strong>Key point for viva:</strong> Trees don't need scaling (split on thresholds), but SVM &amp; LR do,
          because they use distances / gradients. That's why the backend scales conditionally.
        </div>
      </Section>

      <Section icon={Cpu} title="3. Main Model: Random Forest">
        <div className="model-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="model-card">
            <div className="mod">Max-margin classifier</div>
            <div className="name">Support Vector Machine</div>
            <div className="desc">
              Finds the maximum-margin hyperplane separating the two classes. Uses RBF kernel to handle
              non-linear boundaries. Sensitive to scale → scaled input. C and gamma control margin vs accuracy.
            </div>
          </div>
          <div className="model-card" style={{ borderColor: 'var(--accent)' }}>
            <div className="mod">PRIMARY - used in this project</div>
            <div className="name">Random Forest</div>
            <div className="desc">
              Bagging of many decision trees with random feature subsets. Reduces variance, robust to overfitting.
              Gives feature importance. No scaling needed. Usually best accuracy here. This is the default model
              in Predict and Batch tabs.
            </div>
          </div>
          <div className="model-card">
            <div className="mod">Tree model</div>
            <div className="name">Decision Tree</div>
            <div className="desc">
              Single tree, splits on Gini/entropy. Highly interpretable (if-else rules) but prone to overfitting.
              Used as the base weak learner in ensembles.
            </div>
          </div>
          <div className="model-card">
            <div className="mod">Linear baseline</div>
            <div className="name">Logistic Regression</div>
            <div className="desc">
              Probabilistic linear classifier (sigmoid). Outputs probability 0-1. Fast, interpretable baseline.
              Compared with SVM (hinge loss vs log loss).
            </div>
          </div>
        </div>
      </Section>

      <Section icon={GitBranch} title="4. End-to-End Flow">
        <svg viewBox="0 0 760 90" width="100%" height="90" role="img" aria-label="End to end flow" style={{ margin: '0.5rem 0 1rem' }}>
          {['User form', 'React frontend', 'FastAPI /predict', 'Preprocess', 'Model', 'Risk + prob'].map((t, i, arr) => {
            const x = 20 + i * 125;
            return (
              <g key={t}>
                <rect x={x} y={25} width={105} height={34} rx={8} fill="#1a2236" stroke="#2a3655" />
                <text x={x + 52} y={46} fill="#e6eaf2" fontSize="11" textAnchor="middle">{t}</text>
                {i < arr.length - 1 && <line x1={x + 105} y1={42} x2={x + 125} y2={42} stroke="#14b8a6" strokeWidth="1.5" markerEnd="url(#arrow)" />}
              </g>
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#14b8a6" />
            </marker>
          </defs>
        </svg>
        <ol>
          <li>User fills form / uploads CSV in React frontend.</li>
          <li>Frontend calls <code>POST /predict</code> or <code>POST /predict/batch</code> with <code>model_name</code>.</li>
          <li>FastAPI validates, preprocesses (map → impute → clip → scale if SVM/LR).</li>
          <li>Selected model predicts class (0/1) + probability.</li>
          <li>Response: <code>{'{ risk, prediction, probability, model }'}</code> → UI shows risk + confidence bar.</li>
        </ol>
        <div className="callout">
          <strong>Try it:</strong> switch models on the same patient and compare confidence - great demo point.
        </div>
      </Section>

      <Section icon={Layers} title="5. Which syllabus topics this covers">
        <ul>
          <li><strong>Ensemble methods:</strong> Random Forest (bagging), Decision Tree, model comparison.</li>
          <li><strong>SVM and linear models:</strong> RBF kernel, margin concept, scaling, LR comparison.</li>
          <li><strong>Distance metrics:</strong> KNN imputation uses Euclidean distance.</li>
          <li><strong>Scaling:</strong> StandardScaler pipeline, PCA-ready for visualization.</li>
        </ul>
        <div className="callout warn">
          <strong>Optional upgrade:</strong> Add PCA to reduce 11 features → 2D for a scatter plot of
          patients. Easy 10-line addition using sklearn PCA.
        </div>
      </Section>
    </div>
  );
}
