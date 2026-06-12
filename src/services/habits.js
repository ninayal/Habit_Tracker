import { authService } from "@/services/auth";
import { storage, STORAGE_KEYS } from "@/utils/storage";

export const habitService = {
    getAll,
    getByUserId,
    queryHabits,
    sortHabits,
    getById,
    createHabit,
    updateHabit,
    isScheduledDay
};

function getAll() {
    return storage.get(STORAGE_KEYS.HABITS, []);
}

function getById(id) {
    const habits = getAll();
    return habits.find(h => h.id === id);
}

function getByUserId() {
    const habits = getAll();

    const user = authService.getCurrentUser();

    return habits.filter(
        h => h.userId === user.id
    );
}

//có search có sort
function queryHabits(userId, query = {}) {

    const habits = getAll();
    let data = habits.filter(h => h.userId === userId);

    const {
        search,
        status,
        category,
        priority,
    } = query;

    if (search) {
        data = data.filter(h =>
            h.name
                .toLowerCase()
                .includes(
                    search.toLowerCase()
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

    // if (sortBy) {
    //     data = sortHabits(data, sortBy);
    // }

    return data;
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
    const habits = getAll();
    const user = authService.getCurrentUser();

    const nextId = habits.length > 0
            ? Math.max(...habits.map(h => h.id)) + 1 : 1;

    const now = new Date().toISOString();
    const newHabit = {
        id: nextId,
        userId: user.id,

        icon: data.icon,
        name: data.name,
        category: data.category,

        startDate: data.startDate,

        frequency: data.frequency,

        targetPerDay: Number(data.targetPerDay),

        priority: data.priority,

        autoOpenNote: data.autoOpenNote ?? false,

        status: "Active",

        order: habits.length + 1,

        createdAt: now,
        updatedAt: now,
    };

    habits.push(newHabit);

    storage.set( STORAGE_KEYS.HABITS, habits);
    return newHabit;
}

function updateHabit(id, updates) {
    const habits = getAll();
    const index = habits.findIndex(
        h => h.id === id
    );
    if (index === -1) {
        throw new Error("Habit not found");
    }

    const current = habits[index];
    const updatedHabit = {
        ...current,
        icon: updates.icon ?? current.icon,
        name: updates.name ?? current.name,
        category: updates.category ?? current.category,
        startDate: updates.startDate ?? current.startDate,
        frequency: updates.frequency ?? current.frequency,
        targetPerDay: updates.targetPerDay ?? current.targetPerDay,
        priority: updates.priority ?? current.priority,
        autoOpenNote: updates.autoOpenNote ?? current.autoOpenNote,
        status: updates.status ?? current.status,
        updatedAt: new Date().toISOString(),
    };

    habits[index] = updatedHabit;

    storage.set( STORAGE_KEYS.HABITS, habits);
    return updatedHabit;
}

//kiểm trả habit này có frequency không, ngày bắt buộc
function isScheduledDay(habit, date) {
    if (!habit.frequency) return true;
    if (habit.frequency.repeatType === 'daily') return true;
    if (habit.frequency.repeatType === 'specific_days') {
        const dayOfWeek = date.getDay(); // 0 (Chủ nhật) -> 6 (Thứ 7) theo JS
        return habit.frequency.daysOfWeek.includes(dayOfWeek);
    }
    return true;
}