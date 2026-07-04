function Input({ label, value, onChange, type = 'text', placeholder, error, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full bg-gray-800 text-gray-100 placeholder-gray-500
          border-2 rounded-lg px-3 py-2 text-sm
          outline-none transition-colors duration-150
          focus:border-indigo-500
          ${error ? 'border-red-500' : 'border-gray-700'}
        `}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export default Input;
