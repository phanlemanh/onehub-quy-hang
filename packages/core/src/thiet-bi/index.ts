/**
 * Loại máy của một phiên đăng nhập (hàng 38, tab Tôi): suy từ chuỗi userAgent mà phiên ghi lúc đăng nhập — dùng chung cho
 * danh sách máy của API và dòng «Máy này» của màn. iPad báo mình là Mac nên máy chủ thấy «máy tính»; màn sửa dòng «Máy
 * này» bằng số điểm chạm của trình duyệt.
 */
export type LoaiMay = "iphone" | "android" | "may-tinh" | "khac";

export const NHAN_LOAI_MAY: Readonly<Record<LoaiMay, string>> = {
  iphone: "iPhone",
  android: "Android",
  "may-tinh": "Máy tính",
  khac: "Máy khác",
};

export function loaiMay(userAgent: string | null | undefined): LoaiMay {
  const ua = userAgent ?? "";
  if (/iPhone|iPad|iPod/.test(ua)) return "iphone";
  if (/Android/.test(ua)) return "android";
  if (/Macintosh|Windows NT|X11; (Linux|CrOS)|CrOS/.test(ua)) return "may-tinh";
  return "khac";
}

/** Tên trình duyệt ngắn cho dòng máy; không nhận ra thì rỗng. Thứ tự xét: Edge, Chrome trên iOS, Chrome, Firefox, Safari. */
export function trinhDuyet(userAgent: string | null | undefined): string {
  const ua = userAgent ?? "";
  if (/Edg\//.test(ua)) return "Edge";
  if (/CriOS\//.test(ua)) return "Chrome";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\/|FxiOS\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "";
}
