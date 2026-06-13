import { Link, useLocation } from "react-router-dom";
import { GalleryVerticalEnd, ListChecks, LogOut, MoonStar, SunMedium, UserRound } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { THEME } from "@/services/theme";

const menuItems = [
    {
        title: "Dashboard",
        icon: ListChecks,
        href: "/dashboard",
    },
    {
        title: "All habits",
        icon: GalleryVerticalEnd,
        href: "/all-habits",
    },
    {
        title: "Profile",
        icon: UserRound,
        href: "/profile",
    },
];

export default function SideBarMenu() {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const isDark = theme === THEME.DARK;
    const themeLabel = isDark ? "Dark" : "Light";
    const ThemeIcon = isDark ? MoonStar : SunMedium;
    const themeButtonClassName = isDark
        ? "border border-[#475569] bg-[#1F2937] text-[#F9FAFB] hover:border-brand-pink hover:bg-[#273449]"
        : "border border-[#E8E2E8] bg-white text-[#1F2937] hover:border-brand-pink hover:bg-[#FFF0F7]";

    const handleLogout = () => {
        localStorage.removeItem("current_user");
        window.location.href = "/sign-in";
    };

    return (
        <aside className="brand-sidebar fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-[color:var(--brand-border)] shadow-[6px_0_24px_rgba(31,41,55,0.06)]">
                <div className="px-4 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--brand-sidebar-muted)]">Habit tracker</p>
                        <h2 className="mt-1 text-lg font-semibold text-[color:var(--brand-text)]">1Percent</h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setTheme(isDark ? THEME.LIGHT : THEME.DARK)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 ${themeButtonClassName}`}
                    >
                        <ThemeIcon className="h-4 w-4 text-brand-pink" />
                        <span>{themeLabel}</span>
                    </button>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive
                            ? "bg-[var(--brand-active-bg)] font-medium text-[var(--brand-active-text)]"
                                    : "text-[color:var(--brand-sidebar-muted)] hover:bg-[var(--brand-hover-bg)] hover:text-[color:var(--brand-sidebar-text)]"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-[var(--brand-hover-bg)]"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
