import { useHabitContext } from "@/hooks/useHabits";
import { authService } from "@/services/auth";
import { habitService } from "@/services/habits";
import { useMemo } from "react";

export function useHabitsQuery(query = {}) {
    // const { currentUser } = useAuth();
    const currentUser = authService.getCurrentUser();

    const { allHabits, loading, error, } = useHabitContext();

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
                return habitService.isScheduledDay(habit, today);
            })
            .map(habit => ({
                ...habit,
                isScheduledDay: true
            }));
    }, [habits]);


    return {
        habits,
        todaysHabits,
        loading,
        error,
    };
}