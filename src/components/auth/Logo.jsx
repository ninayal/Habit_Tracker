import { useNavigate } from "react-router-dom";

/**
 * Component Logo "1Percent." chuẩn nhận diện thương hiệu nguyên bản.
 * Đã tích hợp hiệu ứng mạch đập (lp-pulse) cho dấu chấm.
 */
export default function Logo() {
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ <a>
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <>
      {/* Định nghĩa Keyframes trực tiếp */}
      <style>{`
        @keyframes lp-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.6);
            opacity: 0.5;
          }
        }
      `}</style>

      <a
        href="/"
        onClick={handleLogoClick}
        className="inline-flex items-center gap-[8px] font-['Instrument_Serif'] text-[1.4rem] no-underline select-none pointer-events-auto"
        style={{ color: "#18181b" }} // Màu --ink nguyên bản của logo cố định
      >
        {/* Chữ thương hiệu cố định màu hồng đậm #b94d8e theo CSS gốc */}
        <span className="text-[#b94d8e]">1Percent</span>

        {/* Dấu chấm tròn thương hiệu chuyển động mạch đập */}
        <span
          className="rounded-full bg-[#f9b2d7]"
          style={{
            width: "8px",
            height: "8px",
            animation: "lp-pulse 2.4s ease-in-out infinite", // Gắn animation vào đây
          }}
        />
      </a>
    </>
  );
}
