-- 011_chia_lead_va_han.sql · Chia lead và hạn theo cấu hình của sàn (Tham chiếu §8 luật 20, hàng 25, ADR-0017).
-- Cơ sở dữ liệu chở dữ kiện và ghi mốc; thực đơn cách chia, mặc định của sàn, luật chọn người và xét hạn ở packages/core
-- (routing) — SQL không chép con số hay tên mặc định nào. Người nhận của lead ghi vào cột có sẵn matched_agent_user_id —
-- nghĩa nay là «đầu chủ lead đã về»: khớp chủ trùng lúc nhập, được chia, tự nhận ở kho chung hay trưởng nhóm giao — nên vế
-- «lead trước cùng số» của app.lead_dedupe_facts, luật đọc leads và bản của telesales không đổi.
-- Đứng sau 008 và 009 (hàng 62, ADR-0013): lead cùng số nhận ra bằng dấu vết owner_phone_hash, không đọc số dạng chữ.

-- ---- Cấu hình theo sàn ----
-- Một dòng một khoá «<nhóm>.<khoá>», giá trị JSON; khoá vắng = mặc định của sàn ở lõi. Bảng chung cho mọi cấu hình của sàn
-- (sổ điểm biến thiên, ADR-0018). Đọc: cả sàn. Ghi: quản trị sàn, ghi tên người đổi; giá trị do lõi kiểm trước khi ghi.
create table company_settings (
  company_id uuid not null references companies (id) on delete cascade,
  key        text not null check (key ~ '^[a-z][a-z_]*\.[a-z][a-z_]*$'),
  value      jsonb not null,
  updated_by text not null,
  updated_at timestamptz not null default now(),
  primary key (company_id, key)
);
alter table company_settings enable row level security;
alter table company_settings force row level security;
create policy company_settings_read on company_settings for select using (company_id = app.current_company_id());
create policy company_settings_insert on company_settings for insert with check (
  company_id = app.current_company_id() and updated_by = app.current_user_id()
  and 'company_admin' = any (app.current_user_roles())
);
create policy company_settings_update on company_settings for update
  using (company_id = app.current_company_id() and 'company_admin' = any (app.current_user_roles()))
  with check (company_id = app.current_company_id() and updated_by = app.current_user_id()
              and 'company_admin' = any (app.current_user_roles()));
grant select, insert, update on company_settings to quy_hang_app;

-- ---- Mốc và dấu của lead ----
alter table leads
  add column routed_at          timestamptz,
  add column routed_seq         bigint,
  add column accepted_at        timestamptz,
  add column first_called_at    timestamptz,
  -- Số lần trưởng nhóm giao lại một lead đã về người: giao lại xoá mốc gọi, số đo «lead → cuộc gọi đầu» loại các lead này.
  add column reassign_count     int not null default 0,
  -- Dấu đóng ở nhịp đầu tiên lead vào: cách chia và hai hạn của sàn lúc ấy — đổi cấu hình chỉ áp cho lead mới.
  add column routing_strategy   text,
  add column accept_minutes     int,
  add column first_call_minutes int;

-- Thứ tự «lâu chưa được chia»: nhiều lead chia trong cùng nhịp mang cùng mốc giờ, nên dùng số tăng dần.
create sequence app.lead_routing_seq;

alter table leads drop constraint leads_new_has_no_match;
alter table leads add constraint leads_new_has_no_listing check (outcome <> 'new' or matched_listing_id is null);
-- Lead không trùng có người nhận khi và chỉ khi đã giao. routed_at = lần giao gần nhất; lead căn trùng không được giao.
alter table leads add constraint leads_routed_pair check (
  outcome <> 'new' or ((matched_agent_user_id is null) = (routed_at is null) and (routed_at is null) = (routed_seq is null))
);
alter table leads add constraint leads_routed_not_unit check (routed_at is null or outcome in ('new', 'owner_has_agent'));
alter table leads add constraint leads_call_after_accept check (first_called_at is null or accepted_at is not null);
alter table leads add constraint leads_stamp_once check (
  (routing_strategy is null) = (accept_minutes is null) and (accept_minutes is null) = (first_call_minutes is null)
);
alter table leads add constraint leads_stamp_minutes check (accept_minutes is null or (accept_minutes > 0 and first_call_minutes > 0));
alter table leads add constraint leads_reassign_count check (reassign_count >= 0);
grant select (routed_at, routed_seq, accepted_at, first_called_at, reassign_count, routing_strategy, accept_minutes,
              first_call_minutes) on leads to quy_hang_app;
