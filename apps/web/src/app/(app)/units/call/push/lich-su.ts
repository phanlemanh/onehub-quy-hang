/**
 * Lịch sử trả giá của chế độ ép giá (hàng 29, AC-2): dãy sự kiện của hồ sơ → các dòng giá và nấc, mới nhất trên. Mỗi lần
 * đổi giá so với giá NGAY TRƯỚC nó; lần đặt giá đầu không thành dòng riêng (dòng «Lên bảng» mang giá lúc ấy). Thuần.
 */
import type { ListingEvent } from "@quy-hang/core/listing";
import { vietGia, type FeeInclusion } from "@quy-hang/core/pricing";
import { nhanVai } from "@/lib/vai";
import { NHAN_PHI } from "../gia";

export type DongLichSu = { viec: string; phi: string | null; xacNhan: boolean; luc: string; ai: string };
export type LichSuTraGia = { kind: "dang-tai" } | { kind: "co"; dong: DongLichSu[] };

/** Lý do Ngừng hẳn trong dòng lịch sử — cùng chữ với ba lối của «Đã cọc / bán…». */
const LY_DO_NGUNG: Record<string, string> = { sold_elsewhere: "chủ bán nơi khác", owner_changed_mind: "chủ đổi ý", unreachable: "không liên lạc được" };

const ai = (e: ListingEvent) => (e.actorRoles[0] ? nhanVai(e.actorRoles[0]) : "—");

export function lichSuTraGia(lichSu: readonly ListingEvent[] | null | undefined): LichSuTraGia {
  if (!lichSu) return { kind: "dang-tai" };
  const dong: DongLichSu[] = [];
  let gia: number | null = null;
  let phi: FeeInclusion | null = null;
  let daLenBang = false;
  const them = (e: ListingEvent, viec: string, p: FeeInclusion | null = null) =>
    dong.push({ viec, phi: p ? NHAN_PHI[p] : null, xacNhan: e.confirmedWithOwner, luc: e.occurredAt, ai: ai(e) });
  for (const e of [...lichSu].sort((a, b) => a.seq - b.seq)) {
    const p = e.payload;
    if (e.type === "created") them(e, "Tạo hồ sơ");
    else if (e.type === "owner_confirmed") them(e, "Còn · giữ giá");
    else if (e.type === "price_changed") {
      const moi = p.listPrice as number;
      const moiPhi = p.feeInclusion as FeeInclusion;
      if (gia !== null && phi !== null) {
        if (moi < gia) them(e, `Hạ ${vietGia(gia)} → ${vietGia(moi)}`, moiPhi);
        else if (moi > gia) them(e, `Tăng ${vietGia(gia)} → ${vietGia(moi)}`, moiPhi);
        else if (moiPhi !== phi) them(e, `Đổi điều kiện phí: ${NHAN_PHI[phi]} → ${NHAN_PHI[moiPhi]}`);
      }
      gia = moi;
      phi = moiPhi;
    } else if (e.type === "status_changed") {
      const to = p.to as string;
      if (to === "Active") them(e, daLenBang ? "Đang bán lại" : gia === null ? "Lên bảng" : `Lên bảng ${vietGia(gia)}`, phi);
      else if (to === "Pending") them(e, "Đã cọc");
      else if (to === "Closed") them(e, typeof p.closePrice === "number" ? `Đã bán ${vietGia(p.closePrice)}` : "Đã bán");
      else if (to === "Withdrawn") them(e, `Ngừng hẳn — ${LY_DO_NGUNG[p.withdrawnReason as string] ?? "không rõ lý do"}`);
      else if (to === "Hold") them(e, "Tạm ngừng");
      if (to === "Active") daLenBang = true;
    }
  }
  return { kind: "co", dong: dong.reverse() };
}
