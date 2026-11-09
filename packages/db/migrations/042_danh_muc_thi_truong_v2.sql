-- 042_danh_muc_thi_truong_v2.sql · Khuôn «nguồn danh mục và thị trường» v2 (hàng 94, ADR-0015 sửa đổi 09/11): nhãn độ chắc từng
-- giá trị trên `catalog_units`, và hai bảng ảnh chụp mỗi khu một dòng cho số thị trường và tin rao đã khớp căn. Gói sau ghi đè cả
-- dòng, nên vai API vẫn không cần quyền xoá ở vùng dùng chung.
--
-- Số 042 do giám sát giữ cho hàng 94. Bản thật áp tệp này SAU 052, cơ sở dữ liệu mới áp TRƯỚC 043–052 (bộ chạy ghi sổ theo tên):
-- tệp chỉ dựa vào đối tượng ≤ 041 và viết lặp lại được (bài kiểm `packages/db/tests/khuon-v2.test.mjs`).

-- Danh sách khoá và nhãn trùng `CATALOG_CONFIDENCE_FIELDS`, `CATALOG_CONFIDENCE_LEVELS` của lõi.
create or replace function app.catalog_field_confidence_ok(p jsonb) returns boolean
  language sql immutable set search_path = ''
  as $$
    select p is null
        or (pg_catalog.jsonb_typeof(p) = 'object'
            and not exists (
              select 1 from pg_catalog.jsonb_each(p) as e(k, v)
               where e.k not in ('stack', 'floor', 'livingArea', 'bedroomsTotal', 'directionFaces', 'lotSizeArea', 'storiesTotal',
                                 'frontageLength', 'accessRoadWidth')
                  or e.v not in ('"inferred"'::jsonb, '"single_source"'::jsonb, '"verified"'::jsonb)))
  $$;
revoke all on function app.catalog_field_confidence_ok(jsonb) from public;
grant execute on function app.catalog_field_confidence_ok(jsonb) to quy_hang_app;

alter table catalog_units add column if not exists field_confidence jsonb;
alter table catalog_units drop constraint if exists catalog_units_field_confidence_check;
alter table catalog_units add constraint catalog_units_field_confidence_check check (app.catalog_field_confidence_ok(field_confidence));
grant select (field_confidence) on catalog_units to quy_hang_app;

create table if not exists catalog_market_snapshots (
  subdivision_key text primary key references catalog_subdivisions (subdivision_key),
  provider        text not null,
  measured_at     timestamptz not null,
  agreement_id    uuid not null references agreements (id),
  segments        jsonb not null,
  updated_at      timestamptz not null default now(),
  constraint catalog_market_snapshots_segments_array check (jsonb_typeof(segments) = 'array')
);
create table if not exists catalog_public_listing_snapshots (
  subdivision_key text primary key references catalog_subdivisions (subdivision_key),
  provider        text not null,
  measured_at     timestamptz not null,
  agreement_id    uuid not null references agreements (id),
  listings        jsonb not null,
  updated_at      timestamptz not null default now(),
  constraint catalog_public_listing_snapshots_listings_array check (jsonb_typeof(listings) = 'array')
);

alter table catalog_market_snapshots enable row level security;
alter table catalog_market_snapshots force row level security;
alter table catalog_public_listing_snapshots enable row level security;
alter table catalog_public_listing_snapshots force row level security;

drop policy if exists catalog_market_snapshots_read on catalog_market_snapshots;
create policy catalog_market_snapshots_read on catalog_market_snapshots for select using (true);
drop policy if exists catalog_market_snapshots_insert on catalog_market_snapshots;
create policy catalog_market_snapshots_insert on catalog_market_snapshots for insert
  with check (app.catalog_source_active(agreement_id));
drop policy if exists catalog_market_snapshots_update on catalog_market_snapshots;
create policy catalog_market_snapshots_update on catalog_market_snapshots for update
  using (true)
  with check (app.catalog_source_active(agreement_id));

drop policy if exists catalog_public_listing_snapshots_read on catalog_public_listing_snapshots;
create policy catalog_public_listing_snapshots_read on catalog_public_listing_snapshots for select using (true);
drop policy if exists catalog_public_listing_snapshots_insert on catalog_public_listing_snapshots;
create policy catalog_public_listing_snapshots_insert on catalog_public_listing_snapshots for insert
  with check (app.catalog_source_active(agreement_id));
drop policy if exists catalog_public_listing_snapshots_update on catalog_public_listing_snapshots;
create policy catalog_public_listing_snapshots_update on catalog_public_listing_snapshots for update
  using (true)
  with check (app.catalog_source_active(agreement_id));

-- Vai API đọc đủ để câu ghi có điều kiện theo mốc đo; nội dung và thoả thuận chưa ai đọc được, hàng 102 mở kèm luật vai.
-- Không cấp delete.
grant select (subdivision_key, measured_at), insert, update on catalog_market_snapshots to quy_hang_app;
grant select (subdivision_key, measured_at), insert, update on catalog_public_listing_snapshots to quy_hang_app;
