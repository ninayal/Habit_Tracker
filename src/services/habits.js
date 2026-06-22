import { authService } from "@/services/auth";
import { checkinService } from "@/services/checkin";
import { goalService } from "@/services/goals";
import { formatDate } from "@/utils/helper";
import { calculateGoalProgress } from "@/utils/statsHelper";
import { storage, STORAGE_KEYS } from "@/utils/storage";

export const habitService = {
    getAll,
    getByUserId,
    queryHabits,
    sortHabits,
    getById,
    createHabit,
    updateHabit,
    deleteHabit
};

class ServiceError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ServiceError";
    }
}

function getAll() {
    return storage.get(STORAGE_KEYS.HABITS, []);
}

function getById(id) {
    const habits = getAll();
    return habits.find(h => h.id === id);
}

function getByUserId() {
    try {
        const user = authService.getCurrentUser();
        if (!user || !user.id) {
            throw new ServiceError(401, "Unauthorized: User not found.");
        }

        const habits = getAll();
        const goals = storage.get(STORAGE_KEYS.GOALS, []);
        const userHabits = habits.filter(h => h.userId === user.id);

        const habitsWithGoals = userHabits.map(habit => {
            const habitGoal = goals.find(g => g.habitId === habit.id);
            return {
                ...habit,
                goal: habitGoal || null
            };
        });

        return habitsWithGoals;
    } catch (error) {
        if (!error.status) error.status = 500;
        throw error;
    }
}
//có search có sort
function queryHabits(userId, query = {}) {

    const habits = getAll();
    let data = habits.filter(h => h.userId === userId);
    const goals = storage.get(STORAGE_KEYS.GOALS, []);

    const {
        search,
        status,
        category,
        priority,
        frequency
    } = query;

    if (search) {
        data = data.filter(h =>
            h.name
                .toLowerCase()
                .includes(
                    search.trim().toLowerCase()
                )
        );
    }

    if (status) {
        data = data.filter(
            h => h.status === status
        );
    }

    if (category && category !== "All") {
        data = data.filter(
            h => h.category === category
        );
    }

    if (priority && priority !== "All") {
        data = data.filter(
            h => h.priority === priority
        );
    }

    if (frequency && frequency !== "all") {
        data = data.filter(h => {
            if (!h.frequency) return false;
            return h.frequency.repeatType === frequency;
        });
    }

    // if (sortBy) {
    //     data = sortHabits(data, sortBy);
    // }

    return data.map(habit => ({
        ...habit,
        goal: goals.find(
            g => g.habitId === habit.id
        ) || null
    }));
}

function sortHabits(data, sortBy) {
    const sorted = [...data];

    switch (sortBy) {
        case "newest":
            return sorted.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

        case "oldest":
            return sorted.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );

        case "order":
            return sorted.sort(
                (a, b) => a.order - b.order
            );

        default:
            return sorted;
    }
}

