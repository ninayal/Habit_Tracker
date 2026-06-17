import Logo from "./Logo";
import ThemeToggle from "../profile/ThemeToggle";

/**
 * AuthNav — Thanh Top Navbar trải dài toàn màn hình dành cho trang Đăng nhập / Đăng ký.
 * Thừa hưởng layout từ trang Landing nhưng có màu sắc thích ứng Light/Dark mode của trang Auth.
 */
export default function AuthNav({ theme, toggleTheme }) {
  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-[200] h-[64px] px-6 sm:px-10
        flex items-center justify-between
        
        /* Màu nền & Viền thích ứng theo trang Sign In / Sign Up */
        bg-white/80 border-b border-slate-200/60
        dark:bg-[#121212]/80 dark:border-b dark:border-white/[0.05]
      `}
    >
      {/* 1. Component Logo thương hiệu "1Percent." bất biến */}
      <Logo />

      {/* 2. Nút chuyển đổi Theme bên phải */}
      <ThemeToggle theme={theme} onThemeChange={toggleTheme} />
    </nav>
  );
}
