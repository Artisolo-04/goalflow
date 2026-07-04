import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import Checkbox from '../ui/Checkbox';
import { createSubtask, updateSubtask, deleteSubtask } from '../api/tasks';

function SubtaskChecklist({ taskId, subtasks, onChange }) {
  const [newText, setNewText] = useState('');
  const [expanded, setExpanded] = useState(true);

  const total = subtasks.length;
  const done = subtasks.filter((s) => s.checked).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  async function handleToggle(subtaskId, checked) {
    await updateSubtask(taskId, subtaskId, { checked });
    onChange();
  }

  async function handleAdd() {
    if (!newText.trim()) return;
    await createSubtask(taskId, newText);
    setNewText('');
    onChange();
  }

  async function handleDelete(subtaskId) {
    await deleteSubtask(taskId, subtaskId);
    onChange();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2.5 group/subhead"
      >
        <ChevronDown
          size={13}
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
        <span className="shrink-0 text-xs text-gray-400 group-hover/subhead:text-gray-200 transition-colors">
          {total === 0 ? 'No subtasks' : `${done}/${total} done`}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-black/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-[10px] font-mono text-gray-500 w-8 text-right">{pct}%</span>
      </button>

      <div
        className={`grid transition-all duration-200 ease-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-gray-800 mt-2">
            {subtasks.map((s) => (
              <div key={s.id} className="flex items-center justify-between group">
                <Checkbox
                  checked={s.checked}
                  onChange={(e) => handleToggle(s.id, e.target.checked)}
                  label={s.text}
                />
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={13} />
                </button>
              </div>
            ))}

            <div className="flex gap-2 mt-1 items-center">
              <input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Add subtask..."
                className="flex-1 min-w-0 bg-black/25 border border-gray-800/60 focus:border-indigo-500/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-black/25 border border-gray-800/60 text-gray-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubtaskChecklist;
