# AI MATCHMAKER

Monorepo with a Next.js frontend and a FastAPI backend that serves a `/predict` endpoint for match probability.

## Prerequisites
- **Node.js** (for the frontend) and **npm**
- **Python 3.10+** (for the backend)
- Windows PowerShell (commands below are for Windows)

## Repo Structure
```
backend/   FastAPI app (main.py) + model artifacts
frontend/  Next.js app
```

## Backend (FastAPI)
> The backend expects these model files in `backend/`: `dating_rf_model.pkl`, `dating_scaler.pkl`, `expected_columns.pkl`.

1. Open a terminal in the repo root and run:
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
2. Start the API:
   ```powershell
   uvicorn main:app --reload
   ```
3. The API runs at `http://localhost:8000`. The frontend is allowed via CORS at `http://localhost:3000`.

### Endpoint
- `POST /predict`
  - Expects JSON body matching the `UserProfile` schema in `backend/main.py`.
  - Returns `match_probability_percentage`.

## Frontend (Next.js)
1. Open a terminal in the repo root and run:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:3000`.

## Notes
- If you change the backend URL or port, update the frontend to point to the new API base URL.
- If you need a full dependency lock for Python, add a `requirements.txt` later (e.g., `pip freeze > requirements.txt`).

## What is "environment setup"?
Environment setup means creating and activating an isolated Python environment (a **virtual environment**) so project dependencies don’t conflict with other projects. In this repo, the steps are:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
