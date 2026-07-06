import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PRIORITY_DOT = {
  low: 'bg-gray-400',
  medium: 'bg-indigo-400',
  high: 'bg-amber-400',
  urgent: 'bg-red-400',
};

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildFixedGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, offset: -1 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, offset: 0 });
  }
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay++, offset: 1 });
  }
  return cells;
}

function CalendarGrid({ tasksByDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = toDateString(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = buildFixedGrid(year, month);

  function goToday() {
    setViewDate(new Date());
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={goToday}
          className="text-sm font-semibold text-gray-200 hover:text-indigo-300 px-2 py-1 rounded-md hover:bg-gray-700/60 transition-colors"
        >
          {MONTHS[month]} {year}
        </button>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 gap-1">
        {cells.map((cell, i) => {
          const cellDate = new Date(year, month + cell.offset, cell.day);
          const dateStr = toDateString(cellDate);
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = dateStr === today;
          const isMuted = cell.offset !== 0;

          const priorities = [...new Set(dayTasks.map((t) => t.priority || 'medium'))];

          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              className={`
                relative aspect-square rounded-md text-xs
                flex flex-col items-center justify-center gap-1
                transition-colors duration-100
                ${isMuted ? 'text-gray-600 hover:text-gray-400' : 'text-gray-200 hover:bg-gray-700'}
                ${isToday ? 'ring-2 ring-indigo-500 ring-inset font-semibold text-indigo-300' : ''}
              `}
            >
              <span>{cell.day}</span>
              {priorities.length > 0 && (
                <span className="flex items-center gap-0.5">
                  {priorities.slice(0, 3).map((p) => (
                    <span key={p} className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[p]}`} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
