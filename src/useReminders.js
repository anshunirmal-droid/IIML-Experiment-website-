import { useEffect, useState } from 'react';
import { dueInfo } from './utils.js';

const SENT_KEY = 'taskflow.notified.v1';
const supported = typeof window !== 'undefined' && 'Notification' in window;

/**
 * Browser notifications for tasks that are overdue, due today or due tomorrow.
 * Each task notifies at most once per day. Works while the app is open in a tab.
 */
export function useReminders(tasks) {
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');

  useEffect(() => {
    if (permission !== 'granted') return;

    const check = () => {
      let sent = {};
      try {
        sent = JSON.parse(localStorage.getItem(SENT_KEY)) || {};
      } catch {
        /* ignore */
      }
      const day = new Date().toDateString();
      tasks.forEach((t) => {
        if (t.status === 'done') return;
        const info = dueInfo(t);
        if (info.tone !== 'danger' && info.tone !== 'warn') return;
        if (sent[t.id] === day) return;
        try {
          new Notification(`⏰ ${t.title}`, { body: info.label, icon: '/favicon.svg', tag: t.id });
          sent[t.id] = day;
        } catch {
          /* some mobile browsers block the constructor */
        }
      });
      localStorage.setItem(SENT_KEY, JSON.stringify(sent));
    };

    check();
    const timer = setInterval(check, 15 * 60 * 1000); // every 15 minutes
    return () => clearInterval(timer);
  }, [tasks, permission]);

  const enable = async () => {
    if (!supported) return;
    const p = await Notification.requestPermission();
    setPermission(p);
  };

  return { permission, enable };
}
