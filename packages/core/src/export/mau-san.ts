/**
 * Mẫu của sàn (hàng mau-bang-hang-va-bai): mẫu bảng hàng — điểm #26 `export.templates` — và mẫu bài theo kênh — điểm #27
 * `share.post_templates` của sổ điểm biến thiên. Lõi giữ khuôn (kiểm nguyên khối khi ghi, đọc khoan dung khi dùng) và cách
 * bọc lời của sàn quanh bài dựng sẵn. Mẫu bảng chỉ chọn cột có khoá ra; bảng theo mẫu vẫn qua `cotRa` và `banRaNgoai` của
 * người nhận (bất biến 4). Lời mẫu là chữ tự do của sàn, không đọc trường nào của căn. Chạy được cả trong trình duyệt.
 *
 * Tên trường tiếng Anh (hàng mau-api-ten-truong-tieng-anh): `name`, `columns`, `opening`, `closing`. Ghi chặt — tên cũ
 * (`ten`, `cot`, `dau`, `cuoi`) hay khoá lạ bị từ chối, lý do nêu tên đúng. Đọc khoan dung hai dạng: dòng lưu trước vòng ấy
 * vẫn đọc được (tên mới thắng khi có cả hai), lần lưu kế ghi dạng mới — không migration (Hỏi-1).
 */
import { sach } from "./bai";
import { COT_BANG_HANG, type CotBangHang } from "./cot";

export type MauBang = { id: string; name: string; columns: CotBangHang[] };
export type LoiMauBai = { opening: string; closing: string };
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

/** Tên cũ (trước hàng mau-api-ten-truong-tieng-anh) → tên mới. */
const TEN_CU: Readonly<Record<string, string>> = { ten: "name", cot: "columns", dau: "opening", cuoi: "closing" };
const KHOA_BANG = new Set(["id", "name", "columns"]);
const KHOA_LOI = new Set(["opening", "closing"]);

/** Khoá ngoài tập của khuôn (null = không có); tên cũ kèm tên đúng. */
function khoaLa(o: Record<string, unknown>, duoc: Set<string>, k: string): string | null {
  const la = Object.keys(o).find((x) => !duoc.has(x));
  if (la === undefined) return null;
  return TEN_CU[la] ? `${k}: khoá lạ «${la}» — dùng «${TEN_CU[la]}»` : `${k}: khoá lạ «${la}»`;
}

/** Đọc một trường theo tên mới, thiếu thì theo tên cũ (dòng lưu trước khi đổi tên). */
const truong = (o: Record<string, unknown>, moi: string, cu: string): unknown => (o[moi] !== undefined ? o[moi] : o[cu]);

type Kiem<T> = { ok: true; giaTri: T } | { ok: false; lyDo: string };

/** Lỗi khuôn của một mẫu bảng (null = hợp lệ); `tenDaCo` là tên chuẩn hoá của các mẫu đứng trước. */
function loiMotMau(m: unknown, i: number, tenDaCo: Set<string>): string | null {
  const k = `${KHOA_MAU_BANG}[${i}]`;
  if (!laDoiTuong(m)) return `${k}: phải là đối tượng { id, name, columns }`;
  if (typeof m.id !== "string" || !UUID.test(m.id)) return `${k}.id: phải là uuid`;
  if (typeof m.name !== "string" || m.name.trim() === "") return `${k}.name: không được trống`;
  if (m.name.trim().length > TRAN_MAU.ten) return `${k}.name: tối đa ${TRAN_MAU.ten} ký tự`;
  if (tenDaCo.has(chuanTen(m.name))) return `${k}.name: «${m.name.trim()}» đã có trong sàn`;
  if (!Array.isArray(m.columns) || m.columns.length === 0) return `${k}.columns: cần ít nhất một cột`;
  if (m.columns.length > TRAN_MAU.soCot) return `${k}.columns: tối đa ${TRAN_MAU.soCot} cột`;
  const thay = new Set<string>();
  for (const c of m.columns) {
    if (typeof c !== "string" || !LA_COT(c)) return `${k}.columns: cột lạ ${JSON.stringify(c)}`;
    if (!DUOC.has(c)) return `${k}.columns: ${c} là cột nội bộ, không ra ngoài`;
    if (thay.has(c)) return `${k}.columns: cột ${c} trùng`;
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
    const la = laDoiTuong(m) ? khoaLa(m, KHOA_BANG, `${KHOA_MAU_BANG}[${i}]`) : null;
    if (la) return { ok: false, lyDo: la };
    const loi = loiMotMau(m, i, ten);
    if (loi) return { ok: false, lyDo: loi };
    const mm = m as MauBang;
    ten.add(chuanTen(mm.name));
    ra.push({ id: mm.id, name: mm.name.trim(), columns: [...mm.columns] });
  }
  return { ok: true, giaTri: ra };
}

