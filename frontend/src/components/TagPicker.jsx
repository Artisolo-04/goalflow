import { useState, useEffect } from 'react';
import { Plus, Pencil, Check, X } from 'lucide-react';
import Tag from '../ui/Tag';
import { fetchTags, createTag, updateTag, assignTagToTask, removeTagFromTask } from '../api/tags';

const COLOR_OPTIONS = ['gray', 'blue', 'amber', 'green', 'coral'];
const COLOR_HEX = {
  gray: '#6b7280',
  blue: '#3b82f6',
  amber: '#f59e0b',
  green: '#10b981',
  coral: '#f97316',
};

function TagPicker({ taskId, assignedTags, onChange }) {
  const [allTags, setAllTags] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('gray');

  const [editingTagId, setEditingTagId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('gray');

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

  function openEdit(tag, e) {
    e.stopPropagation();
    setCreating(false);
    setEditingTagId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  }

  function cancelEdit() {
    setEditingTagId(null);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    const updated = await updateTag(editingTagId, { name: editName, color: editColor });
    setAllTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTagId(null);
    onChange();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => (
          <div key={tag.id} className="relative group/tag p-2 -m-2">
            <button onClick={() => handleToggle(tag)} type="button">
              <Tag
                label={tag.name}
                color={assignedIds.has(tag.id) ? tag.color : 'gray'}
              />
            </button>

            <div className="absolute -top-0.5 -right-0.5 group/edit">
              <button
                type="button"
                onClick={(e) => openEdit(tag, e)}
                className="w-4 h-4 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center opacity-0 group-hover/tag:opacity-100 transition-opacity duration-200 hover:bg-indigo-500 hover:border-indigo-400"
              >
                <Pencil size={9} className="text-gray-200" />
              </button>
              <span
                className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-950 border border-gray-700 px-2 py-1 text-[10px] text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity duration-150 shadow-lg shadow-black/40 z-20"
              >
                Rename / recolor
              </span>
            </div>
          </div>
        ))}

        {!creating && (
          <button
            type="button"
            onClick={() => { setEditingTagId(null); setCreating(true); }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Plus size={12} />
            New tag
          </button>
        )}
      </div>

      {editingTagId !== null && (
        <div className="flex items-center gap-2 bg-gray-800 border border-indigo-500/40 rounded-lg p-2">
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Tag name"
            className="bg-transparent text-sm text-gray-100 outline-none flex-1 min-w-0"
          />
          <div className="flex gap-1">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setEditColor(c)}
                className={`w-4 h-4 rounded-full border-2 ${editColor === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: COLOR_HEX[c] }}
              />
            ))}
          </div>
          <button type="button" onClick={handleSaveEdit} className="text-gray-300 hover:text-emerald-400">
            <Check size={14} />
          </button>
          <button type="button" onClick={cancelEdit} className="text-gray-500 hover:text-red-400">
            <X size={14} />
          </button>
        </div>
      )}

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
                style={{ backgroundColor: COLOR_HEX[c] }}
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
