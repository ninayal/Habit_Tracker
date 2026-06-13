import { authService } from "@/services/auth";
import { habitService } from "@/services/habits";
import { createContext, useCallback, useEffect, useState } from "react";

const HabitContext = createContext(null);

export function HabitProvider({ children }) {
    // const { currentUser } = useAuth();
    const currentUser = authService.getCurrentUser();

    const [allHabits, setAllHabits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadHabits = useCallback(() => {
        if (!currentUser?.id) return;

        try {
            setLoading(true);
            const data = habitService.getByUserId();
            setAllHabits(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id]);

    const createHabit = (data) => {
        const created = habitService.createHabit(data);
        setAllHabits(prev => [...prev, created]);
        return created;
    };

    const updateHabit = (id, updates) => {
        const updated = habitService.updateHabit(id, updates);
        setAllHabits(prev => prev.map(h =>
            h.id === id ? updated : h
        ));
        return updated;
    };

    const archiveHabit = (id) => {
        const updated = habitService.updateHabit(id, {
            status: "Archived",
        });
        setAllHabits(prev => prev.map(h =>
            h.id === id ? updated : h
        )
        );
    };

    const pauseHabit = (id) => {
        const updated = habitService.updateHabit(id, {
            status: "Paused",
        });
        setAllHabits(prev => prev.map(h =>
            h.id === id ? updated : h
        )
        );
    };

    const deleteHabit = (id) => {
        habitService.deleteHabit(id);

        setAllHabits(prev => prev.filter(h => h.id !== id));
    };

    useEffect(() => {
        loadHabits();
    }, [loadHabits]);

    return (
        <HabitContext.Provider
            value={{
                allHabits,
                loading,
                error,

                loadHabits,
                createHabit,
                updateHabit,
                archiveHabit,
                pauseHabit,
                deleteHabit
            }}
        >
            {children}
        </HabitContext.Provider>
    );
}

export { HabitContext }