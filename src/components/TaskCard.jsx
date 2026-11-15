import { useState } from 'react';
import {
  progressOf, expectedProgress, dueInfo, health, HEALTH_LABEL, STATUS, PRIORITY, fmtDate, fmtDateTime,
} from '../utils.js';
import ProgressBar from './ProgressBar.jsx';

export default function TaskCard({ task: t, onEdit, onUpdate, onDelete, onNote }) {
  const [showLog, setShowLog] = useState(false);
  const [note, setNote] = useState('');

  const pct = progressOf(t);
  const h = health(t);
  const info = dueInfo(t);
  const hasChecklist = t.subtasks && t.subtasks.length > 0;

  const toggleSub = (id) =>
    onUpdate(t.id, { subtasks: t.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) });

  const submitNote = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    onNote(t.id, note.trim());
    setNote('');
    setShowLog(true);
  };

  return (
    <article className={`card ${t.status === 'done' ? 'is-done' : ''}`}>
      <header className="card-head">
        <h4 onClick={() => onEdit(t)}>{t.title}</h4>
        <span className={`tag p-${t.priority}`}>{PRIORITY[t.priority]}</span>
      </header>

      {t.description && <p className="card-desc">{t.description}</p>}

      <div className="card-meta">
        <span>📆 {fmtDate(t.startDate)} → {fmtDate(t.dueDate)}</span>
        <span className={`tag t-${info.tone}`}>{info.label}</span>
      </div>

      <div className="card-progress">
        <ProgressBar value={pct} expected={expectedProgress(t)} tone={h} />
        <span className="pct">{pct}%</span>
      </div>
      <div className={`health h-${h}-text`}>{HEALTH_LABEL[h]}</div>

      {hasChecklist ? (
        <ul className="checklist">
          {t.subtasks.map((s) => (
            <li key={s.id}>
              <label>
                <input type="checkbox" checked={s.done} onChange={() => toggleSub(s.id)} />
                <span className={s.done ? 'struck' : ''}>{s.text}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        t.status !== 'done' && (
          <input
            className="slider"
            type="range" min="0" max="100" step="5"
            value={t.progress || 0}
            onChange={(e) => onUpdate(t.id, { progress: Number(e.target.value) })}
            aria-label="Progress"
          />
        )
      )}

      <div className="card-actions">
        <select value={t.status} onChange={(e) => onUpdate(t.id, { status: e.target.value })}>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn small ghost" onClick={() => setShowLog((s) => !s)}>
          Updates ({(t.activity || []).length})
        </button>
        <button className="btn small ghost" onClick={() => onEdit(t)}>Edit</button>
        <button
          className="btn small ghost danger-text"
          onClick={() => confirm(`Delete "${t.title}"?`) && onDelete(t.id)}
        >
          Delete
        </button>
      </div>

      <form className="note-form" onSubmit={submitNote}>
        <input placeholder="Add a progress update…" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn small" type="submit">Post</button>
      </form>

      {showLog && (
        <ul className="feed small">
          {(t.activity || []).map((a) => (
            <li key={a.id}>
              {a.text}
              <div className="feed-time">{fmtDateTime(a.at)}</div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
