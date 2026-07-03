import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Tag from '../ui/Tag';
import { fetchTags, createTag, assignTagToTask, removeTagFromTask } from '../api/tags';

const COLOR_OPTIONS = ['gray', 'blue', 'amber', 'green'];

function TagPicker({ taskId, assignedTags, onChange }) {
  const [allTags, setAllTags] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('gray');

  useEffect(() => {
    fetchTags().then(setAllTags);
  }, []);

  const assignedIds = new Set(assignedTags.map((t) => t.id));

  async function handleToggle(tag) {
    if (assignedIds.has(tag.id)) {
      await removeTagFromTask(taskId, tag.id);
    } else {
      await assignTagToTask(taskId, tag.id);
    }
    onChange();
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    const tag = await createTag({ name: newName, color: newColor });
    setAllTags((prev) => [...prev, tag]);
    setNewName('');
    setCreating(false);
    await assignTagToTask(taskId, tag.id);
    onChange();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => (
          <button key={tag.id} onClick={() => handleToggle(tag)} type="button">
            <Tag
              label={tag.name}
              color={assignedIds.has(tag.id) ? tag.color : 'gray'}
            />
          </button>
        ))}

        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Plus size={12} />
            New tag
          </button>
        )}
      </div>

      {creating && (
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tag name"
            className="bg-transparent text-sm text-gray-100 outline-none flex-1 min-w-0"
          />
          <div className="flex gap-1">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`w-4 h-4 rounded-full border-2 ${newColor === c ? 'border-white' : 'border-transparent'}`}
                style={{
                  backgroundColor:
                    c === 'gray' ? '#6b7280' : c === 'blue' ? '#3b82f6' : c === 'amber' ? '#f59e0b' : '#10b981',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default TagPicker;
