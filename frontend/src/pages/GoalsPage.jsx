import { useState, useEffect } from 'react';
import { fetchGoals, createGoal } from '../api/goals';
import GoalCard from '../components/GoalCard';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';

function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
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
    loadGoals(); // refetch so progress/list stays in sync with the DB
  }

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-100">Goals</h1>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-4">
        <Input
          label="Goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Get fit this year"
        />
        <DatePicker label="Target date (optional)" value={targetDate} onChange={setTargetDate} />
        <Button onClick={handleCreate}>Create goal</Button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading goals...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalsPage;
