import { formatDate } from "@/utils/helper";

export function isScheduledDay(habit, date) {
    if (!habit.frequency) return true;
    if (habit.frequency.repeatType === 'daily') return true;
    if (habit.frequency.repeatType === 'specific_days') {
        const dayOfWeek = date.getDay(); // 0 (Chủ nhật) -> 6 (Thứ 7) theo JS
        return habit.frequency.daysOfWeek.includes(dayOfWeek);
    }
    return true;
}

export function isValidDate(habit, date) {
    const habitStartDate = new Date(habit.startDate);
    habitStartDate.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate >= habitStartDate;
}

export function calculateCurrentStreak(habit, checkins) {
    if (!habit || !checkins || checkins.length === 0) return 0;

    const checkinMap = new Map();
    checkins.forEach(c => { checkinMap.set(c.date, c); });

    const habitStartDate = new Date(habit.startDate);
    habitStartDate.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const todayStr = formatDate(currentDate);
    if (!checkinMap.has(todayStr)) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    while (currentDate >= habitStartDate) {
        const dateStr = formatDate(currentDate);
        const checkin = checkinMap.get(dateStr);
        const isRequired = isScheduledDay(habit, currentDate);

        if (!isRequired) {
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
        }

        if (!checkin) break;

        if (checkin.completionStatus === "completed") {
            streak++;
        } else if (checkin.completionStatus === "skipped") {
            // skipped không làm tăng streak nhưng cũng không break
        } else {
            break;
        }
        currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
}

export function calculateLongestStreak(habit, checkins) {
    if (!habit || !checkins || checkins.length === 0) return 0;

    const checkinMap = new Map();
    checkins.forEach(c => { checkinMap.set(c.date, c); });

    const habitStartDate = new Date(habit.startDate);
    habitStartDate.setHours(0, 0, 0, 0);

    let currentDate = new Date(habitStartDate);

    const maxDate = new Date();
    maxDate.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let maxStreak = 0;
    while (currentDate <= maxDate) {
        const dateStr = formatDate(currentDate);
        const checkin = checkinMap.get(dateStr);
        const isRequired = isScheduledDay(habit, currentDate);

        if (!isRequired) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }

        if (checkin && checkin.completionStatus === "completed") {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else if (checkin && checkin.completionStatus === "skipped") {
            // skipped: không reset, không tăng
        } else {
            currentStreak = 0;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return maxStreak;
}

export function calculateTotalCompletions(habit, checkins) {
    if (!habit || !checkins) return 0;

    const habitStartDateStr = habit.startDate;

    return checkins.filter(c =>
        c.completionStatus === "completed" &&
        c.date >= habitStartDateStr
    ).length;
}

export function calculateGoalProgress(habit, goal, checkins) {
    if (!goal) return null;

    let currentValue = 0;
    if (goal.targetType === "streak") {
        currentValue = calculateCurrentStreak(habit, checkins);
    } else if (goal.targetType === "completions_target") {
        currentValue = calculateTotalCompletions(habit, checkins);
    }

    const rawPercentage = (currentValue / goal.targetValue) * 100;
    const percentage = Math.min(Math.round(rawPercentage), 100);

    return {
        ...goal,
        currentValue,
        percentage,
        is80Percent: percentage >= 80 && percentage < 100,
        is100Percent: percentage >= 100
    };
}