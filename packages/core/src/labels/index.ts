/**
 * Cách gọi riêng của sàn (hàng 45, Tham chiếu §7 «sàn thêm nhãn, không thêm nghĩa», ADR-0022 D5): một sổ từ vựng nhỏ —
 * sàn đặt tên hiện cho trường chuẩn (sổ #18 `labels.field.<trường>`) và cho từng giá trị chuẩn của tập đóng (sổ #37
 * `labels.value.<trường>`). Nghĩa vẫn do lõi giữ: căn chỉ lưu giá trị chuẩn; lọc, đếm, luật đọc giá trị chuẩn; chữ riêng
 * chỉ là chữ hiện. Lõi không đọc cơ sở dữ liệu — người gọi đưa dòng `{ key, value }` của sàn vào.
 */
import { FIELD_CLASS } from "../import/fields";
import { detectPersonal } from "../import/detect";
import { FEE_INCLUSIONS } from "../listing/events";
import { isStandardStatus, MA_NHAN_TRANG_THAI_RE, WITHDRAWN_REASONS } from "../listing/status";
// Chỉ kiểu: `statuses` nhập `kiemChuNhan` của tệp này, nên nhập giá trị từ `statuses` sẽ thành vòng nhập.
import type { TruongRieng } from "../custom-fields";
import type { NhanTrangThai } from "../statuses";

/** Tiền tố khoá của hai họ trong `company_settings` (migration 039). */
export const KHOA_TRUONG = "labels.field.";
export const KHOA_GIA_TRI = "labels.value.";
/** Nhãn dài nhất sàn được đặt — như khuôn #18 `text≤40`. */
export const NHAN_TOI_DA = 40;

/**
 * Trường chuẩn đổi tên được (Hỏi-4): các cột RESO của Bảng hàng, mỗi trường một nhãn mặc định theo `CONTEXT.md`. Đây là
 * chữ màn Cách gọi hiện làm «mặc định»; mỗi mặt (Bảng hàng, trang khách, bản xuất) giữ chữ dựng sẵn của nó khi sàn chưa
 * đặt. Không trường lớp `source` nào (bất biến 2 — bài kiểm buộc).
 */
export const TRUONG_DAT_TEN = {
  buildingName: "Toà",
  unitNumber: "Mã căn",
  livingArea: "Diện tích",
  floor: "Tầng",
  directionFaces: "Hướng",
  standardStatus: "Trạng thái",
  listPrice: "Giá chào",
  feeInclusion: "Điều kiện phí",
  furnished: "Nội thất",
  legalStatus: "Pháp lý",
  financing: "Tài chính",
  occupantType: "Tình trạng sử dụng",
  closePrice: "Giá chốt",
  closeDate: "Ngày bán",
  withdrawnReason: "Lý do ngừng",
} as const;
export type TruongDatTen = keyof typeof TRUONG_DAT_TEN;
export const DS_TRUONG_DAT_TEN = Object.keys(TRUONG_DAT_TEN) as TruongDatTen[];

/**
 * Tập đóng sàn đặt tên riêng cho từng giá trị (Hỏi-2: mỗi giá trị chuẩn đúng một tên riêng). Trạng thái là hàng 46;
 * hướng, loại hình để sau (cột chữ, chưa là cột).
 */
export const TAP_DONG = {
  feeInclusion: { included: "Bao phí", excluded: "Không bao phí" },
  withdrawnReason: { sold_elsewhere: "Chủ đã bán nơi khác", owner_changed_mind: "Chủ đổi ý", unreachable: "Không liên lạc được" },
} as const satisfies Record<string, Record<string, string>>;
export type TruongDong = keyof typeof TAP_DONG;
export const DS_TRUONG_DONG = Object.keys(TAP_DONG) as TruongDong[];

// Tập đóng phải khớp tập giá trị chuẩn của lõi — đổi một bên mà quên bên kia là lỗi kiểu ở đây.
const _khopPhi: Record<(typeof FEE_INCLUSIONS)[number], string> = TAP_DONG.feeInclusion;
const _khopLyDo: Record<(typeof WITHDRAWN_REASONS)[number], string> = TAP_DONG.withdrawnReason;
void _khopPhi;
void _khopLyDo;

