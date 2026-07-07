import { useState, useEffect } from 'react';
import { fetchTasks } from '../api/tasks';
import CalendarGrid from '../components/CalendarGrid';
import DayDetailPanel from '../components/DayDetailPanel';
import Modal from '../ui/Modal';
import { useToast } from '../context/ToastContext';

function CalendarPage() {

  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const tasksByDate = tasks.reduce((acc, task) => {
    if (!acc[task.due_date]) acc[task.due_date] = [];
    acc[task.due_date].push(task);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col h-full gap-4">
      <h1 className="text-2xl font-bold text-gray-100 shrink-0 pt-2">Calendar</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading calendar...</p>
      ) : (
        <CalendarGrid tasksByDate={tasksByDate} onSelectDate={setSelectedDate} />
      )}

      <Modal open={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate}>
        <DayDetailPanel
          date={selectedDate}
          tasks={tasksByDate[selectedDate] || []}
          onChange={loadTasks}
        />
      </Modal>
    </div>
  );
}

export default CalendarPage;
