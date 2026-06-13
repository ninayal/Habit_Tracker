import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPasswordStrength, PASSWORD_STRENGTH_META } from "@/utils/authValidation";

/**
 * PasswordInput — input[type=password] với:
 *   - nút toggle hiện/ẩn (Eye / EyeOff từ lucide-react)
 *   - password strength bar (khi showStrengthBar=true)
 *
 * Props giống input thông thường + showStrengthBar + hasError.
 */
export default function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Enter password...",
  hasError = false,
  showStrengthBar = false,
  autoComplete = "current-password",
  className,
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  const strength  = showStrengthBar ? getPasswordStrength(value) : 0;
  const meta      = PASSWORD_STRENGTH_META[strength];
  const showBar   = showStrengthBar && value.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      {/* ── Input row ── */}
      <div className="relative flex items-center">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            // base
            "w-full rounded-[10px] px-4 py-3.5 pr-12",
            "text-sm text-white placeholder:text-zinc-600",
            "bg-white/[0.04] border border-white/10",
            "transition-all duration-200 outline-none",
            // focus
            "focus:border-[#f9b2d7] focus:bg-white/[0.08]",
            "focus:shadow-[0_0_10px_rgba(249,178,215,0.15)]",
            // error state
            hasError && "border-red-500/60 bg-red-500/[0.04]",
            className,
          )}
          {...rest}
        />

        {/* ── Eye toggle button ── */}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className={cn(
            "absolute right-3 p-1 rounded",
            "text-zinc-500 hover:text-[#f9b2d7]",
            "transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f9b2d7]/50",
          )}
        >
          {visible
            ? <EyeOff size={17} strokeWidth={1.8} />
            : <Eye    size={17} strokeWidth={1.8} />
          }
        </button>
      </div>

      {/* ── Strength bar ── */}
      {showBar && (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1" role="progressbar" aria-label="Password strength">
            {[1, 2, 3, 4].map((seg) => (
              <div
                key={seg}
                className={cn(
                  "h-[3px] flex-1 rounded-full transition-colors duration-300",
                  strength >= seg ? meta.bar : "bg-white/10",
                )}
              />
            ))}
          </div>
          <span className={cn("text-[11px] font-medium", meta.color)}>
            {meta.label}
          </span>
        </div>
      )}
    </div>
  );
}
