import React, { useState } from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Ellipsis } from 'lucide-react';
import { HabitCardDropdown } from '@/components/HabitList/HabitCardDropdown';
import { Flame, Trophy, CheckCircle2, TrendingUp } from "lucide-react";

const stats = {
    currentStreak: 1,
    longestStreak: 24,
    totalCompletions: 148,
    completionRate: 86,
};

const pluralize = (count, singular, plural = `${singular}s`) =>
    `${count} ${count > 1 ? plural : singular}`;


export default function HabitDetail({
    children, open, onOpenChange, habit,
    onEdit, onChangeStatus, onDelete
}) {
    const [openDropdown, setOpenDropdown] = useState(false);


    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            direction="right"
        >
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent
                className="
                    bg-slate-50
                    data-[vaul-drawer-direction=right]:w-125
                    data-[vaul-drawer-direction=right]:max-w-none
                    data-[vaul-drawer-direction=right]:rounded-none
                "
            >
                <DrawerHeader>
                    <DrawerTitle>
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-lg h-10 w-10 bg-pink-300 flex justify-center items-center rounded-full">
                                    {habit?.icon}
                                </div>

                                <h3
                                    className={` font-semibold text-lg`}
                                >
                                    {habit?.name}
                                </h3>
                            </div>
                            <div>
                                <HabitCardDropdown
                                    open={openDropdown}
                                    setOpen={setOpenDropdown}
                                    status={habit?.status}
                                    onEdit={() => onEdit?.(habit)}
                                    onChangeStatus={(status) =>
                                        onChangeStatus?.(habit, status)
                                    }
                                    onDelete={() => onDelete?.(habit)}
                                >
                                    <button
                                        className=" p-1 rounded-md hover:bg-blue/40 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdown(true);
                                        }}
                                    >
                                        <Ellipsis size={22} />
                                    </button>
                                </HabitCardDropdown>

                            </div>
                        </div>
                    </DrawerTitle>

                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4 pb-6">

                    <div className="grid grid-cols-2 gap-3">

                        <StatCard
                            title="Current Streak"
                            value={`${pluralize(stats.currentStreak, "day")}`}
                            icon={<Flame size={18} className='text-red-600' />}
                            className="bg-pink/40"
                        />

                        <StatCard
                            title="Longest Streak"
                            value={`${pluralize(stats.longestStreak, "day")}`}
                            icon={<Trophy size={18} className='text-yellow-600' />}
                            className="bg-yellow/70"
                        />

                        <StatCard
                            title="Total Completions"
                            value={`${pluralize(stats.totalCompletions, "time")}`}
                            icon={<CheckCircle2 size={18} className='text-purple-600' />}
                            className="bg-green/70"
                        />

                        <StatCard
                            title="Last 7 Days Rate"
                            value={`${stats.completionRate}%`}
                            icon={<TrendingUp size={18} className='text-blue-600' />}
                            className="bg-blue/70"
                        />

                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}


function StatCard({ title, value, icon, className }) {
    return (
        <div
            className={`rounded-xl p-4 shadow-sm
                ${className}
            `}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    {title}
                </p>
                <div className="text-gray-700">
                    {icon}
                </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-600">
                {value}
            </p>
        </div>
    );
}