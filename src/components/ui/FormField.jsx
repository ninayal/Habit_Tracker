import { cn } from "@/lib/utils";

/**
 * FormField — bọc label, input (hoặc bất kỳ children nào), và error hint.
 *
 * @param {string}    label    - Text hiển thị trên input
 * @param {string}    error    - Error string (từ validate())
 * @param {boolean}   touched  - Đã blur/submit chưa? Chỉ show error khi true
 * @param {string}    className - Extra Tailwind classes cho wrapper
 * @param {ReactNode} children  - Input element
 */
export default function FormField({
  label,
  htmlFor,
  error,
  touched,
  className,
  children,
}) {
  const showError = touched && error;

  return (
    <div className={cn("flex flex-col gap-2 mb-5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium tracking-wide text-zinc-400 uppercase"
        >
          {label}
        </label>
      )}

      {children}

      {showError && (
        <span className="text-xs text-red-400 flex items-center gap-1">
          {/* mini warning dot */}
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}
