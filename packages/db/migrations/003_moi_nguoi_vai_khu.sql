-- 003_moi_nguoi_vai_khu.sql · Vai, khu và khu phụ trách của thành viên sàn; quản trị sàn tự quản người (ADR-0006, hàng 7).
-- Quyền ghi đặt ở luật theo dòng (chỉ quản trị của sàn đang làm), sàn luôn còn ít nhất một quản trị (trigger).

-- Năm vai của Tham chiếu §2; một người giữ được nhiều vai.
alter table company_members add column roles text[] not null default '{}';
alter table company_members add constraint company_members_roles_valid
  check (roles <@ array['telesales', 'listing_agent', 'buyer_agent', 'team_lead', 'company_admin']::text[]);

-- Người đang làm có là quản trị của sàn đang làm không. Security definer để luật ghi của company_members không tự gọi
-- lại chính nó qua luật đọc; chỉ đọc dòng của đúng người và đúng sàn đặt bằng set local.
create or replace function app.current_user_is_admin() returns boolean
  language sql stable security definer set search_path = public, app
  as $$
    select exists (
      select 1 from public.company_members
      where company_id = app.current_company_id() and user_id = app.current_user_id() and 'company_admin' = any (roles)
    )
  $$;
revoke all on function app.current_user_is_admin() from public;
grant execute on function app.current_user_is_admin() to quy_hang_app;

create policy company_members_admin_insert on company_members for insert
  with check (company_id = app.current_company_id() and app.current_user_is_admin());
create policy company_members_admin_update on company_members for update
  using (company_id = app.current_company_id() and app.current_user_is_admin())
  with check (company_id = app.current_company_id() and app.current_user_is_admin());
create policy company_members_admin_delete on company_members for delete
  using (company_id = app.current_company_id() and app.current_user_is_admin());
grant insert, update, delete on company_members to quy_hang_app;

-- Khu do sàn tự đặt tên (toà, phân khu); gắn vào danh mục ở hàng nạp danh mục.
create table company_zones (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  name       text not null check (length(btrim(name)) > 0),
  created_at timestamptz not null default now(),
  constraint company_zones_name_unique unique (company_id, name),
  constraint company_zones_company_id_unique unique (company_id, id)
);
alter table company_zones enable row level security;
alter table company_zones force row level security;
create policy company_zones_read on company_zones for select using (company_id = app.current_company_id());
create policy company_zones_admin_insert on company_zones for insert
  with check (company_id = app.current_company_id() and app.current_user_is_admin());
grant select, insert on company_zones to quy_hang_app;

-- Khu phụ trách của một thành viên. Khoá ngoại đôi giữ khu và thành viên cùng một sàn.
create table member_zones (
  company_id uuid not null,
  user_id    text not null,
  zone_id    uuid not null,
  primary key (company_id, user_id, zone_id),
  constraint member_zones_member_fkey foreign key (company_id, user_id)
    references company_members (company_id, user_id) on delete cascade,
  constraint member_zones_zone_fkey foreign key (company_id, zone_id)
    references company_zones (company_id, id) on delete cascade
);
alter table member_zones enable row level security;
alter table member_zones force row level security;
create policy member_zones_read on member_zones for select using (company_id = app.current_company_id());
create policy member_zones_admin_insert on member_zones for insert
  with check (company_id = app.current_company_id() and app.current_user_is_admin());
create policy member_zones_admin_delete on member_zones for delete
  using (company_id = app.current_company_id() and app.current_user_is_admin());
grant select, insert, delete on member_zones to quy_hang_app;

-- Sàn luôn còn ít nhất một quản trị. Khoá theo sàn trước khi đếm: hai giao dịch gỡ hai quản trị cuối cùng lúc thì
-- giao dịch sau chờ, rồi thấy kết quả của giao dịch trước. Sàn hay tài khoản đã bị xoá trong cùng giao dịch (dọn
-- dẹp, xoá dây chuyền) thì bỏ qua.
create or replace function app.giu_mot_quan_tri() returns trigger
  language plpgsql security definer set search_path = public, app
  as $$
  begin
    if not ('company_admin' = any (old.roles)) then return null; end if;
    if tg_op = 'UPDATE' and 'company_admin' = any (new.roles) then return null; end if;
    if not exists (select 1 from public.companies where id = old.company_id) then return null; end if;
    if not exists (select 1 from identity."user" where id = old.user_id) then return null; end if;
    perform pg_advisory_xact_lock(hashtext('qh-quan-tri:' || old.company_id::text));
    if not exists (
      select 1 from public.company_members where company_id = old.company_id and 'company_admin' = any (roles)
    ) then
      raise exception 'sàn cần ít nhất một quản trị' using errcode = 'P0001', constraint = 'can_mot_quan_tri';
    end if;
    return null;
  end
  $$;
create trigger giu_mot_quan_tri after update or delete on company_members
  for each row execute function app.giu_mot_quan_tri();
