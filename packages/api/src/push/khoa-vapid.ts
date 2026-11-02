import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import type pg from "pg";
import webpush from "web-push";
import type { KhoaSoChu } from "../owners/ma-hoa";

/**
 * Khoá VAPID — không ai cầm khoá (hàng 26, ADR-0025). Máy chủ tự sinh cặp khoá P-256 ở lần dùng đầu, lưu ở bảng hệ thống
 * `push_vapid` qua hai hàm security definer: khoá công khai lưu thường, khoá riêng lưu bản mã AES-256-GCM bằng khoá con
 * HKDF của khoá mã hoá số chủ (cùng cách ADR-0013 suy khoá con cho dấu vết số). Không thêm biến môi trường; không ai sinh,
 * đọc, chép hay chuyển khoá bằng tay. Thông điệp lỗi không mang khoá.
 */
export type KhoaVapid = { publicKey: string; privateKey: string };

export const NHAN_KHOA_VAPID = "quy-hang/push-vapid/v1";
const PHIEN_BAN = 0x01;
const NONCE = 12;
const THE = 16;
/** Dữ liệu xác thực kèm: bản mã chỉ giải được ở đúng dòng của bảng khoá. */
const NGU_CANH = Buffer.from("push_vapid:1", "utf8");
const LOI_GIAI = "khoá VAPID không giải được";

/** Khoá con của khoá mã hoá số chủ, dành riêng cho khoá riêng VAPID. */
export const khoaConVapid = (goc: KhoaSoChu) => Buffer.from(hkdfSync("sha256", goc.key, Buffer.alloc(0), NHAN_KHOA_VAPID, 32));

/** Bản mã `0x01 ‖ nonce 12 ‖ thẻ 16 ‖ 32 byte khoá riêng`. */
export function maHoaKhoaRieng(privateKey: string, goc: KhoaSoChu): Buffer {
  const nonce = randomBytes(NONCE);
  const c = createCipheriv("aes-256-gcm", khoaConVapid(goc), nonce, { authTagLength: THE });
  c.setAAD(NGU_CANH);
  const than = Buffer.concat([c.update(Buffer.from(privateKey, "base64url")), c.final()]);
  return Buffer.concat([Buffer.from([PHIEN_BAN]), nonce, c.getAuthTag(), than]);
}

export function giaiKhoaRieng(banMa: Buffer, goc: KhoaSoChu): string {
  if (banMa.length <= 1 + NONCE + THE || banMa[0] !== PHIEN_BAN) throw new Error(LOI_GIAI);
  try {
    const d = createDecipheriv("aes-256-gcm", khoaConVapid(goc), banMa.subarray(1, 1 + NONCE), { authTagLength: THE });
    d.setAAD(NGU_CANH);
    d.setAuthTag(banMa.subarray(1 + NONCE, 1 + NONCE + THE));
    return Buffer.concat([d.update(banMa.subarray(1 + NONCE + THE)), d.final()]).toString("base64url");
  } catch {
    throw new Error(LOI_GIAI);
  }
}

type DongKhoa = { public_key: string; private_enc: Buffer };

/**
 * Cặp khoá của máy chủ trên client do withCompany trao. Bảng trống thì sinh rồi ghi qua `app.push_vapid_init`; hai lần
 * dùng đầu song song thì hàm giữ cặp ghi trước, bên sau nhận lại cặp ấy — luôn đúng một cặp.
 */
export async function khoaVapid(tx: pg.PoolClient, goc: KhoaSoChu): Promise<KhoaVapid> {
  let dong = (await tx.query<DongKhoa>("select public_key, private_enc from app.push_vapid_get()")).rows[0];
  if (!dong) {
    const moi = webpush.generateVAPIDKeys();
    dong = (
      await tx.query<DongKhoa>("select public_key, private_enc from app.push_vapid_init($1, $2)", [
        moi.publicKey,
        maHoaKhoaRieng(moi.privateKey, goc),
      ])
    ).rows[0]!;
  }
  return { publicKey: dong.public_key, privateKey: giaiKhoaRieng(dong.private_enc, goc) };
}
