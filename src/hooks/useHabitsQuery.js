import { useHabitContext } from "@/hooks/useHabits";
import { authService } from "@/services/auth";
import { habitService } from "@/services/habits";
import { useMemo } from "react";

export function useHabitsQuery(query = {}) {
    // const { currentUser } = useAuth();
    const currentUser = authService.getCurrentUser();
    
    const { allHabits, loading, error, } = useHabitContext();

    const habits = useMemo(() => {
        if (!currentUser?.id) {
            return [];
        }

        return habitService.queryHabits(
            currentUser.id,
            query
        );
    }, [currentUser?.id, query]);


    return {
        habits,
        loading,
        error,
    };
}