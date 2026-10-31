import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from "node:crypto";

/**
 * Mã hoá số chủ ở mức trường (hàng 62, ADR-0013). Khoá `OWNER_PHONE_KEY` chỉ nằm ở môi trường chạy app, không bao giờ
 * vào cơ sở dữ liệu: bảng và bản sao lưu chỉ giữ bản mã. Bản mã `0x01 ‖ nonce 12 ‖ thẻ 16 ‖ thân` (AES-256-GCM), gắn đúng
 * dòng bằng ngữ cảnh (dữ liệu xác thực kèm) — chép sang hàng hay sàn khác thì không giải được.
 */

export type KhoaSoChu = { key: Buffer };

const PHIEN_BAN = 0x01;
const NONCE = 12;
const THE = 16;
const LOI_GIAI = "bản mã số chủ không giải được";
const NHAN_DAU_VET = "quy-hang/owner-phone-hash/v1";

/** Ngữ cảnh của bản mã chủ nhà: sàn và hàng của dòng `listing_owners`. */
export const nguCanhChuNha = (companyId: string, listingId: string) => `listing_owners:${companyId}:${listingId}`;

/** Mã hoá một số đã chuẩn hoá; mỗi lần một nonce mới. */
export function maHoaSo(so: string, nguCanh: string, khoa: KhoaSoChu): Buffer {
  const nonce = randomBytes(NONCE);
  const c = createCipheriv("aes-256-gcm", khoa.key, nonce, { authTagLength: THE });
  c.setAAD(Buffer.from(nguCanh, "utf8"));
  const than = Buffer.concat([c.update(so, "utf8"), c.final()]);
  return Buffer.concat([Buffer.from([PHIEN_BAN]), nonce, c.getAuthTag(), than]);
}

/** Giải bản mã; sai khuôn, sai ngữ cảnh, sai khoá hay bị sửa đều ném cùng một thông điệp — không mang số, không mang khoá. */
export function giaiMaSo(banMa: Buffer, nguCanh: string, khoa: KhoaSoChu): string {
  if (banMa.length <= 1 + NONCE + THE || banMa[0] !== PHIEN_BAN) throw new Error(LOI_GIAI);
  try {
    const d = createDecipheriv("aes-256-gcm", khoa.key, banMa.subarray(1, 1 + NONCE), { authTagLength: THE });
    d.setAAD(Buffer.from(nguCanh, "utf8"));
    d.setAuthTag(banMa.subarray(1 + NONCE, 1 + NONCE + THE));
    return Buffer.concat([d.update(banMa.subarray(1 + NONCE + THE)), d.final()]).toString("utf8");
  } catch {
    throw new Error(LOI_GIAI);
  }
}

/**
 * Dấu vết để kiểm trùng mà không cần số: HMAC-SHA256 theo sàn, khoá con suy từ khoá mã hoá bằng HKDF. Không thử ngược
 * được khi thiếu khoá; dấu vết hai sàn không nối được với nhau.
 */
export function dauVetSo(so: string, companyId: string, khoa: KhoaSoChu): Buffer {
  const khoaCon = Buffer.from(hkdfSync("sha256", khoa.key, Buffer.alloc(0), NHAN_DAU_VET, 32));
  return createHmac("sha256", khoaCon).update(`${companyId}:${so}`).digest();
}

/** Bốn dạng của một số `0xxxxxxxxx` mà người đọc có thể gặp; trả dạng đầu tiên có trong chữ, không có → `null`. */
export function timDangSo(chu: string, so: string): string | null {
  const duoi = so.slice(1);
  const dang = [so, `${so.slice(0, 4)} ${so.slice(4, 7)} ${so.slice(7)}`, `+84${duoi}`, `84${duoi}`];
  return dang.find((d) => chu.includes(d)) ?? null;
}
