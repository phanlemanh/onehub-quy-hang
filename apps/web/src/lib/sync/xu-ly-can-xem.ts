/**
 * Lối của người cho căn «cần xem» (AC-6, AC-7): Giữ của tôi · Lấy bản mới · Bỏ thay đổi · Sửa lại.
 *
 * Hàng 61: thao tác sửa tiếp căn đang «cần xem» nằm trong hàng đợi nhưng chưa gửi («thao tác giữ»). Chọn lối nào thì giá
 * cuối cũng là lần sửa sau cùng: «Giữ của tôi» xếp thao tác cũ rồi tới thao tác giữ; ba lối kia bỏ thao tác cũ và xếp
 * lại thao tác giữ — luôn nối chuỗi lại trên bản máy chủ mới.
 */
import { apTrenMay } from "./ap-tren-may";
import type { NeedsReview, Ngan, PendingOp } from "./types";

const boMuc = (n: Ngan, listingId: string): Ngan => ({ ...n, review: n.review.filter((r) => r.listingId !== listingId) });

/** Thao tác giữ của căn: trong hàng đợi, theo thứ tự đã sửa. */
export const thaoTacGiu = (n: Ngan, listingId: string): PendingOp[] =>
  n.queue.filter((o) => o.listingId === listingId).sort((a, b) => a.clientSeq - b.clientSeq);

/**
 * Bỏ mục «cần xem» và thao tác giữ của căn khỏi hàng đợi, rồi kiểm lại từng thao tác của `ops` trên bản máy chủ mới bằng
 * luật lõi, nối chuỗi từ phiên bản mới, xếp lại để gửi. Thao tác nào không áp được thì nó và các thao tác sau về «cần xem».
 */
function xepLai(n: Ngan, r: NeedsReview, ops: PendingOp[]): Ngan {
  const listingId = r.listingId;
  const giu = new Set(thaoTacGiu(n, listingId).map((o) => o.opId));
  let m: Ngan = { ...boMuc(n, listingId), queue: n.queue.filter((o) => !giu.has(o.opId)) };
  if (r.server) m = { ...m, listings: (m.listings ?? []).map((l) => (l.id === listingId ? r.server!.value : l)) };
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]!;
    const kq = apTrenMay(m, listingId, op.type, op.payload, op.createdAt, op.opId);
    if (!kq.ok) {
      const reason = kq.loi.kind === "invalid-transition" ? kq.loi.reason : kq.loi.kind === "missing-requirement" ? `thiếu ${kq.loi.missing.join(", ")}` : "không áp được trên bản mới";
      return { ...m, review: [...m.review, { listingId, kind: "tu-choi", mine: ops.slice(i), server: r.server, reason }] };
    }
    m = kq.ngan;
  }
  return m;
}

/** Thao tác cũ của tôi rồi tới thao tác giữ, xếp lại trên bản máy chủ mới. */
export function giuCuaToi(n: Ngan, listingId: string): Ngan {
  const r = n.review.find((x) => x.listingId === listingId);
  if (!r) return n;
  return xepLai(n, r, [...r.mine, ...thaoTacGiu(n, listingId)]);
}

/** Bỏ thao tác cũ của tôi trên căn; bản trên máy theo bản máy chủ; thao tác giữ xếp lại trên bản ấy. */
export function layBanMoi(n: Ngan, listingId: string): Ngan {
  const r = n.review.find((x) => x.listingId === listingId);
  if (!r) return n;
  return xepLai(n, r, thaoTacGiu(n, listingId));
}
export const boThayDoi = layBanMoi;

/** Trả giá trị của tôi để điền lại ô (chỉ khi căn còn đọc được), bỏ thao tác cũ; thao tác giữ xếp lại như «Lấy bản mới». */
export function suaLai(n: Ngan, listingId: string): { ngan: Ngan; nhap: Record<string, unknown> } {
  const r = n.review.find((x) => x.listingId === listingId);
  const nhap = Object.assign({}, ...(r?.mine ?? []).map((o) => o.payload)) as Record<string, unknown>;
  return { ngan: layBanMoi(n, listingId), nhap };
}
