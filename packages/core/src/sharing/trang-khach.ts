// Trang khách `/s/<mã>` (hàng 35): tên sự kiện của Lần gửi và thân trang khách. Thân dựng CHỈ từ bản ra `banRaNgoai`
// (bất biến 4) — route công khai của API và bài rò rỉ của nó gọi cùng hàm này.
import { tuVungRaNgoai, type TuVung } from "../labels";
import { banRaNgoai, CAU_HINH_MAC_DINH, truongRa, type CanNoiBo, type CanRaNgoai, type CauHinhRa, type NguoiNhan } from "../redaction";
import type { ShareAudience } from "./index";

/** Tên sự kiện của Lần gửi — cột `share_events.type` (migration 031); số đo `customer_link_opens`, `customer_interest` đọc theo. */
export const SU_KIEN_LAN_GUI = { mo: "link_opened", quanTam: "interest" } as const;
export type SuKienLanGui = (typeof SU_KIEN_LAN_GUI)[keyof typeof SU_KIEN_LAN_GUI];

/** Người nhận của luật ẩn theo người nhận của Lần gửi. */
export const nguoiNhanCua = (audience: ShareAudience): NguoiNhan => (audience === "client" ? "khach_rieng" : "nhom_moi_gioi");

/** `tuVung` — cách gọi riêng của sàn gửi, chỉ phần theo khoá ra của người nhận (hàng 45, `tuVungRaNgoai`). */
export type ThanTrangKhach = { companyName: string; senderName: string; nguoiNhan: NguoiNhan; can: CanRaNgoai[]; tuVung: TuVung };

/**
 * Thân trả của route đọc công khai: tên sàn, người gửi, người nhận, và bản ra của từng căn theo đúng thứ tự gửi. Tên sàn
 * và người gửi lấy từ căn đầu (mọi căn của một Lần gửi chung sàn, chung người gửi).
 */
export function thanTrangKhach(o: {
  can: readonly CanNoiBo[];
  audience: ShareAudience;
  today: string;
  cauHinh?: CauHinhRa;
  /** Từ vựng đủ của sàn gửi; lõi cắt về phần ra ngoài. */
  tuVung?: TuVung;
}): ThanTrangKhach {
  const nguoiNhan = nguoiNhanCua(o.audience);
  return {
    companyName: o.can[0]?.companyName ?? "",
    senderName: o.can[0]?.senderName ?? "",
    nguoiNhan,
    can: o.can.map((c) => banRaNgoai(c, { cua: "gui_link", nguoiNhan, cauHinh: o.cauHinh, today: o.today })),
    tuVung: tuVungRaNgoai(o.tuVung, truongRa(nguoiNhan, o.cauHinh ?? CAU_HINH_MAC_DINH)),
  };
}
