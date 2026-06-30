import { useState } from 'react'
import AppLayout from './layout/AppLayout'
import GoalsPage from './pages/GoalsPage'
import TasksPage from './pages/TasksPage'
import CalendarPage from './pages/CalendarPage'

function App() {
  const [activeTab, setActiveTab] = useState('goals')

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'goals' && <GoalsPage />}
      {activeTab === 'tasks' && <TasksPage />}
      {activeTab === 'calendar' && <CalendarPage />}
    </AppLayout>
  )
}

export default App
