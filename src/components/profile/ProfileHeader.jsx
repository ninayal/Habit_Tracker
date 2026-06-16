import { useRef } from "react";

import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatJoinedDate } from "@/services/profile";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileSaveStatus from "@/components/profile/ProfileSaveStatus";

export default function ProfileHeader({
    profile,
    isEditing,
    onEdit,
    saveStatus,
    avatarSaveStatus,
    avatarError,
    onAvatarFilePick,
}) {
    const avatarInputRef = useRef(null);

    const quickInfo = [
        { label: "Category", value: profile.defaultHabitCategory || "Health", tone: "bg-brand-pink/10" },
        { label: "Joined", value: formatJoinedDate(profile.createdAt), tone: "bg-brand-blue/30" },
        { label: "Reminder", value: profile.reminderTime || "07:00", tone: "bg-brand-yellow/50" },
        {
            label: "Week starts",
            value: profile.weekStartsOn ? profile.weekStartsOn[0].toUpperCase() + profile.weekStartsOn.slice(1) : "Monday",
            tone: "bg-brand-green/30",
        },
    ];

    return (
        <section className="brand-card rounded-[2.25rem] shadow-[0_20px_40px_rgba(31,41,55,0.08)]">
            <div className="flex flex-col gap-6 p-5 sm:p-6">
                <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                    <div className="rounded-[2rem] bg-brand-card-bg p-5 shadow-sm dark:bg-[#172033] sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div
                                className="relative w-fit overflow-visible"
                                onClick={() => avatarInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        avatarInputRef.current?.click();
                                    }
                                }}
                            >
                                <ProfileAvatar src={profile.image} name={profile.fullName} />
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        avatarInputRef.current?.click();
                                    }}
                                    className="absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white shadow-sm transition hover:border-brand-pink hover:bg-brand-yellow/20 dark:border-white/10 dark:bg-[#111827] dark:text-[#F9FAFB]"
                                    aria-label="Change avatar"
                                >
                                    <Camera className="h-4 w-4 text-[color:var(--brand-text)] dark:text-[#F9FAFB]" />
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => onAvatarFilePick?.(event.target.files?.[0], event)}
                                />
                            </div>
                            <div className="max-w-2xl space-y-3">
                                <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--brand-text)] sm:text-4xl dark:text-[#F9FAFB]">
                                    {profile.fullName}
                                </h2>
                                <p className="text-sm text-[color:var(--brand-label-text)] dark:text-[#E5E7EB]">{profile.email}</p>
                                <div className="space-y-1">
                                    {avatarSaveStatus?.message ? (
                                        <ProfileSaveStatus status={avatarSaveStatus.status} message={avatarSaveStatus.message} />
                                    ) : null}
                                    {avatarError ? (
                                        <p className="text-xs text-red-500">{avatarError}</p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        <div className="pt-3">
                            <ProfileSaveStatus status={saveStatus?.status} message={saveStatus?.message} />
                        </div>
                    </div>

                    <div className="flex flex-col items-end justify-start lg:pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="rounded-full border-brand-border bg-brand-card-bg px-4 text-foreground shadow-sm hover:border-brand-pink hover:bg-brand-pink hover:text-[#241B20]"
                            disabled={isEditing}
                        >
                            {isEditing ? "Editing" : "Edit profile"}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {quickInfo.map((item) => (
                        <div
                            key={item.label}
                            className={`rounded-2xl border border-brand-border px-4 py-3 shadow-sm ${item.tone} dark:bg-[#172033]`}
                        >
                            <p className="text-xs uppercase tracking-wide text-[color:var(--brand-label-text)] dark:text-[#D1D5DB]">
                                {item.label}
                            </p>
                            <p className="mt-1 text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
