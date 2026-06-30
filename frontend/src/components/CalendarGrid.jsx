import { useState } from 'react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function CalendarGrid({ tasksByDate, selectedDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="text-gray-400 hover:text-gray-100 px-2"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-200">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="text-gray-400 hover:text-gray-100 px-2"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = toDateString(new Date(year, month, day));
          const dayTasks = tasksByDate[dateStr] || [];
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              className={`
                relative aspect-square rounded-md text-xs
                flex flex-col items-center justify-center gap-1
                transition-colors duration-100
                ${isSelected ? 'bg-indigo-500 text-white' : 'text-gray-200 hover:bg-gray-700'}
              `}
            >
              <span>{day}</span>
              {dayTasks.length > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
