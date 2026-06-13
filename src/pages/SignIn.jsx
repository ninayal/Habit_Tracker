import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";
import { validateSignIn } from "../utils/authValidation";
import AuthCard from "../components/auth/AuthCard";
import FormField from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import TextInput from "../components/ui/TextInput";
import "./styles/SignIn.css";

export default function SignIn() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");

  // Thêm || {} để nếu hàm trả về rỗng thì vẫn không bị sập ứng dụng
  const errors = validateSignIn(form) || {};
  const showError = (field) => touched[field] && errors[field];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    setTouched({ email: true, password: true });

    // Kiểm tra an toàn trước khi đọc Keys
    if (errors && Object.keys(errors).length > 0) return;

    const success = authService.login(form.email, form.password);
    if (success) {
      navigate("/dashboard");
    } else {
      setServerError("Invalid email or password. Please try again!");
    }
  };

  return (
    <AuthCard title="Sign In" subtitle="Welcome back!">
      {/* Server error banner */}
      {serverError && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Email ── */}
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
            autoComplete="email"
            hasError={!!showError("email")}
          />
        </FormField>

        {/* ── Password ── */}
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
            autoComplete="current-password"
            hasError={!!showError("password")}
          />
        </FormField>

        {/* ── Submit ── */}
        <button
          type="submit"
          id="signin-submit-btn"
          className="w-full py-4 rounded-xl mt-2 text-base font-bold tracking-wide text-zinc-900 bg-gradient-to-r from-[#f9b2d7] to-[#f6ffdc] shadow-[0_4px_15px_rgba(249,178,215,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(249,178,215,0.4)] active:translate-y-0"
        >
          Sign In
        </button>
      </form>

      {/* ── Redirect to Sign Up ── */}
      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <span
          onClick={() => navigate("/signup")}
          className="font-semibold text-[#f9b2d7] hover:text-[#f6ffdc] cursor-pointer transition-colors"
        >
          Sign up now
        </span>
      </p>
    </AuthCard>
  );
}
