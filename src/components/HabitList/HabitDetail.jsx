import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Ellipsis } from 'lucide-react';
import { HabitCardDropdown } from '@/components/HabitList/HabitCardDropdown';
import { Flame, Trophy, CheckCircle2, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import HabitStatCard from '@/components/HabitList/HabitStatCard';
import useHabitStats from '@/hooks/useHabitStats';
import { Badge } from '@/components/ui/badge';
import HabitNoteTimeline from '@/components/HabitList/HabitNoteTimeline';
import { getLocalTimeZone, today, parseDate } from '@internationalized/date';
import { I18nProvider } from 'react-aria-components';
import { CalendarCustom } from '@/components/HabitList/CalendarCustom';
import { useCheckinContext } from '@/hooks/useCheckins';
import { toast } from "react-toastify";
import { celebrate } from '@/components/HabitList/Confetti';
import { HabitNoteDialog } from '@/components/HabitList/HabitNoteDialog';

const pluralize = (count, singular, plural = `${singular}s`) =>
    `${count} ${count > 1 ? plural : singular}`;


export default function HabitDetail({
    children, open, onOpenChange, habit,
    onEdit, onChangeStatus, onDelete
}) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const { stats, habitCheckins } = useHabitStats(habit);

    let TrendIcon;
    let trendColorStyle;
    let trendText;
    if (stats.rateTrend > 0) {
        TrendIcon = TrendingUp;
        trendColorStyle = "text-green-700 border-green-200 bg-green-50";
        trendText = `+${stats.rateTrend}%`;
    } else if (stats.rateTrend < 0) {
        TrendIcon = TrendingDown;
        trendColorStyle = "text-red-700 border-red-200 bg-red-50";
        trendText = `${stats.rateTrend}%`;
    } else {
        TrendIcon = Minus;
        trendColorStyle = "text-gray-500 border-gray-200 bg-gray-50";
        trendText = "0%";
    }

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
                                    className={` font-semibold text-lg text-black`}
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
                                        className=" p-1 text-black rounded-md hover:bg-blue/40 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0"
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
                    <DrawerDescription>
                        <span className='pl-13'>
                            View habit statistics and notes.
                        </span>
                    </DrawerDescription>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4 pb-6 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <HabitStatCard
                            title="Current Streak"
                            value={`${pluralize(stats.currentStreak, "day")}`}
                            icon={<Flame size={18} className='text-red-600' />}
                            desc='consecutive successful days'
                        />
                        <HabitStatCard
                            title="Longest Streak"
                            value={`${pluralize(stats.longestStreak, "day")}`}
                            icon={<Trophy size={18} className='text-yellow-600' />}
                            desc='best streak ever'
                        />
                        <HabitStatCard
                            title="Total Completed Days"
                            value={`${pluralize(stats.totalCompletions, "day")}`}
                            icon={<CheckCircle2 size={18} className='text-purple-600' />}
                            desc='the whole time'
                        />
                        <HabitStatCard
                            title="Last 7 Days Rate"
                            value={`${stats.completionRate}%`}
                            icon={<Activity size={18} className='text-blue-600' />}
                            children={
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 px-1.5 py-0 font-medium ${trendColorStyle}`}
                                >
                                    <TrendIcon size={12} strokeWidth={2.5} />
                                    {trendText}
                                </Badge>
                            }
                            desc='vs last week'
                        />
                    </div>

                    <Calendar
                        habit={habit}
                        habitCheckins={habitCheckins}
                    />

                    <HabitNoteTimeline
                        habit={habit}
                        checkins={habitCheckins}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    )
}


function Calendar({ habit, habitCheckins }) {
    const currentDate = today(getLocalTimeZone());
    const startDate = habit?.startDate ? parseDate(habit.startDate.split('T')[0]) : undefined;

    const { updateCheckin, resetCheckin } = useCheckinContext();

    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [noteContent, setNoteContent] = useState("");

    const [history, setHistory] = useState({});
    const isHabitDisabled = habit?.status === "Archived" || habit?.status === "Paused";

    const habitLogDataMap = useMemo(() => {
        if (!habit || !habit?.id) return {};

        const map = habitCheckins
            .reduce((acc, checkin) => {
                let currentStatus = checkin?.completionStatus;
                if (!currentStatus) {
                    if (checkin.completedCount >= habit.targetPerDay) {
                        currentStatus = 'completed';
                    } else if (checkin.completedCount > 0) {
                        currentStatus = 'in_progress';
                    } else {
                        currentStatus = 'not_checked';
                    }
                }

                acc[checkin.date] = {
                    ...checkin,
                    target: habit.targetPerDay,
                    status: currentStatus,
                    canUndo: !!history[checkin.date]?.length
                };

                return acc;
            }, {});

        Object.keys(history).forEach(dateStr => {
            if (!map[dateStr] && history[dateStr]?.length > 0) {
                map[dateStr] = {
                    completedCount: 0,
                    completionStatus: 'not_checked',
                    target: habit.targetPerDay,
                    status: 'not_checked',
                    canUndo: true
                };
            }
        });

        return map;
    }, [habit, habitCheckins, history]);

    const trackHistory = useCallback((dateString) => {
        setHistory(prev => {
            const currentState = habitLogDataMap[dateString] ?? {
                completionStatus: "not_checked",
                completedCount: 0,
                note: ""
            };

            const dateStack = prev[dateString] || [];
            return {
                ...prev,
                [dateString]: [...dateStack, { ...currentState }].slice(-10)
            };
        });
    }, [habitLogDataMap]);

    const handleCellAction = useCallback((action, dateString, value = null) => {
        switch (action) {
            case "update_progress": {
                const target = habit.targetPerDay;
                if (value < 0) {
                    toast.error("Progress cannot be less than 0");
                    return;
                }
                if (value > target) {
                    toast.error(`Progress cannot exceed target (${target})`);
                    return;
                }

                trackHistory(dateString);

                if (value === 0) {
                    resetCheckin(habit.id, dateString);
                } else {
                    if (value === target) {
                        celebrate();
                        if (habit.autoOpenNote) {
                            setTimeout(() => {
                                setSelectedDate(dateString);
                                setIsNoteDialogOpen(true);
                            }, 600);
                        }
                    }
                    updateCheckin(habit.id, dateString, {
                        completedCount: value,
                    });
                }
                return;
            }

            case "skipped":
                trackHistory(dateString);
                if (habit.autoOpenNote) {
                    setSelectedDate(dateString);
                    setIsNoteDialogOpen(true);
                }
                updateCheckin(habit.id, dateString, {
                    completionStatus: "skipped",
                });
                return;

            case "failed":
                trackHistory(dateString);
                if (habit.autoOpenNote) {
                    setSelectedDate(dateString);
                    setIsNoteDialogOpen(true);
                }
                updateCheckin(habit.id, dateString, {
                    completionStatus: "failed",
                });
                return;

            case "reset":
                trackHistory(dateString);
                resetCheckin(habit.id, dateString);
                return;

            case "undo": {
                const dateStack = history[dateString];
                if (!dateStack || dateStack.length === 0) return;

                const newDateStack = [...dateStack];
                const prevState = newDateStack.pop();
                if (!prevState.completionStatus || prevState.completionStatus === "not_checked") {
                    resetCheckin(habit.id, dateString);
                } else {
                    updateCheckin(habit.id, dateString, {
                        completionStatus: prevState.completionStatus,
                        completedCount: prevState.completedCount,
                        note: prevState.note || ""
                    });
                }

                setHistory(prev => {
                    const newHistory = { ...prev };
                    if (newDateStack.length === 0) {
                        delete newHistory[dateString]; 
                    } else {
                        newHistory[dateString] = newDateStack;
                    }
                    return newHistory;
                });

                return;
            }

            case "note": {
                setSelectedDate(dateString);
                setNoteContent(value);
                setIsNoteDialogOpen(true);
                return;
            }
        }
    }, [habit, history, trackHistory, updateCheckin, resetCheckin]);

    const handleSaveNote = (noteContent) => {
        updateCheckin(habit.id, selectedDate, {
            note: noteContent
        });
        toast.success("Saved note successfully!")
    };

    return (
        <div className='bg-white px-4 pt-3 rounded-2xl'>
            <I18nProvider locale="en-US">
                <CalendarCustom
                    aria-label="Checking Calendar"
                    visibleDuration={{ months: 1 }}
                    minValue={startDate}
                    maxValue={currentDate}
                    habitDataMap={habitLogDataMap}
                    isReadOnly
                    onCellAction={handleCellAction}
                    className={`w-[calc(12*var(--spacing)*9)]`}
                    isHabitDisabled={isHabitDisabled}
                />
            </I18nProvider>

            <HabitNoteDialog
                open={isNoteDialogOpen}
                onOpenChange={setIsNoteDialogOpen}
                habitName={habit.name}
                initialNote={noteContent}
                onSave={handleSaveNote}
                dateStr={selectedDate}
            />
        </div>
    )
}
