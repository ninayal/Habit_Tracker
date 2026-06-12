import { authService } from "@/services/auth";
import { habitService } from "@/services/habits";

import { useEffect, useState } from "react";

export function useHabits(query = {}) {
    // const { currentUser } = useAuth();
    const currentUser = authService.getCurrentUser();

    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    

    const loadHabits = () => {
        if (!currentUser?.id) return;

        try {
            setLoading(true);
            setError(null);

            const data = habitService.queryHabits(
                currentUser.id,
                query
            );
            
            setHabits(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        
        const fetchHabits = () => {
            if (!currentUser?.id) return;
            
            try {
                setLoading(true);
                setError(null);
                
                const data = habitService.queryHabits(
                    currentUser.id,
                    query
                );
                setHabits(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHabits();
    }, [currentUser?.id, JSON.stringify(query)]);
    

    return {
        habits,
        loading,
        error,
        reload: loadHabits
    };
}