function createHabit(data) {
    try {
        if (!data.name || !data.name.trim()) {
            throw new ServiceError(400, "Habit name is required.");
        }
        if (!data.category) {
            throw new ServiceError(400, "Category is required.");
        }
        if (!data.startDate) {
            throw new ServiceError(400, "Start date is required.");
        }
        if (data.targetPerDay === undefined || isNaN(Number(data.targetPerDay)) || Number(data.targetPerDay) <= 0) {
            throw new ServiceError(400, "Target per day must be a positive number.");
        }

        const user = authService.getCurrentUser();
        if (!user || !user.id) {
            throw new ServiceError(401, "Unauthorized: User not found.");
        }

        const habits = getAll();

        const normalizedName = data.name.trim();
        const existedHabit = habits.find(
            h =>
                h.userId === user.id &&
                h.name.trim() === normalizedName
        );
        if (existedHabit) {
            throw new ServiceError(409, `Habit "${normalizedName}" already exists.`);
        }

        const nextHabitId = habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1;
        const now = new Date().toISOString();

        const newHabit = {
            id: nextHabitId,
            userId: user.id,
            icon: data.icon || "",
            name: data.name,
            category: data.category,
            startDate: data.startDate,
            frequency: data.frequency || { repeatType: "daily", daysOfWeek: [] },
            targetPerDay: Number(data.targetPerDay),
            priority: data.priority || "Medium",
            autoOpenNote: data.autoOpenNote ?? false,
            status: "Active",
            order: habits.length + 1,
            createdAt: now,
            updatedAt: now,
        };

        habits.push(newHabit);
        storage.set(STORAGE_KEYS.HABITS, habits);

        const resultHabit = { ...newHabit, goal: null };

        if (data.goal) {
            if (!["streak", "completions_target"].includes(data.goal.targetType)) {
                throw new ServiceError(400, "Invalid goal targetType. Must be 'streak' or 'completions_target'.");
            }
            if (!data.goal.targetValue || isNaN(Number(data.goal.targetValue))) {
                throw new ServiceError(400, "Goal target value must be a valid number.");
            }

            const goals = storage.get(STORAGE_KEYS.GOALS, []);
            const nextGoalId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;

            const newGoal = {
                id: nextGoalId,
                habitId: nextHabitId,
                userId: user.id,
                targetType: data.goal.targetType,
                targetValue: Number(data.goal.targetValue),
                isDone: false,
                doneAt: null
            };

            goals.push(newGoal);
            storage.set(STORAGE_KEYS.GOALS, goals);

            resultHabit.goal = newGoal;
        }

        return resultHabit;

    } catch (error) {
        if (!error.status) error.status = 500;
        throw error;
    }
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


function updateHabit(id, updates) {
    try {
        if (!id) throw new ServiceError(400, "Habit ID is required for updating.");

        const habits = getAll();
        const index = habits.findIndex(h => h.id === id);
        if (index === -1) throw new ServiceError(404, `Habit with ID ${id} not found.`);

        const current = habits[index];

        if (updates.targetPerDay !== undefined && (isNaN(Number(updates.targetPerDay)) || Number(updates.targetPerDay) <= 0)) {
            throw new ServiceError(400, "Target per day must be a positive number.");
        }
        if (updates.status && !["Active", "Archived", "Paused"].includes(updates.status)) {
            throw new ServiceError(400, "Invalid status. Must be 'Active', 'Archived', or 'Paused'.");
        }
        if (updates.name) {
            const normalizedName = updates.name.trim();
            if (habits.some(h => h.id !== id && h.userId === current.userId && h.name.trim() === normalizedName)) {
                throw new ServiceError(409, `Habit "${normalizedName}" already exists.`);
            }
        }

        const { goal: updateGoal, ...habitUpdates } = updates;
        const updatedHabit = { ...current, updatedAt: new Date().toISOString() };
        
        for (const key in habitUpdates) {
            if (habitUpdates[key] !== undefined) updatedHabit[key] = habitUpdates[key];
        }
        delete updatedHabit.goal;

        habits[index] = updatedHabit;
        storage.set(STORAGE_KEYS.HABITS, habits);

        const allCheckins = storage.get(STORAGE_KEYS.CHECKINS, []);
        
        if (updates.targetPerDay !== undefined && updates.targetPerDay !== current.targetPerDay) {
            const today = typeof formatDate === 'function' ? formatDate() : new Date().toISOString().split('T')[0];
            const todayCheckin = allCheckins.find(c => c.habitId === id && c.date === today);
            
            if (todayCheckin) {
                todayCheckin.targetPerDay = updatedHabit.targetPerDay;
                todayCheckin.completedCount = Math.max(0, Math.min(todayCheckin.completedCount, todayCheckin.targetPerDay));
                todayCheckin.completionStatus = calculateCompletionStatus(
                    todayCheckin.completedCount,
                    todayCheckin.targetPerDay,
                    todayCheckin.completionStatus
                );
                todayCheckin.updatedAt = new Date().toISOString();
                storage.set(STORAGE_KEYS.CHECKINS, allCheckins);
            }
        }

        const resultHabit = { ...updatedHabit, goal: null };
        const goals = storage.get(STORAGE_KEYS.GOALS, []);
        const goalIndex = goals.findIndex(g => g.habitId === id);

        if (updateGoal) {
            if (goalIndex === -1) throw new ServiceError(404, `Goal for Habit ID ${id} not found to update.`);
            
            const cg = goals[goalIndex];
            goals[goalIndex] = {
                ...cg,
                targetType: updateGoal.targetType ?? cg.targetType,
                targetValue: updateGoal.targetValue ?? cg.targetValue,
                isDone: updateGoal.isDone ?? cg.isDone,
                doneAt: (updateGoal.isDone && !cg.isDone) ? new Date().toISOString() : cg.doneAt
            };
            storage.set(STORAGE_KEYS.GOALS, goals);
            resultHabit.goal = goals[goalIndex];
        } else if (goalIndex !== -1) {
            resultHabit.goal = goals[goalIndex];
        }

        const allHabitCheckins = allCheckins.filter(c => c.habitId === id && c.userId === updatedHabit.userId);
        checkAndUpdateGoals(updatedHabit, updatedHabit.userId, allHabitCheckins);

        return resultHabit;

    } catch (error) {
        if (!error.status) error.status = 500;
        throw error;
    }
}

function deleteHabit(id) {
    try {
        if (!id) {
            throw new ServiceError(400, "Habit ID is required for deletion.");
        }

        const habits = storage.get(STORAGE_KEYS.HABITS, []);
        const habitExists = habits.some(h => h.id === id);

        if (!habitExists) {
            throw new ServiceError(404, `Habit with ID ${id} not found.`);
        }

        const newHabits = habits.filter(h => h.id !== id);
        const checkins = storage.get(STORAGE_KEYS.CHECKINS, []);
        const newCheckins = checkins.filter(c => c.habitId !== id);

        const goals = storage.get(STORAGE_KEYS.GOALS, []);
        const newGoals = goals.filter(g => g.habitId !== id);

        storage.set(STORAGE_KEYS.HABITS, newHabits);
        storage.set(STORAGE_KEYS.CHECKINS, newCheckins);
        storage.set(STORAGE_KEYS.GOALS, newGoals);

        return {
            message: "Habit and all associated goals and check-ins successfully deleted.",
            deletedHabitId: id
        };

    } catch (error) {
        if (!error.status) error.status = 500;
        throw error;
    }
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

    if (progress.is80Percent && !currentGoal.is80PercentNotified) {
        goalService.markGoal80Notified(currentGoal.id);
        return {
            type: "ENCOURAGEMENT",
            habitName: habit.name,
            goal: currentGoal,
            percentage: progress.percentage
        };
    }

    if (!currentGoal.isDone && progress.is100Percent) {
        goalService.markGoalDone(currentGoal.id);
        return {
            type: "ACHIEVED",
            habitName: habit.name,
            goal: currentGoal
        };
    }



    return null;
}