export function dueDateInfo(dateStr, completed) {
  if (!dateStr) return { label: 'No date', tone: 'neutral' };

  const due = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((due - today) / msPerDay);

  if (completed) return { label: 'Done', tone: 'done' };
  if (diffDays === 0) return { label: 'Today', tone: 'today' };
  if (diffDays === 1) return { label: 'Tomorrow', tone: 'soon' };
  if (diffDays > 1 && diffDays <= 6) return { label: `In ${diffDays}d`, tone: 'soon' };
  if (diffDays > 6) return { label: dateStr, tone: 'neutral' };
  if (diffDays === -1) return { label: 'Overdue 1d', tone: 'overdue' };
  return { label: `Overdue ${Math.abs(diffDays)}d`, tone: 'overdue' };
}
