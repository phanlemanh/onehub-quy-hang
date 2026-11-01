import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { parseCatalogFeed, type CatalogFeed, type CatalogFeedError } from "@quy-hang/connect";
import { mayFlow, type Agreement } from "@quy-hang/core";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";

/**
 * Cửa nhận gói danh mục theo khuôn v1 (ADR-0015) vào vùng danh mục dùng chung. Chỉ quản trị sàn gửi được, và chỉ khi
 * sàn nằm trong danh sách tin và có thoả thuận `catalog_source` chiều vào đang hiệu lực mang lớp `catalog`. Gói sai
 * khuôn hay thoả thuận không hiệu lực thì không một dòng nào: kiểm cả gói trước, ghi một giao dịch, và luật theo dòng
 * của cơ sở dữ liệu là lưới cuối (thoả thuận đổi trạng thái giữa lúc kiểm và lúc ghi vẫn bị chặn).
 */
const PATH = "/api/v1/catalog/feeds";

const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const FeedResult = z
  .object({
    subdivisions: z.number().int(),
    buildings: z.number().int(),
    units: z.number().int(),
    /** Căn mới vào vùng dùng chung. */
    created: z.number().int(),
    /** Căn đã có mà gói đổi ít nhất một thuộc tính. */
    updated: z.number().int(),
  })
  .openapi("CatalogFeedResult");
const InvalidFeed = z
  .object({
    error: z.literal(API_ERRORS.invalidFeed.code),
    errors: z.array(z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() })),
  })
  .openapi("CatalogFeedInvalid");

export type FeedResult = z.infer<typeof FeedResult>;

/** Móc chỉ cho tệp kiểm: chạy sau khi kiểm thoả thuận, ngay trước câu ghi đầu tiên. */
export type FeedHooks = { truocKhiGhi?: () => Promise<void> };

type Ctx = { userId: string; companyId: string };

/** Ném ra khỏi giao dịch để rollback và trả mã lỗi của API. */
class FeedRefused extends Error {
  constructor(readonly entry: ApiErrorEntry) {
    super(entry.code);
  }
}

type AgreementRow = {
  id: string;
  company_id: string;
  kind: Agreement["kind"];
  direction: Agreement["direction"];
  counterparty: string;
  data_classes: Agreement["dataClasses"];
  valid_from: Date;
  valid_until: Date | null;
  status: Agreement["status"];
  approved_by: string;
  special_terms: boolean;
};

const toAgreement = (r: AgreementRow): Agreement => ({
  id: r.id,
  companyId: r.company_id,
  kind: r.kind,
  direction: r.direction,
  counterparty: r.counterparty,
  dataClasses: r.data_classes,
  validFrom: r.valid_from,
  validUntil: r.valid_until,
  status: r.status,
  approvedBy: r.approved_by,
  specialTerms: r.special_terms,
});

/** Thoả thuận đầu tiên của sàn đang đặt mở được luồng danh mục chiều vào lúc này; không có thì `null`. */
async function chonThoaThuan(tx: pg.PoolClient): Promise<string | null> {
  const at = (await tx.query<{ now: Date }>("select now() as now")).rows[0]!.now;
  const { rows } = await tx.query<AgreementRow>(
    `select id, company_id, kind, direction, counterparty, data_classes, valid_from, valid_until, status, approved_by,
            special_terms
     from agreements where company_id = app.current_company_id() order by created_at, id`,
  );
  const hop = rows.map(toAgreement).find((a) => mayFlow(a, "catalog", { at, kind: "catalog_source", direction: "inbound" }).ok);
  return hop?.id ?? null;
}

