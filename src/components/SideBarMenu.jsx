import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LogOut,
    Moon,
    GalleryVerticalEnd,
    ListChecks
} from "lucide-react";
import { authService } from "@/services/auth";


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
    
];

export default function SideBarMenu() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate("/signin", { replace: true });
    };

    const toggleTheme = () => {
        document.documentElement.classList.toggle("dark");
    };

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-background">
            {/* Header */}
            <div className="p-4">
                <h2 className="text-lg font-semibold">
                    Habit tracking 
                </h2>
                
            </div>

            {/* Menu */}
            <nav className="flex-1 space-y-1 px-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                        location.pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive
                                    ? "bg-muted font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t p-4 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Moon className="h-4 w-4" />
                    <span>Đổi giao diện</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}