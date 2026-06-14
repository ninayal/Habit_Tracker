import { GalleryVerticalEnd, ListChecks, LogOut, MoonStar, SunMedium, UserRound, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { THEME } from "@/services/theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";

const menuItems = [
    {
        title: "Dashboard",
        icon: ListChecks,
        href: "/dashboard",
    },
    {
        title: "Dashboard-Demo",
        icon: ListChecks,
        href: "/dashboard-demo",
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

export default function SideBarMenu({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const isDark = theme === THEME.DARK;
    const themeLabel = isDark ? "Dark" : "Light";
    const ThemeIcon = isDark ? MoonStar : SunMedium;
    const navigate = useNavigate();

    const themeButtonClassName = isDark
        ? "bg-[#1F2937] text-[#F9FAFB] hover:border-brand-pink hover:bg-[#273449]"
        : "bg-white text-[#1F2937] hover:border-brand-pink hover:bg-[#FFF0F7]";

    const handleLogout = () => {
        authService.logout();
        navigate("/signin", { replace: true });
    };

    const showText = !isCollapsed || isMobileOpen;

    return (
        <>
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside 
                className={`brand-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[color:var(--brand-border)] bg-white shadow-[6px_0_24px_rgba(31,41,55,0.06)] transition-all duration-300 ease-in-out
                    ${isCollapsed ? "w-20" : "w-64"}
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="flex items-center justify-between p-4 pb-3 min-h-[72px]">
                    {showText && (
                        <div className="whitespace-nowrap overflow-hidden">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--brand-sidebar-muted)]">
                                Habit tracker
                            </p>
                            <h2 className="mt-1 text-lg font-semibold text-[color:var(--brand-text)]">
                                1Percent
                            </h2>
                        </div>
                    )}
                    
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`hidden md:flex p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors
                            ${isCollapsed ? 'mx-auto' : ''}
                        `}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setIsMobileOpen(false)} 
                                className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 group
                                    ${isActive 
                                        ? "bg-[var(--brand-active-bg)] font-medium text-[var(--brand-active-text)]" 
                                        : "text-[color:var(--brand-sidebar-muted)] hover:bg-[var(--brand-hover-bg)] hover:text-[color:var(--brand-sidebar-text)]"
                                    }
                                    ${isCollapsed && !isMobileOpen ? "justify-center" : "gap-3"}
                                `}
                                title={isCollapsed ? item.title : ""}
                            >
                                <Icon className={`shrink-0 ${isActive ? '' : ''}`} size={20} />
                                
                                {showText && (
                                    <span className="whitespace-nowrap">{item.title}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex flex-col gap-3 p-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setTheme(isDark ? THEME.LIGHT : THEME.DARK)}
                        className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors duration-150 ${themeButtonClassName}
                            ${isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 gap-3 w-full"}
                        `}
                        title="Toggle Theme"
                    >
                        <ThemeIcon className="h-5 w-5 shrink-0 text-brand-pink" />
                        {showText && <span>{themeLabel} mode</span>}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className={`flex items-center rounded-lg py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50
                            ${isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 gap-3 w-full"}
                        `}
                        title="Sign out"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {showText && <span>Sign out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}