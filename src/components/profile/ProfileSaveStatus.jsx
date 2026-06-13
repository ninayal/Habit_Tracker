import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function ProfileSaveStatus({ status = "idle", message }) {
    if (status === "idle" || !message) {
        return null;
    }

    const isError = status === "error";
    const isSaving = status === "saving";
    const Icon = isError ? XCircle : isSaving ? Loader2 : CheckCircle2;

    return (
        <div
            role="status"
            aria-live="polite"
            className={[
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs shadow-sm",
                "bg-[#F9FAFB] text-[#1F2937] dark:bg-[#111827] dark:text-[#F9FAFB]",
                isError ? "border-red-200 dark:border-red-900/50" : "border-[#E5E7EB] dark:border-[#374151]",
            ].join(" ")}
        >
            <Icon className={["h-3.5 w-3.5", isSaving ? "animate-spin text-brand-pink" : isError ? "text-red-500 dark:text-red-300" : "text-brand-pink"].join(" ")} />
            <span className={isError ? "text-red-600 dark:text-red-300" : "text-[#6B7280] dark:text-[#CBD5E1]"}>
                {message}
            </span>
        </div>
    );
}
