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
