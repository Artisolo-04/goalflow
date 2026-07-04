-- Adds the priority field to an existing tasks table.
-- Safe to run on a database that already has data — existing rows
-- get 'medium' as a sensible default.
--
-- Run this once against your database, e.g.:
--   psql -U <your_user> -d <your_db> -f backend/db/migrations/001_add_task_priority.sql

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';

-- Enforce the same allowed values as fresh installs (schema.sql).
-- Wrapped in a DO block so re-running this file is a harmless no-op.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_priority_check'
  ) THEN
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_priority_check
      CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
END $$;
