import { formatReadableDate } from "@/utils/date";
import { storage, STORAGE_KEYS } from "@/utils/storage";

const DEFAULT_EDITABLE_FIELDS = {
    bio: "",
    habitGoal: "",
    reminderTime: "07:00",
    defaultHabitCategory: "Health",
    weekStartDay: "Monday",
};

function getHandleFromEmail(email = "") {
    const value = email.trim().split("@")[0];

    return value ? `@${value}` : "";
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
                key !== "notificationPreference" &&
                key !== "username" &&
                key !== "handle",
        ),
    );

    return {
        ...restUser,
        fullName,
        email,
        handle: getHandleFromEmail(email),
        bio: user.bio?.trim() || DEFAULT_EDITABLE_FIELDS.bio,
        habitGoal: user.habitGoal?.trim() || DEFAULT_EDITABLE_FIELDS.habitGoal,
        reminderTime: user.reminderTime || DEFAULT_EDITABLE_FIELDS.reminderTime,
        defaultHabitCategory: user.defaultHabitCategory || DEFAULT_EDITABLE_FIELDS.defaultHabitCategory,
        weekStartDay: user.weekStartDay || DEFAULT_EDITABLE_FIELDS.weekStartDay,
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
        weekStartDay: DEFAULT_EDITABLE_FIELDS.weekStartDay,
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
