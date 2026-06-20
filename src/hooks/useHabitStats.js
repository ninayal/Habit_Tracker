import { useCheckinContext } from '@/hooks/useCheckins';
import { authService } from '@/services/auth';
import { formatDate } from '@/utils/helper';
import { calculateCurrentStreak, calculateGoalProgress, calculateLongestStreak, isScheduledDay } from '@/utils/statsHelper';
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
                    rateTrend: 0,
                    goalProgress: null
                },
                habitCheckins: []
            };
        }

        const habitCheckins = checkins.filter(c => c.habitId === habit.id);
        const completedCheckins = habitCheckins.filter(c => c.completionStatus === "completed");

        const currentStreak = calculateCurrentStreak(habit, habitCheckins);
        const longestStreak = calculateLongestStreak(habit, habitCheckins);
        const totalCompletions = completedCheckins.length;

        const goalProgress = habit.goal ? calculateGoalProgress(habit, habit.goal, habitCheckins) : null;

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

            if (isScheduledDay(habit, d)) {
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

        const previousCompletionRate = requiredPrevious7Days === 0 ? 0
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
                rateTrend,
                goalProgress
            },
            habitCheckins: [...habitCheckins].sort((a, b) => b.date.localeCompare(a.date))
        };

    }, [habit, userId, checkins]);

    return calculate;
}