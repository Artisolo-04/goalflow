import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';
import useClickOutside from './useClickOutside';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function MiniSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-semibold text-gray-100 hover:text-indigo-300 px-1.5 py-1 rounded-md hover:bg-gray-700/60 transition-colors"
      >
        {options.find((o) => o.value === value)?.label ?? value}
        <ChevronDown size={12} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl shadow-black/40 max-h-48 overflow-y-auto scrollbar-hide min-w-[88px]">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 transition-colors ${o.value === value ? 'text-indigo-300' : 'text-gray-300'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DatePicker({ label, value, onChange, placeholder = 'Select date' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside(() => setOpen(false));

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthOptions = MONTHS.map((m, i) => ({ label: m, value: i }));
  const currentRealYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentRealYear - 10 + i).map((y) => ({ label: String(y), value: y }));

  function isSelected(day) {
    if (!selectedDate || !day) return false;
    return selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
  }

  function selectDay(day) {
    onChange(toDateString(new Date(year, month, day)));
    setOpen(false);
  }

  function selectToday() {
    const today = new Date();
    setViewDate(today);
    onChange(toDateString(today));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full bg-gray-800 text-gray-100 border-2 rounded-lg px-3 py-2 text-sm text-left outline-none transition-colors duration-150 flex items-center justify-between ${open ? 'border-indigo-500 rounded-b-none' : 'border-gray-700'}`}
      >
        <span className={value ? '' : 'text-gray-500'}>{value || placeholder}</span>
        <Calendar size={15} className="text-gray-500" />
      </button>

      <div className={`overflow-hidden transition-all duration-200 ease-out ${open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-800 border-2 border-t-0 border-indigo-500 rounded-b-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              <MiniSelect value={month} options={monthOptions} onChange={(m) => setViewDate(new Date(year, m, 1))} />
              <MiniSelect value={year} options={yearOptions} onChange={(y) => setViewDate(new Date(y, month, 1))} />
            </div>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d, i) => <div key={i} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {cells.map((day, i) => (
              <button
                key={i}
                type="button"
                disabled={!day}
                onClick={() => day && selectDay(day)}
                className={`text-xs rounded-lg py-2 transition-colors duration-100 ${!day ? 'invisible' : 'text-gray-200 hover:bg-gray-700'} ${isSelected(day) ? 'bg-indigo-500 text-white hover:bg-indigo-500' : ''}`}
              >
                {day}
              </button>
            ))}
          </div>

          <button type="button" onClick={selectToday} className="w-full text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-gray-700/50 py-1.5 rounded-lg transition-colors">
            Today
          </button>
        </div>
      </div>
    </div>
  );
}

export default DatePicker;
