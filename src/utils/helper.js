import { composeRenderProps } from "react-aria-components";
import { tv } from "tailwind-variants";

export const getFrequencyText = (freq) => {
    if (freq.repeatType === "daily") return "Daily";
    if (freq.repeatType === "specific_days") {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return freq.daysOfWeek.map(d => days[d - 1]).join(", ");
    }
    return freq.repeatType;
};

//chuyển date thành string YYYY-MM-DD
export function formatDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function checkToday(input) {
    if (!input) return false;
    const todayStr = formatDate(new Date());

    if (typeof input === "string") {
        return input === todayStr;
    }
    if (input instanceof Date) {
        return formatDate(input) === todayStr;
    }

    return false;
}

// Cấu hình viền focus chung cho các component tương tác
export const focusRing = tv({
    base: 'outline-none',
    variants: {
        isFocusVisible: {
            false: 'outline-none',
            true: 'ring-2 ring-blue-600 ring-offset-2 dark:ring-blue-500'
        }
    }
});

// Hàm hỗ trợ gộp class của Tailwind CSS
export function composeTailwindRenderProps(className, tw) {
    return composeRenderProps(className, (renderPropsClassName) => {
        return renderPropsClassName ? `${tw} ${renderPropsClassName}` : tw;
    });
}