// «Gợi ý căn thay» và «vừa đổi» của Đã gửi (hàng 36: AC-3, AC-4). Luật gợi ý là mặc định dựng sẵn (Hỏi-3) — sàn chỉnh khi có
// Cài đặt sàn; đặt ở một chỗ có tên để đổi một nơi.
import type { StandardStatus } from "../listing/status";

export const LUAT_GOI_Y = { toiDa: 3, lechGia: 0.15 } as const;

export type CanSoSanh = { id: string; buildingName: string; bedroomsTotal: number | null; listPrice: number | null; standardStatus: StandardStatus };

/**
 * Tối đa ba căn Đang bán, chưa có trong link, cùng số phòng ngủ, giá trong ±15% giá gửi của căn gốc; cùng toà trước, rồi chênh
 * giá nhỏ nhất. Căn gốc thiếu giá hay số phòng ngủ thì không gợi ý.
 */
export function goiYCanThay(goc: CanSoSanh, ungVien: readonly CanSoSanh[], daTrongLink: ReadonlySet<string>, luat = LUAT_GOI_Y): string[] {
  const gia = goc.listPrice;
  if (gia == null || goc.bedroomsTotal == null) return [];
  return ungVien
    .filter(
      (c) =>
        c.id !== goc.id &&
        !daTrongLink.has(c.id) &&
        c.standardStatus === "Active" &&
        c.bedroomsTotal === goc.bedroomsTotal &&
        c.listPrice != null &&
        Math.abs(c.listPrice - gia) <= gia * luat.lechGia,
    )
    .sort((a, b) => Number(b.buildingName === goc.buildingName) - Number(a.buildingName === goc.buildingName) || Math.abs(a.listPrice! - gia) - Math.abs(b.listPrice! - gia))
    .slice(0, luat.toiDa)
    .map((c) => c.id);
}

export type VuaDoi = { price: { from: number | null; to: number | null } } | { status: { to: StandardStatus } } | null;
export type SuKienDoi = { type: string; payload: Record<string, unknown> };

/**
 * Căn «vừa đổi» từ các sự kiện của nó SAU lúc gửi (đã lọc ở bên đọc): đổi trạng thái thắng đổi giá; chỉ `status_changed`
 * và `price_changed` (giá rao) được tính — sự kiện khác (chi tiết, giá đáy ở lớp nguồn) không làm căn «vừa đổi».
 */
export function vuaDoi(giaLucGui: number | null, sauLucGui: readonly SuKienDoi[]): VuaDoi {
  const st = [...sauLucGui].reverse().find((e) => e.type === "status_changed");
  if (st) return { status: { to: st.payload.to as StandardStatus } };
  const gia = [...sauLucGui].reverse().find((e) => e.type === "price_changed" && "listPrice" in e.payload);
  if (gia && gia.payload.listPrice !== giaLucGui) return { price: { from: giaLucGui, to: (gia.payload.listPrice as number | null) ?? null } };
  return null;
}
