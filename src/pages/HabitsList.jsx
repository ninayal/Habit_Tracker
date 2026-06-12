import { useCheckinContext } from '@/hooks/useCheckins';
import { useDebounce } from '@/hooks/useDebounce';
import { useHabits } from '@/hooks/useHabits';
import { useQueryParams } from '@/hooks/useQueryParams';
import React, { useEffect, useMemo, useState } from 'react'
import { format } from "date-fns";
import { habitService } from '@/services/habits';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CalendarIcon, ChevronDown, FolderOpen, LayoutGrid, MoreHorizontal } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import HabitCard from '@/components/HabitList/HabitCard';
import HabitDetail from '@/components/HabitList/HabitDetail';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import HabitsFilter from '@/components/HabitList/HabitsFilter';
import HabitForm from '@/components/HabitList/HabitForm';

export default function HabitsList() {
    const [query, setQuery] = useQueryParams({
        view: "list",
        search: "",
        status: "",
        category: "All",
        priority: "All",
        groupBy: "priority",
        sortBy: "order",
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const [openForm, setOpenForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);

    const debouncedSearch = useDebounce(query.search, 300);
    const finalQuery = {
        ...query,
        search: debouncedSearch
    };
    const { habits: allHabits, loading, error, reload } = useHabits(finalQuery);
    const { checkins, loadCheckins } = useCheckinContext();

    useEffect(() => {
        loadCheckins();
    }, [loadCheckins]);

    const checkinMap = useMemo(() => {
        const map = {};
        checkins.forEach(c => {
            map[`${c.habitId}-${c.date}`] = c;
        });
        return map;
    }, [checkins]);

    const statusMap = useMemo(() => {
        const map = {};
        const selectedDateStr = format(
            selectedDate,
            "yyyy-MM-dd"
        );
        allHabits.forEach(habit => {
            map[habit.id] = {
                checkin: checkinMap[`${habit.id}-${selectedDateStr}`]
            };
        });
        return map;
    }, [allHabits, selectedDate, checkinMap]);

    const habits = useMemo(() => {
        if (query.status === "Archived") return allHabits;
        const habits = allHabits?.filter(h => h.status !== "Archived") ?? [];
        return habits.map(habit => ({
            ...habit,
            isScheduledDay: habitService.isScheduledDay(habit, selectedDate)
        }));
    }, [allHabits, query, selectedDate]);

    const groupedHabits = useMemo(() => {
        if (!query.groupBy) return null;

        const groups = habits.reduce((acc, habit) => {
            const key = habit[query.groupBy] ?? "Other";
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(habit);
            return acc;
        }, {});

        Object.keys(groups).forEach(key => {
            groups[key] = habitService.sortHabits(
                groups[key],
                query.sortBy
            );
        });

        let entries = Object.entries(groups);
        if (query.groupBy === "priority") {
            const priorityOrder = { High: 0, Medium: 1, Low: 2, Other: 3 };
            entries.sort(
                ([a], [b]) =>
                    (priorityOrder[a]) - (priorityOrder[b])
            );
        }
        if (query.groupBy === "category") {
            entries.sort(([a], [b]) =>
                a.localeCompare(b)
            );
        }

        return entries;
    }, [habits, query.groupBy, query.sortBy]);

    const handleOpenHabitDetail = (habit) => {
        setSelectedHabit(habit);
        setOpenDrawer(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-blue-500">
                <Spinner className="size-15" />
            </div>
        );
    }

    const today = new Date();

    return (
        <div className='bg-yellow/40 min-h-screen p-4 md:p-8'>
            <div className='mx-auto'>
                <div className='flex items-center'>
                    <div className="flex items-center flex-1 gap-4">
                        <p className="font-semibold text-[20px] md:text-[24px]">
                            All Habits
                        </p>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="
                                        justify-start text-left font-normal
                                        bg-green/70
                                        hover:bg-green
                                        active:bg-green
                                        data-[state=open]:bg-green
                                        data-[state=open]:hover:bg-green
                                        focus:bg-green
                                        focus-visible:bg-green
                                        focus-visible:ring-0
                                        focus-visible:ring-offset-0
                                        shadow-none
                                        cursor-pointer
                                    "
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />

                                    {format(selectedDate, "dd/MM/yyyy")}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={date =>
                                        date &&
                                        setSelectedDate(date)
                                    }
                                    disabled={(date) => date > today}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <button
                        className='py-2 px-4 rounded-lg bg-pink-400 hover:bg-pink-500 text-white font-semibold text-[14px] flex items-center'
                        onClick={() => {
                            setEditingHabit(null);
                            setOpenForm(true);
                        }}
                    >
                        Create Habit
                    </button>

                    <HabitForm
                        key={editingHabit?.id ?? "create"}
                        open={openForm}
                        setOpen={setOpenForm}
                        habit={editingHabit}
                        reload={reload}
                    />

                </div>

                <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6 min-h-10/12'>
                    <HabitsFilter query={query} setQuery={setQuery} />

                    <div className="mt-4 max-w-267.5">
                        {query.view === "list" ? (
                            <List
                                groupedHabits={groupedHabits}
                                habits={habits}
                                statusMap={statusMap}
                                groupBy={query.groupBy}
                                onHabitClick={handleOpenHabitDetail}
                            />
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <Kanban
                                    groupBy={query.groupBy}
                                    groupedHabits={groupedHabits}
                                    habits={habits}
                                    statusMap={statusMap}
                                    onHabitClick={handleOpenHabitDetail}
                                />
                            </div>
                        )}
                        <HabitDetail
                            open={openDrawer}
                            onOpenChange={setOpenDrawer}
                            habit={selectedHabit}
                        />
                    </div>


                </div>
            </div>
        </div>
    )
}


const List = ({ groupedHabits, habits, statusMap, groupBy, onHabitClick }) => {
    return (
        <div className="w-full pb-4 mt-6">
            <div className="flex flex-col gap-2">
                {groupedHabits ? (
                    groupedHabits.map(([key, items]) => (
                        <Collapsible
                            key={key}
                            defaultOpen
                            className="rounded-lg bg-white "
                        >
                            <CollapsibleTrigger className="group flex w-full gap-4 items-center px-4 py-2 font-semibold">
                                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                <span className='text-sm'>
                                    {key} ({items.length})
                                </span>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <div className="flex flex-col gap-3 p-4 pt-0">
                                    {items.map((habit) => (
                                        <HabitCard
                                            key={habit.id}
                                            habit={habit}
                                            checkin={statusMap[habit.id].checkin}
                                            groupBy={groupBy}
                                            onClick={() => onHabitClick(habit)}
                                        />
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))
                ) : (
                    habits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            checkin={statusMap[habit.id].checkin}
                            groupBy={groupBy}
                            onClick={() => onHabitClick(habit)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}


const Kanban = ({ groupedHabits, groupBy, statusMap, onHabitClick }) => {

    const getColumnStyle = (key, index) => {
        if (groupBy === 'priority') {
            const priorityConfig = {
                High: { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-500' },
                Medium: { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-yellow-500' },
                Low: { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-green-500' },
            };
            return priorityConfig[key] || { icon: <MoreHorizontal className="h-4 w-4" />, color: 'bg-gray-500' };
        }
        if (groupBy === 'category') {
            const colors = ['bg-cyan-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'];
            return {
                icon: <FolderOpen className="h-4 w-4" />,
                color: colors[index % colors.length],
            };
        }
        return { icon: <LayoutGrid className="h-4 w-4" />, color: 'bg-gray-500' };
    };

    return (
        <div className="flex gap-4 pb-4 w-max">
            {groupedHabits.map(([key, items], idx) => {
                const { icon, color } = getColumnStyle(key, idx);
                return (
                    <div className="flex flex-col w-md shrink-0 bg-gray-50 rounded-xl border border-gray-200 h-[35vw]">
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${color || 'bg-gray-100'} border-b border-gray-200`}>
                            {icon && <span className="text-white">{icon}</span>}
                            <h3 className="font-semibold text-gray-800 truncate">{key}</h3>
                            <span className="ml-auto text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600">
                                {items.length}
                            </span>
                        </div>

                        <div className="flex-1 p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-8">No habits</div>
                            ) : (
                                items.map((habit) =>
                                    <HabitCard
                                        key={habit.id}
                                        habit={habit}
                                        checkin={statusMap[habit.id].checkin}
                                        groupBy={groupBy}
                                        onClick={() => onHabitClick(habit)}
                                    />)
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

