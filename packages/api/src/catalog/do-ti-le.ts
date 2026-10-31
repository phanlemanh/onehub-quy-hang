// Đo tỉ lệ mã căn tự điền được trên dữ liệu mẫu (hàng 9, AC-10; Tham chiếu §11).
// Chạy: node --import tsx packages/api/src/catalog/do-ti-le.ts
import { buildCatalogIndex, lookupUnit, UNIT_ATTRIBUTE_FIELDS, UNIT_CODE_RULES, type CatalogData, type UnitCodeRule } from "@quy-hang/core";
import { pathToFileURL } from "node:url";
import { SAMPLE_PACK } from "./sample";

/** Một mã đã gõ và căn đúng của nó, theo UPI. */
export type DapAn = { input: string; upi: string };

export type KetQuaDo = {
  tong: number;
  dung: number;
  hut: DapAn[];
  ngoaiTong: number;
  chuaCo: number;
  dienDoan: number;
  /** Mã ra «nhiều căn» (ambiguous): hụt — ô không tự điền — nhưng không là điền đoán, vì kết quả chỉ liệt ứng viên. */
  nhieuCan: number;
  dong: string;
};

const THUOC_TINH = new Set<string>(UNIT_ATTRIBUTE_FIELDS.filter((f) => f !== "projectKey" && f !== "projectName" && f !== "unitNumber"));
function coThuocTinh(v: unknown): boolean {
  if (Array.isArray(v)) return v.some(coThuocTinh);
  if (v && typeof v === "object") return Object.entries(v).some(([k, x]) => THUOC_TINH.has(k) || coThuocTinh(x));
  return false;
}

/**
 * Tra từng mã của bảng đáp án và bộ ngoài danh mục. Đúng = found với UPI trùng đáp án; nhiều căn = ambiguous, tính là hụt
 * (hàng 63, Hỏi-2); điền đoán = kết quả không phải found, không phải nhiều căn, mà vẫn mang thuộc tính căn.
 */
export function measureAutofill(catalog: CatalogData, answers: readonly DapAn[], outside: readonly string[], rules: readonly UnitCodeRule[] = UNIT_CODE_RULES): KetQuaDo {
  const index = buildCatalogIndex(catalog, rules);
  let dung = 0;
  let dienDoan = 0;
  let nhieuCan = 0;
  const hut: DapAn[] = [];
  for (const a of answers) {
    const kq = lookupUnit(index, a.input);
    if (kq.status === "found" && kq.unit.upi === a.upi) dung++;
    else {
      hut.push(a);
      if (kq.status === "ambiguous") nhieuCan++;
      else if (kq.status !== "found" && coThuocTinh(kq)) dienDoan++;
    }
  }
  let chuaCo = 0;
  for (const s of outside) {
    const kq = lookupUnit(index, s);
    if (kq.status === "not_in_catalog") chuaCo++;
    if (kq.status !== "found" && kq.status !== "ambiguous" && coThuocTinh(kq)) dienDoan++;
  }
  const tong = answers.length;
  const pct = tong ? Math.round((dung / tong) * 1000) / 10 : 0;
  const dong = `tự điền đúng ${dung}/${tong} (${pct}%) · chưa có ${chuaCo}/${outside.length} · điền đoán ${dienDoan}${nhieuCan ? ` · nhiều căn ${nhieuCan}` : ""}`;
  return { tong, dung, hut, ngoaiTong: outside.length, chuaCo, dienDoan, nhieuCan, dong };
}

/** Năm kiểu viết lại của một mã chuẩn kiểu `A-12.06`. */
export const KIEU_VIET: readonly ((ma: string) => string)[] = [
  (m) => m.toLowerCase(),
  (m) => m.replace(/[-.]/g, ""),
  (m) => m.replace(/[-.]/g, " "),
  (m) => m.replace(/[-.]/g, "/"),
  (m) => m.replace(/\.0(\d)$/, ".$1"),
];

export const NGOAI_DANH_MUC = ["C-01.01", "A-16.01", "A-01.07", "B-00.01"] as const;

/** Bảng đáp án từ gói mẫu: hàng theo UPI gói ghi, lead có mã theo toà + mã căn danh mục; mỗi mã thêm năm kiểu viết. */
export function dapAnMau(): DapAn[] {
  const danhMuc = SAMPLE_PACK.danhMuc;
  const goc: DapAn[] = SAMPLE_PACK.hang.map((h) => ({ input: h.maCan, upi: h.upi }));
  for (const l of SAMPLE_PACK.lead) {
    if (!l.maCan) continue;
    const can = danhMuc.projects.flatMap((p) => p.buildings).filter((b) => b.buildingKey === l.toa).flatMap((b) => b.units).find((u) => u.unitNumber === l.maCan);
    if (can) goc.push({ input: l.maCan, upi: can.upi });
  }
  return goc.flatMap((a) => [a, ...KIEU_VIET.map((f) => ({ input: f(a.input), upi: a.upi }))]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const kq = measureAutofill(SAMPLE_PACK.danhMuc, dapAnMau(), NGOAI_DANH_MUC);
  console.log(kq.dong);
  for (const h of kq.hut) console.log(`hụt: «${h.input}» → ${h.upi}`);
  process.exitCode = kq.dung === kq.tong && kq.chuaCo === kq.ngoaiTong && kq.dienDoan === 0 ? 0 : 1;
}
