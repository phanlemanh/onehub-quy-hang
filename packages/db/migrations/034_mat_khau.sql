-- 034_mat_khau.sql · Mật khẩu do sàn cấp (hàng dang-nhap-mat-khau, ADR-0005 bổ sung 04/11). Băm mật khẩu vẫn ở
-- identity.account như better-auth đọc; ba bảng dưới giữ trạng thái quanh nó: mật khẩu tạm và mã đổi, đếm thử sai,
-- và sự kiện cấp/đổi/vô hiệu. Cả ba thuộc danh tính, không thuộc công ty nào: nằm ở schema `identity`, vai API không
-- đọc không ghi (như 029). Quản trị cấp mật khẩu tạm qua một hàm security definer — luật «chỉ cấp cho người chỉ thuộc
-- sàn mình» nằm ở cơ sở dữ liệu, không ở API — và lời mời vào sàn khác vô hiệu mật khẩu có gốc sàn cấp.

-- Một dòng mỗi người đã có mật khẩu. `origin`: mật khẩu đang dùng có gốc từ lần sàn cấp (mật khẩu tạm, hay mật khẩu đặt
-- lần đầu từ mật khẩu tạm ấy) hay do người tự đổi ở Cá nhân. `issued_company_id`: sàn đã cấp, để lời mời lại vào đúng
-- sàn ấy không vô hiệu. Mã đổi chỉ lưu băm sha256 hex.
create table identity.password_state (
  user_id                 text primary key references identity."user" ("id") on delete cascade,
  kind                    text not null check (kind in ('tam', 'tu-dat')),
  origin                  text not null check (origin in ('san-cap', 'tu-doi')),
  issued_company_id       uuid references companies (id) on delete set null,
  temp_expires_at         timestamptz,
  change_token_hash       text check (change_token_hash ~ '^[0-9a-f]{64}$'),
  change_token_expires_at timestamptz,
  failed_streak           integer not null default 0 check (failed_streak >= 0),
  disabled_at             timestamptz,
  disabled_reason         text check (disabled_reason in ('khoa-20', 'bao-mat-may', 'vao-san-khac')),
  updated_at              timestamptz not null default now(),
  check ((disabled_at is null) = (disabled_reason is null)),
  check (kind <> 'tam' or temp_expires_at is not null),
  check ((change_token_hash is null) = (change_token_expires_at is null))
);
create unique index password_state_change_token_idx on identity.password_state (change_token_hash)
  where change_token_hash is not null;

-- Mỗi lần thử sai một dòng, đếm cửa sổ theo email — email lạ đếm như email thật (cùng khuôn otp_requests).
create table identity.password_failures (
  email text not null,
  at    timestamptz not null default now()
);
create index password_failures_email_at_idx on identity.password_failures (email, at);

-- Ai, cho ai, lúc nào, loại gì. Không cột nào chứa mật khẩu hay băm. `company_id` có khi quản trị cấp hay lời mời vô
-- hiệu; người thuộc nhiều sàn tự đổi thì không có sàn.
create table identity.password_events (
  id            bigint generated always as identity primary key,
  user_id       text not null references identity."user" ("id") on delete cascade,
  company_id    uuid references companies (id) on delete set null,
  actor_user_id text,
  kind          text not null check (kind in ('cap', 'doi', 'dat-lan-dau', 'vo-hieu-bao-mat', 'khoa-20', 'vo-hieu-san-khac')),
  at            timestamptz not null default now()
);
create index password_events_user_idx on identity.password_events (user_id, at);

revoke all on identity.password_state, identity.password_failures, identity.password_events from public;
revoke all on identity.password_state, identity.password_failures, identity.password_events from quy_hang_app;

-- Quản trị sàn đang làm cấp mật khẩu tạm (băm sẵn ở API bằng hàm của better-auth) cho người CHỈ thuộc sàn ấy.
-- 42501: không phải quản trị; P0002: không phải thành viên sàn đang làm; QH409: còn thuộc sàn khác. Khoá tư vấn theo
-- người: lời mời vào sàn khác chạy cùng lúc phải chờ (trigger dưới lấy cùng khoá). Thu mọi phiên của người được cấp.
create or replace function app.cap_mat_khau_tam(p_user text, p_hash text, p_expires timestamptz) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v_company uuid := app.current_company_id();
  begin
    perform pg_advisory_xact_lock(hashtextextended('mat-khau:' || p_user, 0));
    if v_company is null or app.current_user_id() is null or not app.current_user_is_admin() then
      raise exception 'chỉ quản trị sàn cấp được mật khẩu' using errcode = '42501';
    end if;
    if not exists (select 1 from public.company_members where company_id = v_company and user_id = p_user) then
      raise exception 'không có người này trong sàn' using errcode = 'P0002';
    end if;
    if exists (select 1 from public.company_members where user_id = p_user and company_id <> v_company) then
      raise exception 'user_in_other_company' using errcode = 'QH409';
    end if;
    if p_hash is null or length(p_hash) = 0 or p_expires <= now() then
      raise exception 'mật khẩu tạm không hợp lệ' using errcode = '22023';
    end if;

    update identity.account set "password" = p_hash, "updatedAt" = now()
      where "userId" = p_user and "providerId" = 'credential';
    if not found then
      insert into identity.account ("id", "accountId", "providerId", "userId", "password", "updatedAt")
        values (gen_random_uuid()::text, p_user, 'credential', p_user, p_hash, now());
    end if;

    insert into identity.password_state (user_id, kind, origin, issued_company_id, temp_expires_at, updated_at)
      values (p_user, 'tam', 'san-cap', v_company, p_expires, now())
      on conflict (user_id) do update set
        kind = 'tam', origin = 'san-cap', issued_company_id = v_company, temp_expires_at = p_expires,
        change_token_hash = null, change_token_expires_at = null, failed_streak = 0,
        disabled_at = null, disabled_reason = null, updated_at = now();

    delete from identity.session where "userId" = p_user;

    insert into identity.password_events (user_id, company_id, actor_user_id, kind)
      values (p_user, v_company, app.current_user_id(), 'cap');
  end
  $$;
revoke all on function app.cap_mat_khau_tam(text, text, timestamptz) from public;
grant execute on function app.cap_mat_khau_tam(text, text, timestamptz) to quy_hang_app;

-- Người vào một sàn khác sàn đã cấp: mật khẩu gốc sàn cấp thôi dùng — quản trị sàn cấp có thể đã đăng nhập bằng mật khẩu
-- tạm trước người ấy và đặt một mật khẩu mình biết. Mật khẩu người tự đổi ở Cá nhân giữ nguyên. Lời mời vẫn thành công.
create or replace function app.vo_hieu_mat_khau_khi_vao_san() returns trigger
  language plpgsql volatile security definer set search_path = ''
  as $$
  begin
    perform pg_advisory_xact_lock(hashtextextended('mat-khau:' || new.user_id, 0));
    update identity.password_state
      set disabled_at = now(), disabled_reason = 'vao-san-khac', change_token_hash = null,
          change_token_expires_at = null, updated_at = now()
      where user_id = new.user_id and origin = 'san-cap' and disabled_at is null
        and issued_company_id is distinct from new.company_id;
    if found then
      insert into identity.password_events (user_id, company_id, actor_user_id, kind)
        values (new.user_id, new.company_id, app.current_user_id(), 'vo-hieu-san-khac');
    end if;
    return new;
  end
  $$;
revoke all on function app.vo_hieu_mat_khau_khi_vao_san() from public;

create trigger company_members_vo_hieu_mat_khau
  before insert on company_members
  for each row execute function app.vo_hieu_mat_khau_khi_vao_san();
