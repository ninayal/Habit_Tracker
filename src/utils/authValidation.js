/**
 * Validation utilities cho Sign In / Sign Up.
 * Pure functions — không phụ thuộc React hay UI.
 */

/** Tính độ mạnh mật khẩu: 0–4 */
export function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export const PASSWORD_STRENGTH_META = [
  { label: "", color: "text-zinc-500", bar: "bg-zinc-700" }, // 0 empty
  { label: "Weak", color: "text-red-400", bar: "bg-red-400" }, // 1
  { label: "Fair", color: "text-orange-400", bar: "bg-orange-400" }, // 2
  { label: "Good", color: "text-sky-400", bar: "bg-sky-400" }, // 3
  { label: "Strong", color: "text-green-400", bar: "bg-green-400" }, // 4
];

/** Validate Sign Up form fields.
 * @returns {Record<string, string>} object có key là tên field, value là error string
 */
export function validateSignUp({
  fullName,
  email,
  password,
  confirmPassword,
  agreedToTerms,
}) {
  const errors = {};

  if (!fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!agreedToTerms) {
    errors.terms = "You must agree to the terms to continue.";
  }

  return errors;
}

/** Validate Sign In form fields. */
export function validateSignIn({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}
