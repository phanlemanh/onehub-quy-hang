/**
 * Lần gửi (hàng 86, Tham chiếu §4): một link — một căn hay bộ căn — gửi cho một nhu cầu khách (khách riêng) hay cho nhóm
 * môi giới; người gửi là chỗ ghi công. Lõi giữ khuôn nhập và **phong bì công khai**: phần của Lần gửi được ra trang khách,
 * chép đúng khoá viết trước — không bao giờ nhu cầu, liên hệ, tên khách hay số (bất biến 4). Luật ẩn trường của căn là hàng
 * 31 (`../redaction`). Nhập qua `@quy-hang/core/sharing`.
 */
import type { PayloadError } from "../listing/events";

/** Khách riêng (`client`, bắt buộc một nhu cầu khách) · nhóm môi giới (`agents`, không nhu cầu) — Tham chiếu mục 24. */
export const SHARE_AUDIENCES = ["client", "agents"] as const;
export type ShareAudience = (typeof SHARE_AUDIENCES)[number];

/** Trần căn của một Lần gửi — giữ cứng (Hỏi-7: trang khách nhẹ trên điện thoại). */
export const MAX_SHARE_LISTINGS = 30;

export type ShareInput = { audience: ShareAudience; prospectId: string | null; listingIds: string[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateShareInput(payload: unknown): { ok: true; value: ShareInput } | { ok: false; errors: PayloadError[] } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { ok: false, errors: [{ path: "payload", reason: "cần một đối tượng" }] };
  const p = payload as Record<string, unknown>;
  const errors: PayloadError[] = [];
  for (const k of Object.keys(p)) if (!["audience", "prospectId", "listingIds"].includes(k)) errors.push({ path: k, reason: "khoá lạ" });
  const aud = p.audience;
  if (!(SHARE_AUDIENCES as readonly unknown[]).includes(aud)) errors.push({ path: "audience", reason: `cần trong: ${SHARE_AUDIENCES.join(", ")}` });
  const pid = p.prospectId ?? null;
  if (aud === "client" && (typeof pid !== "string" || !UUID.test(pid))) errors.push({ path: "prospectId", reason: "khách riêng cần một nhu cầu khách" });
  if (aud === "agents" && pid !== null) errors.push({ path: "prospectId", reason: "gửi nhóm môi giới không gắn nhu cầu khách" });
  const ds = p.listingIds;
  if (!Array.isArray(ds) || ds.length === 0 || ds.length > MAX_SHARE_LISTINGS) {
    errors.push({ path: "listingIds", reason: `cần 1–${MAX_SHARE_LISTINGS} căn` });
  } else if (ds.some((x) => typeof x !== "string" || !UUID.test(x))) {
    errors.push({ path: "listingIds", reason: "cần mã hàng" });
  } else if (new Set(ds.map((x) => (x as string).toLowerCase())).size !== ds.length) {
    errors.push({ path: "listingIds", reason: "căn trùng" });
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { audience: aud as ShareAudience, prospectId: aud === "client" ? (pid as string) : null, listingIds: (ds as string[]).map((x) => x.toLowerCase()) } };
}

/**
 * Mã link `/s/<mã>`: 12 ký tự base64url (72 bit ngẫu nhiên). Web Crypto (không `node:crypto`) để màn Gửi nhập được lối
 * này ở trình duyệt (hàng 34) — chỉ API gọi hàm này.
 */
export function newShareCode(): string {
  const b = globalThis.crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_");
}
export const SHARE_CODE = /^[A-Za-z0-9_-]{12}$/;

/** Lần gửi như cơ sở dữ liệu và API giữ — có thể kèm nhu cầu, liên hệ, tên khách, số; phong bì không chép chúng. */
export type ShareRecord = {
  code: string;
  audience: ShareAudience;
  listingIds: readonly string[];
  senderUserId: string;
  [internal: string]: unknown;
};

export const SHARE_PUBLIC_KEYS = ["code", "audience", "listingIds", "senderUserId"] as const;
export type PublicEnvelope = { code: string; audience: ShareAudience; listingIds: string[]; senderUserId: string };

/** Phần của Lần gửi được ra trang khách — chép đúng `SHARE_PUBLIC_KEYS`, mọi khoá khác bị bỏ. */
export function publicEnvelope(r: ShareRecord): PublicEnvelope {
  return { code: r.code, audience: r.audience, listingIds: [...r.listingIds], senderUserId: r.senderUserId };
}

export * from "./tin";
export * from "./trang-khach";
