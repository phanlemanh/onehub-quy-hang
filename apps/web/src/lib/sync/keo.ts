/**
 * Kéo về (AC-1): `GET /api/v1/listings` — API đã lọc theo sàn bằng luật theo dòng và theo `canRead` của trục ai thấy hàng.
 * Lưới thứ hai: bản ghi nào mang khoá hay giá trị nguồn thì cả lần kéo bị từ chối, kho không ghi gì (bất biến 2).
 */
import { findSourceLeaks } from "@quy-hang/core/access";
import type { ListingEvent } from "@quy-hang/core/listing";
import type { Goi, ListingView, Ngan } from "./types";

export class LoiKeo extends Error {}

function kiemNguon(ban: unknown, ten: string) {
  const ro = findSourceLeaks(ban);
  if (ro.length) throw new LoiKeo(`kéo về: ${ten} mang nguồn (${ro.join(", ")}) — không ghi vào kho`);
}

export async function keoVe(goi: Goi, n: Ngan, now: string): Promise<Ngan> {
  const r = await goi("GET", "/api/v1/listings");
  if (r.status !== 200 || !Array.isArray(r.body)) throw new LoiKeo(`kéo về: máy chủ trả ${r.status}`);
  const ds = r.body as ListingView[];
  for (const l of ds) kiemNguon(l, `căn ${l.id}`);
  const con = new Set(ds.map((l) => l.id));
  const history = Object.fromEntries(Object.entries(n.history).filter(([id]) => con.has(id)));
  return { ...n, listings: ds, history, lastPullAt: now, lastAttempt: "ok" };
}

/** Lịch sử một căn — lưu để mở hồ sơ không chờ mạng lần sau. */
export async function keoLichSu(goi: Goi, n: Ngan, listingId: string): Promise<Ngan> {
  const r = await goi("GET", `/api/v1/listings/${listingId}`);
  if (r.status !== 200) return n;
  kiemNguon(r.body, `căn ${listingId}`);
  const { events, ...view } = r.body as ListingView & { events: ListingEvent[] };
  const listings = (n.listings ?? []).map((l) => (l.id === listingId ? (view as ListingView) : l));
  return { ...n, listings, history: { ...n.history, [listingId]: events } };
}
