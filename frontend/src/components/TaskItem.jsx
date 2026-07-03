import { useState } from 'react';
import { ChevronDown, Trash2, CircleCheck, Circle } from 'lucide-react';
import Checkbox from '../ui/Checkbox';
import Tag from '../ui/Tag';
import SubtaskChecklist from './SubtaskChecklist';
import TagPicker from './TagPicker';
import { updateTask, deleteTask, fetchTaskById } from '../api/tasks';

function TaskItem({ task, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function loadDetail() {
    setLoadingDetail(true);
    const full = await fetchTaskById(task.id);
    setSubtasks(full.subtasks);
    setTags(full.tags);
    setLoadingDetail(false);
  }

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next) await loadDetail();
  }

  async function handleToggleCompleted(checked) {
    await updateTask(task.id, { completed: checked });
    onChange();
  }

  async function handleDelete() {
    await deleteTask(task.id);
    onChange();
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3 hover:border-gray-700 transition-colors duration-150">
      <div className="flex items-center justify-between gap-3">
        <Checkbox
          checked={task.completed}
          onChange={(e) => handleToggleCompleted(e.target.checked)}
          label={task.title}
        />
        <div className="flex items-center gap-2 shrink-0">
          <Tag
            icon={task.completed ? CircleCheck : Circle}
            label={task.completed ? 'Done' : 'Pending'}
            color={task.completed ? 'green' : 'gray'}
          />
          <span className="text-xs text-gray-500">{task.due_date}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 pl-8">
        <button
          onClick={toggleExpand}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-400 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ChevronDown size={13} className={`transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`} />
          Details
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>

      {expanded && (
        <div className="pl-8 flex flex-col gap-4">
          {loadingDetail ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-400">Tags</span>
                <TagPicker taskId={task.id} assignedTags={tags} onChange={loadDetail} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-400">Subtasks</span>
                <SubtaskChecklist taskId={task.id} subtasks={subtasks} onChange={loadDetail} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskItem;
