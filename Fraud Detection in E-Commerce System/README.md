# Fraud Detection in E-Commerce System

Full-stack fraud detection demo with:

- `frontend`: React + Tailwind admin dashboard
- `backend`: Node.js + Express + MongoDB API
- `ml-service`: FastAPI fraud scoring service with a trained Random Forest model

## Folder Structure

```text
Fraud Detection in E-Commerce System/
|-- frontend/
|-- backend/
|-- ml-service/
`-- README.md
```

## Features

- Real-time admin dashboard with responsive fintech-style UI
- Sidebar navigation, KPI cards, fraud alerts, review queue, and Recharts visualization
- Dataset analyzer for CSV/XLSX batch fraud scoring
- Auto-refresh every 10 seconds
- Express APIs for stats, transactions, admin review, and checkout screening
- MongoDB collections for `Users`, `Transactions`, and `FraudLogs`
- FastAPI ML service exposing `POST /predict_fraud`
- Random Forest training script and generated model artifact
- Sample seed data for quick local setup

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string
- Python 3.10+

## Environment Setup

Copy the example environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ml-service/.env.example ml-service/.env
```

On Windows PowerShell, if `cp` is aliased differently, use:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item ml-service/.env.example ml-service/.env
```

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

If PowerShell blocks `npm.ps1`, use:

```powershell
cd backend
cmd /c npm install
```

### Frontend

```bash
cd frontend
npm install
```

If PowerShell blocks `npm.ps1`, use:

```powershell
cd frontend
cmd /c npm install
```

### ML Service

```bash
cd ml-service
python -m pip install -r requirements.txt
```

## Generate the Random Forest Model

The repository includes the training script. Run it once to produce the `.pkl` model and sample CSV:

```bash
cd ml-service
python app/services/train_model.py
```

This creates:

- `ml-service/app/model/fraud_random_forest.pkl`
- `ml-service/app/model/training_sample.csv`

## Seed Sample Data

```bash
cd backend
npm run seed
```

## Run the Services

### 1. ML Service

```bash
cd ml-service
uvicorn app.main:app --reload --port 8000
```

### 2. Backend API

```bash
cd backend
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm run dev
```

Open the frontend at [http://localhost:5173](http://localhost:5173).

## API Endpoints

### Admin

- `GET /api/admin/dashboard-stats`
- `GET /api/admin/recent-transactions`
- `POST /api/admin/analyze-dataset`
- `POST /api/admin/review-transaction`

### Checkout

- `POST /api/checkout`

### ML Service

- `POST /predict_fraud`

## Example Checkout Payload

```json
{
  "userId": "USR-1002",
  "amount": 1320.45,
  "ipAddress": "185.81.44.21",
  "deviceType": "mobile",
  "timeSinceLastOrder": 12
}
```

## Review Transaction Payload

```json
{
  "transactionId": "TXN-SAMPLE-0003",
  "action": "APPROVE",
  "reviewedBy": "fraud.analyst@finops.local",
  "reviewNotes": "Verified with user and allowed."
}
```

## Dataset Upload Analysis

Open the `Settings` section in the dashboard and upload a CSV or XLSX file with these columns:

- `transaction_amount`
- `time_since_last_order`
- `ip_mismatch_flag`
- `device_type_encoded`
- `historical_fraud_count`

The analyzer returns:

- Total uploaded rows
- Allow / Review / Block counts
- Average and max risk score
- Top risky rows
- Validation issues for bad rows

Sample file:

- `sample-data/batch-analysis-sample.csv`

## Notes

- Backend risk policy:
  - `risk_score > 85` -> `BLOCK`
  - `risk_score >= 60` and `<= 85` -> `REVIEW`
  - below `60` -> `ALLOW`
- Fraud logs are created during ML screening and during admin review actions.
- The dashboard polls every 10 seconds to keep stats and transactions fresh.
