-- goalflow database schema
-- Progress % is intentionally NOT stored anywhere here — it's always
-- computed live from task/subtask state. See backend query logic.
-- Tags: user-defined labels, assignable to tasks (many-to-many)

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'gray' CHECK (color IN ('gray', 'blue', 'amber', 'green')),
    target_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    description TEXT,
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT false,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subtasks (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    checked BOOLEAN DEFAULT false
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT 'gray'
);

CREATE TABLE task_tags (
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

CREATE TABLE goal_tags (
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (goal_id, tag_id)
);
