from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..data import DATA

router = APIRouter(prefix="/api/admin", tags=["admin"] )

class AdminLoginInput(BaseModel):
    email: str
    password: str

def _now_label() -> str:
    return datetime.now(timezone.utc).strftime("%d %b %Y · %H:%M UTC")

@router.post("/login")
def admin_login(body: AdminLoginInput) -> dict[str, Any]:
    expected_email = os.getenv("MANGANEX_ADMIN_EMAIL", "admin@manganex.ai")
    expected_password = os.getenv("MANGANEX_ADMIN_PASSWORD", "demo-admin")
    if body.email.strip().lower() != expected_email.lower() or body.password != expected_password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {"authenticated": True, "role": "admin", "workspace": "SIH Evaluation Cell"}

@router.get("/overview")
def admin_overview():
    alerts = DATA["demoAlerts"]
    return {
        "workspace": {"name": "SIH Evaluation Cell", "status": "Operational"},
        "members": {"total": 5, "admins": 1, "observers": 4, "active_sessions": 1},
        "alerts": {
            "total": len(alerts),
            "open": sum(not a.get("acknowledged", False) for a in alerts),
            "critical": sum(a.get("severity") == "Critical" and not a.get("acknowledged", False) for a in alerts),
            "warning": sum(a.get("severity") == "Warning" and not a.get("acknowledged", False) for a in alerts),
        },
        "services": [
            {"name": "FastAPI", "status": "Operational", "latency_ms": 42},
            {"name": "ML inference", "status": "Operational", "latency_ms": 118},
            {"name": "PostGIS", "status": "Demo mode", "latency_ms": 0},
            {"name": "Satellite feed", "status": "Demo dataset", "latency_ms": 0},
        ],
        "audit_events": 24,
        "last_backup": "Today · 05:30 IST",
    }

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    for alert in DATA["demoAlerts"]:
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
            alert["acknowledged_at"] = _now_label()
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    for alert in DATA["demoAlerts"]:
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
            alert["status"] = "Resolved"
            alert["resolved_at"] = _now_label()
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/alerts/test")
def create_test_alert():
    now = datetime.now(timezone.utc)
    alert = {
        "id": "test-" + now.strftime("%H%M%S%f"),
        "severity": "Warning",
        "title": "Admin test alert",
        "detail": "A test signal was generated from the admin control room.",
        "timestamp": "Just now",
        "acknowledged": False,
    }
    DATA["demoAlerts"].insert(0, alert)
    return alert
