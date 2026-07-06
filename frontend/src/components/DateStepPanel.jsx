import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';
import useClickOutside from '../ui/useClickOutside';

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

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function MiniDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-1 bg-gray-900 border border-gray-700 hover:border-gray-600 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-200 transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={12} className={`shrink-0 text-gray-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 max-h-48 overflow-y-auto w-full rounded-lg border border-gray-700 bg-gray-900 shadow-xl shadow-black/40 py-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-white/5 ${
                o.value === value ? 'text-indigo-300 font-semibold' : 'text-gray-300'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateStepPanel({ value, onChange, onBack }) {
  const initial = value ? new Date(value + 'T00:00:00') : today();
  const [viewDate, setViewDate] = useState(initial);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const day = viewDate.getDate();
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function clampDay(y, m, d) {
    return Math.min(d, new Date(y, m + 1, 0).getDate());
  }
  function isSelected(d) {
    if (!selectedDate || !d) return false;
    return selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === d;
  }
  function selectDay(d) {
    onChange(toDateString(new Date(year, month, d)));
    onBack();
  }
  function goPrevMonth() {
    setViewDate(new Date(year, month - 1, clampDay(year, month - 1, day)));
  }
  function goNextMonth() {
    setViewDate(new Date(year, month + 1, clampDay(year, month + 1, day)));
  }
  function goToday() {
    const t = today();
    onChange(toDateString(t));
    onBack();
  }

  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  const monthOptions = MONTHS.map((m, i) => ({ value: i, label: m }));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 12 }, (_, i) => currentYear - 2 + i).map((y) => ({ value: y, label: String(y) }));

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 -ml-1 px-1.5 py-1 rounded-lg hover:bg-white/5 transition-colors self-start"
      >
        <ArrowLeft size={13} />
        Back to task details
      </button>

      <div className="flex items-center gap-1.5">
        <MiniDropdown value={day} options={dayOptions} onChange={(d) => setViewDate(new Date(year, month, d))} />
        <MiniDropdown value={month} options={monthOptions} onChange={(m) => setViewDate(new Date(year, m, clampDay(year, m, day)))} />
        <MiniDropdown value={year} options={yearOptions} onChange={(y) => setViewDate(new Date(y, month, clampDay(y, month, day)))} />
        <button
          type="button"
          onClick={goToday}
          className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={goPrevMonth} className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-100">{MONTHS[month]} {year}</span>
        <button type="button" onClick={goNextMonth} className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <button
            key={i}
            type="button"
            disabled={!d}
            onClick={() => d && selectDay(d)}
            className={`
              text-xs rounded-lg py-2.5 transition-colors duration-100
              ${!d ? 'invisible' : 'text-gray-200 hover:bg-gray-800'}
              ${isSelected(d) ? 'bg-indigo-500 text-white hover:bg-indigo-500' : ''}
            `}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DateStepPanel;
