function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none group min-w-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        className="
          w-5 h-5 shrink-0 rounded-md border-2 border-gray-600
          flex items-center justify-center
          transition-all duration-200 ease-out
          peer-checked:bg-indigo-500 peer-checked:border-indigo-500 peer-checked:scale-105
          group-hover:border-indigo-400
        "
      >
        <svg
          className={`w-3 h-3 text-white transition-all duration-200 ${checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {label && (
        <span className={`truncate transition-colors duration-200 ${checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
