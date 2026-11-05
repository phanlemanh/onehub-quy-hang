import { randomUUID } from "node:crypto";
import { OPEN_STATUSES } from "@quy-hang/core/dedupe";
import {
  applyPlan,
  apSuaMau,
  dongDauMoiCan,
  khoaCan,
  kiemNgayXacNhan,
  LY_DO_DONG_NHAP,
  quyetDongNhap,
  taoMau,
  validatePlan,
  type AppliedRow,
  type Cell,
  type CotMauDaSua,
  type DongSuaMau,
  type ImportPlan,
  type ImportRowAction,
  type OpenListingFact,
  type PlanError,
  type StandardField,
  type Table,
} from "@quy-hang/core/import";
import type { CatalogData } from "@quy-hang/core";
import { canRead } from "@quy-hang/core/visibility";
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { ghiLead } from "../leads/store";
import { applyCommand, createListing, factsOf, loadEvents, viewerOf, type Refusal as RefusalHang } from "../listings/store";
import { assignAgent, isRefusal as laTuChoiChu, putOwner } from "../owners/store";
import type { KhoaSoChu } from "../owners/ma-hoa";

/**
 * Đường ghi lần nhập (hàng 65a, Kiến trúc «Nhập dữ liệu» §6). Máy chủ áp lại kế hoạch bằng lõi trên ô thô, gom dữ kiện, hỏi
 * `quyetDongNhap` của lõi, rồi đi ĐÚNG các cửa có sẵn: tạo hàng và lệnh hàng (`listings/store`), chủ nhà (`owners/store`),
 * phần ghi của lead (tin bổ sung). Không câu SQL nào vào `listings`/`listing_events` ở đây — bộ kiểm «một cửa» giữ. Xem thử
 * chạy cùng đường rồi lùi giao dịch (route), nên con số xem thử bằng con số ghi.
 */

export type Refusal = { error: ApiErrorEntry; details?: PlanError[] };
export const isRefusal = (r: unknown): r is Refusal => !!r && typeof r === "object" && "error" in r;

/** Cỡ một gói (§6). */
export const MAX_BATCH_ROWS = 200;
const VAI_NHAP = ["listing_agent", "team_lead"];

export type OpenImportInput = {
  fileName: string;
  fileHash: string;
  sheet?: string | null;
  fileKind: "xlsx" | "csv";
  headers: string[];
  headerRow: number | [number, number];
  plan: ImportPlan;
  /** Toà và mã căn của mọi dòng của file (lớp danh mục) — để xét trùng trên cả file, không theo gói. */
  units: { row: number; buildingName: string | null; unitNumber: string | null }[];
};
export type BatchRow = { row: number; cells: Cell[]; agentUserId?: string; skip?: boolean };
export type RowResult = { row: number; action: ImportRowAction; reason: string; listingId?: string };
export type Summary = Record<ImportRowAction, number>;
export type BatchResult = { importId: string; rows: RowResult[]; summary: Summary };

const bangTu = (headers: string[], rows: { source: number; cells: Cell[] }[]): Table => ({
  headerRow: 0,
  headerRows: 1,
  headers,
  rows: rows.map((r) => ({ source: r.source, cells: headers.map((_, i) => r.cells[i] ?? null) })),
  skipped: [],
});

const homNay = () => new Date().toISOString().slice(0, 10);

async function vaiNguoiGui(tx: pg.PoolClient): Promise<{ userId: string; roles: string[] }> {
  const { rows } = await tx.query<{ u: string; r: string[] | null }>(
    `select app.current_user_id() u, (select roles from company_members where company_id = app.current_company_id()
       and user_id = app.current_user_id()) r`,
  );
  return { userId: rows[0]!.u, roles: rows[0]!.r ?? [] };
}

