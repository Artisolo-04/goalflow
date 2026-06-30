import { Circle, CircleDot, CircleCheck } from 'lucide-react';
import Tag from '../ui/Tag';

function getGoalStatus(progress) {
  if (progress === 0) return { label: 'Not started', icon: Circle, color: 'gray' };
  if (progress === 100) return { label: 'Complete', icon: CircleCheck, color: 'green' };
  return { label: 'In progress', icon: CircleDot, color: 'amber' };
}

function GoalCard({ goal }) {
  const status = getGoalStatus(goal.progress);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-colors duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-gray-100 font-semibold">{goal.title}</h3>
          <Tag icon={status.icon} label={status.label} color={status.color} />
        </div>
        {goal.target_date && (
          <span className="text-xs text-gray-500 whitespace-nowrap">{goal.target_date}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-10 text-right font-medium">{goal.progress}%</span>
      </div>
    </div>
  );
}

export default GoalCard;
