import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import useClickOutside from './useClickOutside';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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

function DatePicker({ label, value, onChange, placeholder = 'Select date', startOpen = false, onCancel }) {
  const [open, setOpen] = useState(startOpen);
  const [pickerView, setPickerView] = useState('days'); // 'days' | 'months'

  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewDate, setViewDate] = useState(initialDate);
  const [draftDate, setDraftDate] = useState(value || null);

  const containerRef = useClickOutside(() => handleCancel());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = buildFixedGrid(year, month);

  function isSelected(day, offset) {
    if (!draftDate) return false;
    const d = new Date(draftDate + 'T00:00:00');
    const targetMonth = month + offset;
    const target = new Date(year, targetMonth, day);
    return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth() && d.getDate() === target.getDate();
  }

  function selectCell(day, offset) {
    const targetDate = new Date(year, month + offset, day);
    if (offset !== 0) setViewDate(targetDate);
    setDraftDate(toDateString(targetDate));
  }

  function goToday() {
    const today = new Date();
    setViewDate(today);
    setDraftDate(toDateString(today));
  }

  function handleCancel() {
    setDraftDate(value || null);
    setViewDate(value ? new Date(value + 'T00:00:00') : new Date());
    setPickerView('days');
    setOpen(false);
    onCancel?.();
  }

  function handleOk() {
    if (draftDate) onChange(draftDate);
    setPickerView('days');
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

      <div className={`overflow-hidden transition-all duration-200 ease-out ${open ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-800 border-2 border-t-0 border-indigo-500 rounded-b-lg p-3">
          {pickerView === 'days' ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setPickerView('months')}
                  className="text-sm font-semibold text-gray-100 hover:text-indigo-300 px-2 py-1 rounded-md hover:bg-gray-700/60 transition-colors"
                >
                  {MONTHS[month]} {year}
                </button>

                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 grid-rows-6 gap-1 mb-2">
                {cells.map((cell, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectCell(cell.day, cell.offset)}
                    className={`text-xs rounded-lg py-2 transition-colors duration-100 ${
                      cell.offset !== 0 ? 'text-gray-600 hover:text-gray-400' : 'text-gray-200 hover:bg-gray-700'
                    } ${isSelected(cell.day, cell.offset) ? 'bg-indigo-500 text-white hover:bg-indigo-500' : ''}`}
                  >
                    {cell.day}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year - 1, month, 1))}
                  className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-gray-100">{year}</span>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year + 1, month, 1))}
                  className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setViewDate(new Date(year, i, 1)); setPickerView('days'); }}
                    className={`text-xs font-medium rounded-lg py-2.5 transition-colors ${
                      i === month ? 'bg-indigo-500 text-white' : 'text-gray-200 hover:bg-gray-700'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-700/60">
            <button
              type="button"
              onClick={goToday}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-gray-700/50 px-2 py-1.5 rounded-lg transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOk}
                className="text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatePicker;
