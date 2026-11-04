/**
 * Khuôn giá trị của từng điểm — lược đồ zod sinh từ dòng sổ (ADR-0018 quyết định 1) — và hai bộ kiểm: một giá trị sàn gửi
 * lên (`kiemGiaTri`), cả sổ (`kiemSo`). Mọi lỗi mở đầu bằng khoá, để lệnh API và bộ kiểm nói đúng điểm hỏng.
 */
import { z } from "zod";
import { DATA_CLASSES } from "../data-classes";
import { detectPersonal } from "../import/detect";
import { ROLES } from "../navigation";
import { HIEU_LUC, SO_DIEM, TINH_TRANG, type DiemSo } from "./so";

const DOAN_HO = /^<[^>]+>$/;
const DOAN_THAT = /^[A-Za-z0-9_]+$/;
const KHUON_KHOA = /^[a-z_]+(\.([a-z_]+|<[^>]+>))+$/;
const KHUON_KHOA_MAP = /^[a-z_]+(\.([a-z_]+|<[^>]+>))*$/;

/** Dòng sổ của một khoá: khớp nguyên khoá, hay khớp một họ khoá theo từng đoạn (`labels.field.unitNumber`). */
export function timDiem(khoa: string, so: readonly DiemSo[] = SO_DIEM): DiemSo | null {
  const dung = so.find((d) => d.khoa === khoa);
  if (dung) return dung;
  const doan = khoa.split(".");
  return (
    so.find((d) => {
      const mau = d.khoa.split(".");
      return mau.length === doan.length && mau.some((m) => DOAN_HO.test(m)) && mau.every((m, i) => (DOAN_HO.test(m) ? DOAN_THAT.test(doan[i]!) : m === doan[i]));
    }) ?? null
  );
}

/** Mô tả khuôn bằng lời, cho câu lỗi. */
export function moTaKhuon(d: DiemSo): string {
  const k = d.kieu;
  const trong = d.coTheTrong ? " hoặc null" : "";
  switch (k.loai) {
    case "int":
      return `cần số nguyên ${k.min}–${k.max} ${k.donVi}${trong}`;
    case "decimal":
      return `cần số ${k.min}–${k.max} ${k.donVi}${trong}`;
    case "bool":
      return `cần true hoặc false${trong}`;
    case "enum":
      return `cần một trong ${k.giaTri.join(", ")}${trong}`;
    case "set":
      return `cần tập con khác rỗng, không lặp, của ${k.giaTri.join(", ")}${trong}`;
    case "text":
      return `cần chữ 1–${k.toiDa} ký tự, không chứa số điện thoại, email hay số giấy tờ${trong}`;
    case "map":
      return "có bảng riêng";
  }
}

/** Lược đồ zod của giá trị một điểm; `map` không có — đối tượng ấy có bộ kiểm riêng của hàng nó. */
export function khuonCua(d: DiemSo): z.ZodTypeAny | null {
  const k = d.kieu;
  let s: z.ZodTypeAny;
  switch (k.loai) {
    case "int":
      s = z.number().int().min(k.min).max(k.max);
      break;
    case "decimal":
      s = z.number().finite().min(k.min).max(k.max);
      break;
    case "bool":
      s = z.boolean();
      break;
    case "enum":
      s = z.string().refine((v) => k.giaTri.includes(v));
      break;
    case "set":
      s = z
        .array(z.string().refine((v) => k.giaTri.includes(v)))
        .min(1)
        .refine((a) => new Set(a).size === a.length);
      break;
    case "text":
      s = z
        .string()
        .min(1)
        .max(k.toiDa)
        .refine((v) => detectPersonal(v) === null);
      break;
    case "map":
      return null;
  }
  return d.coTheTrong ? s.nullable() : s;
}

export type KetQuaKiem = { ok: true; khoa: string; giaTri: unknown } | { ok: false; khoa: string; loi: string };

/**
 * Kiểm một giá trị sàn gửi cho một khoá. `cauHinh` là cấu hình đang áp của sàn (khoá → giá trị), dùng cho ràng buộc chéo
 * như «hạn gọi không nhỏ hơn hạn nhận»; vắng thì so với mặc định của sổ.
 */
