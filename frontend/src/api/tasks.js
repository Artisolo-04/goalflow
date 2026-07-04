const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchTasks(due_date) {
  const url = due_date
    ? `${BASE_URL}/api/tasks?due_date=${due_date}`
    : `${BASE_URL}/api/tasks`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function fetchTaskById(id) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
}

export async function createTask({ title, due_date, goal_id, completed, priority }) {
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, due_date, goal_id, completed, priority }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export async function createSubtask(taskId, text) {
  const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to create subtask');
  return res.json();
}

export async function updateSubtask(taskId, subtaskId, updates) {
  const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update subtask');
  return res.json();
}

export async function deleteSubtask(taskId, subtaskId) {
  const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete subtask');
  return res.json();
}
