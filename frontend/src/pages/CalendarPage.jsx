import { useState, useEffect } from 'react';
import { fetchTasks } from '../api/tasks';
import CalendarGrid from '../components/CalendarGrid';
import DayDetailPanel from '../components/DayDetailPanel';

function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    setLoading(true);
    const data = await fetchTasks();
    setTasks(data);
    setLoading(false);
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
    <div className="max-w-3xl mx-auto w-full flex flex-col h-full gap-4">
      {}
      <h1 className="text-2xl font-bold text-gray-100 shrink-0 pt-2">Calendar</h1>

      {}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading calendar...</p>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-2 gap-4 items-start">
            <CalendarGrid
              tasksByDate={tasksByDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            <DayDetailPanel
              date={selectedDate}
              tasks={tasksByDate[selectedDate] || []}
              onChange={loadTasks}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
