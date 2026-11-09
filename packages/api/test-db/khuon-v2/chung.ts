// Đồ dùng chung của bộ kiểm cửa nhận gói v2 (hàng 94). Gói thử sửa từ goiMauV2() của khuôn, không tự dựng gói đúng khuôn.
import { goiMauV2, type CatalogFeedV2 } from "@quy-hang/connect";
import { appPool, donDep as donDepToken, RUN } from "../token-may/chung";

export * from "../token-may/chung";

/** Gói mẫu với khoá khu, UPI và nguồn riêng theo lượt và nhãn. */
export function goiV2(tag: string): CatalogFeedV2 {
  const chu = JSON.stringify(goiMauV2())
    .replaceAll("mau-v2-", `v2-${RUN}-${tag}-`)
    .replaceAll("urn:onehub:upi:mau:v2:", `urn:onehub:upi:${RUN}:${tag}:`)
    .replaceAll("[Mẫu] Nguồn danh mục và thị trường", `[Mẫu] Nguồn v2 ${RUN} ${tag}`);
  return JSON.parse(chu) as CatalogFeedV2;
}
export const khuCua = (g: CatalogFeedV2) => g.subdivisions.map((s) => s.subdivisionKey);
export const canCua = (g: CatalogFeedV2) => g.subdivisions.flatMap((s) => s.buildings.flatMap((b) => b.units));

/** Dọn hai bảng ảnh chụp trước khi bộ chung xoá khu và thoả thuận. */
export async function donDepV2() {
  await appPool.query("delete from catalog_market_snapshots where provider like $1", [`%${RUN}%`]);
  await appPool.query("delete from catalog_public_listing_snapshots where provider like $1", [`%${RUN}%`]);
  await donDepToken();
}

export type Chup = { can: Record<string, unknown>[]; thiTruong: Record<string, unknown>[]; tin: Record<string, unknown>[] };
/** Toàn nội dung ba bảng của các khu, đọc bằng chủ bảng. */
export async function chup(khu: string[]): Promise<Chup> {
  const can = await appPool.query<Record<string, unknown>>("select upi, living_area, field_confidence, agreement_id from catalog_units where subdivision_key = any ($1) order by upi", [khu]);
  const thiTruong = await appPool.query<Record<string, unknown>>("select subdivision_key, measured_at, segments, agreement_id from catalog_market_snapshots where subdivision_key = any ($1) order by subdivision_key", [khu]);
  const tin = await appPool.query<Record<string, unknown>>("select subdivision_key, measured_at, listings, agreement_id from catalog_public_listing_snapshots where subdivision_key = any ($1) order by subdivision_key", [khu]);
  return { can: can.rows, thiTruong: thiTruong.rows, tin: tin.rows };
}
export const soDong = (c: Chup) => c.can.length + c.thiTruong.length + c.tin.length;

/** UPI nào có nhãn lưu lệch nhãn của gói. */
export function lechNhan(feed: CatalogFeedV2, can: Record<string, unknown>[]): string[] {
  const mong = new Map(canCua(feed).map((u) => [u.upi, u.fieldConfidence]));
  return can
    .filter((r) => {
      const a = JSON.stringify(Object.entries((r.field_confidence ?? {}) as object).sort());
      const b = JSON.stringify(Object.entries(mong.get(String(r.upi)) ?? {}).sort());
      return r.field_confidence === null || a !== b;
    })
    .map((r) => String(r.upi));
}
