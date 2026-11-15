import { parseDate, addDays, daysBetween, todayStart, progressOf, health, HEALTH_LABEL, fmtDate } from '../utils.js';

/** Gantt-style view: one bar per task from start date to due date. */
export default function Timeline({ tasks, onOpen }) {
  const rows = tasks
    .filter((t) => t.dueDate)
    .map((t) => {
      const end = parseDate(t.dueDate);
      const start = parseDate(t.startDate) || (t.createdAt ? new Date(new Date(t.createdAt).setHours(0, 0, 0, 0)) : end);
      return { t, start: start <= end ? start : end, end };
    })
    .sort((a, b) => a.start - b.start);

  if (!rows.length) {
    return (
      <div className="empty">
        <p>Add due dates to your tasks to see them on the timeline.</p>
      </div>
    );
  }

  const today = todayStart();
  const min = addDays(new Date(Math.min(...rows.map((r) => r.start), today)), -2);
  const max = addDays(new Date(Math.max(...rows.map((r) => r.end), today)), 3);
  const totalDays = daysBetween(min, max) + 1;
  const pos = (d) => (daysBetween(min, d) / totalDays) * 100;

  // Choose tick spacing so the header doesn't get crowded.
  const step = totalDays <= 14 ? 1 : totalDays <= 45 ? 7 : totalDays <= 120 ? 14 : 30;
  const ticks = [];
  for (let d = new Date(min); d <= max; d = addDays(d, step)) ticks.push(new Date(d));

  const undated = tasks.length - rows.length;

  return (
    <div className="panel timeline">
      <div className="tl-header">
        <div className="tl-label-col" />
        <div className="tl-track">
          {ticks.map((d) => (
            <span key={d.toISOString()} className="tl-tick" style={{ left: `${pos(d)}%` }}>
              {d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </span>
          ))}
        </div>
      </div>

      {rows.map(({ t, start, end }) => {
        const h = health(t);
        const pct = progressOf(t);
        const left = pos(start);
        const width = Math.max(((daysBetween(start, end) + 1) / totalDays) * 100, 1.5);
        return (
          <div className="tl-row" key={t.id}>
            <button className="tl-label-col link" onClick={() => onOpen(t)} title={t.title}>
              {t.title}
            </button>
            <div className="tl-track">
              <div className="tl-today" style={{ left: `${pos(today)}%` }} />
              <button
                className={`tl-bar ${h}-light`}
                style={{ left: `${left}%`, width: `${width}%` }}
                onClick={() => onOpen(t)}
                title={`${t.title}\n${fmtDate(t.startDate)} → ${fmtDate(t.dueDate)}\n${pct}% · ${HEALTH_LABEL[h]}`}
              >
                <span className={`tl-fill h-${h}`}style={{ width: `${pct}%` }} />
                <span className="tl-text">{pct}%</span>
              </button>
            </div>
          </div>
        );
      })}

      <div className="legend">
        <span><i className="dot h-on-track" /> On track</span>
        <span><i className="dot h-behind" /> Behind</span>
        <span><i className="dot h-overdue" /> Overdue</span>
        <span><i className="dot h-done" /> Done</span>
        <span><i className="legend-today" /> Today</span>
        {undated > 0 && <span className="muted">{undated} task(s) without a due date not shown</span>}
      </div>
    </div>
  );
}
