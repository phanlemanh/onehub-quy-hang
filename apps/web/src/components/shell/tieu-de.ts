import { type Home, HOME_LABEL } from "@quy-hang/core";

// Tiêu đề thanh trên của vỏ điện thoại (`MobileHeader`). Tách khỏi app-shell.tsx để kiểm bằng node --test (hàng
// va-tieu-de-goi). Vỏ máy tính không đọc tiêu đề này — đầu màn do `DauMan` của từng trang dựng.

const PAGE_TITLE: Record<string, string> = {
  "/me": "Tôi",
  "/leads/new": "Lead",
  "/imports/new": "Nhập Excel",
  "/exports/new": "Xuất bảng hàng",
  "/viewings": "Lịch xem",
};

// Chế độ cuộc gọi và trang quay số nằm dưới /units/call nhưng không phải một căn; chữ khớp nhãn nút mở chế độ cuộc gọi
// (Hỏi-8 của hàng 29).
const CUOC_GOI = "Ghi cuộc gọi";

/** Mã căn từ đoạn đường; mã phần trăm hỏng giữ nguyên chuỗi thô thay vì ném lỗi làm sập vỏ. */
function giaiMa(doan: string): string {
  try {
    return decodeURIComponent(doan);
  } catch {
    return doan;
  }
}

export function titleOf(pathname: string, home: Home | null): string {
  if (/^\/units\/call(\/|$)/.test(pathname)) return CUOC_GOI;
  const unit = /^\/units\/([^/]+)/.exec(pathname);
  if (unit) return `Căn ${giaiMa(unit[1] ?? "")}`;
  if (PAGE_TITLE[pathname]) return PAGE_TITLE[pathname];
  if (home === "shares") return "Gửi";
  return home ? HOME_LABEL[home] : "Quỹ hàng";
}
