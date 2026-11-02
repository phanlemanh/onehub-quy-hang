/**
 * Chế độ và đầu màn của chế độ cuộc gọi (hàng 29). Một trang hai chế độ: `?lead=` mở khai thác (hàng 28), `?hang=` mở ép giá.
 * Đầu màn ép giá đọc từ kho trên máy: căn, nấc, giá kèm điều kiện phí, số ngày lên bảng và từ lần đổi giá gần nhất. Thuần.
 */
import type { ListingEvent } from "@quy-hang/core/listing";
import { vietGia, type FeeInclusion } from "@quy-hang/core/pricing";
import type { ListingView } from "@/lib/sync/types";
import { STATUS_LABEL } from "../../../inventory/cot";
import { NHAN_PHI } from "../gia";

const LA_MA = /^[0-9a-f-]{36}$/i;
const NGAY_MS = 86_400_000;

export type CheDo = { kind: "khai-thac"; leadId: string } | { kind: "ep-gia"; hangId: string } | { kind: "vang" };

/** `?lead=` thắng `?hang=`; mã sai khuôn là vắng. */
export function docCheDo(sp: { lead?: string | null; hang?: string | null }): CheDo {
  if (sp.lead && LA_MA.test(sp.lead)) return { kind: "khai-thac", leadId: sp.lead };
  if (sp.hang && LA_MA.test(sp.hang)) return { kind: "ep-gia", hangId: sp.hang };
  return { kind: "vang" };
}

/** Hồ sơ đang gọi trong danh sách trên máy; không có là vắng. */
export function timHoSo(ds: readonly ListingView[], id: string): ListingView | null {
  return ds.find((l) => l.id === id) ?? null;
}

const soNgay = (tu: string, bayGio: Date) => Math.max(0, Math.floor((bayGio.getTime() - Date.parse(tu)) / NGAY_MS));

/** Lần lên Đang bán đầu tiên và lần đổi giá gần nhất (giá trước đó đã có) trong lịch sử. */
export function mocGia(lichSu: readonly ListingEvent[]): { lenBang: string | null; doiGia: string | null } {
  let lenBang: string | null = null;
  let doiGia: string | null = null;
  let coGia = false;
  for (const e of [...lichSu].sort((a, b) => a.seq - b.seq)) {
    if (e.type === "status_changed" && e.payload.to === "Active" && lenBang === null) lenBang = e.occurredAt;
    if (e.type === "price_changed") {
      if (coGia) doiGia = e.occurredAt;
      coGia = true;
    }
  }
  return { lenBang, doiGia };
}

export type DauMan = { tieuDe: string; nac: string; gia: string; phu: string };

export function dauMan(can: ListingView, lichSu: readonly ListingEvent[] | null, bayGio: Date): DauMan {
  const tieuDe = `${can.unitNumber ?? "Chỉ biết toà"} · ${can.buildingName}`;
  const gia = can.listPrice !== null && can.feeInclusion ? `${vietGia(can.listPrice)} · ${NHAN_PHI[can.feeInclusion as FeeInclusion]}` : "Chưa có giá";
  // Lịch sử chưa kéo về: dùng mốc của bản trên máy (lần đổi trạng thái, đổi giá gần nhất).
  const moc = lichSu ? mocGia(lichSu) : { lenBang: can.statusChangeTimestamp ?? null, doiGia: can.priceChangeTimestamp ?? null };
  const lenBang = moc.lenBang ? `Lên bảng ${soNgay(moc.lenBang, bayGio)} ngày` : "Chưa lên bảng";
  const doiGia = moc.doiGia ? `đổi giá gần nhất ${soNgay(moc.doiGia, bayGio)} ngày trước` : "chưa đổi giá lần nào";
  return { tieuDe, nac: STATUS_LABEL[can.standardStatus], gia, phu: `${lenBang} · ${doiGia}` };
}
