# TaskFlow — Simple Task Manager

A lightweight task manager built with **React + Vite**, ready to deploy on **Vercel** from **GitHub**.

## Features

- **Add tasks** with a title, description, start date, due date, priority and status
- **Track progress** using a checklist (progress is calculated automatically) or a manual slider
- **Schedule health:** each task is marked *On track*, *Behind schedule*, *Overdue* or *Done* by comparing actual progress with where it should be between its start and due dates
- **Dashboard** with totals, overall progress, a *Needs attention* list, deadlines in the next 7 days and recent updates
- **Timeline view** showing each task as a bar from start to due date, with a line for today
- **Update log** on every task: changes to status, progress and due date are recorded automatically, and you can post your own notes
- **Browser reminders** for tasks that are overdue, due today or due tomorrow (click *🔔 Enable reminders*)
- Search, filter and sort tasks
- **Backup:** export or import all tasks as a JSON file (⋯ menu)

Data is saved in your browser (localStorage). No database or login is needed.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Deploy with GitHub + Vercel

1. **Create a GitHub repo** (e.g. `taskflow`) and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/taskflow.git
   git push -u origin main
   ```
2. Go to **vercel.com → Add New → Project**, then import the `taskflow` repo.
3. Vercel detects **Vite** automatically (build command `npm run build`, output `dist`). Click **Deploy**.
4. Every time you push to `main` after that, Vercel redeploys automatically.

## Good to know

- **Data is stored per browser and per device.** Tasks you add on your laptop won't appear on your phone. Use *Export backup* / *Import backup* to move them. If you need syncing across devices, add a database later (for example Supabase or Vercel Postgres).
- **Reminders appear only while the app is open** in a browser tab, because this version has no server. The app checks every 15 minutes and notifies you once a day per task.
- Three example tasks are added on your first visit. Delete them, or use *⋯ → Delete all tasks*.

## Project structure

```
taskflow/
├── index.html
├── package.json
├── vercel.json
├── vite.config.js
├── public/favicon.svg
└── src/
    ├── main.jsx            # entry point
    ├── App.jsx             # layout, navigation, modal
    ├── styles.css          # all styling
    ├── utils.js            # dates, progress and schedule-health logic
    ├── useTasks.js         # task storage and the automatic update log
    ├── useReminders.js     # browser notifications
    └── components/
        ├── Dashboard.jsx
        ├── TaskList.jsx
        ├── TaskCard.jsx
        ├── TaskForm.jsx
        ├── Timeline.jsx
        └── ProgressBar.jsx
```
