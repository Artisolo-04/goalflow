import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Check } from 'lucide-react';
import { fetchGoals, createGoal } from '../api/goals';
import { fetchTasks } from '../api/tasks';
import { fetchTags } from '../api/tags';
import GoalCard from '../components/GoalCard';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Dropdown from '../ui/Dropdown';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ScrollArea from '../components/ScrollArea';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Not started', value: 'not_started' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Complete', value: 'complete' },
];

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'created_desc' },
  { label: 'Oldest first', value: 'created_asc' },
  { label: 'Target date: soonest', value: 'date_asc' },
  { label: 'Target date: latest', value: 'date_desc' },
  { label: 'Progress: highest', value: 'progress_desc' },
  { label: 'Progress: lowest', value: 'progress_asc' },
];

const COLOR_SWATCH = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-400',
  amber: 'bg-amber-400',
  green: 'bg-emerald-400',
};
const COLOR_OPTIONS = ['gray', 'blue', 'amber', 'green'];

function getStatusBucket(progress) {
  if (progress === 0) return 'not_started';
  if (progress === 100) return 'complete';
  return 'in_progress';
}

function GoalsPage() {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('gray');
  const [targetDate, setTargetDate] = useState(null);
  const [pickingDate, setPickingDate] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  async function loadAll({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const [goalData, taskData, tagData] = await Promise.all([fetchGoals(), fetchTasks(), fetchTags()]);
      setGoals(goalData);
      setTasks(taskData);
      setAllTags(tagData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function refreshTags() {
    const data = await fetchTags();
    setAllTags(data);
  }

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      await createGoal({ title, target_date: targetDate, description: description.trim() || null, color });
      toast.success('Goal created');
      setTitle('');
      setDescription('');
      setColor('gray');
      setTargetDate(null);
      setModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const tasksByGoal = tasks.reduce((acc, task) => {
    if (!task.goal_id) return acc;
    if (!acc[task.goal_id]) acc[task.goal_id] = [];
    acc[task.goal_id].push(task);
    return acc;
  }, {});

  const visibleGoals = useMemo(() => {
    let result = goals.filter((g) => {
      if (statusFilter !== 'all' && getStatusBucket(g.progress) !== statusFilter) return false;
      if (search.trim() && !g.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'created_asc': return a.id - b.id;
        case 'created_desc': return b.id - a.id;
        case 'date_asc':
          if (!a.target_date) return 1;
          if (!b.target_date) return -1;
          return a.target_date.localeCompare(b.target_date);
        case 'date_desc':
          if (!a.target_date) return 1;
          if (!b.target_date) return -1;
          return b.target_date.localeCompare(a.target_date);
        case 'progress_desc': return b.progress - a.progress;
        case 'progress_asc': return a.progress - b.progress;
        default: return 0;
      }
    });

    return result;
  }, [goals, search, statusFilter, sortBy]);

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Goals</h1>
          {!loading && goals.length > 0 && (
            <p className="text-xs font-mono text-gray-500 mt-1">
              {goals.filter((g) => g.progress === 100).length} complete · {goals.length} total
            </p>
          )}
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New goal
          </span>
        </Button>
      </div>

      {!loading && goals.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter goals..."
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <div className="w-40 shrink-0">
              <Dropdown options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
            </div>
            <div className="w-48 shrink-0">
              <Dropdown options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[104px] rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-12">
          <p className="text-gray-300 font-medium">No goals yet</p>
          <p className="text-gray-500 text-sm max-w-xs">Create your first goal to start tracking progress.</p>
        </div>
      ) : visibleGoals.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No goals match your filter.</p>
      ) : (
        <ScrollArea>
          <div className="flex flex-col gap-3">
            {visibleGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                tasks={tasksByGoal[goal.id] || []}
                allTasks={tasks}
                allTags={allTags}
                onTagsRefresh={refreshTags}
                onChange={() => loadAll({ silent: true })}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a goal">
        <div className="flex flex-col gap-4">
          <Input
            label="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Get fit this year"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this goal matter to you?"
              rows={3}
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Color</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-md ${COLOR_SWATCH[c]} flex items-center justify-center transition-transform hover:scale-105 ${
                    c === color ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-indigo-400' : ''
                  }`}
                >
                  {c === color && <Check size={13} className="text-gray-900" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Target date (optional)</label>
            <button
              type="button"
              onClick={() => setPickingDate(true)}
              className="w-full bg-gray-800 text-gray-100 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm text-left outline-none hover:border-gray-600 transition-colors flex items-center justify-between"
            >
              <span className={targetDate ? '' : 'text-gray-500'}>{targetDate || 'Select date'}</span>
            </button>
          </div>

          <Modal open={pickingDate} onClose={() => setPickingDate(false)} title="Choose target date">
            <DatePicker value={targetDate} onChange={(d) => { setTargetDate(d); setPickingDate(false); }} startOpen />
          </Modal>

          <Button onClick={handleCreate}>Create goal</Button>
        </div>
      </Modal>
    </div>
  );
}

export default GoalsPage;
