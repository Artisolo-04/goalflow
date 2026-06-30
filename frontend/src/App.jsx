import { useState } from 'react'
import Checkbox from './ui/Checkbox'
import Button from './ui/Button'
import Input from './ui/Input'
import Tooltip from './ui/Tooltip'
import Dropdown from './ui/Dropdown'
import DatePicker from './ui/DatePicker'

function App() {
  const [checked, setChecked] = useState(false)
  const [text, setText] = useState('')
  const [goalChoice, setGoalChoice] = useState(null)
  const [date, setDate] = useState(null)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6">
      <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} label="Test subtask" />

      <div className="flex gap-3">
        <Button variant="primary">Save</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="danger">Delete</Button>
        <Button variant="ghost">Dismiss</Button>
      </div>

      <Input
        label="Goal title"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Get fit this year"
      />

      <Tooltip text="This deletes the task permanently">
        <Button variant="danger">Delete task</Button>
      </Tooltip>
      <Dropdown
        label="Linked goal"
        placeholder="No goal"
        value={goalChoice}
        onChange={setGoalChoice}
        options={[
          { label: 'Get fit this year', value: 1 },
          { label: 'Learn Spanish', value: 2 },
          { label: 'Save $5000', value: 3 },
        ]}
      />
      <DatePicker label="Due date" value={date} onChange={setDate} />
    </div>
  )
}

export default App
