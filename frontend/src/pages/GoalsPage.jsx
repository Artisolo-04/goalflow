import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { fetchGoals, createGoal } from '../api/goals';
import { fetchTasks } from '../api/tasks';
import GoalCard from '../components/GoalCard';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ScrollArea from '../components/ScrollArea';
import { useToast } from '../context/ToastContext';

function GoalsPage() {

  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(null);

  async function loadAll({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const [goalData, taskData] = await Promise.all([fetchGoals(), fetchTasks()]);
      setGoals(goalData);
      setTasks(taskData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      await createGoal({ title, target_date: targetDate });
      toast.success('Goal created');
      setTitle('');
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

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0 pt-2">
        <h1 className="text-2xl font-bold text-gray-100">Goals</h1>
        <Button onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New goal
          </span>
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading goals...</p>
      ) : goals.length === 0 ? (
        <p className="text-gray-500 text-sm">No goals yet — create your first one.</p>
      ) : (
        <ScrollArea>
          <div className="flex flex-col gap-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                tasks={tasksByGoal[goal.id] || []}
                allTasks={tasks}
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
          <DatePicker label="Target date (optional)" value={targetDate} onChange={setTargetDate} />
          <Button onClick={handleCreate}>Create goal</Button>
        </div>
      </Modal>
    </div>
  );
}

export default GoalsPage;
