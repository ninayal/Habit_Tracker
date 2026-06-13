import { useState } from "react";

export default function ProfileAvatar({ src, name }) {
    const [hasError, setHasError] = useState(false);
    const initial = name?.trim()?.charAt(0)?.toUpperCase() || "H";

    if (!src || hasError) {
        return (
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-[#FAFAFA] text-3xl font-semibold text-[color:var(--brand-text)] shadow-sm dark:bg-[#1F2937] dark:text-[#F9FAFB]">
                {initial}
            </div>
        );
    }

    return (
        <div className="h-24 w-24 overflow-hidden rounded-[1.5rem] bg-[#FAFAFA] shadow-sm dark:bg-[#1F2937]">
            <img
                src={src}
                alt={name ? `${name} profile` : "Profile image"}
                className="h-full w-full object-cover"
                onError={() => setHasError(true)}
            />
        </div>
    );
}
