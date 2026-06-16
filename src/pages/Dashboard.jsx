import { useEffect, useMemo, useRef } from "react";
import { mockGoals } from "@/mockData";
import TodayHabitSection from "@/components/Dashboard/TodayHabitSection";
import { useCheckinContext } from "@/hooks/useCheckins";
import { useHabitsQuery } from "@/hooks/useHabitsQuery";
import { Spinner } from "@/components/ui/spinner";
import { getWeekStartsOn } from "@/services/profile";
import { getWeekDateStrings } from "@/utils/date";
import "./styles/Dashboard.css";

const DEMO_USER_ID = 1;

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

function formatMonthLabel(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-US", {
    month: "long",
  });
}

function getColorByCategory(category) {
  if (category === "Health") return "pink";
  if (category === "Study") return "blue";
  if (category === "Work") return "green";
  if (category === "Mindfulness") return "yellow";
  return "purple";
}

function getTargetPerDay(habit) {
  return Number(habit.targetPerDay || habit.target || 1);
}

function getCheckinForDate(habitId, dateKey, checkins) {
  return checkins.find(
    (checkin) =>
      Number(checkin.habitId) === Number(habitId) &&
      checkin.date === dateKey
  );
}

function isCompletedCheckin(checkin, habit) {
  if (!checkin) return false;

  return (
    checkin.completionStatus === "completed" ||
    checkin.status === "completed" ||
    checkin.status === "Completed" ||
    Number(checkin.completedCount || 0) >= getTargetPerDay(habit)
  );
}

function getStatusEntry(statusMap, habitId) {
  if (!statusMap) return null;

  return (
    statusMap[habitId] ||
    statusMap[String(habitId)] ||
    statusMap.get?.(habitId) ||
    statusMap.get?.(String(habitId)) ||
    null
  );
}

function isDoneFromTodayHabit(habit, statusMap, todayCheckin) {
  const statusEntry = getStatusEntry(statusMap, habit.id);

  if (typeof statusEntry === "boolean") {
    return statusEntry;
  }

  if (statusEntry) {
    if (statusEntry.isDone === true) return true;
    if (statusEntry.done === true) return true;
    if (statusEntry.completed === true) return true;
    if (statusEntry.completionStatus === "completed") return true;
    if (statusEntry.status === "completed") return true;
    if (statusEntry.status === "Completed") return true;

    const countFromStatus = Number(
      statusEntry.completedCount ||
        statusEntry.count ||
        statusEntry.current ||
        statusEntry.value ||
        0
    );

    if (countFromStatus >= getTargetPerDay(habit)) {
      return true;
    }
  }

  return isCompletedCheckin(todayCheckin, habit);
}

