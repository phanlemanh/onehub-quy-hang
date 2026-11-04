/**
 * Dấu «máy bị báo mất» (hàng 38, luật 32): «Báo mất máy» thu mọi phiên khác của người và ghi dấu cho từng phiên bị thu
 * (bảng `identity.reported_device`, migration 029). Máy bị báo lần đầu chạm máy chủ — trang trong vỏ đọc `/api/v1/me`,
 * bộ đồng bộ gửi hay kéo — nhận 401 mang mã `device_reported_lost` và mã người, rồi xoá kho của người ấy trên máy. Hết
 * phiên thường vẫn là 401 không mã: thay đổi chờ ở lại (dong-bo-tu-lanh AC-2).
 */
import { createHash } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import type pg from "pg";
import { SESSION_EXPIRES_SEC } from "./constants";

export const DEVICE_REPORTED_LOST = "device_reported_lost";

/** Mã phiên không bao giờ lưu thô — chỉ băm sha256 hex. */
export const bamPhien = (token: string) => createHash("sha256").update(token).digest("hex");

const TEN_COOKIE = ["qh.session_token", "__Secure-qh.session_token"];

/** Mã phiên trong cookie gửi lên: giá trị của cookie phiên, bỏ phần chữ ký sau dấu chấm. */
export function maPhienTuCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const phan of cookieHeader.split(";")) {
    const i = phan.indexOf("=");
    if (i < 0) continue;
    if (!TEN_COOKIE.includes(phan.slice(0, i).trim())) continue;
    let giaTri = phan.slice(i + 1).trim();
    try {
      giaTri = decodeURIComponent(giaTri);
    } catch {
      // giữ nguyên giá trị không giải được
    }
    const ma = giaTri.split(".")[0];
    if (ma) return ma;
  }
  return null;
}

/** Ghi dấu cho các phiên bị thu; hạn = lúc thu + hạn phiên, nên phiên bị thu không sống lâu hơn dấu của nó. */
export async function ghiDau(identityPool: pg.Pool, d: { tokens: string[]; userId: string; now: Date }): Promise<number> {
  if (d.tokens.length === 0) return 0;
  const het = new Date(d.now.getTime() + SESSION_EXPIRES_SEC * 1000);
  const r = await identityPool.query(
    `insert into identity.reported_device (token_hash, user_id, reported_at, expires_at)
     select unnest($1::text[]), $2, $3, $4
     on conflict (token_hash) do update set reported_at = excluded.reported_at, expires_at = excluded.expires_at`,
    [d.tokens.map(bamPhien), d.userId, d.now, het],
  );
  return r.rowCount ?? 0;
}

/** Dấu còn hạn của một mã phiên; dấu quá hạn coi như không có. */
export async function docDau(identityPool: pg.Pool, token: string, now: Date): Promise<{ userId: string } | null> {
  const r = await identityPool.query<{ user_id: string }>(
    "select user_id from identity.reported_device where token_hash = $1 and expires_at > $2",
    [bamPhien(token), now],
  );
  return r.rows[0] ? { userId: r.rows[0].user_id } : null;
}

/**
 * Lời gọi mang cookie phiên mà đường trả 401: phiên ấy có dấu thì đổi thân thành mã máy bị báo kèm mã người. Đọc mã phiên
 * từ cookie gửi lên — không từ phản hồi, vì better-auth có thể xoá cookie khi phiên không còn.
 */
export function chanMayBiBao(identityPool: pg.Pool, dongHo: () => Date = () => new Date()): MiddlewareHandler {
  return async (c, next) => {
    await next();
    if (c.res.status !== 401) return;
    const token = maPhienTuCookie(c.req.header("cookie"));
    if (!token) return;
    const dau = await docDau(identityPool, token, dongHo()).catch(() => null);
    if (dau) c.res = c.json({ error: DEVICE_REPORTED_LOST, userId: dau.userId }, 401);
  };
}