create index leads_waiting_idx on leads (company_id, created_at)
  where outcome = 'new' and matched_agent_user_id is null and discarded_at is null;
create index leads_agent_idx on leads (company_id, matched_agent_user_id);

-- ---- Người nghỉ ----
-- Đọc: cả sàn (luật chia cần biết). Ghi: chính người đó, trưởng nhóm, quản trị sàn (Hỏi-4); ghi người đổi và lúc đổi.
create table member_availability (
  company_id uuid not null,
  user_id    text not null,
  on_leave   boolean not null,
  changed_by text not null,
  changed_at timestamptz not null default now(),
  primary key (company_id, user_id),
  constraint member_availability_member_fkey foreign key (company_id, user_id)
    references company_members (company_id, user_id) on delete cascade
);
alter table member_availability enable row level security;
alter table member_availability force row level security;
create policy member_availability_read on member_availability for select using (company_id = app.current_company_id());
create policy member_availability_insert on member_availability for insert with check (
  company_id = app.current_company_id() and changed_by = app.current_user_id()
  and (user_id = app.current_user_id() or app.current_user_roles() && array['team_lead', 'company_admin'])
);
create policy member_availability_update on member_availability for update
  using (company_id = app.current_company_id()
         and (user_id = app.current_user_id() or app.current_user_roles() && array['team_lead', 'company_admin']))
  with check (company_id = app.current_company_id() and changed_by = app.current_user_id()
              and (user_id = app.current_user_id() or app.current_user_roles() && array['team_lead', 'company_admin']));
grant select, insert, update on member_availability to quy_hang_app;

-- ---- Lời báo ----
-- Sàn chọn người đọc báo ở khoá lead_routing.alert_to; chỉ mục thực đơn «trưởng nhóm và quản trị» mở cho quản trị — khoá
-- vắng thì chỉ trưởng nhóm đọc.
create or replace function app.lead_alerts_to_admin() returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select exists (select 1 from public.company_settings s
                   where s.company_id = app.current_company_id() and s.key = 'lead_routing.alert_to'
                     and s.value = '"team_lead_and_admin"'::jsonb)
  $$;
revoke all on function app.lead_alerts_to_admin() from public;
grant execute on function app.lead_alerts_to_admin() to quy_hang_app;

-- Một lời cho mỗi loại của mỗi lần giao (deadline_from = mốc về người hiện tại; «chưa chia được» lấy lúc nhập). Vai API
-- không ghi thẳng — lời báo vào qua app.raise_lead_alert. Không cột nào mang số chủ.
create table lead_alerts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null,
  lead_id       uuid not null,
  kind          text not null check (kind in ('unrouted', 'accept_overdue', 'first_call_overdue')),
  agent_user_id text,
  deadline_from timestamptz not null,
  raised_at     timestamptz not null,
  constraint lead_alerts_once unique (company_id, lead_id, kind, deadline_from),
  constraint lead_alerts_agent check ((kind = 'unrouted') = (agent_user_id is null)),
  constraint lead_alerts_lead_fkey foreign key (company_id, lead_id) references leads (company_id, id) on delete cascade
);
create index lead_alerts_company_idx on lead_alerts (company_id, raised_at desc);
alter table lead_alerts enable row level security;
alter table lead_alerts force row level security;
create policy lead_alerts_read on lead_alerts for select using (
  company_id = app.current_company_id()
  and ('team_lead' = any (app.current_user_roles())
       or ('company_admin' = any (app.current_user_roles()) and app.lead_alerts_to_admin()))
);
grant select on lead_alerts to quy_hang_app;

