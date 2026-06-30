import { useState } from 'react';
import useClickOutside from './useClickOutside';

function Dropdown({ label, options, value, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const selected = options.find((o) => o.value === value);

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
            flex items-center justify-between
            outline-none transition-colors duration-150
            focus:border-indigo-500
          "
        >
          <span className={selected ? '' : 'text-gray-500'}>
            {selected ? selected.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 text-sm
                  hover:bg-gray-700 transition-colors duration-100
                  ${opt.value === value ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-200'}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dropdown;
