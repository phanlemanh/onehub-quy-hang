/**
 * Hàng cũ theo người (hàng Hôm nay của trưởng nhóm, AC-4): mỗi đầu chủ giữ một dòng — số căn đang mở, số căn cần gọi lại,
 * tỉ lệ tươi. «Cần gọi lại» đi đúng luật độ tươi (`freshness`, khoá `queue.call_back_after_days`); căn chưa xác nhận lần
 * nào cũng cần gọi lại, như nếp hàng đợi đầu chủ (mốc chưa có thì «quá ngày» là đúng). Lõi không đọc đồng hồ.
 */
import { CAU_HINH_SAN_MAC_DINH, type CauHinhSan } from "../config/giai";
import { freshness } from "../listing/freshness";
import type { DuKienCan } from "./kieu";

/** Dữ kiện tối thiểu của một căn để đếm hàng cũ — cùng tên trường với `DuKienCan`. */
export type CanHangCu = Pick<DuKienCan, "standardStatus" | "listAgentKey" | "lastConfirmedAt">;

/** Một dòng của bảng theo đầu chủ; `userId: null` là dòng «Chưa có người giữ». `tiLeTuoi` trong 0..1, không căn mở là 1. */
export type DongHangCu = { userId: string | null; mo: number; canGoiLai: number; tiLeTuoi: number };

/** Đã bán và Ngừng hẳn là nấc cuối — không còn là hàng để giữ tươi. */
const daDong = (c: CanHangCu) => c.standardStatus === "Closed" || c.standardStatus === "Withdrawn";

/** Căn cần gọi lại: chưa xác nhận lần nào, hay đã quá số ngày gọi lại của sàn. */
const canGoiLai = (c: CanHangCu, homNay: string, cauHinh: CauHinhSan) => {
  const f = freshness(c.lastConfirmedAt, homNay, cauHinh);
  return !f.confirmed || f.needsCallBack;
};

/** Gom căn đang mở theo người giữ. Thứ tự dòng: theo mã người, dòng chưa có người giữ cuối. `homNay` là YYYY-MM-DD. */
export function hangCuTheoNguoi(can: readonly CanHangCu[], homNay: string, cauHinh: CauHinhSan = CAU_HINH_SAN_MAC_DINH): DongHangCu[] {
  const theoNguoi = new Map<string | null, { mo: number; canGoiLai: number }>();
  for (const c of can) {
    if (daDong(c)) continue;
    const d = theoNguoi.get(c.listAgentKey) ?? { mo: 0, canGoiLai: 0 };
    d.mo += 1;
    if (canGoiLai(c, homNay, cauHinh)) d.canGoiLai += 1;
    theoNguoi.set(c.listAgentKey, d);
  }
  return [...theoNguoi.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : a < b ? -1 : a > b ? 1 : 0))
    .map(([userId, d]) => ({ userId, mo: d.mo, canGoiLai: d.canGoiLai, tiLeTuoi: d.mo === 0 ? 1 : (d.mo - d.canGoiLai) / d.mo }));
}

/** Ô «Hàng cũ»: tổng căn cần gọi lại của mọi dòng, kể cả dòng chưa có người giữ. */
export function tongCanGoiLai(dong: readonly DongHangCu[]): number {
  return dong.reduce((t, d) => t + d.canGoiLai, 0);
}
