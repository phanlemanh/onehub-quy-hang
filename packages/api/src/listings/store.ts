import { randomUUID } from "node:crypto";
import {
  checkTransition,
  confirmsWithOwner,
  docCauHinhSanSang,
  KHOA_ANH_THAT_TOI_THIEU,
  foldListing,
  kiemDoiGia,
  kiemGanMaCan,
  lyDoCanDangMo,
  LY_DO_DOI_GIA_DA_BAN,
  LY_DO_MA_CAN_DA_CO,
  validatePayload,
  WINS_IMMEDIATELY,
  type EventType,
  type ListingEvent,
  type ListingState,
  type PayloadError,
  type Requirement,
  type StandardStatus,
} from "@quy-hang/core/listing";
import { OPEN_STATUSES } from "@quy-hang/core/dedupe";
import { canRead, factsFromEvents, type Viewer, type VisibilityFacts } from "@quy-hang/core/visibility";
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";

/**
 * Đường ghi DUY NHẤT vào bảng hàng và bảng sự kiện (AC-3, ADR-0008). Mỗi lệnh: khoá theo hàng, xét phiên bản, xét luật
 * của lõi, ghi đúng một sự kiện, ghi lại bản tính bằng `foldListing` — tất cả trong giao dịch của `withCompany`.
 */

export type Ctx = { userId: string; companyId: string };
export type Command = { type: unknown; payload: unknown; expectedVersion?: number; confirmedWithOwner?: boolean; madeOffline?: boolean };
/** Thiết bị máy khai ở đầu `x-quy-hang-device` (hàng ghi-thiet-bi-va-mat-mang); vắng hay lạ là `null` — «không rõ». */
export type Device = "desktop" | "mobile" | null;
export const docThietBi = (v: string | undefined): Device => (v === "desktop" || v === "mobile" ? v : null);
/** Cách lệnh được ghi: máy nào, có làm lúc mất mạng không. */
export type CachGhi = { device: Device; madeOffline: boolean };
const GHI_KHONG_RO: CachGhi = { device: null, madeOffline: false };
export type Refusal = {
  error: ApiErrorEntry;
  details?: PayloadError[];
  missing?: Requirement[];
  reason?: string;
  /** Hàng đang mở khác trên cùng căn — khi gắn mã căn bị từ chối vì trùng (ADR-0026). */
  conflictListingId?: string;
};
export type Applied = { listingId: string; state: ListingState; event: ListingEvent; facts: VisibilityFacts };

/** Cột của bảng `listings` ứng với từng khoá của bản tính — cũng là danh sách bộ kiểm «gấp lại» so. */
export const STATE_COLUMNS: Readonly<Record<keyof ListingState, string>> = {
  buildingName: "building_name",
  unitNumber: "unit_number",
  standardStatus: "standard_status",
  listPrice: "list_price",
  feeInclusion: "fee_inclusion",
  furnished: "furnished",
  legalStatus: "legal_status",
  financing: "financing",
  occupantType: "occupant_type",
  closePrice: "close_price",
  closeDate: "close_date",
  withdrawnReason: "withdrawn_reason",
  lastConfirmedAt: "last_confirmed_at",
  version: "version",
};
const KHOA = Object.keys(STATE_COLUMNS) as (keyof ListingState)[];
const COT = KHOA.map((k) => STATE_COLUMNS[k]);

type EventRow = {
  seq: number;
  type: EventType;
  payload: Record<string, unknown>;
  actor_user_id: string;
  actor_roles: string[];
  confirmed_with_owner: boolean;
  occurred_at: Date;
  device: "desktop" | "mobile" | null;
  made_offline: boolean;
};
const toEvent = (r: EventRow): ListingEvent => ({
  seq: r.seq,
  type: r.type,
  payload: r.payload,
  actorUserId: r.actor_user_id,
  actorRoles: r.actor_roles,
  confirmedWithOwner: r.confirmed_with_owner,
  occurredAt: r.occurred_at.toISOString(),
  device: r.device,
  madeOffline: r.made_offline,
});

export async function loadEvents(tx: pg.PoolClient, listingId: string): Promise<ListingEvent[]> {
  const { rows } = await tx.query<EventRow>(
    `select seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, occurred_at, device, made_offline
     from listing_events where company_id = app.current_company_id() and listing_id = $1 order by seq`,
    [listingId],
  );
  return rows.map(toEvent);
}