export const laTruongDatTen = (v: unknown): v is TruongDatTen => typeof v === "string" && Object.hasOwn(TRUONG_DAT_TEN, v);
export const laTruongDong = (v: unknown): v is TruongDong => typeof v === "string" && Object.hasOwn(TAP_DONG, v);

/** Từ vựng của một sàn: chỉ phần sàn đã đặt; vắng là dùng chữ mặc định của mặt đang hiện. */
export type TuVung = {
  truong: Partial<Record<TruongDatTen, string>>;
  giaTri: Partial<Record<TruongDong, Partial<Record<string, string>>>>;
  /** Nhãn trạng thái riêng của sàn (hàng 46); vắng hay rỗng = chữ mặc định của sáu trạng thái chuẩn. */
  trangThai?: readonly NhanTrangThai[];
  /** Trường riêng của sàn (hàng 47); `null` = chưa tải được (khác bộ rỗng — Bảng hàng không đụng góc nhìn đã lưu). */
  truongRieng?: readonly TruongRieng[] | null;
};
export const TU_VUNG_RONG: TuVung = Object.freeze({ truong: Object.freeze({}), giaTri: Object.freeze({}) }) as TuVung;

export type KetQuaKiemNhan = { ok: true; nhan: string } | { ok: false; loi: string };

/** Chữ một nhãn: bỏ khoảng trắng hai đầu, 1–40 ký tự, không số điện thoại, email, số giấy tờ (ADR-0011 §3). */
export function kiemChuNhan(khoa: string, v: unknown): KetQuaKiemNhan {
  if (typeof v !== "string") return { ok: false, loi: `${khoa}: cần chữ` };
  const nhan = v.trim();
  if (nhan.length === 0) return { ok: false, loi: `${khoa}: chữ rỗng` };
  if (nhan.length > NHAN_TOI_DA) return { ok: false, loi: `${khoa}: dài hơn ${NHAN_TOI_DA} ký tự` };
  const lo = detectPersonal(nhan);
  if (lo) return { ok: false, loi: `${khoa}: chứa ${lo === "phone" ? "số điện thoại" : lo === "email" ? "email" : "số giấy tờ"}` };
  return { ok: true, nhan };
}

/** Tên riêng của một trường chuẩn. */
export function kiemNhanTruong(truong: unknown, nhan: unknown): KetQuaKiemNhan {
  const khoa = `${KHOA_TRUONG}${String(truong)}`;
  if (!laTruongDatTen(truong)) return { ok: false, loi: `${khoa}: không phải trường đổi tên được` };
  return kiemChuNhan(khoa, nhan);
}

/** Giá trị riêng: tên riêng PHẢI neo vào một giá trị chuẩn của tập đóng của trường. */
export function kiemNhanGiaTri(truong: unknown, neo: unknown, nhan: unknown): KetQuaKiemNhan {
  const khoa = `${KHOA_GIA_TRI}${String(truong)}`;
  if (!laTruongDong(truong)) return { ok: false, loi: `${khoa}: không phải trường có tập giá trị đóng` };
  const tap = Object.keys(TAP_DONG[truong]);
  if (neo === undefined || neo === null || neo === "") return { ok: false, loi: `${khoa}: thiếu giá trị chuẩn để neo` };
  if (typeof neo !== "string" || !tap.includes(neo)) return { ok: false, loi: `${khoa}: neo «${String(neo)}» không thuộc ${tap.join(", ")}` };
  return kiemChuNhan(khoa, nhan);
}

/** Một bộ nhãn màn gửi lên — đủ bộ: vắng một trường hay giá trị là dùng mặc định. */
export type BoNhan = {
  fields: readonly { field: string; label: string }[];
  values: readonly { field: string; value: string; label: string }[];
};

/** Dòng `company_settings` dựng từ bộ nhãn: mỗi trường đã đặt một dòng, mỗi trường đóng có giá trị riêng một dòng. */
export type DongNhan = { key: string; value: unknown };

