import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil, Check } from 'lucide-react';
import { fetchTags, createTag, updateTag, deleteTag } from '../api/tags';
import { useToast } from '../context/ToastContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ScrollArea from '../components/ScrollArea';

const COLOR_OPTIONS = ['gray', 'blue', 'amber', 'green'];
const COLOR_SWATCH = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-400',
  amber: 'bg-amber-400',
  green: 'bg-emerald-400',
};

function ColorSwatchPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-7 h-7 rounded-md ${COLOR_SWATCH[c]} flex items-center justify-center transition-transform hover:scale-105 ${
            c === value ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-indigo-400' : ''
          }`}
        >
          {c === value && <Check size={13} className="text-gray-900" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}

function TagRow({ tag, onEdit, onDeleteRequest }) {
  return (
    <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors">
      <span className={`w-4 h-4 rounded-md shrink-0 ${COLOR_SWATCH[tag.color] || COLOR_SWATCH.gray}`} />
      <span className="flex-1 min-w-0 truncate text-sm text-gray-100">{tag.name}</span>
      <button
        onClick={() => onEdit(tag)}
        className="text-gray-500 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => onDeleteRequest(tag)}
        className="text-gray-500 hover:text-orange-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function TagsPage() {
  const toast = useToast();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('gray');
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('gray');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadTags() {
    setLoading(true);
    try {
      const data = await fetchTags();
      setTags(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await createTag({ name: trimmed, color: newColor });
      toast.success('Tag created');
      setNewName('');
      setNewColor('gray');
      setCreateOpen(false);
      loadTags();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  function openEdit(tag) {
    setEditTarget(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  }

  async function handleSaveEdit() {
    const trimmed = editName.trim();
    if (!trimmed || !editTarget) return;
    setSaving(true);
    try {
      await updateTag(editTarget.id, { name: trimmed, color: editColor });
      toast.success('Tag updated');
      setEditTarget(null);
      loadTags();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTag(deleteTarget.id);
      toast.success('Tag deleted');
      setDeleteTarget(null);
      loadTags();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const visibleTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0 pt-2">
        <h1 className="text-2xl font-bold text-gray-100">Tags</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New tag
          </span>
        </Button>
      </div>

      <div className="relative shrink-0">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tags..."
          className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading tags...</p>
      ) : visibleTags.length === 0 ? (
        <p className="text-sm text-gray-500">
          {tags.length === 0 ? 'No tags yet — create your first one.' : 'No tags match your search.'}
        </p>
      ) : (
        <ScrollArea>
          <div className="flex flex-col gap-2">
            {visibleTags.map((tag, i) => (
              <div
                key={tag.id}
                className="animate-in fade-in slide-in-from-top-1 duration-200"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms`, animationFillMode: 'backwards' }}
              >
                <TagRow tag={tag} onEdit={openEdit} onDeleteRequest={setDeleteTarget} />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a tag">
        <div className="flex flex-col gap-4">
          <Input
            label="Tag name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Personal"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Color</label>
            <ColorSwatchPicker value={newColor} onChange={setNewColor} />
          </div>
          <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
            Create tag
          </Button>
        </div>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit tag">
        <div className="flex flex-col gap-4">
          <Input
            label="Tag name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Color</label>
            <ColorSwatchPicker value={editColor} onChange={setEditColor} />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditTarget(null)}
              className="text-sm font-medium text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving || !editName.trim()}
              className="text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete tag?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-300">
            Delete <span className="font-semibold text-gray-100">{deleteTarget?.name}</span>? This will remove it from any tasks it's assigned to. This can't be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="text-sm font-medium text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-400 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TagsPage;
