import express from 'express';
import pool from '../db/pool.js';
import { requireString, optionalString, optionalDateString } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();
const VALID_COLORS = ['gray','red','orange','amber','green','teal','cyan','blue','indigo','purple','pink','rose'];

function validateColor(color) {
  if (color === undefined || color === null) return null;
  if (!VALID_COLORS.includes(color)) return `color must be one of: ${VALID_COLORS.join(', ')}`;
  return null;
}

// GET all goals, each with a live-computed progress percentage and its tags
router.get('/', asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      g.id,
      g.title,
      g.description,
      g.color,
      g.target_date,
      g.created_at,
      COALESCE(AVG(task_progress.score) * 100, 0) AS progress,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name, 'color', tg.color))
        FILTER (WHERE tg.id IS NOT NULL),
        '[]'
      ) AS tags
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
    LEFT JOIN goal_tags gt ON gt.goal_id = g.id
    LEFT JOIN tags tg ON tg.id = gt.tag_id
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
  const { title, target_date, description, color } = req.body;
  const titleError = requireString(title, 'title');
  if (titleError) return res.status(400).json({ error: titleError });
  const dateError = optionalDateString(target_date, 'target_date');
  if (dateError) return res.status(400).json({ error: dateError });
  const descError = optionalString(description, 'description');
  if (descError) return res.status(400).json({ error: descError });
  const colorError = validateColor(color);
  if (colorError) return res.status(400).json({ error: colorError });

  const result = await pool.query(
    `INSERT INTO goals (title, target_date, description, color) VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, target_date || null, description || null, color || 'gray']
  );
  res.status(201).json(result.rows[0]);
}));

// PATCH a goal (edit title / target_date / description / color)
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, target_date, description, color } = req.body;

  const titleError = optionalString(title, 'title');
  if (titleError) return res.status(400).json({ error: titleError });
  const dateError = optionalDateString(target_date, 'target_date');
  if (dateError) return res.status(400).json({ error: dateError });
  const descError = optionalString(description, 'description');
  if (descError) return res.status(400).json({ error: descError });
  const colorError = validateColor(color);
  if (colorError) return res.status(400).json({ error: colorError });

  const fields = [];
  const values = [];
  let idx = 1;
  if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
  if (target_date !== undefined) { fields.push(`target_date = $${idx++}`); values.push(target_date); }
  if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
  if (color !== undefined) { fields.push(`color = $${idx++}`); values.push(color); }
  if (fields.length === 0) return res.status(400).json({ error: 'No fields provided to update' });

  values.push(id);
  const result = await pool.query(`UPDATE goals SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
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

// --- Tags (many-to-many with goals) ---

router.post('/:goalId/tags', asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { tag_id } = req.body;
  if (!Number.isInteger(tag_id)) {
    return res.status(400).json({ error: 'tag_id is required and must be an integer' });
  }
  const result = await pool.query(
    `INSERT INTO goal_tags (goal_id, tag_id) VALUES ($1, $2)
     ON CONFLICT (goal_id, tag_id) DO NOTHING
     RETURNING *`,
    [goalId, tag_id]
  );
  res.status(201).json(result.rows[0] || { goal_id: Number(goalId), tag_id, already_existed: true });
}));

router.delete('/:goalId/tags/:tagId', asyncHandler(async (req, res) => {
  const { goalId, tagId } = req.params;
  const result = await pool.query(
    `DELETE FROM goal_tags WHERE goal_id = $1 AND tag_id = $2 RETURNING *`,
    [goalId, tagId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Tag was not assigned to this goal' });
  res.json({ message: 'Tag removed from goal' });
}));

export default router;
