import { storage } from "@/utils/storage";
import { mockUsers, securityConfigMock } from "../mockData";

// Cấu hình hằng số bảo mật
const CAPTCHA_THRESHOLD = 3; // Sai 3 lần xuất hiện CAPTCHA
const INITIAL_MAX_ATTEMPTS = 8; // Vòng đầu tiên: Có tối đa 8 lần thử
const REPEAT_MAX_ATTEMPTS = 3; // Các vòng sau (đã từng bị block): Chỉ có 3 lần thử
const BASE_LOCKOUT_TIME = 30 * 1000; // Thời gian phạt cơ sở: 30 giây

export const authService = {
  // ── METHOD: XỬ LÝ ĐĂNG NHẬP ──
  login: (email, password, userCaptcha, serverCaptcha) => {
    const globalAttemptsKey = `login_global_attempts`;
    const globalLockKey = `login_global_lock_until`;
    const lockoutMultiplierKey = `login_lockout_multiplier`; // Lưu số lần thiết bị đã từng bị block

    // 1. Kiểm tra trạng thái đóng băng thiết bị
    const globalLock = storage.get(globalLockKey, null);
    if (globalLock && Date.now() < parseInt(globalLock)) {
      const remainingTime = Math.ceil(
        (parseInt(globalLock) - Date.now()) / 1000,
      );
      return {
        success: false,
        isDeviceLocked: true,
        remainingTime: remainingTime,
        triggerCaptcha: false,
        message: `Too many suspicious requests from this device. Access blocked for ${remainingTime}s.`,
      };
    }

    const globalAttempts = parseInt(storage.get(globalAttemptsKey, 0));
    const currentMultiplier = parseInt(storage.get(lockoutMultiplierKey, 0));

    // ĐỘNG: Xác định xem tổng số lần thử tối đa ở chu kỳ này là bao nhiêu
    // Nếu chưa từng bị block (multiplier = 0) -> Cho 8 lần. Nếu đã từng bị block -> Cho 3 lần.
    const maxAllowedAttempts =
      currentMultiplier === 0 ? INITIAL_MAX_ATTEMPTS : REPEAT_MAX_ATTEMPTS;
    const isCaptchaRequired = globalAttempts >= CAPTCHA_THRESHOLD;

    // 2. Nếu thiết bị đang trong trạng thái phải check CAPTCHA (Từ lần sai thứ 3)
    if (isCaptchaRequired) {
      if (userCaptcha.toLowerCase() !== serverCaptcha?.toLowerCase()) {
        let newAttempts = globalAttempts + 1;
        storage.set(globalAttemptsKey, newAttempts);

        // Kiểm tra xem đã chạm ngưỡng khóa của chu kỳ này chưa
        if (newAttempts >= maxAllowedAttempts) {
          const penaltyTime =
            BASE_LOCKOUT_TIME * Math.pow(2, currentMultiplier);

          storage.set(globalLockKey, Date.now() + penaltyTime);
          storage.set(globalAttemptsKey, 0); // Reset bộ đếm lần thử cho chu kỳ kế tiếp
          storage.set(lockoutMultiplierKey, currentMultiplier + 1); // Tăng bậc phạt

          return {
            success: false,
            isDeviceLocked: true,
            remainingTime: penaltyTime / 1000,
            triggerCaptcha: false,
            message: `Suspicious flooding detected! This browser access has been temporarily restricted for ${penaltyTime / 1000}s.`,
          };
        }

        // TÍNH TOÁN CẢNH BÁO: Chỉ hiển thị số lần còn lại khi số lần còn lại < 3
        const attemptsLeft = maxAllowedAttempts - newAttempts;
        const msg =
          attemptsLeft < 3
            ? `Incorrect CAPTCHA verification code! (${attemptsLeft} attempts left before lockout).`
            : `Incorrect CAPTCHA verification code! Please try again.`;

        return {
          success: false,
          isDeviceLocked: false,
          triggerCaptcha: true,
          message: msg,
        };
      }
    }

    // Kiểm tra tài khoản trong Database Mock
    const registeredUsers = storage.get("users", []);
    const allUsers = [...registeredUsers, ...mockUsers];

    let matchedUser = allUsers.find(
      (user) => user.email === email && user.password === password,
    );

    if (!matchedUser && email === "admin@gmail.com" && password === "123456") {
      matchedUser = {
        id: 0,
        fullName: "Default Admin",
        email: "admin@gmail.com",
        image: "https://randomuser.me/api/portraits/men/99.jpg",
        createdAt: new Date().toISOString(),
      };
    }

    // ── CASE A: ĐĂNG NHẬP THÀNH CÔNG ──
    if (matchedUser) {
      storage.remove(globalAttemptsKey);
      storage.remove(globalLockKey);
      storage.remove(lockoutMultiplierKey);
      storage.remove(`login_rescue_attempts`);
      // Reset hoàn toàn trạng thái phạt về ban đầu

      const { password: _, ...safeUserInfo } = matchedUser;
      storage.set("current_user", safeUserInfo);
      return { success: true };
    }

    // ── CASE B: ĐĂNG NHẬP THẤT BẠI (SAI MẬT KHẨU/EMAIL) ──
    let newAttempts = globalAttempts + 1;
    storage.set(globalAttemptsKey, newAttempts);

    // Kiểm tra chạm ngưỡng khóa của chu kỳ
    if (newAttempts >= maxAllowedAttempts) {
      const penaltyTime = BASE_LOCKOUT_TIME * Math.pow(2, currentMultiplier);

      storage.set(globalLockKey, Date.now() + penaltyTime);
      storage.set(globalAttemptsKey, 0);
      storage.set(lockoutMultiplierKey, currentMultiplier + 1);

      return {
        success: false,
        isDeviceLocked: true,
        remainingTime: penaltyTime / 1000,
        triggerCaptcha: false,
        message: `Suspicious flooding detected! This browser access has been temporarily restricted for ${penaltyTime / 1000}s.`,
      };
    }

    const shouldNowTriggerCaptcha = newAttempts >= CAPTCHA_THRESHOLD;
    const attemptsLeft = maxAllowedAttempts - newAttempts;

    // Chỉ hiển thị số lần còn lại khi số lần còn lại <= 3 (Còn từ 3 lần thử xuống dưới)
    let finalMessage = `Invalid credentials. Please check your email or password.`;
    if (attemptsLeft <= 3) {
      finalMessage = shouldNowTriggerCaptcha
        ? `Incorrect credentials. CAPTCHA activated! (${attemptsLeft} attempts left before lockout).`
        : `Invalid credentials. You have ${attemptsLeft} attempts left.`;
    } else if (shouldNowTriggerCaptcha) {
      finalMessage = `Incorrect credentials. CAPTCHA security test triggered.`;
    }

    return {
      success: false,
      isDeviceLocked: false,
      triggerCaptcha: shouldNowTriggerCaptcha,
      message: finalMessage,
    };
  },

  // ── METHOD: KIỂM TRA TRẠNG THÁI TĨNH KHI RE-LOAD TRANG ──
  checkSecurityStatus: () => {
    const globalLockKey = `login_global_lock_until`;
    const globalAttemptsKey = `login_global_attempts`;
    const lockoutMultiplierKey = `login_lockout_multiplier`;

    const globalLock = storage.get(globalLockKey, null);
    if (globalLock && Date.now() < parseInt(globalLock)) {
      const remainingTime = Math.ceil(
        (parseInt(globalLock) - Date.now()) / 1000,
      );
      return {
        isDeviceLocked: true,
        remainingTime: remainingTime,
        triggerCaptcha: false,
        message: `Suspicious flooding detected! This browser access has been temporarily restricted for ${remainingTime}s.`,
      };
    }

    const globalAttempts = parseInt(storage.get(globalAttemptsKey, 0));
    const currentMultiplier = parseInt(storage.get(lockoutMultiplierKey, 0));
    const maxAllowedAttempts =
      currentMultiplier === 0 ? INITIAL_MAX_ATTEMPTS : REPEAT_MAX_ATTEMPTS;

    const triggerCaptcha = globalAttempts >= CAPTCHA_THRESHOLD;
    const attemptsLeft = maxAllowedAttempts - globalAttempts;

    let message = "";
    if (globalAttempts > 0) {
      if (attemptsLeft < 3) {
        message = triggerCaptcha
          ? `Security verification required. (${attemptsLeft} attempts left before lockout).`
          : `Invalid credentials. You have ${attemptsLeft} attempts left.`;
      } else {
        message = triggerCaptcha
          ? "Security verification required. Please enter the CAPTCHA code."
          : "";
      }
    }

    return { isDeviceLocked: false, remainingTime: 0, triggerCaptcha, message };
  },

  // ── METHOD: MỞ KHÓA KHẨN CẤP QUA MÃ ADMIN (CÓ GIỚI HẠN 5 LẦN SAI) ──
  unlockDeviceByAdminCode: (code) => {
    const rescueAttemptsKey = `login_rescue_attempts`;
    const maxRescueAttempts = 5;

    const currentRescueAttempts = parseInt(storage.get(rescueAttemptsKey, 0));

    if (currentRescueAttempts >= maxRescueAttempts) {
      return {
        success: false,
        isRescueBanned: true,
        message:
          "Too many failed recovery attempts! Bypass feature disabled. You must wait for the countdown timer.",
      };
    }

    const validRescueCode = securityConfigMock?.adminRescueCode;

    if (code.trim() === validRescueCode) {
      storage.remove(`login_global_attempts`);
      storage.remove(`login_global_lock_until`);
      storage.remove(`login_lockout_multiplier`);
      storage.remove(rescueAttemptsKey);

      // Thêm lệnh return để ngắt hàm ngay lập tức khi thành công!
      return {
        success: true,
        message: "Device successfully unlocked!",
      };
    }

    // Nếu code chạy xuống đây, tức là mã nhập bị SAI
    const newRescueAttempts = currentRescueAttempts + 1;
    storage.set(rescueAttemptsKey, newRescueAttempts);

    if (newRescueAttempts >= maxRescueAttempts) {
      return {
        success: false,
        isRescueBanned: true,
        message:
          "Maximum recovery attempts reached! Admin bypass locked. Please wait out the remaining time.",
      };
    }

    return {
      success: false,
      isRescueBanned: false,
      message: `Invalid Admin Rescue Code. Emergency bypass denied (${maxRescueAttempts - newRescueAttempts} attempts left).`,
    };
  },

  /**
   * Hàm xử lý Đăng ký (Sign Up)
   * @returns {{ success: boolean, error?: string }}
   */
  register: (fullName, email, password) => {
    // Kiểm tra email đã tồn tại chưa (cả mock lẫn đã đăng ký trong localStorage)
    const registeredUsers = storage.get("users", []);
    const allUsers = [...registeredUsers, ...mockUsers];

    const emailExists = allUsers.some(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (emailExists) {
      return {
        success: false,
        error: "This email is already registered. Please sign in instead.",
      };
    }

    // Tạo ID mới tăng dần
    const maxId = allUsers.reduce((max, u) => Math.max(max, u.id ?? 0), 0);

    const newUser = {
      id: maxId + 1,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Lưu user mới vào localStorage (key "users")
    storage.set("users", [...registeredUsers, newUser]);

    // Tự động đăng nhập sau khi đăng ký
    const { password: _, ...safeUserInfo } = newUser;
    storage.set("current_user", safeUserInfo);

    return { success: true };
  },

  /**
   * Hàm xử lý Đăng xuất (Sign Out)
   */
  logout: () => {
    storage.remove("current_user");
  },

  /**
   * Hàm lấy thông tin người dùng hiện tại
   */
  getCurrentUser: () => {
    return storage.get("current_user", null);
  },
};
