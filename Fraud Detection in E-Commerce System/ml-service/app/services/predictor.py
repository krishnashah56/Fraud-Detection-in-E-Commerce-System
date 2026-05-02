from __future__ import annotations

import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


class FraudPredictor:
    def __init__(self, model_path: str | None = None) -> None:
        default_model_path = (
            Path(__file__).resolve().parents[1] / "model" / "fraud_random_forest.pkl"
        )
        resolved_path = Path(model_path or os.getenv("MODEL_PATH", default_model_path))
        if not resolved_path.is_absolute():
            resolved_path = Path(__file__).resolve().parents[2] / resolved_path

        self.model_path = resolved_path
        self.model = None

    def load(self) -> None:
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model file was not found at {self.model_path}. Run the training script first."
            )

        self.model = joblib.load(self.model_path)

    def predict(
        self,
        transaction_amount: float,
        time_since_last_order: float,
        ip_mismatch_flag: int,
        device_type_encoded: int,
        historical_fraud_count: int,
    ) -> dict[str, float | str]:
        if self.model is None:
            self.load()

        features = pd.DataFrame(
            [
                {
                    "transaction_amount": transaction_amount,
                    "time_since_last_order": time_since_last_order,
                    "ip_mismatch_flag": ip_mismatch_flag,
                    "device_type_encoded": device_type_encoded,
                    "historical_fraud_count": historical_fraud_count,
                }
            ]
        )

        probability = float(self.model.predict_proba(features)[0][1] * 100)
        probability = round(max(0.0, min(probability, 100.0)), 2)

        if probability > 85:
            risk_level = "CRITICAL"
            recommended_action = "BLOCK"
        elif probability >= 60:
            risk_level = "HIGH"
            recommended_action = "REVIEW"
        elif probability >= 35:
            risk_level = "MEDIUM"
            recommended_action = "ALLOW"
        else:
            risk_level = "LOW"
            recommended_action = "ALLOW"

        return {
            "fraud_probability_score": probability,
            "risk_level": risk_level,
            "recommended_action": recommended_action,
        }
