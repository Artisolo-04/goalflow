import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

function Dropdown({ label, options, value, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full bg-gray-800 text-gray-100 border-2 rounded-lg px-3 py-2 text-sm text-left
          flex items-center justify-between outline-none transition-colors duration-150
          ${open ? 'border-indigo-500 rounded-b-none' : 'border-gray-700'}
        `}
      >
        <span className={selected ? '' : 'text-gray-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-gray-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Inline expanding panel, same pattern as DatePicker — pushes content below it down */}
      <div
        className={`
          overflow-hidden transition-all duration-200 ease-out
          ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="bg-gray-800 border-2 border-t-0 border-indigo-500 rounded-b-lg max-h-60 overflow-y-auto scrollbar-hide">
          {options.length === 0 ? (
            <p className="text-xs text-gray-500 px-3 py-2">No options available</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 text-sm flex items-center justify-between
                  hover:bg-gray-700 transition-colors duration-100
                  ${opt.value === value ? 'text-indigo-300' : 'text-gray-200'}
                `}
              >
                {opt.label}
                {opt.value === value && <Check size={14} />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
