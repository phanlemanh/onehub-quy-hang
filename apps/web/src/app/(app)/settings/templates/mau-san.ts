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
  // Báo mẫu hỏng (hàng man-mau-bao-mau-hong).
  hongTieuDe: (n: number) => `Mẫu đã lưu có ${n} chỗ không đọc được`,
  hongLuuKe: "Lần lưu kế sẽ bỏ hẳn những chỗ này; các mẫu khác giữ nguyên.",
  hongChung: "Một chỗ trong mẫu đã lưu không đọc được.",
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

/** `baoHong`: câu cho người về những chỗ trong mẫu đã lưu mà máy chủ bỏ khi đọc (rỗng hay vắng = không có). */
export type TrangThaiMauSan<T> = { kieu: "dang-tai" } | { kieu: "loi" } | { kieu: "xong"; giaTri: T; baoHong?: string[] };

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

// ── Báo mẫu hỏng (hàng man-mau-bao-mau-hong) ─────────────────────────────────────────────────────────────────────────
// Đáp GET của hai đường mẫu mang `errors`: mỗi chỗ bộ đọc khoan dung của lõi bỏ một dòng, mở đầu bằng khoá. Màn đổi từng
// dòng sang một câu cho người — không khoá kỹ thuật, cột nêu bằng nhãn — và nói trước lần lưu kế sẽ bỏ chúng (Hỏi-1).
// Dòng không nhận ra khuôn thành câu chung, không bị bỏ.

const nhanCotLa = (ds: string): string =>
  ds
    .split(",")
    .map((c) => c.trim())
    .map((c) => (Object.prototype.hasOwnProperty.call(COT_BANG_HANG, c) ? COT_BANG_HANG[c as CotBangHang].nhan : "một cột lạ"))
    .join(", ");

/** Lý do bỏ một mẫu bảng (phần sau khoá của `loiMotMau` ở lõi) → câu cho người; null = không nhận ra. */
function lyDoBoMau(truong: string | undefined, lyDo: string): string | null {
  if (truong === undefined && /^phải là đối tượng/.test(lyDo)) return "sai khuôn";
  if (truong === "id") return "mã mẫu sai khuôn";
  if (truong === "name") {
    if (/^không được trống/.test(lyDo)) return "tên trống";
    const dai = /^tối đa (\d+) ký tự/.exec(lyDo);
    if (dai) return `tên dài quá ${dai[1]} ký tự`;
    const trung = /^(«.*») đã có trong sàn/.exec(lyDo);
    if (trung) return `tên ${trung[1]} trùng một mẫu đứng trước`;
  }
  if (truong === "columns") {
    if (/^cần ít nhất một cột/.test(lyDo)) return "không còn cột nào ra ngoài được";
    const nhieu = /^tối đa (\d+) cột/.exec(lyDo);
    if (nhieu) return `quá ${nhieu[1]} cột`;
    if (/^cột lạ/.test(lyDo)) return "có một cột lạ";
    const trung = /^cột (\S+) trùng/.exec(lyDo);
    if (trung) return `cột ${nhanCotLa(trung[1]!)} lặp lại`;
    const noiBo = /^(\S+) là cột nội bộ/.exec(lyDo);
    if (noiBo) return `cột ${nhanCotLa(noiBo[1]!)} là cột nội bộ`;
  }
  return null;
}

/** Lý do bỏ lời một kênh (phần sau khoá của `loiMotKenh`) → câu cho người; null = không nhận ra. */
function lyDoBoLoi(truong: string | undefined, lyDo: string): string | null {
  const ten = truong === "opening" ? "lời mở đầu" : truong === "closing" ? "lời kết" : null;
  if (truong === undefined && /^phải là đối tượng/.test(lyDo)) return "sai khuôn";
  if (ten && /^phải là chữ/.test(lyDo)) return `${ten} sai khuôn`;
  const dai = ten ? /^tối đa (\d+) ký tự/.exec(lyDo) : null;
  if (ten && dai) return `${ten} dài quá ${dai[1]} ký tự`;
  return null;
}

/** Một dòng lỗi của lõi → một câu cho người. */
export function cauMauHong(dong: string): string {
  if (/^export\.templates: phải là danh sách mẫu/.test(dong)) return "Toàn bộ mẫu bảng hàng đã lưu sai khuôn, không đọc được.";
  const qua = /^export\.templates: quá (\d+) mẫu/.exec(dong);
  if (qua) return `Có hơn ${qua[1]} mẫu bảng hàng — các mẫu từ thứ ${Number(qua[1]) + 1} bị bỏ.`;
  const khong = /^export\.templates\[(\d+)\]: không đọc được/.exec(dong);
  if (khong) return `Mẫu thứ ${Number(khong[1]) + 1} đã lưu không đọc được.`;
  const cot = /^export\.templates\[(\d+)\]\.columns: bỏ cột không ra ngoài (.+)$/.exec(dong);
  if (cot) return `Mẫu thứ ${Number(cot[1]) + 1}: bỏ cột ${nhanCotLa(cot[2]!)} — cột này không ra ngoài được.`;
  const mau = /^export\.templates\[(\d+)\](?:\.(\w+))?: (.+) — bỏ mẫu$/.exec(dong);
  if (mau) {
    const ly = lyDoBoMau(mau[2], mau[3]!);
    if (ly) return `Mẫu thứ ${Number(mau[1]) + 1} bị bỏ: ${ly}.`;
  }
  if (/^share\.post_templates: phải là đối tượng/.test(dong)) return "Toàn bộ mẫu bài đã lưu sai khuôn, không đọc được.";
  const kenh = /^share\.post_templates\.(\w+)(?:\.(\w+))?: (.+) — bỏ qua$/.exec(dong);
  if (kenh) {
    const k = kenh[1] as KenhBai;
    if (!(KENH_BAI as readonly string[]).includes(k)) return "Mẫu bài của một kênh không dùng được bị bỏ.";
    const ly = lyDoBoLoi(kenh[2], kenh[3]!);
    if (ly) return `Mẫu bài ${CHU_MAU.kenh[k]} bị bỏ: ${ly}.`;
  }
  return CHU_MAU.hongChung;
}

/** Mọi dòng lỗi của một đáp GET → câu cho người, cùng thứ tự, mỗi dòng một câu. */
export const loiMauHong = (errors: readonly unknown[]): string[] => errors.map((e) => (typeof e === "string" ? cauMauHong(e) : CHU_MAU.hongChung));

/** Đáp GET của một đường mẫu → trạng thái tab: 200 thì giữ `templates` và đổi `errors` thành câu báo. */
export function trangThaiTuDap<T>(dap: { ok: boolean; body: unknown } | null): TrangThaiMauSan<T> {
  if (!dap || !dap.ok || dap.body === null || typeof dap.body !== "object" || !("templates" in dap.body)) return { kieu: "loi" };
  const b = dap.body as { templates: T; errors?: unknown };
  return { kieu: "xong", giaTri: b.templates, baoHong: loiMauHong(Array.isArray(b.errors) ? b.errors : []) };
}
