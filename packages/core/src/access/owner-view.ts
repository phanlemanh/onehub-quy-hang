/**
 * Hồ sơ chủ nhà như API trả (AC-3). Người thấy nguồn nhận tên, giá đáy và cờ «có số» — số chỉ ra qua «Mở số», mỗi lần
 * mở là một sự kiện. Người không thấy chỉ nhận cờ không thấy và đầu chủ giữ căn, để màn hiện «Liên hệ đầu chủ».
 */
import { SOURCE_KEYS } from "../listing";
import { canSeeSource, type Viewer } from "./can-see-source";

export type OwnerRecord = { listingAgentUserId: string | null; ownerName: string; floorPrice: number | null; hasPhone: boolean };
export type OwnerView =
  | { visible: true; ownerName: string; floorPrice: number | null; hasPhone: boolean }
  | { visible: false; listingAgentUserId: string | null };

export function ownerView(rec: OwnerRecord, viewer: Viewer): OwnerView {
  if (!canSeeSource(viewer, rec.listingAgentUserId)) return { visible: false, listingAgentUserId: rec.listingAgentUserId };
  return { visible: true, ownerName: rec.ownerName, floorPrice: rec.floorPrice, hasPhone: rec.hasPhone };
}

/**
 * Đường khoá của mọi chỗ rò nguồn trong một giá trị: khoá thuộc lớp `source` ở bất kỳ cấp, và chuỗi chứa một mẫu (tên,
 * số, giá đáy mẫu). Dùng để quét thân trả về của mọi lời gọi.
 */
export function findSourceLeaks(value: unknown, samples: readonly string[] = []): string[] {
  const out: string[] = [];
  const di = (v: unknown, path: string) => {
    if (typeof v === "string" || typeof v === "number") {
      const s = String(v);
      if (samples.some((m) => s.includes(m))) out.push(path);
      return;
    }
    if (!v || typeof v !== "object") return;
    for (const [k, con] of Object.entries(v)) {
      const p = path ? `${path}.${k}` : k;
      if ((SOURCE_KEYS as readonly string[]).includes(k)) out.push(p);
      di(con, p);
    }
  };
  di(value, "");
  return out;
}
