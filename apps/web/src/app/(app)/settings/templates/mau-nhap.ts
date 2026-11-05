// Phần thuần của màn Mẫu nhập (hàng 50 mau-nhap-va-bai): kiểu trả từ `/api/v1/company/import-templates`, chữ trên màn,
// luật ô Quy đổi, luật hộp sửa theo kết quả lưu, và chuyển bản sửa thành thân gửi máy chủ.
import { FIELD_LABEL, FIELD_TRANSFORM, isStandardField, TRUONG_CACH_GOI, type PlanTarget, type Transform } from "@quy-hang/core/import";

export type CotMauNhap = {
  headerKey: string;
  target: string;
  transform?: Transform;
  valueMap?: Record<string, string>;
  nguon: { kieu: "lan-nhap"; importId: string; at: string } | { kieu: "sua"; editedBy: string | null; at: string };
};
export type TrangThaiMau = { kieu: "dang-tai" } | { kieu: "loi" } | { kieu: "xong"; ds: CotMauNhap[] };

export const CHU = {
  tieuDe: "Mẫu nhập",
  moTa: "Cách sàn ghép các cột Excel đã gặp — lần nhập sau dùng bản ở đây",
  dangTai: "Đang tải mẫu",
  trong: "Chưa có mẫu nào — mẫu tự nhớ sau lần nhập Excel đầu tiên của sàn.",
  loi: "Chưa tải được mẫu — thử lại",
  thuLai: "Thử lại",
  cotTieuDe: "Tiêu đề trong file",
  cotTruong: "Ghép vào",
  cotQuyDoi: "Quy đổi",
  cotNguon: "Nguồn",
  sua: "Sửa",
  xoa: "Xoá",
  luu: "Lưu",
  huy: "Huỷ",
  quyDoiMoTa: "Mỗi dòng: chữ trong file → giá trị chuẩn",
  boQuyDoi: "Trường này không có quy đổi — quy đổi cũ sẽ bỏ khi lưu.",
  luuLoiMang: "Chưa lưu được — thử lại",
  xoaHoi: (h: string) => `Lần nhập sau, cột «${h}» sẽ ghép lại từ đầu.`,
  nguonLanNhap: (ngay: string) => `Lần nhập ${ngay}`,
  nguonSua: (ten: string | null, ngay: string) => `Sửa bởi ${ten ?? "quản trị"} · ${ngay}`,
} as const;

const NHAN_KHAC: Record<string, string> = { keep_as_note: "Giữ làm ghi chú", ignore_with_reason: "Bỏ cột" };
export const nhanTruong = (t: string): string => (isStandardField(t) ? FIELD_LABEL[t] : (NHAN_KHAC[t] ?? (t.startsWith("custom:") ? `Trường riêng ${t.slice(7)}` : t)));

/** Ô Quy đổi chỉ có ở trường giá trị đóng (cùng luật bộ nhớ hàng 67 và ràng buộc của bảng 045). */
export const coQuyDoi = (t: string): boolean => isStandardField(t) && TRUONG_CACH_GOI.includes(t);

const ngay = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
export const nhanNguon = (c: CotMauNhap): string => (c.nguon.kieu === "sua" ? CHU.nguonSua(c.nguon.editedBy, ngay(c.nguon.at)) : CHU.nguonLanNhap(ngay(c.nguon.at)));

/** Quy đổi ↔ chữ nhiều dòng «a → b». */
export const quyDoiThanhChu = (m?: Record<string, string>): string => Object.entries(m ?? {}).map(([a, b]) => `${a} → ${b}`).join("\n");
export function chuThanhQuyDoi(s: string): Record<string, string> | undefined {
  const m: Record<string, string> = {};
  for (const dong of s.split("\n")) {
    const [a, b] = dong.split("→").map((x) => x.trim());
    if (a && b) m[a] = b;
  }
  return Object.keys(m).length ? m : undefined;
}

/** Thân gửi máy chủ: đích mới; phép biến đổi giữ khi đích không đổi, đổi đích trường chuẩn thì lấy phép mặc định của trường. */
export function thanSua(cu: CotMauNhap, target: string, quyDoi: string): { target: string; transform?: Transform; valueMap?: Record<string, string> } {
  const than: { target: string; transform?: Transform; valueMap?: Record<string, string> } = { target };
  if (target === cu.target && cu.transform) than.transform = cu.transform;
  else if (isStandardField(target)) than.transform = FIELD_TRANSFORM[target];
  if (coQuyDoi(target)) {
    const m = chuThanhQuyDoi(quyDoi);
    if (m) than.valueMap = m;
  }
  return than;
}

/** Hộp sửa sau khi lưu: 200 đóng; 400 giữ mở với lý do máy chủ; còn lại (mạng, 5xx) giữ mở với câu thử lại. */
export function sauKhiLuu(kq: { status: number; reason?: string } | null): { dong: true } | { dong: false; loi: string } {
  if (kq && kq.status >= 200 && kq.status < 300) return { dong: true };
  if (kq && kq.status === 400) return { dong: false, loi: kq.reason ?? CHU.luuLoiMang };
  return { dong: false, loi: CHU.luuLoiMang };
}

export const TRUONG_CHON: readonly PlanTarget[] = [...(Object.keys(FIELD_LABEL) as PlanTarget[]), "keep_as_note", "ignore_with_reason"];

