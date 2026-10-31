/**
 * Kéo về (AC-1): `GET /api/v1/listings` — API đã lọc theo sàn bằng luật theo dòng và theo `canRead` của trục ai thấy hàng.
 * Lưới thứ hai: bản ghi nào mang khoá hay giá trị nguồn thì cả lần kéo bị từ chối, kho không ghi gì (bất biến 2).
 * Lỗi kéo mang nguyên nhân (hàng 61) để chỉ báo nói đúng: hết phiên, máy chủ trục trặc hay bị từ chối; ném lỗi mạng thì
 * lời gọi tự ném ra, không qua `LoiKeo`.
 */
import { findSourceLeaks } from "@quy-hang/core/access";
import type { ListingEvent } from "@quy-hang/core/listing";
import { laMayChuLoi } from "./gui";
import type { Goi, LanThu, ListingView, Ngan } from "./types";

export class LoiKeo extends Error {
  readonly lan: Exclude<LanThu, "ok" | "mang">;
  constructor(message: string, lan: Exclude<LanThu, "ok" | "mang"> = "tu-choi") {
    super(message);
    this.lan = lan;
  }
}

const theoMa = (status: number): Exclude<LanThu, "ok" | "mang"> => (status === 401 ? "phien" : laMayChuLoi(status) ? "may-chu" : "tu-choi");

function kiemNguon(ban: unknown, ten: string) {
  const ro = findSourceLeaks(ban);
  if (ro.length) throw new LoiKeo(`kéo về: ${ten} mang nguồn (${ro.join(", ")}) — không ghi vào kho`);
}

export async function keoVe(goi: Goi, n: Ngan, now: string): Promise<Ngan> {
  const r = await goi("GET", "/api/v1/listings");
  if (r.status !== 200 || !Array.isArray(r.body)) throw new LoiKeo(`kéo về: máy chủ trả ${r.status}`, theoMa(r.status));
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
