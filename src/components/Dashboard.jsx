import { progressOf, dueInfo, daysUntilDue, health, HEALTH_LABEL, fmtDateTime, expectedProgress } from '../utils.js';
import ProgressBar from './ProgressBar.jsx';

function Stat({ label, value, tone }) {
  return (
    <div className={`stat ${tone || ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function UpdateRow({ task, onOpen }) {
  const info = dueInfo(task);
  const h = health(task);
  return (
    <button className="update-row" onClick={() => onOpen(task)}>
      <span className={`dot h-${h}`} />
      <span className="update-title">{task.title}</span>
      <span className={`tag t-${info.tone}`}>{info.label}</span>
      <span className="update-pct">{progressOf(task)}%</span>
    </button>
  );
}

export default function Dashboard({ tasks, onOpen, onNew }) {
  if (!tasks.length) {
    return (
      <div className="empty">
        <h2>No tasks yet</h2>
        <p>Add your first task to start tracking progress.</p>
        <button className="btn primary" onClick={onNew}>+ New task</button>
      </div>
    );
  }

  const active = tasks.filter((t) => t.status !== 'done');
  const done = tasks.length - active.length;
  const overdue = active.filter((t) => health(t) === 'overdue');
  const dueSoon = active
    .filter((t) => {
      const d = daysUntilDue(t);
      return d !== null && d >= 0 && d <= 7;
    })
    .sort((a, b) => daysUntilDue(a) - daysUntilDue(b));
  const behind = active.filter((t) => health(t) === 'behind');
  const inProgress = active.filter((t) => t.status === 'in-progress').length;
  const overall = Math.round(tasks.reduce((s, t) => s + progressOf(t), 0) / tasks.length);

  const activity = tasks
    .flatMap((t) => (t.activity || []).map((a) => ({ ...a, task: t })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);

  const needsAttention = [...overdue, ...behind.filter((t) => !overdue.includes(t))];

  return (
    <div className="dashboard">
      <section className="stats">
        <Stat label="Total tasks" value={tasks.length} />
        <Stat label="In progress" value={inProgress} tone="info" />
        <Stat label="Completed" value={done} tone="ok" />
        <Stat label="Overdue" value={overdue.length} tone={overdue.length ? 'danger' : ''} />
        <div className="stat wide">
          <div className="stat-label">Overall progress</div>
          <div className="overall">
            <ProgressBar value={overall} />
            <strong>{overall}%</strong>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <h3>⚠️ Needs attention</h3>
          {needsAttention.length ? (
            needsAttention.map((t) => <UpdateRow key={t.id} task={t} onOpen={onOpen} />)
          ) : (
            <p className="muted">Nothing overdue or behind schedule. Nice work!</p>
          )}
        </section>

        <section className="panel">
          <h3>📅 Due in the next 7 days</h3>
          {dueSoon.length ? (
            dueSoon.map((t) => <UpdateRow key={t.id} task={t} onOpen={onOpen} />)
          ) : (
            <p className="muted">No upcoming deadlines this week.</p>
          )}
        </section>

        <section className="panel">
          <h3>📈 Active task progress</h3>
          {active.length ? (
            active.map((t) => {
              const h = health(t);
              return (
                <button key={t.id} className="progress-row" onClick={() => onOpen(t)}>
                  <div className="progress-row-head">
                    <span>{t.title}</span>
                    <span className={`tag h-${h}-tag`}>{HEALTH_LABEL[h]}</span>
                  </div>
                  <ProgressBar value={progressOf(t)} expected={expectedProgress(t)} tone={h} />
                </button>
              );
            })
          ) : (
            <p className="muted">All tasks completed 🎉</p>
          )}
          <p className="hint">The thin line on each bar shows where progress should be today, based on start and due dates.</p>
        </section>

        <section className="panel">
          <h3>🕒 Recent updates</h3>
          {activity.length ? (
            <ul className="feed">
              {activity.map((a) => (
                <li key={a.id}>
                  <button className="link" onClick={() => onOpen(a.task)}>{a.task.title}</button>
                  <span> — {a.text}</span>
                  <div className="feed-time">{fmtDateTime(a.at)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No updates yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
