from pydantic import BaseModel, Field


class FraudPredictionRequest(BaseModel):
    transaction_amount: float = Field(..., ge=0)
    time_since_last_order: float = Field(..., ge=0)
    ip_mismatch_flag: int = Field(..., ge=0, le=1)
    device_type_encoded: int = Field(..., ge=0, le=2)
    historical_fraud_count: int = Field(..., ge=0)


class FraudPredictionResponse(BaseModel):
    fraud_probability_score: float
    risk_level: str
    recommended_action: str
