import type { Nhom } from "@quy-hang/core/today";

/**
 * Một dòng việc của Hôm nay đầu chủ (hàng 92, quyết định 14A): mốc màu của ô hạn và bảng nút — đúng một nút chính là việc
 * đầu của nhóm, việc còn lại vào ⋯. Thuần, không React, để ô và bộ kiểm cùng đọc một bảng.
 */

/** Còn dưới mốc này là «sắp tới hạn» (vàng). */
export const PHUT_SAP_HAN = 15;

export type MucHan = "qua" | "sap" | "thuong" | "khong";

/** Mốc màu của hạn: đã quá đỏ, còn dưới 15 phút vàng, từ 15 phút trở lên thường, không hạn thì không dòng hạn. */
export function mucHan(hanIso: string | null | undefined, bayGio: string, phutSap = PHUT_SAP_HAN): MucHan {
  if (!hanIso) return "khong";
  const con = Date.parse(hanIso) - Date.parse(bayGio);
  if (con < 0) return "qua";
  return con < phutSap * 60_000 ? "sap" : "thuong";
}

export type MaViec = "nhan" | "da-goi" | "con-giu-gia" | "ghi-cuoc-goi" | "tra-lai" | "doi-gia-trang-thai" | "mo-so";

export const NHAN_VIEC: Readonly<Record<MaViec, string>> = {
  nhan: "Nhận",
  "da-goi": "Đã gọi",
  "con-giu-gia": "Còn · giữ giá",
  "ghi-cuoc-goi": "Ghi cuộc gọi",
  "tra-lai": "Trả lại",
  "doi-gia-trang-thai": "Mở hồ sơ",
  "mo-so": "Mở số",
};

type NhomViec = Pick<Nhom, "code" | "actions">;
export type ViecDong =
  | { kind: "can"; nhom: NhomViec }
  | { kind: "lead"; nhom: NhomViec; stage: string };

const co = (n: NhomViec, a: string) => (n.actions as readonly string[]).includes(a);

/** Mọi việc hàng 22 cho dòng này, theo thứ tự hiện — bản gốc của bảng nút. */
export function viecCuaDong(v: ViecDong): MaViec[] {
  if (v.kind === "can") {
    const ds: MaViec[] = [];
    if (co(v.nhom, "owner_confirmed")) ds.push("con-giu-gia");
    if (co(v.nhom, "open_record")) ds.push("doi-gia-trang-thai");
    if (v.nhom.code === "price_adjustment") ds.push("ghi-cuoc-goi");
    return ds;
  }
  const ds: MaViec[] = [];
  if (co(v.nhom, "accept") && v.stage === "sent") ds.push("nhan");
  if (co(v.nhom, "first_call")) ds.push("da-goi");
  ds.push("ghi-cuoc-goi");
  if (co(v.nhom, "return")) ds.push("tra-lai");
  ds.push("mo-so");
  return ds;
}

/** Nút chính là việc đầu của nhóm (ngưỡng đã ký: Nhận · Đã gọi · Còn · giữ giá); mọi việc khác vào ⋯. */
export function nutCuaViec(v: ViecDong): { chinh: MaViec | null; phu: MaViec[] } {
  const ds = viecCuaDong(v);
  const [chinh = null, ...phu] = ds;
  return { chinh, phu };
}
