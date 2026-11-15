import { useRef, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import TaskList from './components/TaskList.jsx';
import Timeline from './components/Timeline.jsx';
import TaskForm from './components/TaskForm.jsx';
import { useTasks } from './useTasks.js';
import { useReminders } from './useReminders.js';

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'timeline', label: 'Timeline' },
];

export default function App() {
  const store = useTasks();
  const { permission, enable } = useReminders(store.tasks);
  const [view, setView] = useState('dashboard');
  const [editing, setEditing] = useState(null); // null | 'new' | task object
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef(null);

  const openTask = (task) => setEditing(task);

  const save = (data) => {
    if (editing === 'new') store.addTask(data);
    else store.updateTask(editing.id, data);
    setEditing(null);
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = await store.importJSON(file);
      alert(`Imported ${n} tasks.`);
    } catch {
      alert('That file could not be imported.');
    }
    e.target.value = '';
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span>TaskFlow</span>
        </div>

        <nav className="tabs">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={view === v.id ? 'tab active' : 'tab'}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </nav>

        <div className="actions">
          {permission !== 'granted' && permission !== 'unsupported' && (
            <button className="btn ghost" onClick={enable} title="Get reminders for due & overdue tasks">
              🔔 Enable reminders
            </button>
          )}
          {permission === 'granted' && <span className="pill ok">🔔 Reminders on</span>}

          <div className="menu-wrap">
            <button className="btn ghost" onClick={() => setMenuOpen((o) => !o)} aria-label="More">⋯</button>
            {menuOpen && (
              <div className="menu" onMouseLeave={() => setMenuOpen(false)}>
                <button onClick={() => { store.exportJSON(); setMenuOpen(false); }}>Export backup (.json)</button>
                <button onClick={() => { fileRef.current.click(); setMenuOpen(false); }}>Import backup</button>
                <button
                  className="danger-text"
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm('Delete ALL tasks? This cannot be undone.')) store.clearAll();
                  }}
                >
                  Delete all tasks
                </button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} />
          </div>

          <button className="btn primary" onClick={() => setEditing('new')}>+ New task</button>
        </div>
      </header>

      <main className="content">
        {view === 'dashboard' && <Dashboard tasks={store.tasks} onOpen={openTask} onNew={() => setEditing('new')} />}
        {view === 'tasks' && (
          <TaskList
            tasks={store.tasks}
            onEdit={openTask}
            onUpdate={store.updateTask}
            onDelete={store.deleteTask}
            onNote={store.addNote}
            onNew={() => setEditing('new')}
          />
        )}
        {view === 'timeline' && <Timeline tasks={store.tasks} onOpen={openTask} />}
      </main>

      {editing && (
        <TaskForm
          task={editing === 'new' ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
          onDelete={
            editing !== 'new'
              ? () => {
                  if (confirm('Delete this task?')) {
                    store.deleteTask(editing.id);
                    setEditing(null);
                  }
                }
              : null
          }
        />
      )}
    </div>
  );
}
