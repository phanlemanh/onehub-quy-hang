-- 010_danh_muc_dung_chung.sql · Vùng danh mục dùng chung: khu, căn từ nguồn danh mục (OneHub Invest) theo khuôn v1
-- (kế hoạch «Nhận danh mục Invest», ADR-0015). Danh mục là lớp `catalog` — mọi sàn đọc chung, không có dữ liệu chủ nhà.
-- Chỉ ghi được khi sàn đang đặt nằm trong danh sách tin VÀ ghi bằng một thoả thuận `catalog_source` chiều vào đang hiệu
-- lực của chính sàn ấy. Chặn ở cơ sở dữ liệu, không chỉ ở đường nhận của API. Không ai xoá được.

-- Danh sách sàn được tin làm nguồn danh mục. Chỉ chủ bảng (vận hành) thêm; vai API chỉ đọc.
create table catalog_trusted_companies (
  company_id uuid primary key references companies (id)
);
alter table catalog_trusted_companies enable row level security;
alter table catalog_trusted_companies force row level security;
create policy catalog_trusted_companies_read on catalog_trusted_companies for select using (true);
grant select on catalog_trusted_companies to quy_hang_app;

-- Thoả thuận `agreement_id` cho phép ghi danh mục không: sàn đang đặt được tin, thoả thuận là của sàn ấy, đúng loại
-- `catalog_source`, chiều vào, đang bật, trong hạn và mang lớp `catalog`. Security invoker: luật theo dòng của
-- agreements vẫn áp, sàn không mượn được thoả thuận của sàn khác.
create or replace function app.catalog_source_active(p_agreement_id uuid) returns boolean
  language sql stable security invoker set search_path = ''
  as $$
    select exists (select 1 from public.catalog_trusted_companies t where t.company_id = app.current_company_id())
       and exists (
         select 1 from public.agreements a
         where a.id = p_agreement_id
           and a.company_id = app.current_company_id()
           and a.kind = 'catalog_source'
           and a.direction = 'inbound'
           and a.status = 'active'
           and a.valid_from <= now()
           and (a.valid_until is null or now() < a.valid_until)
           and 'catalog' = any (a.data_classes)
       )
  $$;
grant execute on function app.catalog_source_active(uuid) to quy_hang_app;

-- Khu (dự án). Tên theo RESO: SubdivisionName; khoá của nguồn ở subdivision_key.
create table catalog_subdivisions (
  subdivision_key  text primary key,
  subdivision_name text not null,
  complex_name     text,
  provider         text not null,
  measured_at      timestamptz not null,
  agreement_id     uuid not null references agreements (id),
  updated_at       timestamptz not null default now()
);

-- Căn. Khoá là UPI của nguồn; tên cột theo RESO (BuildingName, UnitNumber, LivingArea, BedroomsTotal, DirectionFaces,
-- PropertyType, PropertySubType, LotSizeArea, StoriesTotal, FrontageLength). `stack` (trục căn) và
-- `access_road_width` (độ rộng đường vào) là đặc trưng Việt Nam.
create table catalog_units (
  upi               text primary key,
  subdivision_key   text not null references catalog_subdivisions (subdivision_key),
  building_key      text not null,
  building_name     text not null,
  unit_number       text not null,
  stack             text,
  floor             int,
  living_area       numeric,
  bedrooms_total    int,
  direction_faces   text,
  property_type     text not null,
  property_sub_type text not null,
  lot_size_area     numeric,
  stories_total     int,
  frontage_length   numeric,
  access_road_width numeric,
  provider          text not null,
  measured_at       timestamptz not null,
  agreement_id      uuid not null references agreements (id),
  updated_at        timestamptz not null default now()
);
create index catalog_units_subdivision_idx on catalog_units (subdivision_key);

alter table catalog_subdivisions enable row level security;
alter table catalog_subdivisions force row level security;
create policy catalog_subdivisions_read on catalog_subdivisions for select using (true);
create policy catalog_subdivisions_insert on catalog_subdivisions for insert
  with check (app.catalog_source_active(agreement_id));
create policy catalog_subdivisions_update on catalog_subdivisions for update
  using (true)
  with check (app.catalog_source_active(agreement_id));
-- Không cấp delete: danh mục không xoá qua vai API.
grant select, insert, update on catalog_subdivisions to quy_hang_app;

alter table catalog_units enable row level security;
alter table catalog_units force row level security;
create policy catalog_units_read on catalog_units for select using (true);
create policy catalog_units_insert on catalog_units for insert
  with check (app.catalog_source_active(agreement_id));
create policy catalog_units_update on catalog_units for update
  using (true)
  with check (app.catalog_source_active(agreement_id));
grant select, insert, update on catalog_units to quy_hang_app;
