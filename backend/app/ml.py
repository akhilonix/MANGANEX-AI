from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_DIR.mkdir(exist_ok=True)
MODEL_NAMES = ("prospectivity", "production", "shortfall", "anomaly")


class Models:
    """Train, save and load the four demo decision-support models."""

    def __init__(self, train: bool = True):
        if not train and self._all_saved():
            self.load()
        else:
            self._fit()

    @staticmethod
    def _all_saved() -> bool:
        return all((MODEL_DIR / f"{name}.joblib").exists() for name in MODEL_NAMES)

    def _fit(self) -> None:
        rng = np.random.default_rng(42)
        n = 600

        geology = rng.uniform(0.2, 1, n)
        satellite = rng.uniform(0.2, 1, n)
        terrain = rng.uniform(0.2, 1, n)
        grade = rng.uniform(5, 50, n)
        X = np.column_stack([geology, satellite, terrain, grade])
        y = ((0.38 * geology + 0.34 * satellite + 0.18 * terrain + 0.10 * (grade / 50)) > 0.58).astype(int)
        self.prospectivity = Pipeline([
            ("scale", StandardScaler()),
            ("model", RandomForestClassifier(n_estimators=180, random_state=42, class_weight="balanced")),
        ]).fit(X, y)

        Xp = np.column_stack([
            np.arange(n),
            rng.uniform(0.55, 0.98, n),
            rng.uniform(0, 150, n),
            rng.uniform(0.55, 1, n),
        ])
        yp = 7800 + 900 * Xp[:, 1] + 650 * Xp[:, 3] - 8 * Xp[:, 2] + rng.normal(0, 120, n)
        self.production = RandomForestRegressor(n_estimators=180, random_state=42).fit(Xp, yp)

        risk = ((1 - Xp[:, 1]) * 0.55 + (Xp[:, 2] / 150) * 0.25 + (1 - Xp[:, 3]) * 0.20 > 0.38).astype(int)
        self.shortfall = Pipeline([
            ("scale", StandardScaler()),
            ("model", RandomForestClassifier(n_estimators=180, random_state=42, class_weight="balanced")),
        ]).fit(Xp[:, 1:], risk)

        Xa = np.column_stack([
            rng.uniform(0.1, 2.5, 500),
            rng.uniform(45, 110, 500),
            rng.uniform(0, 30, 500),
            rng.uniform(0.4, 1, 500),
        ])
        self.anomaly = IsolationForest(n_estimators=180, contamination=0.08, random_state=42).fit(Xa)

    def save(self) -> None:
        for name in MODEL_NAMES:
            joblib.dump(getattr(self, name), MODEL_DIR / f"{name}.joblib")

    def load(self) -> None:
        for name in MODEL_NAMES:
            setattr(self, name, joblib.load(MODEL_DIR / f"{name}.joblib"))


MODELS = Models(train=not Models._all_saved())

def prospectivity(values: dict) -> float:
    X = np.array([[
        float(values.get("geological_score", 0.7)),
        float(values.get("satellite_score", 0.7)),
        float(values.get("terrain_score", 0.7)),
        float(values.get("manganese_grade", 30)),
    ]])
    return float(MODELS.prospectivity.predict_proba(X)[0, 1])


def production(values: dict) -> float:
    X = np.array([[
        float(values.get("day", 30)),
        float(values.get("equipment_availability", 0.87)),
        float(values.get("rainfall", 20)),
        float(values.get("ore_availability", 0.85)),
    ]])
    return float(MODELS.production.predict(X)[0])


def shortfall(values: dict) -> float:
    X = np.array([[
        float(values.get("equipment_availability", 0.87)),
        float(values.get("rainfall", 20)),
        float(values.get("ore_availability", 0.85)),
    ]])
    return float(MODELS.shortfall.predict_proba(X)[0, 1])


def anomaly(values: dict) -> tuple[bool, float]:
    X = np.array([[
        float(values.get("vibration", 0.8)),
        float(values.get("temperature", 70)),
        float(values.get("downtime_hours", 8)),
        float(values.get("utilization", 0.8)),
    ]])
    return int(MODELS.anomaly.predict(X)[0]) == -1, float(-MODELS.anomaly.decision_function(X)[0])
