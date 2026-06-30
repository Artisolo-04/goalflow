import express from 'express';
import pool from '../db/pool.js';
import { requireString, optionalString, optionalDateString } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

// GET all goals, each with a live-computed progress percentage
router.get('/', asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      g.id,
      g.title,
      g.target_date,
      g.created_at,
      COALESCE(AVG(task_progress.score) * 100, 0) AS progress
    FROM goals g
    LEFT JOIN (
      SELECT
        t.id AS task_id,
        t.goal_id,
        CASE
          WHEN COUNT(s.id) = 0 THEN (t.completed::int)::float
          ELSE AVG(s.checked::int)
        END AS score
      FROM tasks t
      LEFT JOIN subtasks s ON s.task_id = t.id
      GROUP BY t.id
    ) task_progress ON task_progress.goal_id = g.id
    GROUP BY g.id
    ORDER BY g.created_at DESC;
  `);
  const goals = result.rows.map(g => ({
    ...g,
    progress: Math.round(Number(g.progress)),
  }));
  res.json(goals);
}));

// POST a new goal
router.post('/', asyncHandler(async (req, res) => {
  const { title, target_date } = req.body;

  const titleError = requireString(title, 'title');
  if (titleError) return res.status(400).json({ error: titleError });

  const dateError = optionalDateString(target_date, 'target_date');
  if (dateError) return res.status(400).json({ error: dateError });

  const result = await pool.query(
    `INSERT INTO goals (title, target_date) VALUES ($1, $2) RETURNING *`,
    [title, target_date || null]
  );
  res.status(201).json(result.rows[0]);
}));

// PATCH a goal (edit title / target_date)
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, target_date } = req.body;

  const titleError = optionalString(title, 'title');
  if (titleError) return res.status(400).json({ error: titleError });

  const dateError = optionalDateString(target_date, 'target_date');
  if (dateError) return res.status(400).json({ error: dateError });

  const result = await pool.query(
    `UPDATE goals SET
      title = COALESCE($1, title),
      target_date = COALESCE($2, target_date)
     WHERE id = $3 RETURNING *`,
    [title, target_date, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found' });
  res.json(result.rows[0]);
}));

// DELETE a goal (tasks survive, orphaned via ON DELETE SET NULL on goal_id)
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`DELETE FROM goals WHERE id = $1 RETURNING *`, [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found' });
  res.json({ message: 'Goal deleted' });
}));

export default router;
