import { goalService } from "@/services/goals";
import { habitService } from "@/services/habits";
import { formatDate } from "@/utils/helper";
import { storage, STORAGE_KEYS } from "@/utils/storage";


export const checkinService = {
    getAll,
    getCheckinsByUser,
    getCheckinsByHabit,
    calculateCurrentStreak,
    calculateLongestStreakByIteratingDays,
    updateCheckin,
    deleteCheckin,
    getHabitStatusByDate
};

function getAll() {
    return storage.get(STORAGE_KEYS.CHECKINS, []);
}

 function getCheckinsByUser(userId) {
    const allCheckins = storage.get(STORAGE_KEYS.CHECKINS, []);
    return allCheckins.filter(c => c.userId === userId);
}

 function getHabitStatusByDate(habitId, userId, date = formatDate()) {
    const habit = habitService.getById(habitId);
    if (!habit) {
        throw new Error("Habit not found");
    }

    const allCheckins = storage.get(STORAGE_KEYS.CHECKINS, []);

    const checkin = allCheckins.find(
        c =>
            c.habitId === habitId &&
            c.userId === userId &&
            c.date === date
    ) || null;

    const isRequired = isScheduledDay(
        habit,
        new Date(date)
    );

    return {
        date,
        habit,
        checkin,
        isRequired
    };
}

 function getCheckinsByHabit(habitId, userId) {
    const allCheckins = storage.get(STORAGE_KEYS.CHECKINS, []);
    return allCheckins.filter(c => c.habitId === habitId && c.userId === userId).sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getNextId(items) {
    if (!items.length) return 1;
    return Math.max(...items.map(i => i.id)) + 1;
}

function isScheduledDay(habit, date) {
    if (!habit.frequency) return true;
    if (habit.frequency.repeatType === 'daily') return true;
    if (habit.frequency.repeatType === 'specific_days') {
        const dayOfWeek = date.getDay(); // 0 (Chủ nhật) -> 6 (Thứ 7) theo JS
        return habit.frequency.daysOfWeek.includes(dayOfWeek);
    }
    return true;
}

function calculateCompletionStatus(completedCount, targetPerDay, manualStatus) {
    if (manualStatus) {
        return manualStatus;
    }

    if (completedCount >= targetPerDay) {
        return "completed";
    }

    if (completedCount > 0) {
        return "in_progress";
    }

    return "not_checked";
}

//completedCount, completionStatus, note
 function updateCheckin(habitId, userId, date = null, updates = {}) {
    const targetDate = date || formatDate();
    const habit = habitService.getById(habitId);
    if (!habit) throw new Error("Habit not found");

    const allCheckins = storage.get(STORAGE_KEYS.CHECKINS, []);
    const existingIndex = allCheckins.findIndex(
        c => c.habitId === habitId && c.userId === userId && c.date === targetDate
    );

    let checkin = existingIndex !== -1 ? allCheckins[existingIndex]
        : {
            id: getNextId(allCheckins),
            habitId,
            userId,
            date: targetDate,
            completedCount: 0,
            completionStatus: "not_checked",
            note: "",
            createdAt: new Date().toISOString(),
        };

    if (updates.completedCount !== undefined) {
        checkin.completedCount = updates.completedCount;
    }
    checkin.completedCount = Math.max(0, Math.min(checkin.completedCount, habit.targetPerDay));

    if (updates.note !== undefined) {
        checkin.note = updates.note;
    }

    checkin.completionStatus = calculateCompletionStatus(
        checkin.completedCount,
        habit.targetPerDay,
        updates.completionStatus
    );
    checkin.updatedAt = new Date().toISOString();

    if (existingIndex === -1) {
        allCheckins.push(checkin);
    } else {
        allCheckins[existingIndex] = checkin;
    }

    storage.set(
        STORAGE_KEYS.CHECKINS,
        allCheckins
    );

    storage.set(STORAGE_KEYS.CHECKINS, allCheckins);
    checkAndUpdateGoals(habit, userId);
    return checkin;
}

 function deleteCheckin(habitId, userId, date = null) {
    const habit = habitService.getById(habitId);
    if (!habit) throw new Error("Habit not found");

    const targetDate = date || formatDate();
    const allCheckins = storage.get(STORAGE_KEYS.CHECKINS, []);
    const newCheckins = allCheckins.filter(
        c => !(c.habitId === habitId && c.userId === userId && c.date === targetDate)
    );
    if (newCheckins.length === allCheckins.length) return false;
    storage.set(STORAGE_KEYS.CHECKINS, newCheckins);
    checkAndUpdateGoals(habit, userId);
    return true;
}


 function calculateCurrentStreak(habitId, userId) {
    const checkins = getCheckinsByHabit(habitId, userId);
    const habit = habitService.getById(habitId);
    if (!habit) return 0;

    const checkinMap = new Map();
    checkins.forEach(c => { checkinMap.set(c.date, c); });

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const todayStr = formatDate(currentDate);
    if (!checkinMap.has(todayStr)) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    while (true) {
        const dateStr = formatDate(currentDate);
        const checkin = checkinMap.get(dateStr);
        const isRequired = isScheduledDay(habit, currentDate);

        if (!isRequired) {
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
        }

        if (!checkin) {
            break;
        }

        if (checkin.completionStatus === "completed") {
            streak++;
        } else if (checkin.completionStatus === "skipped") {
            // skipped không làm tăng streak nhưng cũng không break
            // giữ nguyên streak, tiếp tục lùi
        } else {
            break;
        }
        currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
}

//tạo một mảng các ngày từ ngày checkin đầu tiên đến hôm nay, xét từng ngày
 function calculateLongestStreakByIteratingDays(habitId, userId) {
    const habit = habitService.getById(habitId);
    if (!habit) return 0;

    const checkins = getCheckinsByHabit(habitId, userId);
    const checkinMap = new Map();
    checkins.forEach(c => { checkinMap.set(c.date, c); });
    if (checkins.length === 0) return 0;

    const dates = checkins.map(c => new Date(c.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date();

    let currentStreak = 0;
    let maxStreak = 0;
    let currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
        const dateStr = formatDate(currentDate);
        const checkin = checkinMap.get(dateStr);
        const isRequired = isScheduledDay(habit, currentDate);

        if (!isRequired) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }

        if (checkin && checkin.completionStatus === "completed") {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else if (checkin && checkin.completionStatus === "skipped") {
            // skipped: không reset, không tăng
            // giữ nguyên currentStreak
        } else {
            currentStreak = 0;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return maxStreak;
}

// nếu thói quen đạt goal
 function checkAndUpdateGoals(habit, userId) {
    const goals = goalService.getGoalsByHabit(habit.id, userId);
    const goal = goals[0];
    if (!goal || goal.isDone) {
        return;
    }

    const checkins = getCheckinsByHabit(habit.id, userId);

    if (goal.targetType === "streak") {
        const longestStreak = calculateLongestStreakByIteratingDays(
            habit.id,
            userId
        );

        if (longestStreak >= goal.targetValue) {
            goalService.markGoalDone(goal.id);
            // await habitService.updateHabit(
            //     habit.id,
            //     { status: "Archived" }
            // );
        }
        return;
    }

    if (goal.targetType === "completions_target") {
        let completedDays = 0;
        for (const checkin of checkins) {
            const dateObj = new Date(checkin.date);
            if (
                isScheduledDay(habit, dateObj) &&
                checkin.completionStatus === "completed"
            ) {
                completedDays++;
            }

        }

        if (completedDays >= goal.targetValue) {
            goalService.markGoalDone(goal.id);
            // await habitService.updateHabit(
            //     habit.id,
            //     { status: "Archived" }
            // );
        }
        return;
    }
    return;
}

