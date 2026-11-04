-- 026_cau_hinh_su_kien.sql · Nhật ký cấu hình sàn (hàng 82 cau-hinh-theo-san, ADR-0018 quyết định 3; Tham chiếu §4
-- «mọi thay đổi vào nhật ký»): mỗi lần ghi `company_settings` — qua bất kỳ lối nào — thêm đúng một sự kiện chỉ thêm ghi
-- khoá, giá trị, lớp, người và vai. Cả hai bảng mang lớp dữ liệu và cơ sở dữ liệu chặn lớp `source` (bất biến 2).
-- Số 026 do giám sát giữ chỗ (luật đợt 25).

-- ---- Lớp dữ liệu của dòng cấu hình: mọi lớp trừ source ----
alter table company_settings
  add column data_class text not null default 'company_internal'
    constraint company_settings_data_class_check
    check (data_class in ('catalog', 'shareable_listing', 'company_internal', 'custom_field', 'transaction', 'behavior'));

-- ---- Nhật ký ----
create table company_settings_events (
  company_id    uuid not null references companies (id) on delete cascade,
  id            bigint generated always as identity,
  key           text not null,
  value         jsonb not null,
  data_class    text not null
    constraint company_settings_events_data_class_check
    check (data_class in ('catalog', 'shareable_listing', 'company_internal', 'custom_field', 'transaction', 'behavior')),
  actor_user_id text not null,
  actor_roles   text[] not null default '{}',
  at            timestamptz not null default now(),
  primary key (company_id, id)
);
create index company_settings_events_key_idx on company_settings_events (company_id, key, at);
alter table company_settings_events enable row level security;
alter table company_settings_events force row level security;
create policy company_settings_events_read on company_settings_events for select
  using (company_id = app.current_company_id());
-- Chỉ hàm ghi nhật ký (chủ bảng) chèn được; vẫn trong sàn hiện hành.
create policy company_settings_events_insert on company_settings_events for insert
  with check (company_id = app.current_company_id());
-- Vai API chỉ đọc: không chèn thẳng, không sửa, không xoá.
grant select on company_settings_events to quy_hang_app;

-- Chỉ thêm ở mọi vai, kể cả chủ bảng; ngoại lệ duy nhất là xoá dây chuyền khi gỡ cả sàn (như listing_events).
create or replace function app.cau_hinh_su_kien_chi_them() returns trigger
  language plpgsql security definer set search_path = public, app
  as $$
  begin
    if tg_op = 'DELETE' and not exists (select 1 from public.companies where id = old.company_id) then
      return old;
    end if;
    raise exception 'nhật ký cấu hình chỉ thêm, không sửa, không xoá' using errcode = 'P0001', constraint = 'cau_hinh_su_kien_chi_them';
  end
  $$;
create trigger cau_hinh_su_kien_chi_them before update or delete on company_settings_events
  for each row execute function app.cau_hinh_su_kien_chi_them();

create or replace function app.cau_hinh_su_kien_khong_truncate() returns trigger
  language plpgsql set search_path = public, app
  as $$
  begin
    raise exception 'nhật ký cấu hình chỉ thêm, không truncate' using errcode = 'P0001', constraint = 'cau_hinh_su_kien_chi_them';
  end
  $$;
create trigger cau_hinh_su_kien_khong_truncate before truncate on company_settings_events
  for each statement execute function app.cau_hinh_su_kien_khong_truncate();

-- Mọi dòng ghi vào company_settings sinh một sự kiện: người là updated_by (luật ghi của 011 buộc bằng người đang làm),
-- vai đọc lúc ghi.
create or replace function app.cau_hinh_ghi_nhat_ky() returns trigger
  language plpgsql security definer set search_path = ''
  as $$
  begin
    insert into public.company_settings_events (company_id, key, value, data_class, actor_user_id, actor_roles)
    values (new.company_id, new.key, new.value, new.data_class, new.updated_by, coalesce(app.current_user_roles(), '{}'::text[]));
    return new;
  end
  $$;
revoke all on function app.cau_hinh_ghi_nhat_ky() from public;
create trigger cau_hinh_ghi_nhat_ky after insert or update on company_settings
  for each row execute function app.cau_hinh_ghi_nhat_ky();

-- ---- Chép bù: dòng cấu hình có trước 026 mỗi dòng một sự kiện; vai lúc ấy không biết nên rỗng ----
-- Chủ bảng tạm không ép luật theo dòng để chép cho mọi sàn trong một lệnh, rồi ép lại ngay.
alter table company_settings_events no force row level security;
insert into company_settings_events (company_id, key, value, data_class, actor_user_id, actor_roles, at)
  select s.company_id, s.key, s.value, s.data_class, s.updated_by, '{}'::text[], s.updated_at
  from company_settings s
  order by s.updated_at, s.company_id, s.key;
alter table company_settings_events force row level security;
