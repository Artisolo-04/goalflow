import { useState, useRef } from 'react';
import { PRIORITIES, PRIORITY_META } from '../lib/priority';
import useClickOutside from '../ui/useClickOutside';

function PriorityBadge({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const ref = useClickOutside(() => setOpen(false));
  const { label, icon: Icon, color, bg } = PRIORITY_META[value] || PRIORITY_META.medium;

  function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const estimatedMenuWidth = PRIORITIES.length * 34 + 8;
    const estimatedMenuHeight = 40;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.left;
    const openUpward = spaceBelow < estimatedMenuHeight + 8;
    const openLeftward = spaceRight < estimatedMenuWidth;

    setMenuStyle({
      position: 'fixed',
      top: openUpward ? undefined : rect.bottom + 6,
      bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
      left: openLeftward ? undefined : rect.left,
      right: openLeftward ? window.innerWidth - rect.right : undefined,
    });
    setOpen(true);
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono font-medium border ${bg} ${color} hover:brightness-125 transition-all`}
        title="Click to change priority"
      >
        <Icon size={12} strokeWidth={2.5} />
        {label}
      </button>

      {open && menuStyle && (
        <div
          style={menuStyle}
          className="z-[200] bg-gray-800 border border-gray-700 rounded-lg shadow-xl shadow-black/40 p-1 flex gap-1 animate-in fade-in zoom-in-95 duration-150"
        >
          {PRIORITIES.map((p) => {
            const meta = PRIORITY_META[p];
            const PIcon = meta.icon;
            return (
              <button
                key={p}
                type="button"
                onClick={() => { onChange(p); setOpen(false); }}
                title={meta.label}
                className={`p-1.5 rounded-md transition-colors ${p === value ? `${meta.bg} ${meta.color}` : 'text-gray-500 hover:bg-gray-700 hover:text-gray-200'}`}
              >
                <PIcon size={13} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PriorityBadge;
