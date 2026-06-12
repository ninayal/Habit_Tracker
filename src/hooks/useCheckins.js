import { CheckinContext } from "@/context/CheckinContext";
import { useContext } from "react";

export function useCheckinContext() {
    const context = useContext(CheckinContext);

    if (!context) {
        throw new Error(
            "useCheckinContext must be used inside CheckinProvider"
        );
    }

    return context;
}