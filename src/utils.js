// ---------- Helpers for dates, progress and status ----------

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

export const STATUS = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

export const PRIORITY = { low: 'Low', medium: 'Medium', high: 'High' };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** "2026-11-15" -> Date (local midnight) */
export const parseDate = (s) => (s ? new Date(s + 'T00:00:00') : null);

/** Date -> "2026-11-15" */
export const toISODate = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const daysBetween = (a, b) => Math.round((b - a) / 86400000);

export const fmtDate = (s) =>
  s
    ? parseDate(s).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Days from today until the due date (negative = overdue). null if no due date. */
export const daysUntilDue = (t) => {
  const due = parseDate(t.dueDate);
  return due ? daysBetween(todayStart(), due) : null;
};

/** Progress 0–100. Uses the checklist when there is one, otherwise the manual slider. */
export function progressOf(t) {
  if (t.status === 'done') return 100;
  if (t.subtasks && t.subtasks.length) {
    const done = t.subtasks.filter((s) => s.done).length;
    return Math.round((done / t.subtasks.length) * 100);
  }
  return Number(t.progress) || 0;
}

/** Where progress *should* be today, based on start → due timeline. */
export function expectedProgress(t) {
  const s = parseDate(t.startDate);
  const e = parseDate(t.dueDate);
  if (!s || !e || e <= s) return null;
  const p = (todayStart() - s) / (e - s);
  return Math.max(0, Math.min(100, Math.round(p * 100)));
}

/** Friendly due label + tone for colouring. */
export function dueInfo(t) {
  if (t.status === 'done') return { label: 'Completed', tone: 'done' };
  const d = daysUntilDue(t);
  if (d === null) return { label: 'No due date', tone: 'muted' };
  if (d < 0) return { label: `Overdue by ${-d} day${-d > 1 ? 's' : ''}`, tone: 'danger' };
  if (d === 0) return { label: 'Due today', tone: 'warn' };
  if (d === 1) return { label: 'Due tomorrow', tone: 'warn' };
  if (d <= 7) return { label: `Due in ${d} days`, tone: 'info' };
  return { label: `Due ${fmtDate(t.dueDate)}`, tone: 'muted' };
}

/** on-track | behind | overdue | done */
export function health(t) {
  if (t.status === 'done') return 'done';
  const d = daysUntilDue(t);
  if (d !== null && d < 0) return 'overdue';
  const exp = expectedProgress(t);
  if (exp === null) return 'on-track';
  return progressOf(t) + 15 < exp ? 'behind' : 'on-track';
}

export const HEALTH_LABEL = {
  'on-track': 'On track',
  behind: 'Behind schedule',
  overdue: 'Overdue',
  done: 'Done',
};

export function sortTasks(list, by) {
  const arr = [...list];
  const dueVal = (t) => (t.dueDate ? parseDate(t.dueDate).getTime() : Infinity);
  if (by === 'due') arr.sort((a, b) => dueVal(a) - dueVal(b));
  if (by === 'priority')
    arr.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || dueVal(a) - dueVal(b));
  if (by === 'progress') arr.sort((a, b) => progressOf(a) - progressOf(b));
  if (by === 'created') arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return arr;
}
