from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .data import DATA
from .ml import prospectivity, production, shortfall, anomaly
from .api.admin import router as admin_router
app=FastAPI(title="MANGANEX AI API",version="2.0.0",description="AI/ML and Earth-observation decision support for manganese exploration and production.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://manganex-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
class PredictionInput(BaseModel): values:dict[str,Any]=Field(default_factory=dict)
class SimulationInput(BaseModel): equipment_availability:float; mining_hours:float; rainfall:float; blasting_delay:float; ore_availability:float; active_equipment:float
class UploadInput(BaseModel): filename:str; category:str; rows:int; columns:list[str]
class ValidationInput(BaseModel): category:str; columns:list[str]
class RecommendationInput(BaseModel): context:dict[str,Any]=Field(default_factory=dict)
class ReportInput(BaseModel): title:str; format:str
@app.get('/api/healthz')
def health(): return {'status':'ok','service':'manganex-api','ml_models':'ready'}
@app.get('/api/dashboard')
def dashboard(): return DATA['demoDashboard']
@app.get('/api/mines')
def mines(): return DATA['demoMines']
@app.get('/api/zones')
def zones(): return DATA['demoZones']
@app.get('/api/zones/{zone_id}')
def zone(zone_id:str):
    for z in DATA['demoZones']:
        if z['id']==zone_id:return z
    raise HTTPException(404,'Zone not found')
@app.get('/api/satellite')
def satellite(): return DATA['demoSatellite']
@app.get('/api/geology')
def geology(): return DATA['demoGeology']
@app.get('/api/production')
def production_history(): return DATA['demoProduction']
@app.get('/api/production/forecast')
def production_forecast(horizon:int=30):
    if horizon not in (7,14,30,90): horizon=30
    return {'horizon':horizon,'confidence':.82,'points':DATA['demoForecast']['points']}
@app.get('/api/shortfall')
def shortfall_get(): return DATA['demoShortfall']
@app.get('/api/equipment')
def equipment(): return DATA['demoEquipment']
@app.get('/api/alerts')
def alerts(): return DATA['demoAlerts']
@app.get('/api/recommendations')
def recommendations(): return DATA['demoRecommendations']
@app.get('/api/models')
def models(): return DATA['demoModels']
@app.post('/api/upload')
def upload(body:UploadInput):
    known={'latitude','longitude','manganese_grade','ndvi','lst','production','target','rainfall'}
    return {'filename':body.filename,'rows':body.rows,'columns':len(body.columns),'missing_values':0,'quality':.96,'detected_features':[c for c in body.columns if c.lower() in known]}
@app.post('/api/validate')
def validate(body:ValidationInput):
    req={'geology':['latitude','longitude','manganese_grade'],'satellite':['date','ndvi','lst'],'production':['date','production','target'],'equipment':['equipment_id','availability']}.get(body.category,[])
    errors=[f'Missing required column: {x}' for x in req if x not in body.columns]
    return {'valid':not errors,'errors':errors,'warnings':[] if not errors else ['Upload will be limited until schema is corrected.']}
@app.post('/api/predict/prospectivity')
def predict_prospectivity(body:PredictionInput):
    p=prospectivity(body.values); return {'score':round(p,4),'confidence':round(min(.97,.72+.25*p),4),'label':'High prospectivity' if p>=.7 else 'Moderate prospectivity','explanation':'Random Forest fusion of geological grade, geological score, satellite score and terrain score.'}
@app.post('/api/predict/production')
def predict_production(body:PredictionInput):
    p=production(body.values); return {'score':round(p,2),'confidence':.82,'label':'Production forecast','explanation':'Random Forest regression using equipment availability, rainfall and ore availability.'}
@app.post('/api/predict/shortfall')
def predict_shortfall(body:PredictionInput):
    p=shortfall(body.values); return {'score':round(p,4),'confidence':round(min(.96,.70+.25*(1-abs(.5-p)*2)),4),'label':'High risk' if p>=.6 else ('Elevated' if p>=.3 else 'Low risk'),'explanation':'Random Forest classifier using equipment availability, rainfall and ore availability.'}
@app.post('/api/anomaly')
def detect_anomaly(body:PredictionInput):
    flag,score=anomaly(body.values); return {'score':round(score,4),'confidence':.86,'label':'Anomaly detected' if flag else 'Normal operating pattern','explanation':'Isolation Forest on vibration, temperature, downtime and utilization.'}
@app.post('/api/simulate')
def simulate(body:SimulationInput):
    baseline=8420.; eff=max(.2,min(1,body.equipment_availability*.35+body.ore_availability*.35+body.active_equipment*.01+(.2-max(0,min(1,body.rainfall/150))*.2))); scenario=baseline*(.82+.28*eff)*(1-max(0,min(.2,body.blasting_delay/100))); recovered=max(0,scenario-baseline)
    return {'baseline':round(baseline,1),'scenario':round(scenario,1),'recovered':round(recovered,1),'shortfall_reduction':round(min(.95,recovered/2000),3),'risk_reduction':round(min(.8,recovered/4000),3)}
@app.post('/api/recommendations/generate')
def generate(body:RecommendationInput): return DATA['demoRecommendations']
@app.post('/api/reports',status_code=201)
def report(body:ReportInput):
    now=datetime.now(timezone.utc); return {'id':'rep-'+now.strftime('%Y%m%d%H%M%S'),'title':body.title,'format':body.format,'created_at':now.strftime('%d %b %Y · %H:%M')}
