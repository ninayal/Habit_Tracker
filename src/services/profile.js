import { formatReadableDate } from "@/utils/date";
import { formatDate } from "@/utils/helper";
import { storage, STORAGE_KEYS } from "@/utils/storage";

const DEFAULT_EDITABLE_FIELDS = {
    bio: "",
    habitGoal: "",
    reminderTime: "07:00",
    defaultHabitCategory: "Health",
    weekStartsOn: "monday",
};

function createDefaultHabitDefaults({ includeStartDate = true } = {}) {
    return {
        icon: "💧",
        name: "",
        category: "Health",
        ...(includeStartDate ? { startDate: formatDate() } : {}),
        frequency: {
            repeatType: "specific_days",
            daysOfWeek: [],
        },
        targetPerDay: 1,
        priority: "Medium",
        autoOpenNote: false,
        goal: {
            targetType: "streak",
            targetValue: 3,
        },
    };
}

function normalizeHabitDefaults(habitDefaults) {
    const defaults = createDefaultHabitDefaults({ includeStartDate: false });

    if (!habitDefaults) {
        return defaults;
    }

    const restHabitDefaults = { ...habitDefaults };
    delete restHabitDefaults.startDate;

    return {
        ...defaults,
        ...restHabitDefaults,
        icon: restHabitDefaults.icon?.trim() || defaults.icon,
        name: restHabitDefaults.name ?? defaults.name,
        category: restHabitDefaults.category || defaults.category,
        frequency: {
            ...defaults.frequency,
            ...(restHabitDefaults.frequency || {}),
            daysOfWeek: Array.isArray(restHabitDefaults.frequency?.daysOfWeek)
                ? [...restHabitDefaults.frequency.daysOfWeek]
                : [...defaults.frequency.daysOfWeek],
        },
        targetPerDay: Number.isFinite(Number(restHabitDefaults.targetPerDay)) && Number(restHabitDefaults.targetPerDay) > 0
            ? Number(restHabitDefaults.targetPerDay)
            : defaults.targetPerDay,
        priority: restHabitDefaults.priority || defaults.priority,
        autoOpenNote: restHabitDefaults.autoOpenNote ?? defaults.autoOpenNote,
        goal: {
            ...defaults.goal,
            ...(restHabitDefaults.goal || {}),
            targetValue: Number.isFinite(Number(restHabitDefaults.goal?.targetValue)) && Number(restHabitDefaults.goal.targetValue) > 0
                ? Number(restHabitDefaults.goal.targetValue)
                : defaults.goal.targetValue,
        },
    };
}

function normalizeUser(user) {
    if (!user) {
        return null;
    }

    const fullName = user.fullName?.trim() || "Habit Tracker User";
    const email = user.email?.trim() || "";
    const restUser = Object.fromEntries(
        Object.entries(user).filter(
            ([key]) =>
                key !== "avatarStyle" &&
                key !== "notificationPreference",
        ),
    );

    return {
        ...restUser,
        fullName,
        email,
        image: user.image?.trim() || "",
        dateOfBirth: user.dateOfBirth?.trim() || "",
        bio: user.bio?.trim() || DEFAULT_EDITABLE_FIELDS.bio,
        habitGoal: user.habitGoal?.trim() || DEFAULT_EDITABLE_FIELDS.habitGoal,
        reminderTime: user.reminderTime || DEFAULT_EDITABLE_FIELDS.reminderTime,
        defaultHabitCategory: user.defaultHabitCategory || DEFAULT_EDITABLE_FIELDS.defaultHabitCategory,
        weekStartsOn: user.weekStartsOn || DEFAULT_EDITABLE_FIELDS.weekStartsOn,
        habitDefaults: normalizeHabitDefaults(user.habitDefaults),
    };
}

function getUsers() {
    return storage.get(STORAGE_KEYS.USERS, []);
}

function getStoredProfile() {
    return normalizeUser(storage.get(STORAGE_KEYS.PROFILE));
}

export function getCurrentUserProfile() {
    const currentUser = normalizeUser(storage.get(STORAGE_KEYS.CURRENT_USER));
    const storedProfile = getStoredProfile();
    const users = getUsers();
    const fallbackUser = normalizeUser(users[0]);

    if (currentUser && storedProfile) {
        if (currentUser.id === storedProfile.id) {
            return normalizeUser({
                ...currentUser,
                ...storedProfile,
                image: storedProfile.image || currentUser.image,
            });
        }
        return currentUser;
    }

    return currentUser || storedProfile || fallbackUser || null;
}

export function getProfileFormValues(profile) {
    return {
        fullName: profile?.fullName || "",
        email: profile?.email || "",
        dateOfBirth: profile?.dateOfBirth || "",
        reminderTime: profile?.reminderTime || DEFAULT_EDITABLE_FIELDS.reminderTime,
    };
}

