import CategoryProgressChart from '@/components/Statistics/CategoryProgressChart';
import DoubleChartProgress from '@/components/Statistics/DoubleChartProgress';
import HabitStatsCard from '@/components/Statistics/HabitStatsCard';
import { Spinner } from '@/components/ui/spinner';
import { useCheckinContext } from '@/hooks/useCheckins';
import { useHabitContext } from '@/hooks/useHabits';
import { calculateGoalProgress } from '@/utils/statsHelper';
import React, { useMemo, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Flame, Target, Trophy, Filter, ArrowUpDown } from 'lucide-react';
import HeatmapChart from '@/components/Statistics/HeatmapChart';

export default function Statistics() {
    const { allHabits, loading } = useHabitContext();
    const { checkins, loading: loadingCheckins } = useCheckinContext();

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState("desc");

    const categories = useMemo(() => {
        if (!allHabits) return ["All"];
        const activeHabits = allHabits.filter(h => h.status !== "Archived");
        const uniqueCategories = new Set(activeHabits.map(h => h.category));
        return ["All", ...Array.from(uniqueCategories)];
    }, [allHabits]);

    const activeHabits = useMemo(() => {
        let habits = allHabits?.filter(h => h.status !== "Archived") || [];

        if (selectedCategory !== "All") {
            habits = habits.filter(h => h.category === selectedCategory);
        }
        return habits.sort((a, b) => {
            const getProgress = (habit, goal) => {
                if (!goal) return -1;
                const habitCheckins = checkins.filter(c => c.habitId === habit.id);
                const progress = calculateGoalProgress(habit, goal, habitCheckins);
                return progress ? progress.percentage : 0;
            };

            const progressA = getProgress(a, a.goal);
            const progressB = getProgress(b, b.goal);

            if (sortOrder === "desc") {
                return progressB - progressA;
            } else {
                return progressA - progressB;
            }
        });
    }, [allHabits, checkins, selectedCategory, sortOrder]);

    if (loading || loadingCheckins)
        return (
            <div className="flex items-center justify-center min-h-screen text-blue-500">
                <Spinner className="size-15" />
            </div>
        );

    return (
        <div className='brand-page min-h-screen p-4 md:p-8 space-y-3'>
            <div className='mb-7'>
                <div className="animate-fade-in">
                    <h1 className="font-instrument text-4xl font-semibold tracking-tight">
                        Statistics
                    </h1>
                    <p className="text-sm text-muted/120 mt-0.5">
                        Gain deeper insights into your habit performance, consistency, and long-term progress.
                    </p>
                </div>
            </div>

            <div className="animate-fade-in animate-delay-100 overflow-x-auto grid grid-cols-1 mb-6">
                <HeatmapChart habits={allHabits} checkins={checkins} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animate-delay-100 mb-7">
                <CategoryProgressChart habits={allHabits} checkins={checkins} />

                <DoubleChartProgress habits={allHabits} checkins={checkins} />
            </div>

            <div className="flex flex-col gap-2 animate-fade-in animate-delay-200">
                <div className='flex items-center justify-between mb-3'>
                    <div className="text-base pb-2 font-medium pl-1">All habits</div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <span className='text-sm'>Progress:</span>
                                <SelectTrigger className="w-45 h-9 bg-transparent shadow-none ring-0 focus:ring-pink focus-visible:border-pink focus-visible:ring-0">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className={``}>
                                    <SelectItem className={`px-3`} value="desc">High to Low</SelectItem>
                                    <SelectItem className={`px-3`} value="asc">Low to High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-500 hidden sm:block" />
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-35 h-9 bg-transparent shadow-none ring-0 focus:ring-pink focus-visible:border-pink focus-visible:ring-0">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem className={`px-3`} key={cat} value={cat}>
                                            {cat === "All" ? "All Categories" : cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                    </div>
                </div>
            </div>

            {activeHabits.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                    No active habits found to display.
                </div>
            ) : (
                activeHabits.map(habit => (
                    <HabitStatsCard key={habit.id} habit={habit} />
                ))
            )}
        </div>


    )
}

