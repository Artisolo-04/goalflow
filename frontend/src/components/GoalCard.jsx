import { useState } from 'react';
import { Circle, CircleDot, CircleCheck, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import DatePicker from '../ui/DatePicker';
import { updateGoal, deleteGoal } from '../api/goals';

const STATUS_TONE = {
  gray: { badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Circle, label: 'Not started' },
  amber: { badge: 'bg-amber-500/12 text-amber-400 border-amber-500/25', icon: CircleDot, label: 'In progress' },
  green: { badge: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25', icon: CircleCheck, label: 'Complete' },
};

function getGoalStatus(progress) {
  if (progress === 0) return STATUS_TONE.gray;
  if (progress === 100) return STATUS_TONE.green;
  return STATUS_TONE.amber;
}

function GoalCard({ goal, onChange }) {
  const status = getGoalStatus(goal.progress);
  const StatusIcon = status.icon;

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [editingDate, setEditingDate] = useState(false);

  async function handleTitleSave() {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === goal.title) {
      setTitleDraft(goal.title);
      setEditingTitle(false);
      return;
    }
    await updateGoal(goal.id, { title: trimmed });
    setEditingTitle(false);
    onChange();
  }

  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      setTitleDraft(goal.title);
      setEditingTitle(false);
    }
  }

  async function handleTargetDateChange(newDate) {
    await updateGoal(goal.id, { target_date: newDate });
    setEditingDate(false);
    onChange();
  }

  async function handleDelete() {
    await deleteGoal(goal.id);
    onChange();
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-colors duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="bg-gray-800 border-2 border-indigo-500 rounded-lg px-2 py-1 text-gray-100 font-semibold outline-none"
            />
          ) : (
            <h3
              onClick={() => setEditingTitle(true)}
              className="text-gray-100 font-semibold cursor-text hover:text-indigo-300 transition-colors"
            >
              {goal.title}
            </h3>
          )}

          <span className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-mono font-medium border w-fit ${status.badge}`}>
            <StatusIcon size={12} strokeWidth={2.5} />
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-10 text-right font-medium">{goal.progress}%</span>
      </div>

      <Modal open={editingDate} onClose={() => setEditingDate(false)} title="Change target date">
        <DatePicker value={goal.target_date} onChange={handleTargetDateChange} startOpen />
      </Modal>
    </div>
  );
}

export default GoalCard;
