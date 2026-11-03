/**
 * Phân loại cột (Kiến trúc «Nhập dữ liệu» §3) — chạy TRƯỚC mọi bước có thể gửi đi. Sáu lớp tạm; thứ tự quyết nghiêng về
 * che: bộ dò trên mọi ô thắng tiêu đề, tiêu đề nguồn thắng dáng giá trị, và cột không nhận ra là `unknown` (chỉ hình dạng).
 */
import { detectPersonal, looksLikePersonName } from "./detect";
import { FIELD_CLASS } from "./fields";
import { lookupHeader, type CompanyHeader } from "./headers";
import type { Table } from "./grid";
import { bedrooms, direction, feeCondition, status, unitCode, type Cell } from "./transforms";

export const COLUMN_CLASSES = ["source", "person_name", "free_text", "catalog", "shareable_listing", "unknown"] as const;
export type ColumnClass = (typeof COLUMN_CLASSES)[number];

/** Tỉ lệ ô trúng bộ dò để cả cột là `source` (Kiến trúc §3: 30%). Dưới ngưỡng mà có ô trúng → `free_text`. */
export const PERSONAL_SHARE_SOURCE = 0.3;
/** Tỉ lệ ô có dáng họ tên để cột là `person_name` (50%). */
export const NAME_SHARE = 0.5;
/** Độ dài trung bình để cột là chữ tự do (25 ký tự). */
export const FREE_TEXT_AVG_LENGTH = 25;
/** Tỉ lệ ô đọc được bằng một phép để nhận cột theo giá trị (80%). */
export const VALUE_SHARE = 0.8;

export type ColumnClassification = { index: number; header: string; cls: ColumnClass; reason: string };

const coGiaTri = (c: Cell): c is string | number => c !== null && !(typeof c === "string" && c.trim() === "");

/** Tỉ lệ ô (không trống) mà phép đọc ra giá trị — dùng chung cho phân loại và ghép theo giá trị. */
export function readableShare(cells: readonly Cell[], doc: (c: Cell) => { mark: string }): number {
  const co = cells.filter(coGiaTri);
  if (co.length === 0) return 0;
  return co.filter((c) => {
    const m = doc(c).mark;
    return m === "keep" || m === "fixed";
  }).length / co.length;
}

export function classifyColumns(table: Table, companyHeaders: readonly CompanyHeader[] = []): ColumnClassification[] {
  return table.headers.map((header, index) => {
    const cells = table.rows.map((r) => r.cells[index] ?? null);
    const co = cells.filter(coGiaTri);
    const out = (cls: ColumnClass, reason: string): ColumnClassification => ({ index, header, cls, reason });
    const trung = co.filter((c) => detectPersonal(c) !== null).length;
    if (co.length > 0 && trung / co.length >= PERSONAL_SHARE_SOURCE) return out("source", `${trung}/${co.length} ô có số điện thoại, email hay số giấy tờ`);
    const dich = lookupHeader(header, companyHeaders);
    if (dich && dich !== "row_index" && FIELD_CLASS[dich] === "source") return out("source", "tiêu đề thuộc từ điển nguồn");
    if (trung > 0) return out("free_text", `${trung} ô có số điện thoại, email hay số giấy tờ`);
    if (dich === "listAgentName") return out("person_name", "tiêu đề là tên người");
    if (dich === "privateRemarks") return out("free_text", "tiêu đề là ghi chú");
    if (co.length > 0 && co.filter(looksLikePersonName).length / co.length >= NAME_SHARE) return out("person_name", "ô có dáng họ tên");
    const dai = co.length ? co.reduce<number>((s, c) => s + String(c).length, 0) / co.length : 0;
    if (dai > FREE_TEXT_AVG_LENGTH) return out("free_text", `chữ dài trung bình ${Math.round(dai)} ký tự`);
    if (dich && dich !== "row_index") {
      const lop = FIELD_CLASS[dich];
      if (lop === "catalog" || lop === "shareable_listing") return out(lop, "tiêu đề khớp từ điển");
    }
    const theoGiaTri: [ColumnClass, (c: Cell) => { mark: string }][] = [
      ["catalog", (c) => unitCode(c)],
      ["shareable_listing", (c) => status(c)],
      ["shareable_listing", (c) => feeCondition(c)],
      ["catalog", (c) => direction(c)],
    ];
    for (const [lop, doc] of theoGiaTri) if (readableShare(cells, doc) >= VALUE_SHARE) return out(lop, "giá trị khớp một phép đọc");
    if (co.length > 0 && readableShare(cells, (c) => (typeof c === "string" && /\d\s*(pn|n)\b/i.test(c) ? bedrooms(c) : { mark: "x" })) >= VALUE_SHARE)
      return out("catalog", "giá trị là số phòng ngủ");
    return out("unknown", "không nhận ra — chỉ gửi hình dạng");
  });
}
