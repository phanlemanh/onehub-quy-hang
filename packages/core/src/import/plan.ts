/**
 * Kế hoạch nhập (Kiến trúc «Nhập dữ liệu» §4) — kế hoạch là DỮ LIỆU, không phải mã: ai lập (bộ ghép tất định ở đây, tác tử
 * hàng 68, người ở màn xem trước) cũng ra cùng khuôn, và `validatePlan` từ chối khoá lạ ở mọi cấp như khuôn sự kiện của
 * ADR-0008. `planFromDictionary` là chế độ nền không AI: từ điển tiêu đề → dò theo giá trị → giữ làm ghi chú.
 */
import { classifyColumns, readableShare, type ColumnClassification } from "./classify";
import { detectPersonal } from "./detect";
import { FIELD_CLASS, FIELD_LABEL, isStandardField, type StandardField } from "./fields";
import type { Table } from "./grid";
import { lookupHeader, priceUnitOfHeader, type CompanyHeader } from "./headers";
import {
  direction,
  feeCondition,
  FIELD_TRANSFORM,
  inferDateOrder,
  phone,
  status,
  TRANSFORM_NAMES,
  TRANSFORM_PARAMS,
  unitCode,
  type Cell,
  type Transform,
} from "./transforms";

export type PlanTarget = StandardField | `custom:${string}` | "keep_as_note" | "ignore_with_reason";
export type Confidence = "high" | "medium" | "low";
export type PlanColumn = {
  column: string;
  target: PlanTarget;
  transform?: Transform;
  valueMap?: Record<string, string>;
  confidence: Confidence;
  reason: string;
};
export type ImportPlan = { headerRow: number | [number, number]; columns: PlanColumn[]; questions: string[] };
export type PlanError = { path: string; reason: string };

const CONFIDENCES: readonly Confidence[] = ["high", "medium", "low"];
const KHOA_GOC = ["headerRow", "columns", "questions"];
const KHOA_COT = ["column", "target", "transform", "valueMap", "confidence", "reason"];
const KHOA_PHEP = ["name", "params"];

const laDoiTuong = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const khoaLa = (o: Record<string, unknown>, cho: readonly string[], path: string, out: PlanError[]) => {
  for (const k of Object.keys(o)) if (!cho.includes(k)) out.push({ path: `${path}${path ? "." : ""}${k}`, reason: "khoá lạ" });
};

/** Cột là số thứ tự 1…n (bỏ ô trống) — cột duy nhất được bỏ có lý do khi có dữ liệu (luật 11 «không bỏ mất cột nào»). */
export function isRowIndexColumn(cells: readonly Cell[]): boolean {
  const so = cells.filter((c) => c !== null && String(c).trim() !== "").map((c) => Number(String(c).trim()));
  return so.length > 0 && so.every((n, i) => n === i + 1);
}

/** Phép có tham số bắt buộc: đơn vị giá, thứ tự ngày. */
const CAN_THAM_SO: readonly string[] = ["price", "date"];

function kiemPhep(t: unknown, path: string, out: PlanError[]) {
  if (!laDoiTuong(t)) return void out.push({ path, reason: "cần một đối tượng" });
  khoaLa(t, KHOA_PHEP, path, out);
  if (typeof t.name !== "string" || !(TRANSFORM_NAMES as readonly string[]).includes(t.name)) return void out.push({ path: `${path}.name`, reason: "phép ngoài thực đơn" });
  const cho = TRANSFORM_PARAMS[t.name as Transform["name"]];
  const params = t.params ?? {};
  if (!laDoiTuong(params)) return void out.push({ path: `${path}.params`, reason: "cần một đối tượng" });
  for (const [k, v] of Object.entries(params)) {
    // Tra bằng `Object.hasOwn`: khoá trùng tên thuộc tính hệ thống («toString», «constructor») vẫn là khoá lạ, không làm sập.
    const nhan = Object.hasOwn(cho, k) ? cho[k] : undefined;
    if (!nhan) out.push({ path: `${path}.params.${k}`, reason: "khoá lạ" });
    else if (typeof v !== "string" || !nhan.includes(v)) out.push({ path: `${path}.params.${k}`, reason: `cần một trong: ${nhan.join(", ")}` });
  }
  if (CAN_THAM_SO.includes(t.name)) for (const k of Object.keys(cho)) if (!Object.hasOwn(params, k)) out.push({ path: `${path}.params.${k}`, reason: "thiếu" });
}

