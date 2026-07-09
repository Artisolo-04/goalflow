const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchGoals() {
  const res = await fetch(`${BASE_URL}/api/goals`);
  if (!res.ok) throw new Error('Failed to fetch goals');
  return res.json();
}

export async function createGoal({ title, target_date, description, color }) {
  const res = await fetch(`${BASE_URL}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, target_date, description, color }),
  });
  if (!res.ok) throw new Error('Failed to create goal');
  return res.json();
}

export async function updateGoal(id, updates) {
  const res = await fetch(`${BASE_URL}/api/goals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update goal');
  return res.json();
}

export async function deleteGoal(id) {
  const res = await fetch(`${BASE_URL}/api/goals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete goal');
  return res.json();
}

export async function assignTagToGoal(goalId, tagId) {
  const res = await fetch(`${BASE_URL}/api/goals/${goalId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag_id: tagId }),
  });
  if (!res.ok) throw new Error('Failed to assign tag');
  return res.json();
}

export async function removeTagFromGoal(goalId, tagId) {
  const res = await fetch(`${BASE_URL}/api/goals/${goalId}/tags/${tagId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove tag');
  return res.json();
}
