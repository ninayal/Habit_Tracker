const CATEGORY_OPTIONS = ["Health", "Study", "Work", "Mindfulness", "Other"];
const WEEK_START_OPTIONS = ["Monday", "Sunday", "Saturday"];

export default function PreferencesCard({
    reminderTime,
    defaultHabitCategory,
    weekStartsOn,
    onReminderTimeChange,
    onDefaultHabitCategoryChange,
    onWeekStartsOnChange,
}) {
    return (
        <section className="brand-card rounded-[2rem] p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-semibold text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Routine preferences</h2>

            <div className="mt-5 space-y-4">
                <label className="block rounded-2xl bg-[#FAFAFA] p-4 shadow-sm dark:bg-[#172033]">
                    <span className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Daily reminder time</span>
                    <input
                        type="time"
                        value={reminderTime}
                        onChange={(event) => onReminderTimeChange(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-brand-border bg-[#FAFAFA] px-4 py-3 text-sm text-[color:var(--brand-text)] outline-none transition focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:bg-[#172033] dark:text-[#F9FAFB]"
                    />
                </label>

                <label className="block rounded-2xl bg-[#FAFAFA] p-4 shadow-sm dark:bg-[#172033]">
                    <span className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Default habit category</span>
                    <select
                        value={defaultHabitCategory}
                        onChange={(event) => onDefaultHabitCategoryChange(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-brand-border bg-[#FAFAFA] px-4 py-3 text-sm text-[color:var(--brand-text)] outline-none transition focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:bg-[#172033] dark:text-[#F9FAFB]"
                    >
                        {CATEGORY_OPTIONS.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block rounded-2xl bg-[#FAFAFA] p-4 shadow-sm dark:bg-[#172033]">
                    <span className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Week starts on</span>
                    <select
                    value={weekStartsOn}
                    onChange={(event) => onWeekStartsOnChange(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-brand-border bg-[#FAFAFA] px-4 py-3 text-sm text-[color:var(--brand-text)] outline-none transition focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:bg-[#172033] dark:text-[#F9FAFB]"
                    >
                        {WEEK_START_OPTIONS.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </section>
    );
}
