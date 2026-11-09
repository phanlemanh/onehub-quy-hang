-- 041_token_may_ket_noi.sql · Token máy của kết nối (hàng 96, ADR-0015 sửa đổi 09/11): bên kia của một thoả thuận gọi API
-- bằng token gắn đúng thoả thuận ấy, không phiên của ai. `machine_tokens` chỉ giữ băm SHA-256 và mã nhận diện ngắn;
-- `machine_token_calls` là nhật ký chỉ thêm, mỗi lời gọi mang token nhận ra được một dòng.
--
-- Số 041 do giám sát giữ cho hàng 96. Bản thật áp tệp này SAU 052, cơ sở dữ liệu mới áp TRƯỚC 042–052 (bộ chạy ghi sổ theo
-- tên): tệp chỉ dựa vào đối tượng có từ ≤ 040 và viết lặp lại được (bài kiểm `packages/db/tests/token-may-thu-tu.test.mjs`).

-- Khoá ngoại ghép (agreement_id, company_id) cần chỉ mục duy nhất ở bảng cha: token không gắn được vào thoả thuận của sàn
-- khác kể cả khi câu ghi tự đặt `company_id`.
create unique index if not exists agreements_id_company_uq on agreements (id, company_id);

create table if not exists machine_tokens (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies (id) on delete cascade,
  agreement_id   uuid not null,
  token_hash     text not null,
  display_prefix text not null,
  created_by     text not null,
  created_at     timestamptz not null default now(),
  revoked_at     timestamptz,
  revoked_by     text,
  constraint machine_tokens_hash_uq unique (token_hash),
  constraint machine_tokens_id_company_uq unique (id, company_id),
  constraint machine_tokens_hash_format check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint machine_tokens_prefix_format check (display_prefix ~ '^[A-Za-z0-9_-]{8}$'),
  constraint machine_tokens_agreement_fkey foreign key (agreement_id, company_id) references agreements (id, company_id)
);
create index if not exists machine_tokens_live_idx on machine_tokens (agreement_id) where revoked_at is null;

create table if not exists machine_token_calls (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies (id) on delete cascade,
  token_id     uuid not null,
  agreement_id uuid not null,
  called_at    timestamptz not null default now(),
  method       text not null,
  route        text not null,
  http_status  int not null,
  outcome      text not null,
  constraint machine_token_calls_status_range check (http_status between 100 and 599),
  constraint machine_token_calls_outcome_check check (outcome in ('accepted', 'invalid_payload', 'wrong_connection',
                                                                  'agreement_inactive', 'token_revoked', 'server_error')),
  constraint machine_token_calls_token_fkey foreign key (token_id, company_id) references machine_tokens (id, company_id),
  constraint machine_token_calls_agreement_fkey foreign key (agreement_id, company_id) references agreements (id, company_id)
);
create index if not exists machine_token_calls_token_idx on machine_token_calls (company_id, token_id, called_at desc);

alter table machine_tokens enable row level security;
alter table machine_tokens force row level security;
alter table machine_token_calls enable row level security;
alter table machine_token_calls force row level security;

drop policy if exists machine_tokens_read on machine_tokens;
create policy machine_tokens_read on machine_tokens for select
  using (company_id = app.current_company_id());
drop policy if exists machine_tokens_insert on machine_tokens;
create policy machine_tokens_insert on machine_tokens for insert
  with check (company_id = app.current_company_id());
-- Thu hồi một chiều: chỉ sửa được dòng còn sống, và sửa xong dòng phải là đã thu hồi.
drop policy if exists machine_tokens_revoke on machine_tokens;
create policy machine_tokens_revoke on machine_tokens for update
  using (company_id = app.current_company_id() and revoked_at is null)
  with check (company_id = app.current_company_id() and revoked_at is not null);

drop policy if exists machine_token_calls_read on machine_token_calls;
create policy machine_token_calls_read on machine_token_calls for select
  using (company_id = app.current_company_id());
drop policy if exists machine_token_calls_insert on machine_token_calls;
create policy machine_token_calls_insert on machine_token_calls for insert
  with check (company_id = app.current_company_id());

-- Vai API không có quyền xoá ở cả hai bảng; không sửa được cột nào của token ngoài hai cột thu hồi; nhật ký chỉ thêm.
grant select, insert on machine_tokens to quy_hang_app;
grant update (revoked_at, revoked_by) on machine_tokens to quy_hang_app;
grant select, insert on machine_token_calls to quy_hang_app;

-- Thoả thuận `ended` là thu hồi hẳn (Hỏi-6); `paused` và quá hạn chỉ chặn tạm ở lúc gọi. Chỉ đụng token còn sống, nên token đã
-- thu hồi tay giữ nguyên mốc và người.
create or replace function app.machine_tokens_revoke_on_agreement_ended()
  returns trigger
  language plpgsql security definer set search_path = ''
  as $$
  begin
    update public.machine_tokens
       set revoked_at = now(), revoked_by = 'system:agreement-ended'
     where agreement_id = new.id and company_id = new.company_id and revoked_at is null;
    return null;
  end
  $$;
revoke all on function app.machine_tokens_revoke_on_agreement_ended() from public;

drop trigger if exists machine_tokens_agreement_ended on agreements;
create trigger machine_tokens_agreement_ended
  after update of status on agreements
  for each row
  when (new.status = 'ended' and old.status is distinct from 'ended')
  execute function app.machine_tokens_revoke_on_agreement_ended();

-- Tra theo băm khi chưa biết sàn, theo khuôn `app.share_by_code` (031): chỉ nhận đúng dạng 64 hex, tối đa một dòng, không có
-- đường liệt kê.
create or replace function app.machine_token_by_hash(p_hash text)
  returns table (token_id uuid, company_id uuid, agreement_id uuid, revoked boolean)
  language sql stable security definer set search_path = ''
  as $$
    select t.id, t.company_id, t.agreement_id, t.revoked_at is not null
      from public.machine_tokens t
     where p_hash ~ '^[0-9a-f]{64}$' and t.token_hash = p_hash
  $$;
revoke all on function app.machine_token_by_hash(text) from public;
grant execute on function app.machine_token_by_hash(text) to quy_hang_app;
