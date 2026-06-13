import { Button } from "@/components/ui/button";

const FIELDS = [
    {
        name: "fullName",
        label: "Full name",
        placeholder: "Your full name",
        type: "text",
        span: "md:col-span-1",
    },
    {
        name: "email",
        label: "Email",
        placeholder: "you@example.com",
        type: "email",
        span: "md:col-span-1",
    },
];

function Field({ field, value, error, onChange }) {
    const baseClassName = "mt-2 w-full rounded-2xl border border-brand-border bg-[#FAFAFA] px-4 py-3 text-sm text-[color:var(--brand-text)] shadow-sm outline-none transition placeholder:text-[color:var(--brand-muted-text)] focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 dark:bg-[#172033] dark:text-[#F9FAFB] dark:placeholder:text-[#CBD5E1]";
    const className = `${baseClassName} ${error ? "border-destructive" : ""}`;

    return (
        <label className={`block ${field.span}`}>
            <span className="text-sm font-medium text-[color:var(--brand-text)] dark:text-[#F9FAFB]">{field.label}</span>
            <input
                name={field.name}
                type={field.type}
                value={value}
                onChange={onChange}
                placeholder={field.placeholder}
                className={className}
            />
            {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </label>
    );
}

export default function ProfileEditForm({ values, errors, onChange, onSubmit, onCancel, isSaving }) {
    return (
        <form onSubmit={onSubmit} className="brand-card rounded-[2rem] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wide text-[color:var(--brand-label-text)] dark:text-[#D1D5DB]">Edit mode</p>
                    <h2 className="mt-1 text-2xl font-semibold text-[color:var(--brand-text)] dark:text-[#F9FAFB]">Update profile details</h2>
                    <p className="mt-2 text-sm text-[color:var(--brand-label-text)] dark:text-[#CBD5E1]">Update the details shown on your profile.</p>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {FIELDS.map((field) => (
                    <Field
                        key={field.name}
                        field={field}
                        value={values[field.name]}
                        error={errors[field.name]}
                        onChange={onChange}
                    />
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" className="rounded-full bg-brand-pink px-5 text-[#111827] hover:bg-brand-pink/90" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save changes"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-brand-border bg-brand-card-bg px-5 text-[color:var(--brand-text)] hover:border-brand-pink hover:bg-brand-yellow hover:text-[#111827]"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
