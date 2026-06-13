import { Navigate, Outlet } from "react-router";
import { authService } from "@/services/auth";

/**
 * AuthRoute — route guard cho 2 trường hợp:
 *
 * requireAuth=true  (default): trang yêu cầu đăng nhập.
 *   → Chưa login  → redirect /signin
 *   → Đã login    → render bình thường
 *
 * requireAuth=false: trang chỉ dành cho guest (signin, signup).
 *   → Đã login    → redirect /dashboard (không cần vào lại)
 *   → Chưa login  → render bình thường
 */
export default function AuthRoute({ requireAuth = true }) {
    const isLoggedIn = !!authService.getCurrentUser();

    if (!requireAuth && isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    if (requireAuth && !isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
}