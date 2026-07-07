import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import Checkbox from '../ui/Checkbox';
import PriorityBadge from './PriorityBadge';
import { updateTask, deleteTask, createTask } from '../api/tasks';
import { useToast } from '../context/ToastContext';

function DayDetailPanel({ date, tasks, onChange }) {

  const toast = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleToggle(taskId, checked) {
    try {
      await updateTask(taskId, { completed: checked });
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handlePriorityChange(taskId, priority) {
    try {
      await updateTask(taskId, { priority });
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleAddTask() {
    const trimmed = newTitle.trim();
    if (!trimmed || !date) return;
    setAdding(true);
    try {
      await createTask({ title: trimmed, due_date: date, priority: 'medium' });
      toast.success('Task added');
      setNewTitle('');
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  }

  if (!date) {
    return <p className="text-sm text-gray-500">Select a day to see tasks due.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-500">No tasks due this day.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-2 bg-black/20 border border-gray-800/60 rounded-lg px-3 py-2"
            >
              <Checkbox
                checked={task.completed}
                onChange={(e) => handleToggle(task.id, e.target.checked)}
                label={
                  <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-100'}>
                    {task.title}
                  </span>
                }
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <PriorityBadge value={task.priority || 'medium'} onChange={(p) => handlePriorityChange(task.id, p)} />
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-gray-500 hover:text-orange-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-800">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add task for this day..."
          className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleAddTask}
          disabled={adding}
          className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Add
        </button>
      </div>
    </div>
  );
}

export default DayDetailPanel;
