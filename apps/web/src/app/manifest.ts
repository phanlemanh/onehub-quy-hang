import type { MetadataRoute } from "next";

// Manifest của web (hàng 26, ADR-0025): cài lên màn hình chính — iPhone chỉ nhận thông báo lead khi web đã cài. Mở thẳng
// Hôm nay; biểu tượng ở public/icons. Không khai màu — trình duyệt lấy màu nền của trang.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quỹ hàng",
    short_name: "Quỹ hàng",
    description: "Quản lý hàng cho sàn môi giới bất động sản",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
