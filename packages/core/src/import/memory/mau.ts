/**
 * Bộ nhớ mẫu file của sàn (hàng 67, ADR-0011 quyết định 6). Mẫu = kế hoạch của các lần nhập đã ghi: mỗi tiêu đề đã gặp
 * nhớ đích, phép biến đổi, bảng quy đổi của lần ghi mới nhất. Khớp theo từng cột — cột chưa gặp đi từ điển. Bộ nhớ không
 * bao giờ giữ giá trị của cột nguồn hay cột tên người: bảng quy đổi chỉ được nhớ trên trường chuẩn không thuộc lớp nguồn.
 */
import { applyPlan } from "../apply";
import { classifyColumns, type ColumnClass } from "../classify";
import { FIELD_CLASS, isStandardField, type StandardField } from "../fields";
import type { Table } from "../grid";
import { headerKey, priceUnitOfHeader } from "../headers";
import { planFromDictionary, validatePlan, type ImportPlan, type PlanColumn, type PlanTarget } from "../plan";
import type { ImportContext, Transform } from "../transforms";

/** Một cột đã nhớ — đúng các khoá này, không ô, không dòng, không tên tệp. */
export type CotMau = {
  headerKey: string;
  target: PlanTarget;
  transform?: Transform;
  valueMap?: Record<string, string>;
  importId: string;
  at: string;
};

/** Lý do của cột áp theo mẫu mở đầu bằng chữ này — màn và lệnh đo đọc nó. */
export const LY_DO_THEO_MAU = "theo mẫu";
export const LY_DO_NGUOI_CHON = "người chọn ở bước ghép cột";

/** Khoá nhớ của một tiêu đề: khoá của lõi, thêm đơn vị giá khi tiêu đề có («Giá (tỷ)» khác «Giá (triệu)»). */
export function khoaMau(header: string): string {
  const dv = priceUnitOfHeader(header);
  return dv ? `${headerKey(header)}:${dv}` : headerKey(header);
}

/** Lớp cột mà sửa ô của người được học thành cách gọi của cột (ADR-0011: không nguồn, không tên người). */
export const LOP_HOC_DUOC: readonly ColumnClass[] = ["catalog", "shareable_listing"];

/** Trường có danh sách giá trị đóng — chỉ ở đây một chữ của sàn là «cách gọi» của một giá trị chuẩn. Giá, diện tích,
 *  tầng… là số của từng căn: sửa một ô không được lan sang ô cùng chữ (ô «liên hệ» của căn khác không cùng giá). */
export const TRUONG_CACH_GOI: readonly StandardField[] = ["standardStatus", "feeInclusion", "directionFaces", "buildingName", "subdivisionName"];

/** Cột học được cách gọi khi người sửa ô: đúng lớp và đúng trường giá trị đóng. */
export const hocCachGoi = (cls: ColumnClass | undefined, target: PlanTarget): boolean =>
  cls !== undefined && LOP_HOC_DUOC.includes(cls) && isStandardField(target) && TRUONG_CACH_GOI.includes(target);

/** Bảng quy đổi được nhớ chỉ khi đích là trường giá trị đóng (cùng luật với việc học ở màn): không nguồn, không tên người
 *  (Đầu chủ), không số của từng căn — bộ nhớ không giữ giá trị nào ngoài cách gọi của danh sách đóng. */
function nhoBangQuyDoi(target: PlanTarget): boolean {
  return isStandardField(target) && FIELD_CLASS[target] !== "source" && TRUONG_CACH_GOI.includes(target);
}

/** Rút mẫu từ một kế hoạch đã ghi. `headers` là tiêu đề của lần nhập (bảng `imports.header_row`), cùng thứ tự với cột. */
export function taoMau(plan: ImportPlan, headers: readonly string[], meta: { importId: string; at: string }): CotMau[] {
  const out: CotMau[] = [];
  const daCo = new Set<string>();
  plan.columns.forEach((c, i) => {
    const k = khoaMau(headers[i] ?? c.column);
    if (!k || daCo.has(k)) return;
    daCo.add(k);
    const cot: CotMau = { headerKey: k, target: c.target, importId: meta.importId, at: meta.at };
    if (c.transform !== undefined) cot.transform = c.transform;
    if (c.valueMap !== undefined && nhoBangQuyDoi(c.target) && Object.keys(c.valueMap).length) cot.valueMap = { ...c.valueMap };
    out.push(cot);
  });
  return out;
}

