const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchGoals() {
  const res = await fetch(`${BASE_URL}/api/goals`);
  if (!res.ok) throw new Error('Failed to fetch goals');
  return res.json();
}

export async function createGoal({ title, target_date }) {
  const res = await fetch(`${BASE_URL}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, target_date }),
  });
  if (!res.ok) throw new Error('Failed to create goal');
  return res.json();
}
