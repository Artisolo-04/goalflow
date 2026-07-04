import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2, CheckCircle2, Clock, AlertCircle, Flag } from 'lucide-react';
import Checkbox from '../ui/Checkbox';
import SubtaskChecklist from './SubtaskChecklist';
import TagPicker from './TagPicker';
import { updateTask, deleteTask, fetchTaskById } from '../api/tasks';
import { dueDateInfo } from '../lib/date';

const TONE = {
  done: {
    edge: 'bg-emerald-500/75',
    badge: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25',
    icon: CheckCircle2,
  },
  overdue: {
    edge: 'bg-orange-500/75',
    badge: 'bg-orange-500/12 text-orange-400 border-orange-500/25',
    icon: AlertCircle,
  },
  today: {
    edge: 'bg-indigo-400/75',
    badge: 'bg-indigo-500/12 text-indigo-300 border-indigo-500/25',
    icon: Clock,
  },
  soon: {
    edge: 'bg-indigo-500/75',
    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    icon: Clock,
  },
  neutral: {
    edge: 'bg-gray-700/75',
    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    icon: Clock,
  },
};

const PRIORITY = {
  low: {
    label: 'Low',
    dot: 'bg-slate-400',
    badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  },
  high: {
    label: 'High',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  urgent: {
    label: 'Urgent',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
};

const PRIORITY_ORDER = ['low', 'medium', 'high', 'urgent'];

function TaskItem({ task, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const priorityRef = useRef(null);

  const { label: dateLabel, tone } = dueDateInfo(task.due_date, task.completed);
  const { edge, badge, icon: ToneIcon } = TONE[tone];
  const priorityInfo = PRIORITY[task.priority] || PRIORITY.medium;

  useEffect(() => {
    function handleClickOutside(e) {
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setPriorityMenuOpen(false);
      }
    }
    if (priorityMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [priorityMenuOpen]);

  async function loadDetail() {
    setLoadingDetail(true);
    const full = await fetchTaskById(task.id);
    setSubtasks(full.subtasks);
    setTags(full.tags);
    setLoadingDetail(false);
  }

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next) await loadDetail();
  }

  async function handleToggleCompleted(checked) {
    await updateTask(task.id, { completed: checked });
    onChange();
  }

  async function handleDelete() {
    await deleteTask(task.id);
    onChange();
  }

  async function handlePriorityChange(priority) {
    setPriorityMenuOpen(false);
    if (priority === task.priority) return;
    await updateTask(task.id, { priority });
    onChange();
  }

  return (
    <div
      className={`
        group relative bg-gradient-to-b from-gray-900 to-gray-900/70
        border border-gray-800/80 border-0.5 ${edge}
        rounded-2xl px-5 py-5 flex flex-col gap-3.5
        transition-all duration-200 ease-out
        hover:border-gray-700 hover:shadow-lg hover:shadow-black/30
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 pt-0.5">
          <Checkbox
            checked={task.completed}
            onChange={(e) => handleToggleCompleted(e.target.checked)}
            label={<span className="font-display text-[15px] font-medium">{task.title}</span>}
          />
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {/* Priority pill + dropdown */}
          <div className="relative" ref={priorityRef}>
            <button
              onClick={() => setPriorityMenuOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-mono font-medium border transition-colors ${priorityInfo.badge} hover:brightness-125`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
              {priorityInfo.label}
            </button>

            {priorityMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-10 w-32 rounded-xl border border-gray-800 bg-gray-900 shadow-xl shadow-black/40 p-1.5 flex items-center justify-center flex-col gap-2 overflow-hidden">
                {PRIORITY_ORDER.map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePriorityChange(key)}
                    className={`w-full flex items-center gap-3 rounded-lg px-2 text-xs text-left p-1.5 hover:bg-white/5 transition-colors ${
                      key === task.priority ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY[key].dot}`} />
                    {PRIORITY[key].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Due date badge */}
          <span className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${badge}`}>
            <ToneIcon size={12} strokeWidth={2.5} />
            {dateLabel}
          </span>
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

      <div
        className={`
          grid transition-all duration-200 ease-out
          ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
        `}
      >
        <div className="overflow-hidden">
          <div className="mt-1 p-4 rounded-xl bg-black/25 border border-gray-800/60 flex flex-col gap-4">
            {loadingDetail ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tags</span>
                  <TagPicker taskId={task.id} assignedTags={tags} onChange={loadDetail} />
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
