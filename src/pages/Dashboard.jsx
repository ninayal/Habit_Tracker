import { useEffect, useMemo, useRef } from "react";
import { mockHabits, mockGoals } from "@/mockData";
import TodayHabitSection from "@/components/Dashboard/TodayHabitSection";
import { useHabitContext } from "@/hooks/useHabits";
import { useCheckinContext } from "@/hooks/useCheckins";
import { useHabitsQuery } from "@/hooks/useHabitsQuery";
import { Spinner } from "@/components/ui/spinner";
import { getWeekStartsOn } from "@/services/profile";
import { getWeekDateStrings } from "@/utils/date";
import "./styles/Dashboard.css";

const DEMO_USER_ID = 1;

function getTodayKey() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateKey, amount) {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function parseLocalDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(dateKey) {
  return parseLocalDate(dateKey).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatMonthLabel(dateKey) {
  return parseLocalDate(dateKey).toLocaleDateString("en-US", {
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

function DashboardEmptyState({
  icon = "🌱",
  title = "No habits for this day",
  description = "There are no habits scheduled for this date yet.",
  compact = false,
}) {
  return (
    <div className={compact ? "db-empty-card compact" : "db-empty-card"}>
      <div className="db-empty-card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
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

function getHeatmapLevel(completedCount, totalHabits) {
  if (totalHabits === 0 || completedCount === 0) return "level-0";

  const rate = completedCount / totalHabits;

  if (rate <= 0.25) return "level-1";
  if (rate <= 0.5) return "level-2";
  if (rate <= 0.75) return "level-3";
  return "level-4";
}

function getCheckinProgressForDate(habits, checkins, dateKey) {
  return habits.reduce(
    (result, habit) => {
      const checkin = getCheckinForDate(habit.id, dateKey, checkins);

      const current = Number(checkin?.completedCount || 0);
      const target = getTargetPerDay(habit);

      return {
        current: result.current + Math.min(current, target),
        target: result.target + target,
      };
    },
    { current: 0, target: 0 }
  );
}

function getHeatmapLevelByProgress(current, target) {
  if (target === 0 || current === 0) return "level-0";

  const rate = current / target;

  if (rate <= 0.25) return "level-1";
  if (rate <= 0.5) return "level-2";
  if (rate <= 0.75) return "level-3";
  return "level-4";
}

function MiniCalendar({ checkins, habits, todayKey }) {
  const date = parseLocalDate(todayKey);
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

      const progress = getCheckinProgressForDate(habits, checkins, dateKey);
      const level = getHeatmapLevelByProgress(progress.current, progress.target);
      const isToday = dateKey === todayKey;

      return (
        <div
          key={day}
          className={`db-calendar-day ${level} ${isToday ? "today" : ""}`}
          title={`${progress.current}/${progress.target} check-ins completed`}
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
  const contextCheckins =
    checkinContext?.checkins ||
    checkinContext?.checkinList ||
    checkinContext?.data ||
    [];
  
  const habitContext = useHabitContext();
  const contextHabits =
    habitContext?.habits ||
    habitContext?.habitList ||
    habitContext?.data ||
    [];

  useEffect(() => {
    loadCheckins?.();
  }, [loadCheckins]);

  const dashboardData = useMemo(() => {
  const userCheckins = contextCheckins.filter(
    (checkin) =>
      checkin.userId == null || Number(checkin.userId) === DEMO_USER_ID
  );

  // Dùng cho Today focus, Total habits, Completed, At risk
  // Phần này vẫn chỉ tính theo Today's habits
  const activeHabits = todaysHabits
    .filter((habit) => habit.status !== "Archived")
    .filter((habit) => habit.status !== "Paused")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Dùng riêng cho Best streak
  // Lấy toàn bộ habits, kể cả habit không có trong Today's habits
  const allHabitsSource = contextHabits.length > 0 ? contextHabits : mockHabits;

  const allActiveHabits = allHabitsSource
    .filter(
      (habit) =>
        habit.userId == null || Number(habit.userId) === DEMO_USER_ID
    )
    .filter((habit) => habit.status !== "Archived")
    .filter((habit) => habit.status !== "Paused")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const enrichedHabits = activeHabits.map((habit) => {
    const todayCheckin = getCheckinForDate(habit.id, todayKey, userCheckins);

    const isDone = isDoneFromTodayHabit(habit, statusMap, todayCheckin);

    const currentStreak = getCurrentStreak(habit, userCheckins, todayKey);
    const previousStreak = getPreviousStreak(habit, userCheckins, todayKey);
    const oldLongestStreak = getLongestStreak(habit, userCheckins);
    const totalCompletions = getTotalCompletions(habit, userCheckins);
    const last7Rate = getLast7Rate(habit, userCheckins, todayKey);

    const displayCurrentStreak = isDone ? currentStreak : previousStreak;

    const updatedLongestStreak = Math.max(
      Number(oldLongestStreak || 0),
      Number(displayCurrentStreak || 0)
    );

    const isAtRisk = !isDone && previousStreak > 0;

    return {
      ...habit,
      isDone,
      isAtRisk,
      currentStreak: displayCurrentStreak,
      longestStreak: updatedLongestStreak,
      totalCompletions,
      last7Rate,
      color: getColorByCategory(habit.category),
    };
  });

  // Tính Best Streak từ toàn bộ habits
  const allStreakHabits = allActiveHabits.map((habit) => {
    const todayCheckin = getCheckinForDate(habit.id, todayKey, userCheckins);

    const isDone = isCompletedCheckin(todayCheckin, habit);

    const currentStreak = getCurrentStreak(habit, userCheckins, todayKey);
    const previousStreak = getPreviousStreak(habit, userCheckins, todayKey);
    const oldLongestStreak = getLongestStreak(habit, userCheckins);

    const displayCurrentStreak = isDone ? currentStreak : previousStreak;

    const updatedLongestStreak = Math.max(
      Number(oldLongestStreak || 0),
      Number(displayCurrentStreak || 0)
    );

    return {
      ...habit,
      currentStreak: displayCurrentStreak,
      longestStreak: updatedLongestStreak,
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

  const bestStreakHabit = allStreakHabits.reduce((best, habit) => {
    if (!best) return habit;

    const habitLongestStreak = Number(habit.longestStreak || 0);
    const bestLongestStreak = Number(best.longestStreak || 0);

    return habitLongestStreak > bestLongestStreak ? habit : best;
  }, null);

  const weekly = getWeeklyData(enrichedHabits, userCheckins, todayKey);
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
    allHabits: allStreakHabits,
    activeHabits: enrichedHabits,
    weekly,
    categories,
    checkins: userCheckins,
    highlightedGoal,
    stats: {
      // Các số này vẫn lấy theo Today's habits
      total: enrichedHabits.length,
      completed,
      atRisk,
      completionRate,

      // Riêng Best streak lấy theo toàn bộ habits
      bestStreak: bestStreakHabit?.longestStreak || 0,
      bestStreakHabit: bestStreakHabit?.name || "No habit",
    },
  };
}, [
  contextCheckins,
  contextHabits,
  statusMap,
  todayProgress,
  todaysHabits,
  todayKey,
]);

const stats = dashboardData.stats;
const weekly = dashboardData.weekly;
const categories = dashboardData.categories;
const highlightedGoal = dashboardData.highlightedGoal;

const hasNoHabits = stats.total === 0;

const activeHabitText = hasNoHabits
  ? "No habits scheduled for today"
  : `${stats.completed} of ${stats.total} active habits completed`;

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
                {hasNoHabits
                  ? "This day does not have any active habits yet. Create a new habit or choose another date to start tracking your progress."
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
                  {hasNoHabits ? "View empty day" : "View today’s habits"}
                </button>

                <span>
                  {hasNoHabits ? "0 habits today" : `${stats.total - stats.completed} habits left`}
                </span>
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
            {hasNoHabits ? (
              <div className="brand-card db-empty-today-panel">
                <div>
                  <span className="db-section-label">Daily check-ins</span>
                  <h2>Today’s habits</h2>
                </div>

                <DashboardEmptyState
                  icon="🗓️"
                  title="No habits scheduled"
                  description="There are no habits to check in for this day. Add a new habit or select another date to continue tracking."
                />
              </div>
            ) : (
              <TodayHabitSection />
            )}
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

            {hasNoHabits ? (
            <DashboardEmptyState
              compact
              icon="📊"
              title="No performance data"
              description="No habits are available for this day, so the 7-day rhythm cannot be calculated."
            />
          ) : (
            <div className="db-week-chart">
              {weekly.map((item) => {
                const rate =
                  item.total === 0 ? 0 : (item.done / item.total) * 100;

                const height =
                  rate === 0 ? 0 : Math.max(rate, 8);

                return (
                  <div className="db-week-item" key={item.day}>
                    <div className="db-week-bar">
                      {rate > 0 && <div style={{ height: `${height}%` }} />}
                    </div>
                    <span>{item.day}</span>
                  </div>
                );
              })}
            </div>
          )}
          </div>

          <div className="db-panel db-category-panel">
            <div className="db-panel-head compact">
              <div>
                <span className="db-section-label">Life areas</span>
                <h2>Categories</h2>
              </div>
            </div>

            {hasNoHabits || categories.length === 0 ? (
            <DashboardEmptyState
              compact
              icon="🧩"
              title="No categories yet"
              description="Habit categories will appear here once this day has active habits."
            />
          ) : (
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
          )}
          </div>

          <div className="db-panel db-calendar-panel">
            <div className="db-panel-head compact">
              <div>
                <span className="db-section-label">Consistency</span>
                <h2>{formatMonthLabel(todayKey)} heatmap</h2>
              </div>
            </div>

            {hasNoHabits ? (
              <DashboardEmptyState
                compact
                icon="📅"
                title="No consistency data"
                description="The heatmap will appear when there are habits and check-ins for this period."
              />
            ) : (
              <MiniCalendar
                habits={dashboardData.activeHabits}
                checkins={dashboardData.checkins}
                todayKey={todayKey}
              />
            )}
            <div className="db-heatmap-legend">
              <span>Less</span>
              <i className="level-0" />
              <i className="level-1" />
              <i className="level-2" />
              <i className="level-3" />
              <i className="level-4" />
              <span>More</span>
            </div>
          </div>

          <div className="db-panel db-goal-panel">
            <div>
              <span className="db-section-label">Milestone</span>

              <h2>
                {hasNoHabits
                  ? "No milestone for this day"
                  : highlightedGoal?.targetType === "streak"
                  ? `${highlightedGoal.targetValue}-day streak goal`
                  : `${highlightedGoal?.targetValue || 0} completions goal`}
              </h2>

              <p>
                {hasNoHabits
                  ? "Milestones are calculated from active habits and check-ins. Add a habit to start building progress."
                  : highlightedGoal
                  ? `${highlightedGoal.habitName} is ${highlightedGoal.progress}% complete. Keep going to unlock your next milestone.`
                  : "No goals set yet. Create a goal to start tracking your progress."}
              </p>
            </div>

            <div className="db-goal-track">
              <div style={{ width: `${hasNoHabits ? 0 : highlightedGoal?.progress || 0}%` }} />
            </div>

            <div className="db-goal-footer">
              <span>
                {hasNoHabits
                  ? "0 / 0"
                  : highlightedGoal
                  ? `${highlightedGoal.currentValue} / ${highlightedGoal.targetValue}`
                  : "0 / 0"}
              </span>

              <strong>
                {hasNoHabits
                  ? "No progress yet"
                  : highlightedGoal?.progress >= 100
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
