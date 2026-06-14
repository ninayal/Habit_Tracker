import { useCheckinContext } from '@/hooks/useCheckins';
import { authService } from '@/services/auth';
import { checkinService } from '@/services/checkin';
import { habitService } from '@/services/habits';
import { formatDate } from '@/utils/helper';
import React, { useMemo } from 'react'

export default function useHabitStats(habit) {
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id;

    const { checkins } = useCheckinContext();


    const calculate = useMemo(() => {
        if (!habit || !userId) {
            return {
                stats: {
                    currentStreak: 0,
                    longestStreak: 0,
                    totalCompletions: 0,
                    completionRate: 0,
                    previousCompletionRate: 0,
                    rateTrend: 0 
                },
                habitCheckins: []
            };
        }

        const habitCheckins = checkins.filter(c => c.habitId === habit.id);
        const completedCheckins = habitCheckins.filter(c => c.completionStatus === "completed");

        const currentStreak = checkinService.calculateCurrentStreak(habit.id, userId);
        const longestStreak = checkinService.calculateLongestStreakByIteratingDays(habit.id, userId);
        const totalCompletions = completedCheckins.length;

        let completionsLast7Days = 0;
        let requiredLast7Days = 0;
        
        let completionsPrevious7Days = 0;
        let requiredPrevious7Days = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkinMap = new Map(habitCheckins.map(c => [c.date, c]));

        // Quét 14 ngày qua (0-6 là tuần này, 7-13 là tuần trước)
        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            if (habitService.isScheduledDay(habit, d)) {
                const dateStr = formatDate(d);
                const checkin = checkinMap.get(dateStr);
                const isCompleted = checkin && checkin.completionStatus === "completed";

                if (i < 7) {
                    requiredLast7Days++;
                    if (isCompleted) completionsLast7Days++;
                } else {
                    // tuần trước
                    requiredPrevious7Days++;
                    if (isCompleted) completionsPrevious7Days++;
                }
            }
        }

        const completionRate = requiredLast7Days === 0 ? 0 
            : Math.round((completionsLast7Days / requiredLast7Days) * 100);

        const previousCompletionRate = requiredPrevious7Days === 0  ? 0 
            : Math.round((completionsPrevious7Days / requiredPrevious7Days) * 100);
        const rateTrend = completionRate - previousCompletionRate;

        return {
            stats: {
                currentStreak,
                longestStreak,
                completionsLast7Days,
                totalCompletions,
                completionRate,
                previousCompletionRate,
                rateTrend
            },
            habitCheckins: habitCheckins.sort((a, b) => b.date.localeCompare(a.date))
        };

    }, [habit, userId, checkins]);

    return calculate;
}