/** Vai của người đang làm ở sàn đang làm — ghi vào sự kiện (Tham chiếu §4: ghi người và vai lúc làm). */
async function vaiLucLam(tx: pg.PoolClient): Promise<string[]> {
  const { rows } = await tx.query<{ roles: string[] }>(
    "select roles from company_members where company_id = app.current_company_id() and user_id = app.current_user_id()",
  );
  return rows[0]?.roles ?? [];
}

/** Người đang gọi API, để xét trục ai thấy hàng (hàng 12) bằng `canRead` của lõi. */
export async function viewerOf(tx: pg.PoolClient, userId: string): Promise<Viewer> {
  return { userId, roles: await vaiLucLam(tx) };
}

/**
 * Dữ kiện của trục ai thấy hàng cho mọi hàng của sàn đang làm, gom từ bảng sự kiện: người của `seq = 1` và các trạng thái
 * hàng từng tới. Câu này chỉ chở dữ kiện — luật nấc nằm ở `visibilityOf`/`canRead` của lõi (AC-9).
 */
export const FACTS_SQL = {
  creatorUserId: `(select e.actor_user_id from listing_events e
     where e.company_id = app.current_company_id() and e.listing_id = l.id and e.seq = 1)`,
  statusesReached: `array(select distinct e.payload->>'to' from listing_events e
     where e.company_id = app.current_company_id() and e.listing_id = l.id and e.type = 'status_changed')`,
};

async function ghiSuKien(tx: pg.PoolClient, listingId: string, seq: number, type: EventType, payload: object, confirmed: boolean, cach: CachGhi) {
  const { rows } = await tx.query<EventRow>(
    `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, device, made_offline)
     values (app.current_company_id(), $1, $2, $3, $4, app.current_user_id(), $5, $6, $7, $8)
     returning seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, occurred_at, device, made_offline`,
    [listingId, seq, type, JSON.stringify(payload), await vaiLucLam(tx), confirmed, cach.device, cach.madeOffline],
  );
  return toEvent(rows[0]!);
}

const giaTri = (s: ListingState) => KHOA.map((k) => s[k]);

export async function createListing(tx: pg.PoolClient, payload: unknown, cach: CachGhi = GHI_KHONG_RO): Promise<Applied | Refusal> {
  const details = validatePayload("created", payload);
  if (details.length) return { error: API_ERRORS.invalidPayload, details };
  const listingId = randomUUID();
  const event = await ghiSuKien(tx, listingId, 1, "created", payload as object, false, cach);
  const state = foldListing([event]);
  const facts = factsFromEvents([event]);
  await tx.query(
    `insert into listings (id, company_id, ${COT.join(", ")})
     values ($1, app.current_company_id(), ${COT.map((_, i) => `$${i + 2}`).join(", ")})`,
    [listingId, ...giaTri(state)],
  );
  return { listingId, state, event, facts };
}