export function getHabitDefaultFormValues(profile) {
    return normalizeHabitDefaults(profile?.habitDefaults);
}

export function getWeekStartsOn(profile = getCurrentUserProfile()) {
    return profile?.weekStartsOn === "sunday" ? "sunday" : "monday";
}

export function getCreateHabitInitialValues(profile) {
    const defaults = createDefaultHabitDefaults();
    const habitDefaults = normalizeHabitDefaults(profile?.habitDefaults);

    return {
        ...defaults,
        ...habitDefaults,
        icon: habitDefaults.icon?.trim() || defaults.icon,
        name: habitDefaults.name ?? defaults.name,
        category: habitDefaults.category || defaults.category,
        frequency: {
            ...defaults.frequency,
            ...(habitDefaults.frequency || {}),
            daysOfWeek: Array.isArray(habitDefaults.frequency?.daysOfWeek)
                ? [...habitDefaults.frequency.daysOfWeek]
                : [...defaults.frequency.daysOfWeek],
        },
        targetPerDay: Number.isFinite(Number(habitDefaults.targetPerDay)) && Number(habitDefaults.targetPerDay) > 0
            ? Number(habitDefaults.targetPerDay)
            : defaults.targetPerDay,
        priority: habitDefaults.priority || defaults.priority,
        autoOpenNote: habitDefaults.autoOpenNote ?? defaults.autoOpenNote,
        goal: {
            ...defaults.goal,
            ...(habitDefaults.goal || {}),
            targetValue: Number.isFinite(Number(habitDefaults.goal?.targetValue)) && Number(habitDefaults.goal.targetValue) > 0
                ? Number(habitDefaults.goal.targetValue)
                : defaults.goal.targetValue,
        },
    };
}

export function getDefaultProfileFormValues(profile) {
    const fullName = profile?.fullName || "";
    const email = profile?.email || "";

    return {
        fullName,
        email,
        dateOfBirth: profile?.dateOfBirth || "",
        bio: DEFAULT_EDITABLE_FIELDS.bio,
        habitGoal: DEFAULT_EDITABLE_FIELDS.habitGoal,
        reminderTime: DEFAULT_EDITABLE_FIELDS.reminderTime,
        defaultHabitCategory: DEFAULT_EDITABLE_FIELDS.defaultHabitCategory,
        weekStartsOn: DEFAULT_EDITABLE_FIELDS.weekStartsOn,
        habitDefaults: createDefaultHabitDefaults({ includeStartDate: false }),
    };
}

export function updateCurrentUserProfile(updates) {
    const currentProfile = getCurrentUserProfile();

    if (!currentProfile) {
        return null;
    }

    const nextProfile = normalizeUser({
        ...currentProfile,
        ...updates,
        habitDefaults: updates.habitDefaults
            ? {
                ...currentProfile.habitDefaults,
                ...updates.habitDefaults,
                frequency: {
                    ...currentProfile.habitDefaults?.frequency,
                    ...(updates.habitDefaults.frequency || {}),
                },
                goal: {
                    ...currentProfile.habitDefaults?.goal,
                    ...(updates.habitDefaults.goal || {}),
                },
            }
            : currentProfile.habitDefaults,
        updatedAt: new Date().toISOString(),
    });

    storage.set(STORAGE_KEYS.PROFILE, nextProfile);

    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser?.id === nextProfile.id) {
        storage.set(STORAGE_KEYS.CURRENT_USER, normalizeUser({
            ...currentUser,
            ...updates,
            image: updates.image ?? currentUser.image,
            updatedAt: nextProfile.updatedAt,
        }));
    }

    const users = storage.get(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((user) => user.id === nextProfile.id);
    if (userIndex !== -1) {
        users[userIndex] = normalizeUser({
            ...users[userIndex],
            ...updates,
            image: updates.image ?? users[userIndex].image,
            updatedAt: nextProfile.updatedAt,
        });
        storage.set(STORAGE_KEYS.USERS, users);
    }

    return nextProfile;
}

export function resetCurrentUserProfile() {
    const currentProfile = getCurrentUserProfile();

    if (!currentProfile) {
        return null;
    }

    const nextProfile = normalizeUser({
        ...currentProfile,
        ...getDefaultProfileFormValues(currentProfile),
    });

    storage.set(STORAGE_KEYS.PROFILE, nextProfile);

    return nextProfile;
}

export function getActiveHabitCount(userId = getCurrentUserProfile()?.id) {
    const habits = storage.get(STORAGE_KEYS.HABITS, []);

    if (!userId) {
        return 0;
    }

    return habits.filter((habit) => habit.userId === userId && habit.status === "Active").length;
}

export function formatJoinedDate(dateValue) {
    return formatReadableDate(dateValue, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateOfBirth(dateValue) {
    if (!dateValue) {
        return "";
    }

    return formatReadableDate(dateValue, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