-- ---- Dữ kiện cho nhịp (security definer, chỉ sàn đang làm) ----

-- Mã các sàn có việc: lead chưa đóng dấu, lead chờ chia, hay lead đã về người còn mốc nhận hay mốc gọi trống. Hàm duy nhất
-- không đọc sàn đang làm — nhịp chạy không có sàn. Chỉ trả mã sàn.
create or replace function app.lead_job_companies() returns table (company_id uuid)
  language sql stable security definer set search_path = ''
  as $$
    select distinct l.company_id
    from public.leads l
    where l.discarded_at is null and l.outcome in ('new', 'owner_has_agent')
      and (l.routing_strategy is null or l.matched_agent_user_id is null or l.accepted_at is null or l.first_called_at is null)
  $$;
revoke all on function app.lead_job_companies() from public;
grant execute on function app.lead_job_companies() to quy_hang_app;

-- Các dòng cấu hình chia lead của sàn; lõi điền mặc định cho khoá vắng.
create or replace function app.lead_routing_settings_rows() returns table (key text, value jsonb)
  language sql stable security definer set search_path = ''
  as $$
    select s.key, s.value from public.company_settings s
    where s.company_id = app.current_company_id() and s.key like 'lead\_routing.%'
    order by s.key
  $$;
revoke all on function app.lead_routing_settings_rows() from public;
grant execute on function app.lead_routing_settings_rows() to quy_hang_app;

-- Đóng dấu cách chia và hai hạn của sàn lên lead chưa có dấu (lead không trùng hay chủ trùng, chưa bỏ). Trả số lead.
create or replace function app.stamp_leads(p_strategy text, p_accept int, p_first_call int) returns int
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    n int;
  begin
    update public.leads
      set routing_strategy = p_strategy, accept_minutes = p_accept, first_call_minutes = p_first_call
      where company_id = app.current_company_id() and routing_strategy is null
        and outcome in ('new', 'owner_has_agent') and discarded_at is null;
    get diagnostics n = row_count;
    return n;
  end
  $$;
revoke all on function app.stamp_leads(text, int, int) from public;
grant execute on function app.stamp_leads(text, int, int) to quy_hang_app;

-- Lead chờ chia đã đóng dấu, cũ trước. owner_group: dấu vết số — nhịp gom lead cùng số trong nhịp mà không thấy số.
-- prior_agent: đầu chủ đang giữ chủ nhà này — trên một hàng có chủ nhà mang dấu vết ấy, hay lead trước cùng số đã về người
-- chưa bỏ — lần gần nhất, như vế chủ của app.lead_dedupe_facts.
create or replace function app.lead_routing_queue()
  returns table (lead_id uuid, building_name text, created_at timestamptz, strategy text, accept_minutes int,
                 owner_group bytea, prior_agent text)
  language sql stable security definer set search_path = ''
  as $$
    select l.id, l.building_name, l.created_at, l.routing_strategy, l.accept_minutes, l.owner_phone_hash,
           (select x.dau_chu from (
              select (select a.user_id from public.listing_agent_assignments a
                      where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) as dau_chu,
                     (select a.assigned_at from public.listing_agent_assignments a
                      where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) as luc
              from public.listing_owners o
              where o.company_id = l.company_id and o.owner_phone_hash = l.owner_phone_hash
              union all
              select p.matched_agent_user_id, coalesce(p.routed_at, p.created_at)
              from public.leads p
              where p.company_id = l.company_id and p.owner_phone_hash = l.owner_phone_hash and p.id <> l.id
                and p.matched_agent_user_id is not null and p.discarded_at is null
            ) x
            where x.dau_chu is not null
            order by x.luc desc
            limit 1)
    from public.leads l
    where l.company_id = app.current_company_id() and l.routing_strategy is not null
      and l.outcome = 'new' and l.matched_agent_user_id is null and l.discarded_at is null
    order by l.created_at, l.id
  $$;
