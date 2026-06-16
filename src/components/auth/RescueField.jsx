import FormField from "../ui/FormField";
import TextInput from "../ui/TextInput";

/**
 * RescueField Component
 * Hiển thị ô nhập mã giải cứu khẩn cấp từ Admin khi thiết bị bị khóa cứng.
 * Giới hạn tối đa 5 lần nhập sai mã giải cứu.
 */
export default function RescueField({
  lockCountdown,
  isRescueFieldBanned,
  adminRescueCodeInput,
  setAdminRescueCodeInput,
  rescueError,
  onAdminUnlock,
  rescueSuccessCountdown, // Nhận thời gian đếm ngược thành công từ cha
}) {
  // Nếu thiết bị không bị khóa, không hiển thị gì cả
  if (lockCountdown <= 0) return null;

  return (
    <div className="mb-5 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.02] transition-all">
      {rescueSuccessCountdown > 0 ? (
        // ── FLOW: KHI NHẬP ĐÚNG MÃ GIẢI CỨU ──
        <div className="text-center py-3 animate-fadeIn">
          <span className="text-sm text-emerald-400 font-bold block mb-1">
            ✅ Admin Rescue Code Verified!
          </span>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            The emergency bypass key is correct. The login interface will
            automatically reload and clean up in{" "}
            <span className="text-emerald-400 font-semibold">
              {rescueSuccessCountdown}s
            </span>
            ...
          </p>
        </div>
      ) : isRescueFieldBanned ? (
        // ── FLOW: KHI GÕ SAI QUÁ 5 LẦN ──
        <div className="text-center py-2 animate-fadeIn">
          <span className="text-xs text-red-400 font-medium block mb-1">
            🔒 Bypass Feature Temporarily Disabled
          </span>
          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Too many incorrect rescue attempts. Admin authority access is
            revoked for this cycle. You must wait out the countdown timer on the
            button.
          </p>
        </div>
      ) : (
        // ── FLOW: GIAO DIỆN NHẬP MÃ THÔNG THƯỜNG ──
        <FormField
          label="Emergency Recovery Bypass"
          htmlFor="rescueCode"
          error={rescueError}
          touched={!!rescueError}
          className="mb-0"
        >
          <p className="text-xs text-zinc-500 mb-3 leading-relaxed normal-case">
            This device is restricted. You can wait out the countdown timer on
            the button or ask your Administrator for an emergency rescue key to
            unlock immediately.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <TextInput
                id="rescueCode"
                value={adminRescueCodeInput}
                onChange={(e) => setAdminRescueCodeInput(e.target.value)}
                placeholder="Enter Admin Bypass Key..."
                autoComplete="off"
                hasError={!!rescueError}
              />
            </div>

            <button
              type="button"
              onClick={onAdminUnlock}
              className="px-5 py-3.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-[10px] transition-all duration-200 active:scale-95 shrink-0 h-[48px] flex items-center justify-center"
            >
              Apply Key
            </button>
          </div>
        </FormField>
      )}
    </div>
  );
}
