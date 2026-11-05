/**
 * Hành động của thẻ và của hai ngăn đáy (hàng 39): mỗi chạm đi qua đúng một hàm thuần ở đây, để thẻ và bài kiểm cùng gọi
 * một đường — bài kiểm bấm bằng hàm, theo dõi lời gọi, không đọc chữ trên màn.
 */
import type { Nhom } from "@quy-hang/core/today";
import type { MaViecDT, MucKetQua } from "./goi";

export type Bam = { onClick?: () => void; href?: string };

/**
 * Chạm một việc ở mép phải hay trong ⋯: «Gọi» → gọi một chạm; «Trả lại» → hỏi lại trước như máy tính (hàng 92); việc khác
 * → đúng lời gọi của nút cùng tên ở máy tính (bấm, hay đi tới liên kết).
 */
export function bamViec(
  m: MaViecDT,
  d: { lam: (m: Exclude<MaViecDT, "goi">) => Bam; goi: () => void; hoiTraLai: () => void; diToi: (href: string) => void },
): void {
  if (m === "goi") return d.goi();
  if (m === "tra-lai") return d.hoiTraLai();
  const h = d.lam(m);
  if (h.onClick) h.onClick();
  else if (h.href) d.diToi(h.href);
}

/** Chọn một dòng của ngăn «Kết quả cuộc gọi»: đóng ngăn; «Không nghe máy» không ghi gì; «Trả lại» hỏi lại; còn lại ghi. */
export function chonKetQua(
  m: MucKetQua,
  d: { ghiKetQua: (m: Exclude<MucKetQua, "khong-nghe" | "tra-lai">) => void; hoiTraLai: () => void; xong: () => void },
): void {
  d.xong();
  if (m === "khong-nghe") return;
  if (m === "tra-lai") return d.hoiTraLai();
  d.ghiKetQua(m);
}

/**
 * Nhóm thẻ dựng từ đúng mảng nhóm mà lưới máy tính dựng cây (`nhom` của Hôm nay đầu chủ): giữ thứ tự và bộ việc, mỗi việc
 * một thẻ. Một hàm cho cả màn và bài kiểm.
 */
export function dungNhomThe<V, T, B>(
  nhom: readonly { nhom: Nhom; viec: readonly V[] }[],
  theCua: (v: V) => T,
  badgeCua: (n: Nhom) => B,
): { ma: string; nhan: string; badge: B; the: T[] }[] {
  return nhom.map((g) => ({ ma: g.nhom.code, nhan: g.nhom.label, badge: badgeCua(g.nhom), the: g.viec.map(theCua) }));
}
