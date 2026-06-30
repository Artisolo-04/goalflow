function GoalCard({ goal }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-100 font-semibold">{goal.title}</h3>
        {goal.target_date && (
          <span className="text-xs text-gray-500">{goal.target_date}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-10 text-right">{goal.progress}%</span>
      </div>
    </div>
  );
}

export default GoalCard;
