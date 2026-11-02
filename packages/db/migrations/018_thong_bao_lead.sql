-- 018_thong_bao_lead.sql · Thông báo lead (hàng 26, ADR-0025): đầu chủ nhận Web Push khi lead về mình, trưởng nhóm khi
-- nhịp chia ghi lời báo mới. Ba bảng: đăng ký thiết bị (theo người, sàn), hộp thư đi (theo sàn, ghi cùng giao dịch giao
-- lead, gửi sau khi ghi xong), khoá VAPID (hệ thống, một dòng, không ai cầm — máy chủ tự sinh, khoá riêng chỉ ở dạng bản mã).
-- Nội dung thông báo dựng ở lõi (packages/core/src/push) không mang lớp nguồn; không cột nào ở đây mang số chủ.

-- ---- Đăng ký thiết bị ----
-- Một thiết bị đã cho phép nhận thông báo của một người trong một sàn. Người chỉ đọc, thêm, sửa khoá, xoá đăng ký của
-- chính mình trong sàn đang làm; không ai khác đọc — lối gửi của máy chủ đọc qua hộp thư đi (app.push_outbox_claim).
create table push_subscriptions (
  company_id uuid not null,
  id         uuid not null default gen_random_uuid(),
  user_id    text not null,
  endpoint   text not null check (endpoint ~ '^https://' and length(endpoint) <= 2048),
  p256dh     text not null check (p256dh ~ '^[A-Za-z0-9_-]+=*$' and length(p256dh) between 80 and 100),
  auth       text not null check (auth ~ '^[A-Za-z0-9_-]+=*$' and length(auth) between 16 and 32),
  created_at timestamptz not null default now(),
  failed_at  timestamptz,
  last_error text check (last_error is null or length(last_error) <= 300),
  primary key (company_id, id),
  constraint push_subscriptions_once unique (company_id, user_id, endpoint),
  constraint push_subscriptions_member_fkey foreign key (company_id, user_id)
    references company_members (company_id, user_id) on delete cascade
);
alter table push_subscriptions enable row level security;
alter table push_subscriptions force row level security;
create policy push_subscriptions_own on push_subscriptions for all
  using (company_id = app.current_company_id() and user_id = app.current_user_id())
  with check (company_id = app.current_company_id() and user_id = app.current_user_id());
grant select, insert, delete on push_subscriptions to quy_hang_app;
grant update (p256dh, auth, failed_at, last_error) on push_subscriptions to quy_hang_app;

-- ---- Hộp thư đi ----
-- Mỗi dòng là một lần báo tới một đăng ký. Ghi trong cùng giao dịch giao lead (quay lui thì dòng cũng mất); gửi sau khi
-- giao dịch ghi xong; lỗi tạm thì nhịp chia gửi lại trong khung lõi khai (PUSH_RETRY). sent_at là mốc gửi cho số đo lead →
-- cuộc gọi đầu. Vai API không đọc, không ghi thẳng — chỉ qua các hàm dưới.
create table push_outbox (
  company_id      uuid not null,
  id              uuid not null default gen_random_uuid(),
  user_id         text not null,
  subscription_id uuid not null,
  payload         jsonb not null check (jsonb_typeof(payload) = 'object'
                    and payload ?& array['title', 'body', 'url', 'tag']
                    and payload - array['title', 'body', 'url', 'tag'] = '{}'::jsonb),
  created_at      timestamptz not null default now(),
  claimed_at      timestamptz,
  sent_at         timestamptz,
  attempts        int not null default 0 check (attempts >= 0),
  last_error      text check (last_error is null or length(last_error) <= 300),
  primary key (company_id, id),
  constraint push_outbox_subscription_fkey foreign key (company_id, subscription_id)
    references push_subscriptions (company_id, id) on delete cascade
);
create index push_outbox_pending_idx on push_outbox (company_id, created_at) where sent_at is null;
alter table push_outbox enable row level security;
alter table push_outbox force row level security;

