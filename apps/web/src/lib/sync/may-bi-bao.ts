/**
 * Máy bị báo mất (hàng 38, luật 32): máy chủ trả 401 kèm mã `device_reported_lost` và mã người khi phiên của máy này đã
 * bị thu qua «Báo mất máy». Máy này xoá kho của đúng người ấy (kể cả thay đổi chưa gửi), huỷ đăng ký thông báo, rồi về
 * màn đăng nhập. Kho của người khác trên cùng máy không bị đụng (Hỏi-4). Hết phiên thường — 401 không mã — không đi lối
 * này: bộ đồng bộ giữ hàng đợi như cũ (dong-bo-tu-lanh AC-2).
 */
import { huyDangKyTrenMay } from "../push/dang-ky";
import { xoaKhoCuaNguoi } from "./kho-indexeddb";
import type { Goi } from "./types";

export const DEVICE_REPORTED_LOST = "device_reported_lost";

/** Đích sau khi xoá: màn đăng nhập mang lời «Máy này đã bị báo mất». */
export const dichBiBao = (userId: string) => `/login?bi-bao-mat=1&u=${encodeURIComponent(userId)}`;

/**
 * Người cần xoá kho ở màn đăng nhập: chỉ khi máy chủ xác nhận phiên trên CHÍNH máy này mang dấu bị báo của đúng người
 * trong đường dẫn. Đường dẫn trần (`?bi-bao-mat=1&u=…`) gửi từ nơi khác không xoá được kho của ai, kể cả thay đổi chưa gửi.
 */
export function nguoiCanXoa(q: { "bi-bao-mat"?: unknown; u?: unknown }, biBaoTuMayChu: string | null): string | null {
  return q["bi-bao-mat"] === "1" && typeof q.u === "string" && q.u !== "" && q.u === biBaoTuMayChu ? q.u : null;
}

/** Mã người bị báo khi phản hồi là 401 mang mã máy bị báo; còn lại null. */
export function maNguoiBiBao(r: { status: number; body: unknown }): string | null {
  if (r.status !== 401 || !r.body || typeof r.body !== "object") return null;
  const b = r.body as { error?: unknown; userId?: unknown };
  return b.error === DEVICE_REPORTED_LOST && typeof b.userId === "string" && b.userId ? b.userId : null;
}

/**
 * Bọc hàm gọi của bộ đồng bộ: phản hồi mang mã máy bị báo thì gọi `khiBiBao` đúng một lần, KHÔNG chờ nó — `khiBiBao` khép
 * bộ đồng bộ rồi chờ lượt đang chạy xong (lượt ấy đang chờ chính lời gọi này), sau đó mới xoá kho. Phản hồi trả nguyên
 * cho bộ đồng bộ; bộ đã khép nên lượt đang bay không ghi lại được gì vào kho.
 */
export function bocGoiBiBao(goi: Goi, khiBiBao: (userId: string) => Promise<void>): Goi {
  let daBao = false;
  return async (...a) => {
    const r = await goi(...a);
    const u = maNguoiBiBao(r);
    if (u && !daBao) {
      daBao = true;
      void khiBiBao(u).catch(() => {});
    }
    return r;
  };
}

export type XoaMayDeps = { xoaKho: (userId: string) => Promise<void>; huyDay: () => Promise<void> };

/** Xoá kho của người bị báo và huỷ đăng ký thông báo trên trình duyệt; lỗi huỷ đăng ký không chặn việc xoá kho. */
export async function xoaMayBiBao(userId: string, deps: XoaMayDeps = { xoaKho: xoaKhoCuaNguoi, huyDay: huyDangKyTrenMay }): Promise<void> {
  await deps.xoaKho(userId);
  await deps.huyDay().catch(() => {});
}
