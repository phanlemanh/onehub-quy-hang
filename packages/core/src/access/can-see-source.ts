/**
 * Ai thấy nguồn (Tham chiếu §6, Hỏi-2 của hàng 11): đầu chủ giữ căn — còn vai Đầu chủ — và trưởng nhóm (cả sàn tới khi có
 * nhóm). Quản trị sàn không tự thấy. Cùng luật với `app.can_see_source` của migration 006; một bảng 12 ô đo cả hai.
 */
export type Viewer = { userId: string; roles: readonly string[] };

export function canSeeSource(viewer: Viewer, listingAgentUserId: string | null): boolean {
  if (viewer.roles.includes("team_lead")) return true;
  return listingAgentUserId !== null && viewer.userId === listingAgentUserId && viewer.roles.includes("listing_agent");
}