-- ---- Khoá VAPID ----
-- Bảng hệ thống một dòng, không thuộc sàn nào: khoá công khai lưu thường, khoá riêng lưu bản mã (AES-256-GCM bằng khoá con
-- HKDF của khoá mã hoá số chủ, nhãn quy-hang/push-vapid/v1 — ADR-0025). Bật luật theo dòng không luật nào, vai API không
-- được cấp: chỉ đi qua app.push_vapid_get / app.push_vapid_init. Xoay khoá = xoá dòng (vai chủ).
create table push_vapid (
  id          smallint primary key check (id = 1),
  public_key  text not null check (public_key ~ '^[A-Za-z0-9_-]{87}$'),
  private_enc bytea not null check (octet_length(private_enc) between 40 and 80),
  created_at  timestamptz not null default now()
);
alter table push_vapid enable row level security;
alter table push_vapid force row level security;

create or replace function app.push_vapid_get() returns table (public_key text, private_enc bytea)
  language sql stable security definer set search_path = ''
  as $$ select v.public_key, v.private_enc from public.push_vapid v where v.id = 1 $$;
revoke all on function app.push_vapid_get() from public;
grant execute on function app.push_vapid_get() to quy_hang_app;

-- Lần dùng đầu: ghi cặp khoá vừa sinh nếu bảng còn trống; hai lần đầu chạy song song thì bên sau chờ bên trước ghi xong,
-- không ghi gì và đọc lại dòng đã có — luôn trả đúng một cặp.
create or replace function app.push_vapid_init(p_public text, p_private_enc bytea)
  returns table (public_key text, private_enc bytea)
  language plpgsql volatile security definer set search_path = ''
  as $$
  begin
    insert into public.push_vapid (id, public_key, private_enc) values (1, p_public, p_private_enc)
      on conflict (id) do nothing;
    return query select v.public_key, v.private_enc from public.push_vapid v where v.id = 1;
  end
  $$;
revoke all on function app.push_vapid_init(text, bytea) from public;
grant execute on function app.push_vapid_init(text, bytea) to quy_hang_app;

-- ---- Hàm của lối gửi (security definer, chỉ sàn đang làm) ----

-- Đăng ký của một người trong sàn đang làm. Hàm trong — vai API không gọi thẳng; chỉ hàm hộp thư đi dùng.
create or replace function app.push_targets(p_user text) returns table (id uuid, endpoint text, p256dh text, auth text)
  language sql stable security definer set search_path = ''
  as $$
    select s.id, s.endpoint, s.p256dh, s.auth from public.push_subscriptions s
    where s.company_id = app.current_company_id() and s.user_id = p_user
    order by s.created_at, s.id
  $$;
revoke all on function app.push_targets(text) from public;

-- Ghi một lần báo cho một người của sàn đang làm: một dòng cho mỗi đăng ký của người ấy. Trả số dòng (0 khi người chưa bật).
-- p_now: mốc ghi — nhịp chia đưa mốc của nhịp, lối khác để mặc định.
create or replace function app.push_outbox_add(p_user text, p_payload jsonb, p_now timestamptz default now()) returns int
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    n int;
  begin
    insert into public.push_outbox (company_id, user_id, subscription_id, payload, created_at)
      select app.current_company_id(), p_user, t.id, p_payload, p_now from app.push_targets(p_user) t;
    get diagnostics n = row_count;
    return n;
  end
  $$;
revoke all on function app.push_outbox_add(text, jsonb, timestamptz) from public;
grant execute on function app.push_outbox_add(text, jsonb, timestamptz) to quy_hang_app;

-- Ghi một lần báo cho mọi thành viên mang vai p_role của sàn đang làm (lời báo cho trưởng nhóm). Trả số dòng.
create or replace function app.push_outbox_add_role(p_role text, p_payload jsonb, p_now timestamptz default now())
  returns int
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    n int;
  begin
    insert into public.push_outbox (company_id, user_id, subscription_id, payload, created_at)
      select app.current_company_id(), m.user_id, t.id, p_payload, p_now
      from public.company_members m
      cross join lateral app.push_targets(m.user_id) t
      where m.company_id = app.current_company_id() and p_role = any (m.roles);
    get diagnostics n = row_count;
    return n;
  end
  $$;
revoke all on function app.push_outbox_add_role(text, jsonb, timestamptz) from public;
grant execute on function app.push_outbox_add_role(text, jsonb, timestamptz) to quy_hang_app;

