/**
 * Ghi trên máy trước (AC-3, luật 30): kiểm bằng luật lõi, xếp thao tác chờ, bản trên máy là bản máy chủ gấp thêm các thao
 * tác chờ bằng bước gấp của lõi — không chép luật gấp sang web.
 */
import {
  checkTransition,
  confirmsWithOwner,
  stepListing,
  validatePayload,
  type EventType,
  type ListingEvent,
  type PayloadError,
  type Requirement,
} from "@quy-hang/core/listing";
import type { ListingView, Ngan, PendingOp } from "./types";

export type LoiTrenMay = { kind: "invalid-payload"; errors: PayloadError[] } | { kind: "invalid-transition"; reason: string } | { kind: "missing-requirement"; missing: Requirement[] } | { kind: "not-found" };

/** Sự kiện tạm mà thao tác chờ sẽ thành nếu máy chủ nhận. */
export const suKienTam = (op: PendingOp, actorUserId = ""): ListingEvent => ({
  seq: op.expectedVersion + 1,
  type: op.type,
  payload: op.payload,
  actorUserId,
  actorRoles: [],
  confirmedWithOwner: confirmsWithOwner(op.type),
  occurredAt: op.createdAt,
});

/** Bản trên máy của một căn: bản máy chủ gấp thêm các thao tác chờ của căn theo thứ tự. */
export function banTrenMay(server: ListingView, ops: readonly PendingOp[]): ListingView {
  const cua = ops.filter((o) => o.listingId === server.id).sort((a, b) => a.clientSeq - b.clientSeq);
  let s = server;
  for (const o of cua) s = { ...s, ...stepListing(s, suKienTam(o)) };
  return s;
}

export function apTrenMay(
  n: Ngan,
  listingId: string,
  type: EventType,
  payload: Record<string, unknown>,
  now: string,
  opId: string,
): { ok: true; ngan: Ngan; op: PendingOp } | { ok: false; loi: LoiTrenMay } {
  const server = n.listings?.find((l) => l.id === listingId);
  if (!server) return { ok: false, loi: { kind: "not-found" } };
  const errors = validatePayload(type, payload);
  if (type === "created") errors.push({ path: "type", reason: "hàng đã có" });
  if (errors.length) return { ok: false, loi: { kind: "invalid-payload", errors } };
  const hienTai = banTrenMay(server, n.queue);
  if (type === "status_changed") {
    const kq = checkTransition(hienTai.standardStatus, payload.to, { ...hienTai, ...payload });
    if (!kq.ok) return { ok: false, loi: kq.kind === "invalid-transition" ? { kind: kq.kind, reason: kq.reason } : { kind: kq.kind, missing: kq.missing } };
  }
  const op: PendingOp = { opId, listingId, type, payload, expectedVersion: hienTai.version, clientSeq: n.nextSeq, createdAt: now };
  return { ok: true, op, ngan: { ...n, queue: [...n.queue, op], nextSeq: n.nextSeq + 1 } };
}
