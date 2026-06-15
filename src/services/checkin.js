import { goalService } from "@/services/goals";
import { habitService } from "@/services/habits";
import { formatDate } from "@/utils/helper";
import { calculateGoalProgress, isScheduledDay } from "@/utils/statsHelper";
import { storage, STORAGE_KEYS } from "@/utils/storage";


export const checkinService = {
    getAll,
    getCheckinsByUser,
    getCheckinsByHabit,
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

    const allHabitCheckins = allCheckins.filter(c => c.habitId === habitId && c.userId === userId);
    const goalEvent = checkAndUpdateGoals(habit, userId, allHabitCheckins);

    return { checkin, goalEvent };
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



function checkAndUpdateGoals(habit, userId, allHabitCheckins) {
    const goals = goalService.getGoalsByHabit(habit.id, userId);
    if (goals.length === 0) return null;

    const currentGoal = goals[goals.length - 1];
    const progress = calculateGoalProgress(habit, currentGoal, allHabitCheckins);

    if (!progress) return null;

    if (progress.percentage < 100 && currentGoal.isDone) {
        goalService.revokeGoalDone(currentGoal.id);
    }

    if (progress.percentage < 80 && currentGoal.is80PercentNotified) {
        goalService.revokeGoal80Notified(currentGoal.id);
    }

    if (progress.is100Percent && !currentGoal.isDone) {
        goalService.markGoalDone(currentGoal.id);
        return {
            type: "ACHIEVED",
            habitName: habit.name,
            goal: currentGoal
        };
    }

    if (progress.is80Percent && !progress.is100Percent && !currentGoal.is80PercentNotified) {
        goalService.markGoal80Notified(currentGoal.id);
        return {
            type: "ENCOURAGEMENT",
            habitName: habit.name,
            goal: currentGoal,
            percentage: progress.percentage
        };
    }

    return null;
}
