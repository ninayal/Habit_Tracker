import React from 'react'

export default function HabitStatCard({ icon, title, value, children, desc = "", className }) {
    return (
        <div
            className={`card rounded-lg p-4 relative overflow-hidden before:absolute before:inset-0 before:pointer-events-none
                before:bg-[radial-gradient(circle_at_top_right,rgba(249,178,215,0.15),transparent_45%)]
                ${className}
            `}>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                {icon}{" "}{title}
            </div>
            <div className="mt-1 flex items-baseline gap-2 py-2 text-black">
                <div className="text-2xl font-semibold">{value}</div>
                {children}
            </div>
            <div className="text-xs mt-0.5 text-slate-500">{desc}</div>
        </div>
    )
}
