export function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateValue, options = {}) {
    if (!dateValue) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...options,
    }).format(new Date(dateValue));
}

export function addDays(dateString, daysToAdd) {
    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + daysToAdd);

    return getLocalDateString(date);
}

function toLocalDate(value) {
    if (value instanceof Date) {
        return new Date(value);
    }

    if (typeof value === "string") {
        return new Date(`${value}T00:00:00`);
    }

    return new Date(value);
}

export function normalizeWeekStartsOn(weekStartsOn) {
    return weekStartsOn === "sunday" ? "sunday" : "monday";
}

export function getOrderedWeekdayLabels(weekStartsOn) {
    return normalizeWeekStartsOn(weekStartsOn) === "sunday"
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

export function getStartOfWeek(date = new Date(), weekStartsOn = "monday") {
    const start = toLocalDate(date);
    start.setHours(0, 0, 0, 0);

    const normalizedWeekStartsOn = normalizeWeekStartsOn(weekStartsOn);
    const currentDay = start.getDay();
    const offset = normalizedWeekStartsOn === "sunday"
        ? currentDay
        : (currentDay === 0 ? 6 : currentDay - 1);

    start.setDate(start.getDate() - offset);
    return start;
}

export function getWeekDates(date = new Date(), weekStartsOn = "monday") {
    const start = getStartOfWeek(date, weekStartsOn);

    return Array.from({ length: 7 }, (_, index) => {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + index);
        return nextDate;
    });
}

export function getWeekDateStrings(date = new Date(), weekStartsOn = "monday") {
    return getWeekDates(date, weekStartsOn).map((day) => getLocalDateString(day));
}

export function getWeekDateRange(date = new Date(), weekStartsOn = "monday") {
    const start = getStartOfWeek(date, weekStartsOn);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
}
