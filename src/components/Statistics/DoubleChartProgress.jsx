import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { isScheduledDay, isValidDate } from '@/utils/statsHelper';
import { formatDate } from '@/utils/helper';
import { getOrderedWeekdayLabels, getStartOfWeek } from '@/utils/date';
import { getWeekStartsOn } from '@/services/profile';
import { ChartArea } from 'lucide-react';

function useWeeklyComparison(habits, checkins) {
    const weekStartsOn = getWeekStartsOn();

    return useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStartThisWeek = getStartOfWeek(today, weekStartsOn);

        const checkinMap = new Map(checkins.map(c => [`${c.habitId}-${c.date}`, c]));

        const compareData = getOrderedWeekdayLabels(weekStartsOn).map((label, i) => {
            const dateThisWeek = new Date(weekStartThisWeek);
            dateThisWeek.setDate(weekStartThisWeek.getDate() + i);
            const dateLastWeek = new Date(dateThisWeek);
            dateLastWeek.setDate(dateThisWeek.getDate() - 7);

            let thisWeekCount = 0;
            let lastWeekCount = 0;

            habits.forEach(habit => {
                if (habit.status === "Archived") return;
                if (isValidDate(habit, dateThisWeek) && isScheduledDay(habit, dateThisWeek)) {
                    const checkin = checkinMap.get(`${habit.id}-${formatDate(dateThisWeek)}`);
                    if (checkin && checkin.completionStatus === 'completed') {
                        thisWeekCount++;
                    }
                }

                if (isValidDate(habit, dateLastWeek) && isScheduledDay(habit, dateLastWeek)) {
                    const checkin = checkinMap.get(`${habit.id}-${formatDate(dateLastWeek)}`);
                    if (checkin && checkin.completionStatus === 'completed') {
                        lastWeekCount++;
                    }
                }
            });

            return {
                label,
                "Last week": lastWeekCount,
                "This week": thisWeekCount
            };
        });

        return compareData;
    }, [habits, checkins, weekStartsOn]);
}

export default function DoubleChartProgress({ habits, checkins }) {
    const compareData = useWeeklyComparison(habits, checkins);
    const hasData = compareData.some(d => d["This week"] > 0 || d["Last week"] > 0);

    return (
        <div className="bg-white/80 p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-800">This Week vs Last Week</h3>
                <p className="text-sm text-gray-500">Daily completions comparison</p>
            </div>

            <div className="flex-1 w-full min-h-[240px] flex flex-col justify-center">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={compareData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 12, fill: "#6b7280" }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#6b7280" }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                label={{
                                    value: "Completed Habits",
                                    offset: 20,
                                    angle: -90,
                                    position: "insideLeft",
                                    style: {
                                        textAnchor: "middle",
                                        fill: "#6b7280",
                                        fontSize: 12,
                                    },
                                }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: 12, color: "#4b5563", paddingTop: "16px" }}
                                iconType="circle"
                                iconSize={8}
                            />
                            <Bar dataKey="Last week" fill="#a1a1aa" radius={[4, 4, 0, 0]} maxBarSize={40} minPointSize={2} />
                            <Bar dataKey="This week" fill="#f472b6" radius={[4, 4, 0, 0]} maxBarSize={40} minPointSize={2} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <span className="text-gray-400 text-xl">
                                <ChartArea/>
                            </span>
                        </div>
                        <p className="text-gray-600 font-medium">No completions yet</p>
                        <p className="text-gray-400 text-sm mt-1">Complete some habits to see your comparison chart.</p>
                    </div>
                )}
            </div>
        </div>
    );
}