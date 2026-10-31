-- 006_lop_truong_nguon.sql · Lớp trường nguồn: đầu chủ giữ căn, chủ nhà của hàng, sự kiện mở số (Tham chiếu §6, bất biến 2,
-- hàng 11, ADR-0010). Chủ nhà, số chủ, giá đáy chỉ đầu chủ giữ căn và trưởng nhóm thấy; số chủ không đọc thẳng được — chỉ
-- ra qua hàm mở số, và hàm luôn ghi một sự kiện trước khi trả. Luật này trùng `canSeeSource` của packages/core; bộ kiểm
-- cách ly đo cả hai bằng cùng một bảng 12 ô.

-- Vai của người đang làm ở sàn đang làm. Security definer, khoá search_path: luật theo dòng gọi hàm này mà không tự gọi
-- lại luật đọc của company_members.
create or replace function app.current_user_roles() returns text[]
  language sql stable security definer set search_path = ''
  as $$
    select coalesce(
      (select m.roles from public.company_members m
       where m.company_id = app.current_company_id() and m.user_id = app.current_user_id()),
      '{}'::text[])
  $$;
revoke all on function app.current_user_roles() from public;
grant execute on function app.current_user_roles() to quy_hang_app;

-- Một thành viên của sàn đang làm có vai đó không.
create or replace function app.member_has_role(p_user text, p_role text) returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select exists (
      select 1 from public.company_members m
      where m.company_id = app.current_company_id() and m.user_id = p_user and p_role = any (m.roles)
    )
  $$;
revoke all on function app.member_has_role(text, text) from public;
grant execute on function app.member_has_role(text, text) to quy_hang_app;

-- Gán đầu chủ cho hàng: chỉ thêm, mỗi lần gán một dòng; đầu chủ giữ căn là dòng có seq lớn nhất. Lớp nội bộ công ty —
-- mọi thành viên sàn đọc được, để biết liên hệ ai.
create table listing_agent_assignments (
  company_id  uuid not null references companies (id) on delete cascade,
  listing_id  uuid not null,
  seq         integer not null check (seq > 0),
  user_id     text not null,
  assigned_by text not null,
  assigned_at timestamptz not null default now(),
  primary key (company_id, listing_id, seq),
  constraint listing_agent_assignments_listing_fkey foreign key (company_id, listing_id)
    references listings (company_id, id) on delete cascade
);

-- Hàng đã có đầu chủ chưa (đọc bỏ qua luật theo dòng, chỉ trong sàn đang làm).
create or replace function app.listing_has_agent(p_listing uuid) returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select exists (
      select 1 from public.listing_agent_assignments a
      where a.company_id = app.current_company_id() and a.listing_id = p_listing
    )
  $$;
revoke all on function app.listing_has_agent(uuid) from public;
grant execute on function app.listing_has_agent(uuid) to quy_hang_app;

alter table listing_agent_assignments enable row level security;
alter table listing_agent_assignments force row level security;
create policy listing_agent_assignments_read on listing_agent_assignments for select
  using (company_id = app.current_company_id());
-- Người nhận phải có vai Đầu chủ. Trưởng nhóm gán, gán lại; đầu chủ chỉ tự nhận hàng chưa có ai giữ (Hỏi-3).
create policy listing_agent_assignments_insert on listing_agent_assignments for insert
  with check (
    company_id = app.current_company_id()
    and assigned_by = app.current_user_id()
    and app.member_has_role(user_id, 'listing_agent')
    and (
      'team_lead' = any (app.current_user_roles())
      or (user_id = app.current_user_id() and not app.listing_has_agent(listing_id))
    )
  );
grant select, insert on listing_agent_assignments to quy_hang_app;

-- Người đang làm thấy nguồn của hàng không: hàng thuộc sàn đang làm, và người là trưởng nhóm, hoặc là đầu chủ giữ căn
-- còn vai Đầu chủ.
create or replace function app.can_see_source(p_listing uuid) returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select exists (select 1 from public.listings l where l.company_id = app.current_company_id() and l.id = p_listing)
      and (
        'team_lead' = any (app.current_user_roles())
        or (
          'listing_agent' = any (app.current_user_roles())
          and (
            select a.user_id from public.listing_agent_assignments a
            where a.company_id = app.current_company_id() and a.listing_id = p_listing
            order by a.seq desc limit 1
          ) = app.current_user_id()
        )
      )
  $$;
revoke all on function app.can_see_source(uuid) from public;
grant execute on function app.can_see_source(uuid) to quy_hang_app;

-- Chủ nhà của hàng: lớp nguồn, không bao giờ rời công ty. Không là cột của hàng (Kiến trúc §1).
create table listing_owners (
  company_id  uuid not null references companies (id) on delete cascade,
  listing_id  uuid not null,
  owner_name  text not null check (length(btrim(owner_name)) between 1 and 200),
  owner_phone text check (owner_phone ~ '^0[0-9]{9}$'),
  floor_price bigint check (floor_price > 0),
  has_phone   boolean generated always as (owner_phone is not null) stored,
  updated_by  text not null,
  updated_at  timestamptz not null default now(),
  primary key (company_id, listing_id),
  constraint listing_owners_listing_fkey foreign key (company_id, listing_id)
    references listings (company_id, id) on delete cascade
);
alter table listing_owners enable row level security;
alter table listing_owners force row level security;
create policy listing_owners_read on listing_owners for select
  using (company_id = app.current_company_id() and app.can_see_source(listing_id));
