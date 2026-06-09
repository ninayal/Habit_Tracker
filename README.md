# Habit Tracker - Capstone Project

Ứng dụng theo dõi thói quen (habit tracker) được xây dựng bằng React và Vite. Dự án dùng mock data để khởi tạo dữ liệu mẫu và lưu trữ trạng thái người dùng bằng `localStorage`.

## 🚀 Cài đặt và chạy dự án

1. Cài dependencies:

```bash
npm install
```

2. Chạy chế độ phát triển:

```bash
npm run dev
```


## 📁 Cấu trúc thư mục chính

- `index.html` - file HTML gốc của Vite.
- `package.json` - cấu hình package, script và dependencies.
- `vite.config.js` - cấu hình Vite.
- `src/` - mã nguồn chính của ứng dụng.

### Thư mục `src/`

- `main.jsx` - điểm vào của ứng dụng.
- `App.jsx` - cấu hình route và layout chung.
- `index.css` - style toàn cục.
- `mockData.js` - dữ liệu mẫu ban đầu cho người dùng, thói quen, check-in và goals.
- `assets/` - chứa hình ảnh hoặc tài nguyên tĩnh nếu cần.
- `components/` - component dùng lại trong ứng dụng.
- `context/` - nơi đặt state management hoặc context (nếu có).
- `hooks/` - custom hooks.
- `lib/` - chứa các helper chung.
- `pages/` - các màn hình chính của app.
  - `Dashboard.jsx` - trang tổng quan.
  - `HabitsList.jsx` - danh sách thói quen.
  - `Landing.jsx` - trang landing.
  - `SignIn.jsx` - đăng nhập.
  - `SignUp.jsx` - đăng ký.
- `services/` - mô phỏng service hoặc API nội bộ.
  - `auth.js` - logic đăng nhập/đăng ký.
  - `habits.js` - logic lấy/sửa thói quen.
- `utils/` - helper cho dữ liệu và lưu trữ.
  - `initializeData.js` - khởi tạo dữ liệu từ mock khi lần đầu chạy.
  - `storage.js` - đọc/ghi dữ liệu vào `localStorage`.

## 🧠 Cơ chế mock data và lưu dữ liệu

### `src/mockData.js`

Tệp này chứa dữ liệu mẫu ban đầu gồm:

- `users` - danh sách người dùng demo.
- `habits` - thói quen mẫu của từng người dùng.
- `checkins` - trạng thái check-in (nếu dự án dùng).
- `goals` - mục tiêu nếu cần lưu.

### `src/utils/storage.js`

`storage.js` đóng gói việc tương tác với `localStorage`:

- `get(key, defaultValue)` - đọc dữ liệu, parse JSON.
- `set(key, value)` - lưu dữ liệu thành JSON.
- `remove(key)` - xóa key.
- `clear()` - xóa toàn bộ `localStorage`.

### `src/utils/initializeData.js`

Khi ứng dụng khởi động, `initializeData()` kiểm tra nếu `localStorage` vẫn chưa có:

- `users`
- `habits`
- `checkins`
- `goals`

Nếu chưa có, nó sẽ khởi tạo bằng `mockData` và lưu vào `localStorage`.

> Điều này giúp mỗi lần mở ứng dụng lần đầu sẽ có dữ liệu mẫu. Sau đó, mọi thay đổi của người dùng sẽ được giữ lại trong `localStorage` và không mất khi refresh trang.

### Các key lưu trữ trong localStorage

- `users`
- `habits`
- `checkins`
- `goals`
- `current_user` - dùng để lưu người dùng đang đăng nhập.

## 🔧 Luồng hoạt động chính

1. Người dùng truy cập app.
2. App gọi `initializeData()` để tạo dữ liệu mẫu nếu cần.
3. Người dùng đăng nhập/đăng ký qua `SignIn` / `SignUp`.
4. Dữ liệu thói quen (`habits`) được lấy từ `localStorage` và hiển thị.
5. Khi người dùng sửa, tạo hoặc xóa thói quen, ứng dụng lưu lại vào `localStorage`.

## 📝 Ghi chú

- Nếu muốn reset/sửa dữ liệu trực tiếp trên file mockData , hãy xóa `localStorage` trên trình duyệt hoặc gọi `storage.clear()` trong code.
- Ứng dụng hiện tại dùng mock data, chưa kết nối backend thật.
- Dễ mở rộng sang REST API nếu sau này muốn lưu dữ liệu trên server.

---

Chúc bạn phát triển app hiệu quả! Nếu cần, mình có thể bổ sung thêm phần mô tả chi tiết từng page hoặc luồng đăng nhập.
