import React from 'react';
import { Info, Github, Server, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="card">
      <div className="card-title"><Info size={18} /> About this project</div>
      <div className="content">
        <h2>CardioGuard AI</h2>
        <p>
          A full-stack machine learning web app that predicts heart-disease risk from 11 clinical features,
          built on Random Forest (ensemble), with 3 extra models
          (Logistic Regression, SVM, Decision Tree) for comparison.
          Built as the <strong>CSC701 Machine Learning mini project</strong> (Semester 7, 4th year).
        </p>

        <h3>Tech stack</h3>
        <ul>
          <li><strong>Backend:</strong> FastAPI + scikit-learn + joblib + pandas (Python 3.12)</li>
          <li><strong>Frontend:</strong> React 19 + Vite + Axios</li>
          <li><strong>Primary model:</strong> Random Forest (ensemble) - default in UI</li>
          <li><strong>Baselines:</strong> LR, SVM, DT (advanced compare) + scaler + KNN imputer + mappings (.joblib)</li>
          <li><strong>Dataset:</strong> UCI Heart Disease (Cleveland)</li>
        </ul>

        <h3>Run locally</h3>
        <ol>
          <li>Backend: <code>cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000</code></li>
          <li>Frontend: <code>cd frontend && npm install && npm run dev</code></li>
          <li>Open <code>http://localhost:5173</code></li>
        </ol>

        <h3>Deploy</h3>
        <ul>
          <li><strong>Backend → Render:</strong> root <code>backend</code>, build <code>pip install -r requirements.txt</code>, start <code>uvicorn main:app --host 0.0.0.0 --port 10000</code></li>
          <li><strong>Frontend → Vercel:</strong> root <code>frontend</code>, build <code>npm run build</code>, output <code>dist</code>, env <code>VITE_API_URL</code> = Render URL</li>
          <li><strong>Note:</strong> Render free tier sleeps after 15 min inactivity; first request can take ~30-50s (UI shows retry hint).</li>
        </ul>

        <h3>Project structure</h3>
        <ul>
          <li><code>backend/main.py</code> - FastAPI app, /predict, /predict/batch</li>
          <li><code>backend/train_model.py</code> - training script (re-train if needed)</li>
          <li><code>backend/models/*.joblib</code> - saved models + preprocessors</li>
          <li><code>backend/sample_patients.csv</code> - sample batch input</li>
          <li><code>frontend/src/</code> - React components (PredictionForm, BatchUpload, Learn, About)</li>
          <li><code>research/HeartDiseaseResearch.ipynb</code> - training + EDA notebook (80 cells)</li>
        </ul>

        <div className="callout">
          <strong>Disclaimer:</strong> Research demo only. Not a medical diagnosis. Models trained on a small dataset.
        </div>
      </div>
    </div>
  );
}