/**
 * Kiểm cả bộ nhãn (nguyên khối — một ô sai thì cả bộ sai) và dựng dòng cần có. Hai giá trị riêng cùng chữ trong một
 * trường là lỗi; một giá trị chuẩn chỉ một tên riêng (Hỏi-2).
 */
export function dungDongNhan(bo: unknown): { ok: true; dong: DongNhan[] } | { ok: false; loi: string } {
  if (bo === null || typeof bo !== "object") return { ok: false, loi: "thân phải là { fields, values }" };
  const { fields, values } = bo as Record<string, unknown>;
  if (!Array.isArray(fields) || !Array.isArray(values)) return { ok: false, loi: "thân phải là { fields, values }" };
  const dong: DongNhan[] = [];
  const daTruong = new Set<string>();
  for (const f of fields as unknown[]) {
    const r = (f ?? {}) as Record<string, unknown>;
    const kq = kiemNhanTruong(r.field, r.label);
    if (!kq.ok) return kq;
    if (daTruong.has(String(r.field))) return { ok: false, loi: `${KHOA_TRUONG}${String(r.field)}: gửi hai lần` };
    daTruong.add(String(r.field));
    // Gõ đúng chữ mặc định = dùng mặc định: không dòng nào (gap-probe P1 của Cổng Phạm vi).
    if (kq.nhan === TRUONG_DAT_TEN[r.field as TruongDatTen]) continue;
    dong.push({ key: `${KHOA_TRUONG}${String(r.field)}`, value: kq.nhan });
  }
  const theoTruong = new Map<TruongDong, Record<string, string>>();
  for (const v of values as unknown[]) {
    const r = (v ?? {}) as Record<string, unknown>;
    const kq = kiemNhanGiaTri(r.field, r.value, r.label);
    if (!kq.ok) return kq;
    const truong = r.field as TruongDong;
    const m = theoTruong.get(truong) ?? {};
    const khoa = `${KHOA_GIA_TRI}${truong}`;
    if (Object.hasOwn(m, r.value as string)) return { ok: false, loi: `${khoa}: giá trị «${String(r.value)}» có hai tên riêng` };
    if (Object.values(m).some((x) => x.toLocaleLowerCase("vi") === kq.nhan.toLocaleLowerCase("vi")))
      return { ok: false, loi: `${khoa}: hai giá trị cùng tên «${kq.nhan}»` };
    if (kq.nhan === (TAP_DONG[truong] as Record<string, string>)[r.value as string]) continue;
    m[r.value as string] = kq.nhan;
    theoTruong.set(truong, m);
  }
  for (const [truong, m] of theoTruong) dong.push({ key: `${KHOA_GIA_TRI}${truong}`, value: m });
  return { ok: true, dong };
}

/** Một dòng đã lưu có thuộc hai họ nhãn không — để người gọi chỉ đưa dòng nhãn vào `boTuVung`. */
export const laKhoaNhan = (key: string) => key.startsWith(KHOA_TRUONG) || key.startsWith(KHOA_GIA_TRI);

/**
 * Từ vựng của sàn từ các dòng đã lưu. Dòng hỏng (khoá lạ, chữ sai, neo lạ) bị bỏ qua kèm một lỗi nêu khoá — một ô hỏng
 * không làm sập màn nào (như `giaiCauHinh`). Dòng không thuộc hai họ nhãn bị bỏ qua lặng.
 */
