import { createHash, randomBytes } from "node:crypto";
import type pg from "pg";
import { withCompany } from "../db";

/**
 * Token máy của kết nối (hàng 96). 32 byte ngẫu nhiên nên băm một lượt SHA-256 là đủ và tra được theo băm; chuỗi rõ chỉ
 * tồn tại trong phản hồi cấp, không vào cơ sở dữ liệu, không vào nhật ký.
 */
const TOKEN_DUNG_DANG = /^qhm_[A-Za-z0-9_-]{43}$/;

export function bamToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function taoToken(): { token: string; hash: string; displayPrefix: string } {
  const ngauNhien = randomBytes(32).toString("base64url");
  const token = `qhm_${ngauNhien}`;
  return { token, hash: bamToken(token), displayPrefix: ngauNhien.slice(0, 8) };
}

/** Giá trị của header `Authorization` kiểu Bearer; kiểu khác trả `null`, Bearer không giá trị trả token rỗng. */
export function docBearer(header: string | undefined): { token: string } | null {
  if (header === undefined) return null;
  const m = /^bearer(?:\s+(.*))?$/i.exec(header.trim());
  return m ? { token: (m[1] ?? "").trim() } : null;
}

export type TokenDaTra = { tokenId: string; companyId: string; agreementId: string; revoked: boolean };

/** Tra token khi chưa biết sàn. Sai dạng trả `null` mà không chạm cơ sở dữ liệu. */
export async function traToken(pool: pg.Pool, token: string): Promise<TokenDaTra | null> {
  if (!TOKEN_DUNG_DANG.test(token)) return null;
  const row = await withCompany(pool, { userId: "", companyId: null }, async (tx) => {
    const { rows } = await tx.query<{ token_id: string; company_id: string; agreement_id: string; revoked: boolean }>(
      "select token_id, company_id, agreement_id, revoked from app.machine_token_by_hash($1)",
      [bamToken(token)],
    );
    return rows[0];
  });
  return row ? { tokenId: row.token_id, companyId: row.company_id, agreementId: row.agreement_id, revoked: row.revoked } : null;
}
