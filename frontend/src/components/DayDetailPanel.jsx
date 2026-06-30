import Checkbox from '../ui/Checkbox';
import { updateTask } from '../api/tasks';

function DayDetailPanel({ date, tasks, onChange }) {
  async function handleToggle(taskId, checked) {
    await updateTask(taskId, { completed: checked });
    onChange();
  }

  if (!date) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-gray-500">
        Select a day to see tasks due.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-gray-100 font-semibold text-sm">{date}</h3>
      {tasks.length === 0 ? (
        <p className="text-xs text-gray-500">No tasks due this day.</p>
      ) : (
        tasks.map((task) => (
          <Checkbox
            key={task.id}
            checked={task.completed}
            onChange={(e) => handleToggle(task.id, e.target.checked)}
            label={task.title}
          />
        ))
      )}
    </div>
  );
}

export default DayDetailPanel;
