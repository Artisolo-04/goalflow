import express from 'express';
import pool from '../db/pool.js';
import { requireString, optionalString, requireDateString, optionalDateString, optionalInt, optionalBoolean } from '../middleware/validate.js';

const router = express.Router();

// GET all tasks (optionally filter by due_date for calendar view)
router.get('/', async (req, res) => {
  const { due_date } = req.query;
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET single task with its subtasks
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const taskResult = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const subtasksResult = await pool.query(
      `SELECT * FROM subtasks WHERE task_id = $1 ORDER BY id ASC`,
      [id]
    );
    res.json({ ...taskResult.rows[0], subtasks: subtasksResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST new task
router.post('/', async (req, res) => {
  const { title, due_date, goal_id, completed } = req.body;

  const titleError = requireString(title, 'title');
  if (titleError) return res.status(400).json({ error: titleError });

  const dateError = requireDateString(due_date, 'due_date');
  if (dateError) return res.status(400).json({ error: dateError });

  const goalIdError = optionalInt(goal_id, 'goal_id');
  if (goalIdError) return res.status(400).json({ error: goalIdError });

  const completedError = optionalBoolean(completed, 'completed');
  if (completedError) return res.status(400).json({ error: completedError });

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, due_date, goal_id, completed) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, due_date, goal_id || null, completed || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH task (toggle completed, edit title/due_date/goal_id)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, due_date, goal_id, completed } = req.body;

  const titleError = optionalString(title, 'title');
  if (titleError) return res.status(400).json({ error: titleError });

  const dateError = optionalDateString(due_date, 'due_date');
  if (dateError) return res.status(400).json({ error: dateError });

  const goalIdError = optionalInt(goal_id, 'goal_id');
  if (goalIdError) return res.status(400).json({ error: goalIdError });

  const completedError = optionalBoolean(completed, 'completed');
  if (completedError) return res.status(400).json({ error: completedError });

  try {
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        due_date = COALESCE($2, due_date),
        goal_id = COALESCE($3, goal_id),
        completed = COALESCE($4, completed)
       WHERE id = $5 RETURNING *`,
      [title, due_date, goal_id, completed, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM tasks WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// --- Subtasks (nested under a task) ---

// POST new subtask
router.post('/:taskId/subtasks', async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;

  const textError = requireString(text, 'text');
  if (textError) return res.status(400).json({ error: textError });

  try {
    const result = await pool.query(
      `INSERT INTO subtasks (task_id, text) VALUES ($1, $2) RETURNING *`,
      [taskId, text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
});

// PATCH subtask (toggle checked)
router.patch('/:taskId/subtasks/:subtaskId', async (req, res) => {
  const { subtaskId } = req.params;
  const { checked, text } = req.body;

  const checkedError = optionalBoolean(checked, 'checked');
  if (checkedError) return res.status(400).json({ error: checkedError });

  const textError = optionalString(text, 'text');
  if (textError) return res.status(400).json({ error: textError });

  try {
    const result = await pool.query(
      `UPDATE subtasks SET
        checked = COALESCE($1, checked),
        text = COALESCE($2, text)
       WHERE id = $3 RETURNING *`,
      [checked, text, subtaskId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subtask not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

// DELETE subtask
router.delete('/:taskId/subtasks/:subtaskId', async (req, res) => {
  const { subtaskId } = req.params;
  try {
    const result = await pool.query(`DELETE FROM subtasks WHERE id = $1 RETURNING *`, [subtaskId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subtask not found' });
    res.json({ message: 'Subtask deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

export default router;
