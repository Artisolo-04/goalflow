import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { fetchTasks, createTask } from '../api/tasks';
import { fetchGoals } from '../api/goals';
import TaskItem from '../components/TaskItem';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Dropdown from '../ui/Dropdown';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ScrollArea from '../components/ScrollArea';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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
    if (!title.trim() || !dueDate) return;
    await createTask({ title, due_date: dueDate, goal_id: goalId });
    setTitle('');
    setDueDate(null);
    setGoalId(null);
    setModalOpen(false);
    loadAll();
  }

  const goalOptions = goals.map((g) => ({ label: g.title, value: g.id }));

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
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[92px] rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-12">
          <p className="text-gray-300 font-medium">No tasks yet</p>
          <p className="text-gray-500 text-sm max-w-xs">Create your first task to start tracking what's due and when.</p>
        </div>
      ) : (
        <ScrollArea>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} onChange={loadAll} />
            ))}
          </div>
        </ScrollArea>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a task">
        <div className="flex flex-col gap-4">
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
      </Modal>
    </div>
  );
}

export default TasksPage;
