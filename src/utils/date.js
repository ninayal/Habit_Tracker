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
