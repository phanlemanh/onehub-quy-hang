import { keHoachDong, LY_DO_HOAN_TAC, type DongNhap, type KeHoachDong, type KetCucHoanTac } from "@quy-hang/core/listing";
import type pg from "pg";
import { API_ERRORS } from "../../errors";
import { applyCommand, isRefusal as laTuChoiHang, loadEventsNhap, viewerOf, voidListing } from "../../listings/store";
import type { Refusal } from "../store";

/**
 * Hoàn tác cả lần nhập (hàng 66, ADR-0011 quyết định 8). Kết cục từng dòng do lõi quyết (`keHoachDong`); ở đây chỉ đọc
 * dòng, gọi đúng cửa ghi của hàng (`voidListing`, `applyCommand`) và ghi kết cục vào `import_rows.undo_outcome` — dòng đã có
 * kết cục thì dùng lại, nên gọi lại sau khi đứt giữa chừng không ghi trùng. Không câu SQL nào vào `listings`/`listing_events`.
 * Chỉ người nhập hoàn tác được (luật dòng của `imports`): người khác như lần nhập không có.
 */

const VAI_NHAP = ["listing_agent", "team_lead"];
/** Số dòng mỗi giao dịch ghi — đứt giữa chừng thì các gói trước giữ nguyên. */
export const GOI_HOAN_TAC = 50;

export type DongLietKe = { rowNumber: number; buildingName: string | null; unitNumber: string | null; lyDo: string };
export type KetQuaHoanTac = { importId: string; status: "committed" | "undone"; go: number; traGia: number; khongDuoc: number; danhSach: DongLietKe[] };
export type LanNhapCuaToi = { id: string; fileName: string; createdAt: string; status: "committed" | "undone"; soDongGhi: number };

type DongDb = {
  row_number: number;
  action: DongNhap["action"];
  listing_id: string | null;
  listing_version_before: number | null;
  undo_outcome: KetCucHoanTac | null;
  building_name: string | null;
  unit_number: string | null;
};

async function coVaiNhap(tx: pg.PoolClient): Promise<boolean> {
  const { rows } = await tx.query<{ r: string[] | null }>(
    "select roles r from company_members where company_id = app.current_company_id() and user_id = app.current_user_id()",
  );
  return (rows[0]?.r ?? []).some((v) => VAI_NHAP.includes(v));
}

/** Lần nhập của chính người gọi đã ghi (hay đã hoàn tác), khoá dòng để hai lần gọi cùng lúc không chồng nhau. */
async function lanCuaToi(tx: pg.PoolClient, importId: string): Promise<{ status: "committed" | "undone" } | Refusal> {
  if (!(await coVaiNhap(tx))) return { error: API_ERRORS.importRoleRequired };
  if (!/^[0-9a-f-]{36}$/i.test(importId)) return { error: API_ERRORS.notFound };
  const { rows } = await tx.query<{ status: string }>(
    `select status from imports where company_id = app.current_company_id() and id = $1 and created_by = app.current_user_id()
       and status in ('committed', 'undone') for update`,
    [importId],
  );
  return rows[0] ? { status: rows[0].status as "committed" | "undone" } : { error: API_ERRORS.notFound };
}

const DONG_SQL = `
  select r.row_number, r.action, r.listing_id, r.listing_version_before, r.undo_outcome,
         coalesce(l.building_name, ld.building_name) as building_name, coalesce(l.unit_number, ld.unit_number) as unit_number
    from import_rows r
    left join listings l on l.company_id = r.company_id and l.id = r.listing_id
    left join leads ld on ld.company_id = r.company_id and ld.id = r.lead_id
   where r.company_id = app.current_company_id() and r.import_id = $1`;

async function docDong(tx: pg.PoolClient, importId: string, chuaLam = false): Promise<DongDb[]> {
  const { rows } = await tx.query<DongDb>(`${DONG_SQL} ${chuaLam ? "and r.undo_outcome is null" : ""} order by r.row_number`, [importId]);
  return rows;
}

async function keHoach(tx: pg.PoolClient, importId: string, d: DongDb): Promise<KeHoachDong> {
  const dong: DongNhap = { rowNumber: d.row_number, action: d.action, listingId: d.listing_id, versionBefore: d.listing_version_before };
  return keHoachDong(dong, d.listing_id ? await loadEventsNhap(tx, d.listing_id) : null, importId);
}

function tongKet(importId: string, status: "committed" | "undone", ds: { d: DongDb; k: { ketCuc: KetCucHoanTac; lyDo: string | null } }[]): KetQuaHoanTac {
  return {
    importId,
    status,
    go: ds.filter((x) => x.k.ketCuc === "go").length,
    traGia: ds.filter((x) => x.k.ketCuc === "tra-gia").length,
    khongDuoc: ds.filter((x) => x.k.lyDo !== null).length,
    danhSach: ds.filter((x) => x.k.lyDo !== null).map((x) => ({ rowNumber: x.d.row_number, buildingName: x.d.building_name, unitNumber: x.d.unit_number, lyDo: x.k.lyDo! })),
  };
}