export async function applyCommand(tx: pg.PoolClient, viewer: Viewer, listingId: string, cmd: Command, device: Device = null): Promise<Applied | Refusal> {
  // Khoá theo hàng: lệnh thứ hai trên cùng hàng đứng chờ, rồi thấy phiên bản mới — không bao giờ hai lệnh cùng một seq.
  const hang = await tx.query<{ version: number }>("select version from listings where id = $1 for update", [listingId]);
  if (!hang.rowCount) return { error: API_ERRORS.notFound };
  const version = hang.rows[0]!.version;

  // Trục ai thấy hàng (hàng 12): không đọc được thì như hàng không có — xét trước phiên bản và khuôn để mã lỗi không lộ
  // hàng có thật (AC-5).
  const events = await loadEvents(tx, listingId);
  if (!canRead(viewer, factsFromEvents(events))) return { error: API_ERRORS.notFound };

  const details = validatePayload(cmd.type, cmd.payload);
  if (cmd.type === "created") details.push({ path: "type", reason: "hàng đã có — tạo hàng bằng POST /listings" });
  if (details.length) return { error: API_ERRORS.invalidPayload, details };
  const type = cmd.type as EventType;
  const payload = cmd.payload as Record<string, unknown>;

  // Hàng đã có mã: từ chối bằng chính sự thật ấy, trước phép so phiên bản — máy đang giữ bản cũ (gắn lúc mất mạng) nhận lý
  // do «đã có mã» thay cho «đụng nhau» (ADR-0026).
  if (type === "unit_number_assigned" && kiemGanMaCan(foldListing(events))) return { error: API_ERRORS.unitNumberAlreadySet, reason: LY_DO_MA_CAN_DA_CO };
  // Căn Đã bán không đổi giá (luật của lõi): cũng xét trước phép so phiên bản — máy giữ bản cũ nhận đúng lý do «đã bán».
  if (type === "price_changed" && kiemDoiGia(foldListing(events))) return { error: API_ERRORS.priceLockedClosed, reason: LY_DO_DOI_GIA_DA_BAN };

  const thangNgay = type === "status_changed" && WINS_IMMEDIATELY.includes(payload.to as never);
  if (!thangNgay && cmd.expectedVersion !== version) return { error: API_ERRORS.versionConflict };

  const hienTai = foldListing(events);
  if (type === "status_changed") {
    // «Thắng ngay» bỏ qua phép so phiên bản, KHÔNG bỏ qua bảng chuyển: xét trên trạng thái hiện tại của hàng.
    // Vào Đang bán: máy chủ luôn đếm ảnh thật của căn và đọc số tối thiểu của sàn (hàng 23) — mọi lối lên bảng qua đây.
    const anh = payload.to === "Active" ? await nguCanhAnh(tx, hienTai) : {};
    const kq = checkTransition(hienTai.standardStatus, payload.to, { ...hienTai, ...payload, ...anh });
    if (!kq.ok) {
      return kq.kind === "invalid-transition"
        ? { error: API_ERRORS.invalidTransition, reason: kq.reason }
        : { error: API_ERRORS.missingRequirement, missing: kq.missing };
    }
  }

  if (type === "unit_number_assigned") {
    // Gắn mã căn (ADR-0026): căn đã có hàng đang mở khác của sàn thì từ chối.
    const trung = await hangMoCungCan(tx, listingId, hienTai.buildingName, payload.unitNumber as string);
    if (trung) return { error: API_ERRORS.unitAlreadyListed, reason: lyDoCanDangMo(trung.status), conflictListingId: trung.id };
  }

  const event = await ghiSuKien(tx, listingId, version + 1, type, payload, confirmsWithOwner(type, cmd.confirmedWithOwner), {
    device,
    madeOffline: cmd.madeOffline === true,
  });
  const state = foldListing([...events, event]);
  const facts = factsFromEvents([...events, event]);
  await tx.query(`update listings set ${COT.map((c, i) => `${c} = $${i + 2}`).join(", ")} where id = $1`, [listingId, ...giaTri(state)]);
  return { listingId, state, event, facts };
}

/** Ảnh thật của căn (ngăn Gửi được, không ảnh mẫu, chưa xoá) và số tối thiểu của sàn, đọc trong giao dịch của lệnh. */
async function nguCanhAnh(tx: pg.PoolClient, hang: ListingState): Promise<{ realPhotoCount: number; minRealPhotos: number }> {
  const { rows } = await tx.query<{ n: number }>(
    `select count(*)::int n from unit_photos
     where building_name = $1 and app.unit_key(unit_number) = app.unit_key($2)
       and compartment = 'shareable' and not is_sample and removed_at is null`,
    [hang.buildingName, hang.unitNumber],
  );
  const cauHinh = await tx.query<{ key: string; value: unknown }>("select key, value from company_settings where key = $1", [KHOA_ANH_THAT_TOI_THIEU]);
  return { realPhotoCount: rows[0]!.n, minRealPhotos: docCauHinhSanSang(cauHinh.rows).minRealPhotos };
}

/**
 * Hàng đang mở khác của sàn trên cùng căn: cùng toà, mã so bằng `app.unit_key`, trạng thái thuộc `OPEN_STATUSES` của lõi.
 * Luật cách ly giới hạn phép tìm trong sàn đang làm — hàng của sàn khác không chặn.
 */
async function hangMoCungCan(tx: pg.PoolClient, listingId: string, toa: string, ma: string): Promise<{ id: string; status: StandardStatus } | null> {
  const { rows } = await tx.query<{ id: string; status: StandardStatus }>(
    `select id, standard_status as status from listings
     where id <> $1 and building_name = $2 and app.unit_key(unit_number) = app.unit_key($3) and standard_status = any($4)
     order by id limit 1`,
    [listingId, toa, ma, OPEN_STATUSES],
  );
  return rows[0] ?? null;
}

export const isRefusal = (r: Applied | Refusal): r is Refusal => "error" in r;
