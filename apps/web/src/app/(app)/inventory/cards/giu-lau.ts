/**
 * Máy trạng thái giữ lâu của thẻ (hàng 32) — thuần, đồng hồ do người gọi đưa vào (`t`, ms). Ngón xuống rồi giữ đủ
 * `nguong` mà không dời quá `dich` px → «giu-lau» (vào chế độ chọn); nhả sớm → «cham»; dời xa, cuộn hay huỷ → «huy».
 * Lần nhả sau «giu-lau» không phát «cham» (không mở hồ sơ).
 */
export type SuKien = { loai: "xuong" | "dich" | "len"; t: number; x: number; y: number } | { loai: "cuon" | "huy" | "dong-ho"; t: number };
export type Ra = "cham" | "giu-lau" | "huy";

export const NGUONG_GIU_LAU = 500;
export const DICH_TOI_DA = 10;

export function taoGiuLau(o: { nguong?: number; dich?: number } = {}) {
  const nguong = o.nguong ?? NGUONG_GIU_LAU;
  const dich = o.dich ?? DICH_TOI_DA;
  let goc: { t: number; x: number; y: number } | null = null;
  let daGiu = false;

  return {
    buoc(e: SuKien): Ra[] {
      if (e.loai === "xuong") {
        goc = { t: e.t, x: e.x, y: e.y };
        daGiu = false;
        return [];
      }
      if (!goc) return [];
      const ra: Ra[] = [];
      // Đủ ngưỡng trước sự kiện này thì phát «giu-lau» trước — đồng hồ có thể chưa kịp gõ.
      if (!daGiu && e.t - goc.t >= nguong) {
        daGiu = true;
        ra.push("giu-lau");
      }
      switch (e.loai) {
        case "dich":
          if (!daGiu && Math.hypot(e.x - goc.x, e.y - goc.y) > dich) {
            goc = null;
            ra.push("huy");
          }
          return ra;
        case "len":
          if (!daGiu) ra.push("cham");
          goc = null;
          return ra;
        case "cuon":
        case "huy":
          if (!daGiu) ra.push("huy");
          goc = null;
          return ra;
        case "dong-ho":
          return ra;
      }
    },
  };
}
