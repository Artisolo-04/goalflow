import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { fetchGoals, createGoal } from '../api/goals';
import GoalCard from '../components/GoalCard';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(null);

  async function loadGoals() {
    setLoading(true);
    const data = await fetchGoals();
    setGoals(data);
    setLoading(false);
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleCreate() {
    if (!title.trim()) return;
    await createGoal({ title, target_date: targetDate });
    setTitle('');
    setTargetDate(null);
    setModalOpen(false);
    loadGoals();
  }

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
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
        <div className="flex flex-col gap-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
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
