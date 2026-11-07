/**
 * Mẫu của sàn (hàng mau-bang-hang-va-bai): mẫu bảng hàng — điểm #26 `export.templates` — và mẫu bài theo kênh — điểm #27
 * `share.post_templates` của sổ điểm biến thiên. Lõi giữ khuôn (kiểm nguyên khối khi ghi, đọc khoan dung khi dùng) và cách
 * bọc lời của sàn quanh bài dựng sẵn. Mẫu bảng chỉ chọn cột có khoá ra; bảng theo mẫu vẫn qua `cotRa` và `banRaNgoai` của
 * người nhận (bất biến 4). Lời mẫu là chữ tự do của sàn, không đọc trường nào của căn. Chạy được cả trong trình duyệt.
 */
import { sach } from "./bai";
import { COT_BANG_HANG, type CotBangHang } from "./cot";

export type MauBang = { id: string; ten: string; cot: CotBangHang[] };
export type LoiMauBai = { dau: string; cuoi: string };
export const KENH_BAI = ["zalo", "facebook"] as const;
export type KenhBai = (typeof KENH_BAI)[number];
export type MauBai = Partial<Record<KenhBai, LoiMauBai>>;

export const KHOA_MAU_BANG = "export.templates";
export const KHOA_MAU_BAI = "share.post_templates";
export const TRAN_MAU = { soMau: 20, soCot: 15, ten: 60, loi: 500 } as const;

/** Cột chọn được cho mẫu bảng: cột của bảng hàng có khoá ra — cột nội bộ (Người giữ, Giá chốt…) không có. */
export const COT_MAU_DUOC: readonly CotBangHang[] = (Object.keys(COT_BANG_HANG) as CotBangHang[]).filter((k) => COT_BANG_HANG[k].khoa !== null);
const DUOC = new Set<string>(COT_MAU_DUOC);
const LA_COT = (k: string) => Object.prototype.hasOwnProperty.call(COT_BANG_HANG, k);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const laDoiTuong = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const chuanTen = (s: string) => s.trim().toLocaleLowerCase("vi");

type Kiem<T> = { ok: true; giaTri: T } | { ok: false; lyDo: string };

/** Lỗi khuôn của một mẫu bảng (null = hợp lệ); `tenDaCo` là tên chuẩn hoá của các mẫu đứng trước. */
function loiMotMau(m: unknown, i: number, tenDaCo: Set<string>): string | null {
  const k = `${KHOA_MAU_BANG}[${i}]`;
  if (!laDoiTuong(m)) return `${k}: phải là đối tượng { id, ten, cot }`;
  if (typeof m.id !== "string" || !UUID.test(m.id)) return `${k}.id: phải là uuid`;
  if (typeof m.ten !== "string" || m.ten.trim() === "") return `${k}.ten: không được trống`;
  if (m.ten.trim().length > TRAN_MAU.ten) return `${k}.ten: tối đa ${TRAN_MAU.ten} ký tự`;
  if (tenDaCo.has(chuanTen(m.ten))) return `${k}.ten: «${m.ten.trim()}» đã có trong sàn`;
  if (!Array.isArray(m.cot) || m.cot.length === 0) return `${k}.cot: cần ít nhất một cột`;
  if (m.cot.length > TRAN_MAU.soCot) return `${k}.cot: tối đa ${TRAN_MAU.soCot} cột`;
  const thay = new Set<string>();
  for (const c of m.cot) {
    if (typeof c !== "string" || !LA_COT(c)) return `${k}.cot: cột lạ ${JSON.stringify(c)}`;
    if (!DUOC.has(c)) return `${k}.cot: ${c} là cột nội bộ, không ra ngoài`;
    if (thay.has(c)) return `${k}.cot: cột ${c} trùng`;
    thay.add(c);
  }
  return null;
}

/** Kiểm nguyên khối khi ghi: một mẫu sai thì cả lần ghi bị từ chối, lý do mở đầu bằng khoá sai. */
export function kiemMauBang(v: unknown): Kiem<MauBang[]> {
  if (!Array.isArray(v)) return { ok: false, lyDo: `${KHOA_MAU_BANG}: phải là danh sách mẫu` };
  if (v.length > TRAN_MAU.soMau) return { ok: false, lyDo: `${KHOA_MAU_BANG}: tối đa ${TRAN_MAU.soMau} mẫu` };
  const ten = new Set<string>();
  const ra: MauBang[] = [];
  for (const [i, m] of v.entries()) {
    const loi = loiMotMau(m, i, ten);
    if (loi) return { ok: false, lyDo: loi };
    const mm = m as MauBang;
    ten.add(chuanTen(mm.ten));
    ra.push({ id: mm.id, ten: mm.ten.trim(), cot: [...mm.cot] });
  }
  return { ok: true, giaTri: ra };
}

