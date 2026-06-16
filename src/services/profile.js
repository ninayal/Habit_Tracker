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

function createDefaultHabitDefaults() {
    return {
        icon: "💧",
        name: "",
        category: "Health",
        startDate: formatDate(),
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
    const defaults = createDefaultHabitDefaults();

    if (!habitDefaults) {
        return defaults;
    }

    return {
        ...defaults,
        ...habitDefaults,
        icon: habitDefaults.icon?.trim() || defaults.icon,
        name: habitDefaults.name ?? defaults.name,
        category: habitDefaults.category || defaults.category,
        startDate: habitDefaults.startDate || defaults.startDate,
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

    return currentUser || storedProfile || fallbackUser || null;
}

export function getProfileFormValues(profile) {
    return {
        fullName: profile?.fullName || "",
        email: profile?.email || "",
        reminderTime: profile?.reminderTime || DEFAULT_EDITABLE_FIELDS.reminderTime,
    };
}

export function getHabitDefaultFormValues(profile) {
    return normalizeHabitDefaults(profile?.habitDefaults);
}

export function getDefaultProfileFormValues(profile) {
    const fullName = profile?.fullName || "";
    const email = profile?.email || "";

    return {
        fullName,
        email,
        bio: DEFAULT_EDITABLE_FIELDS.bio,
        habitGoal: DEFAULT_EDITABLE_FIELDS.habitGoal,
        reminderTime: DEFAULT_EDITABLE_FIELDS.reminderTime,
        defaultHabitCategory: DEFAULT_EDITABLE_FIELDS.defaultHabitCategory,
        weekStartsOn: DEFAULT_EDITABLE_FIELDS.weekStartsOn,
        habitDefaults: createDefaultHabitDefaults(),
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
