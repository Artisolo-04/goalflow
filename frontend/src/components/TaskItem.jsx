import { useState } from 'react';
import { ChevronDown, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Checkbox from '../ui/Checkbox';
import Dropdown from '../ui/Dropdown';
import DatePicker from '../ui/DatePicker';
import SubtaskChecklist from './SubtaskChecklist';
import TagPicker from './TagPicker';
import PriorityBadge from './PriorityBadge';
import { updateTask, deleteTask, fetchTaskById } from '../api/tasks';
import { dueDateInfo } from '../lib/date';
import Modal from '../ui/Modal';
import { useToast } from '../context/ToastContext';

const TONE = {
  done: { edge: 'bg-emerald-500', badge: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25', icon: CheckCircle2 },
  overdue: { edge: 'bg-orange-500', badge: 'bg-orange-500/12 text-orange-400 border-orange-500/25', icon: AlertCircle },
  today: { edge: 'bg-indigo-400', badge: 'bg-indigo-500/12 text-indigo-300 border-indigo-500/25', icon: Clock },
  soon: { edge: 'bg-indigo-500/40', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Clock },
  neutral: { edge: 'bg-gray-700', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Clock },
};

function TaskItem({ task, onChange, allTags, onTagsRefresh, goals }) {

  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);


  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [editingDate, setEditingDate] = useState(false);


  const { label: dateLabel, tone } = dueDateInfo(task.due_date, task.completed);
  const { edge, badge, icon: ToneIcon } = TONE[tone];

  async function loadDetail() {
    setLoadingDetail(true);
    try {
      const full = await fetchTaskById(task.id);
      setSubtasks(full.subtasks);
      setTags(full.tags);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next) await loadDetail();
  }

  async function handleToggleCompleted(checked) {
    try {
      await updateTask(task.id, { completed: checked });
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete() {
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handlePriorityChange(priority) {
    try {
      await updateTask(task.id, { priority });
      toast.success('Priority updated');
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleGoalChange(goalId) {
    try {
      await updateTask(task.id, { goal_id: goalId });
      toast.success('Goal updated');
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDueDateChange(newDate) {
    try {
      await updateTask(task.id, { due_date: newDate });
      toast.success('Due date updated');
      setEditingDate(false);
      onChange();
    } catch (err) {
      toast.error(err.message);
      setEditingDate(false);
    }
  }

  async function handleTitleSave() {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === task.title) {
      setTitleDraft(task.title);
      setEditingTitle(false);
      return;
    }
    try {
      await updateTask(task.id, { title: trimmed });
      toast.success('Title updated');
      setEditingTitle(false);
      onChange();
    } catch (err) {
      toast.error(err.message);
      setEditingTitle(false);
    }
  }

  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      setTitleDraft(task.title);
      setEditingTitle(false);
    }
  }

  const goalOptions = [{ label: 'No goal', value: null }, ...goals.map((g) => ({ label: g.title, value: g.id }))];

  return (
    <div
      className={`
        group relative bg-gradient-to-b from-gray-900 to-gray-900/70
        border border-gray-800/80 border-1 ${edge}
        rounded-2xl px-5 py-5 flex flex-col gap-3.5
        transition-all duration-200 ease-out
        hover:border-gray-700 hover:shadow-lg hover:shadow-black/30
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 pt-0.5 flex items-start gap-2.5">
          <div className="pt-0.5">
            <Checkbox checked={task.completed} onChange={(e) => handleToggleCompleted(e.target.checked)} />
          </div>

          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="flex-1 min-w-0 bg-gray-800 border-2 border-indigo-500 rounded-lg px-2 py-1 text-[15px] font-display font-medium text-gray-100 outline-none"
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              className={`font-display text-[15px] font-medium cursor-text hover:text-indigo-300 transition-colors ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-100'
              }`}
            >
              {task.title}
            </span>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <PriorityBadge value={task.priority || 'medium'} onChange={handlePriorityChange} />

          <>
            <button
              type="button"
              onClick={() => setEditingDate(true)}
              className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${badge} hover:brightness-110 transition`}
            >
              <ToneIcon size={12} strokeWidth={2.5} />
              {dateLabel}
            </button>

            <Modal open={editingDate} onClose={() => setEditingDate(false)} title="Change due date">
              <DatePicker value={task.due_date} onChange={handleDueDateChange} startOpen />
            </Modal>
          </>
        </div>
      </div>

      <div className="flex items-center gap-0.5 pl-8 -mt-1">
        <button
          onClick={toggleExpand}
          className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-indigo-300 px-2 py-1 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ChevronDown size={13} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          Details
        </button>
        <span className="w-px h-3 bg-gray-800" />
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-400 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className={`grid transition-all duration-200 ease-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="mt-1 p-4 rounded-xl bg-black/25 border border-gray-800/60 flex flex-col gap-4">
            {loadingDetail ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : (
              <>
                <div className="max-w-full">
                  <Dropdown label="Goal" placeholder="No goal" value={task.goal_id} onChange={handleGoalChange} options={goalOptions} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tags</span>
                  <TagPicker taskId={task.id} assignedTags={tags} allTags={allTags} onTagsRefresh={onTagsRefresh} onChange={loadDetail} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Subtasks</span>
                  <SubtaskChecklist taskId={task.id} subtasks={subtasks} onChange={loadDetail} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
