/**
 * Trường riêng của sàn (hàng 47, Tham chiếu §7 lớp thứ ba, ADR-0018 quyết định 8, sổ điểm biến thiên #22): trường thật sự
 * mới, kiểu «có / không» (`bool`) hay «chọn một» (`single_select`), cho hàng hay cho liên hệ theo loại. Định nghĩa ở bảng
 * `custom_fields` (migration 043); giá trị khoá theo MÃ trường (đổi tên không đụng dữ liệu). Bỏ trường = ẩn, giữ giá trị;
 * mã không bao giờ dùng lại. Máy dò trùng nghĩa tất định trước khi tạo (ba câu hỏi của §7; không gọi AI — ADR-0018 «Chi
 * phí»). Nhập qua `@quy-hang/core/custom-fields`.
 */
import { CONTACT_TYPES, CONTACT_TYPE_LABELS, OWNER_TYPES, type ContactType } from "../contacts";
import { headerKey, lookupHeader } from "../import/headers";
import { DS_TRUONG_DAT_TEN, TRUONG_DAT_TEN, kiemChuNhan, type TuVung } from "../labels";
import { MA_NHAN_RE, chuSo, maNhanMoi } from "../statuses";

export const DOI_TUONG = ["listing", "contact"] as const;
export type DoiTuong = (typeof DOI_TUONG)[number];
export const KIEU_TRUONG = ["bool", "single_select"] as const;
export type KieuTruong = (typeof KIEU_TRUONG)[number];
export type LopTruongRieng = "custom_field" | "source";

/** Sổ #22: tối đa 20 trường còn sống mỗi sàn (gộp hàng và liên hệ — Hỏi-5), 30 lựa chọn mỗi trường. */
export const TRAN_TRUONG = 20;
export const TRAN_LUA_CHON = 30;
/** Mã trường, mã lựa chọn: cùng khuôn mã nhãn của hàng 46. */
export const MA_TRUONG_RE = MA_NHAN_RE;
export const laMaTruong = (v: unknown): v is string => typeof v === "string" && MA_TRUONG_RE.test(v);

export type LuaChon = { code: string; label: string };
/** Một trường như `GET /api/v1/company/fields` trả và bảng `custom_fields` giữ. */
export type TruongRieng = {
  code: string;
  target: DoiTuong;
  /** Chỉ với `contact`; `listing` là `[]`. */
  contactTypes: ContactType[];
  kind: KieuTruong;
  label: string;
  options: LuaChon[];
  dataClass: LopTruongRieng;
  archived: boolean;
};
/** Một trường màn gửi lên: `code` vắng = trường mới; lựa chọn `code` vắng = lựa chọn mới. */
export type TruongGui = {
  code?: string;
  target: string;
  contactTypes?: string[];
  kind: string;
  label: string;
  options?: { code?: string; label: string }[];
  archived?: boolean;
};

/** Chữ hiện của hai kiểu. */
export const NHAN_KIEU: Readonly<Record<KieuTruong, string>> = { bool: "Có / Không", single_select: "Chọn một" };
export const CHU_BOOL = { true: "Có", false: "Không" } as const;

/**
 * Luật lớp (Hỏi-1 — nới ADR-0018 quyết định 8): trường của hàng là `custom_field`; trường của liên hệ có loại Chủ bán hay
 * Chủ cho thuê là `source` (giá trị là thông tin chủ nhà — bất biến 2); còn lại `custom_field`. Check của migration 043
 * lặp lại luật này; bài kiểm so hai bên.
 */
export function lopTruongRieng(target: DoiTuong, contactTypes: readonly ContactType[]): LopTruongRieng {
  if (target === "listing") return "custom_field";
  return contactTypes.some((t) => OWNER_TYPES.includes(t)) ? "source" : "custom_field";
}

export const maTruongMoi = (chu: string, daCo: readonly string[]) => maNhanMoi(chu, daCo);
export const maLuaChonMoi = (chu: string, daCo: readonly string[]) => maNhanMoi(chu, daCo);

// ---- Máy dò trùng nghĩa ----

/** Trường chuẩn của liên hệ và chữ đồng nghĩa (khoá so `headerKey`): tên, số, loại, người giữ. */
export const TRUONG_CHUAN_LIEN_HE = {
  fullName: { nhan: "Họ tên", dongNghia: ["ho ten", "ten", "ho va ten", "ten khach", "ten chu", "ten lien he"] },
  phone: { nhan: "Số điện thoại", dongNghia: ["so dien thoai", "sdt", "dien thoai", "so dt", "so", "di dong"] },
  contactTypes: { nhan: "Loại liên hệ", dongNghia: ["loai", "loai lien he", "loai khach", ...CONTACT_TYPES.map((t) => headerKey(CONTACT_TYPE_LABELS[t]))] },
  ownerMember: { nhan: "Đầu chủ giữ", dongNghia: ["dau chu", "nguoi giu", "dau chu giu", "nguoi phu trach"] },
} as const;

