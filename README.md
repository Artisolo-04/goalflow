# 🎯 GoalFlow

**GoalFlow** is a full-stack productivity app for turning goals into action. Set goals, break them into tasks and subtasks, tag and prioritize everything, and track it all on a calendar — with live progress bars that update automatically as you complete work.

Built as a personal full-stack project with a custom React UI (no component libraries) and a Node/Express + PostgreSQL API.

---

## ✨ Features

### 🎯 Goals
- Create goals with a title, optional description, color, and target date
- Assign tags to goals
- Automatic **progress bar** calculated live from linked tasks
- Status badges (Not started / In progress / Complete)
- Search, filter by status, and sort
- Goal detail panel to link existing tasks or create new tasks directly from a goal

### ✅ Tasks
- Create tasks with a due date and priority (**Low / Medium / High / Urgent**)
- Link tasks to a goal
- Break tasks into **subtasks** with an animated progress bar
- Tag tasks with multiple color-coded tags
- Inline editing for title and due date
- Filter by status, priority, and tags; sort by newest/oldest
- Overdue detection with visual indicators

### 📅 Calendar
- Full month grid view with a "today" marker
- Color-coded priority dots per day showing task load at a glance
- Click any day to open a detail panel — view, add, and delete tasks for that date

### 🏷️ Tags
- Centralized tag management page
- Create, rename, recolor (12-color palette), and delete tags
- Usage indicator showing how many tasks use each tag
- Reusable tag picker shared across Goals and Tasks

### 🔔 Quality-of-life
- App-wide toast notifications for success/error feedback
- Fully responsive layout — adaptive icon/label navigation, mobile bottom nav with safe-area support
- Custom-built UI primitives: Modal, Dropdown, DatePicker, Checkbox, Button, Input, Tooltip, ScrollArea

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS v4
- Custom UI component library (no external UI kit)

**Backend**
- Node.js + Express
- PostgreSQL (`pg`)
- SQL migrations for schema evolution
- Centralized error handling (`asyncHandler` + global error middleware)
- Request validation middleware
- Automated tests with `node:test` (progress rollup math)

---

## 📁 Project Structure

goalflow/
├── backend/
│   ├── db/
│   │   ├── migrations/        # SQL migrations
│   │   ├── pool.js            # PostgreSQL connection pool
│   │   └── schema.sql
│   ├── middleware/
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── goals.js
│   │   ├── tags.js
│   │   └── tasks.js
│   ├── tests/
│   │   └── progress.test.js
│   └── server.js
└── frontend/
├── src/
│   ├── api/                # API client functions (goals, tasks, tags)
│   ├── components/         # Feature components (GoalCard, CalendarGrid, TaskItem, etc.)
│   ├── context/            # ToastContext
│   ├── layout/             # AppLayout, DesktopNav, MobileNav
│   ├── lib/                # date & priority helpers
│   ├── pages/               # GoalsPage, TasksPage, CalendarPage, TagsPage
│   └── ui/                 # Custom UI primitives (Modal, Dropdown, DatePicker, etc.)
└── vite.config.js

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL running locally or accessible remotely

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/goalflow.git
cd goalflow
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with your database connection:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/goalflow
PORT=3000
```

Create the database and run the schema + migrations:
```bash
psql -U username -d goalflow -f db/schema.sql
psql -U username -d goalflow -f db/migrations/001_add_task_priority.sql
psql -U username -d goalflow -f db/migrations/002_add_goal_description_color_tags.sql
psql -U username -d goalflow -f db/migrations/003_expand_colors.sql
```

Start the backend:
```bash
npm start
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
npm run dev
```

The app should now be running locally (Vite will print the local URL, typically `http://localhost:5173`), connected to the API on the port set in your `.env`.

---

## 🧪 Testing

Backend progress-rollup logic is covered by an automated test:
```bash
cd backend
node --test tests/progress.test.js
```

---

## 🗺️ Roadmap Ideas

- User accounts / authentication
- Recurring tasks
- Drag-and-drop task reordering
- Deployed live demo

---

## 📄 License

No license has been chosen yet — all rights reserved by default until one is added.
