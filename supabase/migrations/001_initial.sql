-- Reports table: one row per scan
CREATE TABLE IF NOT EXISTS aeo_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain          TEXT NOT NULL,
  score           INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status          TEXT NOT NULL CHECK (status IN ('AI-Ready', 'Needs Work', 'Urgent Action Required')),
  checks          JSONB NOT NULL,  -- stores all 8 checkpoint results + metadata
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Leads table: one row per lead submission
CREATE TABLE IF NOT EXISTS aeo_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain          TEXT NOT NULL,
  email           TEXT NOT NULL,
  name            TEXT,
  phone           TEXT,
  selected_tier   TEXT CHECK (selected_tier IN ('Basic', 'Pro', 'Enterprise')),
  report_id       UUID REFERENCES aeo_reports(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Optional: email signups to save scan history
CREATE TABLE IF NOT EXISTS aeo_saved_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  report_id       UUID REFERENCES aeo_reports(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_aeo_reports_domain_created ON aeo_reports(domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aeo_leads_created ON aeo_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aeo_leads_email ON aeo_leads(email);

-- Analytics view: daily statistics
CREATE OR REPLACE VIEW daily_stats AS
SELECT
  DATE(created_at)                          AS scan_date,
  COUNT(*)                                  AS total_scans,
  ROUND(AVG(score), 1)                      AS avg_score,
  COUNT(CASE WHEN status = 'AI-Ready' THEN 1 END)               AS ai_ready_count,
  COUNT(CASE WHEN status = 'Needs Work' THEN 1 END)             AS needs_work_count,
  COUNT(CASE WHEN status = 'Urgent Action Required' THEN 1 END) AS urgent_count
FROM aeo_reports
GROUP BY DATE(created_at)
ORDER BY scan_date DESC;
