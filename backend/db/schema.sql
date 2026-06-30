-- goalflow database schema
-- Progress % is intentionally NOT stored anywhere here — it's always
-- computed live from task/subtask state. See backend query logic.

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    target_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subtasks (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    checked BOOLEAN DEFAULT false
);
