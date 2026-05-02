from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


MODEL_DIR = Path(__file__).resolve().parents[1] / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "fraud_random_forest.pkl"
SAMPLE_DATA_PATH = MODEL_DIR / "training_sample.csv"


def generate_dataset(row_count: int = 1400) -> pd.DataFrame:
    rng = np.random.default_rng(42)

    transaction_amount = rng.normal(loc=520, scale=360, size=row_count).clip(15, 4800)
    time_since_last_order = rng.integers(1, 720, size=row_count)
    ip_mismatch_flag = rng.integers(0, 2, size=row_count)
    device_type_encoded = rng.integers(0, 3, size=row_count)
    historical_fraud_count = rng.integers(0, 6, size=row_count)

    base_risk = (
        (transaction_amount / 70)
        + ((45 - np.clip(time_since_last_order, 1, 45)) * 0.55)
        + (ip_mismatch_flag * 28)
        + (device_type_encoded == 1) * 6
        + (historical_fraud_count * 14)
        + rng.normal(0, 6, size=row_count)
    )

    fraud_label = (base_risk > 55).astype(int)

    dataset = pd.DataFrame(
        {
            "transaction_amount": transaction_amount.round(2),
            "time_since_last_order": time_since_last_order,
            "ip_mismatch_flag": ip_mismatch_flag,
            "device_type_encoded": device_type_encoded,
            "historical_fraud_count": historical_fraud_count,
            "fraud_label": fraud_label,
        }
    )
    return dataset


def train_model() -> None:
    dataset = generate_dataset()
    dataset.sample(40, random_state=7).sort_index().to_csv(SAMPLE_DATA_PATH, index=False)

    feature_columns = [
        "transaction_amount",
        "time_since_last_order",
        "ip_mismatch_flag",
        "device_type_encoded",
        "historical_fraud_count",
    ]

    X_train, X_test, y_train, y_test = train_test_split(
        dataset[feature_columns],
        dataset["fraud_label"],
        test_size=0.2,
        random_state=42,
        stratify=dataset["fraud_label"],
    )

    model = RandomForestClassifier(
        n_estimators=180,
        max_depth=10,
        min_samples_split=6,
        min_samples_leaf=2,
        random_state=42,
    )
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    joblib.dump(model, MODEL_PATH)

    print(f"Saved trained model to {MODEL_PATH}")
    print(f"Saved sample training data to {SAMPLE_DATA_PATH}")
    print(f"Validation accuracy: {accuracy:.3f}")


if __name__ == "__main__":
    train_model()
