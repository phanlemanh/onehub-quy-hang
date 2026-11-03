/**
 * Hồ sơ cột (Kiến trúc «Nhập dữ liệu» §3, ADR-0011 quyết định 2) — thứ DUY NHẤT về một file được phép rời trình duyệt để
 * lập kế hoạch. Mọi cột mang tiêu đề và hình dạng; chỉ cột lớp `catalog`, `shareable_listing` mang giá trị khác nhau (tối
 * đa 300). Trong cột ấy, một giá trị vẫn bị giữ lại khi trúng bộ dò, có dáng họ tên, hay trùng (hoặc chứa) một giá trị của
 * cột nguồn, tên người, chữ tự do cùng file — bắt «tên chủ trong cột Toà». Hồ sơ là JSON thuần, không trỏ lại lưới.
 */
import type { ColumnClass, ColumnClassification } from "./classify";
import { detectPersonal, looksLikePersonName } from "./detect";
import { fold } from "./dictionaries";
import type { Table } from "./grid";
import type { Cell } from "./transforms";

export const MAX_PROFILE_VALUES = 300;
const LOP_MO: readonly ColumnClass[] = ["catalog", "shareable_listing"];
const LOP_KIN: readonly ColumnClass[] = ["source", "person_name", "free_text"];
/** Giá trị kín ngắn hơn chừng này không dùng để dò «chứa trong» (tránh che nhầm «A», «12»). */
const DO_DAI_DO_CHUA = 5;

export type ColumnShape = {
  rows: number;
  blanks: number;
  distinct: number;
  minLength: number;
  maxLength: number;
  /** Lớp ký tự của các ô: «digits» chỉ chữ số (sau khi bỏ cách, chấm, gạch), «letters» không chữ số, «mixed». */
  charClass: "digits" | "letters" | "mixed" | "empty";
  /** Phần trăm ô chỉ-chữ-số bắt đầu bằng «0» — đủ để nhận cột số mà không lộ số nào. */
  leadingZeroPct: number;
  /** Số ô bị giữ lại khỏi `values` (chỉ ở cột mở). */
  withheld: number;
};

export type ColumnProfile = { index: number; header: string; cls: ColumnClass; shape: ColumnShape; values?: string[] };
export type Profile = { columns: ColumnProfile[] };

const chu = (c: Cell): string => (c === null ? "" : String(c).normalize("NFC").trim());

export function buildProfile(table: Table, classes: readonly ColumnClassification[]): Profile {
  const kin: string[] = [];
  for (const k of classes) {
    if (!LOP_KIN.includes(k.cls)) continue;
    for (const r of table.rows) {
      const v = chu(r.cells[k.index] ?? null);
      if (v) kin.push(fold(v));
    }
  }
  const tapKin = new Set(kin);
  const kinDai = [...tapKin].filter((v) => v.length >= DO_DAI_DO_CHUA);
  const lo = (v: string) => {
    const f = fold(v);
    return tapKin.has(f) || kinDai.some((k) => f.includes(k)) || detectPersonal(v) !== null || looksLikePersonName(v);
  };

  return {
    columns: classes.map((k) => {
      const cells = table.rows.map((r) => r.cells[k.index] ?? null);
      const co = cells.map(chu).filter(Boolean);
      const khac = [...new Set(co)];
      const chiSo = co.map((v) => v.replace(/[\s.\-()+]/g, "")).filter((v) => /^\d+$/.test(v));
      const coSo = co.some((v) => /\d/.test(v));
      const coChu = co.some((v) => /\p{L}/u.test(v));
      const shape: ColumnShape = {
        rows: cells.length,
        blanks: cells.length - co.length,
        distinct: khac.length,
        minLength: co.length ? Math.min(...co.map((v) => v.length)) : 0,
        maxLength: co.length ? Math.max(...co.map((v) => v.length)) : 0,
        charClass: co.length === 0 ? "empty" : chiSo.length === co.length ? "digits" : coSo && coChu ? "mixed" : coSo ? "mixed" : "letters",
        leadingZeroPct: chiSo.length ? Math.round((100 * chiSo.filter((v) => v.startsWith("0")).length) / chiSo.length) : 0,
        withheld: 0,
      };
      if (!LOP_MO.includes(k.cls)) return { index: k.index, header: k.header, cls: k.cls, shape };
      const values: string[] = [];
      for (const v of khac) {
        if (lo(v)) shape.withheld++;
        else if (values.length < MAX_PROFILE_VALUES) values.push(v);
      }
      return { index: k.index, header: k.header, cls: k.cls, shape, values };
    }),
  };
}
