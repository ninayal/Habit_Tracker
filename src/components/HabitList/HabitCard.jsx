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
import React, { useState } from "react";
import { useCheckinContext } from "@/hooks/useCheckins";
import { HabitCellDropdown } from "@/components/HabitList/HabitCellDropdown";
import { HabitCardDropdown } from "@/components/HabitList/HabitCardDropdown";
import { formatDate } from "@/utils/helper";

const priorityColor = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
};
const statusColor = {
    Active: "bg-green-100 text-green-800",
    Paused: "bg-gray-100 text-gray-800",
    Completed: "bg-blue-100 text-blue-800",
};
const colors = ["bg-cyan-100", "bg-purple-100", "bg-indigo-100", "bg-pink-200", "bg-orange-100"];
const categories = ["Health", "Study", "Work", "Mindfulness", "Other"];

const categoryColors = categories.reduce((acc, category, index) => {
    acc[category] = colors[index % colors.length];
    return acc;
}, {});

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
                Not yet checked <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </Badge>
        ),
    },
};

export default function HabitCard({
    habit, checkin, groupBy, onClick, date,
    onEdit, onChangeStatus, onDelete
}) {
    const [openDropdown, setOpenDropdown] = useState(false);

    const completionStatus = checkin?.completionStatus || "not_checked";

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
                ${style.card} cursor-pointer
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

                                {groupBy === "priority" && (
                                    <Badge
                                        variant="outline"
                                        className={` text-[var(--brand-muted-text)] text-xs`}
                                    >
                                        {habit.category}
                                    </Badge>
                                )}

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
                                className=" p-1 rounded-md hover:bg-blue/40 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0"
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


function HabitStatusCell({ checkin, target, habit, dateString }) {
    const [openNoteModal, setOpenNoteModal] = useState(false);
    const [pendingCheckin, setPendingCheckin] = useState(null);

    const current = checkin ?? {
        completionStatus: "not_checked",
        completedCount: 0,
    };

    const selectedDate = checkin?.date || dateString;

    const { updateCheckin, resetCheckin } = useCheckinContext();

    const handleAction = (action, dateString, value) => {
        switch (action) {
            case "update_progress": {
                updateCheckin(habit.id, dateString, {
                    completedCount: value,
                });
                // console.log("update_progress" ,habit.id, dateString, value)
                return;
            }

            case "skipped":
                updateCheckin(habit.id, dateString, {
                    completionStatus: "skipped",
                });
                // console.log("skipped" ,habit.id, dateString)
                return;

            case "failed":
                updateCheckin(habit.id, selectedDate, {
                    completionStatus: "failed",
                });
                // console.log("failed" ,habit.id, dateString)
                return;

            case "reset":
                resetCheckin(habit.id, dateString);
                // console.log("reset" ,habit.id, dateString)
                return;
        }
    };

    const handleClick = async () => {
        if (current.completionStatus === "completed") {
            await resetCheckin(habit.id, selectedDate);
            return;
        }

        const nextCount = (current.completedCount ?? 0) + 1;

        await updateCheckin(habit.id, selectedDate, {
            completedCount: nextCount,
        });
    };

    const renderButton = () => {
        switch (current.completionStatus) {
            case "completed":
                return (
                    <button
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center cursor-pointer"
                    >
                        <Check size={18} />
                    </button>
                );

            case "failed":
                return (
                    <button className="w-8 h-8 rounded-full text-white bg-red-600 flex items-center justify-center">
                        <X size={18} />
                    </button>
                );

            case "skipped":
                return (
                    <button className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                        <ArrowRight size={18} />
                    </button>
                );

            case "in_progress": {
                const percentage = Math.round(
                    (Number(current.completedCount) / Number(target)) * 100
                );

                return (
                    <button
                        className="relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                        style={{
                            background: `conic-gradient(
                                #3b82f6 ${percentage}%,
                                #e2e8f0 ${percentage}%
                            )`,
                        }}
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
                        className="w-8 h-8 flex bg-muted/30 items-center justify-center rounded-full cursor-pointer"
                    >
                        <PlusIcon size={18} />
                    </button>
                );
        }
    };

    return (
        <HabitCellDropdown
            dateString={selectedDate}
            status={current.completionStatus}
            progress={current.completedCount}
            onAction={handleAction}
        >
            {renderButton()}
        </HabitCellDropdown>
    );
}
