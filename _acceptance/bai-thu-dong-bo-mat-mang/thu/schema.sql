-- Bảng mẫu của bài thử đồng bộ — KHÔNG phải migration của kho (luật đợt 5). Áp lên Postgres của dãy sau 001_nen_cong_ty.sql
-- (cần app.current_company_id() và vai quy_hang_app). Áp lại được: xoá schema rồi dựng lại.
drop schema if exists thu_dong_bo cascade;
create schema thu_dong_bo;
grant usage on schema thu_dong_bo to quy_hang_app;

-- Người và vai của phiên: máy chủ đặt `set_config('app.user_id' / 'app.role', …, true)` trong mỗi giao dịch.
create function thu_dong_bo.nguoi() returns text language sql stable
  as $$ select nullif(current_setting('app.user_id', true), '') $$;
create function thu_dong_bo.vai() returns text language sql stable
  as $$ select nullif(current_setting('app.role', true), '') $$;
grant execute on function thu_dong_bo.nguoi(), thu_dong_bo.vai() to quy_hang_app;

-- Căn: lớp nội bộ của sàn. Không có cột số chủ.
create table thu_dong_bo.listings (
  id          text primary key,
  company_id  uuid not null,
  unit_code   text not null,
  price       numeric not null,
  owner_agent text not null,
  label       text not null default 'Mẫu'
);

-- Số chủ: lớp nguồn. Chỉ đầu chủ giữ căn và trưởng nhóm của sàn thấy. Không bao giờ vào sổ thay đổi.
create table thu_dong_bo.owner_contacts (
  listing_id  text primary key references thu_dong_bo.listings (id),
  company_id  uuid not null,
  owner_agent text not null,
  phone       text not null
);

-- Sổ thay đổi chỉ thêm: máy kéo các dòng có seq lớn hơn mốc của mình.
create table thu_dong_bo.changes (
  seq        bigserial primary key,
  company_id uuid not null,
  listing_id text not null,
  price      numeric not null,
  by_user    text,
  client_id  text,
  client_seq integer,
  op_id      uuid,
  at         timestamptz not null default now()
);

-- Khoá chống trùng: mỗi thao tác của máy chỉ áp một lần.
create table thu_dong_bo.applied_ops (
  op_id      uuid primary key,
  company_id uuid not null,
  seq        bigint not null
);

alter table thu_dong_bo.listings enable row level security;
alter table thu_dong_bo.listings force row level security;
alter table thu_dong_bo.owner_contacts enable row level security;
alter table thu_dong_bo.owner_contacts force row level security;
alter table thu_dong_bo.changes enable row level security;
alter table thu_dong_bo.changes force row level security;
alter table thu_dong_bo.applied_ops enable row level security;
alter table thu_dong_bo.applied_ops force row level security;

create policy listings_san on thu_dong_bo.listings for all
  using (company_id = app.current_company_id()) with check (company_id = app.current_company_id());
create policy changes_san on thu_dong_bo.changes for all
  using (company_id = app.current_company_id()) with check (company_id = app.current_company_id());
create policy applied_san on thu_dong_bo.applied_ops for all
  using (company_id = app.current_company_id()) with check (company_id = app.current_company_id());
create policy contacts_vai on thu_dong_bo.owner_contacts for select
  using (company_id = app.current_company_id()
         and (owner_agent = thu_dong_bo.nguoi() or thu_dong_bo.vai() = 'truong-nhom'));

grant select, update on thu_dong_bo.listings to quy_hang_app;
grant select on thu_dong_bo.owner_contacts to quy_hang_app;
grant select, insert on thu_dong_bo.changes, thu_dong_bo.applied_ops to quy_hang_app;
grant usage on sequence thu_dong_bo.changes_seq_seq to quy_hang_app;
