<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&size=42&duration=3000&pause=1000&color=b94d8e&center=true&vCenter=true&width=600&height=80&lines=1%25+better.;Every+single+day." alt="1Percent" />

</div>

# 1Percent — Habit Tracker

> *1% better. Every single day.*

A habit tracking app built with **React** and **Vite**. Uses mock data to seed initial state and stores everything in `localStorage`.

---

## 📖 About the Project

**1Percent** is a habit tracking web application designed to help users build positive daily routines through consistent check-ins, measurable goals, and progress tracking.

The application enables users to create and manage habits, track daily progress, monitor streaks, and visualize performance through an interactive dashboard. It emphasizes clear business logic, efficient state management, and a user-friendly experience.

All data is stored locally using **localStorage**, allowing users to continue tracking their habits even after refreshing the browser without requiring a backend service.

---

## 🚀 Getting started

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

---

## 📁 Project structure

- `index.html` — root HTML file for Vite
- `package.json` — package config, scripts and dependencies
- `vite.config.js` — Vite configuration
- `src/` — main application source code

### Inside `src/`

- `main.jsx` — app entry point
- `App.jsx` — route config and shared layout
- `index.css` — global styles
- `mockData.js` — sample data for users, habits, check-ins and goals
- `assets/` — images and static resources
- `components/` — reusable components
- `context/` — state management / context
- `hooks/` — custom hooks
- `lib/` — shared helpers
- `pages/` — main screens
  - `Dashboard.jsx` — overview dashboard
  - `HabitsList.jsx` — habits list
  - `Landing.jsx` — landing page
  - `SignIn.jsx` — login
  - `SignUp.jsx` — register
- `services/` — simulated internal services / API
  - `auth.js` — sign in / sign up logic
  - `habits.js` — habit read/write logic
- `utils/` — data and storage helpers
  - `initializeData.js` — seeds data from mock on first run
  - `storage.js` — read/write to `localStorage`

---

## 🧠 How mock data and storage works

### `src/mockData.js`

Contains the initial sample data including:
- `users` — demo user accounts
- `habits` — sample habits per user
- `checkins` — check-in records
- `goals` — habit goals

### `src/utils/storage.js`

Wraps all `localStorage` interactions:
- `get(key, defaultValue)` — read and parse JSON
- `set(key, value)` — stringify and save
- `remove(key)` — delete a key
- `clear()` — wipe all localStorage

### `src/utils/initializeData.js`

On startup, `initializeData()` checks if localStorage already has:
- `users`
- `habits`
- `checkins`
- `goals`

If not, it seeds them from `mockData` and saves to localStorage.

> This means the first time you open the app, sample data is ready to go. After that, any changes you make are saved and won't be lost on refresh.

### localStorage keys

| Key | What's stored |
|---|---|
| `users` | all user accounts |
| `habits` | all habits |
| `checkins` | daily check-in records |
| `goals` | habit goals and targets |
| `current_user` | the currently logged-in user |

---

## 🔧 App flow

1. User opens the app
2. `initializeData()` seeds sample data if localStorage is empty
3. User signs in or signs up via `SignIn` / `SignUp`
4. Habit data loads from localStorage and renders
5. When the user creates, edits or deletes a habit, it saves back to localStorage

---

## 📝 Notes

- To reset data, clear localStorage in your browser DevTools or call `storage.clear()` in code
- The app currently uses mock data — no real backend connected
- Easy to extend to a REST API later if needed

---

<div align="center">

*Small habits. Big life.* 🌸

</div>
