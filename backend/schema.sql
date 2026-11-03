CREATE TABLE IF NOT EXISTS emergency_reports (
    id               SERIAL PRIMARY KEY,
    title            TEXT        NOT NULL,
    emergency_type   TEXT        NOT NULL,
    severity         TEXT        NOT NULL DEFAULT 'medium',
    reporter_name    TEXT        NOT NULL DEFAULT '',
    location         TEXT        NOT NULL DEFAULT '',
    summary          TEXT        NOT NULL DEFAULT '',
    actions_taken    TEXT        NOT NULL DEFAULT '',
    recommendations  TEXT        NOT NULL DEFAULT '',
    total_people     INTEGER     NOT NULL DEFAULT 0,
    evacuated        INTEGER     NOT NULL DEFAULT 0,
    casualties       INTEGER     NOT NULL DEFAULT 0,
    evacuation_secs  REAL,
    metrics          JSONB       NOT NULL DEFAULT '{}'::jsonb,   -- full simulator payload
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_created ON emergency_reports (created_at DESC);
