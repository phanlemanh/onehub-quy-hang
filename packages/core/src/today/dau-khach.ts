// Hôm nay của đầu khách (hàng 37): dựng tin từ sự kiện đã lọc — khách phản ứng, căn đã gửi vừa đổi, căn mới khớp bộ đã gửi.
// Ngưỡng và cửa sổ là mặc định dựng sẵn (Hỏi-2, Hỏi-3) — sàn chỉnh khi có Cài đặt sàn; ba loại tin giữ cứng ở bản đầu
// (Hỏi-4, lý do nền tảng: loại sinh từ sự kiện lõi), nhãn ở một chỗ có tên để sổ từ vựng ghi đè sau. Không đọc đồng hồ.
import { LUAT_GOI_Y, vuaDoi, type SuKienDoi, type VuaDoi } from "../sharing/goi-y";

export const CUA_SO_NGAY = 7;
/** Giờ Việt Nam lệch UTC (không có giờ mùa hè). */
export const LECH_GIO_VN = 7;

export type KieuTin = "reaction" | "changed" | "new_match";
export const NHAN_TIN: Readonly<Record<KieuTin, string>> = { reaction: "Khách phản ứng", changed: "Vừa đổi", new_match: "Căn mới" };

export type LanGuiNho = { id: string; recipient: string };
export type CanNho = { id: string; name: string };

export type TinDauKhach =
  | { kind: "reaction"; at: string; day: string; share: LanGuiNho; opens: number; interested: CanNho[] }
  | { kind: "changed"; at: string; day: string; share: LanGuiNho; listing: CanNho; changed: Exclude<VuaDoi, null> }
  | { kind: "new_match"; at: string; day: string; shares: LanGuiNho[]; listing: CanNho; listPrice: number | null };

export type CanTrongBo = CanNho & { buildingName: string; bedroomsTotal: number | null; giaLucGui: number | null; suSau: SuKienDoi[]; suSauAt: string | null };
export type VaoDungTin = {
  shares: { id: string; recipient: string; createdAt: string; disabledAt: string | null; listings: CanTrongBo[] }[];
  events: { shareId: string; type: "link_opened" | "interest"; listingId: string | null; createdAt: string }[];
  activeSau: (CanNho & { buildingName: string; bedroomsTotal: number | null; listPrice: number | null; activeAt: string })[];
};

/** Ngày giờ Việt Nam (YYYY-MM-DD) của một mốc ISO. */
export function ngayVN(iso: string): string {
  return new Date(Date.parse(iso) + LECH_GIO_VN * 3_600_000).toISOString().slice(0, 10);
}

/**
 * Căn ứng viên khớp bộ đã gửi khi khớp MỘT căn trong bộ: cùng toà, cùng số phòng ngủ, giá trong ±15% giá lúc gửi của căn ấy.
 * Căn trong bộ không có giá lúc gửi hay số phòng ngủ không làm gốc khớp; căn đã có trong bộ không khớp.
 */
export function khopBoDaGui(
  ung: { id: string; buildingName: string; bedroomsTotal: number | null; listPrice: number | null },
  bo: readonly { id: string; buildingName: string; bedroomsTotal: number | null; gia: number | null }[],
  daTrongBo: ReadonlySet<string>,
  luat = LUAT_GOI_Y,
): boolean {
  if (daTrongBo.has(ung.id) || ung.listPrice == null || ung.bedroomsTotal == null) return false;
  const gia = ung.listPrice;
  return bo.some((g) => g.gia != null && g.bedroomsTotal === ung.bedroomsTotal && g.buildingName === ung.buildingName && Math.abs(gia - g.gia) <= g.gia * luat.lechGia);
}

/** Tin của vùng, mới trước; bỏ tin cũ hơn `CUA_SO_NGAY` ngày tính từ `bay`. Link đã tắt chỉ còn tin phản ứng. */
export function dungTin(vao: VaoDungTin, bay: Date): TinDauKhach[] {
  const tu = bay.getTime() - CUA_SO_NGAY * 86_400_000;
  const trong = (iso: string) => Date.parse(iso) >= tu;
  const ra: TinDauKhach[] = [];
  const theoId = new Map(vao.shares.map((s) => [s.id, s]));

  const gom = new Map<string, { shareId: string; day: string; at: string; opens: number; thich: Set<string> }>();
  for (const e of vao.events) {
    if (!trong(e.createdAt) || !theoId.has(e.shareId)) continue;
    const day = ngayVN(e.createdAt);
    const k = `${e.shareId}|${day}`;
    const g = gom.get(k) ?? { shareId: e.shareId, day, at: e.createdAt, opens: 0, thich: new Set<string>() };
    if (Date.parse(e.createdAt) > Date.parse(g.at)) g.at = e.createdAt;
    if (e.type === "link_opened") g.opens++;
    else if (e.listingId) g.thich.add(e.listingId);
    gom.set(k, g);
  }
  for (const g of gom.values()) {
    const s = theoId.get(g.shareId)!;
    const interested = s.listings.filter((l) => g.thich.has(l.id)).map(({ id, name }) => ({ id, name }));
    ra.push({ kind: "reaction", at: g.at, day: g.day, share: { id: s.id, recipient: s.recipient }, opens: g.opens, interested });
  }

  const mo = vao.shares.filter((s) => s.disabledAt == null);
  for (const s of mo)
    for (const l of s.listings) {
      const changed = vuaDoi(l.giaLucGui, l.suSau);
      if (changed && l.suSauAt && trong(l.suSauAt))
        ra.push({ kind: "changed", at: l.suSauAt, day: ngayVN(l.suSauAt), share: { id: s.id, recipient: s.recipient }, listing: { id: l.id, name: l.name }, changed });
    }

  for (const c of vao.activeSau) {
    if (!trong(c.activeAt)) continue;
    const khop = mo.filter(
      (s) =>
        Date.parse(c.activeAt) > Date.parse(s.createdAt) &&
        khopBoDaGui(c, s.listings.map((l) => ({ id: l.id, buildingName: l.buildingName, bedroomsTotal: l.bedroomsTotal, gia: l.giaLucGui })), new Set(s.listings.map((l) => l.id))),
    );
    if (khop.length)
      ra.push({ kind: "new_match", at: c.activeAt, day: ngayVN(c.activeAt), shares: [...khop].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)).map((s) => ({ id: s.id, recipient: s.recipient })), listing: { id: c.id, name: c.name }, listPrice: c.listPrice });
  }

  return ra.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
