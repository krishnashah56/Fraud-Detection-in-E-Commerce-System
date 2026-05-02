from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException

from app.schemas import FraudPredictionRequest, FraudPredictionResponse
from app.services.predictor import FraudPredictor

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional convenience dependency
    load_dotenv = lambda: None

load_dotenv()

app = FastAPI(title="Fraud Detection ML Service", version="1.0.0")
predictor = FraudPredictor(os.getenv("MODEL_PATH"))


@app.on_event("startup")
def load_model() -> None:
    predictor.load()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "fraud-detection-ml-service"}


@app.post("/predict_fraud", response_model=FraudPredictionResponse)
def predict_fraud(payload: FraudPredictionRequest) -> FraudPredictionResponse:
    try:
        result = predictor.predict(
            transaction_amount=payload.transaction_amount,
            time_since_last_order=payload.time_since_last_order,
            ip_mismatch_flag=payload.ip_mismatch_flag,
            device_type_encoded=payload.device_type_encoded,
            historical_fraud_count=payload.historical_fraud_count,
        )
        return FraudPredictionResponse(**result)
    except FileNotFoundError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {error}") from error
