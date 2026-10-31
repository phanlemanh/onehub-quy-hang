/**
 * Trục 1 — ai trong sàn thấy hàng (Tham chiếu §6, hàng 12). Hai nấc ở bản này: «Chỉ tôi» (`Private`) — chỉ người tạo
 * hàng đọc được; «Toàn sàn» (`Company`) — mọi thành viên của sàn. Hàng lên «Toàn sàn» lần đầu vào Đang bán («Sẵn sàng
 * bán») và giữ nấc ấy về sau (Hỏi-1). Nấc tính ra từ dãy sự kiện, không lưu cột; vai không mở «Chỉ tôi».
 * Nhập qua `@quy-hang/core/visibility`.
 */
import type { ListingEvent } from "../listing/events";

export const VISIBILITY_LEVELS = ["Private", "Company"] as const;
export type Visibility = (typeof VISIBILITY_LEVELS)[number];

/**
 * Dữ kiện luật cần: người tạo hàng và các trạng thái hàng từng tới. Hai lối vào cho cùng dữ kiện — gấp từ dãy sự kiện
 * (`factsFromEvents`) hay một câu SQL gom từ bảng sự kiện — rồi đều qua `visibilityOf`/`canRead`: luật chỉ nằm ở đây.
 */
export type VisibilityFacts = { creatorUserId: string; statusesReached: readonly string[] };

export function factsFromEvents(events: readonly ListingEvent[]): VisibilityFacts {
  const ds = [...events].sort((a, b) => a.seq - b.seq);
  const dau = ds[0];
  if (!dau || dau.type !== "created") throw new Error("dãy sự kiện phải mở đầu bằng created");
  const toi = ds.filter((e) => e.type === "status_changed").map((e) => String(e.payload.to));
  return { creatorUserId: dau.actorUserId, statusesReached: [...new Set(toi)] };
}

/** «Toàn sàn» khi hàng đã từng Đang bán — một lần lên là giữ; còn lại «Chỉ tôi». */
export function visibilityOf(facts: VisibilityFacts): Visibility {
  return facts.statusesReached.includes("Active") ? "Company" : "Private";
}

/** Người xem: người đăng nhập và vai của họ ở sàn đang làm. */
export type Viewer = { userId: string; roles: readonly string[] };

/**
 * Người tạo luôn đọc được hàng của mình; người khác cùng sàn chỉ đọc hàng «Toàn sàn» — vai nào cũng vậy (quản trị sàn
 * không tự thấy nguồn, Tham chiếu §6). Sàn khác đã bị chặn ở cơ sở dữ liệu.
 */
export function canRead(viewer: Viewer, facts: VisibilityFacts): boolean {
  return viewer.userId === facts.creatorUserId || visibilityOf(facts) === "Company";
}
