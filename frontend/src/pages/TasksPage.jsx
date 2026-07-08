import { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { fetchTasks, createTask } from '../api/tasks';
import { fetchGoals } from '../api/goals';
import { fetchTags } from '../api/tags';
import TaskItem from '../components/TaskItem';
import PriorityPicker from '../components/PriorityPicker';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Dropdown from '../ui/Dropdown';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ScrollArea from '../components/ScrollArea';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Done', value: 'done' },
];

const PRIORITY_FILTER_OPTIONS = [
  { label: 'All priorities', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'created_desc' },
  { label: 'Oldest first', value: 'created_asc' },
  { label: 'Due date: soonest', value: 'date_asc' },
  { label: 'Due date: latest', value: 'date_desc' },
  { label: 'Priority: highest', value: 'priority_desc' },
  { label: 'Priority: lowest', value: 'priority_asc' },
];

const PRIORITY_RANK = { low: 0, medium: 1, high: 2, urgent: 3 };

function TasksPage() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pickingDate, setPickingDate] = useState(false);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [goalId, setGoalId] = useState(null);
  const [priority, setPriority] = useState('medium');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  useEffect(() => {
    async function init() {
      try {
        const [taskData, goalData, tagData] = await Promise.all([fetchTasks(), fetchGoals(), fetchTags()]);
        setTasks(taskData);
        setGoals(goalData);
        setAllTags(tagData);
      } catch (err) {
        setLoadError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function refreshTasks() {
    const data = await fetchTasks();
    setTasks(data);
  }

  async function refreshTags() {
    const data = await fetchTags();
    setAllTags(data);
  }

  async function handleCreate() {
    if (!title.trim() || !dueDate) return;
    try {
      await createTask({ title, due_date: dueDate, goal_id: goalId, priority });
      toast.success('Task created');
      setTitle('');
      setDueDate(null);
      setGoalId(null);
      setPriority('medium');
      setModalOpen(false);
      refreshTasks();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const goalOptions = [{ label: 'No goal', value: null }, ...goals.map((g) => ({ label: g.title, value: g.id }))];

  const visibleTasks = useMemo(() => {
    let result = tasks.filter((t) => {
      if (statusFilter === 'open' && t.completed) return false;
      if (statusFilter === 'done' && !t.completed) return false;
      if (priorityFilter !== 'all' && (t.priority || 'medium') !== priorityFilter) return false;
      if (search.trim() && !t.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'created_asc':
          return a.id - b.id;
        case 'created_desc':
          return b.id - a.id;
        case 'date_asc':
          return a.due_date.localeCompare(b.due_date);
        case 'date_desc':
          return b.due_date.localeCompare(a.due_date);
        case 'priority_desc':
          return PRIORITY_RANK[b.priority || 'medium'] - PRIORITY_RANK[a.priority || 'medium'];
        case 'priority_asc':
          return PRIORITY_RANK[a.priority || 'medium'] - PRIORITY_RANK[b.priority || 'medium'];
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, sortBy]);

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0 pt-2">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-gray-100">Tasks</h1>
          {!loading && tasks.length > 0 && (
            <p className="text-xs font-mono text-gray-500 mt-1">
              {tasks.filter((t) => !t.completed).length} open · {tasks.filter((t) => t.completed).length} done
            </p>
          )}
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New task
          </span>
        </Button>
      </div>

      {!loading && tasks.length > 0 && (
        <div className="flex flex-col gap-2 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <Dropdown options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
            </div>
            <div className="flex-1 min-w-0">
              <Dropdown options={PRIORITY_FILTER_OPTIONS} value={priorityFilter} onChange={setPriorityFilter} />
            </div>
            <div className="flex-1 min-w-0">
              <Dropdown options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[92px] rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-12">
          <p className="text-red-400 font-medium">Couldn't load tasks</p>
          <p className="text-gray-500 text-sm max-w-xs">{loadError}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-12">
          <p className="text-gray-300 font-medium">No tasks yet</p>
          <p className="text-gray-500 text-sm max-w-xs">Create your first task to start tracking what's due and when.</p>
        </div>
      ) : visibleTasks.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No tasks match your filter.</p>
      ) : (
        <ScrollArea>
          <div className="flex flex-col gap-3">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onChange={refreshTasks}
                allTags={allTags}
                onTagsRefresh={refreshTags}
                goals={goals}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a task">
        <div className="flex flex-col gap-4">
          <Input label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build workout routine" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Due date</label>
            <button
              type="button"
              onClick={() => setPickingDate(true)}
              className="w-full bg-gray-800 text-gray-100 border-2 border-gray-700 rounded-lg px-3 py-2 text-sm text-left outline-none hover:border-gray-600 transition-colors flex items-center justify-between"
            >
              <span className={dueDate ? '' : 'text-gray-500'}>{dueDate || 'Select date'}</span>
            </button>
          </div>

          <Modal open={pickingDate} onClose={() => setPickingDate(false)} title="Choose due date">
            <DatePicker value={dueDate} onChange={(d) => { setDueDate(d); setPickingDate(false); }} startOpen />
          </Modal>
          <PriorityPicker value={priority} onChange={setPriority} />
          <Dropdown label="Linked goal (optional)" placeholder="No goal" value={goalId} onChange={setGoalId} options={goalOptions} />
          <Button onClick={handleCreate}>Create task</Button>
        </div>
      </Modal>
    </div>
  );
}

export default TasksPage;
