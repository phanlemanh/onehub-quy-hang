/**
 * Số đo trên sự kiện của hàng (hàng 52): xác nhận trong N ngày, mức đủ cao nhất, mã căn tự điền, căn gọi điều chỉnh giá
 * đợt hai. Không chép luật nào: gấp bằng `foldListing`/`stepListing`, tươi bằng `freshness`, đủ bằng `completeness`, tra mã
 * bằng `lookupUnit`, nhóm bằng `nhomCuaCan` của Hôm nay — số đo không lệch màn.
 */
import { buildCatalogIndex, lookupUnit } from "../catalog/lookup";
import type { CatalogData } from "../catalog/types";
import { OPEN_STATUSES } from "../dedupe";
import { completeness } from "../listing/completeness";
import type { ListingEvent } from "../listing/events";
import { foldListing, stepListing, type ListingState } from "../listing/fold";
import { freshness } from "../listing/freshness";
import type { StandardStatus } from "../listing/status";
import { nhomCuaCan } from "../today/hang-doi";
import type { DuKienCan, LanDoi } from "../today/kieu";
import { boMacDinh, QUEUE_DEFAULT_DAYS } from "../today/mac-dinh";
import type { GiaTriSoDo, HangVao, LeadVao, TuMau } from "./kieu";

export type Ky = { tu: number; den: number };

export const trongKy = (ky: Ky, iso: string) => {
  const t = Date.parse(iso);
  return t >= ky.tu && t < ky.den;
};
const truocDen = (ky: Ky, iso: string) => Date.parse(iso) < ky.den;
const theoSeq = (ds: readonly ListingEvent[]) => [...ds].sort((a, b) => a.seq - b.seq);

export const phanTram = (tu: number, mau: number) => (mau === 0 ? null : Math.round((tu / mau) * 1000) / 10);

/** Trạng thái của hàng tại `den`: gấp các sự kiện trước `den`; hàng tạo từ `den` trở đi là `null`. */
export function trangThaiTaiDen(h: HangVao, ky: Ky): ListingState | null {
  const ds = theoSeq(h.events).filter((e) => truocDen(ky, e.occurredAt));
  return ds.length && ds[0]!.type === "created" ? foldListing(ds) : null;
}

const MO = new Set<StandardStatus>(OPEN_STATUSES);

/** Tỉ lệ trên hàng mở tại `den` (chưa Đã bán, chưa Ngừng bán), kèm tử và mẫu theo trạng thái. */
function tiLeHangMo(states: readonly ListingState[], dat: (s: ListingState) => boolean): GiaTriSoDo {
  const theoTrangThai: Partial<Record<StandardStatus, TuMau>> = {};
  let tu = 0;
  let mau = 0;
  for (const s of states) {
    if (!MO.has(s.standardStatus)) continue;
    const o = (theoTrangThai[s.standardStatus] ??= { tu: 0, mau: 0 });
    mau++;
    o.mau++;
    if (dat(s)) {
      tu++;
      o.tu++;
    }
  }
  return { kieu: "ti-le", tu, mau, phanTram: phanTram(tu, mau), theoTrangThai, chiTiet: {} };
}

/** Ngày lịch UTC của `den` — `freshness` tính tuổi theo ngày lịch UTC. */
const ngayCuaDen = (ky: Ky) => new Date(ky.den).toISOString().slice(0, 10);

/** Căn đã xác nhận trong N ngày: tuổi xác nhận nhỏ hơn N — N = 14 đúng ranh «Cần gọi lại» của `freshness`. */
export function xacNhanTrongNNgay(states: readonly ListingState[], ky: Ky, n: number): GiaTriSoDo {
  const homNay = ngayCuaDen(ky);
  return tiLeHangMo(states, (s) => {
    const f = freshness(s.lastConfirmedAt, homNay);
    return f.confirmed && f.ageDays < n;
  });
}

export function mucDuCaoNhat(states: readonly ListingState[]): GiaTriSoDo {
  return tiLeHangMo(states, (s) => {
    const c = completeness(s);
    return c.filled === c.total;
  });
}

