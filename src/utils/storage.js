export const STORAGE_KEYS = {
    USERS: "users",
    HABITS: "habits",
    CHECKINS: "checkins",
    GOALS: "goals",
    CURRENT_USER: "current_user",
    PROFILE: "profile",
    THEME: "theme",
};

export const storage = {
    get,
    set,
    remove,
    clear,
};

function get(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return defaultValue;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return defaultValue;
    }
}

function set(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
    }
}

function remove(key) {
    localStorage.removeItem(key);
}

function clear() {
    localStorage.clear();
}