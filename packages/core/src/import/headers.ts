/**
 * Từ điển tiêu đề dựng sẵn (ADR-0011 quyết định 1: «bộ ghép tất định — từ điển tiêu đề chuẩn + bộ nhớ của sàn»). Tiêu
 * đề so bằng `headerKey`: bỏ dấu, bỏ phần trong ngoặc (đơn vị đọc riêng), bỏ dấu câu. Từ điển của sàn (hàng 67) chồng lên
 * qua `companyHeaders` của `planFromDictionary`.
 */
import { fold } from "./dictionaries";
import type { StandardField } from "./fields";

/** Đích không phải trường chuẩn mà từ điển biết: cột số thứ tự. */
export type HeaderTarget = StandardField | "row_index";

/** Khoá so của một tiêu đề: «Giá (tỷ)» → «gia»; «Diện tích (m²)» → «dien tich»; «Giá / Chào» → «gia chao». */
export function headerKey(header: string): string {
  return fold(header)
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DONG_NGHIA: Record<HeaderTarget, readonly string[]> = {
  unitNumber: ["ma can", "ma", "can", "ma can ho", "can so", "so can", "unit", "ma ch", "can ho"],
  buildingName: ["toa", "toa nha", "block", "blk", "tower", "toa block"],
  subdivisionName: ["du an", "ten du an", "project"],
  floor: ["tang", "tang so", "lau"],
  livingArea: ["dt", "dien tich", "s", "s thong thuy", "dt thong thuy", "dien tich thong thuy", "dttt", "dien tich tim tuong", "dt tim tuong", "m2"],
  bedroomsTotal: ["pn", "so pn", "so phong ngu", "phong ngu", "ph ngu", "so phong", "loai can"],
  directionFaces: ["huong", "huong ban cong", "huong bc", "huong cua", "hbc", "huong can"],
  listPrice: ["gia", "gia chao", "gia ban", "gia rao", "gia ty", "chao", "gia chao ban"],
  feeInclusion: ["phi", "phi cn", "phi chuyen nhuong", "dieu kien phi", "bao phi", "phi sang ten", "dk phi", "thue phi"],
  standardStatus: ["tt", "trang thai", "tinh trang", "status", "tinh trang can"],
  ownerName: ["chu nha", "ten chu nha", "ten cn", "cn", "chu", "ho ten chu", "ten chu"],
  ownerPhone: ["sdt", "sdt chu", "so dt", "so dt chu", "so dien thoai", "so dien thoai chu nha", "dien thoai", "lien he", "sdt cn", "dt chu", "so chu"],
  floorPrice: ["gia day", "gia chu chot", "gia chot chu", "gia ve tay"],
  listAgentName: ["dau chu", "nguoi phu trach", "nv", "nhan vien", "sale", "moi gioi", "nguoi nhap", "nv phu trach"],
  privateRemarks: ["ghi chu", "note", "mo ta", "luu y", "ghi chu noi bo"],
  confirmedDate: ["ngay", "ngay cap nhat", "ngay xac nhan", "cap nhat", "ngay check", "ngay kiem tra"],
  row_index: ["stt", "so tt", "no", "so thu tu"],
};

const BANG: ReadonlyMap<string, HeaderTarget> = (() => {
  const m = new Map<string, HeaderTarget>();
  for (const [dich, ds] of Object.entries(DONG_NGHIA) as [HeaderTarget, readonly string[]][]) for (const d of ds) m.set(d, dich);
  return m;
})();

/** Một dòng từ điển tiêu đề của sàn: tiêu đề nguyên văn → đích. */
export type CompanyHeader = { header: string; target: HeaderTarget };

/**
 * Tra một tiêu đề. Tiêu đề hai tầng «cha / con»: thử cả hai tầng ghép, rồi tầng con. Không khớp → null.
 */
export function lookupHeader(header: string, company: readonly CompanyHeader[] = []): HeaderTarget | null {
  const thu = [header];
  if (header.includes(" / ")) thu.push(header.slice(header.lastIndexOf(" / ") + 3));
  for (const h of thu) {
    const k = headerKey(h);
    const cuaSan = company.find((c) => headerKey(c.header) === k);
    if (cuaSan) return cuaSan.target;
    const v = BANG.get(k);
    if (v) return v;
  }
  return null;
}

/** Đơn vị giá ghi ở tiêu đề: «Giá (tỷ)», «Giá chào (VNĐ)», «Giá triệu». */
export function priceUnitOfHeader(header: string): "ty" | "trieu" | "dong" | null {
  const f = fold(header);
  if (/\bty\b|\(ty\)|\bti\b/.test(f)) return "ty";
  if (/trieu|\(tr\)|\btr\b/.test(f)) return "trieu";
  if (/vnd|dong|\(d\)/.test(f)) return "dong";
  return null;
}
