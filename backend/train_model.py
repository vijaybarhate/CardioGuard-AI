import os
import argparse
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

LIMITS = {
    "Age": (1, 120),
    "RestingBP": (60, 250),
    "Cholesterol": (80, 600),
    "MaxHR": (50, 220),
    "Oldpeak": (-5, 10),
}

mappings = {
    "Sex": {"M": 0, "F": 1},
    "ChestPainType": {"ATA": 0, "NAP": 1, "ASY": 2, "TA": 3},
    "RestingECG": {"Normal": 0, "ST": 1, "LVH": 2},
    "ExerciseAngina": {"N": 0, "Y": 1},
    "ST_Slope": {"Up": 0, "Flat": 1, "Down": 2},
}

EXPECTED_COLS = [
    "Age", "Sex", "ChestPainType", "RestingBP", "Cholesterol",
    "FastingBS", "RestingECG", "MaxHR", "ExerciseAngina",
    "Oldpeak", "ST_Slope", "HeartDisease",
]


def clip_values(df: pd.DataFrame) -> pd.DataFrame:
    for col, (lo, hi) in LIMITS.items():
        if col in df.columns:
            df[col] = df[col].clip(lower=lo, upper=hi)
    return df


def main(data_path: str):
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found: {data_path}")

    os.makedirs(MODELS_DIR, exist_ok=True)

    df = pd.read_csv(data_path)
    missing_cols = [c for c in EXPECTED_COLS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset missing columns: {missing_cols}")

    for col, mapping in mappings.items():
        df[col] = df[col].map(mapping)

    X = df.drop("HeartDisease", axis=1)
    y = df["HeartDisease"]

    # Treat 0 as missing for these.
    X["Cholesterol"] = X["Cholesterol"].replace(0, np.nan)
    X["RestingBP"] = X["RestingBP"].replace(0, np.nan)

    # Clip to biological limits (consistent with inference).
    X = clip_values(X)

    imputer = KNNImputer(n_neighbors=3)
    X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X_imputed, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    lr = LogisticRegression(solver="liblinear", max_iter=2000, random_state=42)
    lr.fit(X_train_scaled, y_train)
    lr_acc = accuracy_score(y_test, lr.predict(X_test_scaled))

    svm = SVC(kernel="rbf", probability=True, random_state=42)
    svm.fit(X_train_scaled, y_train)
    svm_acc = accuracy_score(y_test, svm.predict(X_test_scaled))

    dt = DecisionTreeClassifier(max_depth=5, min_samples_split=2, class_weight="balanced", random_state=42)
    dt.fit(X_train, y_train)
    dt_acc = accuracy_score(y_test, dt.predict(X_test))

    rf = RandomForestClassifier(n_estimators=300, max_depth=9, class_weight="balanced", random_state=42)
    rf.fit(X_train, y_train)
    rf_acc = accuracy_score(y_test, rf.predict(X_test))

    print(f"Logistic Regression Accuracy: {lr_acc:.4f}")
    print(f"SVM Accuracy: {svm_acc:.4f}")
    print(f"Decision Tree Accuracy: {dt_acc:.4f}")
    print(f"Random Forest Accuracy: {rf_acc:.4f}")

    joblib.dump(lr, os.path.join(MODELS_DIR, "logistic_regression.joblib"))
    joblib.dump(svm, os.path.join(MODELS_DIR, "svm.joblib"))
    joblib.dump(dt, os.path.join(MODELS_DIR, "decision_tree.joblib"))
    joblib.dump(rf, os.path.join(MODELS_DIR, "random_forest.joblib"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.joblib"))
    joblib.dump(imputer, os.path.join(MODELS_DIR, "imputer.joblib"))
    joblib.dump(mappings, os.path.join(MODELS_DIR, "mappings.joblib"))

    print("All models and preprocessing objects saved successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default=os.path.join(BASE_DIR, "heart.csv"), help="Path to heart.csv")
    args = parser.parse_args()
    main(args.data)
