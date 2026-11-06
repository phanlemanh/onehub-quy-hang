/**
 * Kiểm đề xuất của Claude rồi gộp vào kế hoạch (hàng 68, AC-6). Khuôn đầu ra ép hình; đây kiểm nghĩa: chỉ cột đã gửi là
 * chưa ghép, đích thuộc trường chuẩn hay «Giữ làm ghi chú», phép thuộc thực đơn đóng, quy đổi chỉ với giá trị đã gửi, lý do
 * không rỗng, không trùng đích. Sai ở một cột chỉ bỏ cột ấy (cột ở lại «Giữ làm ghi chú», độ tin thấp, có câu hỏi), đề xuất
 * đúng vẫn được giữ. Kế hoạch gộp xong vẫn đi qua `validatePlan` như mọi kế hoạch.
 */
import { FIELD_CLASS, isStandardField, type StandardField } from "../fields";
import type { Table } from "../grid";
import { phepCho, type ImportPlan, type PlanColumn, type PlanTarget } from "../plan";
import { TRANSFORM_NAMES, TRANSFORM_PARAMS, type Transform, type TransformName } from "../transforms";
import { cotChuaGhep, type GoiDeXuat } from "./goi";

export const LY_DO_MAY_DE_XUAT = "Máy đề xuất";

export type DeXuatCot = { cot: number; target: PlanTarget; transform?: Transform; valueMap?: Record<string, string>; lyDo: string };
export type LoiDeXuat = { cot: number | null; lyDo: string };
export type KetQuaDeXuat = { deXuat: DeXuatCot[]; loi: LoiDeXuat[] };

const KHOA_GOC = ["de_xuat"];
const KHOA_MUC = ["cot", "dich", "phep", "quy_doi", "ly_do"];
const KHOA_PHEP = ["name", "unit", "order", "kind"];
const CAN_THAM_SO: Partial<Record<TransformName, string>> = { price: "unit", date: "order" };
const laDoiTuong = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

function docPhep(p: unknown): Transform | string {
  if (!laDoiTuong(p)) return "phép cần một đối tượng";
  const la = Object.keys(p).find((k) => !KHOA_PHEP.includes(k));
  if (la) return `phép có khoá lạ «${la}»`;
  if (typeof p.name !== "string" || !(TRANSFORM_NAMES as readonly string[]).includes(p.name)) return "phép ngoài thực đơn";
  const name = p.name as TransformName;
  const cho = TRANSFORM_PARAMS[name];
  const params: Record<string, string> = {};
  for (const k of ["unit", "order", "kind"]) {
    if (p[k] === undefined) continue;
    if (!cho[k] || !cho[k]!.includes(p[k] as string)) return `tham số «${k}» không hợp với phép ${name}`;
    params[k] = p[k] as string;
  }
  const can = CAN_THAM_SO[name];
  if (can && params[can] === undefined) return `phép ${name} cần tham số «${can}»`;
  return (Object.keys(params).length ? { name, params } : { name }) as Transform;
}

