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
          // Đổi sang text-slate-500 ở bản Light để dễ nhìn, dark giữ nguyên text-zinc-400
          className="text-xs font-medium tracking-wide text-slate-500 dark:text-zinc-400 uppercase"
        >
          {label}
        </label>
      )}

      {children}

      {showError && (
        // Đổi màu thông báo lỗi thích ứng với nền sáng (text-red-500) và nền tối (dark:text-red-400)
        <span className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          {/* mini warning dot */}
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}