/** Gộp nhiều mẫu: mỗi khoá giữ cột của lần ghi mới nhất (so `at`), không phụ thuộc thứ tự truyền vào. */
export function gopMau(mau: readonly CotMau[]): Map<string, CotMau> {
  const m = new Map<string, CotMau>();
  for (const c of mau) {
    const cu = m.get(c.headerKey);
    if (!cu || c.at > cu.at || (c.at === cu.at && c.importId > cu.importId)) m.set(c.headerKey, c);
  }
  return m;
}

const ngay = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

/** Số ô có giá trị và số ô kế hoạch không đọc được ở một cột (cần người hay chặn). */
function oHong(table: Table, plan: ImportPlan, ctx: ImportContext, i: number): { hong: number; co: number } {
  const o = applyPlan(table, plan, ctx).rows.map((r) => r.cells[i]!).filter((c) => c.raw !== null);
  return { hong: o.filter((c) => c.mark === "needs_person" || c.mark === "blocked").length, co: o.length };
}

export type KetQuaApMau = { plan: ImportPlan; theoMau: number[]; veTuDien: { cot: number; lyDo: string }[] };

/**
 * Áp mẫu lên một bảng: cột có khoá trong bộ nhớ lấy đích, phép biến đổi, bảng quy đổi đã nhớ; cột chưa gặp đi từ điển.
 * Cột theo mẫu mà kế hoạch không hợp lệ trên bảng này (`validatePlan`), mà đưa cột không phải nguồn vào trường nguồn, hay
 * đọc ra nhiều ô hỏng hơn từ điển — về từ điển kèm lý do. Kế hoạch trả về luôn qua `validatePlan` như kế hoạch từ điển.
 */
/** Lý do của cột về «chưa rõ» vì trùng đích với một cột theo mẫu. */
export const LY_DO_TRUNG_MAU = "trùng đích với cột theo mẫu";

/** Lớp tạm của cột mà mẫu được đưa vào trường lớp nguồn (chiều che thêm). */
export const LOP_VAO_NGUON: readonly ColumnClass[] = ["source", "person_name", "unknown"];

