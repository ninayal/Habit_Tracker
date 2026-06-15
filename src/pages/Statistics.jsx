import CategoryProgressChart from '@/components/Statistics/CategoryProgressChart';
import DoubleChartProgress from '@/components/Statistics/DoubleChartProgress';
import HabitStatsCard from '@/components/Statistics/HabitStatsCard';
import { useCheckinContext } from '@/hooks/useCheckins';
import { useHabitContext } from '@/hooks/useHabits';
import { calculateGoalProgress } from '@/utils/statsHelper';
import React, { useMemo } from 'react'

export default function Statistics() {
    const { allHabits, loading } = useHabitContext();
    const { checkins } = useCheckinContext();

    const activeHabits = useMemo(() => {
        const habits = allHabits?.filter(h => h.status !== "Archived") || [];

        return habits.sort((a, b) => {
            const goalA = a.goal;
            const goalB = b.goal;
            const getProgress = (habit, goal) => {
                if (!goal) return -1;
                const habitCheckins = checkins.filter(c => c.habitId === habit.id);
                const progress = calculateGoalProgress(habit, goal, habitCheckins);
                return progress ? progress.percentage : 0;
            };

            const progressA = getProgress(a, goalA);
            const progressB = getProgress(b, goalB);
            return progressB - progressA;
        });
    }, [allHabits, checkins]);

    if (loading) return <div className="p-8 text-center">Loading statistics...</div>;

    return (
        <div className='brand-page min-h-screen p-4 md:p-8 space-y-7'>
            <div>
                <div className="animate-fade-in">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                        Statistics
                    </h1>
                    <p className="text-sm text-muted/120 mt-0.5">
                        Deep insights from your habit data.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animate-delay-100">
                <CategoryProgressChart habits={allHabits} checkins={checkins} />
                
                <DoubleChartProgress habits={allHabits} checkins={checkins} />
            </div>

            <div className="flex flex-col gap-2 animate-fade-in animate-delay-200">
                <div className="text-base pb-2 font-medium pl-1">All habits</div>

                {activeHabits.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                        No active habits found to display statistics.
                    </div>
                ) : (
                    activeHabits.map(habit => (
                        <HabitStatsCard key={habit.id} habit={habit} />
                    ))
                )}
            </div>

        </div>
    )
}

