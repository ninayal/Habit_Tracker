import { storage, STORAGE_KEYS } from "@/utils/storage";

export const THEME = {
    LIGHT: "light",
    DARK: "dark",
};

export function getStoredTheme() {
    return storage.get(STORAGE_KEYS.THEME, THEME.LIGHT);
}

export function applyTheme(theme) {
    const normalizedTheme = theme === THEME.DARK ? THEME.DARK : THEME.LIGHT;

    document.documentElement.classList.toggle("dark", normalizedTheme === THEME.DARK);
    document.documentElement.style.colorScheme = normalizedTheme;
}

export function saveTheme(theme) {
    const normalizedTheme = theme === THEME.DARK ? THEME.DARK : THEME.LIGHT;

    storage.set(STORAGE_KEYS.THEME, normalizedTheme);
    applyTheme(normalizedTheme);

    return normalizedTheme;
}
