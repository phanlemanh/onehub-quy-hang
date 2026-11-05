/**
 * Bảng quyền thao tác × vai của hàng (hàng bang-quyen-theo-vai, chỗ hở G1 của rà soát phân quyền 05/11). Kỳ vọng từng ô
 * viết trước ở `bang-quyen-hang.json`; API (`packages/api/src/listings`), luật theo dòng (migration 046) và ô Trạng thái của
 * Bảng hàng cùng đọc luật ở đây. Năm vai cố định (ADR-0006); sàn không tự chỉnh bảng — dòng khoá K28 của Sổ điểm biến thiên.
 *
 * Hai trục tách nhau: trục vai ở đây (ai làm việc với hàng), trục ai thấy hàng «Chỉ tôi / Toàn sàn» ở `core/visibility`.
 * Lớp vai đứng trước trục ai thấy hàng.
 */
import type { Viewer } from "./can-see-source";

export const THAO_TAC_HANG = ["xem", "tao", "sua", "dua_len_dang_ban"] as const;
export type ThaoTacHang = (typeof THAO_TAC_HANG)[number];

/** Ba vai có nhà Bảng hàng (Tham chiếu §9, `core/navigation.ts`): Đầu chủ, Đầu khách, Trưởng nhóm. */
export const VAI_BANG_HANG = ["listing_agent", "buyer_agent", "team_lead"] as const;

/** Một dòng của bảng viết trước: ca người, vai, quan hệ với căn, kỳ vọng từng thao tác. */
export type DongBangQuyen = {
  o: string;
  vai: string[];
  /** minh: người xem giữ căn · chua: chưa ai giữ · khac: người khác giữ · tung: người xem từng giữ, dòng gán mới nhất là người khác. */
  giu: "minh" | "chua" | "khac" | "tung";
} & Record<ThaoTacHang, boolean>;

/** Câu từ chối khi người không đủ cờ «Sẵn sàng bán» gửi lệnh đưa lên Đang bán — API (trường `reason`) và ô Trạng thái. */
export const LY_DO_DUA_LEN_DANG_BAN = "Chỉ đầu chủ giữ căn hay trưởng nhóm đưa lên Đang bán";

/** Người có Bảng hàng: có ít nhất một trong ba vai — kiêm vai thì hợp quyền của mọi vai (Tham chiếu §9). */
export function lamViecVoiHang(viewer: { roles: readonly string[] }): boolean {
  return VAI_BANG_HANG.some((v) => viewer.roles.includes(v));
}

/**
 * Người xem làm được thao tác với một hàng không. `listingAgentUserId` là người giữ căn mới nhất (`null` khi chưa ai giữ).
 * Đưa lên Đang bán = cờ «Sẵn sàng bán»: có vai Trưởng nhóm, HOẶC (có vai Đầu chủ VÀ (giữ căn HOẶC căn chưa ai giữ)) —
 * cùng ngoặc với `app.can_activate_listing` của migration 046.
 */
export function duocLamVoiHang(viewer: Viewer, thaoTac: ThaoTacHang, listingAgentUserId: string | null): boolean {
  if (!lamViecVoiHang(viewer)) return false;
  if (thaoTac !== "dua_len_dang_ban") return true;
  if (viewer.roles.includes("team_lead")) return true;
  return viewer.roles.includes("listing_agent") && (listingAgentUserId === null || listingAgentUserId === viewer.userId);
}

/**
 * So bảng với một hàm quyền (mặc định hàm của lõi): trả mọi ô lệch, mỗi ô một dòng «<ca>» × <thao tác>: mong …, được ….
 * Ở lõi, «tung» đọc như «khac» — lõi chỉ biết người giữ mới nhất.
 */
export function soBangQuyenHang(
  bang: readonly DongBangQuyen[],
  f: (viewer: Viewer, thaoTac: ThaoTacHang, listingAgentUserId: string | null) => boolean = duocLamVoiHang,
): string[] {
  const NGUOI = "u-so-bang";
  const lech: string[] = [];
  for (const o of bang) {
    const giu = o.giu === "minh" ? NGUOI : o.giu === "chua" ? null : "u-so-bang-khac";
    for (const t of THAO_TAC_HANG) {
      const ra = f({ userId: NGUOI, roles: o.vai }, t, giu);
      if (ra !== o[t]) lech.push(`«${o.o}» × ${t}: mong ${o[t] ? "✓" : "✗"}, được ${ra ? "✓" : "✗"}`);
    }
  }
  return lech;
}