export function boTuVung(dong: readonly DongNhan[]): { tuVung: TuVung; loi: string[] } {
  const truong: Partial<Record<TruongDatTen, string>> = {};
  const giaTri: Partial<Record<TruongDong, Partial<Record<string, string>>>> = {};
  const loi: string[] = [];
  for (const r of dong) {
    // `null` = sàn đã trả về mặc định (dòng giữ lại để nhật ký có vết): chưa đặt, không lỗi.
    if (r.value === null) continue;
    if (r.key.startsWith(KHOA_TRUONG)) {
      const f = r.key.slice(KHOA_TRUONG.length);
      const kq = kiemNhanTruong(f, r.value);
      if (kq.ok) truong[f as TruongDatTen] = kq.nhan;
      else loi.push(kq.loi);
    } else if (r.key.startsWith(KHOA_GIA_TRI)) {
      const f = r.key.slice(KHOA_GIA_TRI.length);
      if (r.value === null || typeof r.value !== "object" || Array.isArray(r.value)) {
        loi.push(`${r.key}: cần đối tượng giá trị chuẩn → tên riêng`);
        continue;
      }
      const m: Record<string, string> = {};
      for (const [neo, nhan] of Object.entries(r.value as Record<string, unknown>)) {
        const kq = kiemNhanGiaTri(f, neo, nhan);
        if (kq.ok) m[neo] = kq.nhan;
        else loi.push(kq.loi);
      }
      if (laTruongDong(f) && Object.keys(m).length > 0) giaTri[f] = m;
    }
  }
  return { tuVung: { truong, giaTri }, loi };
}

/**
 * Dòng cần ghi để bảng đang lưu (`daLuu`) thành bộ mới (`moi`, từ `dungDongNhan`): khoá mới hay đổi giá trị → dòng mới;
 * khoá đang có giá trị (khác `null`) mà vắng trong bộ mới → `null` (trả về mặc định, nhật ký vẫn có vết); khoá giữ
 * nguyên → không ghi (không thổi phồng nhật ký).
 */
