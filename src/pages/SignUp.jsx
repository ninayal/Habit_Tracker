import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import { validateSignUp } from "@/utils/authValidation";
import AuthCard from "@/components/auth/AuthCard";
import FormField from "@/components/ui/FormField";
import PasswordInput from "@/components/ui/PasswordInput";
import TextInput from "@/components/ui/TextInput";
import { useTheme } from "../hooks/useTheme";
import AuthNav from "../components/auth/AuthNav";

export default function SignUp() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  /* ── Form state ── */
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  /* ── UI state ── */
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");

  /* ── Helpers ── */
  const errors = validateSignUp(form);
  const showError = (field) => touched[field] && errors[field];

  const set = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  /* ── Submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");

    // Touch tất cả fields
    const allFields = {
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    };
    setTouched(allFields);

    if (Object.keys(errors).length > 0) return;

    const result = authService.register(
      form.fullName,
      form.email,
      form.password,
    );
    if (result.success) {
      navigate("/dashboard");
    } else {
      setServerError(result.error);
    }
  };

  /* ── Render ── */
  return (
    <div className="relative min-h-screen pt-20 max-sm:pt-24">
      <AuthNav theme={theme} toggleTheme={toggleTheme} />
      <AuthCard
        title="Create Account"
        subtitle="Start building better habits today"
      >
        {/* Server error banner */}
        {serverError && (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Full Name ── */}
          <FormField
            label="Full Name"
            htmlFor="fullName"
            error={errors.fullName}
            touched={touched.fullName}
          >
            <TextInput
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={set("fullName")}
              onBlur={touch("fullName")}
              placeholder="Enter your full name..."
              autoComplete="name"
              hasError={!!showError("fullName")}
            />
          </FormField>

          {/* ── Email ── */}
          <FormField
            label="Email Address"
            htmlFor="signup-email"
            error={errors.email}
            touched={touched.email}
          >
            <TextInput
              id="signup-email"
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
            htmlFor="signup-password"
            error={errors.password}
            touched={touched.password}
          >
            <PasswordInput
              id="signup-password"
              value={form.password}
              onChange={set("password")}
              onBlur={touch("password")}
              placeholder="Create a password..."
              autoComplete="new-password"
              hasError={!!showError("password")}
              showStrengthBar
            />
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Password must achieve at least "Good" strength (8+ chars and
              contain uppercase, number, or special character).
            </p>
          </FormField>

          {/* ── Confirm Password ── */}
          <FormField
            label="Confirm Password"
            htmlFor="confirm-password"
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
          >
            <PasswordInput
              id="confirm-password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              onBlur={touch("confirmPassword")}
              placeholder="Re-enter your password..."
              autoComplete="new-password"
              hasError={!!showError("confirmPassword")}
            />
          </FormField>

          {/* ── Terms & Conditions ── */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="agree-terms"
                type="checkbox"
                checked={form.agreedToTerms}
                onChange={(e) => {
                  set("agreedToTerms")(e);
                  setTouched((prev) => ({ ...prev, terms: true }));
                }}
                className="mt-0.5 w-4 h-4 accent-[#f9b2d7] shrink-0 cursor-pointer"
              />
              <span className="text-sm text-zinc-400 leading-relaxed">
                I agree to the{" "}
                <span
                  className="font-semibold text-[#c172a0] hover:text-[#f9b2d7] 
                  dark:text-[#f9b2d7] dark:hover:text-[#f6ffdc] transition-colors cursor-pointer"
                >
                  Terms of Service
                </span>{" "}
                and{" "}
                <span
                  className="font-semibold text-[#c172a0] hover:text-[#f9b2d7] 
                  dark:text-[#f9b2d7] dark:hover:text-[#f6ffdc] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </span>
              </span>
            </label>

            {touched.terms && errors.terms && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
                {errors.terms}
              </p>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            id="signup-submit-btn"
            className="w-full py-4 rounded-xl text-base font-bold tracking-wide text-[#b94d8e] dark:text-zinc-900 bg-gradient-to-r from-[#f9b2d7] to-[#f6ffdc] shadow-[0_4px_15px_rgba(249,178,215,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(249,178,215,0.4)] active:translate-y-0 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            Create Account
          </button>
        </form>

        {/* ── Redirect to Sign In ── */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="font-semibold 
                  text-[#c172a0] hover:text-[#f9b2d7] 
                  dark:text-[#f9b2d7] dark:hover:text-[#f6ffdc] cursor-pointer transition-colors"
          >
            Sign in
          </span>
        </p>
      </AuthCard>
    </div>
  );
}