export function apMau(table: Table, mau: readonly CotMau[], ctx: ImportContext, tuDien: ImportPlan = planFromDictionary(table)): KetQuaApMau {
  const nho = gopMau(mau);
  const lop = classifyColumns(table);
  const columns: PlanColumn[] = tuDien.columns.map((c, i) => {
    const m = nho.get(khoaMau(table.headers[i] ?? ""));
    if (!m) return c;
    const cot: PlanColumn = { column: c.column, target: m.target, confidence: "high", reason: `${LY_DO_THEO_MAU} lần nhập ${ngay(m.at)}` };
    if (m.transform !== undefined) cot.transform = m.transform;
    if (m.valueMap !== undefined) cot.valueMap = { ...m.valueMap };
    return cot;
  });
  const veTuDien: KetQuaApMau["veTuDien"] = [];
  const ve = (i: number, lyDo: string) => {
    const goc = tuDien.columns[i]!;
    columns[i] = { ...goc, reason: `${goc.reason}; mẫu không còn hợp lệ: ${lyDo}` };
    veTuDien.push({ cot: i, lyDo });
  };
  const theo = () => columns.map((c, i) => (c.reason.startsWith(LY_DO_THEO_MAU) ? i : -1)).filter((i) => i >= 0);
  for (const i of theo()) {
    const t = columns[i]!.target;
    // Mẫu đưa cột vào trường nguồn là chiều che thêm: nhận khi cột trông như nguồn, tên người hay chưa rõ (cột tên chủ nhà
    // tiêu đề lạ mà bộ phân loại không nhận — hàng 68, giám sát duyệt G-0511-6); vẫn từ chối khi cột rõ là danh mục, hàng
    // chia sẻ được hay chữ tự do — mẫu ấy không hợp với dữ liệu của tệp này.
    if (isStandardField(t) && FIELD_CLASS[t] === "source" && !LOP_VAO_NGUON.includes(lop[i]?.cls as ColumnClass))
      ve(i, `cột «${table.headers[i] ?? ""}» không mang dữ liệu nguồn mà mẫu đưa vào ${t}`);
  }
  for (let vong = 0; vong < table.headers.length; vong++) {
    const plan = { ...tuDien, columns, questions: tuDien.questions };
    const loi = validatePlan(plan, table).map((e) => ({ e, i: Number(/^columns\[(\d+)\]/.exec(e.path)?.[1] ?? -1) }));
    const sai = loi.find((x) => x.i >= 0 && columns[x.i]!.reason.startsWith(LY_DO_THEO_MAU));
    if (!sai) break;
    ve(sai.i, sai.e.reason);
  }
  for (const i of theo()) {
    const voiMau = { ...tuDien, columns };
    const m = oHong(table, voiMau, ctx, i);
    // Mẫu đọc hỏng nhiều ô hơn từ điển, hay hỏng quá nửa số ô có giá trị: mẫu không hợp với dữ liệu của tệp này.
    if (m.hong > oHong(table, tuDien, ctx, i).hong || m.hong * 2 > m.co) ve(i, `phép đã nhớ đọc không được ${m.hong}/${m.co} ô của tệp này`);
  }
  // Trùng đích (Ngoài-4 hàng 67): cột theo mẫu giữ đích người đã chọn lần trước, bất kể thứ tự cột; cột theo mẫu thứ hai về
  // từ điển; cột nào còn trùng đích thì về «chưa rõ» kèm câu hỏi — cùng nếp cột trùng đích của `planFromDictionary`.
  const nhom = new Map<string, number[]>();
  columns.forEach((c, i) => isStandardField(c.target) && nhom.set(c.target, [...(nhom.get(c.target) ?? []), i]));
  for (const [dich, ds] of nhom) {
    const giu = ds.find((i) => columns[i]!.reason.startsWith(LY_DO_THEO_MAU));
    if (ds.length < 2 || giu === undefined) continue;
    const tenGiu = table.headers[giu] ?? "";
    for (const i of ds.filter((i) => i !== giu)) {
      if (columns[i]!.reason.startsWith(LY_DO_THEO_MAU)) ve(i, `trùng đích ${dich} với cột «${tenGiu}»`);
      if (columns[i]!.target === dich)
        columns[i] = { column: columns[i]!.column, target: "keep_as_note", confidence: "low", reason: `${LY_DO_TRUNG_MAU} «${tenGiu}» — giữ làm ghi chú, cần người chọn` };
    }
  }
  const hoi = (c: PlanColumn) => (c.reason.startsWith(LY_DO_TRUNG_MAU) ? `Cột «${c.column}» ${c.reason.split(" — ")[0]}` : `Cột «${c.column}» là gì?`);
  const plan: ImportPlan = { ...tuDien, columns, questions: columns.filter((c) => c.confidence === "low").map(hoi) };
  return { plan, theoMau: theo(), veTuDien };
}

/** Ba số đo của một kế hoạch đã lưu (AC-11): cột theo mẫu · cột người đổi đích · tổng cột. Chỉ đọc kế hoạch. */
export function doMau(plan: ImportPlan): { theoMau: number; nguoiDoi: number; tong: number } {
  return {
    theoMau: plan.columns.filter((c) => c.reason.startsWith(LY_DO_THEO_MAU)).length,
    nguoiDoi: plan.columns.filter((c) => c.reason.startsWith(LY_DO_NGUOI_CHON)).length,
    tong: plan.columns.length,
  };
}
