function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        className="
          w-5 h-5 rounded-md border-2 border-gray-500
          flex items-center justify-center
          transition-colors duration-150
          peer-checked:bg-indigo-500 peer-checked:border-indigo-500
          group-hover:border-indigo-400
        "
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
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
        )}
      </div>
      {label && <span className="text-gray-200">{label}</span>}
    </label>
  );
}

export default Checkbox;
