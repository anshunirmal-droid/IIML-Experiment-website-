import { useEffect, useState } from 'react';
import { uid, STATUS, progressOf, toISODate, addDays, todayStart } from './utils.js';

const KEY = 'taskflow.tasks.v1';

const entry = (text) => ({ id: uid(), at: new Date().toISOString(), text });
const withLog = (task, text) => ({ ...task, activity: [entry(text), ...(task.activity || [])] });

/** A few example tasks so the app isn't empty on first visit. */
function sampleTasks() {
  const t = todayStart();
  const d = (n) => toISODate(addDays(t, n));
  const now = new Date().toISOString();
  return [
    {
      id: uid(), title: 'Plan Q1 launch', description: 'Outline goals, owners and milestones.',
      startDate: d(-5), dueDate: d(4), priority: 'high', status: 'in-progress', progress: 0,
      subtasks: [
        { id: uid(), text: 'Draft goals', done: true },
        { id: uid(), text: 'Assign owners', done: true },
        { id: uid(), text: 'Set milestones', done: false },
        { id: uid(), text: 'Review with team', done: false },
      ],
      createdAt: now, activity: [entry('Task created (example)')],
    },
    {
      id: uid(), title: 'Send client proposal', description: '',
      startDate: d(-7), dueDate: d(-1), priority: 'medium', status: 'in-progress', progress: 60,
      subtasks: [], createdAt: now, activity: [entry('Task created (example)')],
    },
    {
      id: uid(), title: 'Update website copy', description: 'Home and pricing pages.',
      startDate: d(1), dueDate: d(12), priority: 'low', status: 'todo', progress: 0,
      subtasks: [], createdAt: now, activity: [entry('Task created (example)')],
    },
  ];
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : sampleTasks();
  } catch {
    return [];
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks));
    } catch {
      /* storage full or unavailable */
    }
  }, [tasks]);

  const addTask = (data) =>
    setTasks((ts) => [
      withLog({ ...data, id: uid(), createdAt: new Date().toISOString(), activity: [] }, 'Task created'),
      ...ts,
    ]);

  /** Update a task and automatically log what changed. Optional `note` adds a manual update. */
  const updateTask = (id, patch, note) =>
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch, updatedAt: new Date().toISOString() };
        const notes = [];
        if (patch.status && patch.status !== t.status) notes.push(`Status → ${STATUS[patch.status]}`);
        if (patch.dueDate !== undefined && patch.dueDate !== t.dueDate)
          notes.push(`Due date changed to ${patch.dueDate || 'none'}`);
        const before = progressOf(t);
        const after = progressOf(next);
        if (before !== after) notes.push(`Progress ${before}% → ${after}%`);
        if (note) notes.push(note);
        return notes.reduce(withLog, next);
      })
    );

  const deleteTask = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const addNote = (id, text) => updateTask(id, {}, `📝 ${text}`);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `taskflow-backup-${toISODate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJSON = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!Array.isArray(data)) throw new Error('Invalid file');
          setTasks(data);
          resolve(data.length);
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsText(file);
    });

  const clearAll = () => setTasks([]);

  return { tasks, addTask, updateTask, deleteTask, addNote, exportJSON, importJSON, clearAll };
}
