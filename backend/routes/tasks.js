import express from 'express';
import pool from '../db/pool.js';
import { requireString, optionalString, requireDateString, optionalDateString, optionalInt, optionalBoolean } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function validatePriority(priority) {
  if (priority === undefined || priority === null) return null;
  if (!VALID_PRIORITIES.includes(priority)) {
    return `priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }
  return null;
}

// --- Tags (many-to-many with tasks) ---

// POST assign a tag to a task
router.post('/:taskId/tags', asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { tag_id } = req.body;

  if (!Number.isInteger(tag_id)) {
    return res.status(400).json({ error: 'tag_id is required and must be an integer' });
  }

  const result = await pool.query(
    `INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)
     ON CONFLICT (task_id, tag_id) DO NOTHING
     RETURNING *`,
    [taskId, tag_id]
  );
  res.status(201).json(result.rows[0] || { task_id: Number(taskId), tag_id, already_existed: true });
}));

// DELETE remove a tag from a task
router.delete('/:taskId/tags/:tagId', asyncHandler(async (req, res) => {
  const { taskId, tagId } = req.params;
  const result = await pool.query(
    `DELETE FROM task_tags WHERE task_id = $1 AND tag_id = $2 RETURNING *`,
    [taskId, tagId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Tag was not assigned to this task' });
  res.json({ message: 'Tag removed from task' });
}));

// GET all tasks (optionally filter by due_date for calendar view)
router.get('/', asyncHandler(async (req, res) => {
  const { due_date } = req.query;
  let result;
  if (due_date) {
    result = await pool.query(
      `SELECT * FROM tasks WHERE due_date = $1 ORDER BY created_at DESC`,
      [due_date]
    );
  } else {
    result = await pool.query(`SELECT * FROM tasks ORDER BY due_date ASC`);
  }
  res.json(result.rows);
}));

// GET single task with its subtasks
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const taskResult = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
  if (taskResult.rows.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const subtasksResult = await pool.query(
    `SELECT * FROM subtasks WHERE task_id = $1 ORDER BY id ASC`,
    [id]
  );
  const tagsResult = await pool.query(
    `SELECT t.id, t.name, t.color FROM tags t
     JOIN task_tags tt ON tt.tag_id = t.id
     WHERE tt.task_id = $1`,
    [id]
  );
  res.json({ ...taskResult.rows[0], subtasks: subtasksResult.rows, tags: tagsResult.rows });
}));

// POST new task
router.post('/', asyncHandler(async (req, res) => {
  const { title, due_date, goal_id, completed, priority } = req.body;

  const titleError = requireString(title, 'title');
  if (titleError) return res.status(400).json({ error: titleError });

  const dateError = requireDateString(due_date, 'due_date');
  if (dateError) return res.status(400).json({ error: dateError });

  const goalIdError = optionalInt(goal_id, 'goal_id');
  if (goalIdError) return res.status(400).json({ error: goalIdError });

  const completedError = optionalBoolean(completed, 'completed');
  if (completedError) return res.status(400).json({ error: completedError });

  const priorityError = validatePriority(priority);
  if (priorityError) return res.status(400).json({ error: priorityError });

  const result = await pool.query(
    `INSERT INTO tasks (title, due_date, goal_id, completed, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, due_date, goal_id || null, completed || false, priority || 'medium']
  );
  res.status(201).json(result.rows[0]);
}));

// PATCH task (toggle completed, edit title/due_date/goal_id)
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, due_date, goal_id, completed, priority } = req.body;

  const titleError = optionalString(title, 'title');
  if (titleError) return res.status(400).json({ error: titleError });

  const dateError = optionalDateString(due_date, 'due_date');
  if (dateError) return res.status(400).json({ error: dateError });

  const goalIdError = optionalInt(goal_id, 'goal_id');
  if (goalIdError) return res.status(400).json({ error: goalIdError });

  const completedError = optionalBoolean(completed, 'completed');
  if (completedError) return res.status(400).json({ error: completedError });

  const priorityError = validatePriority(priority);
  if (priorityError) return res.status(400).json({ error: priorityError });

  const result = await pool.query(
    `UPDATE tasks SET
      title = COALESCE($1, title),
      due_date = COALESCE($2, due_date),
      goal_id = COALESCE($3, goal_id),
      completed = COALESCE($4, completed),
      priority = COALESCE($5, priority)
    WHERE id = $6 RETURNING *`,
    [title, due_date, goal_id, completed, priority, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
  res.json(result.rows[0]);
}));

// DELETE task
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`DELETE FROM tasks WHERE id = $1 RETURNING *`, [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Task deleted' });
}));

// --- Subtasks (nested under a task) ---

// POST new subtask
router.post('/:taskId/subtasks', asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;

  const textError = requireString(text, 'text');
  if (textError) return res.status(400).json({ error: textError });

  const result = await pool.query(
    `INSERT INTO subtasks (task_id, text) VALUES ($1, $2) RETURNING *`,
    [taskId, text]
  );
  res.status(201).json(result.rows[0]);
}));

// PATCH subtask (toggle checked)
router.patch('/:taskId/subtasks/:subtaskId', asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;
  const { checked, text } = req.body;

  const checkedError = optionalBoolean(checked, 'checked');
  if (checkedError) return res.status(400).json({ error: checkedError });

  const textError = optionalString(text, 'text');
  if (textError) return res.status(400).json({ error: textError });

  const result = await pool.query(
    `UPDATE subtasks SET
      checked = COALESCE($1, checked),
      text = COALESCE($2, text)
     WHERE id = $3 RETURNING *`,
    [checked, text, subtaskId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Subtask not found' });
  res.json(result.rows[0]);
}));

// DELETE subtask
router.delete('/:taskId/subtasks/:subtaskId', asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;
  const result = await pool.query(`DELETE FROM subtasks WHERE id = $1 RETURNING *`, [subtaskId]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Subtask not found' });
  res.json({ message: 'Subtask deleted' });
}));

export default router;