async function ghiGoi(tx: pg.PoolClient, feed: CatalogFeed, agreementId: string): Promise<{ created: number; updated: number }> {
  const khu = feed.subdivisions.map((s) => ({
    subdivision_key: s.subdivisionKey,
    subdivision_name: s.subdivisionName,
    complex_name: s.complexName,
  }));
  const can = feed.subdivisions.flatMap((s) =>
    s.buildings.flatMap((b) =>
      b.units.map((u) => ({
        upi: u.upi,
        subdivision_key: s.subdivisionKey,
        building_key: b.buildingKey,
        building_name: b.buildingName,
        unit_number: u.unitNumber,
        stack: u.stack,
        floor: u.floor,
        living_area: u.livingArea,
        bedrooms_total: u.bedroomsTotal,
        direction_faces: u.directionFaces,
        property_type: u.propertyType,
        property_sub_type: u.propertySubType,
        lot_size_area: u.lotSizeArea ?? null,
        stories_total: u.storiesTotal ?? null,
        frontage_length: u.frontageLength ?? null,
        access_road_width: u.accessRoadWidth ?? null,
      })),
    ),
  );
  if (khu.length === 0) return { created: 0, updated: 0 };

  // Khu trước (căn trỏ khoá khu). Cập nhật chỉ khi thuộc tính đổi; mốc đo làm tươi ở câu riêng bên dưới.
  await tx.query(
    `insert into catalog_subdivisions (subdivision_key, subdivision_name, complex_name, provider, measured_at, agreement_id)
     select k.subdivision_key, k.subdivision_name, k.complex_name, $2, $3, $4
     from jsonb_to_recordset($1::jsonb) as k(subdivision_key text, subdivision_name text, complex_name text)
     on conflict (subdivision_key) do update
       set subdivision_name = excluded.subdivision_name, complex_name = excluded.complex_name,
           provider = excluded.provider, measured_at = excluded.measured_at, agreement_id = excluded.agreement_id,
           updated_at = now()
       where (catalog_subdivisions.subdivision_name, catalog_subdivisions.complex_name, catalog_subdivisions.provider)
             is distinct from (excluded.subdivision_name, excluded.complex_name, excluded.provider)`,
    [JSON.stringify(khu), feed.provider, feed.measuredAt, agreementId],
  );

  // Căn: khoá là UPI — gửi lại không nhân đôi; `returning` chỉ ra căn mới (xmax = 0) và căn thật sự đổi.
  const { rows } = await tx.query<{ created: boolean }>(
    `insert into catalog_units (upi, subdivision_key, building_key, building_name, unit_number, stack, floor, living_area,
                                bedrooms_total, direction_faces, property_type, property_sub_type, lot_size_area,
                                stories_total, frontage_length, access_road_width, provider, measured_at, agreement_id)
     select u.upi, u.subdivision_key, u.building_key, u.building_name, u.unit_number, u.stack, u.floor, u.living_area,
            u.bedrooms_total, u.direction_faces, u.property_type, u.property_sub_type, u.lot_size_area, u.stories_total,
            u.frontage_length, u.access_road_width, $2, $3, $4
     from jsonb_to_recordset($1::jsonb) as u(upi text, subdivision_key text, building_key text, building_name text,
          unit_number text, stack text, floor int, living_area numeric, bedrooms_total int, direction_faces text,
          property_type text, property_sub_type text, lot_size_area numeric, stories_total int, frontage_length numeric,
          access_road_width numeric)
     on conflict (upi) do update
       set subdivision_key = excluded.subdivision_key, building_key = excluded.building_key,
           building_name = excluded.building_name, unit_number = excluded.unit_number, stack = excluded.stack,
           floor = excluded.floor, living_area = excluded.living_area, bedrooms_total = excluded.bedrooms_total,
           direction_faces = excluded.direction_faces, property_type = excluded.property_type,
           property_sub_type = excluded.property_sub_type, lot_size_area = excluded.lot_size_area,
           stories_total = excluded.stories_total, frontage_length = excluded.frontage_length,
           access_road_width = excluded.access_road_width, provider = excluded.provider,
           measured_at = excluded.measured_at, agreement_id = excluded.agreement_id, updated_at = now()
       where (catalog_units.subdivision_key, catalog_units.building_key, catalog_units.building_name,
              catalog_units.unit_number, catalog_units.stack, catalog_units.floor, catalog_units.living_area,
              catalog_units.bedrooms_total, catalog_units.direction_faces, catalog_units.property_type,
              catalog_units.property_sub_type, catalog_units.lot_size_area, catalog_units.stories_total,
              catalog_units.frontage_length, catalog_units.access_road_width, catalog_units.provider)
             is distinct from
             (excluded.subdivision_key, excluded.building_key, excluded.building_name, excluded.unit_number,
              excluded.stack, excluded.floor, excluded.living_area, excluded.bedrooms_total, excluded.direction_faces,
              excluded.property_type, excluded.property_sub_type, excluded.lot_size_area, excluded.stories_total,
              excluded.frontage_length, excluded.access_road_width, excluded.provider)
     returning (xmax = 0) as created`,
    [JSON.stringify(can), feed.provider, feed.measuredAt, agreementId],
  );

  // Gói không đổi thuộc tính vẫn là một lần đo mới: làm tươi mốc đo, không tính là cập nhật.
  const upis = can.map((u) => u.upi);
  const keys = khu.map((k) => k.subdivision_key);
  await tx.query(
    `update catalog_subdivisions set measured_at = $2, agreement_id = $3
     where subdivision_key = any ($1::text[]) and measured_at < $2`,
    [keys, feed.measuredAt, agreementId],
  );
  if (upis.length > 0) {
    await tx.query(
      `update catalog_units set measured_at = $2, agreement_id = $3 where upi = any ($1::text[]) and measured_at < $2`,
      [upis, feed.measuredAt, agreementId],
    );
  }

  const created = rows.filter((r) => r.created).length;
  return { created, updated: rows.length - created };
}

