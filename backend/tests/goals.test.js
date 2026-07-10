import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../server.js';
import pool from '../db/pool.js';

const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
const createdGoalIds = [];
const createdTagIds = [];

after(async () => {
  if (createdGoalIds.length) await pool.query(`DELETE FROM goals WHERE id = ANY($1::int[])`, [createdGoalIds]);
  if (createdTagIds.length) await pool.query(`DELETE FROM tags WHERE id = ANY($1::int[])`, [createdTagIds]);
  await pool.end();
});

describe('POST /api/goals', () => {
  test('creates a goal with a valid title and defaults color to gray', async () => {
    const res = await request(app).post('/api/goals').send({ title: `TEST goal ${suffix}` });
    assert.equal(res.status, 201);
    assert.equal(res.body.color, 'gray');
    assert.equal(res.body.title, `TEST goal ${suffix}`);
    createdGoalIds.push(res.body.id);
  });

  test('rejects a missing title', async () => {
    const res = await request(app).post('/api/goals').send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'title is required and must be a non-empty string');
  });

  test('rejects an invalid color', async () => {
    const res = await request(app).post('/api/goals').send({ title: `TEST ${suffix}`, color: 'not-a-color' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /color must be one of/);
  });

  test('rejects a malformed target_date', async () => {
    const res = await request(app).post('/api/goals').send({ title: `TEST ${suffix}`, target_date: '07-10-2026' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /target_date/);
  });

  test('accepts an optional description', async () => {
    const res = await request(app).post('/api/goals').send({ title: `TEST desc ${suffix}`, description: 'Because reasons' });
    assert.equal(res.status, 201);
    assert.equal(res.body.description, 'Because reasons');
    createdGoalIds.push(res.body.id);
  });
});

describe('PATCH /api/goals/:id', () => {
  let goalId;

  before(async () => {
    const res = await request(app).post('/api/goals').send({ title: `TEST patch ${suffix}` });
    goalId = res.body.id;
    createdGoalIds.push(goalId);
  });

  test('updates the title', async () => {
    const res = await request(app).patch(`/api/goals/${goalId}`).send({ title: 'Updated title' });
    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Updated title');
  });

  test('rejects an empty update body', async () => {
    const res = await request(app).patch(`/api/goals/${goalId}`).send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'No fields provided to update');
  });

  test('returns 404 for a nonexistent goal', async () => {
    const res = await request(app).patch('/api/goals/999999999').send({ title: 'x' });
    assert.equal(res.status, 404);
  });

  test('rejects an invalid color on update', async () => {
    const res = await request(app).patch(`/api/goals/${goalId}`).send({ color: 'nope' });
    assert.equal(res.status, 400);
  });
});

describe('DELETE /api/goals/:id', () => {
  test('deletes an existing goal', async () => {
    const created = await request(app).post('/api/goals').send({ title: `TEST delete ${suffix}` });
    const res = await request(app).delete(`/api/goals/${created.body.id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Goal deleted');
  });

  test('returns 404 when deleting a nonexistent goal', async () => {
    const res = await request(app).delete('/api/goals/999999999');
    assert.equal(res.status, 404);
  });
});

describe('Goal tags', () => {
  let goalId;
  let tagId;

  before(async () => {
    const goalRes = await request(app).post('/api/goals').send({ title: `TEST tags goal ${suffix}` });
    goalId = goalRes.body.id;
    createdGoalIds.push(goalId);

    const tagRes = await request(app).post('/api/tags').send({ name: `TEST-tag-${suffix}` });
    tagId = tagRes.body.id;
    createdTagIds.push(tagId);
  });

  test('attaches a tag to a goal', async () => {
    const res = await request(app).post(`/api/goals/${goalId}/tags`).send({ tag_id: tagId });
    assert.equal(res.status, 201);
  });

  test('attaching the same tag again reports already_existed', async () => {
    const res = await request(app).post(`/api/goals/${goalId}/tags`).send({ tag_id: tagId });
    assert.equal(res.status, 201);
    assert.equal(res.body.already_existed, true);
  });

  test('rejects a non-integer tag_id', async () => {
    const res = await request(app).post(`/api/goals/${goalId}/tags`).send({ tag_id: 'abc' });
    assert.equal(res.status, 400);
  });

  test('removes a tag from a goal', async () => {
    const res = await request(app).delete(`/api/goals/${goalId}/tags/${tagId}`);
    assert.equal(res.status, 200);
  });

  test('returns 404 removing a tag that is not assigned', async () => {
    const res = await request(app).delete(`/api/goals/${goalId}/tags/${tagId}`);
    assert.equal(res.status, 404);
  });
});