/** Đọc và kiểm đầu ra của Claude so với đúng gói đã gửi. Đầu ra sai khuôn ở gốc → không đề xuất nào, một lỗi `cot: null`. */
export function kiemDeXuat(goi: GoiDeXuat, v: unknown): KetQuaDeXuat {
  if (!laDoiTuong(v) || Object.keys(v).some((k) => !KHOA_GOC.includes(k)) || !Array.isArray(v.de_xuat))
    return { deXuat: [], loi: [{ cot: null, lyDo: "đầu ra sai khuôn" }] };
  const theoCot = new Map(goi.cot.map((c) => [c.cot, c]));
  const chuaGhep = new Set(cotChuaGhep(goi));
  const daDung = new Map<StandardField, number>();
  for (const c of goi.cot) if (isStandardField(c.dich)) daDung.set(c.dich, c.cot);
  const deXuat: DeXuatCot[] = [];
  const loi: LoiDeXuat[] = [];
  const daDeXuat = new Set<number>();
  for (const m of v.de_xuat) {
    if (!laDoiTuong(m)) {
      loi.push({ cot: null, lyDo: "một đề xuất không phải đối tượng" });
      continue;
    }
    const cot = Number.isInteger(m.cot) ? (m.cot as number) : null;
    const bo = (lyDo: string) => loi.push({ cot, lyDo });
    const la = Object.keys(m).find((k) => !KHOA_MUC.includes(k));
    if (la) { bo(`khoá lạ «${la}»`); continue; }
    if (cot === null || !theoCot.has(cot)) { bo("cột không có trong gói"); continue; }
    if (!chuaGhep.has(cot)) { bo("cột đã ghép — không được đề xuất lại"); continue; }
    if (daDeXuat.has(cot)) { bo("cột được đề xuất hai lần"); continue; }
    const goc = theoCot.get(cot)!;
    const target = m.dich;
    if (!(isStandardField(target) || target === "keep_as_note")) { bo("đích ngoài trường chuẩn"); continue; }
    if (typeof m.ly_do !== "string" || !m.ly_do.trim()) { bo("thiếu lý do"); continue; }
    if (goc.lop === "source" && !(isStandardField(target) && FIELD_CLASS[target] === "source")) { bo("cột lớp nguồn chỉ vào trường lớp nguồn"); continue; }
    let transform: Transform | undefined;
    if (m.phep !== undefined) {
      const p = docPhep(m.phep);
      if (typeof p === "string") { bo(p); continue; }
      transform = p;
    }
    let valueMap: Record<string, string> | undefined;
    if (m.quy_doi !== undefined) {
      if (!goc.giaTri) { bo("quy đổi cho cột không gửi giá trị"); continue; }
      if (isStandardField(target) && FIELD_CLASS[target] === "source") { bo("cột lớp nguồn không mang quy đổi"); continue; }
      const gui = new Set(goc.giaTri);
      const cap = Array.isArray(m.quy_doi) ? m.quy_doi : null;
      if (!cap || !cap.every((x) => laDoiTuong(x) && Object.keys(x).every((k) => k === "tu" || k === "den") && typeof x.tu === "string" && typeof x.den === "string")) { bo("quy đổi sai khuôn"); continue; }
      const ngoai = cap.find((x) => !gui.has(x.tu as string));
      if (ngoai) { bo("quy đổi với giá trị không có trong gói"); continue; }
      valueMap = Object.fromEntries(cap.map((x) => [x.tu as string, x.den as string]));
    }
    if (isStandardField(target)) {
      const truoc = daDung.get(target);
      if (truoc !== undefined) { bo(`trùng đích với cột «${theoCot.get(truoc)!.tieuDe}»`); continue; }
      daDung.set(target, cot);
    }
    daDeXuat.add(cot);
    deXuat.push({ cot, target, ...(transform && { transform }), ...(valueMap && { valueMap }), lyDo: m.ly_do.trim() });
  }
  return { deXuat, loi };
}

/** Gộp đề xuất đã kiểm vào kế hoạch: cột đề xuất mang lý do sau tiền tố «Máy đề xuất», độ tin trung bình; phép thiếu thì
 *  lõi chọn như khi người đổi đích (`phepCho`). Cột bị bỏ giữ nguyên «Giữ làm ghi chú», kèm câu hỏi nêu vì sao. */
export function gopDeXuat(table: Table, plan: ImportPlan, kq: KetQuaDeXuat): ImportPlan {
  const columns: PlanColumn[] = plan.columns.map((c) => ({ ...c }));
  const daGop = new Set<number>();
  for (const d of kq.deXuat) {
    const header = table.headers[d.cot] ?? "";
    const cells = table.rows.map((r) => r.cells[d.cot] ?? null);
    const transform = d.transform ?? (isStandardField(d.target) ? phepCho(d.target, header, cells) : undefined);
    columns[d.cot] = {
      column: header,
      target: d.target,
      ...(transform && { transform }),
      ...(d.valueMap && { valueMap: d.valueMap }),
      confidence: "medium",
      reason: `${LY_DO_MAY_DE_XUAT}: ${d.lyDo}`,
    };
    daGop.add(d.cot);
  }
  const boHoi = new Set([...daGop].map((i) => `Cột «${table.headers[i] ?? ""}» là gì?`));
  const them = kq.loi
    .filter((l): l is LoiDeXuat & { cot: number } => l.cot !== null && !daGop.has(l.cot) && columns[l.cot]?.confidence === "low")
    .map((l) => `Cột «${table.headers[l.cot] ?? ""}»: máy không đề xuất được (${l.lyDo})`);
  return { ...plan, columns, questions: [...plan.questions.filter((q) => !boHoi.has(q)), ...them] };
}
