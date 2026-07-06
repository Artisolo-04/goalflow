import { PRIORITY, PRIORITY_ORDER } from '../lib/priority';

function PrioritySelect({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div className="grid grid-cols-4 gap-1.5">
        {PRIORITY_ORDER.map((key) => {
          const info = PRIORITY[key];
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`
                flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium
                border-2 transition-colors duration-150
                ${active ? info.badge.replace('/10', '/15') + ' border-current' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
              {info.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PrioritySelect;
