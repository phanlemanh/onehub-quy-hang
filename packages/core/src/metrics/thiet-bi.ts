/**
 * Số đo thiết bị và mất mạng (hàng 52, hồ sơ ghi-thiet-bi-va-mat-mang): thao tác trên máy tính / điện thoại theo vai, và
 * lượt mất mạng của điện thoại kèm thao tác làm lúc mất mạng. Sự kiện thiếu thiết bị đếm riêng, không vào mẫu — tỉ lệ có
 * thiết bị đọc được bằng `(tong − khong-ro) / tong`. Ngưỡng không đặt ở đây (luật đợt 24).
 */
import { phanTram, trongKy, type Ky } from "./hang";
import type { GiaTriSoDo, HangVao, LuotMatMang } from "./kieu";

const PHUT_MS = 60 * 1000;
const motChuSo = (x: number) => Math.round(x * 10) / 10;

/** Vai của sự kiện không ghi vai nào. */
export const KHONG_VAI = "khong-vai";

/**
 * Thao tác trong kỳ theo thiết bị × vai: tử là thao tác trên điện thoại, mẫu là thao tác có thiết bị. Ô `<thiết bị>·<vai>`
 * đếm thao tác; người nhiều vai đếm vào mỗi vai. `khong-ro` là thao tác không rõ thiết bị, `tong` là mọi thao tác trong kỳ.
 */
export function thietBiTheoVai(hang: readonly HangVao[], ky: Ky): GiaTriSoDo {
  const chiTiet: Record<string, number> = { "khong-ro": 0, tong: 0 };
  let tu = 0;
  let mau = 0;
  for (const h of hang) {
    for (const e of h.events) {
      if (!trongKy(ky, e.occurredAt)) continue;
      chiTiet.tong!++;
      if (e.device !== "mobile" && e.device !== "desktop") {
        chiTiet["khong-ro"]!++;
        continue;
      }
      mau++;
      if (e.device === "mobile") tu++;
      const vai = e.actorRoles.length ? new Set(e.actorRoles) : [KHONG_VAI];
      for (const v of vai) {
        const o = `${e.device}·${v}`;
        chiTiet[o] = (chiTiet[o] ?? 0) + 1;
      }
    }
  }
  return { kieu: "ti-le", tu, mau, phanTram: phanTram(tu, mau), theoTrangThai: {}, chiTiet };
}

/**
 * Lượt mất mạng của điện thoại bắt đầu trong kỳ, kèm tổng phút và lượt dài nhất (phút, một chữ số lẻ như thời lượng lead);
 * `thaoTacLucMatMang` là thao tác trong kỳ làm lúc mất mạng trên điện thoại.
 */
export function matMangDienThoai(hang: readonly HangVao[], matMang: readonly LuotMatMang[], ky: Ky): GiaTriSoDo {
  let so = 0;
  let tongPhut = 0;
  let daiNhatPhut = 0;
  for (const l of matMang) {
    if (l.device !== "mobile" || !trongKy(ky, l.startedAt)) continue;
    const phut = motChuSo((Date.parse(l.endedAt) - Date.parse(l.startedAt)) / PHUT_MS);
    so++;
    tongPhut = motChuSo(tongPhut + phut);
    daiNhatPhut = Math.max(daiNhatPhut, phut);
  }
  let thaoTacLucMatMang = 0;
  for (const h of hang) {
    for (const e of h.events) if (e.madeOffline === true && e.device === "mobile" && trongKy(ky, e.occurredAt)) thaoTacLucMatMang++;
  }
  return { kieu: "dem", so, chiTiet: { tongPhut, daiNhatPhut, thaoTacLucMatMang } };
}
