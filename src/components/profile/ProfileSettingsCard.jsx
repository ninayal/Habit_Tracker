import { useState } from "react";

import EmojiPicker from "emoji-picker-react";

import ProfileSaveStatus from "@/components/profile/ProfileSaveStatus";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const CATEGORY_OPTIONS = ["Health", "Study", "Work", "Mindfulness", "Other"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const FREQUENCY_OPTIONS = [
    { value: "daily", label: "Daily" },
    { value: "specific_days", label: "Specific days" },
];
const GOAL_TYPE_OPTIONS = [
    { value: "streak", label: "Streak (Days)" },
    { value: "completions_target", label: "Total Completions" },
];
const WEEK_START_OPTIONS = [
    { value: "monday", label: "Monday" },
    { value: "sunday", label: "Sunday" },
];

function FieldCard({ label, children, className = "" }) {
    return (
        <div className={`flex min-h-[96px] items-center gap-4 overflow-visible rounded-[1.25rem] border border-brand-border/60 bg-white/70 px-4 py-3 shadow-sm dark:border-white/5 dark:bg-[#172033]/60 ${className}`}>
            <p className="w-28 shrink-0 text-sm font-medium leading-none whitespace-nowrap text-[color:var(--brand-text)] dark:text-[#F9FAFB]">
                {label}
            </p>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

function Pill({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "min-w-[5.5rem] rounded-full border px-4 py-2 text-sm font-medium transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/25",
                active
                    ? "border-brand-pink bg-brand-pink/15 text-[color:var(--brand-text)]"
                    : "border-brand-border bg-[#FAFAFA] text-[color:var(--brand-text)] hover:border-brand-pink/40 hover:bg-brand-yellow/20 dark:border-white/10 dark:bg-[#111827]",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

export default function ProfileSettingsCard({ profileSettings, saveStatus, onFieldChange }) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const frequency = profileSettings.frequency || { repeatType: "specific_days", daysOfWeek: [] };
    const weekStartsOn = profileSettings.weekStartsOn || "monday";

    return (
        <section className="brand-card rounded-[2rem] p-5 shadow-[0_14px_28px_rgba(31,41,55,0.06)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Create habit defaults</h2>
                <ProfileSaveStatus status={saveStatus?.status} message={saveStatus?.message} />
            </div>

            <div className="mt-4 grid gap-3">
                <div className="grid gap-3 md:grid-cols-12">
                    <FieldCard label="Icon" className="md:col-span-3">
                        <div className="relative flex items-center justify-end overflow-visible">
                            <button
                                type="button"
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-white text-lg shadow-sm transition hover:border-brand-pink hover:bg-brand-yellow/20 dark:border-white/10 dark:bg-[#111827] dark:text-[#F9FAFB]"
                                onClick={() => setShowEmojiPicker((current) => !current)}
                            >
                                {profileSettings.icon || "💧"}
                            </button>
                            {showEmojiPicker ? (
                                <div className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-auto rounded-[1.25rem] border border-brand-border/60 bg-[#FAFAFA] p-3 shadow-xl dark:border-white/10 dark:bg-[#111827]">
                                    <EmojiPicker
                                        onEmojiClick={(emojiData) => {
                                            onFieldChange("icon", emojiData.emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </FieldCard>

                    <FieldCard label="Category" className="md:col-span-5">
                        <Select
                            value={profileSettings.category}
                            onValueChange={(value) => onFieldChange("category", value)}
                        >
                            <SelectTrigger className="h-11 w-full rounded-2xl border-brand-border bg-white px-4 text-sm shadow-sm focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:border-white/10 dark:bg-[#111827] dark:text-[#F9FAFB]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((category) => (
                                    <SelectItem key={category} value={category} className="p-2">
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldCard>

                    <FieldCard label="Frequency" className="md:col-span-4">
                        <Select
                            value={frequency.repeatType}
                            onValueChange={(value) => onFieldChange("frequency.repeatType", value)}
                        >
                            <SelectTrigger className="h-11 w-full rounded-2xl border-brand-border bg-white px-4 text-sm shadow-sm focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:border-white/10 dark:bg-[#111827] dark:text-[#F9FAFB]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FREQUENCY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="p-2">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldCard>

                </div>

                <div className="grid gap-3 md:grid-cols-12">
                    <FieldCard label="Target" className="md:col-span-4">
                        <Input
                            type="number"
                            min={1}
                            value={profileSettings.targetPerDay}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (value === "") {
                                    onFieldChange("targetPerDay", "");
                                    return;
                                }

                                const nextValue = Number(value);
                                if (nextValue > 0) {
                                    onFieldChange("targetPerDay", nextValue);
                                }
                            }}
                            className="h-11 w-full rounded-2xl border-brand-border bg-white px-4 text-sm text-[color:var(--brand-text)] shadow-sm outline-none transition focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:border-white/10 dark:bg-[#111827] dark:text-[#F9FAFB]"
                        />
                    </FieldCard>

                    <FieldCard label="Priority" className="md:col-span-4">
                        <Select
                            value={profileSettings.priority}
                            onValueChange={(value) => onFieldChange("priority", value)}
                        >
                            <SelectTrigger className="h-11 w-full rounded-2xl border-brand-border bg-white px-4 text-sm shadow-sm focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:border-white/10 dark:bg-[#111827] dark:text-[#F9FAFB]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PRIORITY_OPTIONS.map((priority) => (
                                    <SelectItem key={priority} value={priority} className="p-2">
                                        {priority}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldCard>

                    <FieldCard label="Auto open note" className="md:col-span-4">
                        <div className="flex h-11 items-center">
                            <Switch
                                checked={!!profileSettings.autoOpenNote}
                                onCheckedChange={(value) => onFieldChange("autoOpenNote", value)}
                                className="data-checked:bg-pink-400"
                            />
                        </div>
                    </FieldCard>
                </div>

                <div className="grid gap-3 md:grid-cols-12">
                    <FieldCard label="Goal" className="md:col-span-12">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <Select
                                value={profileSettings.goal?.targetType}
                                onValueChange={(value) => onFieldChange("goal.targetType", value)}
                            >
                                <SelectTrigger className="h-11 w-full rounded-2xl border-brand-border bg-white px-4 text-sm shadow-sm focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:border-white/10 dark:bg-[#111827] dark:text-[#F9FAFB]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {GOAL_TYPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="p-2">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                min={1}
                                value={profileSettings.goal?.targetValue}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    if (value === "") {
                                        onFieldChange("goal.targetValue", "");
                                        return;
                                    }

                                    const nextValue = Number(value);
                                    if (nextValue > 0) {
                                        onFieldChange("goal.targetValue", nextValue);
                                    }
                                }}
                                className="h-11 w-full rounded-2xl border-brand-border bg-white px-4 text-sm text-[color:var(--brand-text)] shadow-sm outline-none transition focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:border-white/10 dark:bg-[#111827] dark:text-[#F9FAFB]"
                            />
                        </div>
                    </FieldCard>
                </div>

                <div className="rounded-[1.25rem] border border-brand-border/60 bg-white/70 p-4 shadow-sm dark:border-white/5 dark:bg-[#111827]/80">
                    <h3 className="text-base font-semibold text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Calendar preferences</h3>
                    <div className="mt-3">
                        <FieldCard label="Week starts on" className="min-h-[88px]">
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                                {WEEK_START_OPTIONS.map((option) => (
                                    <Pill
                                        key={option.value}
                                        label={option.label}
                                        active={weekStartsOn === option.value}
                                        onClick={() => onFieldChange("weekStartsOn", option.value)}
                                    />
                                ))}
                            </div>
                        </FieldCard>
                    </div>
                </div>
            </div>
        </section>
    );
}
