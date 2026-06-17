import { useNavigate } from "react-router-dom";

/**
 * Component Logo "1Percent." chuẩn nhận diện thương hiệu nguyên bản.
 * Giữ nguyên cấu trúc CSS & Animation của Landing page, không bị thay đổi theo Light/Dark mode.
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
    <a
      href="/"
      onClick={handleLogoClick}
      // Khôi phục chính xác cấu trúc style của class .lp-nav-logo, pointer-events-auto giúp click tốt trong div header
      className="inline-flex items-center gap-2 font-['Instrument_Serif'] text-[1.4rem] font-medium tracking-tight no-underline select-none pointer-events-auto"
      style={{ color: "#18181b" }} // Màu --ink nguyên bản của logo cố định
    >
      {/* Chữ thương hiệu cố định màu hồng đậm #b94d8e theo CSS gốc */}
      <span className="text-[#b94d8e]">1Percent</span>

      {/* Dấu chấm tròn thương hiệu chuyển động mạch đập */}
      <span
        className="rounded-full bg-[#f9b2d7] animate-[pulse_2.4s_ease-in-out_infinite]"
        style={{ width: "8px", height: "8px" }}
      />
    </a>
  );
}
