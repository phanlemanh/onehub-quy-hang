-- 012_anh_can.sql · Ảnh căn ba ngăn (hàng 18, ADR-0014). Ảnh thuộc căn của sàn (toà + mã), không thuộc lần rao (luật 27).
-- Ngăn «Gửi được» (lớp shareable_listing) mọi thành viên sàn đọc; ngăn «Nội bộ» (lớp source — sổ, hợp đồng, giấy tờ) chỉ
-- đầu chủ giữ lần rao mới nhất của căn và trưởng nhóm đọc. Thêm, sửa ở mọi ngăn chỉ hai vai ấy (Hỏi-4). Luật trùng
-- `canSeeUnitInternal` của packages/core/src/photos; bộ kiểm cách ly đo cả hai bằng bang-xem-noi-bo.json.
-- Chỉ dựa vào bảng, hàm của 001–011 (chạy trước hay sau 013+ đều được — kiểm cả hai thứ tự).

-- Người giữ căn: đầu chủ được gán sau cùng của lần rao mới nhất (theo sự kiện created) của căn ở sàn đang làm.
create or replace function app.unit_holder(p_building text, p_unit text) returns text
  language sql stable security definer set search_path = ''
  as $$
    select (
      select a.user_id from public.listing_agent_assignments a
      where a.company_id = app.current_company_id() and a.listing_id = l.id
      order by a.seq desc limit 1
    )
    from public.listings l
    join public.listing_events e on e.company_id = l.company_id and e.listing_id = l.id and e.type = 'created'
    where l.company_id = app.current_company_id()
      and l.building_name = p_building
      and app.unit_key(l.unit_number) = app.unit_key(p_unit)
    order by e.occurred_at desc, l.id desc
    limit 1
  $$;
revoke all on function app.unit_holder(text, text) from public;
grant execute on function app.unit_holder(text, text) to quy_hang_app;

-- Người đang làm thấy (và sửa) ngăn nội bộ của căn không: trưởng nhóm của sàn, hoặc đầu chủ giữ căn còn vai Đầu chủ.
-- Căn chưa có lần rao thì chỉ trưởng nhóm.
create or replace function app.can_see_unit_internal(p_building text, p_unit text) returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select app.current_company_id() is not null and app.current_user_id() is not null and (
      'team_lead' = any (app.current_user_roles())
      or (
        'listing_agent' = any (app.current_user_roles())
        and app.unit_holder(p_building, p_unit) = app.current_user_id()
      )
    )
  $$;
revoke all on function app.can_see_unit_internal(text, text) from public;
grant execute on function app.can_see_unit_internal(text, text) to quy_hang_app;

create table unit_photos (
  id             uuid primary key,
  company_id     uuid not null references companies (id) on delete cascade,
  building_name  text not null check (length(btrim(building_name)) between 1 and 200),
  unit_number    text not null check (app.unit_key(unit_number) is not null),
  compartment    text not null check (compartment in ('shareable', 'internal')),
  display_order  integer not null default 0 check (display_order >= 0),
  is_cover       boolean not null default false,
  is_sample      boolean not null default false,
  taken_at       date,
  content_type   text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size      integer not null check (byte_size between 1 and 10485760),
  width          integer not null check (width > 0),
  height         integer not null check (height > 0),
  added_by       text not null,
  added_at       timestamptz not null default now(),
  removed_at     timestamptz,
  removed_by     text,
  constraint unit_photos_company_id_unique unique (company_id, id),
  -- Ảnh nội bộ không là bìa, không là «Ảnh mẫu» (AC-3, AC-4).
  constraint unit_photos_internal_plain check (compartment = 'shareable' or (not is_cover and not is_sample)),
  constraint unit_photos_removed_pair check ((removed_at is null) = (removed_by is null))
);
-- Một ảnh bìa mỗi căn, trong các ảnh còn hiệu lực.
create unique index unit_photos_one_cover on unit_photos (company_id, building_name, app.unit_key(unit_number))
  where is_cover and removed_at is null;
create index unit_photos_unit_idx on unit_photos (company_id, building_name, app.unit_key(unit_number));
alter table unit_photos enable row level security;
alter table unit_photos force row level security;
create policy unit_photos_read on unit_photos for select
  using (company_id = app.current_company_id()
         and (compartment = 'shareable' or app.can_see_unit_internal(building_name, unit_number)));
