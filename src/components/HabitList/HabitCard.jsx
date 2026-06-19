import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Check,
    X,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    SkipForward,
    EllipsisVertical, PlusIcon
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useCheckinContext } from "@/hooks/useCheckins";
import { HabitCellDropdown } from "@/components/HabitList/HabitCellDropdown";
import { HabitCardDropdown } from "@/components/HabitList/HabitCardDropdown";
import { formatDate } from "@/utils/helper";
import { celebrate, celebrateBig } from "@/components/HabitList/Confetti";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HabitNoteDialog } from "@/components/HabitList/HabitNoteDialog";
import { useHabitsQuery } from "@/hooks/useHabitsQuery";
import { toast } from "react-toastify";


const checkinStyles = {
    completed: {
        card: "opacity-70 bg-green-50 border-green-200 border-l-4 border-l-green-500",
        title: "line-through text-muted-foreground",
        badge: (
            <Badge className="bg-green text-green-700 border-green-200">
                Done <CheckCircle2 className="h-4 w-4 text-green-500" />
            </Badge>
        ),
    },

    failed: {
        card: "bg-red-50 border-red-200 border-l-4 border-l-red-500",
        title: "text-red-900",
        badge: (
            <Badge className="bg-red-100 text-red-700 border-red-200">
                Missed <AlertTriangle className="h-4 w-4 text-red-500" />
            </Badge>
        ),
    },

    in_progress: {
        card: "border-l-4 border-l-blue bg-white",
        title: "",
        badge: null,
    },

    skipped: {
        card: "opacity-80 border-l-4 border-l-gray-400",
        title: "text-muted-foreground",
        badge: (
            <Badge variant="outline">
                Skipped <SkipForward className="h-4 w-4 text-gray-500" />
            </Badge>
        ),
    },

    missed_today: {
        card: "bg-yellow/40 border-yellow border-l-4 border-l-yellow-500",
        title: "text-yellow-900 font-semibold",
        badge: (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Not yet completed<AlertTriangle className="h-4 w-4 text-yellow-600" />
            </Badge>
        ),
    },
};

