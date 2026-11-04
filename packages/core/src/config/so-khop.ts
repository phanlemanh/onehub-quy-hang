/**
 * Bộ kiểm «sổ khớp» (ADR-0018 quyết định 6): đọc các bảng phần A của `docs/architecture/so-diem-bien-thien.md` và so hai
 * chiều với sổ ở mã. Hàm thuần — người gọi đưa chữ tài liệu vào, nên bộ kiểm chạy được trên bản sao đã phá.
 *
 * So: khoá, số thứ tự, loại kiểu, lớp, tình trạng, hiệu lực, vai được đổi, mặc định (kiểu `int`), khoảng (kiểu số). Cột
 * «Ghi đè» là chữ tự do — không so.
 */
import type { Role } from "../navigation";
import { SO_DIEM, type DiemSo, type HieuLuc, type TinhTrang } from "./so";

export type DongTaiLieu = {
  so: string;
  khoa: string;
  kieu: string;
  macDinh: string;
  khoang: string;
  aiDoi: string;
  hieuLuc: string;
  lop: string;
  tinhTrang: string;
};

/** Các dòng bảng phần A: dòng bắt đầu bằng ô số thứ tự rồi ô khoá trong backtick. */
export function docSoTaiLieu(md: string): DongTaiLieu[] {
  const batDau = md.indexOf("\n## A.");
  const ketThuc = md.indexOf("\n## B.");
  const phanA = md.slice(batDau < 0 ? 0 : batDau, ketThuc < 0 ? undefined : ketThuc);
  const ra: DongTaiLieu[] = [];
  for (const dong of phanA.split("\n")) {
    const m = /^\|\s*([0-9]+[a-z]?)\s*\|\s*`([^`]+)`\s*\|/.exec(dong);
    if (!m) continue;
    const o = dong.split("|").slice(1, -1).map((x) => x.trim());
    ra.push({ so: m[1]!, khoa: m[2]!, kieu: o[3] ?? "", macDinh: o[4] ?? "", khoang: o[5] ?? "", aiDoi: o[6] ?? "", hieuLuc: o[8] ?? "", lop: o[9] ?? "", tinhTrang: o[10] ?? "" });
  }
  return ra;
}

const NHAN_VAI: readonly [RegExp, Role][] = [
  [/quản trị sàn/i, "company_admin"],
  [/đầu chủ/i, "listing_agent"],
  [/đầu khách/i, "buyer_agent"],
  [/trưởng nhóm/i, "team_lead"],
  [/telesales/i, "telesales"],
];

/** Chữ «Ai đổi» → mã vai, theo nhãn vai ở `CONTEXT.md`. */
export function vaiTuChu(chu: string): Role[] {
  return NHAN_VAI.filter(([re]) => re.test(chu))
    .map(([, v]) => v)
    .sort();
}

export function hieuLucTuChu(chu: string): HieuLuc | null {
  const s = chu.trim().toLocaleLowerCase("vi");
  if (s.startsWith("mới")) return "moi";
  if (s.includes("tính lại")) return "tinh_lai";
  if (s.includes("lần")) return "lan_sau";
  return null;
}

function tinhTrangTuChu(chu: string): TinhTrang | null {
  if (/^mở/i.test(chu)) return "mo";
  if (/^đề xuất/i.test(chu)) return "de_xuat";
  return null;
}

const so = (s: string) => Number(s.replace(",", "."));

/** Khoảng `a–b` ở đầu ô (dấu phẩy thập phân kiểu Việt); không đọc được → null. */
export function khoangTuChu(chu: string): { min: number; max: number } | null {
  const m = /^(\d+(?:,\d+)?)\s*[–-]\s*(\d+(?:,\d+)?)/.exec(chu.trim());
  return m ? { min: so(m[1]!), max: so(m[2]!) } : null;
}

/** So sổ tài liệu với sổ mã; mỗi lỗi mở đầu bằng khoá và nêu cột lệch. */
export function soKhop(md: string, soMa: readonly DiemSo[] = SO_DIEM): string[] {
  const doc = docSoTaiLieu(md);
  const loi: string[] = [];
  const theoKhoa = new Map(doc.map((d) => [d.khoa, d]));
  const maKhoa = new Set(soMa.map((d) => d.khoa));
  for (const d of doc) if (!maKhoa.has(d.khoa)) loi.push(`${d.khoa}: chỉ có ở tài liệu`);
  for (const m of soMa) {
    const t = theoKhoa.get(m.khoa);
    if (!t) {
      loi.push(`${m.khoa}: chỉ có ở mã`);
      continue;
    }
    const lech = (cot: string, taiLieu: unknown, ma: unknown) =>
      loi.push(`${m.khoa}: cột ${cot} lệch — tài liệu «${String(taiLieu)}», mã «${String(ma)}»`);
    if (t.so !== m.so) lech("số thứ tự", t.so, m.so);
    const kieu = /`([a-z]+)/.exec(t.kieu)?.[1] ?? t.kieu;
    if (kieu !== m.kieu.loai) lech("kiểu", kieu, m.kieu.loai);
    if (t.lop !== m.lop) lech("lớp", t.lop, m.lop);
    if (tinhTrangTuChu(t.tinhTrang) !== m.tinhTrang) lech("tình trạng", t.tinhTrang, m.tinhTrang);
    if (hieuLucTuChu(t.hieuLuc) !== m.hieuLuc) lech("hiệu lực", t.hieuLuc, m.hieuLuc);
    const vai = vaiTuChu(t.aiDoi);
    if (vai.join(",") !== [...m.aiDoi].sort().join(",")) lech("ai đổi", t.aiDoi, m.aiDoi.join(", "));
    if (m.kieu.loai === "int") {
      const md0 = /^\d+/.exec(t.macDinh.trim())?.[0];
      const taiLieu = md0 === undefined ? null : Number(md0);
      if (taiLieu !== m.macDinh) lech("mặc định", t.macDinh, m.macDinh);
    }
    if (m.kieu.loai === "int" || m.kieu.loai === "decimal") {
      const k = khoangTuChu(t.khoang);
      if (!k || k.min !== m.kieu.min || k.max !== m.kieu.max) lech("khoảng", t.khoang, `${m.kieu.min}–${m.kieu.max}`);
    }
  }
  return loi;
}