/** Tên đích để nêu trong lỗi: nhãn của trường chuẩn, hay chính chuỗi đích. */
const tenDich = (t: string) => (isStandardField(t) ? `${FIELD_LABEL[t]} (${t})` : t);

/** Kiểm khuôn kế hoạch trên đúng bảng nó định áp. Rỗng là hợp lệ. */
export function validatePlan(plan: unknown, table: Table, opts: DictionaryPlanOptions = {}): PlanError[] {
  const out: PlanError[] = [];
  // Lớp của cột theo bộ phân loại (bất biến 2): cột lớp nguồn chỉ vào trường lớp nguồn hay bỏ có lý do (luật 38, Ngoài-4).
  const lop: readonly ColumnClassification[] = classifyColumns(table, opts.companyHeaders);
  if (!laDoiTuong(plan)) return [{ path: "", reason: "cần một đối tượng" }];
  khoaLa(plan, KHOA_GOC, "", out);
  const hr = plan.headerRow;
  const hrOk = (Number.isInteger(hr) && (hr as number) >= 0) || (Array.isArray(hr) && hr.length === 2 && hr.every((x) => Number.isInteger(x) && x >= 0) && hr[1] === hr[0] + 1);
  if (!hrOk) out.push({ path: "headerRow", reason: "cần số dòng, hay [n, n+1] khi hai tầng" });
  if (!Array.isArray(plan.questions) || !plan.questions.every((q) => typeof q === "string")) out.push({ path: "questions", reason: "cần danh sách chữ" });
  if (!Array.isArray(plan.columns)) return [...out, { path: "columns", reason: "cần danh sách" }];
  if (plan.columns.length !== table.headers.length) out.push({ path: "columns", reason: `cần đúng ${table.headers.length} cột — không bỏ mất cột nào` });
  plan.columns.forEach((c: unknown, i: number) => {
    const p = `columns[${i}]`;
    if (!laDoiTuong(c)) return void out.push({ path: p, reason: "cần một đối tượng" });
    khoaLa(c, KHOA_COT, p, out);
    if (c.column !== table.headers[i]) out.push({ path: `${p}.column`, reason: `cần tiêu đề «${table.headers[i] ?? ""}»` });
    const t = c.target;
    const tOk = isStandardField(t) || t === "keep_as_note" || t === "ignore_with_reason" || (typeof t === "string" && /^custom:\S.{0,59}$/.test(t));
    if (!tOk) out.push({ path: `${p}.target`, reason: "đích lạ" });
    const laNguon = lop[i]?.cls === "source";
    if (t === "ignore_with_reason" && !laNguon && !isRowIndexColumn(table.rows.map((r) => r.cells[i] ?? null)) && table.rows.some((r) => r.cells[i] !== null))
      out.push({ path: `${p}.target`, reason: "cột có dữ liệu không được bỏ — giữ làm ghi chú hay trường riêng" });
    if (laNguon && tOk && t !== "ignore_with_reason" && !(isStandardField(t) && FIELD_CLASS[t] === "source"))
      out.push({ path: `${p}.target`, reason: `cột lớp nguồn «${table.headers[i] ?? ""}» không được ghép vào ${tenDich(t as string)} — chỉ vào trường lớp nguồn hay bỏ có lý do` });
    // Khoá hay giá trị của bảng quy đổi mang dáng số điện thoại, email, số giấy tờ thì không vào kế hoạch đã lưu, dù cột
    // nào — lúc mở lần nhập chưa có dòng để bộ phân loại nhận ra cột lớp nguồn theo giá trị (S4 vòng 1, AC-7).
    if (laDoiTuong(c.valueMap) && Object.entries(c.valueMap).some(([k, v]) => detectPersonal(k) !== null || (typeof v === "string" && detectPersonal(v) !== null)))
      out.push({ path: `${p}.valueMap`, reason: `bảng quy đổi của cột «${table.headers[i] ?? ""}» có số điện thoại, email hay số giấy tờ — không lưu vào kế hoạch` });
    const vaoNguon = laNguon || (isStandardField(t) && FIELD_CLASS[t] === "source");
    if (vaoNguon && c.valueMap !== undefined)
      out.push({ path: `${p}.valueMap`, reason: `cột lớp nguồn «${table.headers[i] ?? ""}» không mang bảng quy đổi — giá trị nguyên văn sẽ nằm trong kế hoạch đã lưu` });
    if (c.transform !== undefined) kiemPhep(c.transform, `${p}.transform`, out);
    if (c.valueMap !== undefined && (!laDoiTuong(c.valueMap) || !Object.values(c.valueMap).every((v) => typeof v === "string")))
      out.push({ path: `${p}.valueMap`, reason: "cần ánh xạ chữ → chữ" });
    if (!CONFIDENCES.includes(c.confidence as Confidence)) out.push({ path: `${p}.confidence`, reason: "cần high, medium hay low" });
    if (typeof c.reason !== "string" || !c.reason.trim()) out.push({ path: `${p}.reason`, reason: "cần một câu lý do" });
  });
  return out;
}

