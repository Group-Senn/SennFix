ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS action_radius REAL DEFAULT 10; -- Radio de acción en kilómetros