// Tệp tải về của trang nhóm môi giới (hàng 44): Excel và ảnh dựng trên máy người mở, từ chính thân trang đã qua luật ẩn
// (Hỏi-6). Cột và ô đọc `than.cot`, `than.dong` của lõi — một nguồn với bảng trang, nên tệp ra «đúng những cột ấy». Phần
// đầu tệp: tên sàn, định nghĩa phí, mức chia (khi lõi trả — sàn ẩn thì lõi đã bỏ khoá).
import { ghiXlsx } from "@quy-hang/core/export";
import { cauDinhNghiaPhi, cauMucChia } from "@quy-hang/core/sharing";
import type { ThanTrang } from "../[code]/doc";

export type MoHinhTep = { dau: string[]; cot: string[]; dong: string[][] };

/** Mô hình chung của Excel và ảnh. */
export function moHinhTep(than: ThanTrang): MoHinhTep {
  const dau = [than.companyName];
  if (than.dinhNghiaPhi) dau.push(cauDinhNghiaPhi(than.dinhNghiaPhi));
  if (than.mucChia !== undefined) dau.push(cauMucChia(than.mucChia));
  return { dau, cot: (than.cot ?? []).map((c) => c.nhan), dong: than.dong ?? [] };
}

/** Excel: các dòng đầu (mỗi dòng một ô), một dòng trống, dòng tiêu đề cột, rồi mỗi căn một dòng. */
export function xlsxMoiGioi(m: MoHinhTep): Uint8Array {
  const [tieuDe = "", ...conLai] = m.dau;
  return ghiXlsx({ cot: [tieuDe], dong: [...conLai.map((s) => [s]), [], m.cot, ...m.dong] }, "Bảng hàng");
}

/** Phần canvas mà bộ vẽ dùng — bài kiểm truyền canvas giả ghi lại lệnh vẽ chữ. */
export type ButVe = {
  font: string;
  fillStyle: string;
  textBaseline: string;
  measureText(s: string): { width: number };
  fillText(s: string, x: number, y: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  scale(x: number, y: number): void;
};
export type ToVe = { width: number; height: number; getContext(k: "2d"): ButVe | null };

const PHONG = "14px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const PHONG_DAM = `600 ${PHONG}`;
const DEM = 12;
const CAO = 30;
const TY_LE = 2;

/**
 * Vẽ phần đầu rồi bảng lên một tờ. Màu là màu của tệp (nền trắng, chữ đen để gửi Zalo), không theo theme. Trả tờ đã vẽ.
 */
export function veMoiGioi(m: MoHinhTep, taoTo: () => ToVe): ToVe {
  const soCot = m.cot.length;
  const do_ = taoTo().getContext("2d");
  if (!do_) throw new Error("Trình duyệt không vẽ được ảnh");
  const rongCot = Array.from({ length: soCot }, () => 0);
  [m.cot, ...m.dong].forEach((dong, r) =>
    dong.forEach((s, c) => {
      do_.font = r === 0 ? PHONG_DAM : PHONG;
      rongCot[c] = Math.max(rongCot[c] ?? 0, Math.ceil(do_.measureText(s).width) + DEM * 2);
    }),
  );
  do_.font = PHONG_DAM;
  const rongDau = Math.max(0, ...m.dau.map((s) => Math.ceil(do_.measureText(s).width) + DEM * 2));
  const rong = Math.max(1, rongDau, rongCot.reduce((a, b) => a + b, 0));
  const caoDau = m.dau.length * CAO;
  const cao = caoDau + (1 + m.dong.length) * CAO;

  const to = taoTo();
  to.width = rong * TY_LE;
  to.height = cao * TY_LE;
  const ctx = to.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không vẽ được ảnh");
  ctx.scale(TY_LE, TY_LE);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, rong, cao);
  ctx.textBaseline = "middle";
  m.dau.forEach((s, i) => {
    ctx.font = i === 0 ? PHONG_DAM : PHONG;
    ctx.fillStyle = "black";
    ctx.fillText(s, DEM, i * CAO + CAO / 2);
  });
  ctx.fillStyle = "whitesmoke";
  ctx.fillRect(0, caoDau, rong, CAO);
  [m.cot, ...m.dong].forEach((dong, r) =>
    dong.forEach((s, c) => {
      ctx.font = r === 0 ? PHONG_DAM : PHONG;
      ctx.fillStyle = "black";
      ctx.fillText(s, rongCot.slice(0, c).reduce((a, b) => a + b, 0) + DEM, caoDau + r * CAO + CAO / 2);
    }),
  );
  return to;
}

/** Ảnh PNG trong trình duyệt. */
export function anhMoiGioi(m: MoHinhTep): Promise<Blob> {
  const to = veMoiGioi(m, () => document.createElement("canvas") as unknown as ToVe) as unknown as HTMLCanvasElement;
  return new Promise((ok, loi) => to.toBlob((b) => (b ? ok(b) : loi(new Error("Không dựng được ảnh"))), "image/png"));
}
