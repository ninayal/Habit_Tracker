import { useMemo, useState } from "react";
import { mockHabits, mockCheckins, mockGoals } from "@/mockData";
import "./styles/Dashboard.css";

const DEMO_USER_ID = 1;

// Dữ liệu mockData.js của bạn đang chủ yếu ở tháng 05/2026.
// Để dashboard demo có số liệu đẹp, mình dùng ngày này.
// Sau này muốn dùng ngày hiện tại thật thì đổi thành: getTodayKey()
const DASHBOARD_DATE = "2026-05-30";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateKey, amount) {
  const date = new Date(dateKey);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function normalizeStatus(status) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  if (status === "failed") return "At Risk";
  if (status === "skipped") return "Not Started";
  return "Not Started";
}

function getColorByCategory(category) {
  if (category === "Health") return "pink";
  if (category === "Study") return "blue";
  if (category === "Work") return "green";
  if (category === "Mindfulness") return "yellow";
  return "purple";
}

function getCheckinForDate(habitId, dateKey, checkins) {
  return checkins.find(
    (checkin) =>
      Number(checkin.habitId) === Number(habitId) &&
      checkin.date === dateKey
  );
}

function isCompleted(checkin, habit) {
  if (!checkin) return false;

  return (
    checkin.completionStatus === "completed" ||
    Number(checkin.completedCount) >= Number(habit.targetPerDay)
  );
}

function getCurrentStreak(habit, checkins, todayKey) {
  let streak = 0;
  let cursor = todayKey;

  while (true) {
    const checkin = getCheckinForDate(habit.id, cursor, checkins);

    if (!isCompleted(checkin, habit)) break;

    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function getLongestStreak(habit, checkins) {
  const completedDates = checkins
    .filter(
      (checkin) =>
        Number(checkin.habitId) === Number(habit.id) &&
        isCompleted(checkin, habit)
    )
    .map((checkin) => checkin.date)
    .sort();

  if (completedDates.length === 0) return 0;

  let current = 1;
  let longest = 1;

  for (let i = 1; i < completedDates.length; i++) {
    if (addDays(completedDates[i - 1], 1) === completedDates[i]) {
      current += 1;
    } else {
      current = 1;
    }

    longest = Math.max(longest, current);
  }

  return longest;
}

function getTotalCompletions(habit, checkins) {
  return checkins.filter(
    (checkin) =>
      Number(checkin.habitId) === Number(habit.id) &&
      isCompleted(checkin, habit)
  ).length;
}

function getLast7Rate(habit, checkins, todayKey) {
  let completedDays = 0;

  for (let i = 0; i < 7; i++) {
    const dateKey = addDays(todayKey, -i);
    const checkin = getCheckinForDate(habit.id, dateKey, checkins);

    if (isCompleted(checkin, habit)) {
      completedDays += 1;
    }
  }

  return Math.round((completedDays / 7) * 100);
}

function getWeeklyData(habits, checkins, todayKey) {
  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = addDays(todayKey, index - 6);
    const date = new Date(dateKey);

    const total = habits.length;

    const done = habits.filter((habit) => {
      const checkin = getCheckinForDate(habit.id, dateKey, checkins);
      return isCompleted(checkin, habit);
    }).length;

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      done,
      total,
    };
  });
}

function getCategoryData(habits, checkins, todayKey) {
  const grouped = habits.reduce((result, habit) => {
    if (!result[habit.category]) result[habit.category] = [];
    result[habit.category].push(habit);
    return result;
  }, {});

  return Object.entries(grouped).map(([name, categoryHabits]) => {
    const rates = categoryHabits.map((habit) =>
      getLast7Rate(habit, checkins, todayKey)
    );

    const value =
      rates.length === 0
        ? 0
        : Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);

    const firstHabit = categoryHabits[0];

    return {
      name,
      icon: firstHabit?.icon || "✨",
      value,
      color: getColorByCategory(name),
    };
  });
}

function getGoalProgress(habit, checkins, goals, todayKey) {
  const goal = goals.find((item) => Number(item.habitId) === Number(habit.id));

  if (!goal) return null;

  const currentValue =
    goal.targetType === "streak"
      ? getCurrentStreak(habit, checkins, todayKey)
      : getTotalCompletions(habit, checkins);

  return {
    ...goal,
    habitName: habit.name,
    currentValue,
    progress: Math.min(
      Math.round((currentValue / Number(goal.targetValue)) * 100),
      100
    ),
  };
}

function ProgressRing({ value = 75, size = 140, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="db-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="db-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="db-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="db-ring-text">
        <strong>{value}%</strong>
        <span>done</span>
      </div>
    </div>
  );
}

