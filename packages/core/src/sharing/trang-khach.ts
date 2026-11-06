// Trang khách `/s/<mã>` (hàng 35): tên sự kiện của Lần gửi và thân trang khách. Thân dựng CHỈ từ bản ra `banRaNgoai`
// (bất biến 4) — route công khai của API và bài rò rỉ của nó gọi cùng hàm này.
import { tuVungRaNgoai, type TuVung } from "../labels";
import { banRaNgoai, CAU_HINH_MAC_DINH, truongRa, type CanNoiBo, type CanRaNgoai, type CauHinhRa, type NguoiNhan } from "../redaction";
import type { ShareAudience } from "./index";
import { phanMoiGioi, type CauHinhTrangMoiGioi, type LuuTrenLanGui, type PhanMoiGioi } from "./trang-moi-gioi";

/** Tên sự kiện của Lần gửi — cột `share_events.type` (migration 031); số đo `customer_link_opens`, `customer_interest` đọc theo. */
export const SU_KIEN_LAN_GUI = { mo: "link_opened", quanTam: "interest" } as const;
export type SuKienLanGui = (typeof SU_KIEN_LAN_GUI)[keyof typeof SU_KIEN_LAN_GUI];

/** Người nhận của luật ẩn theo người nhận của Lần gửi. */
export const nguoiNhanCua = (audience: ShareAudience): NguoiNhan => (audience === "client" ? "khach_rieng" : "nhom_moi_gioi");

/** `tuVung` — cách gọi riêng của sàn gửi, chỉ phần theo khoá ra của người nhận (hàng 45, `tuVungRaNgoai`). */
export type ThanTrangKhach = { companyName: string; senderName: string; nguoiNhan: NguoiNhan; can: CanRaNgoai[]; tuVung: TuVung } & Partial<PhanMoiGioi>;

/** Cấu hình trang môi giới khi chưa đọc được cấu hình sàn: định nghĩa phí mặc định, không ẩn mức chia. */
export const CAU_HINH_MOI_GIOI_MAC_DINH: CauHinhTrangMoiGioi = { anMucChia: false, feeInclusion: ["personalIncomeTax", "registrationFee", "brokerageFee"] };

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
  /** Hàng 44: điều Lần gửi mang lúc gửi (mức chia, định nghĩa phí) — chỉ người nhận nhóm môi giới dùng. */
  luuTrenLanGui?: LuuTrenLanGui;
  /** Hàng 44: cấu hình hiện tại của sàn gửi cho trang môi giới. */
  cauHinhMoiGioi?: CauHinhTrangMoiGioi;
}): ThanTrangKhach {
  const nguoiNhan = nguoiNhanCua(o.audience);
  const cauHinh = o.cauHinh ?? CAU_HINH_MAC_DINH;
  const can = o.can.map((c) => banRaNgoai(c, { cua: "gui_link", nguoiNhan, cauHinh, today: o.today }));
  const tuVung = tuVungRaNgoai(o.tuVung, truongRa(nguoiNhan, cauHinh));
  const than: ThanTrangKhach = { companyName: o.can[0]?.companyName ?? "", senderName: o.can[0]?.senderName ?? "", nguoiNhan, can, tuVung };
  if (nguoiNhan !== "nhom_moi_gioi") return than;
  return {
    ...than,
    ...phanMoiGioi({
      ban: can,
      cauHinhRa: cauHinh,
      tuVung,
      luu: o.luuTrenLanGui ?? { mucChia: null, feeInclusion: null },
      san: o.cauHinhMoiGioi ?? CAU_HINH_MOI_GIOI_MAC_DINH,
    }),
  };
}