function loiMotKenh(kenh: string, l: unknown): string | null {
  const k = `${KHOA_MAU_BAI}.${kenh}`;
  if (!(KENH_BAI as readonly string[]).includes(kenh)) return `${k}: kênh lạ — chỉ ${KENH_BAI.join(", ")}`;
  if (!laDoiTuong(l)) return `${k}: phải là đối tượng { opening, closing }`;
  for (const p of ["opening", "closing"] as const) {
    if (typeof l[p] !== "string") return `${k}.${p}: phải là chữ`;
    if ((l[p] as string).length > TRAN_MAU.loi) return `${k}.${p}: tối đa ${TRAN_MAU.loi} ký tự`;
  }
  return null;
}

export function kiemMauBai(v: unknown): Kiem<MauBai> {
  if (!laDoiTuong(v)) return { ok: false, lyDo: `${KHOA_MAU_BAI}: phải là đối tượng theo kênh` };
  const ra: MauBai = {};
  for (const [kenh, l] of Object.entries(v)) {
    const la = laDoiTuong(l) ? khoaLa(l, KHOA_LOI, `${KHOA_MAU_BAI}.${kenh}`) : null;
    if (la) return { ok: false, lyDo: la };
    const loi = loiMotKenh(kenh, l);
    if (loi) return { ok: false, lyDo: loi };
    const ll = l as LoiMauBai;
    ra[kenh as KenhBai] = { opening: ll.opening, closing: ll.closing };
  }
  return { ok: true, giaTri: ra };
}

/**
 * Đọc khoan dung khi dùng (dòng ghi thẳng vào cơ sở dữ liệu, bản cũ): cột không ra ngoài được bị bỏ, mẫu không còn cột hay
 * sai khuôn bị bỏ — mỗi chỗ bỏ một lỗi nêu khoá. Chưa đặt (null) là danh sách rỗng, không lỗi. Dòng dạng cũ (`ten`, `cot`)
 * đọc như dạng mới, không lỗi.
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
    const cotGoc = truong(m, "columns", "cot");
    const tenGoc = truong(m, "name", "ten");
    const cotVao: unknown[] = Array.isArray(cotGoc) ? cotGoc : [];
    const cot = [...new Set(cotVao.filter((c): c is CotBangHang => typeof c === "string" && DUOC.has(c)))].slice(0, TRAN_MAU.soCot);
    const bo = cotVao.filter((c) => !(typeof c === "string" && DUOC.has(c)));
    if (bo.length) loi.push(`${KHOA_MAU_BANG}[${i}].columns: bỏ cột không ra ngoài ${bo.map((c) => String(c)).join(", ")}`);
    const ung = { id: m.id, name: tenGoc, columns: cot };
    const l = loiMotMau(ung, i, ten);
    if (l) {
      loi.push(`${l} — bỏ mẫu`);
      continue;
    }
    ten.add(chuanTen(String(tenGoc)));
    ds.push({ id: String(m.id), name: String(tenGoc).trim(), columns: cot });
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
    const ung = laDoiTuong(l) ? { opening: truong(l, "opening", "dau"), closing: truong(l, "closing", "cuoi") } : l;
    const e = loiMotKenh(kenh, ung);
    if (e) loi.push(`${e} — bỏ qua`);
    else mau[kenh as KenhBai] = ung as LoiMauBai;
  }
  return { mau, loi };
}

/** Lời của mẫu đã bỏ biểu tượng; rỗng sau khi bỏ thì coi như không có. */
export const loiSach = (s: string | undefined): string => (s ? s.split("\n").map(sach).join("\n").trim() : "");

/** Bài Zalo (và mọi bài một khối): lời mở đầu, bài, lời kết — mỗi phần một dòng; phần rỗng bị bỏ. */
export function bocBai(bai: string, loi: LoiMauBai | undefined): string {
  return [loiSach(loi?.opening), bai, loiSach(loi?.closing)].filter((s) => s !== "").join("\n");
}
