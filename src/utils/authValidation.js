/**
 * Validation utilities cho Sign In / Sign Up.
 * Pure functions — không phụ thuộc React hay UI.
 */

/** Tính độ mạnh mật khẩu: 0–4 */
export function getPasswordStrength(pw) {
  if (!pw) return 0;
  
  let mixCount = 0;
  if (/[A-Z]/.test(pw)) mixCount++;
  if (/[0-9]/.test(pw)) mixCount++;
  if (/[^A-Za-z0-9]/.test(pw)) mixCount++;

  if (pw.length < 8) {
    // Under 8 characters: max score is 2 (Fair)
    return mixCount >= 1 ? 2 : 1;
  }

  // Length is at least 8 characters
  if (mixCount === 3) return 4; // Strong
  if (mixCount >= 1) return 3;  // Good (mix 1-2)
  return 2;                    // Fair (mix 0)
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
  } else {
    const strength = getPasswordStrength(password);
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    } else if (strength <= 2) {
      errors.password = "Password must include at least one uppercase letter, number, or special character.";
    }
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
