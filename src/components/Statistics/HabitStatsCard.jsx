import useHabitStats from '@/hooks/useHabitStats';
import { Flame, Target, Trophy } from 'lucide-react';
import React, { useMemo } from 'react'

export default function HabitStatsCard({ habit }) {
    const { stats } = useHabitStats(habit);

    const theme = useMemo(() => {
        const brandColors = [
            { bg: "var(--brand-pink)", text: "#d81b60" },   // Pink
            { bg: "var(--brand-blue)", text: "#00838f" },   // Blue
            { bg: "var(--brand-green)", text: "#2e7d32" },  // Green
            { bg: "var(--brand-yellow)", text: "#f57f17" }  // Yellow
        ];
        const index = typeof habit.id === 'number'
            ? habit.id % brandColors.length
            : String(habit.id).charCodeAt(0) % brandColors.length;

        return brandColors[index];
    }, [habit.id]);

    const renderGoalProgress = () => {
        if (!stats.goalProgress) {
            return (
                <div className="flex items-center gap-1 text-gray-400 italic text-sm" title="No goal set">
                    <Target size={14} />
                    <span>No goal</span>
                </div>
            );
        }

        const { targetValue, currentValue, percentage } = stats.goalProgress;
        const isDone = percentage >= 100;
        return (
            <div className="flex flex-col justify-center gap-1.5 w-24 sm:w-32" title="Goal Progress">
                <div className="flex justify-between items-center text-xs font-medium">
                    <div className="flex items-center gap-1 text-gray-600">
                        <Target size={14} className={isDone ? "text-green-500" : "text-gray-500"} />
                        <span>{currentValue}/{targetValue}</span>
                    </div>
                    <span className={isDone ? "text-green-600" : "text-gray-600"}>
                        {percentage}%
                    </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${isDone ? 'bg-green-500' : 'bg-gray-800'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div
            className="bg-white/70 rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 transition-colors"
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
                style={{ backgroundColor: theme.bg, color: theme.text }}
            >
                {habit.icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-gray-800">{habit.name}</div>
                <div className="text-xs text-gray-500 pt-0.5">{habit.frequency?.repeatType === "daily" ? "Daily" : "Specific days"} | {habit.category} | {habit.goal.targetType === "streak" ? "Current Streak" : "Total Completions"}</div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-sm">
                <div className="flex items-center gap-1.5" title="Current streak">
                    <Flame size={16} className="text-orange-500" />
                    <span className="font-medium text-gray-700">{stats.currentStreak}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Longest streak">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="font-medium text-gray-700">{stats.longestStreak}</span>
                </div>
                <div className="hidden sm:flex border-l border-gray-200 h-8 pl-4 sm:pl-6 items-center">
                    {renderGoalProgress()}
                </div>
            </div>
        </div>
    );
}