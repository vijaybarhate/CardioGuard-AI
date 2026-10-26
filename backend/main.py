import os
import io
import logging
from typing import Dict, Any, List, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cardioguard")

app = FastAPI(title="Heart Disease Prediction API")

# CORS: no credentials are used, so "*" is valid only with allow_credentials=False.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

models: Dict[str, Any] = {}
scaler = None
imputer = None
mappings: Dict[str, Dict[str, Any]] = {}
MODEL_LOAD_ERROR: Optional[str] = None

try:
    for name, fname in [
        ("Logistic Regression", "logistic_regression.joblib"),
        ("SVM", "svm.joblib"),
        ("Decision Tree", "decision_tree.joblib"),
        ("Random Forest", "random_forest.joblib"),
    ]:
        models[name] = joblib.load(os.path.join(MODELS_DIR, fname))
    scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))
    imputer = joblib.load(os.path.join(MODELS_DIR, "imputer.joblib"))
    mappings = joblib.load(os.path.join(MODELS_DIR, "mappings.joblib"))
    logger.info("Loaded models: %s", list(models.keys()))
except Exception as e:
    MODEL_LOAD_ERROR = str(e)
    logger.exception("Failed to load models")


def _ready() -> bool:
    return (
        bool(models)
        and scaler is not None
        and imputer is not None
        and bool(mappings)
        and MODEL_LOAD_ERROR is None
    )


class PatientInput(BaseModel):
    Age: float = Field(..., ge=1, le=120)
    Sex: str
    ChestPainType: str
    RestingBP: float = Field(..., ge=0, le=1000)
    Cholesterol: float = Field(..., ge=0, le=1000)
    FastingBS: int = Field(..., ge=0, le=1)
    RestingECG: str
    MaxHR: float = Field(..., ge=30, le=250)
    ExerciseAngina: str
    Oldpeak: float = Field(..., ge=-10, le=20)
    ST_Slope: str

    class Config:
        extra = "ignore"


EXPECTED_COLS = [
    "Age", "Sex", "ChestPainType", "RestingBP", "Cholesterol",
    "FastingBS", "RestingECG", "MaxHR", "ExerciseAngina",
    "Oldpeak", "ST_Slope",
]

LIMITS = {
    "Age": (1, 120),
    "RestingBP": (60, 250),
    "Cholesterol": (80, 600),
    "MaxHR": (50, 220),
    "Oldpeak": (-5, 10),
}


def preprocess_features(data: Any, is_batch: bool = False) -> pd.DataFrame:
    if is_batch:
        df = pd.DataFrame(data)
    else:
        df = pd.DataFrame([data])

    # Add any missing expected columns as NaN (not 0).
    for col in EXPECTED_COLS:
        if col not in df.columns:
            df[col] = np.nan

    # Map categorical features; unknown categories become NaN (validated later).
    for col, mapping in (mappings or {}).items():
        if col in df.columns:
            df[col] = df[col].map(mapping)

    # Coerce numeric columns to numeric.
    for col in ["Age", "RestingBP", "Cholesterol", "FastingBS", "MaxHR", "Oldpeak"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Treat 0 in Cholesterol/RestingBP as missing.
    for col in ["Cholesterol", "RestingBP"]:
        if col in df.columns:
            df[col] = df[col].replace(0, np.nan)

    # Clip to biological limits (after NaN conversion).
    for col, (lo, hi) in LIMITS.items():
        if col in df.columns:
            df[col] = df[col].clip(lower=lo, upper=hi)

    df = df[EXPECTED_COLS]

    if len(df) == 0:
        raise ValueError("Empty input: at least one row is required.")

    # Validate no all-NaN rows / unknown categories.
    if df[EXPECTED_COLS].isna().all(axis=1).any():
        raise ValueError("One or more rows contain no usable values.")

    # KNN imputation.
    df_imputed = pd.DataFrame(imputer.transform(df), columns=EXPECTED_COLS)
    return df_imputed


@app.get("/")
def read_root():
    return {"message": "Heart Disease Prediction API is running"}


@app.get("/health")
def health():
    return {"status": "ok" if _ready() else "degraded", "models_loaded": _ready()}


@app.post("/predict")
async def predict_single(data: PatientInput, model_name: str = Query("Random Forest")):
    if not _ready():
        raise HTTPException(status_code=503, detail="Models are not loaded on the server.")
    if model_name not in models:
        raise HTTPException(status_code=400, detail=f"Invalid model name. Choose one of: {list(models.keys())}")

    try:
        df = preprocess_features(data.dict())
        if model_name in ("Logistic Regression", "SVM"):
            X = scaler.transform(df)
        else:
            X = df.values
        model = models[model_name]
        prediction = int(model.predict(X)[0])
        proba = model.predict_proba(X)[0]
        # Pick positive-class (1) column robustly.
        classes = list(getattr(model, "classes_", [0, 1]))
        pos_idx = classes.index(1) if 1 in classes else -1
        probability = float(proba[pos_idx]) if pos_idx >= 0 and hasattr(model, "predict_proba") else None
        return {
            "model": model_name,
            "prediction": prediction,
            "probability": probability,
            "risk": "High" if prediction == 1 else "Low",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed. Check server logs.")


@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...), model_name: str = Query("Random Forest")):
    if not _ready():
        raise HTTPException(status_code=503, detail="Models are not loaded on the server.")
    if model_name not in models:
        raise HTTPException(status_code=400, detail=f"Invalid model name. Choose one of: {list(models.keys())}")

    # Size cap (~5 MB).
    MAX_BYTES = 5 * 1024 * 1024
    try:
        contents = await file.read()
        if len(contents) > MAX_BYTES:
            raise HTTPException(status_code=413, detail="File too large (max 5 MB).")
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        try:
            df_input = pd.read_csv(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

        if df_input.empty:
            raise HTTPException(status_code=400, detail="CSV contains no data rows.")

        df_processed = preprocess_features(df_input.to_dict(orient="list"), is_batch=True)

        if model_name in ("Logistic Regression", "SVM"):
            X = scaler.transform(df_processed)
        else:
            X = df_processed.values

        model = models[model_name]
        predictions = model.predict(X).astype(int).tolist()
        classes = list(getattr(model, "classes_", [0, 1]))
        pos_idx = classes.index(1) if 1 in classes else -1
        probabilities = (
            model.predict_proba(X)[:, pos_idx].tolist()
            if (pos_idx >= 0 and hasattr(model, "predict_proba"))
            else [None] * len(predictions)
        )

        results = []
        for i in range(len(predictions)):
            prob = probabilities[i]
            results.append({
                "patient_index": i,
                "prediction": predictions[i],
                "probability": float(prob) if prob is not None else None,
                "risk": "High" if predictions[i] == 1 else "Low",
            })

        return {
            "model": model_name,
            "results": results,
            "total_patients": len(results),
            "high_risk_count": sum(predictions),
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Batch prediction failed")
        raise HTTPException(status_code=500, detail="Batch prediction failed. Check server logs.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
