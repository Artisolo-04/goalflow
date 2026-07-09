ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT 'gray';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goals_color_check'
  ) THEN
    ALTER TABLE goals
      ADD CONSTRAINT goals_color_check
      CHECK (color IN ('gray', 'blue', 'amber', 'green'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS goal_tags (
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (goal_id, tag_id)
);
