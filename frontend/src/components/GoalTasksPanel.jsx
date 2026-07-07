import { useState } from 'react';
import { Trash2, Plus, Link2, Unlink, Calendar } from 'lucide-react';
import Checkbox from '../ui/Checkbox';
import DatePicker from '../ui/DatePicker';
import Dropdown from '../ui/Dropdown';
import Modal from '../ui/Modal';
import PriorityBadge from './PriorityBadge';
import { updateTask, deleteTask, createTask } from '../api/tasks';
import { useToast } from '../context/ToastContext';

function GoalTaskRow({ task, onToggle, onPriorityChange, onDelete, onUnlink, onTitleSave, onDueDateSave }) {

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [editingDate, setEditingDate] = useState(false);

  function handleSaveTitle() {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === task.title) {
      setTitleDraft(task.title);
      setEditingTitle(false);
      return;
    }
    onTitleSave(task.id, trimmed);
    setEditingTitle(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleSaveTitle(); }
    if (e.key === 'Escape') { setTitleDraft(task.title); setEditingTitle(false); }
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 transition-colors ${
        task.completed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-black/20 border-gray-800/60'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Checkbox checked={task.completed} onChange={(e) => onToggle(task.id, e.target.checked)} />
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-gray-800 border-2 border-indigo-500 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none"
          />
        ) : (
          <span
            onClick={() => setEditingTitle(true)}
            title={task.title}
            className={`truncate cursor-text hover:text-indigo-300 transition-colors text-sm ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-100'
            }`}
          >
            {task.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="w-full flex justify-start px-6">
          <button
            onClick={() => setEditingDate(true)}
            className="text-[11px] font-mono text-gray-500 hover:text-indigo-300 transition-colors whitespace-nowrap text-right"
          >
            {task.due_date}
          </button>
        </div>
        <div className="w-[70px] flex justify-end">
          <PriorityBadge value={task.priority || 'medium'} onChange={(p) => onPriorityChange(task.id, p)} />
        </div>
        <button
          onClick={() => onUnlink(task.id)}
          title="Unlink from this goal"
          className="text-gray-500 hover:text-amber-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Unlink size={13} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className="text-gray-500 hover:text-orange-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <Modal open={editingDate} onClose={() => setEditingDate(false)} title="Change due date">
        <DatePicker
          value={task.due_date}
          onChange={(d) => { onDueDateSave(task.id, d); setEditingDate(false); }}
          startOpen
        />
      </Modal>
    </div>
  );
}

function GoalTasksPanel({ goalId, tasks, allTasks, onChange }) {

  const toast = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState(null);
  const [pickingDate, setPickingDate] = useState(false);
  const [adding, setAdding] = useState(false);
  const [linkTaskId, setLinkTaskId] = useState(null);
  const [linking, setLinking] = useState(false);

  const unassignedTasks = (allTasks || []).filter((t) => !t.goal_id);
  const linkOptions = unassignedTasks.map((t) => ({ label: t.title, value: t.id }));

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

  async function handleUnlink(taskId) {
    try {
      await updateTask(taskId, { goal_id: null });
      toast.success('Task unlinked from goal');
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleTitleSave(taskId, title) {
    try {
      await updateTask(taskId, { title });
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDueDateSave(taskId, due_date) {
    try {
      await updateTask(taskId, { due_date });
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleAddTask() {
    const trimmed = newTitle.trim();
    if (!trimmed || !newDueDate) return;
    setAdding(true);
    try {
      await createTask({ title: trimmed, due_date: newDueDate, goal_id: goalId, priority: 'medium' });
      toast.success('Task added to goal');
      setNewTitle('');
      setNewDueDate(null);
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleLinkExisting() {
    if (!linkTaskId) return;
    setLinking(true);
    try {
      await updateTask(linkTaskId, { goal_id: goalId });
      toast.success('Task linked to goal');
      setLinkTaskId(null);
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto scrollbar-hide pr-1">
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-500">No tasks linked to this goal yet.</p>
        ) : (
          tasks.map((task) => (
            <GoalTaskRow
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onPriorityChange={handlePriorityChange}
              onDelete={handleDelete}
              onUnlink={handleUnlink}
              onTitleSave={handleTitleSave}
              onDueDateSave={handleDueDateSave}
            />
          ))
        )}
      </div>

      {unassignedTasks.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Link2 size={12} />
            Link an existing task
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <Dropdown placeholder="Choose a task..." value={linkTaskId} onChange={setLinkTaskId} options={linkOptions} />
            </div>
            <button
              onClick={handleLinkExisting}
              disabled={linking || !linkTaskId}
              className="flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              Link
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-800">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Plus size={12} />
          Create a new task for this goal
        </span>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Task title..."
          className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setPickingDate(true)}
            className="flex-1 flex items-center justify-between bg-gray-800 text-gray-100 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm outline-none hover:border-gray-600 transition-colors min-w-0"
          >
            <span className={newDueDate ? '' : 'text-gray-500'}>{newDueDate || 'Due date'}</span>
            <Calendar size={15} className="text-gray-500 shrink-0" />
          </button>
          <button
            onClick={handleAddTask}
            disabled={adding || !newTitle.trim() || !newDueDate}
            className="flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      <Modal open={pickingDate} onClose={() => setPickingDate(false)} title="Choose due date">
        <DatePicker
          value={newDueDate}
          onChange={(d) => { setNewDueDate(d); setPickingDate(false); }}
          startOpen
        />
      </Modal>
    </div>
  );
}

export default GoalTasksPanel;
