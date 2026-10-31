/** Lối của người cho căn «cần xem» (AC-6, AC-7): Giữ của tôi · Lấy bản mới · Bỏ thay đổi · Sửa lại. */
import { apTrenMay } from "./ap-tren-may";
import type { Ngan } from "./types";

const boMuc = (n: Ngan, listingId: string): Ngan => ({ ...n, review: n.review.filter((r) => r.listingId !== listingId) });

/** Kiểm lại từng thao tác của tôi trên bản máy chủ mới bằng luật lõi, nối chuỗi từ phiên bản mới, xếp lại để gửi. */
export function giuCuaToi(n: Ngan, listingId: string): Ngan {
  const r = n.review.find((x) => x.listingId === listingId);
  if (!r) return n;
  let m: Ngan = boMuc(n, listingId);
  if (r.server) m = { ...m, listings: (m.listings ?? []).map((l) => (l.id === listingId ? r.server!.value : l)) };
  for (let i = 0; i < r.mine.length; i++) {
    const op = r.mine[i]!;
    const kq = apTrenMay(m, listingId, op.type, op.payload, op.createdAt, op.opId);
    if (!kq.ok) {
      const reason = kq.loi.kind === "invalid-transition" ? kq.loi.reason : kq.loi.kind === "missing-requirement" ? `thiếu ${kq.loi.missing.join(", ")}` : "không áp được trên bản mới";
      return { ...m, review: [...m.review, { listingId, kind: "tu-choi", mine: r.mine.slice(i), server: r.server, reason }] };
    }
    m = kq.ngan;
  }
  return m;
}

/** Bỏ thao tác của tôi trên căn; bản trên máy theo bản máy chủ. */
export const layBanMoi = (n: Ngan, listingId: string): Ngan => boMuc(n, listingId);
export const boThayDoi = layBanMoi;

/** Trả giá trị của tôi để điền lại ô (chỉ khi căn còn đọc được), bỏ thao tác cũ. */
export function suaLai(n: Ngan, listingId: string): { ngan: Ngan; nhap: Record<string, unknown> } {
  const r = n.review.find((x) => x.listingId === listingId);
  const nhap = Object.assign({}, ...(r?.mine ?? []).map((o) => o.payload)) as Record<string, unknown>;
  return { ngan: boMuc(n, listingId), nhap };
}
