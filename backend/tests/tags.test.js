import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../server.js';
import pool from '../db/pool.js';

const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
const createdTagIds = [];

after(async () => {
  if (createdTagIds.length) await pool.query(`DELETE FROM tags WHERE id = ANY($1::int[])`, [createdTagIds]);
  await pool.end();
});

describe('GET /api/tags', () => {
  test('returns tags with a task_count', async () => {
    const created = await request(app).post('/api/tags').send({ name: `TEST-list-${suffix}` });
    createdTagIds.push(created.body.id);
    const res = await request(app).get('/api/tags');
    assert.equal(res.status, 200);
    const tag = res.body.find(t => t.id === created.body.id);
    assert.equal(tag.task_count, 0);
  });
});

describe('POST /api/tags', () => {
  test('creates a tag with default color gray', async () => {
    const res = await request(app).post('/api/tags').send({ name: `TEST-create-${suffix}` });
    assert.equal(res.status, 201);
    assert.equal(res.body.color, 'gray');
    createdTagIds.push(res.body.id);
  });

  test('rejects a missing name', async () => {
    const res = await request(app).post('/api/tags').send({});
    assert.equal(res.status, 400);
  });

  test('rejects an invalid color', async () => {
    const res = await request(app).post('/api/tags').send({ name: `TEST-badcolor-${suffix}`, color: 'ultraviolet' });
    assert.equal(res.status, 400);
  });

  test('rejects a duplicate name with 409', async () => {
    const name = `TEST-dup-${suffix}`;
    const first = await request(app).post('/api/tags').send({ name });
    createdTagIds.push(first.body.id);
    const res = await request(app).post('/api/tags').send({ name });
    assert.equal(res.status, 409);
  });
});

describe('PATCH /api/tags/:id', () => {
  let tagId;

  before(async () => {
    const res = await request(app).post('/api/tags').send({ name: `TEST-patch-${suffix}` });
    tagId = res.body.id;
    createdTagIds.push(tagId);
  });

  test('renames a tag', async () => {
    const res = await request(app).patch(`/api/tags/${tagId}`).send({ name: `TEST-renamed-${suffix}` });
    assert.equal(res.status, 200);
    assert.equal(res.body.name, `TEST-renamed-${suffix}`);
  });

  test('recolors a tag', async () => {
    const res = await request(app).patch(`/api/tags/${tagId}`).send({ color: 'purple' });
    assert.equal(res.status, 200);
    assert.equal(res.body.color, 'purple');
  });

  test('rejects an empty-string name', async () => {
    const res = await request(app).patch(`/api/tags/${tagId}`).send({ name: '   ' });
    assert.equal(res.status, 400);
  });

  test('rejects an invalid color', async () => {
    const res = await request(app).patch(`/api/tags/${tagId}`).send({ color: 'ultraviolet' });
    assert.equal(res.status, 400);
  });

  test('returns 404 for a nonexistent tag', async () => {
    const res = await request(app).patch('/api/tags/999999999').send({ name: 'x' });
    assert.equal(res.status, 404);
  });

  test('returns 409 when renaming to a name already in use', async () => {
    const other = await request(app).post('/api/tags').send({ name: `TEST-other-${suffix}` });
    createdTagIds.push(other.body.id);
    const res = await request(app).patch(`/api/tags/${tagId}`).send({ name: `TEST-other-${suffix}` });
    assert.equal(res.status, 409);
  });
});

describe('DELETE /api/tags/:id', () => {
  test('deletes an existing tag', async () => {
    const created = await request(app).post('/api/tags').send({ name: `TEST-del-${suffix}` });
    const res = await request(app).delete(`/api/tags/${created.body.id}`);
    assert.equal(res.status, 200);
  });

  test('returns 404 deleting a nonexistent tag', async () => {
    const res = await request(app).delete('/api/tags/999999999');
    assert.equal(res.status, 404);
  });
});
