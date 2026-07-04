const COLORS = {
  gray: 'bg-gray-500/12 text-gray-300 border-gray-500/25',
  blue: 'bg-blue-500/12 text-blue-300 border-blue-500/25',
  amber: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
  green: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  coral: 'bg-orange-500/12 text-orange-300 border-orange-500/25',
};

function Tag({ icon: Icon, label, color = 'gray' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-mono border ${COLORS[color]}`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
}

export default Tag;
