-- 004_loi_hang_va_su_kien.sql · Hàng và sự kiện của hàng (Tham chiếu §4–§5, Kiến trúc §1, ADR-0008, hàng 8).
-- Sự kiện chỉ thêm; bảng hàng là bản tính ra từ sự kiện, ghi cùng giao dịch bởi lệnh API duy nhất. Thông tin chủ nhà
-- (lớp source) không có cột nào ở đây — bảng riêng ở hàng chủ nhà.

-- Sự kiện: nguồn sự thật của hàng. (company_id, listing_id, seq) duy nhất — hai lệnh đồng thời không cùng một seq.
create table listing_events (
  company_id           uuid not null references companies (id) on delete cascade,
  listing_id           uuid not null,
  seq                  integer not null check (seq > 0),
  type                 text not null
    check (type in ('created', 'details_changed', 'price_changed', 'status_changed', 'owner_confirmed')),
  payload              jsonb not null check (jsonb_typeof(payload) = 'object'),
  actor_user_id        text not null,
  actor_roles          text[] not null,
  confirmed_with_owner boolean not null,
  occurred_at          timestamptz not null default now(),
  primary key (company_id, listing_id, seq)
);
alter table listing_events enable row level security;
alter table listing_events force row level security;
create policy listing_events_read on listing_events for select using (company_id = app.current_company_id());
-- Người ghi sự kiện là người đang làm — không ghi hộ tên người khác.
create policy listing_events_insert on listing_events for insert
  with check (company_id = app.current_company_id() and actor_user_id = app.current_user_id());
grant select, insert on listing_events to quy_hang_app;

-- Sự kiện không sửa, không xoá — ở mọi vai, kể cả chủ bảng. Ngoại lệ duy nhất: sàn bị xoá (xoá dây chuyền khi gỡ cả
-- sàn), khi đó dòng sàn đã không còn.
create or replace function app.su_kien_chi_them() returns trigger
  language plpgsql security definer set search_path = public, app
  as $$
  begin
    if tg_op = 'DELETE' and not exists (select 1 from public.companies where id = old.company_id) then
      return old;
    end if;
    raise exception 'sự kiện của hàng chỉ thêm, không sửa, không xoá' using errcode = 'P0001', constraint = 'su_kien_chi_them';
  end
  $$;
create trigger su_kien_chi_them before update or delete on listing_events
  for each row execute function app.su_kien_chi_them();

create or replace function app.su_kien_khong_truncate() returns trigger
  language plpgsql set search_path = public, app
  as $$
  begin
    raise exception 'sự kiện của hàng chỉ thêm, không truncate' using errcode = 'P0001', constraint = 'su_kien_chi_them';
  end
  $$;
create trigger su_kien_khong_truncate before truncate on listing_events
  for each statement execute function app.su_kien_khong_truncate();

-- Bản tính của hàng: mọi cột tính lại được từ listing_events bằng foldListing của packages/core. Tên theo RESO khi có.
create table listings (
  id                uuid primary key,
  company_id        uuid not null references companies (id) on delete cascade,
  building_name     text not null,
  unit_number       text,
  standard_status   text not null
    check (standard_status in ('Incomplete', 'Active', 'Pending', 'Closed', 'Hold', 'Withdrawn')),
  list_price        bigint check (list_price > 0),
  fee_inclusion     text check (fee_inclusion in ('included', 'excluded')),
  furnished         text,
  legal_status      text,
  financing         text,
  occupant_type     text,
  close_price       bigint check (close_price > 0),
  close_date        date,
  withdrawn_reason  text check (withdrawn_reason in ('sold_elsewhere', 'owner_changed_mind', 'unreachable')),
  last_confirmed_at timestamptz,
  version           integer not null check (version > 0),
  constraint listings_company_id_unique unique (company_id, id),
  -- Đã bán bắt buộc giá chốt; ngừng hẳn bắt buộc lý do (Tham chiếu §5) — chặn thêm ở cơ sở dữ liệu.
  constraint listings_closed_has_price check (standard_status <> 'Closed' or (close_price is not null and close_date is not null)),
  constraint listings_withdrawn_has_reason check (standard_status <> 'Withdrawn' or withdrawn_reason is not null)
);
alter table listings enable row level security;
alter table listings force row level security;
create policy listings_read on listings for select using (company_id = app.current_company_id());
create policy listings_insert on listings for insert with check (company_id = app.current_company_id());
create policy listings_update on listings for update
  using (company_id = app.current_company_id()) with check (company_id = app.current_company_id());
grant select, insert, update on listings to quy_hang_app;
