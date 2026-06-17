import { useEffect, useMemo, useRef } from 'react';
import { isScheduledDay, isValidDate } from '@/utils/statsHelper';
import { formatDate } from '@/utils/helper';
import { getOrderedWeekdayLabels, getStartOfWeek } from '@/utils/date';
import { getWeekStartsOn } from '@/services/profile';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export default function HeatmapChart({ habits, checkins }) {
    const scrollRef = useRef(null);
    const weekStartsOn = getWeekStartsOn();

    const heatmapData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = getStartOfWeek(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 364), weekStartsOn);

        const data = [];
        const checkinMap = new Map(checkins.map(c => [`${c.habitId}-${c.date}`, c]));
        const activeHabits = habits?.filter(h => h.status !== "Archived") || [];

        let currentDate = new Date(startDate);

        while (currentDate <= today) {
            const dateStr = formatDate(currentDate);
            let required = 0;
            let completed = 0;
            activeHabits.forEach(habit => {
                if (isValidDate(habit, currentDate) && isScheduledDay(habit, currentDate) && habit.status != "Paused") {
                    required++;
                    const checkin = checkinMap.get(`${habit.id}-${dateStr}`);
                    if (checkin && checkin.completionStatus === 'completed') {
                        completed++;
                    }
                }
            });

            let level = 0;
            let rate = 0;
            if (required > 0) {
                rate = Math.round((completed / required) * 100);
                if (rate === 100) level = 4;
                else if (rate >= 66) level = 3;
                else if (rate >= 33) level = 2;
                else if (rate > 0) level = 1;
            }

            data.push({
                date: dateStr,
                dateObj: new Date(currentDate),
                required,
                completed,
                rate,
                level
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return data;
    }, [habits, checkins, weekStartsOn]);

    const getLevelColor = (level) => {
        switch (level) {
            case 4: return "bg-green-500"; // 100%
            case 3: return "bg-green-400"; // 66% - 99%
            case 2: return "bg-green-300"; // 33% - 65%
            case 1: return "bg-green-100"; // 1% - 32%
            default: return "bg-gray-100"; // 0% hoặc không có lịch
        }
    };
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [heatmapData]);

    const monthLabels = useMemo(() => {
        const labels = [];
        let lastMonth = -1;

        //cộng 7 qua 1 tuần
        for (let i = 0; i < heatmapData.length; i += 7) {
            const currentMonth = heatmapData[i].dateObj.getMonth();
            if (currentMonth !== lastMonth) {
                labels.push(months[currentMonth]);
                lastMonth = currentMonth;
            } else {
                labels.push("");
            }
        }
        return labels;
    }, [heatmapData]);

    return (
        <div className="bg-white/80 p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full min-w-0">
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800">All-Time Activity</h3>
                <p className="text-sm text-gray-500">Last 365 days of your habit consistency</p>
            </div>

            <TooltipProvider delayDuration={100}>
                <div className="flex gap-2">
                    <div className="flex flex-col pr-2 text-right">
                        <div className="h-4 mb-2"></div>

                        <div className="grid grid-rows-7 gap-1.5 text-[10px] sm:text-xs font-semimedium">
                            {getOrderedWeekdayLabels(weekStartsOn).map((label, index) => (
                                <div
                                    key={label}
                                    className={`h-3.5 sm:h-4 items-center justify-end text-slate-600 ${
                                        index % 2 === 0 ? "flex" : "hidden sm:flex"
                                    }`}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phần cuộn */}
                    <div ref={scrollRef} className="flex-1 overflow-x-auto no-scrollbar pb-2">
                        <div className="w-max flex flex-col">
                            <div className="grid grid-flow-col gap-1.5 mb-2 text-[10px] sm:text-xs font-semimedium">
                                {monthLabels.map((label, i) => (
                                    <div key={`month-${i}`} className="w-3.5 sm:w-4 relative h-4">
                                        {label && <span className="absolute bottom-0 left-0 text-slate-600 ">{label}</span>}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                                {heatmapData.map((day) => (
                                    <Tooltip key={day.date}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm cursor-pointer transition-colors duration-200 hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 ${getLevelColor(day.level)}`}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent className="flex flex-col text-center text-xs text-(--brand-muted-text) bg-accent border-none shadow-sm z-60  px-3 py-2 rounded-lg">
                                            <p className="font-semibold">{day.date}</p>
                                            {day.required === 0 ? (
                                                <p className="text-xs">No habits scheduled</p>
                                            ) : (
                                                <div>
                                                    <p className="text-xs">Completed: {day.completed} / {day.required}</p>
                                                    <p className="text-xs font-bold">Rate: {day.rate}%</p>
                                                </div>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </TooltipProvider>

            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className={`w-3 h-3 rounded-sm ${getLevelColor(0)}`}></div>
                    <div className={`w-3 h-3 rounded-sm ${getLevelColor(1)}`}></div>
                    <div className={`w-3 h-3 rounded-sm ${getLevelColor(2)}`}></div>
                    <div className={`w-3 h-3 rounded-sm ${getLevelColor(3)}`}></div>
                    <div className={`w-3 h-3 rounded-sm ${getLevelColor(4)}`}></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
