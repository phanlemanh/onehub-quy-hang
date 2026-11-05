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

/**
 * Đường nối việc → hành động của Hôm nay đầu chủ, MỘT chỗ cho cả lưới máy tính và thẻ điện thoại (S4-r3): mã việc nối sang
 * đúng hàm của màn — «Còn · giữ giá» ghi xác nhận trên máy, «Đổi giá/trạng thái» mở hồ sơ (căn chưa có mã → hàng chưa mã),
 * «Nhận»/«Đã gọi»/«Trả lại» ghi lead, việc khác đi tới màn ghi cuộc gọi. Bài kiểm gọi đúng các hàm này với hàm ghi theo dõi.
 */
export type HanhDongNoi<C, L> = {
  conGiuGia: (c: C) => void;
  moHoSo: (c: C) => void;
  lead: (l: L, viec: "accept" | "first_call" | "return") => void;
};

export function noiViecCan<C extends { id: string; unitNumber?: string | null }>(
  c: C,
  m: string,
  hd: Pick<HanhDongNoi<C, unknown>, "conGiuGia" | "moHoSo">,
  duongChuaMa: (id: string) => string,
): Bam {
  if (m === "con-giu-gia") return { onClick: () => hd.conGiuGia(c) };
  if (m === "doi-gia-trang-thai") return c.unitNumber ? { onClick: () => hd.moHoSo(c) } : { href: duongChuaMa(c.id) };
  return { href: `/units/call?hang=${encodeURIComponent(c.id)}` };
}

export function noiViecLead<L extends { id: string }>(l: L, m: string, hd: Pick<HanhDongNoi<unknown, L>, "lead">): Bam {
  if (m === "nhan") return { onClick: () => hd.lead(l, "accept") };
  if (m === "da-goi") return { onClick: () => hd.lead(l, "first_call") };
  if (m === "tra-lai") return { onClick: () => hd.lead(l, "return") };
  return { href: `/units/call?lead=${encodeURIComponent(l.id)}` };
}

/** Hai lối chạm của một thẻ điện thoại (`lam` cho nút và ⋯, `ghiKetQua` cho ngăn kết quả) dựng từ đường nối chung. */
export function noiThe<C extends { id: string; unitNumber?: string | null }, L extends { id: string }>(
  v: { kind: "can"; can: C } | { kind: "lead"; lead: L },
  hd: HanhDongNoi<C, L>,
  d: { duongChuaMa: (id: string) => string; diToi: (href: string) => void },
): { lam: (m: string) => Bam; ghiKetQua: (m: string) => void } {
  const lam = (m: string) => (v.kind === "can" ? noiViecCan(v.can, m, hd, d.duongChuaMa) : noiViecLead(v.lead, m, hd));
  return {
    lam,
    ghiKetQua: (m) => {
      const h = lam(m);
      if (h.onClick) h.onClick();
      else if (h.href) d.diToi(h.href);
    },
  };
}
