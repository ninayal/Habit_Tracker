import { storage, STORAGE_KEYS } from "@/utils/storage";


export const goalService = {
    getGoalsByHabit,
    markGoalDone,
    markGoal80Notified,
    revokeGoalDone,         
    revokeGoal80Notified
};


function getAllGoals() {
    return storage.get(STORAGE_KEYS.GOALS, []);
}

function getGoalsByHabit(habitId, userId) {
    const goals = getAllGoals();
    return goals.filter(g => g.habitId === habitId && g.userId === userId);
}

function markGoalDone(goalId) {
    const goals = getAllGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
        goals[index].isDone = true;
        goals[index].doneAt = new Date().toISOString();
        storage.set(STORAGE_KEYS.GOALS, goals);
    }
}

function markGoal80Notified(goalId) {
    const goals = storage.get(STORAGE_KEYS.GOALS, []);
    const index = goals.findIndex(g => g.id === goalId);
    
    if (index !== -1 && !goals[index].is80PercentNotified) {
        goals[index].is80PercentNotified = true;
        storage.set(STORAGE_KEYS.GOALS, goals);
    }
}

function revokeGoalDone(goalId) {
    const goals = getAllGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1 && goals[index].isDone) {
        goals[index].isDone = false;
        goals[index].doneAt = null;
        storage.set(STORAGE_KEYS.GOALS, goals);
    }
}

function revokeGoal80Notified(goalId) {
    const goals = getAllGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1 && goals[index].is80PercentNotified) {
        goals[index].is80PercentNotified = false;
        storage.set(STORAGE_KEYS.GOALS, goals);
    }
}