revoke all on function app.lead_routing_queue() from public;
grant execute on function app.lead_routing_queue() to quy_hang_app;

-- Đầu chủ của sàn: vai, tên khu phụ trách, nghỉ hay không, ngày vào sàn, số thứ tự lần giao gần nhất, số lead đang mở
-- (đã về, chưa bỏ, chưa ghi gọi lần đầu — Hỏi-7).
create or replace function app.lead_routing_candidates()
  returns table (user_id text, roles text[], zone_names text[], on_leave boolean, joined_at timestamptz,
                 last_routed_seq bigint, open_leads int)
  language sql stable security definer set search_path = ''
  as $$
    select m.user_id, m.roles,
           coalesce((select array_agg(z.name order by z.name) from public.member_zones mz
                     join public.company_zones z on z.company_id = mz.company_id and z.id = mz.zone_id
                     where mz.company_id = m.company_id and mz.user_id = m.user_id), '{}'),
           coalesce((select a.on_leave from public.member_availability a
                     where a.company_id = m.company_id and a.user_id = m.user_id), false),
           m.created_at,
           (select max(l.routed_seq) from public.leads l
            where l.company_id = m.company_id and l.matched_agent_user_id = m.user_id),
           (select count(*)::int from public.leads l
            where l.company_id = m.company_id and l.matched_agent_user_id = m.user_id
              and l.outcome in ('new', 'owner_has_agent') and l.discarded_at is null and l.first_called_at is null)
    from public.company_members m
    where m.company_id = app.current_company_id() and 'listing_agent' = any (m.roles)
    order by m.user_id
  $$;
revoke all on function app.lead_routing_candidates() from public;
grant execute on function app.lead_routing_candidates() to quy_hang_app;

-- Chia một lead: chỉ lead không trùng đã đóng dấu, chưa có người, chưa bỏ, người nhận là đầu chủ của sàn. Hai nhịp cùng
-- lúc: nhịp sau chờ khoá dòng rồi thấy lead đã có người — không chia hai lần.
create or replace function app.route_lead(p_lead uuid, p_agent text, p_now timestamptz) returns boolean
  language plpgsql volatile security definer set search_path = ''
  as $$
  begin
    update public.leads
      set matched_agent_user_id = p_agent, routed_at = p_now, routed_seq = nextval('app.lead_routing_seq')
      where company_id = app.current_company_id() and id = p_lead and routing_strategy is not null
        and outcome = 'new' and matched_agent_user_id is null and discarded_at is null
        and app.member_has_role(p_agent, 'listing_agent');
    return found;
  end
  $$;
revoke all on function app.route_lead(uuid, text, timestamptz) from public;
grant execute on function app.route_lead(uuid, text, timestamptz) to quy_hang_app;

-- Dữ kiện hạn của lead đã đóng dấu, chưa bỏ: lead đã về người còn mốc nhận hay mốc gọi trống (mốc hạn = lần giao gần
-- nhất, chủ trùng thì lúc nhập), và lead chờ chia (mốc = lúc nhập). raised: loại đã báo cho mốc ấy. Không số chủ.
create or replace function app.lead_deadline_facts()
  returns table (lead_id uuid, agent_user_id text, deadline_from timestamptz, accept_minutes int, first_call_minutes int,
                 accepted_at timestamptz, first_called_at timestamptz, strategy text, created_at timestamptz, raised text[])
  language sql stable security definer set search_path = ''
  as $$
    select l.id, l.matched_agent_user_id, coalesce(l.routed_at, l.created_at), l.accept_minutes, l.first_call_minutes,
           l.accepted_at, l.first_called_at, l.routing_strategy, l.created_at,
           coalesce((select array_agg(a.kind order by a.kind) from public.lead_alerts a
                     where a.company_id = l.company_id and a.lead_id = l.id
                       and a.deadline_from = coalesce(l.routed_at, l.created_at)), '{}')
    from public.leads l
    where l.company_id = app.current_company_id() and l.routing_strategy is not null
      and l.outcome in ('new', 'owner_has_agent') and l.discarded_at is null
      and (l.matched_agent_user_id is null or l.accepted_at is null or l.first_called_at is null)
    order by l.created_at, l.id
  $$;