/** Ngữ cảnh của máy dò: tên riêng sàn đã đặt cho trường chuẩn (hàng 45). */
export type NguCanhDo = { tuVung?: TuVung | null };
export type TrungNghia = { truong: string; nhan: string };

/**
 * Tên này có trùng nghĩa một trường chuẩn không. Hàng: từ điển tiêu đề dựng sẵn của nhập Excel (`lookupHeader`), nhãn mặc
 * định của các trường chuẩn (`TRUONG_DAT_TEN` — cũng là nhãn cột Bảng hàng), tên riêng của sàn ở Cách gọi. Liên hệ: tên các
 * trường chuẩn của liên hệ và nhãn bốn loại. So bằng `headerKey` (bỏ dấu, hoa thường, dấu câu). Không trúng → `null`.
 */
export function doTrungNghia(label: string, target: DoiTuong, nguCanh: NguCanhDo = {}): TrungNghia | null {
  const k = headerKey(label);
  if (!k) return null;
  if (target === "contact") {
    for (const [truong, { nhan, dongNghia }] of Object.entries(TRUONG_CHUAN_LIEN_HE)) {
      if (headerKey(nhan) === k || (dongNghia as readonly string[]).includes(k)) return { truong, nhan };
    }
    return null;
  }
  const tenSan = nguCanh.tuVung?.truong ?? {};
  for (const f of DS_TRUONG_DAT_TEN) {
    const rieng = tenSan[f];
    if (rieng && headerKey(rieng) === k) return { truong: f, nhan: rieng };
    if (headerKey(TRUONG_DAT_TEN[f]) === k) return { truong: f, nhan: tenSan[f] ?? TRUONG_DAT_TEN[f] };
  }
  const tra = lookupHeader(label);
  if (tra && tra !== "row_index") {
    const nhan = (Object.hasOwn(TRUONG_DAT_TEN, tra) ? (tenSan[tra as keyof typeof TRUONG_DAT_TEN] ?? TRUONG_DAT_TEN[tra as keyof typeof TRUONG_DAT_TEN]) : null) ?? label.trim();
    return { truong: tra, nhan };
  }
  return null;
}

export const cauTrungNghia = (t: TrungNghia) => `Đã có trường «${t.nhan}» — đổi tên ở Cách gọi`;

// ---- Kiểm bộ trường ----

export type KetQuaKiemTruong =
  | { ok: true; bo: TruongRieng[] }
  | { ok: false; loi: string; trungNghia?: TrungNghia & { label: string } };

