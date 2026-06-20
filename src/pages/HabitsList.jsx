import { useCheckinContext } from '@/hooks/useCheckins';
import { useDebounce } from '@/hooks/useDebounce';
import { useHabitsQuery } from '@/hooks/useHabitsQuery';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useEffect, useMemo, useState } from 'react'
import { format } from "date-fns";
import { habitService } from '@/services/habits';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CalendarIcon, FolderOpen, LayoutGrid, MoreHorizontal, Plus, HelpCircle } from 'lucide-react';
import HabitCard from '@/components/HabitList/HabitCard';
import HabitDetail from '@/components/HabitList/HabitDetail';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import HabitsFilter from '@/components/HabitList/HabitsFilter';
import HabitForm from '@/components/HabitList/HabitForm';
import { useHabitContext } from '@/hooks/useHabits';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'react-toastify';
import List from '@/components/HabitList/List';
import { isScheduledDay, isValidDate } from '@/utils/statsHelper';
import { useHabitWalkthrough } from '@/hooks/useWalkthrough';
import { getWeekStartsOn } from '@/services/profile';

const DEFAULT_QUERY = {
    view: "list",
    search: "",
    status: "",
    category: "All",
    priority: "All",
    frequency: "all",
    groupBy: "priority",
    sortBy: "order",
};