revoke all on function app.lead_deadline_facts() from public;
grant execute on function app.lead_deadline_facts() to quy_hang_app;

-- Ghi một lời báo cho lead của sàn đang làm; trùng (cùng lead, loại, mốc hạn) thì bỏ qua. Người trễ hạn lấy từ dòng lead,
-- không do bên gọi đưa; «chưa chia được» chỉ cho lead chưa có người.
create or replace function app.raise_lead_alert(p_lead uuid, p_kind text, p_from timestamptz, p_now timestamptz)
  returns boolean
  language plpgsql volatile security definer set search_path = ''
  as $$
  begin
    insert into public.lead_alerts (company_id, lead_id, kind, agent_user_id, deadline_from, raised_at)
      select l.company_id, l.id, p_kind, case when p_kind = 'unrouted' then null else l.matched_agent_user_id end, p_from, p_now
      from public.leads l
      where l.company_id = app.current_company_id() and l.id = p_lead
        and ((p_kind = 'unrouted') = (l.matched_agent_user_id is null))
    on conflict on constraint lead_alerts_once do nothing;
    return found;
  end
  $$;
revoke all on function app.raise_lead_alert(uuid, text, timestamptz, timestamptz) from public;
grant execute on function app.raise_lead_alert(uuid, text, timestamptz, timestamptz) to quy_hang_app;

-- ---- Kho chung ----

-- Lead kho chung chưa ai nhận của sàn: mã, toà, căn, nhu cầu, lúc nhập — không chủ nhà, không số. Chỉ đầu chủ gọi được;
-- lối API lọc tiếp theo khu phụ trách (lõi, poolVisibleTo).
create or replace function app.lead_pool()
  returns table (lead_id uuid, building_name text, unit_number text, need text, created_at timestamptz)
  language sql stable security definer set search_path = ''
  as $$
    select l.id, l.building_name, l.unit_number, l.need, l.created_at
    from public.leads l
    where l.company_id = app.current_company_id() and l.routing_strategy = 'open_pool'
      and l.outcome = 'new' and l.matched_agent_user_id is null and l.discarded_at is null
      and 'listing_agent' = any (app.current_user_roles())
    order by l.created_at, l.id
  $$;
revoke all on function app.lead_pool() from public;
grant execute on function app.lead_pool() to quy_hang_app;

