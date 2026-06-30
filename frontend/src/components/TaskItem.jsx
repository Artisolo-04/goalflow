import { useState } from 'react';
import Checkbox from '../ui/Checkbox';
import SubtaskChecklist from './SubtaskChecklist';
import { updateTask, deleteTask, fetchTaskById } from '../api/tasks';

function TaskItem({ task, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);

  async function loadSubtasks() {
    setLoadingSubtasks(true);
    const full = await fetchTaskById(task.id);
    setSubtasks(full.subtasks);
    setLoadingSubtasks(false);
  }

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next) await loadSubtasks();
  }

  async function handleToggleCompleted(checked) {
    await updateTask(task.id, { completed: checked });
    onChange();
  }

  async function handleDelete() {
    await deleteTask(task.id);
    onChange();
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Checkbox
          checked={task.completed}
          onChange={(e) => handleToggleCompleted(e.target.checked)}
          label={task.title}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{task.due_date}</span>
          <button
            onClick={toggleExpand}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            {expanded ? 'hide subtasks' : 'subtasks'}
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-600 hover:text-red-400"
          >
            delete
          </button>
        </div>
      </div>

      {expanded && (
        loadingSubtasks ? (
          <p className="text-xs text-gray-500 pl-4">Loading...</p>
        ) : (
          <SubtaskChecklist taskId={task.id} subtasks={subtasks} onChange={loadSubtasks} />
        )
      )}
    </div>
  );
}

export default TaskItem;
