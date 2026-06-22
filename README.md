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
  - `Dashboard.jsx` — overview dashboard with today's habits
  - `HabitsList.jsx` — complete habits list with filtering
  - `Profile.jsx` — user profile and settings
  - `Statistics.jsx` — detailed statistics and charts
  - `Landing.jsx` — landing page
  - `SignIn.jsx` — login
  - `SignUp.jsx` — register
- `services/` — simulated services / API
- `utils/` — data and storage helpers

---

## ✨ Key Features

- **Habit Management** — Create, edit, and delete habits. Search, filter, group, and sort habits by status, category, priority, and repeat frequency.
- **Daily Check-ins** — Track daily habit completion with visual progress, update completed count, add notes, reset check-ins, and mark habit completion status.
- **Goal Tracking** — Set and monitor habit goals. Receive goal alerts for progress milestones based on habit goals stored in local data.
- **Statistics & Analytics** — View detailed progress with charts and heatmaps
- **Streak Tracking** — Monitor current and best streaks
- **User Profile** — Customize profile
- **Dark/Light Theme** — Toggle between light and dark modes

---

## 🏗️ Architecture

### State Management
- **HabitContext** — manages habits
- **CheckinContext** — handles daily check-in operations
- **ThemeContext** — manages light/dark theme preference

### Custom Hooks
- `useHabits()` — habit operations and queries
- `useCheckins()` — check-in management
- `useTheme()` — theme switching
- `useDebounce()` — debounce utility for inputs
...

### UI Components
Built with **Radix UI**:
- Dialogs, dropdowns, popovers, tooltips
- Form inputs, selectors, calendars
- Custom components: HabitCard, StatCard, Charts,...
- Charts powered by **Recharts** (line, bar, heatmap)

---

## 🎨 Tech Stack

- **Frontend Framework** — React 19 with JSX
- **Routing** — React Router v7
- **Styling** — Tailwind CSS 4 with shadcn/ui components, traditional CSS
- **Build Tool** — Vite
- **Charts** — Recharts
- **UI Libraries** — Radix UI, React Aria Components
- **Icons** — Lucide React
- **Animations** — canvas-confetti, driver.js (guided tours)
- **Notifications** — React Toastify

---

### localStorage keys

| Key | What's stored |
|---|---|
| `users` | all user accounts |
| `habits` | all habits |
| `checkins` | daily check-in records |
| `goals` | habit goals and targets |
| `current_user` | the currently logged-in user |

---

## ⚠️ Known Limitations

### 1. **Responsive Design**
Several UI components and pages are not fully responsive on mobile and tablet devices. The interface was primarily designed for desktop usage. Future improvements should include:
- Mobile-optimized layouts for all pages
- Touch-friendly component sizing
- Responsive grid and chart adjustments

### 2. **targetPerDay Changes and Historical Data**
The application currently does not retroactively update historical check-in data when a habit’s targetPerDay is changed. This behavior is an intentional design decision made by the team. We chose to preserve historical progress records because users may want to adjust their goals for the future without affecting achievements that have already been completed. For example, if a user originally set a habit target to 5 times per day and successfully completed it in the past, changing the target to 7 times per day should not cause those past records to become incomplete. However, this approach introduces some limitations:

- Progress percentages may be calculated using different target values across different time periods.
- Statistics and charts can be harder to interpret when a habit’s target has changed multiple times.

At the current stage of development, the team has chosen to prioritize preserving historical user achievements rather than recalculating past records. As a result, users should be aware that changing targetPerDay may lead to inconsistencies in long-term statistical analysis.


Future improvement: The team will continue to explore and evaluate better approaches in future releases to provide a more accurate and intuitive experience while preserving the integrity of users’ history.



---

<div align="center">

*Small habits. Big life.* 🌸

</div>