create policy listing_owners_insert on listing_owners for insert
  with check (company_id = app.current_company_id() and app.can_see_source(listing_id) and updated_by = app.current_user_id());
create policy listing_owners_update on listing_owners for update
  using (company_id = app.current_company_id() and app.can_see_source(listing_id))
  with check (company_id = app.current_company_id() and app.can_see_source(listing_id) and updated_by = app.current_user_id());
-- Cột số chủ KHÔNG cấp quyền đọc cho vai API, kể cả với đầu chủ giữ căn: số chỉ ra qua app.reveal_owner_phone.
grant select (company_id, listing_id, owner_name, floor_price, has_phone, updated_by, updated_at) on listing_owners to quy_hang_app;
grant insert (company_id, listing_id, owner_name, owner_phone, floor_price, updated_by) on listing_owners to quy_hang_app;
grant update (owner_name, owner_phone, floor_price, updated_by, updated_at) on listing_owners to quy_hang_app;

-- Sự kiện mở số chủ: chỉ thêm, chỉ hàm mở số ghi. Người mở thấy dòng của mình; trưởng nhóm thấy cả sàn.
create table owner_phone_reveals (
  id            bigint generated always as identity primary key,
  company_id    uuid not null references companies (id) on delete cascade,
  listing_id    uuid not null,
  actor_user_id text not null,
  actor_roles   text[] not null,
  occurred_at   timestamptz not null default now(),
  constraint owner_phone_reveals_listing_fkey foreign key (company_id, listing_id)
    references listings (company_id, id) on delete cascade
);
create index owner_phone_reveals_listing_idx on owner_phone_reveals (company_id, listing_id);
alter table owner_phone_reveals enable row level security;
alter table owner_phone_reveals force row level security;
create policy owner_phone_reveals_read on owner_phone_reveals for select
  using (company_id = app.current_company_id()
         and (actor_user_id = app.current_user_id() or 'team_lead' = any (app.current_user_roles())));
-- Luật thêm cho hàm mở số (chạy bằng vai chủ của hàm); vai API không có quyền insert.
create policy owner_phone_reveals_insert on owner_phone_reveals for insert
  with check (company_id = app.current_company_id() and actor_user_id = app.current_user_id());
grant select on owner_phone_reveals to quy_hang_app;

-- Hai bảng chỉ thêm — ở mọi vai, kể cả chủ bảng. Ngoại lệ: sàn bị xoá (xoá dây chuyền khi gỡ cả sàn).
create or replace function app.nguon_chi_them() returns trigger
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if tg_op = 'DELETE' and not exists (select 1 from public.companies where id = old.company_id) then
      return old;
    end if;
    raise exception '% chỉ thêm, không sửa, không xoá', tg_table_name using errcode = 'P0001', constraint = 'nguon_chi_them';
  end
  $$;
create or replace function app.nguon_khong_truncate() returns trigger
  language plpgsql set search_path = ''
  as $$
  begin
    raise exception '% chỉ thêm, không truncate', tg_table_name using errcode = 'P0001', constraint = 'nguon_chi_them';
  end
  $$;
create trigger owner_phone_reveals_chi_them before update or delete on owner_phone_reveals
  for each row execute function app.nguon_chi_them();
create trigger owner_phone_reveals_khong_truncate before truncate on owner_phone_reveals
  for each statement execute function app.nguon_khong_truncate();
create trigger listing_agent_assignments_chi_them before update or delete on listing_agent_assignments
  for each row execute function app.nguon_chi_them();
create trigger listing_agent_assignments_khong_truncate before truncate on listing_agent_assignments
  for each statement execute function app.nguon_khong_truncate();

-- Cửa DUY NHẤT ra số chủ: xét quyền, ghi một sự kiện mở số, rồi trả số. Mã hoá số (hàng sau, trước dữ liệu thật) chỉ đổi
-- thân hàm này và cột owner_phone.
create or replace function app.reveal_owner_phone(p_listing uuid) returns text
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v_phone text;
  begin
    if app.current_company_id() is null or app.current_user_id() is null or not app.can_see_source(p_listing) then
      raise exception 'không có quyền mở số chủ' using errcode = '42501';
    end if;
    select o.owner_phone into v_phone from public.listing_owners o
      where o.company_id = app.current_company_id() and o.listing_id = p_listing;
    if v_phone is null then
      raise exception 'chưa có số chủ' using errcode = 'P0002';
    end if;
    insert into public.owner_phone_reveals (company_id, listing_id, actor_user_id, actor_roles)
      values (app.current_company_id(), p_listing, app.current_user_id(), app.current_user_roles());
    return v_phone;
  end
  $$;
revoke all on function app.reveal_owner_phone(uuid) from public;
grant execute on function app.reveal_owner_phone(uuid) to quy_hang_app;

-- Lớp chặn thứ hai sau khuôn chặt của lõi: sự kiện của hàng không mang khoá lớp nguồn ở cấp đầu.
alter table listing_events add constraint listing_events_no_source
  check (not (payload ?| array['ownerName', 'ownerPhone', 'floorPrice', 'titleDeedPhoto']));