create policy unit_photos_insert on unit_photos for insert
  with check (company_id = app.current_company_id() and added_by = app.current_user_id() and removed_at is null
              and app.can_see_unit_internal(building_name, unit_number));
create policy unit_photos_update on unit_photos for update
  using (company_id = app.current_company_id() and app.can_see_unit_internal(building_name, unit_number))
  with check (company_id = app.current_company_id() and app.can_see_unit_internal(building_name, unit_number)
              and (removed_by is null or removed_by = app.current_user_id()));
-- Không có quyền xoá dòng: «Xoá khỏi căn» đặt removed_at; byte xoá hẳn ở unit_photo_files (Hỏi-6).
grant select, insert on unit_photos to quy_hang_app;
grant update (display_order, is_cover, is_sample, compartment, removed_at, removed_by) on unit_photos to quy_hang_app;

-- Byte của ảnh (bản Postgres của KhoAnh — máy dev, CI, lượt chấm; bản thật giữ ở Supabase Storage, ADR-0014).
create table unit_photo_files (
  company_id  uuid not null references companies (id) on delete cascade,
  photo_id    uuid not null,
  variant     text not null check (variant in ('original', 'thumb')),
  content     bytea not null check (octet_length(content) between 1 and 10485760),
  primary key (company_id, photo_id, variant),
  constraint unit_photo_files_photo_fkey foreign key (company_id, photo_id)
    references unit_photos (company_id, id) on delete cascade
);
alter table unit_photo_files enable row level security;
alter table unit_photo_files force row level security;
-- Đọc qua luật đọc của ảnh (truy vấn con chạy dưới luật theo dòng của unit_photos): ảnh không thấy thì byte không thấy.
create policy unit_photo_files_read on unit_photo_files for select
  using (company_id = app.current_company_id()
         and exists (select 1 from unit_photos p where p.company_id = unit_photo_files.company_id
                     and p.id = unit_photo_files.photo_id and p.removed_at is null));
create policy unit_photo_files_insert on unit_photo_files for insert
  with check (company_id = app.current_company_id()
              and exists (select 1 from unit_photos p where p.company_id = unit_photo_files.company_id
                          and p.id = unit_photo_files.photo_id and p.removed_at is null
                          and app.can_see_unit_internal(p.building_name, p.unit_number)));
create policy unit_photo_files_delete on unit_photo_files for delete
  using (company_id = app.current_company_id()
         and exists (select 1 from unit_photos p where p.company_id = unit_photo_files.company_id
                     and p.id = unit_photo_files.photo_id
                     and app.can_see_unit_internal(p.building_name, p.unit_number)));
grant select, insert, delete on unit_photo_files to quy_hang_app;

-- Sự kiện ảnh: chỉ thêm (ai, lúc nào, loại).
create table unit_photo_events (
  id             bigint generated always as identity primary key,
  company_id     uuid not null references companies (id) on delete cascade,
  photo_id       uuid not null,
  type           text not null
    check (type in ('added', 'compartment_changed', 'reordered', 'cover_set', 'sample_set', 'removed')),
  payload        jsonb not null default '{}' check (jsonb_typeof(payload) = 'object'),
  actor_user_id  text not null,
  occurred_at    timestamptz not null default now(),
  constraint unit_photo_events_photo_fkey foreign key (company_id, photo_id)
    references unit_photos (company_id, id) on delete cascade
);
create index unit_photo_events_photo_idx on unit_photo_events (company_id, photo_id);
alter table unit_photo_events enable row level security;
alter table unit_photo_events force row level security;
create policy unit_photo_events_read on unit_photo_events for select
  using (company_id = app.current_company_id()
         and exists (select 1 from unit_photos p where p.company_id = unit_photo_events.company_id
                     and p.id = unit_photo_events.photo_id));
create policy unit_photo_events_insert on unit_photo_events for insert
  with check (company_id = app.current_company_id() and actor_user_id = app.current_user_id()
              and exists (select 1 from unit_photos p where p.company_id = unit_photo_events.company_id
                          and p.id = unit_photo_events.photo_id
                          and app.can_see_unit_internal(p.building_name, p.unit_number)));
grant select, insert on unit_photo_events to quy_hang_app;
create trigger unit_photo_events_chi_them before update or delete on unit_photo_events
  for each row execute function app.nguon_chi_them();
create trigger unit_photo_events_khong_truncate before truncate on unit_photo_events
  for each statement execute function app.nguon_khong_truncate();
