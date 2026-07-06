import { PRIORITIES, PRIORITY_META } from '../lib/priority';

function PriorityPicker({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-300">Priority</label>
      <div className="flex gap-2">
        {PRIORITIES.map((p) => {
          const { label, icon: Icon, color, bg } = PRIORITY_META[p];
          const active = value === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border
                transition-all duration-150
                ${active ? `${bg} ${color}` : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'}
              `}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PriorityPicker;
