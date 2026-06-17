import { cn } from "@/lib/utils";

// Inject Google Fonts một lần
if (typeof document !== "undefined" && !document.getElementById("auth-fonts")) {
  const link = Object.assign(document.createElement("link"), {
    id: "auth-fonts",
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
  });
  document.head.appendChild(link);
}

/**
 * AuthCard — glassmorphism card dùng chung cho Sign In / Sign Up.
 */
export default function AuthCard({ title, subtitle, children, className }) {
  return (
    <div
      className={cn(
        // "min-h-screen bg-[#121212]",
        // // desktop: căn giữa màn hình
        // "flex items-center justify-center",
        // // mobile: căn trên để form dài có thể scroll, padding đủ thoáng
        // "max-sm:items-start max-sm:pt-10 max-sm:pb-10",
        // "px-4",

        // Thay đổi nền theo theme: light là slate-50, dark là slate-900 (hoặc #121212)
        "min-h-screen bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white",
        "flex items-center justify-center",
        "max-sm:items-start max-sm:pt-10 max-sm:pb-10",
        "px-4 position-relative",
      )}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div
        className={cn(
          // "w-full max-w-md",
          // "rounded-2xl border border-white/5",
          // "bg-white/[0.06] backdrop-blur-xl",
          // "shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
          // // desktop padding
          // "px-10 py-10",
          // // tablet (sm)
          // "max-sm:px-6 max-sm:py-8 max-sm:rounded-xl",
          // // phone nhỏ < 380px
          // "max-[380px]:px-4 max-[380px]:py-7",
          // className,
          "w-full max-w-md",
          // Viền nhạt ở bản light, viền tinh tế ở bản dark
          "rounded-2xl border border-slate-200/60 dark:border-white/5",
          // Nền trắng mờ ở bản light, nền tối mờ ở bản dark
          "bg-white/80 dark:bg-white/[0.06] backdrop-blur-xl",
          "shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
          "px-10 py-10",
          "max-sm:px-6 max-sm:py-8 max-sm:rounded-xl",
          "max-[380px]:px-4 max-[380px]:py-7",
          className,
        )}
      >
        {/* ── Header ── */}
        <h1
          className={cn(
            "text-center mb-1 font-semibold leading-tight bg-clip-text text-transparent",
            "bg-gradient-to-br from-[#f9b2d7] via-[#f9b2d7] to-[#f6ffdc]",
            // fluid font size
            "text-[2.5rem] max-sm:text-[2.1rem] max-[380px]:text-[1.8rem]",
          )}
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="text-center text-sm text-zinc-500 mb-8 mt-1 max-[380px]:text-xs">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
