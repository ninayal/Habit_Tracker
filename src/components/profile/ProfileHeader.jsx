import { Button } from "@/components/ui/button";
import { formatJoinedDate } from "@/services/profile";

export default function ProfileHeader({ profile, isEditing, onEdit }) {
    const quickInfo = [
        { label: "Handle", value: profile.handle || "", tone: "bg-brand-pink/10" },
        { label: "Email", value: profile.email, tone: "bg-brand-blue/30" },
        { label: "Joined", value: formatJoinedDate(profile.createdAt), tone: "bg-brand-green/30" },
        { label: "Reminder", value: profile.reminderTime || "07:00", tone: "bg-brand-yellow/50" },
    ];

    return (
        <section className="brand-card rounded-[2rem] shadow-sm">
            <div className="flex flex-col gap-5 p-5 sm:p-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--brand-text)] sm:text-4xl">Profile</h1>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 rounded-[1.75rem] bg-[#FFFDF8] p-5 shadow-sm dark:bg-[#1F2937] sm:p-6">
                        <div className="max-w-2xl space-y-3">
                            <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--brand-text)] sm:text-4xl dark:text-[#F9FAFB]">
                                {profile.fullName}
                            </h2>
                            <div className="space-y-1 text-sm text-[color:var(--brand-label-text)] dark:text-[#E5E7EB]">
                                <p>{profile.handle}</p>
                                <p>{profile.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end lg:pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="rounded-full border-brand-border bg-brand-card-bg px-4 text-foreground hover:border-brand-pink hover:bg-brand-pink hover:text-[#241B20]"
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
