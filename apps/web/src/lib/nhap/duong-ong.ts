import {
  applyPlan,
  buildProfile,
  classifyColumns,
  FIELD_LABEL,
  isStandardField,
  apMau,
  LY_DO_THEO_MAU,
  phepCho,
  planFromDictionary,
  readTable,
  validatePlan,
  type AppliedRow,
  type ColumnClass,
  type ColumnProfile,
  type CotMau,
  type Grid,
  type ImportContext,
  type ImportPlan,
  type Mark,
  type PlanError,
  type PlanTarget,
  type Table,
} from "@quy-hang/core/import";

/**
 * Đường ống của màn Nhập Excel (hàng man-nhap-excel): lưới → bảng → lớp cột → kế hoạch từ điển → áp kế hoạch, toàn bằng
 * mã của lõi `@quy-hang/core/import` — cùng mã máy chủ chạy lại khi ghi (hàng 65a). Màn không có luật riêng (AC-2).
 */

export type DemDau = Record<Mark, number>;

export type Ong = {
  table: Table;
  lop: { index: number; header: string; cls: ColumnClass }[];
  profile: ColumnProfile[];
  plan: ImportPlan;
  loi: PlanError[];
  dong: AppliedRow[];
  dem: DemDau;
  /** Ngữ cảnh đã áp (hôm nay, danh mục) — để tính lại đúng như lần áp. */
  ctx: ImportContext;
};

export function demDau(dong: readonly AppliedRow[]): DemDau {
  const d: DemDau = { keep: 0, fixed: 0, needs_person: 0, blocked: 0 };
  for (const r of dong) for (const c of r.cells) d[c.mark]++;
  return d;
}

/** Chạy trọn đường ống trên một lưới. Có mẫu của sàn (hàng 67) thì cột đã nhớ ghép theo mẫu, cột chưa gặp theo từ điển. */
export function chayOng(grid: Grid, ctx: ImportContext, mau: readonly CotMau[] = []): Ong {
  const table = readTable(grid);
  const lop = classifyColumns(table);
  const profile = buildProfile(table, lop).columns;
  const plan = mau.length ? apMau(table, mau, ctx).plan : planFromDictionary(table);
  return apLai(table, lop, profile, plan, ctx);
}

/** Cột đang ghép theo mẫu đã nhớ (dải báo «Ghép theo mẫu đã nhớ — N/M cột», nhãn «theo mẫu»). */
export const cotTheoMau = (ong: Ong): number[] =>
  ong.plan.columns.map((c, i) => (c.reason.startsWith(LY_DO_THEO_MAU) ? i : -1)).filter((i) => i >= 0);

/** Áp lại kế hoạch (sau khi người đổi đích cột hay sửa ô). Lỗi khuôn của `validatePlan` khoá bước ghép (máy chủ cũng từ
 *  chối kế hoạch ấy), nhưng dấu vẫn tính để màn và lõi ra cùng số trên mọi tệp. */
export function apLai(table: Table, lop: Ong["lop"], profile: ColumnProfile[], plan: ImportPlan, ctx: ImportContext): Ong {
  const loi = validatePlan(plan, table);
  const dong = applyPlan(table, plan, ctx).rows;
  return { table, lop, profile, plan, loi, dong, dem: demDau(dong), ctx };
}

/** Cột mới của kế hoạch khi người đổi đích: phép biến đổi do lõi chọn cho đúng trường và đúng cột. */
export function doiDich(ong: Ong, cot: number, dich: PlanTarget, ctx: ImportContext): Ong {
  const header = ong.table.headers[cot] ?? "";
  const cells = ong.table.rows.map((r) => r.cells[cot] ?? null);
  const columns = ong.plan.columns.map((c, i) => {
    if (i !== cot) return c;
    const coPhep = isStandardField(dich) ? { transform: phepCho(dich, header, cells) } : {};
    return { column: c.column, target: dich, ...coPhep, confidence: "high" as const, reason: "người chọn ở bước ghép cột" };
  });
  return apLai(ong.table, ong.lop, ong.profile, { ...ong.plan, columns }, ctx);
}

const LOP_NHAN: Record<ColumnClass, string> = {
  source: "Nguồn — không rời sàn",
  person_name: "Tên người",
  free_text: "Chữ tự do",
  catalog: "Danh mục",
  shareable_listing: "Hàng chia sẻ được",
  unknown: "Chưa rõ",
};
export const nhanLop = (c: ColumnClass) => LOP_NHAN[c];

/** Ô mẫu của cột ở bước ghép: cột mở hiện một giá trị; cột kín (nguồn, tên người, chữ tự do) chỉ hiện hình dạng. */
export function mauCot(p: ColumnProfile): string {
  if (p.values?.length) return p.values[0]!;
  const s = p.shape;
  if (s.charClass === "empty") return "trống";
  const loai = s.charClass === "digits" ? "chữ số" : s.charClass === "letters" ? "chữ" : "chữ và số";
  const dai = s.minLength === s.maxLength ? `${s.minLength}` : `${s.minLength}–${s.maxLength}`;
  return `${loai} · ${dai} ký tự`;
}

/** Nhãn đích: trường chuẩn theo `FIELD_LABEL` của lõi, cộng hai đích ngoài trường. */
export function nhanDich(t: PlanTarget): string {
  if (isStandardField(t)) return FIELD_LABEL[t];
  if (t === "keep_as_note") return "Giữ làm ghi chú";
  if (t === "ignore_with_reason") return "Bỏ cột";
  return `Trường riêng: ${t.slice("custom:".length)}`;
}

/** Lỗi kế hoạch theo cột (đường `columns[i]...`), để hiện dưới đúng cột. */
export function loiTheoCot(loi: readonly PlanError[]): Map<number, string> {
  const m = new Map<number, string>();
  for (const e of loi) {
    const k = /^columns\[(\d+)\]/.exec(e.path);
    if (k && !m.has(Number(k[1]))) m.set(Number(k[1]), e.reason);
  }
  return m;
}

/** Bước ghép cho Tiếp khi kế hoạch không còn lỗi. */
export const coTheTiepGhep = (ong: Ong) => ong.loi.length === 0;