export function kiemGiaTri(
  khoa: string,
  giaTri: unknown,
  cauHinh: Readonly<Record<string, unknown>> = {},
  so: readonly DiemSo[] = SO_DIEM,
): KetQuaKiem {
  const d = timDiem(khoa, so);
  if (!d) return { ok: false, khoa, loi: `${khoa}: không có trong sổ điểm biến thiên` };
  const khuon = khuonCua(d);
  if (!khuon) return { ok: false, khoa, loi: `${khoa}: có bảng riêng, không đổi qua giá trị đơn` };
  if (!khuon.safeParse(giaTri).success) return { ok: false, khoa, loi: `${khoa}: ${moTaKhuon(d)}, nhận ${JSON.stringify(giaTri)}` };
  if (d.khongNhoHon !== undefined && typeof giaTri === "number") {
    const goc = d.khongNhoHon in cauHinh ? cauHinh[d.khongNhoHon] : timDiem(d.khongNhoHon, so)?.macDinh;
    if (typeof goc === "number" && giaTri < goc) return { ok: false, khoa, loi: `${khoa}: không nhỏ hơn ${d.khongNhoHon} (${goc}), nhận ${giaTri}` };
  }
  return { ok: true, khoa, giaTri };
}

/** Kiểm cả sổ: khuôn khoá, trùng khoá hay số, vai, hiệu lực, lớp (không bao giờ `source`), tình trạng, mặc định qua khuôn. */
export function kiemSo(so: readonly DiemSo[]): string[] {
  const loi: string[] = [];
  const khoaDaThay = new Set<string>();
  const soDaThay = new Set<string>();
  for (const d of so) {
    const k = d.khoa;
    // Đối tượng có bảng riêng được khai ở cấp nhóm (`custom_fields`, sổ tài liệu #22); giá trị đơn luôn `<nhóm>.<khoá>`.
    const khuonKhoa = d.kieu.loai === "map" ? KHUON_KHOA_MAP : KHUON_KHOA;
    if (!khuonKhoa.test(k)) loi.push(`${k}: khoá phải dạng <nhóm>.<khoá> chữ thường, gạch dưới`);
    if (khoaDaThay.has(k)) loi.push(`${k}: khoá trùng`);
    khoaDaThay.add(k);
    if (soDaThay.has(d.so)) loi.push(`${k}: số thứ tự ${d.so} trùng`);
    soDaThay.add(d.so);
    if (d.aiDoi.length === 0) loi.push(`${k}: chưa khai vai được đổi`);
    for (const v of d.aiDoi) if (!ROLES.includes(v)) loi.push(`${k}: vai lạ «${v}»`);
    if (!HIEU_LUC.includes(d.hieuLuc)) loi.push(`${k}: hiệu lực lạ «${d.hieuLuc}»`);
    if (!DATA_CLASSES.includes(d.lop)) loi.push(`${k}: lớp lạ «${d.lop}»`);
    if (d.lop === "source") loi.push(`${k}: lớp source — thông tin chủ nhà không bao giờ là cấu hình (bất biến 2)`);
    if (!TINH_TRANG.includes(d.tinhTrang)) loi.push(`${k}: tình trạng lạ «${d.tinhTrang}»`);
    if ((d.kieu.loai === "int" || d.kieu.loai === "decimal") && d.kieu.min > d.kieu.max) loi.push(`${k}: khoảng ${d.kieu.min}–${d.kieu.max} ngược`);
    if (d.khongNhoHon !== undefined && !so.some((x) => x.khoa === d.khongNhoHon)) loi.push(`${k}: khongNhoHon trỏ khoá không có «${d.khongNhoHon}»`);
    const khuon = khuonCua(d);
    if (khuon && !khuon.safeParse(d.macDinh).success) loi.push(`${k}: mặc định ${JSON.stringify(d.macDinh)} ngoài khuôn — ${moTaKhuon(d)}`);
  }
  return loi;
}
