import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { isScheduledDay, isValidDate } from '@/utils/statsHelper';
import { formatDate } from '@/utils/helper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from 'lucide-react';


const CATEGORY_COLORS = {
    Health: "var(--brand-pink)",
    Study: "var(--brand-blue)",
    Work: "var(--brand-green)",
    Mindfulness: "var(--brand-yellow)",
    Other: "#e5e7eb"
};

function useCategoryProgress(habits, checkins, timeRange) {
    return useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let globalStartDate = null;
        if (timeRange === "7d") {
            globalStartDate = new Date(today);
            globalStartDate.setDate(today.getDate() - 6);
        } else if (timeRange === "30d") {
            globalStartDate = new Date(today);
            globalStartDate.setDate(today.getDate() - 29);
        }
        // timeRange === "all", globalStartDate giữ nguyên là null

        const categoryStats = {};
        const checkinMap = new Map(checkins.map(c => [`${c.habitId}-${c.date}`, c]));

        habits.forEach(habit => {
            if (habit.status === "Archived") return;
            const cat = habit.category || "Other";
            if (!categoryStats[cat]) {
                categoryStats[cat] = { category: cat, scheduled: 0, completed: 0 };
            }

            const habitStart = new Date(habit.startDate);
            habitStart.setHours(0, 0, 0, 0);
            let loopStart = new Date(habitStart);
            if (globalStartDate && globalStartDate > loopStart) {
                loopStart = new Date(globalStartDate);
            }

            let currentDate = new Date(loopStart);
            while (currentDate <= today) {
                if (isValidDate(habit, currentDate) && isScheduledDay(habit, currentDate)) {
                    categoryStats[cat].scheduled += 1;

                    const dateStr = formatDate(currentDate);
                    const checkin = checkinMap.get(`${habit.id}-${dateStr}`);
                    if (checkin && checkin.completionStatus === "completed") {
                        categoryStats[cat].completed += 1;
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        return Object.values(categoryStats)
            .filter(stat => stat.scheduled > 0)
            .map(stat => ({
                category: stat.category,
                rate: Math.round((stat.completed / stat.scheduled) * 100),
                completed: stat.completed,
                scheduled: stat.scheduled,
                fill: CATEGORY_COLORS[stat.category] || CATEGORY_COLORS.Other
            }))
            .sort((a, b) => b.rate - a.rate);

    }, [habits, checkins, timeRange]);
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100 text-sm">
                <p className="font-semibold text-gray-800 mb-1">{data.category}</p>
                <p className="text-gray-600">Completion Rate: <span className="font-bold text-gray-900">{data.rate}%</span></p>
                <p className="text-gray-500 text-xs mt-1">
                    {data.completed} / {data.scheduled} sessions completed
                </p>
            </div>
        );
    }
    return null;
};

export default function CategoryProgressChart({ habits, checkins }) {
    const [timeRange, setTimeRange] = useState("7d");

    const data = useCategoryProgress(habits, checkins, timeRange);
    const hasSchedules = data && data.length > 0;
    const hasAnyCompletion = hasSchedules && data.some(d => d.rate > 0);

    return (
        <div className="bg-white/80 p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between  mb-6">
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">Progress by Category</h3>
                    <p className="text-sm text-gray-500">Compare your consistency across different areas</p>
                </div>

                <div className="w-36 shrink-0">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="h-9 text-sm text-gray-600 focus:ring-pink focus-visible:ring-pink focus-visible:border-pink shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={``}>
                            <SelectItem className={`px-3 `} value="7d">Last 7 Days</SelectItem>
                            <SelectItem className={`px-3`} value="30d">Last 30 Days</SelectItem>
                            {/* <SelectItem value="all">All Time</SelectItem> */}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!hasSchedules ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <span className="text-gray-400 text-xl">
                            <CalendarDays/>
                        </span>
                    </div>
                    <p className="text-gray-600 font-medium">No active schedules</p>
                    <p className="text-gray-400 text-sm mt-1">There are no habits scheduled for this period.</p>
                </div>
            ) : (
                <div className="h-64 w-full relative">
                    {!hasAnyCompletion && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 opacity-60">
                            <p className="text-gray-500 font-medium">No completions yet</p>
                            <p className="text-gray-400 text-xs mt-1">Start checking off your habits!</p>
                        </div>
                    )}

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} wrapperStyle={{ zIndex: 50 }} />
                            <Bar
                                dataKey="rate"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={60}
                                animationDuration={800}
                                minPointSize={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}