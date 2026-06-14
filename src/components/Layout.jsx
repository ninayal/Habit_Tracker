import SideBarMenu from '@/components/SideBarMenu'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Menu } from 'lucide-react'

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--brand-page-bg)]">
            <SideBarMenu 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* Mobile Header (Chỉ hiện trên màn hình nhỏ) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-[color:var(--brand-border)] bg-white z-20 flex items-center px-4 shadow-sm">
                <button 
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="ml-2 font-semibold text-lg text-[color:var(--brand-text)]">
                    1Percent
                </h1>
            </div>

            {/* Main Content */}
            <main 
                className={`flex-1 transition-all duration-300 ease-in-out pt-16 md:pt-0 
                    ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}
                `}
            >
                <Outlet />
            </main>
        </div>
    )
}