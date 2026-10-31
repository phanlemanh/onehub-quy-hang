/** Chỉ báo đồng bộ trên thanh trên (AC-8): chữ suy từ ngăn của sàn đang làm và số thao tác đang gửi. */
import type { Ngan } from "./types";

export type ChiBao = { nhan: string; loai: "tai" | "xong" | "gui" | "mang" | "xem" };

const gio = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function suyChiBao(n: Ngan, dangGui: number): ChiBao {
  // Cần xem thắng mọi trạng thái khác: đó là việc người phải làm.
  if (n.review.length > 0) return { nhan: `${n.review.length} căn cần xem`, loai: "xem" };
  if (dangGui > 0) return { nhan: `Đang gửi ${dangGui} thay đổi`, loai: "gui" };
  if (n.lastAttempt === "mang") {
    return n.queue.length > 0
      ? { nhan: `Mất mạng · ${n.queue.length} thay đổi chờ gửi`, loai: "mang" }
      : { nhan: "Mất mạng · đang xem bản trên máy", loai: "mang" };
  }
  if (n.listings === null || !n.lastPullAt) return { nhan: "Đang tải lần đầu", loai: "tai" };
  if (n.queue.length > 0) return { nhan: `Đang gửi ${n.queue.length} thay đổi`, loai: "gui" };
  return { nhan: `Đã đồng bộ · ${gio(n.lastPullAt)}`, loai: "xong" };
}

/** Đăng xuất: còn thay đổi chưa lên máy chủ ở bất kỳ ngăn nào — trong hàng đợi hay nằm ở «cần xem» — thì hỏi, nói tổng số (AC-10). */
export function canHoiKhiDangXuat(ngan: Ngan[]): { hoi: boolean; n: number } {
  const n = ngan.reduce((t, x) => t + x.queue.length + x.review.reduce((m, r) => m + r.mine.length, 0), 0);
  return { hoi: n > 0, n };
}
