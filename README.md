# MANGANEX AI — VS Code / SIH Prototype

MANGANEX AI is a hackathon-ready manganese intelligence console combining Earth-observation signals, geology, terrain context, production forecasting, shortfall risk and equipment anomaly detection.

> **Demo note:** bundled data and credentials are synthetic. Predictions are decision-support signals, not certified mineral reserves. Replace demo data, credentials and in-memory alert storage with validated institutional services before operational deployment.

## Architecture

```text
React + Vite + Tailwind
        │
        │ /api proxy
        ▼
Python + FastAPI
   ├── ML inference (scikit-learn)
   ├── Admin/control-room API
   ├── Demo data service
   └── PostgreSQL/PostGIS-ready schema
```

## Project structure

```text
MANGANEX-AI-VSCode-Corrected/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── brand-logo.tsx
│       │   ├── console-ui.tsx
│       │   ├── error-boundary.tsx
│       │   └── ui/
│       ├── hooks/
│       ├── lib/
│       │   ├── api-client-react/
│       │   └── offline-demo.ts
│       ├── pages/
│       │   ├── Admin.tsx
│       │   ├── AdminLogin.tsx
│       │   └── not-found.tsx
│       ├── services/
│       │   └── adminService.ts
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── backend/
│   ├── app/
│   │   ├── api/admin.py
│   │   ├── services/
│   │   ├── data.py
│   │   ├── ml.py
│   │   └── main.py
│   ├── data/demo_data.json
│   ├── models/*.joblib
│   ├── database.sql
│   ├── requirements.txt
│   └── train_models.py
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Windows / VS Code setup

From the project root:

```powershell
cd "C:\Users\DELL\Desktop\MANGANEX-AI"

python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
python backend\train_models.py
python -m uvicorn backend.app.main:app --reload --port 8000
```

Open a **second terminal**:

```powershell
cd "C:\Users\DELL\Desktop\MANGANEX-AI\frontend"
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- FastAPI: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/healthz`

## Admin control room

Go to:

```text
http://localhost:5173/admin-login
```

Demo credentials are defined in `.env.example`:

```text
Email: admin@manganex.ai
Password: demo-admin
```

The Admin Panel is now separated into:

```text
frontend/src/pages/Admin.tsx
frontend/src/pages/AdminLogin.tsx
frontend/src/services/adminService.ts
backend/app/api/admin.py
```

Admin capabilities:

- Alert queue
- Critical/open/all filters
- Acknowledge alerts
- Resolve alerts
- Create a test alert
- System/service health
- AI model status
- Workspace/team identity
- Admin/observer counts
- Audit and backup indicators
- Demo admin login/logout

## API endpoints

### Core

```text
GET  /api/healthz
GET  /api/dashboard
GET  /api/mines
GET  /api/zones
GET  /api/satellite
GET  /api/geology
GET  /api/production
GET  /api/production/forecast
GET  /api/shortfall
GET  /api/equipment
GET  /api/alerts
GET  /api/recommendations
GET  /api/models
```

### AI

```text
POST /api/predict/prospectivity
POST /api/predict/production
POST /api/predict/shortfall
POST /api/anomaly
POST /api/simulate
```

### Admin

```text
POST /api/admin/login
GET  /api/admin/overview
POST /api/admin/alerts/{alert_id}/acknowledge
POST /api/admin/alerts/{alert_id}/resolve
POST /api/admin/alerts/test
```

## What was corrected

- Removed Replit-only `artifacts/`, mockup sandbox and workspace-specific packages.
- Kept one React/Vite frontend.
- Moved Admin UI into a dedicated page.
- Moved Admin login into a dedicated page.
- Moved Admin HTTP operations into `adminService.ts`.
- Moved Admin API routes into `backend/app/api/admin.py`.
- Added demo admin credential validation through FastAPI.
- Added a client-side demo session guard and logout.
- Extracted shared console UI primitives from the monolithic `App.tsx`.
- Removed `@ts-nocheck` and direct Replit `@workspace/*` imports.
- Fixed frontend prediction payload names so they match the FastAPI ML inputs.
- Added real scikit-learn implementations for prospectivity, production, shortfall and equipment anomaly signals.
- Model files are saved to `backend/models/` and loaded at runtime when present.
- Added PostGIS-ready admin, audit, workspace and notification tables.
- Removed generated Python `__pycache__` files from the source tree.

## Database

The project can run in demo mode without PostgreSQL. For institutional deployment, enable PostGIS and run `backend/database.sql`, then connect the FastAPI data layer to PostgreSQL/PostGIS.

## Important SIH note

The included datasets are synthetic demonstration data. For the final SIH story, clearly distinguish:

1. **Prototype/demo data** — bundled for offline reliability.
2. **Prepared satellite/geological datasets** — validated training inputs.
3. **Live Earth-observation integration** — future/production integration with appropriate data access and preprocessing.

Do not present synthetic predictions as measured reserves.