/** Phép cho một trường trên đúng cột: đơn vị giá từ tiêu đề hay độ lớn cả cột; thứ tự ngày theo cả cột. */
function phepCho(field: StandardField, header: string, cells: readonly Cell[]): Transform {
  if (field === "listPrice" || field === "floorPrice") {
    const dv = priceUnitOfHeader(header);
    if (dv) return { name: "price", params: { unit: dv } };
    const so = cells.filter((c): c is number => typeof c === "number");
    if (so.length && so.every((n) => n < 1000)) return { name: "price", params: { unit: "ty" } };
    return { name: "price", params: { unit: "auto" } };
  }
  if (field === "confirmedDate") return { name: "date", params: { order: inferDateOrder(cells) } };
  return FIELD_TRANSFORM[field];
}

export type DictionaryPlanOptions = { companyHeaders?: readonly CompanyHeader[] };

/** Ghép tất định — chế độ nền không AI (ADR-0011 quyết định 1). */
export function planFromDictionary(table: Table, opts: DictionaryPlanOptions = {}): ImportPlan {
  const daDung = new Map<StandardField, string>();
  const columns = table.headers.map((header, i): PlanColumn => {
    const cells = table.rows.map((r) => r.cells[i] ?? null);
    let field: StandardField | null = null;
    let confidence: Confidence = "high";
    let reason = "";
    const dich = lookupHeader(header, opts.companyHeaders);
    if (dich === "row_index" && isRowIndexColumn(cells)) return { column: header, target: "ignore_with_reason", confidence: "high", reason: "số thứ tự dòng của file" };
    if (dich && dich !== "row_index") [field, reason] = [dich, `tiêu đề «${header}» khớp từ điển`];
    else {
      const doTheo: [StandardField, (c: Cell) => { mark: string }][] = [
        ["unitNumber", (c) => unitCode(c)],
        ["ownerPhone", (c) => phone(c)],
        ["standardStatus", (c) => status(c)],
        ["feeInclusion", (c) => feeCondition(c)],
        ["directionFaces", (c) => direction(c)],
      ];
      for (const [f, doc] of doTheo) {
        if (readableShare(cells, doc) >= 0.8) {
          [field, confidence, reason] = [f, "medium", `giá trị của cột đọc được là ${f}`];
          break;
        }
      }
      if (!field && isRowIndexColumn(cells)) return { column: header, target: "ignore_with_reason", confidence: "medium", reason: "cột là số thứ tự 1…n" };
    }
    if (!field) return { column: header, target: "keep_as_note", confidence: "low", reason: `chưa biết cột «${header}» là gì — giữ làm ghi chú nội bộ, cần người chọn` };
    const truoc = daDung.get(field);
    if (truoc !== undefined) return { column: header, target: "keep_as_note", confidence: "low", reason: `trùng đích với cột «${truoc}» — giữ làm ghi chú, cần người chọn` };
    daDung.set(field, header);
    return { column: header, target: field, transform: phepCho(field, header, cells), confidence, reason };
  });
  const questions = columns.filter((c) => c.confidence === "low").map((c) => `Cột «${c.column}» là gì?`);
  return { headerRow: table.headerRows === 2 ? [table.headerRow, table.headerRow + 1] : table.headerRow, columns, questions };
}

/** Lớp dữ liệu của đích một cột (ghi chú nội bộ và trường riêng ở trong công ty). */
export function targetClass(t: PlanTarget) {
  return isStandardField(t) ? FIELD_CLASS[t] : t.startsWith("custom:") ? "custom_field" : "company_internal";
}

