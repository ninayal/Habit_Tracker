import { useEffect, useMemo, useState } from "react";

import { ThemeContext } from "@/context/theme-context";
import { applyTheme, getStoredTheme, saveTheme, THEME } from "@/services/theme";

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => getStoredTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const value = useMemo(() => {
        const setTheme = (nextTheme) => {
            const resolvedTheme = typeof nextTheme === "function"
                ? nextTheme(theme)
                : nextTheme;

            setThemeState(saveTheme(resolvedTheme));
        };

        return {
            theme,
            isDark: theme === THEME.DARK,
            isLight: theme === THEME.LIGHT,
            setTheme,
            toggleTheme: () => setTheme(theme === THEME.DARK ? THEME.LIGHT : THEME.DARK),
        };
    }, [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
