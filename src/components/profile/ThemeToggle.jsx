import { MoonStar, SunMedium } from "lucide-react";

import { THEME } from "@/services/theme";

export default function ThemeToggle({ theme, onThemeChange, className = "" }) {
    const isDark = theme === THEME.DARK;
    const label = isDark ? "Dark" : "Light";
    const Icon = isDark ? MoonStar : SunMedium;
    const buttonClassName = isDark
        ? "border border-brand-border bg-[var(--brand-toggle-bg)] text-[var(--brand-text)] hover:bg-[var(--brand-hover-bg)]"
        : "border border-[var(--brand-border)] bg-[var(--brand-toggle-bg)] text-[var(--brand-text)] shadow-sm hover:border-[var(--brand-active-bg)] hover:bg-[var(--brand-hover-bg)]";

    return (
        <button
            type="button"
            onClick={() => onThemeChange(isDark ? THEME.LIGHT : THEME.DARK)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 ${buttonClassName} ${className}`}
        >
            <Icon className="h-4 w-4 text-brand-pink" />
            <span>{label}</span>
        </button>
    );
}