-- Nhận các dòng chưa gửi của sàn đang làm để gửi: chưa quá số lần, còn trong khung, không bên gửi nào khác đang giữ
-- (giữ một phút — lối giao và nhịp chia không gửi trùng). p_first_only: lối giao chỉ gửi dòng chưa thử lần nào; gửi lại
-- dòng lỗi tạm là việc của nhịp chia. Trả nội dung và đăng ký đích.
create or replace function app.push_outbox_claim(p_now timestamptz, p_max_attempts int, p_window_minutes int,
                                                 p_first_only boolean default false)
  returns table (id uuid, payload jsonb, endpoint text, p256dh text, auth text, attempts int)
  language sql volatile security definer set search_path = ''
  as $$
    update public.push_outbox o set claimed_at = p_now
      from public.push_subscriptions s
      where o.company_id = app.current_company_id() and s.company_id = o.company_id and s.id = o.subscription_id
        and o.sent_at is null and o.attempts < p_max_attempts and (not p_first_only or o.attempts = 0)
        and o.created_at > p_now - make_interval(mins => p_window_minutes)
        and (o.claimed_at is null or o.claimed_at < p_now - interval '1 minute')
      returning o.id, o.payload, s.endpoint, s.p256dh, s.auth, o.attempts
  $$;
revoke all on function app.push_outbox_claim(timestamptz, int, int, boolean) from public;
grant execute on function app.push_outbox_claim(timestamptz, int, int, boolean) to quy_hang_app;

-- Kết quả một lần gửi. p_result: 'sent' → mốc gửi; 'gone' (dịch vụ đẩy trả 404/410) → xoá đăng ký (dòng hộp thư đi đi
-- theo); 'failed' → tăng lần, ghi lỗi trên dòng và trên đăng ký, nhả giữ để nhịp sau gửi lại.
create or replace function app.push_outbox_mark(p_id uuid, p_result text, p_error text) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v_sub uuid;
  begin
    if p_result not in ('sent', 'gone', 'failed') then
      raise exception 'kết quả gửi không hợp lệ' using errcode = '22023';
    end if;
    select o.subscription_id into v_sub from public.push_outbox o
      where o.company_id = app.current_company_id() and o.id = p_id;
    if not found then return; end if;
    if p_result = 'gone' then
      delete from public.push_subscriptions s where s.company_id = app.current_company_id() and s.id = v_sub;
    elsif p_result = 'sent' then
      update public.push_outbox set sent_at = now(), attempts = attempts + 1, claimed_at = null, last_error = null
        where company_id = app.current_company_id() and id = p_id;
    else
      update public.push_outbox set attempts = attempts + 1, claimed_at = null, last_error = left(p_error, 300)
        where company_id = app.current_company_id() and id = p_id;
      update public.push_subscriptions set failed_at = now(), last_error = left(p_error, 300)
        where company_id = app.current_company_id() and id = v_sub;
    end if;
  end
  $$;
revoke all on function app.push_outbox_mark(uuid, text, text) from public;
grant execute on function app.push_outbox_mark(uuid, text, text) to quy_hang_app;

-- Mã các sàn còn dòng chờ gửi trong khung — nhịp chạy không có sàn. Chỉ trả mã sàn.
create or replace function app.push_job_companies(p_now timestamptz, p_max_attempts int, p_window_minutes int)
  returns table (company_id uuid)
  language sql stable security definer set search_path = ''
  as $$
    select distinct o.company_id from public.push_outbox o
    where o.sent_at is null and o.attempts < p_max_attempts
      and o.created_at > p_now - make_interval(mins => p_window_minutes)
  $$;
revoke all on function app.push_job_companies(timestamptz, int, int) from public;
grant execute on function app.push_job_companies(timestamptz, int, int) to quy_hang_app;

-- Toà và nhu cầu của một lead sàn đang làm — đủ dựng nội dung thông báo (lõi), không gì của lớp nguồn. Nhịp chia chạy
-- không người nên không đọc được bảng leads dưới luật theo dòng.
create or replace function app.push_lead_brief(p_lead uuid) returns table (building_name text, need text)
  language sql stable security definer set search_path = ''
  as $$
    select l.building_name, l.need from public.leads l where l.company_id = app.current_company_id() and l.id = p_lead
  $$;
revoke all on function app.push_lead_brief(uuid) from public;
grant execute on function app.push_lead_brief(uuid) to quy_hang_app;