export async function openImport(tx: pg.PoolClient, input: OpenImportInput): Promise<{ id: string; status: string } | Refusal> {
  const nguoi = await vaiNguoiGui(tx);
  if (!nguoi.roles.some((v) => VAI_NHAP.includes(v))) return { error: API_ERRORS.importRoleRequired };
  // Khuôn kế hoạch trên tiêu đề (chưa có dòng); mỗi gói kiểm lại trên chính các dòng của gói.
  const loi = validatePlan(input.plan, bangTu(input.headers, []));
  if (loi.length) return { error: API_ERRORS.importPlanInvalid, details: loi };
  const trung = dongDauMoiCan(input.units.map((u) => ({ row: u.row, key: khoaCan(u.buildingName, u.unitNumber) })));
  const id = randomUUID();
  await tx.query(
    `insert into imports (company_id, id, created_by, created_roles, file_name, file_hash, sheet, file_kind, header_row, plan, duplicate_rows)
     values (app.current_company_id(), $1, app.current_user_id(), $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      nguoi.roles,
      input.fileName,
      input.fileHash,
      input.sheet ?? null,
      input.fileKind,
      JSON.stringify(input.headerRow),
      JSON.stringify({ ...input.plan, headers: input.headers }),
      JSON.stringify(Object.fromEntries(trung)),
    ],
  );
  return { id, status: "planned" };
}

type LanNhap = { id: string; plan: ImportPlan & { headers: string[] }; duplicate_rows: Record<string, number>; created_by: string };

async function docLanNhap(tx: pg.PoolClient, id: string): Promise<LanNhap | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await tx.query<LanNhap>(
    "select id, plan, duplicate_rows, created_by from imports where company_id = app.current_company_id() and id = $1 and created_by = app.current_user_id()",
    [id],
  );
  return rows[0] ?? null;
}

/** Giá trị đã chuẩn hoá của một trường trên dòng (ô giữ nguyên hay máy sửa, hay giá trị suy ở `extra`). */
function giaTri(dong: AppliedRow, field: StandardField): string | number | null {
  const o = dong.cells.find((c) => c.target === field);
  if (o && (o.mark === "keep" || o.mark === "fixed")) return (o.value ?? null) as string | number | null;
  const e = dong.extra[field];
  return e === undefined ? null : (e as string | number | null);
}

const CHAN = ["blocked", "needs_person"];
const TRUONG_CHAN: StandardField[] = ["buildingName", "unitNumber", "listPrice"];

/** Hàng mở trên căn của dòng: id, phiên bản, đầu chủ giữ, người gửi đọc được không. */
async function hangMo(tx: pg.PoolClient, toa: string, ma: string | null) {
  if (!ma) return null;
  const { rows } = await tx.query<{ id: string; version: number }>(
    `select id, version from listings where company_id = app.current_company_id() and building_name = $1
       and app.unit_key(unit_number) = app.unit_key($2) and standard_status = any ($3) and not voided order by id limit 1`,
    [toa, ma, OPEN_STATUSES],
  );
  const h = rows[0];
  if (!h) return null;
  const nguoi = await vaiNguoiGui(tx);
  const facts = await factsOf(tx, h.id, await loadEvents(tx, h.id));
  return { ...h, agent: facts.listingAgentUserId ?? null, readable: canRead(nguoi, facts) };
}

const laTuChoi = (r: unknown): r is RefusalHang => !!r && typeof r === "object" && "error" in r;

/** Ghi một gói (hay xem thử — route lùi giao dịch). Gửi lại dòng đã ghi trả đúng kết quả cũ. */
/** Đầu chủ của sàn đang làm cho Trưởng nhóm chọn khi nhập hộ (hàng man-nhap-excel, Hỏi-2): chỉ vai nhập đọc được, chỉ mã
 *  người — tên đọc ở route qua bảng tài khoản. */
export async function dauChuCuaSan(tx: pg.PoolClient): Promise<string[] | Refusal> {
  const nguoi = await vaiNguoiGui(tx);
  if (!nguoi.roles.some((v) => VAI_NHAP.includes(v))) return { error: API_ERRORS.importRoleRequired };
  const { rows } = await tx.query<{ user_id: string }>(
    "select user_id from company_members where company_id = app.current_company_id() and 'listing_agent' = any (roles) order by user_id",
  );
  return rows.map((r) => r.user_id);
}

/** Mẫu file của sàn (hàng 67, ADR-0011 quyết định 6): rút từ kế hoạch của các lần nhập ĐÃ GHI, mỗi khoá tiêu đề giữ cột
 *  của lần mới nhất, rồi gộp sổ sửa của Quản trị sàn (hàng 50, `import_templates`) — mục mới nhất thắng, mốc của lần nhập
 *  là lúc mở. Lõi bỏ bảng quy đổi ở cột nguồn và cột không phải trường chuẩn — thân không mang ô nào của tệp. */
export async function mauCuaSan(tx: pg.PoolClient): Promise<CotMauDaSua[] | Refusal> {
  const nguoi = await vaiNguoiGui(tx);
  if (!nguoi.roles.some((v) => VAI_NHAP.includes(v))) return { error: API_ERRORS.importRoleRequired };
  return mauDaGop(tx);
}

/** Mẫu đã gộp sổ sửa — không kiểm vai (đường của màn nhập kiểm vai nhập, đường của màn Mẫu nhập kiểm quản trị). */
export async function mauDaGop(tx: pg.PoolClient): Promise<CotMauDaSua[]> {
  // Tiêu đề của lần nhập nằm trong kế hoạch đã lưu (`plan.headers`, xem openImport), cùng thứ tự với cột.
  const { rows } = await tx.query<{ id: string; plan: ImportPlan & { headers?: unknown }; created_at: Date }>(
    "select id, plan, created_at from imports where company_id = app.current_company_id() and status = 'committed' order by created_at desc limit 50",
  );
  const mau = rows.flatMap((r) => {
    const headers = Array.isArray(r.plan?.headers) ? r.plan.headers.map((h) => String(h ?? "")) : [];
    if (!Array.isArray(r.plan?.columns)) return [];
    return taoMau(r.plan, headers, { importId: r.id, at: r.created_at.toISOString() });
  });
  return apSuaMau(mau, await soSuaMau(tx));
}

/** Sổ sửa mẫu của sàn đang làm (luật theo dòng lọc theo sàn). */
export async function soSuaMau(tx: pg.PoolClient): Promise<DongSuaMau[]> {
  const { rows } = await tx.query<{
    id: string;
    header_key: string;
    action: "set" | "delete";
    target: string | null;
    transform: DongSuaMau["transform"] | null;
    value_map: Record<string, string> | null;
    edited_by: string;
    edited_at: Date;
  }>("select id, header_key, action, target, transform, value_map, edited_by, edited_at from import_templates where company_id = app.current_company_id()");
  return rows.map((r) => {
    const d: DongSuaMau = { id: r.id, headerKey: r.header_key, action: r.action, editedBy: r.edited_by, at: r.edited_at.toISOString() };
    if (r.target !== null) d.target = r.target as DongSuaMau["target"];
    if (r.transform !== null) d.transform = r.transform;
    if (r.value_map !== null) d.valueMap = r.value_map;
    return d;
  });
}

export async function writeBatch(
  tx: pg.PoolClient,
  importId: string,
  rows: BatchRow[],
  deps: { khoa: KhoaSoChu; catalog?: CatalogData },
): Promise<BatchResult | Refusal> {
  const nguoi = await vaiNguoiGui(tx);
  if (!nguoi.roles.some((v) => VAI_NHAP.includes(v))) return { error: API_ERRORS.importRoleRequired };
  const lan = await docLanNhap(tx, importId);
  if (!lan) return { error: API_ERRORS.notFound };
  if (rows.length > MAX_BATCH_ROWS) return { error: API_ERRORS.importBatchTooLarge };
  const { headers, ...plan } = lan.plan;
  const bang = bangTu(headers, rows.map((r) => ({ source: r.row, cells: r.cells })));
  const loi = validatePlan(plan, bang);
  if (loi.length) return { error: API_ERRORS.importPlanInvalid, details: loi };

  const today = homNay();
  const laDauChu = nguoi.roles.includes("listing_agent");
  const laTruongNhom = nguoi.roles.includes("team_lead");
  const ketQua: RowResult[] = [];

  for (const r of rows) {
    const cu = await tx.query<{ action: ImportRowAction; reason: string; listing_id: string | null }>(
      "select action, reason, listing_id from import_rows where company_id = app.current_company_id() and import_id = $1 and row_number = $2",
      [importId, r.row],
    );
    if (cu.rows[0]) {
      const c = cu.rows[0];
      ketQua.push({ row: r.row, action: c.action, reason: c.reason, ...((c.action === "create" || c.action === "update") && c.listing_id && { listingId: c.listing_id }) });
      continue;
    }
    // Áp kế hoạch trên đúng một dòng: trùng trong file xét trên cả file (`duplicate_rows`), không trong gói.
    const dong = applyPlan(bangTu(headers, [{ source: r.row, cells: r.cells }]), plan, { today, catalog: deps.catalog }).rows[0]!;
    const oNgay = dong.cells.find((c) => c.target === "confirmedDate");
    if (oNgay && (oNgay.mark === "keep" || oNgay.mark === "fixed") && typeof oNgay.value === "string") {
      const sai = kiemNgayXacNhan(oNgay.value, today);
      if (sai) Object.assign(oNgay, { mark: "needs_person", reason: sai, value: undefined });
    }
    const toa = giaTri(dong, "buildingName");
    const ma = giaTri(dong, "unitNumber");
    const blocked = !toa || dong.cells.some((c) => TRUONG_CHAN.includes(c.target as StandardField) && CHAN.includes(c.mark));

    // Đầu chủ giữ căn hiệu lực: người gửi khi là Đầu chủ; `agentUserId` là Đầu chủ cùng sàn khi Trưởng nhóm gửi.
    let dauChu: string | null = null;
    if (laTruongNhom && r.agentUserId) {
      const ok = (await tx.query<{ ok: boolean }>("select app.member_has_role($1, 'listing_agent') as ok", [r.agentUserId])).rows[0]?.ok;
      dauChu = ok ? r.agentUserId : null;
    } else if (laDauChu) dauChu = nguoi.userId;

    const mo = toa && !blocked ? await hangMo(tx, String(toa), ma === null ? null : String(ma)) : null;
    const openListing: OpenListingFact = !mo
      ? "none"
      : !mo.readable
        ? "unreadable"
        : mo.agent !== null && mo.agent === dauChu
          ? "held_by_effective_agent"
          : "held_by_other";
    const dup = lan.duplicate_rows[String(r.row)];
    const quyet = quyetDongNhap({
      skippedByPerson: r.skip === true,
      blockedCell: blocked,
      duplicateOfRow: typeof dup === "number" ? dup : null,
      fileStatus: (giaTri(dong, "standardStatus") as string | null) ?? null,
      agentValid: dauChu !== null,
      openListing,
    });

    await tx.query("savepoint dong_nhap");
    let kq: { reason: string; listingId?: string; leadId?: string; versionBefore?: number; action: ImportRowAction };
    try {
      kq = await lamDong(tx, { importId, quyet, dong, toa: String(toa ?? ""), ma, dauChu, laDauChu, mo, khoa: deps.khoa });
    } catch (e) {
      if (!laTuChoi(e)) throw e;
      // Một dòng bị lõi từ chối thành «bỏ» có lý do, các dòng khác của gói vẫn ghi (Hỏi-3).
      await tx.query("rollback to savepoint dong_nhap");
      kq = { action: "skip", reason: `máy chủ từ chối dòng: ${e.error.code}${e.details?.length ? ` (${e.details.map((d) => `${d.path}: ${d.reason}`).join("; ")})` : ""}` };
    }
    await tx.query(
      `insert into import_rows (company_id, import_id, row_number, action, reason, listing_id, lead_id, listing_version_before)
       values (app.current_company_id(), $1, $2, $3, $4, $5, $6, $7)`,
      [importId, r.row, kq.action, kq.reason, kq.listingId ?? null, kq.leadId ?? null, kq.versionBefore ?? null],
    );
    ketQua.push({ row: r.row, action: kq.action, reason: kq.reason, ...((kq.action === "create" || kq.action === "update") && kq.listingId && { listingId: kq.listingId }) });
  }
  await tx.query("update imports set status = 'committed' where company_id = app.current_company_id() and id = $1", [importId]);
  return { importId, rows: ketQua, summary: tong(ketQua) };
}

export function tong(rows: readonly { action: ImportRowAction }[]): Summary {
  const s: Summary = { create: 0, update: 0, supplement: 0, skip: 0 };
  for (const r of rows) s[r.action]++;
  return s;
}

/** Ném từ chối của cửa có sẵn để dòng lùi về savepoint. */
function chac<T>(r: T | RefusalHang): T {
  if (laTuChoi(r)) throw r;
  return r;
}

type LamDong = {
  importId: string;
  quyet: { action: ImportRowAction; reason: string };
  dong: AppliedRow;
  toa: string;
  ma: string | number | null;
  dauChu: string | null;
  laDauChu: boolean;
  mo: { id: string; version: number; agent: string | null; readable: boolean } | null;
  khoa: KhoaSoChu;
};

async function lamDong(tx: pg.PoolClient, d: LamDong): Promise<{ action: ImportRowAction; reason: string; listingId?: string; leadId?: string; versionBefore?: number }> {
  const { quyet, dong } = d;
  if (quyet.action === "skip") return quyet;
  const gia = giaTri(dong, "listPrice");
  const phi = giaTri(dong, "feeInclusion");
  const ngay = giaTri(dong, "confirmedDate");
  const ghiChu: string[] = [];

  if (quyet.action === "supplement") {
    const so = giaTri(dong, "ownerPhone");
    if (typeof so !== "string" || typeof gia !== "number" || typeof phi !== "string")
      return { action: "supplement", reason: `${quyet.reason} — dòng thiếu số, giá hay điều kiện phí nên không gửi tin bổ sung` };
    const lead = chac(
      await ghiLead(tx, {
        buildingName: d.toa,
        ...(d.ma !== null && { unitNumber: String(d.ma) }),
        need: "sale",
        listPrice: gia,
        feeInclusion: phi,
        desiredListingTime: "undecided",
        ownerPhone: so,
      }),
    ) as { id: string };
    return { action: "supplement", reason: quyet.reason, leadId: lead.id };
  }

  const viewer = await viewerOf(tx, (await vaiNguoiGui(tx)).userId);
  let id: string;
  let version: number;
  let versionBefore: number | undefined;
  if (quyet.action === "create") {
    const tao = chac(await createListing(tx, { buildingName: d.toa, ...(d.ma !== null && { unitNumber: String(d.ma) }) }, { device: null, madeOffline: false, importId: d.importId }));
    [id, version] = [tao.listingId, tao.state.version];
    if (d.laDauChu && d.dauChu === viewer.userId) {
      await tx.query(
        "insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values (app.current_company_id(), $1, 1, app.current_user_id(), app.current_user_id())",
        [id],
      );
    } else {
      const gan = await assignAgent(tx, id, { userId: d.dauChu });
      if (laTuChoiChu(gan)) throw gan;
    }
  } else {
    [id, version, versionBefore] = [d.mo!.id, d.mo!.version, d.mo!.version];
  }

  const lenh = async (type: string, payload: Record<string, unknown>) => {
    const r = await applyCommand(tx, viewer, id, { type, payload, expectedVersion: version, importId: d.importId });
    if (laTuChoi(r)) return r;
    version = r.state.version;
    return r;
  };
  if (typeof gia === "number" && typeof phi === "string") chac(await lenh("price_changed", { listPrice: gia, feeInclusion: phi }));
  else if (gia !== null) ghiChu.push("giá chưa ghi vì thiếu điều kiện phí");

  if (quyet.action === "create") {
    const ten = giaTri(dong, "ownerName");
    if (typeof ten === "string") {
      const so = giaTri(dong, "ownerPhone");
      const day = giaTri(dong, "floorPrice");
      const chu = await putOwner(tx, id, { ownerName: ten, ...(typeof so === "string" && { ownerPhone: so }), ...(typeof day === "number" && { floorPrice: day }) }, d.khoa);
      if (laTuChoiChu(chu)) throw chu;
    }
  }
  if (typeof ngay === "string") chac(await lenh("owner_confirmed", { confirmedAt: ngay }));

  // Trạng thái theo file: hàng mới bắt đầu Chưa đủ để rao; Đang bán phải qua điều kiện của lõi (ADR-0008).
  const tt = giaTri(dong, "standardStatus");
  if (quyet.action === "create" && (tt === "Active" || tt === "Pending" || tt === "Hold")) {
    for (const to of tt === "Pending" ? ["Active", "Pending"] : [tt]) {
      const r = await lenh("status_changed", { to });
      if (laTuChoi(r)) {
        const thieu = r.missing?.map((m) => (typeof m === "string" ? m : JSON.stringify(m))).join(", ");
        ghiChu.push(`ở Chưa đủ để rao — ${thieu ? `thiếu ${thieu}` : (r.reason ?? r.error.code)}`);
        break;
      }
    }
  }
  return { action: quyet.action, reason: [quyet.reason, ...ghiChu].join("; "), listingId: id, versionBefore };
}

export async function readImport(tx: pg.PoolClient, importId: string) {
  const lan = await docLanNhap(tx, importId);
  if (!lan) return { error: API_ERRORS.notFound } as Refusal;
  const { rows } = await tx.query<{ row_number: number; action: ImportRowAction; reason: string; listing_id: string | null }>(
    "select row_number, action, reason, listing_id from import_rows where company_id = app.current_company_id() and import_id = $1 order by row_number",
    [importId],
  );
  const { rows: st } = await tx.query<{ status: string; file_name: string }>("select status, file_name from imports where company_id = app.current_company_id() and id = $1", [importId]);
  const ds: RowResult[] = rows.map((r) => ({
    row: r.row_number,
    action: r.action,
    reason: r.reason,
    ...((r.action === "create" || r.action === "update") && r.listing_id && { listingId: r.listing_id }),
  }));
  return { id: importId, status: st[0]!.status, fileName: st[0]!.file_name, rows: ds, summary: tong(ds) };
}

export { LY_DO_DONG_NHAP };