const laDoiTuong = (v: unknown): v is DoiTuong => typeof v === "string" && (DOI_TUONG as readonly string[]).includes(v);
const laKieu = (v: unknown): v is KieuTruong => typeof v === "string" && (KIEU_TRUONG as readonly string[]).includes(v);
const laLoai = (v: unknown): v is ContactType => typeof v === "string" && (CONTACT_TYPES as readonly string[]).includes(v);
const cungTap = (a: readonly string[], b: readonly string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/**
 * Kiểm bộ trường sàn sẽ có sau lượt lưu. `gui` liệt MỌI trường còn sống (vắng một mã còn sống là lỗi — bỏ trường đi bằng
 * `archived: true`, không bằng xoá); `daCo` là bộ đang lưu (cả trường đã bỏ, để mã không dùng lại). Trường mới hay trường
 * đổi tên qua máy dò trùng nghĩa. Lỗi mở đầu bằng khoá máy `fields.<mã|moi>`.
 */
export function kiemTruongRieng(gui: readonly TruongGui[], daCo: readonly TruongRieng[] = [], nguCanh: NguCanhDo = {}): KetQuaKiemTruong {
  if (!Array.isArray(gui)) return { ok: false, loi: "fields: cần danh sách trường" };
  const maDaCo = daCo.map((t) => t.code);
  const maMoi: string[] = [];
  const bo: TruongRieng[] = [];
  for (const g of gui) {
    const cu = g.code === undefined ? undefined : daCo.find((t) => t.code === g.code);
    const khoa = `fields.${g.code ?? "moi"}`;
    if (g.code !== undefined && !cu) return { ok: false, loi: `${khoa}: mã không có trong bộ trường của sàn` };
    if (cu?.archived) return { ok: false, loi: `${khoa}: trường đã bỏ — tạo trường mới` };
    if (!laDoiTuong(g.target)) return { ok: false, loi: `${khoa}: target phải là listing hay contact` };
    if (!laKieu(g.kind)) return { ok: false, loi: `${khoa}: kind phải là bool hay single_select` };
    const chu = kiemChuNhan(khoa, g.label);
    if (!chu.ok) return { ok: false, loi: chu.loi };
    const loai = g.contactTypes ?? [];
    if (!Array.isArray(loai) || !loai.every(laLoai) || new Set(loai).size !== loai.length) return { ok: false, loi: `${khoa}: contactTypes sai` };
    if (g.target === "contact" && loai.length === 0) return { ok: false, loi: `${khoa}: trường của liên hệ cần ít nhất một loại` };
    if (g.target === "listing" && loai.length > 0) return { ok: false, loi: `${khoa}: trường của hàng không có loại liên hệ` };
    if (cu) {
      if (cu.kind !== g.kind) return { ok: false, loi: `${khoa}: kind không đổi được sau khi tạo` };
      if (cu.target !== g.target) return { ok: false, loi: `${khoa}: target không đổi được sau khi tạo` };
      if (!cungTap(cu.contactTypes, loai)) return { ok: false, loi: `${khoa}: contactTypes không đổi được sau khi tạo` };
    }
    // Lựa chọn
    const goiLc = g.options ?? [];
    if (!Array.isArray(goiLc)) return { ok: false, loi: `${khoa}: options cần danh sách` };
    if (g.kind === "bool" && goiLc.length > 0) return { ok: false, loi: `${khoa}: options — có / không không có lựa chọn` };
    if (g.kind === "single_select") {
      if (goiLc.length === 0) return { ok: false, loi: `${khoa}: options — chọn một cần ít nhất một lựa chọn` };
      if (goiLc.length > TRAN_LUA_CHON) return { ok: false, loi: `${khoa}: options — tối đa ${TRAN_LUA_CHON} lựa chọn` };
    }
    const lcCu = cu?.options ?? [];
    for (const o of lcCu) if (!goiLc.some((x) => x.code === o.code)) return { ok: false, loi: `${khoa}: options — lựa chọn «${o.label}» đã có, không gỡ được` };
    const maLc = lcCu.map((o) => o.code);
    const options: LuaChon[] = [];
    for (const o of goiLc) {
      const c = kiemChuNhan(`${khoa}.options`, o?.label);
      if (!c.ok) return { ok: false, loi: c.loi };
      if (o.code !== undefined && !maLc.includes(o.code)) return { ok: false, loi: `${khoa}: options — mã lựa chọn «${String(o.code)}» không có` };
      if (options.some((x) => chuSo(x.label) === chuSo(c.nhan))) return { ok: false, loi: `${khoa}: options — hai lựa chọn trùng chữ «${c.nhan}»` };
      const code = o.code ?? maLuaChonMoi(c.nhan, [...maLc, ...options.map((x) => x.code)]);
      options.push({ code, label: c.nhan });
    }
    // Máy dò trùng nghĩa: trường mới, hay trường đổi tên.
    if (!cu || chuSo(cu.label) !== chuSo(chu.nhan)) {
      const t = doTrungNghia(chu.nhan, g.target, nguCanh);
      if (t) return { ok: false, loi: `${khoa}: trung-nghia — ${cauTrungNghia(t)}`, trungNghia: { ...t, label: chu.nhan } };
    }
    const code = cu ? cu.code : maTruongMoi(chu.nhan, [...maDaCo, ...maMoi]);
    if (!cu) maMoi.push(code);
    bo.push({ code, target: g.target, contactTypes: [...loai], kind: g.kind, label: chu.nhan, options, dataClass: lopTruongRieng(g.target, loai), archived: g.archived === true });
  }
  if (new Set(bo.map((t) => t.code)).size !== bo.length) return { ok: false, loi: "fields: một mã gửi hai lần" };
  for (const t of daCo) if (!t.archived && !bo.some((x) => x.code === t.code)) return { ok: false, loi: `fields.${t.code}: thiếu trường đang có — bỏ trường bằng archived` };
  const song = bo.filter((t) => !t.archived);
  for (const t of song) {
    const kia = song.find((x) => x !== t && x.target === t.target && headerKey(x.label) === headerKey(t.label));
    if (kia) return { ok: false, loi: `fields.${t.code}: trùng tên trường «${kia.label}»` };
  }
  if (song.length > TRAN_TRUONG) return { ok: false, loi: `fields: tối đa ${TRAN_TRUONG} trường còn sống mỗi sàn` };
  // Trường đã bỏ mà màn không gửi lại vẫn nằm trong bộ — để mã không bao giờ dùng lại.
  for (const t of daCo) if (t.archived && !bo.some((x) => x.code === t.code)) bo.push(t);
  return { ok: true, bo };
}

// ---- Giá trị ----

export type GiaTriTruong = boolean | string;
export type KetQuaGiaTri = { ok: true; patch: Record<string, GiaTriTruong | null> } | { ok: false; loi: string };

/** Trường còn sống áp cho một đối tượng (liên hệ: loại giao với loại của người ấy), theo thứ tự bộ. */
export function truongCuaDoiTuong(bo: readonly TruongRieng[], target: DoiTuong, contactTypes: readonly string[] = []): TruongRieng[] {
  return bo.filter((t) => !t.archived && t.target === target && (target === "listing" || t.contactTypes.some((x) => contactTypes.includes(x))));
}

/**
 * Kiểm một lệnh đặt giá trị: mỗi khoá là mã một trường còn sống áp cho đối tượng; `bool` ↔ `true`/`false`; `single_select`
 * ↔ mã lựa chọn còn trong trường; `null` = xoá giá trị. Lỗi nêu mã.
 */
export function kiemGiaTriTruong(bo: readonly TruongRieng[], target: DoiTuong, contactTypes: readonly string[] | null, patch: unknown): KetQuaGiaTri {
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) return { ok: false, loi: "custom: cần một object" };
  const khoa = Object.keys(patch);
  if (khoa.length === 0) return { ok: false, loi: "custom: không có trường nào" };
  const ap = truongCuaDoiTuong(bo, target, contactTypes ?? []);
  const ra: Record<string, GiaTriTruong | null> = {};
  for (const ma of khoa) {
    const v = (patch as Record<string, unknown>)[ma];
    const t = ap.find((x) => x.code === ma);
    if (!t) return { ok: false, loi: `custom.${ma}: không phải trường riêng còn sống của ${target === "listing" ? "hàng" : "liên hệ này"}` };
    if (v === null) ra[ma] = null;
    else if (t.kind === "bool" && typeof v === "boolean") ra[ma] = v;
    else if (t.kind === "single_select" && typeof v === "string" && t.options.some((o) => o.code === v)) ra[ma] = v;
    else return { ok: false, loi: `custom.${ma}: giá trị sai kiểu hay lựa chọn không có` };
  }
  return { ok: true, patch: ra };
}

