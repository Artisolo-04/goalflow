import { useState, useEffect } from 'react';
import { fetchTasks, createTask } from '../api/tasks';
import { fetchGoals } from '../api/goals';
import TaskItem from '../components/TaskItem';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Dropdown from '../ui/Dropdown';
import Button from '../ui/Button';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [goalId, setGoalId] = useState(null);

  async function loadAll() {
    setLoading(true);
    const [taskData, goalData] = await Promise.all([fetchTasks(), fetchGoals()]);
    setTasks(taskData);
    setGoals(goalData);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreate() {
    if (!title.trim() || !dueDate) return; // due_date is required by the backend
    await createTask({ title, due_date: dueDate, goal_id: goalId });
    setTitle('');
    setDueDate(null);
    setGoalId(null);
    loadAll(); // refetch tasks AND goals, since a new linked task changes goal progress
  }

  const goalOptions = goals.map((g) => ({ label: g.title, value: g.id }));

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-100">Tasks</h1>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-4">
        <Input
          label="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Build workout routine"
        />
        <DatePicker label="Due date" value={dueDate} onChange={setDueDate} />
        <Dropdown
          label="Linked goal (optional)"
          placeholder="No goal"
          value={goalId}
          onChange={setGoalId}
          options={goalOptions}
        />
        <Button onClick={handleCreate}>Create task</Button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading tasks...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onChange={loadAll} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TasksPage;