export default function HabitCard({
    habit, checkin, groupBy = "", onClick, date = new Date(),
    onEdit, onChangeStatus, onDelete
}) {
    const [openDropdown, setOpenDropdown] = useState(false);
    let completionStatus = checkin?.completionStatus || "not_checked";
    const currentCount = checkin?.completedCount || 0;
    const target = habit.targetPerDay;

    if (completionStatus === "completed" && currentCount < target) {
        completionStatus = currentCount === 0 ? "not_checked" : "in_progress";
    } 
    else if ((completionStatus === "in_progress" || completionStatus === "not_checked") &&
        currentCount >= target
    ) {
        completionStatus = "completed";
    }

    let style = checkinStyles[completionStatus] || checkinStyles.in_progress;
    const isMissedToday = habit.isScheduledDay && habit.status === "Active" &&
        (completionStatus === "in_progress" || completionStatus === "not_checked");

    if (isMissedToday) {
        style = checkinStyles.missed_today;
    }

    return (
        <Card
            onClick={onClick}
            className={` w-full transition-all duration-200 hover:shadow-lg
                ${style.card} cursor-pointer tour-habit-card-step
            `}

        >
            <CardContent className="px-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-lg shrink-0">
                            {habit.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <h3
                                    className={` font-semibold text-sm
                                        ${style.title}
                                    `}
                                >
                                    {habit.name}
                                </h3>

                                <span className="text-xs text-[var(--brand-muted-text)]">
                                    | {habit.status}
                                </span>

                                {style.badge}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {groupBy === "category" && (
                                    <Badge
                                        variant="outline"
                                        className={`text-[var(--brand-muted-text)]`}
                                    >
                                        {habit.priority}
                                    </Badge>
                                )}

                                {groupBy === "priority" && groupBy !== "" && (
                                    <Badge
                                        variant="outline"
                                        className={` text-[var(--brand-muted-text)] text-xs`}
                                    >
                                        {habit.category}
                                    </Badge>
                                )}

                                {habit.frequency?.repeatType &&
                                    <Badge
                                        variant="outline"
                                        className={` text-[var(--brand-muted-text)] text-xs`}
                                    >
                                        {habit.frequency?.repeatType === "daily" ? "Daily" : "Specific days"}
                                    </Badge>
                                }

                                <Badge
                                    variant="outline"
                                    className="text-xs"
                                >
                                    {habit.targetPerDay}
                                    {" "}
                                    {habit.targetPerDay === 1 ? "time" : "times"}/day
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {!habit.isScheduledDay && (
                            <Badge
                                variant="outline"
                                className="text-xs text-[var(--brand-muted-text)]"
                            >
                                Not required
                            </Badge>
                        )}

                        <div
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <HabitStatusCell
                                checkin={checkin}
                                habit={habit}
                                target={habit.targetPerDay}
                                dateString={formatDate(date)}
                                date={date}
                            />
                        </div>

                        <HabitCardDropdown
                            open={openDropdown}
                            setOpen={setOpenDropdown}
                            status={habit?.status}

                            onEdit={() => onEdit?.(habit)}
                            onChangeStatus={(status) =>
                                onChangeStatus?.(habit, status)
                            }
                            onDelete={() => onDelete?.(habit)}
                        >
                            <button
                                className="tour-habit-dropdown-btn p-1 rounded-md hover:bg-blue/40 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdown(true);
                                }}

                            >
                                <EllipsisVertical
                                    size={18}
                                />
                            </button>
                        </HabitCardDropdown>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


function HabitStatusCell({ checkin, target, habit, dateString, date }) {
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const { todayProgress, loading } = useHabitsQuery();

    const current = checkin ?? {
        completionStatus: "not_checked",
        completedCount: 0,
        note: ""
    };

    let displayStatus = current.completionStatus;
    const currentCount = current.completedCount || 0;
    if (displayStatus === "completed" && currentCount < target) {
        displayStatus = currentCount === 0 ? "not_checked" : "in_progress";
    } else if (
        (displayStatus === "in_progress" || displayStatus === "not_checked") &&
        currentCount >= target
    ) {
        displayStatus = "completed";
    }

    const selectedDate = checkin?.date || dateString;
    const { updateCheckin, resetCheckin } = useCheckinContext();

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(date);
    selectedDateObj.setHours(0, 0, 0, 0);
    const isFutureDate = selectedDateObj.getTime() > todayObj.getTime();

    const trackHistory = () => {
        setHistory(prev => {
            const newHistory = [...prev, { ...current }];
            return newHistory.slice(-10);
        });
    };

    const handleAction = (action, dateString, value) => {
        if (isFutureDate) return;

        switch (action) {
            case "update_progress": {
                const target = habit.targetPerDay;
                if (value < 0) {
                    toast.error("Progress cannot be less than 0");
                    return;
                }
                if (value > target) {
                    toast.error(`Progress cannot exceed target (${target})`);
                    return;
                }
                trackHistory();
                if (value === 0) {
                    resetCheckin(habit.id, dateString);
                } else {
                    if (value === target) {
                        celebrate();
                        if (habit.autoOpenNote) {
                            setTimeout(() => setIsNoteDialogOpen(true), 600);
                        }
                    }
                    updateCheckin(habit.id, dateString, {
                        completedCount: value,
                    });
                }
                return;
            }

            case "skipped":
                trackHistory();
                if (habit.autoOpenNote) {
                    setIsNoteDialogOpen(true)
                }
                updateCheckin(habit.id, dateString, {
                    completionStatus: "skipped",
                });
                return;

            case "failed":
                trackHistory();
                if (habit.autoOpenNote) {
                    setIsNoteDialogOpen(true)
                }
                updateCheckin(habit.id, dateString, {
                    completionStatus: "failed",
                });
                return;

            case "reset":
                trackHistory();
                resetCheckin(habit.id, dateString);
                return;

            case "decrease_progress": {
                trackHistory();
                const currentCount = current.completedCount ?? 0;
                if (currentCount <= 1) {
                    resetCheckin(habit.id, dateString);
                } else {
                    updateCheckin(habit.id, dateString, {
                        completedCount: currentCount - 1,
                    });
                }
                return;
            }

            case "undo": {
                if (history.length > 0) {
                    const newHistory = [...history];
                    const prevState = newHistory.pop();
                    setHistory(newHistory);

                    if (!prevState.completionStatus || prevState.completionStatus === "not_checked") {
                        resetCheckin(habit.id, dateString);
                    } else {
                        updateCheckin(habit.id, dateString, {
                            completionStatus: prevState.completionStatus,
                            completedCount: prevState.completedCount,
                            note: prevState.note || ""
                        });
                    }
                }
                return;
            }

            case "note": {
                setIsNoteDialogOpen(true);
            }
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (isFutureDate) return;

        trackHistory();
        if (displayStatus === "completed" || displayStatus === "failed" || displayStatus === "skipped") {
            resetCheckin(habit.id, selectedDate);
            return;
        }

        const nextCount = (current.completedCount ?? 0) + 1;
        if (nextCount === habit?.targetPerDay) {
            celebrate();
            if (habit.autoOpenNote) {
                setTimeout(() => setIsNoteDialogOpen(true), 600);
            }
        }
        updateCheckin(habit.id, selectedDate, {
            completedCount: nextCount,
        });
    };

    const prevProgressRef = useRef(todayProgress);
    const isReadyToCelebrate = useRef(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            isReadyToCelebrate.current = true;
        }, 500);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (isReadyToCelebrate.current && todayProgress === 100 && prevProgressRef.current < 100) {
            celebrateBig();
        }
        prevProgressRef.current = todayProgress;
    }, [todayProgress]);

    const handleSaveNote = (noteContent) => {
        updateCheckin(habit.id, selectedDate, {
            note: noteContent
        });
        toast.success("Saved note successfully!")
    };

    const disableStyles = isFutureDate ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90";
    const buttonElement = (() => {
        switch (displayStatus) {
            case "completed":
                return (
                    <button
                        disabled={isFutureDate}
                        onClick={handleClick}
                        className={`w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center transition-opacity ${disableStyles}`}
                    >
                        <Check size={18} />
                    </button>
                );

            case "failed":
                return (
                    <button
                        disabled={isFutureDate}
                        className={`w-8 h-8 rounded-full text-white bg-red-600 flex items-center justify-center transition-opacity ${disableStyles}`}
                        onClick={handleClick}
                    >
                        <X size={18} />
                    </button>
                );

            case "skipped":
                return (
                    <button
                        disabled={isFutureDate}
                        className={`w-8 h-8 rounded-full bg-accent flex items-center justify-center transition-opacity ${disableStyles}`}
                        onClick={handleClick}
                    >
                        <ArrowRight size={18} />
                    </button>
                );

            case "in_progress": {
                const percentage = Math.round(
                    (Number(current.completedCount) / Number(target)) * 100
                );

                return (
                    <button
                        disabled={isFutureDate}
                        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-opacity ${disableStyles}`}
                        style={{
                            background: `conic-gradient(
                                #3b82f6 ${percentage}%,
                                #e2e8f0 ${percentage}%
                            )`,
                        }}
                        onClick={handleClick}
                    >
                        <div className="absolute w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                            {current.completedCount}
                        </div>
                    </button>
                );
            }
            case "not_checked":
            default:
                return (
                    <button
                        disabled={isFutureDate}
                        className={`w-8 h-8 flex bg-accent items-center justify-center rounded-full transition-colors ${isFutureDate ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-blue-100"
                            }`}
                        onClick={handleClick}
                    >
                        <PlusIcon size={18} />
                    </button>
                );
        }
    })();

    let tooltipText = "Click to +1 time";
    if (displayStatus === "completed") {
        tooltipText = "Click to reset";
    } else if (displayStatus === "skipped" || displayStatus === "failed") {
        tooltipText = "Click to reset";
    }

    if (loading) {
        return;
    }

    if (habit.status === "Archived" || habit.status === "Paused") {
        return <div className="w-8 h-8"></div>;
    }

    return (
        <>
            <HabitCellDropdown
                dateString={selectedDate}
                status={displayStatus}
                progress={current.completedCount}
                onAction={handleAction}
                mode="quick"
                target={target}
                canUndo={history.length > 0}
            >
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="tour-habit-checkin-btn inline-block">
                                {buttonElement}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            className="text-xs w-35 text-[var(--brand-muted-text)] bg-accent border-none shadow-sm z-60"
                        >
                            {isFutureDate === true ? (
                                <p>Can not checkin on future date.</p>
                            ) : (
                                <p>{tooltipText} or Right click for more.</p>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </HabitCellDropdown>

            <HabitNoteDialog
                open={isNoteDialogOpen}
                onOpenChange={setIsNoteDialogOpen}
                habitName={habit.name}
                initialNote={current.note}
                onSave={handleSaveNote}
                dateStr={selectedDate}
            />
        </>
    );
}
