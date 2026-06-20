import GoalAlertDialog from "@/components/GoalAlertDialog";
import { useHabitContext } from "@/hooks/useHabits";
import { authService } from "@/services/auth";
import { checkinService } from "@/services/checkin";
import { goalService } from "@/services/goals";
import { formatDate } from "@/utils/helper";
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const CheckinContext = createContext(null);

export function CheckinProvider({ children }) {
    // const { currentUser } = useAuth();
    const currentUser = authService.getCurrentUser();
    const { updateHabit } = useHabitContext();

    const [checkins, setCheckins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [alertData, setAlertData] = useState(null);

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
        const { checkin: updatedCheckin, goalEvent } = checkinService.updateCheckin(
            habitId, currentUser.id, date, updates
        );
        setCheckins(prev => {
            const index = prev.findIndex(c => c.habitId === habitId && c.date === date);
            if (index === -1) {
                return [...prev, updatedCheckin];
            }
            const next = [...prev];
            next[index] = updatedCheckin;
            return next;
        });

        if (goalEvent) {
            const currentPercentage = goalEvent.type === "ACHIEVED" ? 100 : (goalEvent.percentage || 0);
            const goals = goalService.getGoalsByHabit(habitId, currentUser.id);
            const activeGoal = goals[0];
            console.log(activeGoal, currentPercentage)
            if (activeGoal) {
                if (currentPercentage >= 100 && !activeGoal.isDone) {
                    goalService.markGoalDone(activeGoal.id);
                    setAlertData(goalEvent);
                }
                else if (currentPercentage >= 80 && currentPercentage < 100 && !activeGoal.is80PercentNotified) {
                    goalService.markGoal80Notified(activeGoal.id);
                    setAlertData(goalEvent);
                }
            }
        }

        return updatedCheckin;
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
        ));

        return true;
    };

    const handleChangeStatus = (habitId) => {
        const status = "Archived";
        updateHabit(habitId, {
            status,
        });
    };

    useEffect(() => {
        loadCheckins();
    }, [loadCheckins]);

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
            <GoalAlertDialog
                alertData={alertData}
                onClose={() => setAlertData(null)}
                onArchive={handleChangeStatus}
            />
        </CheckinContext.Provider>
    );
}

export { CheckinContext }