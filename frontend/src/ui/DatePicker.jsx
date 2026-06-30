import { useState } from 'react';
import useClickOutside from './useClickOutside';

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

function DatePicker({ label, value, onChange, placeholder = 'Select date' }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function isSelected(day) {
    if (!selectedDate || !day) return false;
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  }

  function selectDay(day) {
    const picked = new Date(year, month, day);
    onChange(toDateString(picked));
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="
            w-full bg-gray-800 text-gray-100 border-2 border-gray-700
            rounded-lg px-3 py-2 text-sm text-left
            outline-none transition-colors duration-150
            focus:border-indigo-500
          "
        >
          <span className={value ? '' : 'text-gray-500'}>
            {value || placeholder}
          </span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 w-64">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="text-gray-400 hover:text-gray-100 px-2"
              >
                ‹
              </button>
              <span className="text-sm font-medium text-gray-200">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
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
              {cells.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!day}
                  onClick={() => day && selectDay(day)}
                  className={`
                    text-xs rounded-md py-1.5 transition-colors duration-100
                    ${!day ? 'invisible' : 'text-gray-200 hover:bg-gray-700'}
                    ${isSelected(day) ? 'bg-indigo-500 text-white hover:bg-indigo-500' : ''}
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatePicker;
