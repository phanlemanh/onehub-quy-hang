// Màn Mẫu (hàng mau-bang-hang-va-bai): chữ và hàm thuần của hai tab «Mẫu bảng hàng», «Mẫu bài». Khuôn, trần và cách bọc
// bài ở lõi (`@quy-hang/core/export`); màn chỉ dựng, xếp và gửi nguyên khối.
import {
  baiFacebook,
  bocBai,
  COT_BANG_HANG,
  KENH_BAI,
  TRAN_MAU,
  xuatBang,
  type CotBangHang,
  type KenhBai,
  type LoiMauBai,
  type MauBai,
  type MauBang,
} from "@quy-hang/core/export";
import { baiZalo } from "@quy-hang/core/export";
import type { CanNoiBo } from "@quy-hang/core/redaction";

export const CHU_MAU = {
  tabNhap: "Mẫu nhập",
  tabBang: "Mẫu bảng hàng",
  tabBai: "Mẫu bài",
  dangTai: "Đang tải mẫu…",
  trongBang: "Sàn chưa có mẫu bảng hàng — xuất đang theo góc nhìn đang mở.",
  loiDoc: "Chưa đọc được mẫu — thử lại",
  loiLuu: "Chưa lưu được — thử lại",
  daLuu: "Đã lưu mẫu",
  thuLai: "Thử lại",
  them: "Thêm mẫu",
  sua: "Sửa",
  xoa: "Xoá",
  luu: "Lưu",
  huy: "Huỷ",
  ten: "Tên mẫu",
  cot: "Cột, theo thứ tự khi xuất",
  len: "Lên",
  xuong: "Xuống",
  soCot: (n: number) => `${n} cột`,
  xoaHoi: (ten: string) => `Xoá mẫu «${ten}»?`,
  xoaMoTa: "Lần xuất kế tiếp không còn mẫu này; lần đã xuất không đổi.",
  dau: "Lời mở đầu",
  cuoi: "Lời kết",
  veMacDinh: "Về mặc định",
  xemTruoc: "Xem trước",
  toiDa: `Tối đa ${TRAN_MAU.loi} ký tự`,
  demKyTu: (n: number) => `${n}/${TRAN_MAU.loi}`,
  kenh: { zalo: "Zalo", facebook: "Facebook" } satisfies Record<KenhBai, string>,
} as const;

/** Cột chọn được của hộp sửa, theo thứ tự của bảng hàng, kèm nhãn. */
export const LUA_CHON_COT: readonly { id: CotBangHang; nhan: string }[] = (Object.keys(COT_BANG_HANG) as CotBangHang[])
  .filter((k) => COT_BANG_HANG[k].khoa !== null)
  .map((id) => ({ id, nhan: COT_BANG_HANG[id].nhan }));

export const nhanCot = (id: CotBangHang): string => COT_BANG_HANG[id].nhan;

/** Đổi chỗ cột thứ `i` với cột liền trên (-1) hay liền dưới (1); ở biên thì giữ nguyên. */
export function doiCho(cot: readonly CotBangHang[], i: number, huong: -1 | 1): CotBangHang[] {
  const j = i + huong;
  const ra = [...cot];
  if (i < 0 || i >= ra.length || j < 0 || j >= ra.length) return ra;
  [ra[i], ra[j]] = [ra[j]!, ra[i]!];
  return ra;
}

/** Bật hay tắt một cột: tắt thì bỏ khỏi dãy, bật thì thêm vào cuối. */
export const batTatCot = (cot: readonly CotBangHang[], id: CotBangHang): CotBangHang[] => (cot.includes(id) ? cot.filter((c) => c !== id) : [...cot, id]);

/** Thân PUT của mẫu bảng sau khi lưu một mẫu (thêm mới hay thay theo id), hay sau khi xoá (`null`). */
export function thanPutBang(ds: readonly MauBang[], mau: MauBang, xoa = false): { templates: MauBang[] } {
  if (xoa) return { templates: ds.filter((m) => m.id !== mau.id) };
  return { templates: ds.some((m) => m.id === mau.id) ? ds.map((m) => (m.id === mau.id ? mau : m)) : [...ds, mau] };
}

/** Thân PUT của mẫu bài: đặt lời cho một kênh, hay `null` = về mặc định (bỏ khoá của kênh, giữ kênh kia). */
export function thanPutBai(mau: MauBai, kenh: KenhBai, loi: LoiMauBai | null): { templates: MauBai } {
  const ra: MauBai = {};
  for (const k of KENH_BAI) if (k !== kenh && mau[k]) ra[k] = mau[k];
  if (loi) ra[kenh] = loi;
  return { templates: ra };
}

/** Lý do dưới ô lời mẫu (null = hợp lệ). */
export const loiO = (chu: string): string | null => (chu.length > TRAN_MAU.loi ? CHU_MAU.toiDa : null);

const HAI_CAN = (() => {
  const c = { buildingName: "[Tên] Toà A", unitNumber: "A-12.05", livingArea: 68.5, bedroomsTotal: 2, listPrice: 3_250_000_000, standardStatus: "Active", photos: [] };
  return [c, { ...c, unitNumber: "A-08.02", livingArea: 55, bedroomsTotal: 1, listPrice: 2_100_000_000 }];
})();

/** Xem trước bài của một kênh với hai căn mẫu `[Tên]`, bọc bằng chính hàm của lõi. */
export function xemTruocBai(kenh: KenhBai, loi: LoiMauBai | undefined, tenSan = "[Tên sàn]"): string {
  const bang = xuatBang(HAI_CAN as unknown as CanNoiBo[], {
    mau: "xlsx",
    nguoiNhan: "nhom_moi_gioi",
    cot: ["unitNumber", "livingArea", "listPrice"],
    today: "2026-11-07",
    tenSan,
  });
  return kenh === "zalo" ? bocBai(baiZalo(bang), loi) : baiFacebook(bang, tenSan, loi);
}

export type TrangThaiMauSan<T> = { kieu: "dang-tai" } | { kieu: "loi" } | { kieu: "xong"; giaTri: T };

/** Câu sau khi lưu: 200 → đã lưu; 400 → lý do của máy chủ; còn lại → lỗi lưu. */
export function sauKhiLuuMau(kq: { status: number; reason?: string } | null): { ok: true; cau: string } | { ok: false; cau: string } {
  if (kq && kq.status === 200) return { ok: true, cau: CHU_MAU.daLuu };
  if (kq && kq.status === 400 && kq.reason) return { ok: false, cau: lyDoChoNguoi(kq.reason) };
  return { ok: false, cau: CHU_MAU.loiLuu };
}

/** Lý do của máy chủ (mở đầu bằng khoá) đổi sang câu cho người: bỏ phần khoá. */
export const lyDoChoNguoi = (lyDo: string): string => {
  const sau = lyDo.replace(/^[^:]*:\s*/, "");
  if (/đã có trong sàn/.test(sau)) return "Tên đã có trong sàn";
  return sau.charAt(0).toLocaleUpperCase("vi") + sau.slice(1);
};
