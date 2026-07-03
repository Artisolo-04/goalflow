const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchTags() {
  const res = await fetch(`${BASE_URL}/api/tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

export async function createTag({ name, color }) {
  const res = await fetch(`${BASE_URL}/api/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) throw new Error('Failed to create tag');
  return res.json();
}

export async function deleteTag(id) {
  const res = await fetch(`${BASE_URL}/api/tags/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete tag');
  return res.json();
}

export async function assignTagToTask(taskId, tagId) {
  const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag_id: tagId }),
  });
  if (!res.ok) throw new Error('Failed to assign tag');
  return res.json();
}

export async function removeTagFromTask(taskId, tagId) {
  const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/tags/${tagId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove tag');
  return res.json();
}
