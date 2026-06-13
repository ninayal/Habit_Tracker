export default function AccountInfoCard({ profile }) {
    return (
        <section className="brand-card rounded-[2rem] p-5 shadow-[0_14px_28px_rgba(31,41,55,0.06)] sm:p-6">
            <h2 className="text-2xl font-semibold text-[color:var(--brand-text)]">Account information</h2>

            <dl className="mt-5 grid gap-3">
                <div className="rounded-[1.25rem] bg-[#FAFAFA] p-4 shadow-sm dark:bg-[#172033]">
                    <dt className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Full name</dt>
                    <dd className="mt-1 text-sm text-[color:var(--brand-label-text)] dark:text-[#E5E7EB]">{profile.fullName}</dd>
                </div>
                <div className="rounded-[1.25rem] bg-[#FAFAFB] p-4 shadow-sm dark:bg-[#172033]">
                    <dt className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Email</dt>
                    <dd className="mt-1 text-sm text-[color:var(--brand-label-text)] dark:text-[#E5E7EB]">{profile.email}</dd>
                </div>
            </dl>

        </section>
    );
}
