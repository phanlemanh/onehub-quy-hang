-- 024_lan_nhap.sql · Lần nhập file bảng hàng (hàng 65a, ADR-0011, Kiến trúc «Nhập dữ liệu» §6, §8): `imports` giữ một lần
-- nhập (người, tệp, kế hoạch, dòng đầu của mỗi căn), `import_rows` giữ hành động từng dòng — khoá (lần nhập, số dòng) nên gửi
-- lại một gói không nhân đôi. Cả hai `company_internal`: không ô nguyên văn nào của file vào đây, kế hoạch chỉ chứa tiêu đề
-- và đích (lõi chặn bảng quy đổi của cột lớp nguồn). `listing_events.import_id` nối sự kiện với lần nhập để hoàn tác (hàng 66).

create table imports (
  company_id    uuid not null references companies (id) on delete cascade,
  id            uuid not null default gen_random_uuid(),
  created_by    text not null,
  created_roles text[] not null,
  file_name     text not null check (length(btrim(file_name)) between 1 and 255),
  file_hash     text not null check (file_hash ~ '^[0-9a-f]{64}$'),
  sheet         text check (sheet is null or length(sheet) <= 100),
  file_kind     text not null check (file_kind in ('xlsx', 'csv')),
  header_row    jsonb not null,
  plan          jsonb not null check (jsonb_typeof(plan) = 'object'),
  -- Số dòng lặp → số dòng của lần đầu căn ấy xuất hiện, tính trên cả file lúc mở (chỉ số, không tên căn).
  duplicate_rows jsonb not null default '{}' check (jsonb_typeof(duplicate_rows) = 'object'),
  status        text not null default 'planned' check (status in ('planned', 'committed')),
  created_at    timestamptz not null default now(),
  primary key (company_id, id)
);
create index imports_created_by_idx on imports (company_id, created_by, created_at);
alter table imports enable row level security;
alter table imports force row level security;
create policy imports_read on imports for select using (company_id = app.current_company_id());
create policy imports_insert on imports for insert
  with check (company_id = app.current_company_id() and created_by = app.current_user_id());
create policy imports_update on imports for update
  using (company_id = app.current_company_id() and created_by = app.current_user_id())
  with check (company_id = app.current_company_id() and created_by = app.current_user_id());
grant select, insert on imports to quy_hang_app;
grant update (status) on imports to quy_hang_app;

create table import_rows (
  company_id             uuid not null references companies (id) on delete cascade,
  import_id              uuid not null,
  row_number             integer not null check (row_number >= 0),
  action                 text not null check (action in ('create', 'update', 'supplement', 'skip')),
  reason                 text not null check (length(reason) between 1 and 300),
  listing_id             uuid,
  lead_id                uuid,
  listing_version_before integer check (listing_version_before is null or listing_version_before >= 0),
  created_at             timestamptz not null default now(),
  primary key (company_id, import_id, row_number),
  constraint import_rows_import_fkey foreign key (company_id, import_id) references imports (company_id, id) on delete cascade,
  constraint import_rows_listing_fkey foreign key (company_id, listing_id) references listings (company_id, id),
  constraint import_rows_lead_fkey foreign key (company_id, lead_id) references leads (company_id, id),
  constraint import_rows_create_has_listing check (action <> 'create' or listing_id is not null),
  constraint import_rows_update_has_listing check (action <> 'update' or listing_id is not null)
);
alter table import_rows enable row level security;
alter table import_rows force row level security;
create policy import_rows_read on import_rows for select using (company_id = app.current_company_id());
create policy import_rows_insert on import_rows for insert with check (
  company_id = app.current_company_id()
  and exists (select 1 from imports i where i.company_id = import_rows.company_id and i.id = import_rows.import_id
              and i.created_by = app.current_user_id())
);
grant select, insert on import_rows to quy_hang_app;

-- Sự kiện hàng do một lần nhập tạo mang mã lần nhập (cùng sàn — khoá ngoài theo sàn).
alter table listing_events add column import_id uuid;
alter table listing_events add constraint listing_events_import_fkey
  foreign key (company_id, import_id) references imports (company_id, id);
create index listing_events_import_idx on listing_events (company_id, import_id) where import_id is not null;
