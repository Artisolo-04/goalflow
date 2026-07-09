const COLORS = {
  gray: 'bg-gray-500/12 text-gray-300 border-gray-500/25',
  red: 'bg-red-500/12 text-red-300 border-red-500/25',
  orange: 'bg-orange-500/12 text-orange-300 border-orange-500/25',
  amber: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
  green: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  teal: 'bg-teal-500/12 text-teal-300 border-teal-500/25',
  cyan: 'bg-cyan-500/12 text-cyan-300 border-cyan-500/25',
  blue: 'bg-blue-500/12 text-blue-300 border-blue-500/25',
  indigo: 'bg-indigo-500/12 text-indigo-300 border-indigo-500/25',
  purple: 'bg-purple-500/12 text-purple-300 border-purple-500/25',
  pink: 'bg-pink-500/12 text-pink-300 border-pink-500/25',
  rose: 'bg-rose-500/12 text-rose-300 border-rose-500/25',
};

function Tag({ icon: Icon, label, color = 'gray', active = true }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-mono border transition-opacity duration-150 ${
        COLORS[color] || COLORS.gray
      } ${active ? '' : 'opacity-40 hover:opacity-70'}`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
}
export default Tag;
