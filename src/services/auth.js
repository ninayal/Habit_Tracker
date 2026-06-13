import { storage } from "@/utils/storage";
import { mockUsers } from "../mockData";

export const authService = {
  login: (email, password) => {
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

    if (matchedUser) {
      // Bóc tách password ra để không lưu password vào localStorage vì lý do bảo mật
      const { password: _, ...safeUserInfo } = matchedUser;

      // Lưu toàn bộ thông tin an toàn (gồm cả id, fullName, email, image, createdAt...)
      storage.set("current_user", safeUserInfo);
      return true;
    }
    return false;
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
      return { success: false, error: "This email is already registered. Please sign in instead." };
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