export default function HabitsList() {
    const [query, setQuery] = useQueryParams(DEFAULT_QUERY);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const [openForm, setOpenForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deletingHabit, setDeletingHabit] = useState(null);

    const debouncedSearch = useDebounce(query.search, 300);
    const finalQuery = {
        ...query,
        search: debouncedSearch
    };
    const { habits: allHabits, loading } = useHabitsQuery(finalQuery);
    const { checkins, loadCheckins } = useCheckinContext();
    const { updateHabit, deleteHabit } = useHabitContext();
    const { startTour } = useHabitWalkthrough();

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
        let filteredHabits = allHabits ?? [];
        if (query.status !== "Archived") {
            filteredHabits = filteredHabits.filter(h => h.status !== "Archived");
        }
        filteredHabits = filteredHabits.filter(habit => isValidDate(habit, selectedDate));
        return filteredHabits.map(habit => ({
            ...habit,
            isScheduledDay: isScheduledDay(habit, selectedDate)
        }));
    }, [allHabits, query.status, selectedDate]);

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

    const handleEditHabit = (habit) => {
        setEditingHabit(habit);
        setOpenForm(true);
    };

    const handleChangeStatus = (habit, status) => {
        updateHabit(habit.id, {
            status,
        });
    };

    const handleDeleteHabit = (habit) => {
        setDeletingHabit(habit);
        setOpenDeleteDialog(true);
    };

    const confirmDeleteHabit = () => {
        if (!deletingHabit) return;

        deleteHabit(deletingHabit?.id);

        setOpenDeleteDialog(false);
        toast.success("Delete habit successfully!")

        setDeletingHabit(null);
    };

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
        <div className='brand-page min-h-screen p-4 md:p-8'>
            <div className='mx-auto w-full min-w-0'>
                <div className='flex items-center'>
                    <div className="flex items-center flex-1 gap-4">
                        <p className="font-instrument font-semibold text-4xl" >
                            All Habits
                        </p>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="tour-date-picker"
                                    variant="ghost"
                                    className="
                                        justify-start
                                        text-left
                                        font-normal
                                        brand-card
                                        hover:bg-[var(--brand-hover-bg)]
                                        data-[state=open]:bg-[var(--brand-card-bg)]
                                        data-[state=open]:hover:bg-[var(--brand-card-bg)]
                                        focus-visible:ring-0
                                        focus-visible:ring-offset-0
                                        shadow-none
                                        cursor-pointer
                                    "
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />

                                    {format(selectedDate, "yyyy-MM-dd")}
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
                                    // disabled={(date) => date > today}
                                    weekStartsOn={getWeekStartsOn() === "sunday" ? 0 : 1}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            id="tour-create-habit"
                            className='py-2 px-4 rounded-lg bg-pink-400 hover:bg-pink-500 text-white font-semibold text-[14px] flex items-center gap-3'
                            onClick={() => {
                                setEditingHabit(null);
                                setOpenForm(true);
                            }}
                        >
                            <Plus size={20} />
                            Create Habit
                        </button>
                        <button
                            onClick={startTour}
                            className="p-2 text-gray-400 hover:text-pink-500 rounded-full transition-colors focus:outline-none"
                            title="Replay Tutorial"
                        >
                            <HelpCircle size={22} />
                        </button>
                    </div>


                    <HabitForm
                        key={editingHabit?.id ?? "create"}
                        open={openForm}
                        setOpen={setOpenForm}
                        habit={editingHabit}
                    />

                </div>

                <div className='brand-card rounded-lg shadow-md mt-4 p-4 md:p-6 min-h-10/12 w-full min-w-0'>
                    <div id="tour-filters">
                        <HabitsFilter query={query} setQuery={setQuery} />
                    </div>


                    <div className="mt-4 w-full min-w-0 grid grid-cols-1" id="tour-habit-list">
                        {habits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="rounded-full bg-gray-100 p-4 mb-4">
                                    <FolderOpen className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold">
                                    No habits found
                                </h3>
                                <p className="text-sm text-muted-foreground m-2 max-w-md">
                                    {query.search || query.status || query.category !== "All" || query.priority !== "All"
                                        ? "No habits match your current filters." : "Create your first habit to start building better routines."}
                                </p>
                                {!query.search && query.category === "All" && query.priority === "All" && !query.status && (
                                    <button
                                        className='py-2 px-4 rounded-lg bg-pink-400 hover:bg-pink-500 text-white font-semibold text-[14px] flex items-center gap-3'
                                        onClick={() => {
                                            setEditingHabit(null);
                                            setOpenForm(true);
                                        }}
                                    >
                                        <Plus size={20} />
                                        Create Habit
                                    </button>
                                )}
                            </div>
                        ) : query.view === "list" ? (
                            <List
                                groupedHabits={groupedHabits}
                                habits={habits}
                                statusMap={statusMap}
                                groupBy={query.groupBy}
                                onHabitClick={handleOpenHabitDetail}
                                onEditHabit={handleEditHabit}
                                onChangeStatus={handleChangeStatus}
                                onDeleteHabit={handleDeleteHabit}
                                date={selectedDate}
                            />
                        ) : (
                            <div className="overflow-x-auto min-w-0 w-full">
                                <Kanban
                                    groupBy={query.groupBy}
                                    groupedHabits={groupedHabits}
                                    habits={habits}
                                    statusMap={statusMap}
                                    onHabitClick={handleOpenHabitDetail}
                                    onEditHabit={handleEditHabit}
                                    onChangeStatus={handleChangeStatus}
                                    onDeleteHabit={handleDeleteHabit}
                                    date={selectedDate}
                                />
                            </div>
                        )}

                        <HabitDetail
                            key={selectedHabit?.id}
                            open={openDrawer}
                            onOpenChange={setOpenDrawer}
                            habit={selectedHabit}
                            onEdit={handleEditHabit}
                            onChangeStatus={handleChangeStatus}
                            onDelete={handleDeleteHabit}
                        />
                    </div>
                </div>

                <AlertDialog
                    open={openDeleteDialog}
                    onOpenChange={setOpenDeleteDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className={`text-xl py-2`}>
                                Delete Habit
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                Confirm to delete "{deletingHabit?.name}" habit?
                                This action cannot be undone. This will permanently delete your habit and remove your checkins data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter className={`bg-white`}>
                            <AlertDialogCancel
                                variant="secondary"
                            >
                                Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                                onClick={confirmDeleteHabit}
                                variant='destructive'
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </div>
    )
}

const Kanban = ({
    groupedHabits, groupBy, statusMap, onHabitClick, date,
    onEditHabit, onChangeStatus, onDeleteHabit
}) => {

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
                    <div key={key} className="flex flex-col w-120 shrink-0 brand-card rounded-xl border border-gray-200 max-h-[calc(100vh-250px)]">
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${color || 'bg-gray-100'} border-b border-gray-200`}>
                            {icon && <span className="text-white">{icon}</span>}
                            <h3 className="font-semibold text-white truncate">{key}</h3>
                            <span className="ml-auto text-xs bg-white/30 px-2 py-0.5 rounded-full text-white">
                                {items.length}
                            </span>
                        </div>

                        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
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
                                        onEdit={onEditHabit}
                                        onChangeStatus={onChangeStatus}
                                        onDelete={onDeleteHabit}
                                        date={date}
                                    />)
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
