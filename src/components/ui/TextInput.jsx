import { cn } from "@/lib/utils";

/**
 * TextInput — styled input (text / email / v.v.) đồng nhất với PasswordInput.
 * Dùng thay cho <input> thuần trong các auth form.
 *
 * Props giống input thông thường + hasError.
 * Hỗ trợ Light/Dark mode đồng nhất với PasswordInput
 */
export default function TextInput({ hasError = false, className, ...rest }) {
  return (
    <input
      className={cn(
        "w-full rounded-[10px] px-4 py-3.5",
        "text-sm outline-none transition-all duration-200",
        // Chế độ Light: Chữ tối, placeholder xám vừa, nền xám nhạt, viền mỏng nhạt
        "text-slate-900 placeholder:text-slate-400 bg-slate-100/80 border border-slate-200",
        // Chế độ Dark: Quay về cấu hình gốc của bạn
        "dark:text-white dark:placeholder:text-zinc-600 dark:bg-white/[0.04] dark:border-white/10",

        // Khi focus (Hiệu ứng focus giữ nguyên màu thương hiệu hồng chuyển vàng của bạn)
        "focus:border-[#f9b2d7] focus:bg-white focus:dark:bg-white/[0.08]",
        "focus:shadow-[0_0_10px_rgba(249,178,215,0.15)]",

        // Khi có lỗi validation
        hasError &&
          "border-red-400 bg-red-500/[0.02] dark:border-red-500/60 dark:bg-red-500/[0.04]",
        className,
      )}
      {...rest}
    />
  );
}
