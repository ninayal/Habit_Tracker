import { useCheckinContext } from "@/hooks/useCheckins";
import { useHabitContext } from "@/hooks/useHabits";
import { authService } from "@/services/auth";
import { habitService } from "@/services/habits";
import { useMemo } from "react";
import { format } from "date-fns";
import { isScheduledDay, isValidDate } from "@/utils/statsHelper";

export function useHabitsQuery(query = {}) {
    // const { currentUser } = useAuth();
    const currentUser = authService.getCurrentUser();

    const { allHabits, loading, error, } = useHabitContext();
    const { checkins, loading: checkinsLoading } = useCheckinContext();

    const habits = useMemo(() => {
        if (!currentUser?.id || !allHabits) {
            return [];
        }

        return habitService.queryHabits(
            currentUser.id,
            query
        );
    }, [currentUser?.id, query, allHabits]);

    const todaysHabits = useMemo(() => {
        const today = new Date();

        return habits
            .filter(habit => {
                if (habit.status === "Archived" || habit.status === "Paused") return false;
                if (!isValidDate(habit, today)) return false;
                return isScheduledDay(habit, today);
            })
            .map(habit => ({
                ...habit,
                isScheduledDay: true
            }));
    }, [habits]);

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const statusMap = useMemo(() => {
        const cMap = {};
        checkins.forEach(c => {
            cMap[`${c.habitId}-${c.date}`] = c;
        });

        const sMap = {};
        todaysHabits.forEach(habit => {
            sMap[habit.id] = { checkin: cMap[`${habit.id}-${todayStr}`] };
        });
        return sMap;
    }, [todaysHabits, checkins, todayStr]);

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


    return {
        habits,
        todaysHabits,
        statusMap,
        todayProgress,
        loading: loading || checkinsLoading,
        error,
    };
}