export function registerFeedRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps, hooks: FeedHooks = {}) {
  /** Quản trị của sàn đang làm — đọc lại mỗi lời gọi như thanh-vien.ts. */
  async function quanTri(c: Context): Promise<Ctx | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    const ctx = { userId: user.id, companyId: r.active.id };
    const admin = await withCompany(appPool, ctx, async (tx) => {
      const { rows } = await tx.query<{ a: boolean }>("select app.current_user_is_admin() as a");
      return rows[0]?.a === true;
    });
    return admin ? ctx : API_ERRORS.adminRequired;
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 403);
  const saiKhuon = (c: Context, errors: CatalogFeedError[]) =>
    c.json({ error: API_ERRORS.invalidFeed.code, errors }, API_ERRORS.invalidFeed.status);

  api.openapi(
    createRoute({
      method: "post",
      path: PATH,
      summary: "Nhận một gói danh mục theo khuôn v1 vào vùng danh mục dùng chung — chỉ quản trị sàn được tin",
      // Thân không khai ở đây để thân hỏng (không phải JSON, không phải object) ra 422 invalid-feed thay vì 400 của
      // bộ kiểm tự động; khuôn đầy đủ ở packages/connect (CatalogFeed, schemaVersion 1).
      description:
        "Thân: gói CatalogFeed v1 (`schemaVersion`, `provider`, `measuredAt`, `subdivisions` → `buildings` → `units`). " +
        "Cả gói hoặc không gì: sai khuôn 422, thoả thuận catalog_source chiều vào không hiệu lực 403.",
      responses: {
        200: { description: "Đã nhận", content: { "application/json": { schema: FeedResult } } },
        401: err("Chưa đăng nhập"),
        403: err("Chưa gắn sàn, cần quản trị sàn, hoặc thoả thuận không hiệu lực"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
        422: { description: "Gói sai khuôn", content: { "application/json": { schema: InvalidFeed } } },
      },
    }),
    async (c) => {
      const q = await quanTri(c);
      if ("status" in q) return tra(c, q);

      let raw: unknown;
      try {
        raw = await c.req.json();
      } catch {
        return saiKhuon(c, [{ path: [], message: "Thân gói không phải JSON." }]);
      }
      const parsed = parseCatalogFeed(raw);
      if (!parsed.ok) return saiKhuon(c, parsed.errors);
      const { feed } = parsed;

      try {
        const { created, updated } = await withCompany(appPool, q, async (tx) => {
          const tin = (
            await tx.query<{ t: boolean }>(
              "select exists (select 1 from catalog_trusted_companies where company_id = app.current_company_id()) as t",
            )
          ).rows[0]?.t;
          const agreementId = tin ? await chonThoaThuan(tx) : null;
          if (!agreementId) throw new FeedRefused(API_ERRORS.agreementInactive);
          await hooks.truocKhiGhi?.();
          return ghiGoi(tx, feed, agreementId);
        });
        const buildings = feed.subdivisions.reduce((n, s) => n + s.buildings.length, 0);
        const units = feed.subdivisions.reduce((n, s) => n + s.buildings.reduce((m, b) => m + b.units.length, 0), 0);
        return c.json({ subdivisions: feed.subdivisions.length, buildings, units, created, updated }, 200);
      } catch (e) {
        if (e instanceof FeedRefused) return tra(c, e.entry);
        // Luật theo dòng từ chối câu ghi: thoả thuận hết hiệu lực giữa lúc kiểm và lúc ghi.
        if ((e as { code?: string }).code === "42501") return tra(c, API_ERRORS.agreementInactive);
        throw e;
      }
    },
  );
}
