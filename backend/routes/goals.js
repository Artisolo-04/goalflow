import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// GET all goals, each with a live-computed progress percentage
router.get('/', async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST a new goal
router.post('/', async (req, res) => {
  const { title, target_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const result = await pool.query(
      `INSERT INTO goals (title, target_date) VALUES ($1, $2) RETURNING *`,
      [title, target_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

export default router;
