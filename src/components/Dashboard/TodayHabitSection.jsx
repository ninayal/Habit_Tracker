import { useCheckinContext } from '@/hooks/useCheckins';
import { useHabitContext } from '@/hooks/useHabits';
import { useHabitsQuery } from '@/hooks/useHabitsQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { format } from "date-fns";
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'react-toastify';
import HabitCard from '@/components/HabitList/HabitCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import HabitDetail from '@/components/HabitList/HabitDetail';
import HabitForm from '@/components/HabitList/HabitForm';
import TodayProgressRing from '@/components/Dashboard/TodayProgressRing';
import { celebrateBig } from '@/components/HabitList/Confetti';

export default function TodayHabitSection() {
    const { todaysHabits, loading } = useHabitsQuery();
    const { checkins, loadCheckins, loading: loadingCheckins } = useCheckinContext();
    const { updateHabit, deleteHabit } = useHabitContext();

    const [selectedHabit, setSelectedHabit] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const [openForm, setOpenForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deletingHabit, setDeletingHabit] = useState(null);

    const todayStr = format(new Date(), "yyyy-MM-dd");

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
        todaysHabits.forEach(habit => {
            map[habit.id] = { checkin: checkinMap[`${habit.id}-${todayStr}`] };
        });
        return map;
    }, [todaysHabits, checkinMap, todayStr]);

    const todayProgress = useMemo(() => {
        if (!todaysHabits || todaysHabits.length === 0) return 0;

        let completedCount = 0;
        todaysHabits.forEach(habit => {
            const checkin = statusMap[habit.id]?.checkin;
            if (checkin && checkin.completionStatus === "completed") {
                completedCount++;
            }
        });

        return Math.round((completedCount / todaysHabits.length) * 100);
    }, [todaysHabits, statusMap]);

    const prevProgressRef = useRef(todayProgress);
    const isReadyToCelebrate = useRef(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            isReadyToCelebrate.current = true;
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isReadyToCelebrate.current && todayProgress === 100 && prevProgressRef.current < 100) {
            celebrateBig();
        }
        prevProgressRef.current = todayProgress;
    }, [todayProgress]);

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

    if (loading || loadingCheckins) {
        return (
            <div className="flex items-center justify-center min-h-screen text-blue-500">
                <Spinner className="size-15" />
            </div>
        );
    }

    return (
        <div className='brand-card rounded-lg shadow-md mt-4 p-4 md:p-6 min-h-10/12'>
            <div className='flex items-center justify-between'>
                <div>
                    <span className='text-sm text-[#b94d8e]'>Daily check-ins</span>
                    <p className='text-xl font-medium'>Today’s habits</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <TodayProgressRing value={todayProgress} size={52} stroke={6} />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                            {todayProgress}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full pb-4 mt-6">
                <div className="flex flex-col gap-3">
                    {todaysHabits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            checkin={statusMap[habit.id].checkin}
                            onClick={() => handleOpenHabitDetail(habit)}

                            onEdit={handleEditHabit}
                            onChangeStatus={handleChangeStatus}
                            onDelete={handleDeleteHabit}
                        />
                    ))}
                </div>
            </div>

            <HabitForm
                key={editingHabit?.id ?? "create"}
                open={openForm}
                setOpen={setOpenForm}
                habit={editingHabit}
            />

            <HabitDetail
                open={openDrawer}
                onOpenChange={setOpenDrawer}
                habit={selectedHabit}

                onEdit={handleEditHabit}
                onChangeStatus={handleChangeStatus}
                onDelete={handleDeleteHabit}
            />


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
    )
}
