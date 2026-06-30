import { useState } from 'react'
import GoalsPage from './pages/GoalsPage'
import TasksPage from './pages/TasksPage'

const TABS = [
  { id: 'goals', label: 'Goals' },
  { id: 'tasks', label: 'Tasks' },
]

function App() {
  const [activeTab, setActiveTab] = useState('goals')

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="border-b border-gray-800 px-6 py-3 flex gap-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'goals' && <GoalsPage />}
      {activeTab === 'tasks' && <TasksPage />}
    </div>
  )
}

export default App
