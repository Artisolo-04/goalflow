import { useState, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import useClickOutside from './useClickOutside';

function Dropdown({ label, options, value, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const containerRef = useClickOutside(() => setOpen(false));
  const selected = options.find((o) => o.value === value);

  function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const estimatedMenuHeight = Math.min(240, options.length * 36 + 16);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedMenuHeight;

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      top: openUpward ? undefined : rect.bottom + 6,
      bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
    });
    setOpen(true);
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`
          w-full bg-gray-800 text-gray-100 border-2 rounded-lg px-3 py-2 text-sm text-left
          flex items-center justify-between outline-none transition-colors duration-150
          ${open ? 'border-indigo-500' : 'border-gray-700'}
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
      {open && menuStyle && (
        <div
          style={menuStyle}
          className={`z-[200] bg-gray-800 border-2 border-indigo-500 rounded-lg max-h-60 overflow-y-auto scrollbar-hide shadow-xl shadow-black/40 animate-in fade-in zoom-in-95 duration-150 ${
            menuStyle.top !== undefined ? 'origin-top' : 'origin-bottom'
          }`}
        >
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
      )}
    </div>
  );
}
export default Dropdown;
