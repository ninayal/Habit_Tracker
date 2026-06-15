import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { celebrate, celebrateBig } from "@/components/HabitList/Confetti";

export default function GoalAlertDialog({ alertData, onClose, onArchive }) {
    if (!alertData) return null;

    const isAchieved = alertData.type === "ACHIEVED";

    if (alertData.type == "ENCOURAGEMENT") {
        celebrate();
    }
    else if (alertData.type == "ACHIEVED") {
        celebrateBig();
    }

    return (
        <AlertDialog open={!!alertData} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="">
                <AlertDialogHeader className="flex flex-col items-center !text-center">
                    <AlertDialogTitle className="w-full text-center text-2xl font-bold">
                        <div className="mb-2 animate-bounce text-6xl mt-8">
                            {isAchieved ? "🏆" : "🔥"}
                        </div>
                        {isAchieved ? "Goal Achieved!" : "Almost There!"}
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-center text-sm pt-2">
                        {isAchieved ? (
                            <>
                                Amazing! You have successfully completed your goal for
                                <span className="font-bold text-pink-500"> {alertData.habitName}</span>.
                                Do you want to Archive this habit?
                            </>
                        ) : (
                            <>
                                You are <span className="font-bold">{alertData.percentage}%</span> done with
                                <span className="font-bold text-pink-500"> {alertData.habitName}</span>.
                                Keep going!
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="brand-card">
                    {isAchieved ? (
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <AlertDialogCancel
                                onClick={onClose}
                                variant="outline"
                                className="w-full font-bold py-5 hover:bg-pink-50"
                            >
                                Keep Active
                            </AlertDialogCancel>

                            <AlertDialogAction
                                variant="outline"
                                onClick={() => {
                                    onArchive?.(alertData.goal.habitId);
                                    onClose();
                                }}
                                className="bg-pink-400 hover:bg-pink-500 w-full font-bold py-5 m-0"
                            >
                                Archive Habit
                            </AlertDialogAction>
                        </div>
                    ) : (
                        <AlertDialogAction
                            variant="outline"
                            onClick={onClose}
                            className="bg-pink-400 hover:bg-pink-500 w-full font-bold py-5 m-0"
                        >
                            Got it!
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}