function getCurrentStreak(habit, checkins, todayKey) {
  let streak = 0;
  let cursor = todayKey;

  while (true) {
    const checkin = getCheckinForDate(habit.id, cursor, checkins);

    if (!isCompletedCheckin(checkin, habit)) break;

    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function getPreviousStreak(habit, checkins, todayKey) {
  let streak = 0;
  let cursor = addDays(todayKey, -1);

  while (true) {
    const checkin = getCheckinForDate(habit.id, cursor, checkins);

    if (!isCompletedCheckin(checkin, habit)) break;

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
        isCompletedCheckin(checkin, habit)
    )
    .map((checkin) => checkin.date)
    .sort();

  if (completedDates.length === 0) return 0;

  let current = 1;
  let longest = 1;

  for (let i = 1; i < completedDates.length; i++) {
    if (addDays(completedDates[i - 1], 1) === completedDates[i]) {
      current += 1;
    } else if (completedDates[i - 1] !== completedDates[i]) {
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
      isCompletedCheckin(checkin, habit)
  ).length;
}

function getLast7Rate(habit, checkins, todayKey) {
  let completedDays = 0;

  for (let i = 0; i < 7; i++) {
    const dateKey = addDays(todayKey, -i);
    const checkin = getCheckinForDate(habit.id, dateKey, checkins);

    if (isCompletedCheckin(checkin, habit)) {
      completedDays += 1;
    }
  }

  return Math.round((completedDays / 7) * 100);
}

function getWeeklyData(habits, checkins, weekStartsOn) {
    return getWeekDateStrings(new Date(), weekStartsOn).map((dateKey) => {
    const date = new Date(`${dateKey}T00:00:00`);

    const done = habits.filter((habit) => {
      const checkin = getCheckinForDate(habit.id, dateKey, checkins);
      return isCompletedCheckin(checkin, habit);
    }).length;

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      done,
      total: habits.length,
    };
  });
}

function getCategoryData(habits, checkins, todayKey) {
  const grouped = habits.reduce((result, habit) => {
    const category = habit.category || "Other";

    if (!result[category]) result[category] = [];
    result[category].push(habit);

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

function MiniCalendar({ checkins, habits, todayKey }) {
  const date = new Date(todayKey);
  const year = date.getFullYear();
  const month = date.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: totalDays }, (_, index) => index + 1);

  return (
    <div className="db-calendar-grid">
      {days.map((day) => {
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

        const completedCount = habits.filter((habit) => {
          const checkin = getCheckinForDate(habit.id, dateKey, checkins);
          return isCompletedCheckin(checkin, habit);
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
  const todayKey = getTodayKey();
  const todayHabitsRef = useRef(null);
  const weekStartsOn = getWeekStartsOn();

  const {
    todaysHabits = [],
    statusMap,
    todayProgress = 0,
    loading,
  } = useHabitsQuery();

  const checkinContext = useCheckinContext();
  const loadCheckins = checkinContext?.loadCheckins;
  const contextCheckins = useMemo(
    () =>
      checkinContext?.checkins ||
      checkinContext?.checkinList ||
      checkinContext?.data ||
      [],
    [checkinContext]
  );

  useEffect(() => {
    loadCheckins?.();
  }, [loadCheckins]);

  const dashboardData = useMemo(() => {
    const userCheckins = contextCheckins.filter(
      (checkin) =>
        checkin.userId == null || Number(checkin.userId) === DEMO_USER_ID
    );

    const activeHabits = todaysHabits
      .filter((habit) => habit.status !== "Archived")
      .filter((habit) => habit.status !== "Paused")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const enrichedHabits = activeHabits.map((habit) => {
      const todayCheckin = getCheckinForDate(habit.id, todayKey, userCheckins);

      const isDone = isDoneFromTodayHabit(habit, statusMap, todayCheckin);

      const currentStreak = getCurrentStreak(habit, userCheckins, todayKey);
      const previousStreak = getPreviousStreak(habit, userCheckins, todayKey);
      const longestStreak = getLongestStreak(habit, userCheckins);
      const totalCompletions = getTotalCompletions(habit, userCheckins);
      const last7Rate = getLast7Rate(habit, userCheckins, todayKey);

      const isAtRisk = !isDone && previousStreak > 0;

      return {
        ...habit,
        isDone,
        isAtRisk,
        currentStreak: isDone ? currentStreak : previousStreak,
        longestStreak,
        totalCompletions,
        last7Rate,
        color: getColorByCategory(habit.category),
      };
    });

  const completed = enrichedHabits.filter((habit) => habit.isDone).length;
  const atRisk = enrichedHabits.filter((habit) => habit.isAtRisk).length;
    const completionRate =
      typeof todayProgress === "number"
        ? todayProgress
        : enrichedHabits.length === 0
        ? 0
        : Math.round((completed / enrichedHabits.length) * 100);

    const bestStreakHabit = enrichedHabits.reduce((best, habit) => {
      if (!best) return habit;
      return habit.longestStreak > best.longestStreak ? habit : best;
    }, null);

    const weekly = getWeeklyData(enrichedHabits, userCheckins, weekStartsOn);
    const categories = getCategoryData(enrichedHabits, userCheckins, todayKey);

    const highlightedGoal = enrichedHabits
      .map((habit) =>
        getGoalProgress(
          habit,
          userCheckins,
          mockGoals.filter((goal) => goal.userId === DEMO_USER_ID),
          todayKey
        )
      )
      .filter(Boolean)
      .sort((a, b) => b.progress - a.progress)[0];

    return {
      habits: enrichedHabits,
      activeHabits: enrichedHabits,
      weekly,
      categories,
      checkins: userCheckins,
      highlightedGoal,
      stats: {
        total: enrichedHabits.length,
        completed,
        atRisk,
        completionRate,
        bestStreak: bestStreakHabit?.longestStreak || 0,
        bestStreakHabit: bestStreakHabit?.name || "No habit",
      },
    };
  }, [contextCheckins, statusMap, todayProgress, todaysHabits, todayKey, weekStartsOn]);

  const stats = dashboardData.stats;
  const weekly = dashboardData.weekly;
  const categories = dashboardData.categories;
  const highlightedGoal = dashboardData.highlightedGoal;

  const activeHabitText = `${stats.completed} of ${stats.total} active habits completed`;

  const handleScrollToTodayHabits = () => {
    todayHabitsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      dashboardDate: todayKey,
      userId: DEMO_USER_ID,
      summary: {
        activeHabits: stats.total,
        completedToday: stats.completed,
        atRisk: stats.atRisk,
        completionRate: stats.completionRate,
        bestStreak: stats.bestStreak,
        bestStreakHabit: stats.bestStreakHabit,
      },
      habits: dashboardData.habits,
      checkins: dashboardData.checkins,
      goals: mockGoals.filter((goal) => goal.userId === DEMO_USER_ID),
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `habit-dashboard-${todayKey}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="db-page db-page-inside-layout">
        <div className="flex items-center justify-center min-h-screen text-blue-500">
          <Spinner className="size-15" />
        </div>
      </main>
    );
  }

  return (
    <main className="db-page db-page-inside-layout">
      <div className="db-orb db-orb-1" />
      <div className="db-orb db-orb-2" />
      <div className="db-orb db-orb-3" />

      <section className="db-main">
        <header className="db-topbar">
          <div>
            <span className="db-kicker">{formatDateLabel(todayKey)}</span>
            <h1>Welcome back, habit hero.</h1>
            <p>Small wins today. Big change later.</p>
          </div>

          <div className="db-top-actions">
            <button className="db-btn-light" onClick={handleExportData}>
              Export
            </button>

            <button className="db-btn-dark" onClick={handleScrollToTodayHabits}>
              Start check-in
            </button>
          </div>
        </header>

        <section className="db-hero-grid">
          <div className="db-hero-card">
            <div className="db-hero-copy">
              <span className="db-pill">Today’s focus</span>

              <h2>{activeHabitText}</h2>

              <p>
                {stats.total === 0
                  ? "You do not have any active habits scheduled for today. Add a new habit to start building your daily routine."
                  : `${stats.total - stats.completed} habits are still waiting for your check-in today. ${
                      stats.atRisk > 0
                        ? `${stats.atRisk} habit${
                            stats.atRisk > 1 ? "s are" : " is"
                          } currently at risk of breaking a streak.`
                        : "None of your habits are at risk right now, so you are on track to maintain your progress today."
                    }`}
              </p>

              <div className="db-hero-actions">
                <button onClick={handleScrollToTodayHabits}>
                  View today’s habits
                </button>

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
          <div className="db-habits-panel db-today-demo-panel" ref={todayHabitsRef}>
            <TodayHabitSection />
          </div>

          <div className="db-panel db-week-panel">
            <div className="db-panel-head compact">
              <div>
                <span className="db-section-label">Performance</span>
                <h2>7-day rhythm</h2>
              </div>

              <span className="db-small-badge">
                {stats.completionRate}% rate
              </span>
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
                <h2>{formatMonthLabel(todayKey)} heatmap</h2>
              </div>
            </div>

            <MiniCalendar
              habits={dashboardData.activeHabits}
              checkins={dashboardData.checkins}
              todayKey={todayKey}
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
