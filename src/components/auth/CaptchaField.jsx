import FormField from "../ui/FormField";
import TextInput from "../ui/TextInput";

export default function CaptchaField({
  showCaptcha,
  captchaCode,
  userCaptchaInput,
  setUserCaptchaInput,
  onRefreshCaptcha,
  isTouched, // Nhận trạng thái touched từ form cha
  serverError,
}) {
  if (!showCaptcha) return null;

  // Tính toán lỗi Client-side: Nếu đã bấm submit (isTouched) mà ô nhập vẫn rỗng
  const captchaError = !userCaptchaInput.trim() ? "Captcha is required" : "";

  // Xác định xem input có hiển thị viền đỏ hay không (Lỗi rỗng từ client hoặc lỗi nhập sai mã từ server)
  const hasError = !!(
    (isTouched && captchaError) ||
    serverError?.includes("CAPTCHA")
  );

  return (
    <FormField
      label="Anti-Bot Verification"
      htmlFor="captchaInput"
      error={captchaError}
      touched={isTouched}
      className="mb-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
    >
      <div className="flex items-center gap-3">
        {/* Hộp hiển thị chuỗi mã CAPTCHA ngẫu nhiên */}
        <div
          onClick={onRefreshCaptcha}
          className="bg-zinc-800 text-[#f9b2d7] px-4 py-3 rounded-lg font-mono font-bold tracking-widest text-lg select-none cursor-pointer line-through decoration-zinc-500/50 shadow-inner hover:bg-zinc-700 transition-colors"
          title="Click to refresh captcha code"
        >
          {captchaCode}
        </div>

        {/* Ô nhập mã của người dùng */}
        <div className="flex-1">
          <TextInput
            id="captchaInput"
            value={userCaptchaInput}
            onChange={(e) => setUserCaptchaInput(e.target.value)}
            placeholder="Type code..."
            autoComplete="off"
            hasError={hasError}
          />
        </div>
      </div>

      {/* Dòng chữ hướng dẫn đổi mã bằng tiếng Anh */}
      <span className="text-[11px] text-zinc-500 block mt-1 italic pl-1">
        Can&apos;t read the code? Click the code block to change a new one.
      </span>
    </FormField>
  );
}