-- Đầu chủ tự nhận một lead kho chung: lead về người gọi, đã nhận. 42501: không phải đầu chủ hay đang nghỉ; P0002: không
-- có lead kho chung này; 23505: đã có người nhận.
create or replace function app.claim_lead(p_lead uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    if not ('listing_agent' = any (app.current_user_roles())) then
      raise exception 'chỉ đầu chủ nhận lead kho chung' using errcode = '42501';
    end if;
    select * into v from public.leads
      where company_id = app.current_company_id() and id = p_lead and routing_strategy = 'open_pool'
        and outcome = 'new' and discarded_at is null
      for update;
    if not found then
      raise exception 'không có lead kho chung này' using errcode = 'P0002';
    end if;
    if coalesce((select a.on_leave from public.member_availability a
                 where a.company_id = v.company_id and a.user_id = app.current_user_id()), false) then
      raise exception 'người đang nghỉ' using errcode = '42501';
    end if;
    if v.matched_agent_user_id is not null then
      raise exception 'lead đã có người nhận' using errcode = '23505';
    end if;
    update public.leads
      set matched_agent_user_id = app.current_user_id(), routed_at = now(), routed_seq = nextval('app.lead_routing_seq'),
          accepted_at = now()
      where company_id = v.company_id and id = v.id;
  end
  $$;
revoke all on function app.claim_lead(uuid) from public;
grant execute on function app.claim_lead(uuid) to quy_hang_app;

-- ---- Mốc do người ghi (security definer, mỗi ca một mã lỗi để API trả đúng mã HTTP) ----

-- Đầu chủ nhận lead đã về mình. P0002: không phải lead của người gọi; 23505: đã nhận.
create or replace function app.accept_lead(p_lead uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    select * into v from public.leads
      where company_id = app.current_company_id() and id = p_lead
        and matched_agent_user_id = app.current_user_id() and outcome in ('new', 'owner_has_agent') and discarded_at is null
      for update;
    if not found then
      raise exception 'không có lead này của người gọi' using errcode = 'P0002';
    end if;
    if v.accepted_at is not null then
      raise exception 'lead đã nhận' using errcode = '23505';
    end if;
    update public.leads set accepted_at = now() where company_id = v.company_id and id = v.id;
  end
  $$;
revoke all on function app.accept_lead(uuid) from public;
grant execute on function app.accept_lead(uuid) to quy_hang_app;

-- Đầu chủ ghi đã gọi lần đầu; chưa nhận thì ghi luôn mốc nhận. P0002: không phải lead của người gọi; 23505: đã ghi.
create or replace function app.mark_first_call(p_lead uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    select * into v from public.leads
      where company_id = app.current_company_id() and id = p_lead
        and matched_agent_user_id = app.current_user_id() and outcome in ('new', 'owner_has_agent') and discarded_at is null
      for update;
    if not found then
      raise exception 'không có lead này của người gọi' using errcode = 'P0002';
    end if;
    if v.first_called_at is not null then
      raise exception 'đã ghi gọi lần đầu' using errcode = '23505';
    end if;
    update public.leads set first_called_at = now(), accepted_at = coalesce(accepted_at, now())
      where company_id = v.company_id and id = v.id;
  end
  $$;
revoke all on function app.mark_first_call(uuid) from public;
grant execute on function app.mark_first_call(uuid) to quy_hang_app;

-- Trưởng nhóm giao một lead không trùng (chờ chia — kể cả kho chung, chia tay — hay đã chia) hay lead chủ trùng cho một
-- đầu chủ của sàn: mốc hạn bắt đầu lại, mốc nhận và gọi xoá; lead đã có người thì cộng một lần giao lại. 42501: không phải
-- trưởng nhóm; P0002: không có lead; 22023: lead căn trùng hay đã bỏ; 23503: người nhận không phải đầu chủ của sàn. Trả
-- mốc hạn mới.
create or replace function app.reassign_lead(p_lead uuid, p_agent text) returns timestamptz
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
    moc timestamptz := now();
  begin
    if not ('team_lead' = any (app.current_user_roles())) then
      raise exception 'chỉ trưởng nhóm giao lead' using errcode = '42501';
    end if;
    select * into v from public.leads where company_id = app.current_company_id() and id = p_lead for update;
    if not found then
      raise exception 'không có lead này' using errcode = 'P0002';
    end if;
    if v.outcome not in ('new', 'owner_has_agent') or v.discarded_at is not null then
      raise exception 'không giao được lead căn trùng' using errcode = '22023';
    end if;
    if not app.member_has_role(p_agent, 'listing_agent') then
      raise exception 'người nhận không phải đầu chủ của sàn' using errcode = '23503';
    end if;
    update public.leads
      set matched_agent_user_id = p_agent, routed_at = moc, routed_seq = nextval('app.lead_routing_seq'),
          accepted_at = null, first_called_at = null,
          reassign_count = reassign_count + case when v.matched_agent_user_id is null then 0 else 1 end
      where company_id = v.company_id and id = v.id;
    return moc;
  end
  $$;
revoke all on function app.reassign_lead(uuid, text) from public;
grant execute on function app.reassign_lead(uuid, text) to quy_hang_app;
