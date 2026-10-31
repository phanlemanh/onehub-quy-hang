/**
 * Khuôn chặt của lệnh ghi chủ nhà (AC-4): đúng ba khoá; số Việt Nam chuẩn hoá về 10 chữ số bắt đầu bằng 0; giá đáy là số
 * đồng nguyên dương.
 */
import type { PayloadError } from "../listing";
import { OWNER_FIELDS } from "./owner-fields";

export type OwnerInput = { ownerName: string; ownerPhone?: string; floorPrice?: number };
export type OwnerInputResult = { ok: true; value: OwnerInput } | { ok: false; errors: PayloadError[] };

const LOI_SO = "cần số điện thoại Việt Nam 10 chữ số";

/** `+84 900 000 012`, `0900.000.012`, `84900000012` → `0900000012`; sai dạng → `null`. */
export function normalizePhone(v: unknown): string | null {
  if (typeof v !== "string") return null;
  let s = v.replace(/[\s.\-()]/g, "");
  if (s.startsWith("+84")) s = `0${s.slice(3)}`;
  else if (s.startsWith("84") && s.length === 11) s = `0${s.slice(2)}`;
  return /^0\d{9}$/.test(s) ? s : null;
}

export function validateOwnerInput(payload: unknown): OwnerInputResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { ok: false, errors: [{ path: "payload", reason: "cần một đối tượng" }] };
  const p = payload as Record<string, unknown>;
  const errors: PayloadError[] = [];
  for (const k of Object.keys(p)) if (!(k in OWNER_FIELDS)) errors.push({ path: k, reason: "khoá lạ" });
  const ten = p.ownerName;
  if (!("ownerName" in p)) errors.push({ path: "ownerName", reason: "thiếu" });
  else if (typeof ten !== "string" || ten.trim().length === 0 || ten.length > 200) errors.push({ path: "ownerName", reason: "cần chữ, 1–200 ký tự" });
  let so: string | undefined;
  if ("ownerPhone" in p) {
    const n = normalizePhone(p.ownerPhone);
    if (n) so = n;
    else errors.push({ path: "ownerPhone", reason: LOI_SO });
  }
  if ("floorPrice" in p && !(typeof p.floorPrice === "number" && Number.isSafeInteger(p.floorPrice) && p.floorPrice > 0)) {
    errors.push({ path: "floorPrice", reason: "cần số đồng nguyên dương" });
  }
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: { ownerName: ten as string, ...(so !== undefined && { ownerPhone: so }), ...("floorPrice" in p && { floorPrice: p.floorPrice as number }) },
  };
}