/** Chuỗi hoá bền với thứ tự khoá: jsonb trả khoá theo thứ tự của nó (độ dài trước), thân gửi theo thứ tự tập đóng. */
function chuoiBen(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(chuoiBen).join(",")}]`;
  if (v !== null && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${chuoiBen(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v) ?? "null";
}

export function doiNhan(daLuu: readonly DongNhan[], moi: readonly DongNhan[]): DongNhan[] {
  const cu = new Map(daLuu.filter((r) => laKhoaNhan(r.key)).map((r) => [r.key, chuoiBen(r.value)]));
  const ra: DongNhan[] = [];
  const coMoi = new Set<string>();
  for (const r of moi) {
    coMoi.add(r.key);
    if (cu.get(r.key) !== chuoiBen(r.value)) ra.push(r);
  }
  for (const [key, v] of cu) if (!coMoi.has(key) && v !== "null") ra.push({ key, value: null });
  return ra;
}

/**
 * Phần `statuses` của thân labels → bộ nhãn trạng thái. Cùng khuôn với `nhanTuBang` của `@quy-hang/core/statuses` (đọc lại
 * ở đây để không vòng nhập; bài kiểm của Bảng hàng buộc hai hàm cho cùng kết quả). Thân vắng hay hỏng → bộ rỗng.
 */
function trangThaiTuBang(statuses: unknown): NhanTrangThai[] {
  const ra: NhanTrangThai[] = [];
  if (!Array.isArray(statuses)) return ra;
  for (const s of statuses as unknown[]) {
    const d = s as { status?: unknown; labels?: unknown } | null;
    if (!d || !isStandardStatus(d.status) || !Array.isArray(d.labels)) continue;
    for (const l of d.labels as unknown[]) {
      const x = l as { code?: unknown; label?: unknown } | null;
      if (x && typeof x.code === "string" && MA_NHAN_TRANG_THAI_RE.test(x.code) && typeof x.label === "string" && x.label.trim())
        ra.push({ ma: x.code, label: x.label, anchor: d.status });
    }
  }
  return ra;
}

/** Đọc ngược thân `GET /api/v1/company/labels` (khuôn `BangNhan`) thành từ vựng — chỉ dòng `custom`, cộng bộ nhãn trạng thái. */
export function tuVungTuBang(
  bang: { fields?: readonly unknown[]; values?: readonly unknown[]; statuses?: readonly unknown[] } | null | undefined,
): TuVung {
  const truong: Partial<Record<TruongDatTen, string>> = {};
  const giaTri: Partial<Record<TruongDong, Partial<Record<string, string>>>> = {};
  for (const f of bang?.fields ?? []) {
    const r = (f ?? {}) as Record<string, unknown>;
    if (r.custom === true && laTruongDatTen(r.field) && typeof r.label === "string") truong[r.field] = r.label;
  }
  for (const v of bang?.values ?? []) {
    const r = (v ?? {}) as Record<string, unknown>;
    if (r.custom !== true || !laTruongDong(r.field) || typeof r.value !== "string" || typeof r.label !== "string") continue;
    (giaTri[r.field] ??= {})[r.value] = r.label;
  }
  const trangThai = trangThaiTuBang(bang?.statuses);
  // Sàn chưa đặt nhãn trạng thái: từ vựng giữ đúng hình cũ (không khoá `trangThai`).
  return trangThai.length ? { truong, giaTri, trangThai } : { truong, giaTri };
}

/** Tên một trường trên một mặt: tên riêng của sàn, vắng thì chữ mặc định của chính mặt ấy. */
export function nhanTruong(tv: TuVung | null | undefined, truong: string, macDinh: string): string {
  return (laTruongDatTen(truong) ? tv?.truong[truong] : undefined) ?? macDinh;
}

/** Chữ hiện của một giá trị chuẩn: tên riêng của sàn, vắng thì chữ mặc định của mặt ấy. */
export function nhanGiaTri(tv: TuVung | null | undefined, truong: string, chuan: string, macDinh: string): string {
  return (laTruongDong(truong) ? tv?.giaTri[truong]?.[chuan] : undefined) ?? macDinh;
}

/**
 * Phần từ vựng được theo căn ra ngoài công ty (bất biến 4 — cửa duy nhất nhãn đi ra): nhãn của trường có trong tập
 * khoá ra của người nhận, và tên giá trị của trường đóng có khoá ra (`feeInclusion`). `withdrawnReason`, trạng thái chuẩn,
 * giá chốt, ngày bán không có khoá ra nên không bao giờ đi.
 */
export function tuVungRaNgoai(tv: TuVung | null | undefined, khoaRa: readonly string[]): TuVung {
  if (!tv) return TU_VUNG_RONG;
  const cho = new Set(khoaRa);
  const truong: Partial<Record<TruongDatTen, string>> = {};
  for (const [f, nhan] of Object.entries(tv.truong) as [TruongDatTen, string][]) if (cho.has(f)) truong[f] = nhan;
  const giaTri: TuVung["giaTri"] = {};
  for (const [f, m] of Object.entries(tv.giaTri) as [TruongDong, Record<string, string>][]) if (cho.has(f) && m) giaTri[f] = { ...m };
  return { truong, giaTri };
}

/** Lớp dữ liệu của các trường đổi tên được — để bài kiểm buộc «không trường source». */
export const lopTruongDatTen = (f: TruongDatTen) => (Object.hasOwn(FIELD_CLASS, f) ? FIELD_CLASS[f as keyof typeof FIELD_CLASS] : null);

/** Bảng nhãn của màn Cách gọi và của `GET /api/v1/company/labels`: mọi trường và mọi giá trị đóng, kèm mặc định. */
export type BangNhan = {
  fields: { field: TruongDatTen; label: string; default: string; custom: boolean }[];
  values: { field: TruongDong; value: string; label: string; default: string; custom: boolean }[];
};
export function bangNhan(tv: TuVung | null | undefined): BangNhan {
  return {
    fields: DS_TRUONG_DAT_TEN.map((field) => {
      const rieng = tv?.truong[field];
      return { field, label: rieng ?? TRUONG_DAT_TEN[field], default: TRUONG_DAT_TEN[field], custom: rieng !== undefined };
    }),
    values: DS_TRUONG_DONG.flatMap((field) =>
      Object.entries(TAP_DONG[field]).map(([value, macDinh]) => {
        const rieng = tv?.giaTri[field]?.[value];
        return { field, value, label: rieng ?? macDinh, default: macDinh, custom: rieng !== undefined };
      }),
    ),
  };
}
