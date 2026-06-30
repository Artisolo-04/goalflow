const COLORS = {
  gray: 'bg-gray-700/50 text-gray-300',
  blue: 'bg-blue-500/15 text-blue-400',
  amber: 'bg-amber-500/15 text-amber-400',
  green: 'bg-emerald-500/15 text-emerald-400',
};

function Tag({ icon: Icon, label, color = 'gray' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${COLORS[color]}`}>
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
}

export default Tag;