/** Trộn một patch vào giá trị đang có: `null` xoá khoá. */
export function tronGiaTri(cu: Readonly<Record<string, unknown>> | null | undefined, patch: Readonly<Record<string, unknown>>): Record<string, GiaTriTruong> {
  const ra: Record<string, GiaTriTruong> = {};
  for (const [k, v] of Object.entries(cu ?? {})) if (typeof v === "boolean" || typeof v === "string") ra[k] = v;
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete ra[k];
    else if (typeof v === "boolean" || typeof v === "string") ra[k] = v;
  }
  return ra;
}

/** Chữ hiện của một giá trị: «Có» · «Không» · chữ lựa chọn; vắng hay mã không còn → «». */
export function chuGiaTri(t: Pick<TruongRieng, "kind" | "options">, v: unknown): string {
  if (t.kind === "bool") return v === true ? CHU_BOOL.true : v === false ? CHU_BOOL.false : "";
  return typeof v === "string" ? (t.options.find((o) => o.code === v)?.label ?? "") : "";
}

/** Đọc bộ trường từ thân `GET /api/v1/company/fields` (khuôn hỏng bỏ qua — màn không sập vì một dòng lạ). */
export function boTuThan(than: { fields?: readonly unknown[] } | null | undefined): TruongRieng[] {
  const ra: TruongRieng[] = [];
  for (const x of than?.fields ?? []) {
    const t = x as Partial<TruongRieng>;
    if (!laMaTruong(t.code) || !laDoiTuong(t.target) || !laKieu(t.kind) || typeof t.label !== "string") continue;
    ra.push({
      code: t.code,
      target: t.target,
      contactTypes: Array.isArray(t.contactTypes) ? t.contactTypes.filter(laLoai) : [],
      kind: t.kind,
      label: t.label,
      options: Array.isArray(t.options) ? t.options.filter((o): o is LuaChon => laMaTruong(o?.code) && typeof o?.label === "string") : [],
      dataClass: t.dataClass === "source" ? "source" : "custom_field",
      archived: t.archived === true,
    });
  }
  return ra;
}
