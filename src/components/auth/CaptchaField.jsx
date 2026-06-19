import { useEffect, useRef } from "react";
import FormField from "../ui/FormField";
import TextInput from "../ui/TextInput";

export default function CaptchaField({
  showCaptcha,
  captchaCode,
  userCaptchaInput,
  setUserCaptchaInput,
  onRefreshCaptcha,
  isTouched,
  serverError,
  disabled,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!showCaptcha || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Vẽ nhiễu (vài đường kẻ ngẫu nhiên)
    ctx.strokeStyle = "#f9b2d7";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 120, Math.random() * 40);
      ctx.lineTo(Math.random() * 120, Math.random() * 40);
      ctx.stroke();
    }

    // 2. Vẽ ký tự với hiệu ứng xoay và làm mờ
    ctx.font = "bold 24px monospace";
    ctx.fillStyle = "#f9b2d7";
    ctx.textBaseline = "middle";

    captchaCode.split("").forEach((char, i) => {
      ctx.save();
      ctx.translate(20 + i * 25, 20);
      ctx.rotate((Math.random() - 0.5) * 0.4); // Xoay nhẹ +/- 0.2 rad
      ctx.filter = "blur(0.5px)"; // Làm mờ nhẹ
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }, [captchaCode, showCaptcha]);

  if (!showCaptcha) return null;

  // Tính toán lỗi để truyền vào FormField
  const captchaError = !userCaptchaInput.trim() ? "Captcha is required" : "";
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
      disabled={disabled}
      className="mb-4 p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]"
    >
      <div className="flex items-center gap-3">
        <canvas
          ref={canvasRef}
          width="120"
          height="40"
          onClick={() => !disabled && onRefreshCaptcha()}
          className={`bg-white dark:bg-zinc-800 border rounded-lg cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        {/* Ô nhập mã của người dùng */}
        <div className="flex-1">
          <TextInput
            id="captchaInput"
            value={userCaptchaInput}
            onChange={(e) => setUserCaptchaInput(e.target.value)}
            placeholder="Type code..."
            autoComplete="off"
            hasError={hasError}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Dòng chữ hướng dẫn đổi mã */}
      <span className="text-[11px] text-zinc-500 block mt-1 italic pl-1 leading-tight">
        Input is case-sensitive. Can't read? Click code to refresh.
      </span>
    </FormField>
  );
}
