import { useState } from 'react';
import Checkbox from '../ui/Checkbox';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { createSubtask, updateSubtask, deleteSubtask } from '../api/tasks';

function SubtaskChecklist({ taskId, subtasks, onChange }) {
  const [newText, setNewText] = useState('');

  async function handleToggle(subtaskId, checked) {
    await updateSubtask(taskId, subtaskId, { checked });
    onChange(); // tell parent to refetch, so goal progress stays accurate too
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
    <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-700">
      {subtasks.map((s) => (
        <div key={s.id} className="flex items-center justify-between group">
          <Checkbox
            checked={s.checked}
            onChange={(e) => handleToggle(s.id, e.target.checked)}
            label={s.text}
          />
          <button
            onClick={() => handleDelete(s.id)}
            className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            remove
          </button>
        </div>
      ))}

      <div className="flex gap-2 mt-1">
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add subtask..."
        />
        <Button variant="secondary" onClick={handleAdd}>Add</Button>
      </div>
    </div>
  );
}

export default SubtaskChecklist;
