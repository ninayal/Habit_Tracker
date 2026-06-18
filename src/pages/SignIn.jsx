import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";
import { validateSignIn } from "../utils/authValidation";
import AuthCard from "../components/auth/AuthCard";
import FormField from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import TextInput from "../components/ui/TextInput";
import CaptchaField from "../components/auth/CaptchaField";
import RescueField from "../components/auth/RescueField";
import { useTheme } from "../hooks/useTheme";
import AuthNav from "../components/auth/AuthNav";
import "./styles/SignIn.css";

export default function SignIn() {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

  const [adminRescueCodeInput, setAdminRescueCodeInput] = useState("");
  const [remainingRescueAttempts, setRemainingRescueAttempts] = useState(() =>
    authService.getRemainingRescueAttempts(),
  );
  const [rescueError, setRescueError] = useState("");
  const [isRescueFieldBanned, setIsRescueFieldBanned] = useState(() =>
    authService.isRescueBanned(),
  ); // State kiểm soát khóa ô nhập
  const [rescueSuccessCountdown, setRescueSuccessCountdown] = useState(0);

  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");

  // Captcha security challenge states
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(""); // Generated string
  const [userCaptchaInput, setUserCaptchaInput] = useState(""); // User text typed

  // Hardware ban timer states
  const [lockCountdown, setLockCountdown] = useState(0);

  // Helper routine to generate random alphanumeric captcha values
  const generateNewCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  // Kiểm tra trạng thái thiết bị một lần duy nhất lúc vừa tải trang vào Form (Mounting)
  useEffect(() => {
    const status = authService.checkSecurityStatus();

    if (status.isDeviceLocked) {
      setLockCountdown(status.remainingTime);
      setServerError(status.message);
      setShowCaptcha(false);
    } else {
      setShowCaptcha(status.triggerCaptcha);
      setServerError(status.message);

      if (status.triggerCaptcha && !captchaCode) {
        generateNewCaptcha();
      }
    }
  }, []); // Đổi mảng dependency thành rỗng để không bị chạy lại khi gõ đổi email

  // Drive penalty clock ticker interval
  // Đồng bộ đếm ngược và tự động dọn dẹp thông báo lỗi cũ khi hết giờ
  // SignIn.jsx
  useEffect(() => {
    if (lockCountdown <= 0) return;

    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          // Dọn dẹp các thông báo lỗi và input tạm thời trên UI khi hết giờ lock
          setServerError("");
          setRescueError(""); // <--- QUAN TRỌNG: Xóa thông báo lỗi cũ của Rescue
          setAdminRescueCodeInput(""); // <--- QUAN TRỌNG: Xóa chữ đã gõ trong ô nhập cũ

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockCountdown]);

  // Bộ đếm ngược 3 giây thông báo giải cứu thành công trước khi reset form
  useEffect(() => {
    if (rescueSuccessCountdown <= 0) return;

    const successTimer = setInterval(() => {
      setRescueSuccessCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(successTimer);

          // Sau khi kết thúc 3 giây -> Tiến hành dọn dẹp sạch giao diện về ban đầu
          setLockCountdown(0);
          setServerError("");
          setRescueError("");
          setAdminRescueCodeInput("");
          setShowCaptcha(false);
          setUserCaptchaInput("");
          // setIsRescueFieldBanned(false);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(successTimer);
  }, [rescueSuccessCountdown]);

  // Đảm bảo errors luôn luôn là một Object, kể cả khi hàm validation trả về null/undefined
  const errors =
    validateSignIn && typeof validateSignIn === "function"
      ? validateSignIn(form) || {}
      : {};
  const showError = (field) =>
    touched && touched[field] && errors && errors[field];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // SignIn.jsx
  const handleAdminUnlock = (e) => {
    e.preventDefault();
    setRescueError("");

    // Nếu đang bị ban hoặc đang chạy đếm ngược thành công thì không cho làm gì hết
    if (isRescueFieldBanned || rescueSuccessCountdown > 0) {
      return;
    }

    if (!adminRescueCodeInput.trim()) {
      setRescueError("Please enter the rescue code.");
      return;
    }

    const result = authService.unlockDeviceByAdminCode(adminRescueCodeInput);
    setRemainingRescueAttempts(authService.getRemainingRescueAttempts());

    if (result.success) {
      setRescueSuccessCountdown(3);
      setRescueError("");
      setIsRescueFieldBanned(false); // Đảm bảo giải ban khi nhập đúng thành công
    } else {
      setRescueError(result.message);
      if (result.isRescueBanned) {
        setIsRescueFieldBanned(true);
        setAdminRescueCodeInput(""); // Xóa text trong ô nhập ngay khi bị ban thẳng tay
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // NẾU ĐANG BỊ KHÓA: Chặn không cho gọi hàm submit đăng nhập thông thường
    if (lockCountdown > 0) return;

    setTouched({
      email: true,
      password: true,
      captcha: showCaptcha ? true : false,
    });

    if (errors && Object.keys(errors).length > 0) return;
    if (showCaptcha && !userCaptchaInput.trim()) return;

    setServerError("");

    const result = authService.login(
      form.email,
      form.password,
      userCaptchaInput,
      captchaCode,
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setServerError(result.message);

      if (result.isDeviceLocked) {
        setLockCountdown(result.remainingTime);
        // Khi bị khóa, giữ trạng thái hiển thị Captcha để tránh nhảy layout
      } else if (result.triggerCaptcha) {
        setShowCaptcha(true);
        generateNewCaptcha();
        setUserCaptchaInput("");
      }
    }
  };

  return (
    <div className="relative min-h-screen pt-20 max-sm:pt-24">
      <AuthNav theme={theme} toggleTheme={toggleTheme} />
      <AuthCard
        title="Sign In"
        subtitle={
          lockCountdown > 0
            ? `Please wait... (${lockCountdown}s)`
            : "Welcome back!"
        }
      >
        {/* Alert Warning Box */}
        {serverError && (
          <div
            className={`mb-5 rounded-lg border px-4 py-3 text-center text-sm transition-all duration-300 ${
              lockCountdown > 0
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400 font-medium"
                : showCaptcha
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400 font-medium" // Display warm alert when captcha shield is active
                  : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <FormField
            label="Email Address"
            htmlFor="email"
            error={errors.email}
            touched={touched.email}
          >
            <TextInput
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              onBlur={touch("email")}
              placeholder="Enter your email..."
              disabled={lockCountdown > 0}
              hasError={!!showError("email")}
            />
          </FormField>

          {/* Password */}
          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password}
            touched={touched.password}
          >
            <PasswordInput
              id="password"
              value={form.password}
              onChange={set("password")}
              onBlur={touch("password")}
              placeholder="Enter your password..."
              disabled={lockCountdown > 0}
              hasError={!!showError("password")}
            />
          </FormField>

          {/* ── Anti-bot Captcha Component ── */}
          <CaptchaField
            showCaptcha={showCaptcha}
            captchaCode={captchaCode}
            userCaptchaInput={userCaptchaInput}
            setUserCaptchaInput={setUserCaptchaInput}
            onRefreshCaptcha={generateNewCaptcha}
            isTouched={!!touched.captcha}
            serverError={serverError}
          />

          {/* ── Emergency Rescue Component ── */}
          <RescueField
            lockCountdown={lockCountdown}
            isRescueFieldBanned={isRescueFieldBanned}
            adminRescueCodeInput={adminRescueCodeInput}
            setAdminRescueCodeInput={setAdminRescueCodeInput}
            rescueError={rescueError}
            onAdminUnlock={handleAdminUnlock}
            rescueSuccessCountdown={rescueSuccessCountdown}
            remainingRescueAttempts={remainingRescueAttempts}
          />

          <button
            type="submit"
            id="signin-submit-btn"
            disabled={lockCountdown > 0 || rescueSuccessCountdown > 0}
            className={`w-full py-4 rounded-xl mt-2 text-base font-bold tracking-wide transition-all duration-300 ${
              lockCountdown > 0 || rescueSuccessCountdown > 0
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none translate-y-0"
                : "bg-gradient-to-r from-[#f9b2d7] to-[#f6ffdc] shadow-[0_4px_15px_rgba(249,178,215,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(249,178,215,0.4)] active:translate-y-0 " +
                  "text-[#b94d8e] dark:text-zinc-900" // Light mode: Chữ hồng đậm sắc nét | Dark mode: Chữ đen mun nổi bật
            }`}
          >
            {rescueSuccessCountdown > 0
              ? `Reloading Form (${rescueSuccessCountdown}s)...`
              : lockCountdown > 0
                ? `Form Locked (${lockCountdown}s)`
                : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => lockCountdown === 0 && navigate("/signup")}
            className={`font-semibold transition-colors duration-200 ${
              lockCountdown > 0
                ? "text-zinc-600 dark:text-zinc-500 cursor-not-allowed"
                : "cursor-pointer " +
                  /* Light Mode: Mặc định hồng đậm (#c172a0) , Hover hóa hồng nhạt (#f9b2d7) */
                  "text-[#c172a0] hover:text-[#f9b2d7] " +
                  /* Dark Mode: Giữ nguyên gốc -> Mặc định hồng nhạt, Hover hóa vàng kem */
                  "dark:text-[#f9b2d7] dark:hover:text-[#f6ffdc]"
            }`}
          >
            Sign up now
          </span>
        </p>
      </AuthCard>
    </div>
  );
}
