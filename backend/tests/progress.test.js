import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../server.js';
import pool from '../db/pool.js';

let goalId;
let emptyGoalId;
const taskIds = [];

before(async () => {
  const goalResult = await pool.query(`INSERT INTO goals (title) VALUES ('TEST: progress goal') RETURNING id`);
  goalId = goalResult.rows[0].id;

  const emptyGoalResult = await pool.query(`INSERT INTO goals (title) VALUES ('TEST: empty goal') RETURNING id`);
  emptyGoalId = emptyGoalResult.rows[0].id;

  const t1 = await pool.query(`INSERT INTO tasks (title, due_date, goal_id, completed) VALUES ('t1', '2026-01-01', $1, true) RETURNING id`, [goalId]);
  taskIds.push(t1.rows[0].id);

  const t2 = await pool.query(`INSERT INTO tasks (title, due_date, goal_id, completed) VALUES ('t2', '2026-01-01', $1, false) RETURNING id`, [goalId]);
  taskIds.push(t2.rows[0].id);

  const t3 = await pool.query(`INSERT INTO tasks (title, due_date, goal_id) VALUES ('t3', '2026-01-01', $1) RETURNING id`, [goalId]);
  taskIds.push(t3.rows[0].id);
  await pool.query(`INSERT INTO subtasks (task_id, text, checked) VALUES ($1, 's1', true)`, [t3.rows[0].id]);
  await pool.query(`INSERT INTO subtasks (task_id, text, checked) VALUES ($1, 's2', true)`, [t3.rows[0].id]);
  await pool.query(`INSERT INTO subtasks (task_id, text, checked) VALUES ($1, 's3', false)`, [t3.rows[0].id]);
  await pool.query(`INSERT INTO subtasks (task_id, text, checked) VALUES ($1, 's4', false)`, [t3.rows[0].id]);

  const t4 = await pool.query(`INSERT INTO tasks (title, due_date, goal_id) VALUES ('t4', '2026-01-01', $1) RETURNING id`, [goalId]);
  taskIds.push(t4.rows[0].id);
  await pool.query(`INSERT INTO subtasks (task_id, text, checked) VALUES ($1, 's1', true)`, [t4.rows[0].id]);
  await pool.query(`INSERT INTO subtasks (task_id, text, checked) VALUES ($1, 's2', true)`, [t4.rows[0].id]);
});

after(async () => {
  await pool.query(`DELETE FROM goals WHERE id = ANY($1::int[])`, [[goalId, emptyGoalId]]);
  await pool.end();
});

test('goal progress correctly averages task completion, weighting each task equally', async () => {
  const result = await pool.query(`
    SELECT g.id, COALESCE(AVG(task_progress.score) * 100, 0) AS progress
    FROM goals g
    LEFT JOIN (
      SELECT t.id AS task_id, t.goal_id,
        CASE WHEN COUNT(s.id) = 0 THEN (t.completed::int)::float ELSE AVG(s.checked::int) END AS score
      FROM tasks t LEFT JOIN subtasks s ON s.task_id = t.id GROUP BY t.id
    ) task_progress ON task_progress.goal_id = g.id
    WHERE g.id = $1 GROUP BY g.id;
  `, [goalId]);

  assert.equal(Number(result.rows[0].progress), 62.5);
});

test('a task with zero subtasks and completed=false contributes exactly 0', async () => {
  const result = await pool.query(`
    SELECT CASE WHEN COUNT(s.id) = 0 THEN (t.completed::int)::float ELSE AVG(s.checked::int) END AS score
    FROM tasks t LEFT JOIN subtasks s ON s.task_id = t.id WHERE t.id = $1 GROUP BY t.id;
  `, [taskIds[1]]);

  assert.equal(Number(result.rows[0].score), 0);
});

test('a task with zero subtasks and completed=true contributes exactly 1', async () => {
  const result = await pool.query(`
    SELECT CASE WHEN COUNT(s.id) = 0 THEN (t.completed::int)::float ELSE AVG(s.checked::int) END AS score
    FROM tasks t LEFT JOIN subtasks s ON s.task_id = t.id WHERE t.id = $1 GROUP BY t.id;
  `, [taskIds[0]]);

  assert.equal(Number(result.rows[0].score), 1);
});

test('a goal with no tasks has 0 progress, not null or an error', async () => {
  const result = await pool.query(`
    SELECT COALESCE(AVG(task_progress.score) * 100, 0) AS progress
    FROM goals g
    LEFT JOIN (
      SELECT t.id AS task_id, t.goal_id,
        CASE WHEN COUNT(s.id) = 0 THEN (t.completed::int)::float ELSE AVG(s.checked::int) END AS score
      FROM tasks t LEFT JOIN subtasks s ON s.task_id = t.id GROUP BY t.id
    ) task_progress ON task_progress.goal_id = g.id
    WHERE g.id = $1 GROUP BY g.id;
  `, [emptyGoalId]);

  assert.equal(Number(result.rows[0].progress), 0);
});

test('GET /api/goals returns the same progress, rounded, via the actual API', async () => {
  const res = await request(app).get('/api/goals');
  const goal = res.body.find(g => g.id === goalId);
  assert.equal(goal.progress, 63);
});
