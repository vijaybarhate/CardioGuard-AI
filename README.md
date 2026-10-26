# CardioGuard AI

Heart disease risk predictor - CSC701 Machine Learning mini project (Sem 7).
Heart disease prediction built on Random Forest (Module 3 Ensemble) using the UCI Heart
Disease (Cleveland) set. Random Forest runs by default; 3 baselines (Logistic Regression,
SVM, Decision Tree) are available under advanced compare, with preprocessing,
confidence gauge and batch CSV scoring.

## Features
- Single patient form (11 clinical features) with inline hints
- Model selector with per-model explanation + SVG diagrams
- Animated confidence gauge + risk pills
- Batch CSV analysis (drag-drop, sample file included, sticky results table)
- Learn tab (pipeline, models, syllabus mapping) + About tab (run/deploy guide)
- Live backend status pill (`/health` with latency)

## Tech stack
- Backend: FastAPI + scikit-learn + pandas + joblib (Python 3.12)
- Frontend: React 19 + Vite + Axios + lucide-react + pure CSS (no UI framework)
- Dataset: UCI Heart Disease Cleveland (~918 rows)

## Run locally
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. API docs at `http://localhost:8000/docs`.

## Retrain (optional)
```bash
cd backend
python train_model.py --data heart.csv
```
Models are pre-trained and committed under `backend/models/` so deploy works without retraining.

## Deploy
### Backend - Render
- New Web Service from this repo, Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check: `/health` (or use `render.yaml` blueprint)
- Note: free tier sleeps after 15 min idle, first request takes ~30-50s

### Frontend - Vercel
- Import repo, Root Directory: `frontend`
- Build: `npm run build`, Output: `dist`
- Env var: `VITE_API_URL` = Render backend URL (e.g. `https://cardioguard-api.onrender.com`)

## Project structure
- `backend/main.py` - FastAPI app (`/`, `/health`, `/predict`, `/predict/batch`)
- `backend/train_model.py` - training script
- `backend/models/*.joblib` - saved models + scaler + KNN imputer + mappings
- `backend/sample_patients.csv` - sample batch input
- `frontend/src/` - React app (App, Hero, PredictionForm, BatchUpload, ModelInfo, Learn, About, BackendStatus, RiskGauge)
- `frontend/public/sample_patients.csv` - in-browser sample file
- `research/HeartDiseaseResearch.ipynb` - training + EDA notebook

## Syllabus mapping (CSC701, Modules 3-6)
- Module 3 (Ensemble): Random Forest bagging, Decision Tree, model comparison
- Module 4 (SVM): RBF kernel SVM, margin concept, scaling, LR comparison
- Module 5 (Clustering): KNN imputation via Euclidean distance
- Module 6 (Dim reduction): StandardScaler pipeline (PCA-ready)

Research demo only. Not a medical diagnosis.
