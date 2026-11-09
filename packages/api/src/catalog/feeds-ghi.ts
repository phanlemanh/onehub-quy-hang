import type { AnyCatalogFeed } from "@quy-hang/connect";
import type { Agreement } from "@quy-hang/core";
import type pg from "pg";

/** Phần dùng chung của hai đường vào cửa nhận danh mục: đường phiên (`feeds.ts`) và đường token (`feeds-token.ts`). */

/** Móc chỉ cho tệp kiểm. */
export type FeedHooks = {
  /** Chạy sau khi kiểm thoả thuận, ngay trước câu ghi đầu tiên. */
  truocKhiGhi?: () => Promise<void>;
  /** Đường token: chạy sau bước tra token, trước mọi kiểm khác. */
  sauKhiTraToken?: () => Promise<void>;
  /** Đường token: chạy ngay trước khi ghi một dòng nhật ký. */
  truocGhiNhatKy?: (outcome: string) => Promise<void>;
};

export type AgreementRow = {
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

export const toAgreement = (r: AgreementRow): Agreement => ({
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

export async function ghiGoi(tx: pg.PoolClient, feed: AnyCatalogFeed, agreementId: string): Promise<{ created: number; updated: number }> {
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

  // Khu trước (căn trỏ khoá khu). Cập nhật chỉ khi thuộc tính đổi; mốc đo làm tươi ở câu riêng bên dưới. Mã thoả thuận
  // gán từ tham số, không đọc `excluded.agreement_id`: vai API không có quyền đọc cột ấy (migration 014).
  await tx.query(
    `insert into catalog_subdivisions (subdivision_key, subdivision_name, complex_name, provider, measured_at, agreement_id)
     select k.subdivision_key, k.subdivision_name, k.complex_name, $2, $3, $4
     from jsonb_to_recordset($1::jsonb) as k(subdivision_key text, subdivision_name text, complex_name text)
     on conflict (subdivision_key) do update
       set subdivision_name = excluded.subdivision_name, complex_name = excluded.complex_name,
           provider = excluded.provider, measured_at = excluded.measured_at, agreement_id = $4,
           updated_at = now()
       where (catalog_subdivisions.subdivision_name, catalog_subdivisions.complex_name, catalog_subdivisions.provider)
             is distinct from (excluded.subdivision_name, excluded.complex_name, excluded.provider)`,
    [JSON.stringify(khu), feed.provider, feed.measuredAt, agreementId],
  );

  // Căn: khoá là UPI — gửi lại không nhân đôi. Đếm căn mới bằng UPI đã có trước câu ghi (vai API không đọc được cột hệ
  // thống `xmax` khi chỉ được cấp quyền đọc theo cột — migration 014); số dòng câu ghi = căn mới + căn thật sự đổi.
  const daCo = await tx.query<{ n: number }>("select count(*)::int as n from catalog_units where upi = any ($1::text[])", [
    can.map((u) => u.upi),
  ]);
  const ghi = await tx.query(
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
           measured_at = excluded.measured_at, agreement_id = $4, updated_at = now()
       where (catalog_units.subdivision_key, catalog_units.building_key, catalog_units.building_name,
              catalog_units.unit_number, catalog_units.stack, catalog_units.floor, catalog_units.living_area,
              catalog_units.bedrooms_total, catalog_units.direction_faces, catalog_units.property_type,
              catalog_units.property_sub_type, catalog_units.lot_size_area, catalog_units.stories_total,
              catalog_units.frontage_length, catalog_units.access_road_width, catalog_units.provider)
             is distinct from
             (excluded.subdivision_key, excluded.building_key, excluded.building_name, excluded.unit_number,
              excluded.stack, excluded.floor, excluded.living_area, excluded.bedrooms_total, excluded.direction_faces,
              excluded.property_type, excluded.property_sub_type, excluded.lot_size_area, excluded.stories_total,
              excluded.frontage_length, excluded.access_road_width, excluded.provider)`,
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

  const created = can.length - (daCo.rows[0]?.n ?? 0);
  return { created, updated: (ghi.rowCount ?? 0) - created };
}

/** Số khu, toà, căn của một gói — thân trả về của cả hai đường. */
export function demGoi(feed: AnyCatalogFeed): { subdivisions: number; buildings: number; units: number } {
  return {
    subdivisions: feed.subdivisions.length,
    buildings: feed.subdivisions.reduce((n, s) => n + s.buildings.length, 0),
    units: feed.subdivisions.reduce((n, s) => n + s.buildings.reduce((m, b) => m + b.units.length, 0), 0),
  };
}
