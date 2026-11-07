-- Hàng 70 «chuẩn hoá mọi cửa»: từ điển của sàn (Kiến trúc «Nhập dữ liệu» §8, §12; sổ điểm #19 `values.aliases`).
-- Một dòng mỗi (sàn, trường, chữ gập): chữ nguyên văn của sàn → giá trị chuẩn. Người nhập file chọn gợi ý thì thành đề
-- xuất (`proposed`); quản trị sàn duyệt (`approved`) hay bỏ (`rejected`). Chỉ cách gõ đã duyệt vào chuẩn hoá. Ba trường
-- tập đóng có từ điển ở lõi; không trường lớp `source` nào. Nhật ký chỉ thêm. Lõi kiểm chữ (`kiemCachGo`) trước khi gọi.

create table company_value_aliases (
  company_id  uuid not null references companies (id) on delete cascade,
  id          uuid not null default gen_random_uuid(),
  field       text not null
    constraint company_value_aliases_field_check check (field in ('standardStatus', 'feeInclusion', 'directionFaces')),
  raw         text not null constraint company_value_aliases_raw_check check (length(btrim(raw)) between 1 and 40),
  raw_fold    text not null constraint company_value_aliases_raw_fold_check check (length(raw_fold) between 1 and 40),
  value       text not null
    constraint company_value_aliases_value_check
    check ((field = 'standardStatus' and value in ('Incomplete', 'Active', 'Pending', 'Closed', 'Hold', 'Withdrawn'))
           or (field = 'feeInclusion' and value in ('included', 'excluded'))
           or (field = 'directionFaces' and value in ('Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc'))),
  status      text not null default 'proposed'
    constraint company_value_aliases_status_check check (status in ('proposed', 'approved', 'rejected')),
  pick_count  int not null default 1 constraint company_value_aliases_pick_count_check check (pick_count >= 1),
  proposed_by text not null,
  proposed_at timestamptz not null default now(),
  decided_by  text,
  decided_at  timestamptz,
  data_class  text not null default 'company_internal'
    constraint company_value_aliases_data_class_check check (data_class = 'company_internal'),
  primary key (company_id, id),
  constraint company_value_aliases_unique unique (company_id, field, raw_fold)
);
alter table company_value_aliases enable row level security;
alter table company_value_aliases force row level security;
create policy company_value_aliases_read on company_value_aliases for select
  using (company_id = app.current_company_id());
-- Ghi chỉ qua hai hàm dưới (security definer): vai API không chèn, không sửa, không xoá thẳng.
grant select on company_value_aliases to quy_hang_app;

create table company_value_alias_events (
  company_id    uuid not null references companies (id) on delete cascade,
  id            bigint generated always as identity,
  alias_id      uuid not null,
  kind          text not null constraint company_value_alias_events_kind_check check (kind in ('proposed', 'picked', 'approved', 'rejected')),
  field         text not null,
  raw           text not null,
  value         text not null,
  actor_user_id text not null,
  actor_roles   text[] not null default '{}',
  at            timestamptz not null default now(),
  primary key (company_id, id)
);
create index company_value_alias_events_alias_idx on company_value_alias_events (company_id, alias_id, at);
alter table company_value_alias_events enable row level security;
alter table company_value_alias_events force row level security;
create policy company_value_alias_events_read on company_value_alias_events for select
  using (company_id = app.current_company_id());
grant select on company_value_alias_events to quy_hang_app;

create trigger company_value_alias_events_chi_them before update or delete on company_value_alias_events
  for each row execute function app.cau_hinh_su_kien_chi_them();
create trigger company_value_alias_events_khong_truncate before truncate on company_value_alias_events
  for each statement execute function app.cau_hinh_su_kien_khong_truncate();

-- Đề xuất: người nhập file được (đầu chủ, trưởng nhóm). Cùng chữ gập → tăng số lần chọn, giữ trạng thái đã quyết.
create or replace function app.de_xuat_cach_go(p_field text, p_raw text, p_raw_fold text, p_value text) returns uuid
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    ai text := app.current_user_id();
    vai text[] := coalesce(app.current_user_roles(), '{}'::text[]);
    ma uuid;
    moi boolean;
  begin
    if san is null or ai is null or not (vai && array['listing_agent', 'team_lead']) then
      raise exception 'chỉ người nhập file được đề xuất cách gõ' using errcode = '42501';
    end if;
    insert into public.company_value_aliases (company_id, field, raw, raw_fold, value, proposed_by)
    values (san, p_field, btrim(p_raw), p_raw_fold, p_value, ai)
    on conflict (company_id, field, raw_fold) do update set pick_count = public.company_value_aliases.pick_count + 1
    returning id, (xmax = 0) into ma, moi;
    insert into public.company_value_alias_events (company_id, alias_id, kind, field, raw, value, actor_user_id, actor_roles)
    select san, a.id, case when moi then 'proposed' else 'picked' end, a.field, btrim(p_raw), p_value, ai, vai
      from public.company_value_aliases a where a.company_id = san and a.id = ma;
    return ma;
  end
  $$;
revoke all on function app.de_xuat_cach_go(text, text, text, text) from public;
grant execute on function app.de_xuat_cach_go(text, text, text, text) to quy_hang_app;

-- Quyết: chỉ quản trị sàn. Không đụng dữ liệu căn nào.
create or replace function app.quyet_cach_go(p_id uuid, p_status text) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    ai text := app.current_user_id();
    vai text[] := coalesce(app.current_user_roles(), '{}'::text[]);
    a public.company_value_aliases%rowtype;
  begin
    if san is null or ai is null or not ('company_admin' = any (vai)) then
      raise exception 'chỉ quản trị sàn duyệt từ điển' using errcode = '42501';
    end if;
    if p_status not in ('approved', 'rejected') then
      raise exception 'status: cần approved hay rejected' using errcode = '22023';
    end if;
    update public.company_value_aliases x set status = p_status, decided_by = ai, decided_at = now()
      where x.company_id = san and x.id = p_id returning * into a;
    if not found then
      raise exception 'không có cách gõ này' using errcode = 'P0002';
    end if;
    insert into public.company_value_alias_events (company_id, alias_id, kind, field, raw, value, actor_user_id, actor_roles)
    values (san, a.id, p_status, a.field, a.raw, a.value, ai, vai);
  end
  $$;
revoke all on function app.quyet_cach_go(uuid, text) from public;
grant execute on function app.quyet_cach_go(uuid, text) to quy_hang_app;
