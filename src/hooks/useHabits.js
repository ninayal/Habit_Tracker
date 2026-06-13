import { HabitContext } from "@/context/HabitContext";
import { useContext } from "react";


export const useHabitContext = () => {
    const context = useContext(HabitContext);

    if (!context) {
        throw new Error(
            "useHabitContext must be used inside HabitProvider"
        );
    }

    return context;
};