import { formatJoinedDate } from "@/services/profile";

export default function AccountInfoCard({ profile }) {
    return (
        <section className="brand-card rounded-[2rem] p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-semibold text-[color:var(--brand-text)]">Account information</h2>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FAFAFA] p-4 shadow-sm dark:bg-[#172033]">
                    <dt className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Full name</dt>
                    <dd className="mt-1 text-sm text-[color:var(--brand-label-text)] dark:text-[#E5E7EB]">{profile.fullName}</dd>
                </div>
                <div className="rounded-2xl bg-[#FAFAFA] p-4 shadow-sm dark:bg-[#172033]">
                    <dt className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Handle</dt>
                    <dd className="mt-1 text-sm text-[color:var(--brand-label-text)] dark:text-[#E5E7EB]">{profile.handle}</dd>
                </div>
                <div className="rounded-2xl bg-[#FAFAFA] p-4 shadow-sm dark:bg-[#172033]">
                    <dt className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Email</dt>
                    <dd className="mt-1 text-sm text-[color:var(--brand-label-text)] dark:text-[#E5E7EB]">{profile.email}</dd>
                </div>
                <div className="rounded-2xl bg-[#FAFAFA] p-4 shadow-sm dark:bg-[#172033]">
                    <dt className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Joined date</dt>
                    <dd className="mt-1 text-sm text-[color:var(--brand-label-text)] dark:text-[#E5E7EB]">{formatJoinedDate(profile.createdAt)}</dd>
                </div>
            </dl>

        </section>
    );
}
