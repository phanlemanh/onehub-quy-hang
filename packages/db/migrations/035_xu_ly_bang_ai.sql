-- 035_xu_ly_bang_ai.sql · «Xử lý bằng AI» (hàng 68, ADR-0011 quyết định 2, 10; Kiến trúc «Nhập dữ liệu» §7–§8): cửa ra AI
-- là một thoả thuận — loại kết nối mới `ai_processing` vào ràng buộc `kind` của `agreements` (giữ sáu loại cũ), mỗi sàn một
-- thoả thuận AI, chỉ Quản trị sàn tạo hay đổi nó; và sổ chi phí `ai_usage` chỉ thêm, theo sàn, làm trần tháng. Lớp `source`
-- vẫn bị chặn ở `agreements_never_source` (001). Số 035 do giám sát giữ chỗ (luật đợt 25).

-- ---- Loại kết nối: thay ràng buộc `kind` (tên tự đặt ở 001) bằng ràng buộc có tên, đủ bảy loại ----
do $$
declare
  r record;
begin
  for r in
    select c.conname from pg_catalog.pg_constraint c
    where c.conrelid = 'public.agreements'::regclass and c.contype = 'c'
      and pg_catalog.pg_get_constraintdef(c.oid) ilike '%kind%company_api%'
  loop
    execute format('alter table public.agreements drop constraint %I', r.conname);
  end loop;
end
$$;
alter table agreements
  add constraint agreements_kind_check
  check (kind in ('catalog_source', 'listing_channel', 'lead_source', 'spreadsheet', 'company_partnership', 'company_api', 'ai_processing'));

-- Mỗi sàn đúng một thoả thuận AI: bật lại thì dùng lại hàng cũ (đổi `status`), không chồng hàng.
create unique index agreements_mot_thoa_thuan_ai on agreements (company_id) where kind = 'ai_processing';

-- Thoả thuận AI chỉ Quản trị sàn tạo hay đổi (chặn thêm ở cơ sở dữ liệu, ngoài kiểm vai của API). Luật hạn chế: chỉ thu hẹp
-- luật đọc/ghi sẵn có của 001, không mở thêm gì; mọi thành viên vẫn ĐỌC được để đường đề xuất biết sàn đã bật chưa.
create policy agreements_ai_chi_quan_tri_them on agreements as restrictive for insert
  with check (kind <> 'ai_processing' or 'company_admin' = any (app.current_user_roles()));
create policy agreements_ai_chi_quan_tri_sua on agreements as restrictive for update
  using (kind <> 'ai_processing' or 'company_admin' = any (app.current_user_roles()))
  with check (kind <> 'ai_processing' or 'company_admin' = any (app.current_user_roles()));

-- ---- Sổ chi phí AI ----
create table ai_usage (
  company_id         uuid not null references companies (id) on delete cascade,
  id                 uuid not null default gen_random_uuid(),
  user_id            text not null,
  model              text not null,
  input_tokens       integer not null default 0 check (input_tokens >= 0),
  output_tokens      integer not null default 0 check (output_tokens >= 0),
  cache_read_tokens  integer not null default 0 check (cache_read_tokens >= 0),
  cache_write_tokens integer not null default 0 check (cache_write_tokens >= 0),
  cost_usd           numeric(10, 6) not null default 0 check (cost_usd >= 0),
  duration_ms        integer not null default 0 check (duration_ms >= 0),
  result             text not null
    constraint ai_usage_result_check
    check (result in ('ok', 'blocked_pii', 'provider_error', 'timeout', 'invalid_output')),
  -- Loại dữ liệu cá nhân máy chủ dò thấy khi chặn (phone, email, id_number, person_name) — không bao giờ chuỗi đã trúng.
  blocked_kinds      text[] not null default '{}'
    constraint ai_usage_blocked_kinds_check
    check (blocked_kinds <@ array['phone', 'email', 'id_number', 'person_name']::text[]),
  created_at         timestamptz not null default now(),
  primary key (company_id, id)
);
create index ai_usage_thang_idx on ai_usage (company_id, created_at);
alter table ai_usage enable row level security;
alter table ai_usage force row level security;
create policy ai_usage_read on ai_usage for select
  using (company_id = app.current_company_id());
create policy ai_usage_insert on ai_usage for insert
  with check (company_id = app.current_company_id() and user_id = app.current_user_id());
-- Vai API chỉ đọc và thêm: không sửa, không xoá.
grant select, insert on ai_usage to quy_hang_app;

-- Chỉ thêm ở mọi vai, kể cả chủ bảng; ngoại lệ duy nhất là xoá dây chuyền khi gỡ cả sàn (như nhật ký cấu hình 026).
create or replace function app.ai_usage_chi_them() returns trigger
  language plpgsql security definer set search_path = public, app
  as $$
  begin
    if tg_op = 'DELETE' and not exists (select 1 from public.companies where id = old.company_id) then
      return old;
    end if;
    raise exception 'sổ chi phí AI chỉ thêm, không sửa, không xoá' using errcode = 'P0001', constraint = 'ai_usage_chi_them';
  end
  $$;
create trigger ai_usage_chi_them before update or delete on ai_usage
  for each row execute function app.ai_usage_chi_them();
