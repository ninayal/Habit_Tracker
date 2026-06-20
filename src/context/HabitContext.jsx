import { authService } from "@/services/auth";
import { habitService } from "@/services/habits";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

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
        try {
            const created = habitService.createHabit(data);
            setAllHabits(prev => [...prev, created]);
            return created;
        } catch (error) {
            console.error("Create habit error:", error);
            toast.error(error.message);
            throw error;
        }
    };

    const updateHabit = (id, updates) => {
        try {
            const updated = habitService.updateHabit(id, updates);
            setAllHabits(prev => prev.map(h =>
                h.id === id ? updated : h
            ));
            return updated;
        } catch (error) {
            console.error("Update habit error:", error);
            toast.error(error.message);
            throw error;
        }
    };

    const archiveHabit = (id) => {
        try {
            const updated = habitService.updateHabit(id, { status: "Archived" });
            setAllHabits(prev => prev.map(h => h.id === id ? updated : h));
        } catch (error) {
            console.error("Archive habit error:", error);
        }
    };

    const pauseHabit = (id) => {
        try {
            const updated = habitService.updateHabit(id, { status: "Paused" });
            setAllHabits(prev => prev.map(h => h.id === id ? updated : h));
        } catch (error) {
            console.error("Pause habit error:", error);
        }
    };

    const deleteHabit = (id) => {
        try {
            habitService.deleteHabit(id);
            setAllHabits(prev => prev.filter(h => h.id !== id));
        } catch (error) {
            console.error("Delete habit error:", error);
            toast.error(error.message);
        }
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