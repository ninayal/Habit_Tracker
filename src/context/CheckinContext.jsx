import { authService } from "@/services/auth";
import { checkinService } from "@/services/checkin";
import { formatDate } from "@/utils/helper";
import { createContext, useContext, useState, useCallback } from "react";

const CheckinContext = createContext(null);

export function CheckinProvider({ children }) {
    // const { currentUser } = useAuth();
    const currentUser = authService.getCurrentUser();

    const [checkins, setCheckins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadCheckins = useCallback(() => {
            if (!currentUser?.id) return;
            const userId = currentUser?.id;

            setLoading(false);
            setError(null);

            try {
                setLoading(true);
                const data = checkinService.getCheckinsByUser(userId);
                setCheckins(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [currentUser?.id]
    );

    const updateCheckin = (habitId, date, updates) => {
        const updated = checkinService.updateCheckin(
            habitId, currentUser.id, date,
            updates
        );
        setCheckins(prev => {
            const index = prev.findIndex( c => c.habitId === habitId && c.date === date);

            if (index === -1) {
                return [...prev, updated];
            }

            const next = [...prev];
            next[index] = updated;
            return next;
        });

        return updated;
    };

    const resetCheckin = (habitId, date) => {
        if (!currentUser) return;
        const userId = currentUser.id;

        const success = checkinService.deleteCheckin(
            habitId, userId, date
        );
        if (!success) return false;

        setCheckins(prev => prev.filter(
                c => !(
                    c.habitId === habitId &&
                    c.userId === userId &&
                    c.date === (date || formatDate())
                )
            )
        );
        return true;
    };



    return (
        <CheckinContext.Provider
            value={{
                checkins,
                loading,
                error,
                loadCheckins,
                updateCheckin,
                resetCheckin,
                setCheckins
            }}
        >
            {children}
        </CheckinContext.Provider>
    );
}

export { CheckinContext }