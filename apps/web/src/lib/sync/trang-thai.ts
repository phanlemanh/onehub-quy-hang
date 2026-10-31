/** Chỉ báo đồng bộ trên thanh trên (AC-8): chữ suy từ ngăn của sàn đang làm, số thao tác đang gửi và cờ lỗi kho. */
import type { Ngan } from "./types";

export type ChiBao = { nhan: string; loai: "tai" | "xong" | "gui" | "mang" | "xem" | "phien" | "may-chu" | "tu-choi" | "kho" };

const gio = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function suyChiBao(n: Ngan, dangGui: number, loiKho = false): ChiBao {
  // Cần xem thắng mọi trạng thái khác: đó là việc người phải làm.
  if (n.review.length > 0) return { nhan: `${n.review.length} căn cần xem`, loai: "xem" };
  // Hàng 61: kho trên máy lỗi thì lần sửa chưa lưu được — nói trước mọi nguyên nhân mạng.
  if (loiKho) return { nhan: "Lỗi kho trên máy · thay đổi chưa lưu được", loai: "kho" };
  if (dangGui > 0) return { nhan: `Đang gửi ${dangGui} thay đổi`, loai: "gui" };
  const cho = n.queue.length;
  // Hàng 61: mỗi nguyên nhân chưa gửi được một chữ riêng, có và không có thay đổi chờ.
  switch (n.lastAttempt) {
    case "mang":
      return cho > 0 ? { nhan: `Mất mạng · ${cho} thay đổi chờ gửi`, loai: "mang" } : { nhan: "Mất mạng · đang xem bản trên máy", loai: "mang" };
    case "phien":
      return cho > 0
        ? { nhan: `Hết phiên · đăng nhập lại để gửi ${cho} thay đổi`, loai: "phien" }
        : { nhan: "Hết phiên · đăng nhập lại để tải bản mới", loai: "phien" };
    case "may-chu":
      return cho > 0
        ? { nhan: `Máy chủ trục trặc · ${cho} thay đổi chờ gửi lại`, loai: "may-chu" }
        : { nhan: "Máy chủ trục trặc · đang xem bản trên máy", loai: "may-chu" };
    case "tu-choi":
      return { nhan: "Bản tải về bị từ chối · đang xem bản trên máy", loai: "tu-choi" };
  }
  if (n.listings === null || !n.lastPullAt) return { nhan: "Đang tải lần đầu", loai: "tai" };
  if (cho > 0) return { nhan: `Đang gửi ${cho} thay đổi`, loai: "gui" };
  return { nhan: `Đã đồng bộ · ${gio(n.lastPullAt)}`, loai: "xong" };
}

/** Đăng xuất: còn thay đổi chưa lên máy chủ ở bất kỳ ngăn nào — trong hàng đợi hay nằm ở «cần xem» — thì hỏi, nói tổng số (AC-10). */
export function canHoiKhiDangXuat(ngan: Ngan[]): { hoi: boolean; n: number } {
  const n = ngan.reduce((t, x) => t + x.queue.length + x.review.reduce((m, r) => m + r.mine.length, 0), 0);
  return { hoi: n > 0, n };
}
