import { useMemo, useState } from 'react';
import { sortTasks, STATUS, PRIORITY } from '../utils.js';
import TaskCard from './TaskCard.jsx';

export default function TaskList({ tasks, onEdit, onUpdate, onDelete, onNote, onNew }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('active');
  const [priority, setPriority] = useState('all');
  const [sortBy, setSortBy] = useState('due');

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = tasks.filter((t) => {
      if (status === 'active' && t.status === 'done') return false;
      if (status !== 'active' && status !== 'all' && t.status !== status) return false;
      if (priority !== 'all' && t.priority !== priority) return false;
      if (term && !`${t.title} ${t.description}`.toLowerCase().includes(term)) return false;
      return true;
    });
    return sortTasks(list, sortBy);
  }, [tasks, q, status, priority, sortBy]);

  return (
    <div>
      <div className="filters">
        <input className="search" placeholder="Search tasks…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active (not done)</option>
          <option value="all">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">All priorities</option>
          {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="due">Sort: Due date</option>
          <option value="priority">Sort: Priority</option>
          <option value="progress">Sort: Least progress</option>
          <option value="created">Sort: Newest</option>
        </select>
      </div>

      {shown.length ? (
        <div className="cards">
          {shown.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={onEdit} onUpdate={onUpdate} onDelete={onDelete} onNote={onNote} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>No tasks match these filters.</p>
          <button className="btn primary" onClick={onNew}>+ New task</button>
        </div>
      )}
    </div>
  );
}
