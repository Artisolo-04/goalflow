import express from 'express';
import pool from '../db/pool.js';
import { requireString, optionalString } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

const VALID_COLORS = ['gray', 'blue', 'amber', 'green'];

function validateColor(color) {
  if (color === undefined || color === null) return null;
  if (!VALID_COLORS.includes(color)) {
    return `color must be one of: ${VALID_COLORS.join(', ')}`;
  }
  return null;
}

// GET all tags
router.get('/', asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM tags ORDER BY name ASC`);
  res.json(result.rows);
}));

// POST a new tag
router.post('/', asyncHandler(async (req, res) => {
  const { name, color } = req.body;

  const nameError = requireString(name, 'name');
  if (nameError) return res.status(400).json({ error: nameError });

  const colorError = validateColor(color);
  if (colorError) return res.status(400).json({ error: colorError });

  const result = await pool.query(
    `INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *`,
    [name, color || 'gray']
  );
  res.status(201).json(result.rows[0]);
}));

// DELETE a tag (removes it from any tasks it was attached to, via CASCADE)
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`DELETE FROM tags WHERE id = $1 RETURNING *`, [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Tag not found' });
  res.json({ message: 'Tag deleted' });
}));

export default router;
