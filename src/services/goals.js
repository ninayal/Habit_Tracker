import { storage, STORAGE_KEYS } from "@/utils/storage";


export const goalService = {
    getGoalsByHabit,
    markGoalDone,
};


function getAllGoals() {
    return storage.get(STORAGE_KEYS.GOALS, []);
}

function getGoalsByHabit(habitId, userId) {
    const goals = getAllGoals();
    return goals.filter(g => g.habitId === habitId && g.userId === userId && !g.isDone);
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
