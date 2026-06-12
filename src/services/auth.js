import { storage } from "@/utils/storage";

export const authService = {
  /**
   * Hàm xử lý Đăng nhập (Sign In)
   */
  login: (email, password) => {
    const users = storage.get("users", []);

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password,
    );

    if (matchedUser) {
      storage.set("current_user", {
        id: matchedUser.id,
        name: matchedUser.fullName,
        email: matchedUser.email,
      });
      return true;
    }
    return false;
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