/**
 * Mã căn gõ trong kỳ ở hai cửa — tạo hàng (lúc tạo, lúc gắn mã sau) và ô nhận lead — tra ra đúng một căn. «Nhiều căn» là
 * hụt, đếm riêng (hàng 63 Hỏi-2); tra không kèm toà, như ô nhận lead tra trước khi bảo «chọn toà».
 */
export function maCanTuDien(hang: readonly HangVao[], lead: readonly LeadVao[], danhMuc: CatalogData, ky: Ky): GiaTriSoDo {
  const index = buildCatalogIndex(danhMuc);
  const chiTiet: Record<string, number> = { found: 0, ambiguous: 0, not_in_catalog: 0, unreadable: 0 };
  let mau = 0;
  const tra = (ma: string) => {
    mau++;
    const kq = lookupUnit(index, ma);
    chiTiet[kq.status] = (chiTiet[kq.status] ?? 0) + 1;
  };
  for (const h of hang) {
    for (const e of h.events) {
      if (!trongKy(ky, e.occurredAt)) continue;
      const ma = e.type === "created" || e.type === "unit_number_assigned" ? (e.payload.unitNumber as string | undefined) : undefined;
      if (ma !== undefined) tra(ma);
    }
  }
  for (const l of lead) if (l.unitNumber !== null && trongKy(ky, l.createdAt)) tra(l.unitNumber);
  const tu = chiTiet.found!;
  return { kieu: "ti-le", tu, mau, phanTram: phanTram(tu, mau), theoTrangThai: {}, chiTiet };
}

const lanDoi = (e: ListingEvent, from: unknown, to: unknown): LanDoi => ({ at: e.occurredAt, byUserId: e.actorUserId, byRoles: e.actorRoles, from, to });

/**
 * Số căn gọi điều chỉnh giá đợt hai (đường đo của hồ sơ goi-ep-gia-dot-hai): căn có `price_changed` hay `owner_confirmed`
 * ghi trong kỳ lúc căn — trạng thái ngay trước sự kiện — ở nhóm `price_adjustment` của bộ mặc định. Người giữ căn là người
 * ghi. Đếm căn, không đếm lần.
 */
export function goiDieuChinhGia(hang: readonly HangVao[], ky: Ky, nguong: number = QUEUE_DEFAULT_DAYS.priceAdjustment): GiaTriSoDo {
  const bo = boMacDinh({ priceAdjustment: nguong, callBack: QUEUE_DEFAULT_DAYS.callBack });
  let so = 0;
  for (const h of hang) {
    let s: ListingState | null = null;
    let lastPriceChange: LanDoi | null = null;
    let lastStatusChange: LanDoi | null = null;
    let dem = false;
    for (const e of theoSeq(h.events)) {
      if (!truocDen(ky, e.occurredAt)) break;
      if (s && !dem && (e.type === "price_changed" || e.type === "owner_confirmed") && trongKy(ky, e.occurredAt)) {
        const can: DuKienCan = {
          standardStatus: s.standardStatus,
          listAgentKey: e.actorUserId,
          lastConfirmedAt: s.lastConfirmedAt,
          priceChangeTimestamp: lastPriceChange?.at ?? null,
          lastPriceChange,
          lastStatusChange,
          missing: completeness(s).missing,
          propertySubType: null,
        };
        dem = nhomCuaCan(bo, can, e.actorUserId, e.occurredAt)?.code === "price_adjustment";
      }
      if (e.type === "price_changed") lastPriceChange = lanDoi(e, s?.listPrice ?? null, e.payload.listPrice);
      if (e.type === "status_changed") lastStatusChange = lanDoi(e, s?.standardStatus ?? "Incomplete", e.payload.to);
      s = s ? stepListing(s, e) : foldListing([e]);
    }
    if (dem) so++;
  }
  return { kieu: "dem", so, chiTiet: {} };
}