function loiMotKenh(kenh: string, l: unknown): string | null {
  const k = `${KHOA_MAU_BAI}.${kenh}`;
  if (!(KENH_BAI as readonly string[]).includes(kenh)) return `${k}: kênh lạ — chỉ ${KENH_BAI.join(", ")}`;
  if (!laDoiTuong(l)) return `${k}: phải là đối tượng { dau, cuoi }`;
  for (const p of ["dau", "cuoi"] as const) {
    if (typeof l[p] !== "string") return `${k}.${p}: phải là chữ`;
    if ((l[p] as string).length > TRAN_MAU.loi) return `${k}.${p}: tối đa ${TRAN_MAU.loi} ký tự`;
  }
  return null;
}

export function kiemMauBai(v: unknown): Kiem<MauBai> {
  if (!laDoiTuong(v)) return { ok: false, lyDo: `${KHOA_MAU_BAI}: phải là đối tượng theo kênh` };
  const ra: MauBai = {};
  for (const [kenh, l] of Object.entries(v)) {
    const loi = loiMotKenh(kenh, l);
    if (loi) return { ok: false, lyDo: loi };
    const ll = l as LoiMauBai;
    ra[kenh as KenhBai] = { dau: ll.dau, cuoi: ll.cuoi };
  }
  return { ok: true, giaTri: ra };
}

/**
 * Đọc khoan dung khi dùng (dòng ghi thẳng vào cơ sở dữ liệu, bản cũ): cột không ra ngoài được bị bỏ, mẫu không còn cột hay
 * sai khuôn bị bỏ — mỗi chỗ bỏ một lỗi nêu khoá. Chưa đặt (null) là danh sách rỗng, không lỗi.
 */
export function docMauBang(v: unknown): { ds: MauBang[]; loi: string[] } {
  if (v === null || v === undefined) return { ds: [], loi: [] };
  if (!Array.isArray(v)) return { ds: [], loi: [`${KHOA_MAU_BANG}: phải là danh sách mẫu — bỏ qua`] };
  const ds: MauBang[] = [];
  const loi: string[] = [];
  const ten = new Set<string>();
  for (const [i, m] of v.slice(0, TRAN_MAU.soMau).entries()) {
    if (!laDoiTuong(m)) {
      loi.push(`${KHOA_MAU_BANG}[${i}]: không đọc được — bỏ qua`);
      continue;
    }
    const cotVao = Array.isArray(m.cot) ? m.cot : [];
    const cot = [...new Set(cotVao.filter((c): c is CotBangHang => typeof c === "string" && DUOC.has(c)))].slice(0, TRAN_MAU.soCot);
    const bo = cotVao.filter((c) => !(typeof c === "string" && DUOC.has(c)));
    if (bo.length) loi.push(`${KHOA_MAU_BANG}[${i}].cot: bỏ cột không ra ngoài ${bo.map((c) => String(c)).join(", ")}`);
    const ung = { id: m.id, ten: m.ten, cot };
    const l = loiMotMau(ung, i, ten);
    if (l) {
      loi.push(`${l} — bỏ mẫu`);
      continue;
    }
    ten.add(chuanTen(String(m.ten)));
    ds.push({ id: String(m.id), ten: String(m.ten).trim(), cot });
  }
  if (v.length > TRAN_MAU.soMau) loi.push(`${KHOA_MAU_BANG}: quá ${TRAN_MAU.soMau} mẫu — bỏ phần sau`);
  return { ds, loi };
}

export function docMauBai(v: unknown): { mau: MauBai; loi: string[] } {
  if (v === null || v === undefined) return { mau: {}, loi: [] };
  if (!laDoiTuong(v)) return { mau: {}, loi: [`${KHOA_MAU_BAI}: phải là đối tượng theo kênh — bỏ qua`] };
  const mau: MauBai = {};
  const loi: string[] = [];
  for (const [kenh, l] of Object.entries(v)) {
    const e = loiMotKenh(kenh, l);
    if (e) loi.push(`${e} — bỏ qua`);
    else mau[kenh as KenhBai] = { dau: (l as LoiMauBai).dau, cuoi: (l as LoiMauBai).cuoi };
  }
  return { mau, loi };
}

/** Lời của mẫu đã bỏ biểu tượng; rỗng sau khi bỏ thì coi như không có. */
export const loiSach = (s: string | undefined): string => (s ? s.split("\n").map(sach).join("\n").trim() : "");

/** Bài Zalo (và mọi bài một khối): lời mở đầu, bài, lời kết — mỗi phần một dòng; phần rỗng bị bỏ. */
export function bocBai(bai: string, loi: LoiMauBai | undefined): string {
  return [loiSach(loi?.dau), bai, loiSach(loi?.cuoi)].filter((s) => s !== "").join("\n");
}