/** Lý do liệt kê của một kết cục đã ghi — cùng bảng chữ của lõi. */
const lyDoCua = (k: KetCucHoanTac): string | null => (k in LY_DO_HOAN_TAC ? LY_DO_HOAN_TAC[k as keyof typeof LY_DO_HOAN_TAC] : null);

/** Kết quả của lần nhập: dòng đã làm đọc kết cục đã ghi, dòng chưa làm tính từ dãy sự kiện hiện tại. Chỉ đọc. */
export async function xemHoanTac(tx: pg.PoolClient, importId: string): Promise<KetQuaHoanTac | Refusal> {
  const lan = await lanCuaToi(tx, importId);
  if ("error" in lan) return lan;
  const ds = [];
  for (const d of await docDong(tx, importId))
    ds.push({ d, k: d.undo_outcome ? { ketCuc: d.undo_outcome, lyDo: lyDoCua(d.undo_outcome) } : await keHoach(tx, importId, d) });
  return tongKet(importId, lan.status, ds);
}

/**
 * Làm một gói dòng chưa có kết cục trong giao dịch của người gọi. Trả số dòng đã làm; 0 nghĩa là mọi dòng đã xong và lần
 * nhập đã đánh dấu «Đã hoàn tác». Mỗi dòng một savepoint: dòng lỗi lùi về savepoint, các dòng trước của gói vẫn ghi, và kết
 * quả mang `dut` để route báo «chưa xong». `dutSau` (chỉ bộ kiểm) làm lỗi dòng kế sau đúng số dòng ấy, tính trên cả lần gọi.
 */
export async function lamGoiHoanTac(tx: pg.PoolClient, importId: string, o: { dutSau?: { con: number } } = {}): Promise<number | { dut: number } | Refusal> {
  const lan = await lanCuaToi(tx, importId);
  if ("error" in lan) return lan;
  const chua = (await docDong(tx, importId, true)).slice(0, GOI_HOAN_TAC);
  if (!chua.length) {
    if (lan.status !== "undone")
      await tx.query("update imports set status = 'undone', undone_at = now(), undone_by = app.current_user_id() where company_id = app.current_company_id() and id = $1", [importId]);
    return 0;
  }
  const viewer = await viewerOf(tx, (await tx.query<{ u: string }>("select app.current_user_id() u")).rows[0]!.u);
  let daLam = 0;
  for (const d of chua) {
    await tx.query("savepoint hoan_tac_dong");
    try {
      if (o.dutSau && o.dutSau.con-- <= 0) throw new Error("thử: đứt giữa lần hoàn tác");
      await lamDong(tx, importId, d, viewer);
      await tx.query("release savepoint hoan_tac_dong");
      daLam++;
    } catch {
      await tx.query("rollback to savepoint hoan_tac_dong");
      return { dut: daLam };
    }
  }
  return daLam;
}

async function lamDong(tx: pg.PoolClient, importId: string, d: DongDb, viewer: Awaited<ReturnType<typeof viewerOf>>) {
  const k = await keHoach(tx, importId, d);
  let ketCuc = k.ketCuc;
  if (k.lenh && k.listingId !== null && k.expectedVersion !== null) {
    const r =
      k.lenh.kind === "voided"
        ? await voidListing(tx, k.listingId, k.expectedVersion)
        : await applyCommand(tx, viewer, k.listingId, {
            type: "price_changed",
            payload: { listPrice: k.lenh.listPrice, feeInclusion: k.lenh.feeInclusion },
            expectedVersion: k.expectedVersion,
            confirmedWithOwner: false,
          });
    // Lệnh bị từ chối (phiên bản vừa đổi) là có người sửa giữa lúc xét và lúc ghi.
    if (laTuChoiHang(r)) ketCuc = "da-sua-sau";
  }
  await tx.query(
    "update import_rows set undo_outcome = $3, undone_at = now() where company_id = app.current_company_id() and import_id = $1 and row_number = $2",
    [importId, d.row_number, ketCuc],
  );
}

/** Lần nhập của người gọi, mới nhất trước (màn «Lần nhập gần đây»). */
export async function lanNhapCuaToi(tx: pg.PoolClient, limit = 10): Promise<LanNhapCuaToi[] | Refusal> {
  if (!(await coVaiNhap(tx))) return { error: API_ERRORS.importRoleRequired };
  const { rows } = await tx.query<{ id: string; file_name: string; created_at: Date; status: "committed" | "undone"; so: number }>(
    `select i.id, i.file_name, i.created_at, i.status,
            (select count(*)::int from import_rows r where r.company_id = i.company_id and r.import_id = i.id and r.action <> 'skip') as so
       from imports i
      where i.company_id = app.current_company_id() and i.created_by = app.current_user_id() and i.status in ('committed', 'undone')
      order by i.created_at desc limit $1`,
    [limit],
  );
  return rows.map((r) => ({ id: r.id, fileName: r.file_name, createdAt: r.created_at.toISOString(), status: r.status, soDongGhi: r.so }));
}