function HabitRow({ habit }) {
  const pct = Math.min(Math.round((habit.current / habit.target) * 100), 100);

  return (
    <div className={`db-habit-row db-${habit.color}`}>
      <div className="db-habit-left">
        <div className="db-habit-icon">{habit.icon}</div>

        <div className="db-habit-main">
          <div className="db-habit-title-row">
            <h3>{habit.name}</h3>

            <span
              className={`db-status ${habit.status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {habit.status}
            </span>
          </div>

          <div className="db-habit-meta">
            <span>{habit.category}</span>
            <span>·</span>
            <span>
              {habit.current}/{habit.target} {habit.unit}
            </span>
            <span>·</span>
            <span>🔥 {habit.streak} days</span>
          </div>

          <div className="db-progress-track">
            <div className="db-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <button className={pct >= 100 ? "db-check done" : "db-check"}>
        {pct >= 100 ? "✓" : "+"}
      </button>
    </div>
  );
}

function MiniCalendar({ checkins, habits }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="db-calendar-grid">
      {days.slice(0, 28).map((day) => {
        const dateKey = `2026-05-${String(day).padStart(2, "0")}`;

        const completedCount = habits.filter((habit) => {
          const checkin = getCheckinForDate(habit.id, dateKey, checkins);
          return isCompleted(checkin, habit);
        }).length;

        const active = completedCount > 0;
        const hot = completedCount >= 3;

        return (
          <div
            key={day}
            className={`db-calendar-day ${active ? "active" : ""} ${
              hot ? "hot" : ""
            }`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState("All");

  const dashboardData = useMemo(() => {
    const userHabits = mockHabits
      .filter((habit) => habit.userId === DEMO_USER_ID)
      .filter((habit) => habit.status !== "Archived")
      .sort((a, b) => a.order - b.order);

    const userCheckins = mockCheckins.filter(
      (checkin) => checkin.userId === DEMO_USER_ID
    );

    const userGoals = mockGoals.filter((goal) => goal.userId === DEMO_USER_ID);

    const enrichedHabits = userHabits.map((habit) => {
      const todayCheckin = getCheckinForDate(
        habit.id,
        DASHBOARD_DATE,
        userCheckins
      );

      const current = Number(todayCheckin?.completedCount || 0);
      const target = Number(habit.targetPerDay || 1);

      const status = todayCheckin
        ? normalizeStatus(todayCheckin.completionStatus)
        : "Not Started";

      const currentStreak = getCurrentStreak(
        habit,
        userCheckins,
        DASHBOARD_DATE
      );

      const longestStreak = getLongestStreak(habit, userCheckins);
      const totalCompletions = getTotalCompletions(habit, userCheckins);
      const last7Rate = getLast7Rate(habit, userCheckins, DASHBOARD_DATE);

      const isAtRisk =
        habit.status === "Active" &&
        status !== "Completed" &&
        currentStreak > 0;

      return {
        ...habit,
        current,
        target,
        unit: target > 1 ? "times" : "session",
        streak: currentStreak,
        longestStreak,
        totalCompletions,
        last7Rate,
        status: isAtRisk ? "At Risk" : status,
        color: getColorByCategory(habit.category),
      };
    });

    const activeHabits = enrichedHabits.filter(
      (habit) => habit.status !== "Paused"
    );

    const completed = activeHabits.filter(
      (habit) => habit.status === "Completed"
    ).length;

    const atRisk = activeHabits.filter((habit) => habit.status === "At Risk")
      .length;

    const completionRate =
      activeHabits.length === 0
        ? 0
        : Math.round((completed / activeHabits.length) * 100);

    const bestStreakHabit = enrichedHabits.reduce((best, habit) => {
      return habit.longestStreak > best.longestStreak ? habit : best;
    }, enrichedHabits[0]);

    const weekly = getWeeklyData(activeHabits, userCheckins, DASHBOARD_DATE);
    const categories = getCategoryData(activeHabits, userCheckins, DASHBOARD_DATE);

    const highlightedGoal = enrichedHabits
      .map((habit) =>
        getGoalProgress(habit, userCheckins, userGoals, DASHBOARD_DATE)
      )
      .filter(Boolean)
      .sort((a, b) => b.progress - a.progress)[0];

    return {
      habits: enrichedHabits,
      activeHabits,
      weekly,
      categories,
      checkins: userCheckins,
      highlightedGoal,
      stats: {
        total: activeHabits.length,
        completed,
        atRisk,
        completionRate,
        bestStreak: bestStreakHabit?.longestStreak || 0,
        bestStreakHabit: bestStreakHabit?.name || "No habit",
      },
    };
  }, []);

  const filteredHabits =
    filter === "All"
      ? dashboardData.habits
      : dashboardData.habits.filter((habit) => habit.category === filter);

  const filterOptions = [
    "All",
    ...new Set(dashboardData.habits.map((habit) => habit.category)),
  ];

  const stats = dashboardData.stats;
  const weekly = dashboardData.weekly;
  const categories = dashboardData.categories;
  const highlightedGoal = dashboardData.highlightedGoal;

  return (
    <main className="db-page db-page-inside-layout">
      <div className="db-orb db-orb-1" />
      <div className="db-orb db-orb-2" />
      <div className="db-orb db-orb-3" />

      <section className="db-main">
        <header className="db-topbar">
          <div>
            <span className="db-kicker">{formatDateLabel(DASHBOARD_DATE)}</span>
            <h1>Welcome back, habit hero.</h1>
            <p>Small wins today. Big change later.</p>
          </div>

          <div className="db-top-actions">
            <button className="db-btn-light">Export</button>
            <button className="db-btn-dark">+ Add Habit</button>
          </div>
        </header>

        <section className="db-hero-grid">
          <div className="db-hero-card">
            <div className="db-hero-copy">
              <span className="db-pill">Today’s focus</span>

              <h2>
                Complete {stats.total - stats.completed} habits before 9 PM
              </h2>

              <p>
                You have finished {stats.completed} of {stats.total} active habits today.
                {stats.atRisk > 0
                  ? ` ${stats.atRisk} habit is at risk of breaking a streak.`
                  : " No habit is at risk today."}
              </p>

              <div className="db-hero-actions">
                <button>Start check-in</button>
                <span>{stats.total - stats.completed} habits left</span>
              </div>
            </div>

            <ProgressRing value={stats.completionRate} />
          </div>

          <div className="db-stat-card pink">
            <span>Total habits</span>
            <strong>{stats.total}</strong>
            <p>Active routines</p>
          </div>

          <div className="db-stat-card blue">
            <span>Completed</span>
            <strong>{stats.completed}</strong>
            <p>Done today</p>
          </div>

          <div className="db-stat-card green">
            <span>At risk</span>
            <strong>{stats.atRisk}</strong>
            <p>Need attention</p>
          </div>

          <div className="db-stat-card yellow">
            <span>Best streak</span>
            <strong>{stats.bestStreak}</strong>
            <p>{stats.bestStreakHabit}</p>
          </div>
        </section>

        <section className="db-content-grid">
          <div className="db-panel db-habits-panel">
            <div className="db-panel-head">
              <div>
                <span className="db-section-label">Daily check-ins</span>
                <h2>Today’s habits</h2>
              </div>

              <div className="db-filter">
                {filterOptions.map((item) => (
                  <button
                    key={item}
                    className={filter === item ? "active" : ""}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="db-habit-list">
              {filteredHabits.map((habit) => (
                <HabitRow key={habit.id} habit={habit} />
              ))}
            </div>
          </div>

          <div className="db-panel db-week-panel">
            <div className="db-panel-head compact">
              <div>
                <span className="db-section-label">Performance</span>
                <h2>7-day rhythm</h2>
              </div>

              <span className="db-small-badge">{stats.completionRate}% rate</span>
            </div>

            <div className="db-week-chart">
              {weekly.map((item) => {
                const height =
                  item.total === 0
                    ? 8
                    : Math.max((item.done / item.total) * 100, 8);

                return (
                  <div className="db-week-item" key={item.day}>
                    <div className="db-week-bar">
                      <div style={{ height: `${height}%` }} />
                    </div>
                    <span>{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="db-panel db-category-panel">
            <div className="db-panel-head compact">
              <div>
                <span className="db-section-label">Life areas</span>
                <h2>Categories</h2>
              </div>
            </div>

            <div className="db-category-list">
              {categories.map((cat) => (
                <div className="db-category-row" key={cat.name}>
                  <div className="db-category-title">
                    <span className={`db-category-icon ${cat.color}`}>
                      {cat.icon}
                    </span>
                    <span>{cat.name}</span>
                  </div>

                  <div className="db-category-meter">
                    <div style={{ width: `${cat.value}%` }} />
                  </div>

                  <strong>{cat.value}%</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="db-panel db-calendar-panel">
            <div className="db-panel-head compact">
              <div>
                <span className="db-section-label">Consistency</span>
                <h2>May heatmap</h2>
              </div>
            </div>

            <MiniCalendar
              habits={dashboardData.activeHabits}
              checkins={dashboardData.checkins}
            />
          </div>

          <div className="db-panel db-goal-panel">
            <div>
              <span className="db-section-label">Milestone</span>

              <h2>
                {highlightedGoal?.targetType === "streak"
                  ? `${highlightedGoal.targetValue}-day streak goal`
                  : `${highlightedGoal?.targetValue || 0} completions goal`}
              </h2>

              <p>
                {highlightedGoal
                  ? `${highlightedGoal.habitName} is ${highlightedGoal.progress}% complete. Keep going to unlock your next milestone.`
                  : "No goals set yet. Create a goal to start tracking your progress."}
              </p>
            </div>

            <div className="db-goal-track">
              <div style={{ width: `${highlightedGoal?.progress || 0}%` }} />
            </div>

            <div className="db-goal-footer">
              <span>
                {highlightedGoal
                  ? `${highlightedGoal.currentValue} / ${highlightedGoal.targetValue}`
                  : "0 / 0"}
              </span>

              <strong>
                {highlightedGoal?.progress >= 100
                  ? "Goal achieved 🎉"
                  : highlightedGoal?.progress >= 80
                  ? "Almost there 🎉"
                  : "Keep building 🌱"}
              </strong>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}