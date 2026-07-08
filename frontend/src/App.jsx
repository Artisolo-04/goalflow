import { useState } from 'react'
import AppLayout from './layout/AppLayout'
import GoalsPage from './pages/GoalsPage'
import TasksPage from './pages/TasksPage'
import CalendarPage from './pages/CalendarPage'
import TagsPage from './pages/TagsPage'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './ui/ToastContainer'

function App() {
  const [activeTab, setActiveTab] = useState('goals')
  return (
    <ToastProvider>
      <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'goals' && <GoalsPage />}
        {activeTab === 'tasks' && <TasksPage />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'tags' && <TagsPage />}
      </AppLayout>
      <ToastContainer />
    </ToastProvider>
  )
}
export default App
