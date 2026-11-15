import { useEffect, useState } from 'react';
import { uid, STATUS, PRIORITY, toISODate, addDays, todayStart } from '../utils.js';

const blank = () => ({
  title: '',
  description: '',
  startDate: toISODate(todayStart()),
  dueDate: toISODate(addDays(todayStart(), 7)),
  priority: 'medium',
  status: 'todo',
  progress: 0,
  subtasks: [],
});

export default function TaskForm({ task, onSave, onCancel, onDelete }) {
  const [f, setF] = useState(() => (task ? { ...blank(), ...task } : blank()));
  const [newSub, setNewSub] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'range' ? Number(e.target.value) : e.target.value });

  const addSub = () => {
    if (!newSub.trim()) return;
    setF({ ...f, subtasks: [...f.subtasks, { id: uid(), text: newSub.trim(), done: false }] });
    setNewSub('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!f.title.trim()) return setError('Please give the task a title.');
    if (f.startDate && f.dueDate && f.dueDate < f.startDate) return setError('Due date must be on or after the start date.');
    const { id, createdAt, activity, ...data } = f; // never overwrite these from the form
    onSave({ ...data, title: f.title.trim() });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form className="modal" onSubmit={submit}>
        <h2>{task ? 'Edit task' : 'New task'}</h2>

        <label className="field">
          <span>Title *</span>
          <input autoFocus value={f.title} onChange={set('title')} placeholder="e.g. Prepare monthly report" />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea rows="3" value={f.description} onChange={set('description')} placeholder="Optional details" />
        </label>

        <div className="row">
          <label className="field">
            <span>Start date</span>
            <input type="date" value={f.startDate} onChange={set('startDate')} />
          </label>
          <label className="field">
            <span>Due date</span>
            <input type="date" value={f.dueDate} onChange={set('dueDate')} />
          </label>
        </div>

        <div className="row">
          <label className="field">
            <span>Priority</span>
            <select value={f.priority} onChange={set('priority')}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={f.status} onChange={set('status')}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>

        <div className="field">
          <span>Checklist (progress is calculated from ticked items)</span>
          {f.subtasks.map((s) => (
            <div key={s.id} className="sub-row">
              <input
                type="checkbox"
                checked={s.done}
                onChange={() => setF({ ...f, subtasks: f.subtasks.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)) })}
              />
              <input
                className="sub-text"
                value={s.text}
                onChange={(e) => setF({ ...f, subtasks: f.subtasks.map((x) => (x.id === s.id ? { ...x, text: e.target.value } : x)) })}
              />
              <button type="button" className="btn small ghost" onClick={() => setF({ ...f, subtasks: f.subtasks.filter((x) => x.id !== s.id) })}>✕</button>
            </div>
          ))}
          <div className="sub-row">
            <input
              className="sub-text"
              value={newSub}
              placeholder="Add a checklist item and press Enter"
              onChange={(e) => setNewSub(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }}
            />
            <button type="button" className="btn small" onClick={addSub}>Add</button>
          </div>
        </div>

        {f.subtasks.length === 0 && (
          <label className="field">
            <span>Progress: {f.progress}%</span>
            <input type="range" min="0" max="100" step="5" value={f.progress} onChange={set('progress')} />
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          {onDelete && <button type="button" className="btn ghost danger-text" onClick={onDelete}>Delete</button>}
          <div className="spacer" />
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn primary">{task ? 'Save changes' : 'Add task'}</button>
        </div>
      </form>
    </div>
  );
}
