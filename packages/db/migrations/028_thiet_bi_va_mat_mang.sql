-- 028_thiet_bi_va_mat_mang.sql · Thiết bị và mất mạng (hàng ghi-thiet-bi-va-mat-mang): mỗi sự kiện của hàng ghi thao tác
-- làm trên máy tính hay điện thoại và có làm lúc mất mạng không; bảng lượt mất mạng ghi mỗi quãng một thiết bị mất mạng.
-- Không cột nào mang lớp nguồn; luật cách ly như listing_events.

-- ---- Sự kiện của hàng: thiết bị và dấu mất mạng ----
-- device null: sự kiện ghi trước 028, hay lời gọi không khai thiết bị. Giá trị lạ bị chặn ở đây, không chỉ ở API.
alter table listing_events add column device text check (device in ('desktop', 'mobile'));
alter table listing_events add column made_offline boolean not null default false;

-- ---- Lượt mất mạng ----
-- Mỗi dòng là một quãng một người trên một thiết bị mất mạng: từ lúc lượt gửi đầu tiên hỏng vì mạng tới lúc gửi lại được,
-- kèm số thao tác đã xếp chờ trong quãng. Máy gửi lại lượt đã ghi thì khoá duy nhất giữ một dòng.
create table offline_sessions (
  company_id  uuid not null references companies (id) on delete cascade,
  user_id     text not null,
  device      text not null check (device in ('desktop', 'mobile')),
  started_at  timestamptz not null,
  ended_at    timestamptz not null,
  queued_ops  integer not null check (queued_ops >= 0),
  recorded_at timestamptz not null default now(),
  primary key (company_id, user_id, device, started_at),
  constraint offline_sessions_ended_after_started check (ended_at >= started_at)
);
alter table offline_sessions enable row level security;
alter table offline_sessions force row level security;
create policy offline_sessions_read on offline_sessions for select using (company_id = app.current_company_id());
-- Người ghi lượt là người đang làm — không ghi hộ người khác, không ghi vào sàn khác.
create policy offline_sessions_insert on offline_sessions for insert
  with check (company_id = app.current_company_id() and user_id = app.current_user_id());
grant select, insert on offline_sessions to quy_hang_app;

-- Lượt không sửa, không xoá — ở mọi vai, kể cả chủ bảng. Ngoại lệ duy nhất: xoá dây chuyền khi gỡ cả sàn.
create or replace function app.luot_mat_mang_chi_them() returns trigger
  language plpgsql security definer set search_path = public, app
  as $$
  begin
    if tg_op = 'DELETE' and not exists (select 1 from public.companies where id = old.company_id) then
      return old;
    end if;
    raise exception 'lượt mất mạng chỉ thêm, không sửa, không xoá' using errcode = 'P0001', constraint = 'luot_mat_mang_chi_them';
  end
  $$;
create trigger luot_mat_mang_chi_them before update or delete on offline_sessions
  for each row execute function app.luot_mat_mang_chi_them();

create or replace function app.luot_mat_mang_khong_truncate() returns trigger
  language plpgsql set search_path = public, app
  as $$
  begin
    raise exception 'lượt mất mạng chỉ thêm, không truncate' using errcode = 'P0001', constraint = 'luot_mat_mang_chi_them';
  end
  $$;
create trigger luot_mat_mang_khong_truncate before truncate on offline_sessions
  for each statement execute function app.luot_mat_mang_khong_truncate();
