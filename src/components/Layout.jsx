import SideBarMenu from '@/components/SideBarMenu'
import { Outlet } from 'react-router'

export default function Layout() {
    return (
        <div className="flex">
            <SideBarMenu />
            <main className={`flex-1 ml-64`}>
                <Outlet />
            </main>
        </div>
    )
}
