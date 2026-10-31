/**
 * Gửi hàng đợi (AC-4..AC-7): theo từng căn, đúng thứ tự; một căn kẹt không chặn căn khác; mất mạng thì dừng cả lô và giữ
 * nguyên hàng đợi. Máy chủ không nhận thì đối chiếu lịch sử căn trước khi kết luận — gửi lại không trùng mà không cần
 * khoá chống trùng ở máy chủ.
 */
import type { ListingEvent } from "@quy-hang/core/listing";
import type { Goi, ListingView, Me, NeedsReview, Ngan, PendingOp } from "./types";

class MatMang extends Error {}

/** So hai giá trị JSON (payload của sự kiện) — chạy cả trong trình duyệt. */
function giongNhau(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  return ka.length === kb.length && ka.every((k) => giongNhau((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

async function goiAnToan(goi: Goi, ...a: Parameters<Goi>) {
  try {
    return await goi(...a);
  } catch {
    throw new MatMang();
  }
}

type DoiChieu = { kq: "da-ap-truoc"; seq: number } | { kq: "can-xem"; review: Omit<NeedsReview, "mine"> };

/**
 * Máy chủ trả từ chối cho `op`: đọc lịch sử căn. Có sự kiện sau phiên bản kỳ vọng do chính người này ghi, cùng loại, cùng
 * nội dung, chưa được thao tác khác nhận → thao tác đã áp trước (phản hồi lần trước bị mất, hay tab khác đã gửi).
 */
export async function doiChieu(
  goi: Goi,
  op: PendingOp,
  me: Me,
  traLoi: { status: number; body: unknown },
  daNhan: Set<number>,
): Promise<{ dc: DoiChieu; view?: ListingView; events?: ListingEvent[] }> {
  const r = await goiAnToan(goi, "GET", `/api/v1/listings/${op.listingId}`);
  if (r.status !== 200) return { dc: { kq: "can-xem", review: { listingId: op.listingId, kind: "tu-choi", reason: "căn không còn đọc được" } } };
  const { events, ...view } = r.body as ListingView & { events: ListingEvent[] };
  const cua = events.find(
    (e) => e.seq > op.expectedVersion && e.actorUserId === me.userId && e.type === op.type && giongNhau(e.payload, op.payload) && !daNhan.has(e.seq),
  );
  if (cua) return { dc: { kq: "da-ap-truoc", seq: cua.seq }, view: view as ListingView, events };
  const cuoi = events[events.length - 1]!;
  const server = { value: view as ListingView, byUserId: cuoi.actorUserId, at: cuoi.occurredAt };
  const thang = [...events].reverse().find((e) => e.seq > op.expectedVersion && e.type === "status_changed" && (e.payload.to === "Pending" || e.payload.to === "Closed"));
  if (thang && thang.actorUserId !== me.userId && view.standardStatus === thang.payload.to) {
    return { dc: { kq: "can-xem", review: { listingId: op.listingId, kind: thang.payload.to === "Pending" ? "da-coc" : "da-ban", server } }, view: view as ListingView, events };
  }
  if (traLoi.status === 409) return { dc: { kq: "can-xem", review: { listingId: op.listingId, kind: "dung-nhau", server } }, view: view as ListingView, events };
  const b = (traLoi.body ?? {}) as { error?: string; reason?: string; missing?: string[] };
  const reason = b.reason ?? (b.missing ? `thiếu ${b.missing.join(", ")}` : (b.error ?? `máy chủ trả ${traLoi.status}`));
  return { dc: { kq: "can-xem", review: { listingId: op.listingId, kind: "tu-choi", reason, server } }, view: view as ListingView, events };
}

export async function guiHangDoi(goi: Goi, n: Ngan, me: Me): Promise<{ ngan: Ngan; daGui: number; mang: boolean }> {
  let ngan: Ngan = { ...n, queue: [...n.queue], review: [...n.review] };
  let daGui = 0;
  const theoCan = new Map<string, PendingOp[]>();
  for (const op of [...n.queue].sort((a, b) => a.clientSeq - b.clientSeq)) {
    if (ngan.review.some((r) => r.listingId === op.listingId)) continue;
    theoCan.set(op.listingId, [...(theoCan.get(op.listingId) ?? []), op]);
  }
  const capNhat = (view?: ListingView, events?: ListingEvent[]) => {
    if (!view) return;
    ngan = { ...ngan, listings: (ngan.listings ?? []).map((l) => (l.id === view.id ? view : l)) };
    if (events) ngan = { ...ngan, history: { ...ngan.history, [view.id]: events } };
  };
  try {
    for (const [listingId, ops] of theoCan) {
      const daNhan = new Set<number>();
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i]!;
        const r = await goiAnToan(goi, "POST", `/api/v1/listings/${listingId}/events`, { type: op.type, payload: op.payload, expectedVersion: op.expectedVersion });
        if (r.status === 200) {
          ngan = { ...ngan, queue: ngan.queue.filter((o) => o.opId !== op.opId) };
          capNhat(r.body as ListingView);
          daGui++;
          continue;
        }
        const { dc, view, events } = await doiChieu(goi, op, me, r, daNhan);
        capNhat(view, events);
        if (dc.kq === "da-ap-truoc") {
          daNhan.add(dc.seq);
          ngan = { ...ngan, queue: ngan.queue.filter((o) => o.opId !== op.opId) };
          continue;
        }
        // Căn thành «cần xem»: thao tác này và mọi thao tác sau của căn chuyển sang tay người, rời hàng đợi.
        const mine = ops.slice(i);
        const ids = new Set(mine.map((o) => o.opId));
        ngan = { ...ngan, queue: ngan.queue.filter((o) => !ids.has(o.opId)), review: [...ngan.review, { ...dc.review, mine }] };
        break;
      }
    }
  } catch (e) {
    if (e instanceof MatMang) return { ngan: { ...ngan, lastAttempt: "mang" }, daGui, mang: true };
    throw e;
  }
  return { ngan: { ...ngan, lastAttempt: "ok" }, daGui, mang: false };
}
