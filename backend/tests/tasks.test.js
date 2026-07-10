import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../server.js';
import pool from '../db/pool.js';

const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
const createdTaskIds = [];
const createdGoalIds = [];
const createdTagIds = [];

after(async () => {
  if (createdTaskIds.length) await pool.query(`DELETE FROM tasks WHERE id = ANY($1::int[])`, [createdTaskIds]);
  if (createdGoalIds.length) await pool.query(`DELETE FROM goals WHERE id = ANY($1::int[])`, [createdGoalIds]);
  if (createdTagIds.length) await pool.query(`DELETE FROM tags WHERE id = ANY($1::int[])`, [createdTagIds]);
  await pool.end();
});

describe('POST /api/tasks', () => {
  test('creates a task with valid title/due_date, defaults priority to medium', async () => {
    const res = await request(app).post('/api/tasks').send({ title: `TEST task ${suffix}`, due_date: '2026-08-01' });
    assert.equal(res.status, 201);
    assert.equal(res.body.priority, 'medium');
    assert.equal(res.body.completed, false);
    createdTaskIds.push(res.body.id);
  });

  test('rejects a missing title', async () => {
    const res = await request(app).post('/api/tasks').send({ due_date: '2026-08-01' });
    assert.equal(res.status, 400);
  });

  test('rejects a missing due_date', async () => {
    const res = await request(app).post('/api/tasks').send({ title: `TEST ${suffix}` });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /due_date/);
  });

  test('rejects a malformed due_date', async () => {
    const res = await request(app).post('/api/tasks').send({ title: `TEST ${suffix}`, due_date: '08/01/2026' });
    assert.equal(res.status, 400);
  });

  test('rejects an invalid priority', async () => {
    const res = await request(app).post('/api/tasks').send({ title: `TEST ${suffix}`, due_date: '2026-08-01', priority: 'super-urgent' });
    assert.equal(res.status, 400);
  });

  test('links a task to a goal', async () => {
    const goalRes = await request(app).post('/api/goals').send({ title: `TEST goal for task ${suffix}` });
    createdGoalIds.push(goalRes.body.id);
    const res = await request(app).post('/api/tasks').send({ title: `TEST linked ${suffix}`, due_date: '2026-08-01', goal_id: goalRes.body.id });
    assert.equal(res.status, 201);
    assert.equal(res.body.goal_id, goalRes.body.id);
    createdTaskIds.push(res.body.id);
  });
});

describe('GET /api/tasks', () => {
  let taskId;

  before(async () => {
    const res = await request(app).post('/api/tasks').send({ title: `TEST filter ${suffix}`, due_date: '2026-09-15' });
    taskId = res.body.id;
    createdTaskIds.push(taskId);
  });

  test('filters by due_date', async () => {
    const res = await request(app).get('/api/tasks').query({ due_date: '2026-09-15' });
    assert.equal(res.status, 200);
    assert.ok(res.body.some(t => t.id === taskId));
  });

  test('includes a tags array on each task', async () => {
    const res = await request(app).get('/api/tasks').query({ due_date: '2026-09-15' });
    const task = res.body.find(t => t.id === taskId);
    assert.ok(Array.isArray(task.tags));
  });
});

describe('GET /api/tasks/:id', () => {
  test('returns the task with subtasks and tags', async () => {
    const created = await request(app).post('/api/tasks').send({ title: `TEST detail ${suffix}`, due_date: '2026-08-01' });
    createdTaskIds.push(created.body.id);
    const res = await request(app).get(`/api/tasks/${created.body.id}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.subtasks));
    assert.ok(Array.isArray(res.body.tags));
  });

  test('returns 404 for a nonexistent task', async () => {
    const res = await request(app).get('/api/tasks/999999999');
    assert.equal(res.status, 404);
  });
});

describe('PATCH /api/tasks/:id', () => {
  let taskId;
  let goalId;

  before(async () => {
    const goalRes = await request(app).post('/api/goals').send({ title: `TEST patch goal ${suffix}` });
    goalId = goalRes.body.id;
    createdGoalIds.push(goalId);

    const taskRes = await request(app).post('/api/tasks').send({ title: `TEST patch task ${suffix}`, due_date: '2026-08-01', goal_id: goalId });
    taskId = taskRes.body.id;
    createdTaskIds.push(taskId);
  });

  test('marks a task completed', async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}`).send({ completed: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.completed, true);
  });

  test('explicitly unlinks a goal by sending goal_id: null', async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}`).send({ goal_id: null });
    assert.equal(res.status, 200);
    assert.equal(res.body.goal_id, null);
  });

  test('rejects an empty update body', async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}`).send({});
    assert.equal(res.status, 400);
  });

  test('returns 404 for a nonexistent task', async () => {
    const res = await request(app).patch('/api/tasks/999999999').send({ completed: true });
    assert.equal(res.status, 404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  test('deletes an existing task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: `TEST delete ${suffix}`, due_date: '2026-08-01' });
    const res = await request(app).delete(`/api/tasks/${created.body.id}`);
    assert.equal(res.status, 200);
  });

  test('returns 404 deleting a nonexistent task', async () => {
    const res = await request(app).delete('/api/tasks/999999999');
    assert.equal(res.status, 404);
  });
});

describe('Subtasks', () => {
  let taskId;
  let subtaskId;

  before(async () => {
    const res = await request(app).post('/api/tasks').send({ title: `TEST subtasks ${suffix}`, due_date: '2026-08-01' });
    taskId = res.body.id;
    createdTaskIds.push(taskId);
  });

  test('creates a subtask', async () => {
    const res = await request(app).post(`/api/tasks/${taskId}/subtasks`).send({ text: 'Step one' });
    assert.equal(res.status, 201);
    assert.equal(res.body.checked, false);
    subtaskId = res.body.id;
  });

  test('rejects a subtask with no text', async () => {
    const res = await request(app).post(`/api/tasks/${taskId}/subtasks`).send({});
    assert.equal(res.status, 400);
  });

  test('toggles a subtask checked', async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}/subtasks/${subtaskId}`).send({ checked: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.checked, true);
  });

  test('returns 404 updating a nonexistent subtask', async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}/subtasks/999999999`).send({ checked: true });
    assert.equal(res.status, 404);
  });

  test('deletes a subtask', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`);
    assert.equal(res.status, 200);
  });

  test('returns 404 deleting a nonexistent subtask', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`);
    assert.equal(res.status, 404);
  });
});

describe('Task tags', () => {
  let taskId;
  let tagId;

  before(async () => {
    const taskRes = await request(app).post('/api/tasks').send({ title: `TEST task tags ${suffix}`, due_date: '2026-08-01' });
    taskId = taskRes.body.id;
    createdTaskIds.push(taskId);

    const tagRes = await request(app).post('/api/tags').send({ name: `TEST-task-tag-${suffix}` });
    tagId = tagRes.body.id;
    createdTagIds.push(tagId);
  });

  test('attaches a tag to a task', async () => {
    const res = await request(app).post(`/api/tasks/${taskId}/tags`).send({ tag_id: tagId });
    assert.equal(res.status, 201);
  });

  test('rejects a foreign-key violation for a nonexistent tag_id', async () => {
    const res = await request(app).post(`/api/tasks/${taskId}/tags`).send({ tag_id: 999999999 });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /does not exist/);
  });

  test('removes a tag from a task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}/tags/${tagId}`);
    assert.equal(res.status, 200);
  });

  test('returns 404 removing a tag that was never assigned', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}/tags/${tagId}`);
    assert.equal(res.status, 404);
  });
});
