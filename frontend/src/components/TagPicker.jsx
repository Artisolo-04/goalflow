import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import Tag from '../ui/Tag';
import { createTag, updateTag } from '../api/tags';

const COLOR_OPTIONS = ['gray', 'blue', 'amber', 'green'];
const COLOR_HEX = { gray: '#6b7280', blue: '#3b82f6', amber: '#f59e0b', green: '#10b981' };

function TagPicker({ entityId, assignedTags, allTags, onTagsRefresh, onChange, assignTag, removeTag }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('gray');
  const [error, setError] = useState('');

  const assignedIds = new Set(assignedTags.map((t) => t.id));

  async function handleToggle(tag) {
    if (assignedIds.has(tag.id)) await removeTag(entityId, tag.id);
    else await assignTag(entityId, tag.id);
    onChange();
  }

  function startCreate() {
    setEditingId(null); setName(''); setColor('gray'); setError(''); setFormOpen(true);
  }

  function startEdit(tag) {
    setEditingId(tag.id); setName(tag.name); setColor(tag.color); setError(''); setFormOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    try {
      if (editingId) {
        await updateTag(editingId, { name, color });
      } else {
        const tag = await createTag({ name, color });
        await assignTag(entityId, tag.id);
        onChange();
      }
      await onTagsRefresh();
      setFormOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => (
          <div key={tag.id} className="relative group/tag">
            <button onClick={() => handleToggle(tag)} type="button">
              <Tag label={tag.name} color={assignedIds.has(tag.id) ? tag.color : 'gray'} />
            </button>
            <button
              type="button"
              onClick={() => startEdit(tag)}
              title="Edit tag"
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center opacity-0 group-hover/tag:opacity-100 hover:bg-indigo-500 hover:text-white transition-opacity"
            >
              <Pencil size={9} />
            </button>
          </div>
        ))}
        {!formOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Plus size={12} />
            New tag
          </button>
        )}
      </div>

      {formOpen && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tag name"
              className="bg-transparent text-sm text-gray-100 outline-none flex-1 min-w-0"
            />
            <div className="flex gap-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-4 h-4 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: COLOR_HEX[c] }}
                />
              ))}
            </div>
            <button type="button" onClick={handleSave} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
              {editingId ? 'Save' : 'Add'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="text-xs text-gray-500 hover:text-gray-300">
              Cancel
            </button>
          </div>
          {error && <span className="text-xs text-red-400 pl-1">{error}</span>}
        </div>
      )}
    </div>
  );
}

export default TagPicker;
