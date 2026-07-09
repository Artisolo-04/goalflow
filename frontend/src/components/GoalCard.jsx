import { useState, useEffect } from 'react';
import { Circle, CircleDot, CircleCheck, Trash2, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import DatePicker from '../ui/DatePicker';
import Tag from '../ui/Tag';
import GoalTasksPanel from './GoalTasksPanel';
import { updateGoal, deleteGoal } from '../api/goals';
import { useToast } from '../context/ToastContext';

const STATUS_TONE = {
  gray: { badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Circle, label: 'Not started' },
  amber: { badge: 'bg-amber-500/12 text-amber-400 border-amber-500/25', icon: CircleDot, label: 'In progress' },
  green: { badge: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25', icon: CircleCheck, label: 'Complete' },
};

const EDGE_COLOR = {
  gray: 'bg-gray-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
};

const COLOR_SWATCH = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-400',
  amber: 'bg-amber-400',
  green: 'bg-emerald-400',
};

const COLOR_OPTIONS = ['gray', 'blue', 'amber', 'green'];
const MAX_VISIBLE_TAGS = 2;

function getGoalStatus(progress) {
  if (progress === 0) return STATUS_TONE.gray;
  if (progress === 100) return STATUS_TONE.green;
  return STATUS_TONE.amber;
}

function GoalCard({ goal, tasks, allTasks, allTags, onTagsRefresh, onChange }) {
  const toast = useToast();
  const status = getGoalStatus(goal.progress);
  const StatusIcon = status.icon;
  const edge = EDGE_COLOR[goal.color] || EDGE_COLOR.gray;
  const goalTags = goal.tags || [];

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [editingDate, setEditingDate] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(goal.description || '');
  const [editingColor, setEditingColor] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setDescDraft(goal.description || '');
  }, [goal.description]);

  async function handleTitleSave() {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === goal.title) {
      setTitleDraft(goal.title);
      setEditingTitle(false);
      return;
    }
    try {
      await updateGoal(goal.id, { title: trimmed });
      toast.success('Title updated');
      setEditingTitle(false);
      onChange();
    } catch (err) {
      toast.error(err.message);
      setEditingTitle(false);
    }
  }

  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleTitleSave(); }
    if (e.key === 'Escape') { setTitleDraft(goal.title); setEditingTitle(false); }
  }

  async function handleTargetDateChange(newDate) {
    try {
      await updateGoal(goal.id, { target_date: newDate });
      toast.success('Target date updated');
      setEditingDate(false);
      onChange();
    } catch (err) {
      toast.error(err.message);
      setEditingDate(false);
    }
  }

  async function handleDescSave() {
    try {
      await updateGoal(goal.id, { description: descDraft.trim() });
      toast.success('Description updated');
      setEditingDesc(false);
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleColorChange(color) {
    try {
      await updateGoal(goal.id, { color });
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditingColor(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteGoal(goal.id);
      toast.success('Goal deleted');
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const visibleTags = goalTags.slice(0, MAX_VISIBLE_TAGS);
  const extraCount = goalTags.length - visibleTags.length;

  return (
    <div
      onClick={() => setShowDetail(true)}
      className={`
        relative bg-gradient-to-b from-gray-900 to-gray-900/70
        border border-gray-800/80 border-1 ${edge}
        rounded-2xl px-5 py-5 flex flex-col gap-4 cursor-pointer
        transition-all duration-200 ease-out
        hover:border-gray-700 hover:shadow-lg hover:shadow-black/30
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setEditingColor((o) => !o)}
                className={`w-3.5 h-3.5 rounded-md ${COLOR_SWATCH[goal.color] || COLOR_SWATCH.gray} hover:scale-110 transition-transform`}
              />
              {editingColor && (
                <div className="absolute left-0 top-full mt-2 z-30 bg-gray-800 border border-gray-700 rounded-lg shadow-xl shadow-black/40 p-1.5 flex gap-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleColorChange(c)}
                      className={`w-6 h-6 rounded-md ${COLOR_SWATCH[c]} flex items-center justify-center hover:scale-110 transition-transform`}
                    >
                      {c === goal.color && <Check size={12} className="text-gray-900" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {editingTitle ? (
              <input
                autoFocus
                onClick={(e) => e.stopPropagation()}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="min-w-0 flex-1 bg-gray-800 border-2 border-indigo-500 rounded-lg px-2 py-1 text-gray-100 font-semibold outline-none"
              />
            ) : (
              <h3
                onClick={(e) => { e.stopPropagation(); setEditingTitle(true); }}
                className="min-w-0 truncate text-gray-100 font-semibold cursor-text hover:text-indigo-300 transition-colors"
              >
                {goal.title}
              </h3>
            )}
          </div>

          <span className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-mono font-medium border w-fit ${status.badge}`}>
            <StatusIcon size={12} strokeWidth={2.5} />
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setEditingDate(true)}
            className="text-xs text-gray-500 hover:text-indigo-300 whitespace-nowrap transition-colors"
          >
            {goal.target_date || 'Set date'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-gray-500 hover:text-orange-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-gray-400 whitespace-pre-wrap line-clamp-2">{goal.description}</p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-10 text-right font-medium">{goal.progress}%</span>
      </div>

      {goalTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleTags.map((tag) => (
            <Tag key={tag.id} label={tag.name} color={tag.color} />
          ))}
          {extraCount > 0 && (
            <span className="text-[11px] font-medium text-gray-500 px-2 py-1">+{extraCount} more</span>
          )}
        </div>
      )}

      <span className="text-xs text-gray-500 hover:text-indigo-300 transition-colors text-left w-fit">
        {tasks.length === 0
          ? 'No tasks linked'
          : `${tasks.filter((t) => t.completed).length}/${tasks.length} tasks done — view details`}
      </span>

      <div onClick={(e) => e.stopPropagation()}>
        <Modal open={showDetail} onClose={() => setShowDetail(false)} title={goal.title} size="xl">
          <GoalTasksPanel
            goalId={goal.id}
            tasks={tasks}
            allTasks={allTasks}
            goal={goal}
            allTags={allTags}
            onTagsRefresh={onTagsRefresh}
            onChange={onChange}
          />
        </Modal>

        <Modal open={editingDate} onClose={() => setEditingDate(false)} title="Change target date">
          <DatePicker value={goal.target_date} onChange={handleTargetDateChange} startOpen />
        </Modal>
      </div>
    </div>
  );
}

export default GoalCard;
