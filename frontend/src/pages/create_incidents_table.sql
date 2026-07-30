CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    reporter_id INTEGER NOT NULL REFERENCES users(id),
    description TEXT NOT NULL,
    incident_latitude REAL NOT NULL,
    incident_longitude REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'reported' CHECK(status IN ('reported', 'investigating', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);