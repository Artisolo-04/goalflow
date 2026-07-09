ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_color_check;
ALTER TABLE tags ADD CONSTRAINT tags_color_check
  CHECK (color IN ('gray','red','orange','amber','green','teal','cyan','blue','indigo','purple','pink','rose'));

ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_color_check;
ALTER TABLE goals ADD CONSTRAINT goals_color_check
  CHECK (color IN ('gray','red','orange','amber','green','teal','cyan','blue','indigo','purple','pink','rose'));
