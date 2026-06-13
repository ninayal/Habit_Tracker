import { cn } from "@/lib/utils";

/**
 * TextInput — styled input (text / email / v.v.) đồng nhất với PasswordInput.
 * Dùng thay cho <input> thuần trong các auth form.
 *
 * Props giống input thông thường + hasError.
 */
export default function TextInput({ hasError = false, className, ...rest }) {
  return (
    <input
      className={cn(
        "w-full rounded-[10px] px-4 py-3.5",
        "text-sm text-white placeholder:text-zinc-600",
        "bg-white/[0.04] border border-white/10",
        "transition-all duration-200 outline-none",
        "focus:border-[#f9b2d7] focus:bg-white/[0.08]",
        "focus:shadow-[0_0_10px_rgba(249,178,215,0.15)]",
        hasError && "border-red-500/60 bg-red-500/[0.04]",
        className,
      )}
      {...rest}
    />
  );
}
