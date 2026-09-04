-- MANGANEX AI PostgreSQL + PostGIS schema
-- Bundled values are synthetic demo data only.
-- Run this against PostgreSQL with PostGIS enabled for institutional deployments.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS mines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL,
  production_tonnes NUMERIC NOT NULL,
  target_tonnes NUMERIC NOT NULL,
  location GEOMETRY(Point, 4326)
);
CREATE TABLE IF NOT EXISTS geological_samples (
  id TEXT PRIMARY KEY,
  manganese_grade NUMERIC NOT NULL,
  rock_type TEXT NOT NULL,
  score NUMERIC NOT NULL,
  location GEOMETRY(Point, 4326)
);
CREATE TABLE IF NOT EXISTS satellite_observations (
  id SERIAL PRIMARY KEY,
  observed_on DATE NOT NULL,
  provider TEXT NOT NULL,
  ndvi NUMERIC,
  lst NUMERIC,
  soil_moisture NUMERIC,
  rainfall NUMERIC,
  cloud_coverage NUMERIC
);
CREATE TABLE IF NOT EXISTS prospectivity_zones (
  id TEXT PRIMARY KEY,
  area_sq_km NUMERIC NOT NULL,
  prospectivity NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  geological_score NUMERIC NOT NULL,
  satellite_score NUMERIC NOT NULL,
  terrain_score NUMERIC NOT NULL,
  potential_resource_mt NUMERIC NOT NULL,
  priority TEXT NOT NULL,
  validation_status TEXT NOT NULL,
  boundary GEOMETRY(Polygon, 4326)
);
CREATE TABLE IF NOT EXISTS production_records (
  id SERIAL PRIMARY KEY,
  recorded_on DATE NOT NULL,
  production_tonnes NUMERIC NOT NULL,
  target_tonnes NUMERIC NOT NULL
);
CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  equipment_type TEXT NOT NULL,
  status TEXT NOT NULL,
  availability NUMERIC NOT NULL,
  downtime_hours NUMERIC NOT NULL,
  zone_id TEXT,
  location GEOMETRY(Point, 4326)
);
CREATE TABLE IF NOT EXISTS equipment_events (
  id SERIAL PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(id),
  event_type TEXT NOT NULL,
  duration_hours NUMERIC NOT NULL,
  happened_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS forecast_results (
  id SERIAL PRIMARY KEY,
  horizon_days INTEGER NOT NULL,
  forecast_tonnes NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS shortfall_predictions (
  id SERIAL PRIMARY KEY,
  risk TEXT NOT NULL,
  probability NUMERIC NOT NULL,
  expected_shortfall_tonnes NUMERIC NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  expected_impact_tonnes NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Admin/control-room tables. These are ready for PostgreSQL-backed deployments.
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGSERIAL PRIMARY KEY,
  actor_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_settings (
  workspace_id TEXT PRIMARY KEY,
  workspace_name TEXT NOT NULL,
  primary_corridor TEXT,
  risk_threshold NUMERIC NOT NULL DEFAULT 0.25,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id TEXT NOT NULL REFERENCES admin_users(id),
  signal_type TEXT NOT NULL,
  delivery_mode TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (admin_user_id, signal_type)
);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
