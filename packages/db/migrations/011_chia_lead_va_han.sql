-- 011_chia_lead_va_han.sql · Chia lead và hạn (Tham chiếu §8 luật 20, hàng 25, ADR-0017).
-- Cơ sở dữ liệu chở dữ kiện và ghi mốc; luật chọn người và xét hạn ở packages/core (routing). Người nhận của lead đã chia
-- ghi vào cột có sẵn matched_agent_user_id — nghĩa nay là «đầu chủ lead đã về», khớp chủ trùng lúc nhập hay được chia —
-- nên vế «lead trước cùng số» của app.lead_dedupe_facts, luật đọc leads và bản của telesales không đổi.
-- Đứng sau 008 và 009 (hàng 62, ADR-0013; 009 thêm dấu vết số cho bảng leads): lead cùng số nhận ra bằng dấu vết owner_phone_hash (HMAC theo sàn), không đọc số
-- dạng chữ — sau 62 cột owner_phone luôn null và không hàm nào của cơ sở dữ liệu nhận số chủ dạng chữ.

-- ---- Mốc của lead ----
alter table leads
  add column routed_at       timestamptz,
  add column routed_seq      bigint,
  add column accepted_at     timestamptz,
  add column first_called_at timestamptz;

-- Thứ tự «lâu chưa được chia»: nhiều lead chia trong cùng nhịp mang cùng mốc giờ, nên dùng số tăng dần.
create sequence app.lead_routing_seq;

alter table leads drop constraint leads_new_has_no_match;
alter table leads add constraint leads_new_has_no_listing check (outcome <> 'new' or matched_listing_id is null);
-- Lead không trùng có người nhận khi và chỉ khi đã chia. routed_at = lần giao gần nhất (máy chia, hay trưởng nhóm giao
-- lại); lead căn trùng không được giao.
alter table leads add constraint leads_routed_pair check (
  outcome <> 'new' or ((matched_agent_user_id is null) = (routed_at is null) and (routed_at is null) = (routed_seq is null))
);
alter table leads add constraint leads_routed_not_unit check (routed_at is null or outcome in ('new', 'owner_has_agent'));
alter table leads add constraint leads_call_after_accept check (first_called_at is null or accepted_at is not null);
grant select (routed_at, routed_seq, accepted_at, first_called_at) on leads to quy_hang_app;
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

-- ---- Lời báo cho trưởng nhóm ----
-- Một lời cho mỗi loại của mỗi lần giao (deadline_from = mốc về người hiện tại; «chưa chia được» lấy lúc nhập). Chỉ
-- trưởng nhóm đọc; vai API không ghi thẳng — lời báo vào qua app.raise_lead_alert. Không cột nào mang số chủ.
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
create policy lead_alerts_read on lead_alerts for select
  using (company_id = app.current_company_id() and 'team_lead' = any (app.current_user_roles()));
grant select on lead_alerts to quy_hang_app;

-- ---- Dữ kiện cho nhịp (security definer, chỉ sàn đang làm) ----

-- Mã các sàn có việc: lead chờ chia, hay lead đã về người còn hạn chưa báo. Hàm duy nhất không đọc sàn đang làm — nhịp
-- chạy không có sàn. Chỉ trả mã sàn.
create or replace function app.lead_job_companies() returns table (company_id uuid)
  language sql stable security definer set search_path = ''
  as $$
    select distinct l.company_id
    from public.leads l
    where l.discarded_at is null
      and ((l.outcome = 'new' and l.matched_agent_user_id is null)
           or (l.matched_agent_user_id is not null and l.outcome in ('new', 'owner_has_agent')
               and ((l.accepted_at is null and not exists (
                       select 1 from public.lead_alerts a
                       where a.company_id = l.company_id and a.lead_id = l.id and a.kind = 'accept_overdue'
                         and a.deadline_from = coalesce(l.routed_at, l.created_at)))
                    or (l.first_called_at is null and not exists (
                       select 1 from public.lead_alerts a
                       where a.company_id = l.company_id and a.lead_id = l.id and a.kind = 'first_call_overdue'
                         and a.deadline_from = coalesce(l.routed_at, l.created_at))))))
  $$;
revoke all on function app.lead_job_companies() from public;
grant execute on function app.lead_job_companies() to quy_hang_app;

-- Lead chờ chia, cũ trước. owner_group: mã lead cũ nhất cùng dấu vết số trong sàn — nhịp gom lead cùng số mà không thấy
-- số. So dấu vết với dấu vết (hàng 62); lead không có dấu vết thì không gom, không có người của lead trước.
-- prior_agent: đầu chủ của lead trước cùng số đã về người, chưa bỏ.
create or replace function app.lead_routing_queue()
  returns table (lead_id uuid, building_name text, created_at timestamptz, owner_group uuid, prior_agent text)
  language sql stable security definer set search_path = ''
  as $$
    select l.id, l.building_name, l.created_at,
           (select g.id from public.leads g
            where g.company_id = l.company_id and g.owner_phone_hash = l.owner_phone_hash
            order by g.created_at, g.id limit 1),
           (select p.matched_agent_user_id from public.leads p
            where p.company_id = l.company_id and p.owner_phone_hash = l.owner_phone_hash and p.id <> l.id
              and p.matched_agent_user_id is not null and p.discarded_at is null
            order by coalesce(p.routed_at, p.created_at) desc, p.id limit 1)
    from public.leads l
    where l.company_id = app.current_company_id()
      and l.outcome = 'new' and l.matched_agent_user_id is null and l.discarded_at is null
    order by l.created_at, l.id
  $$;
revoke all on function app.lead_routing_queue() from public;
grant execute on function app.lead_routing_queue() to quy_hang_app;

-- Đầu chủ của sàn: vai, tên khu phụ trách, nghỉ hay không, ngày vào sàn, số thứ tự lần chia gần nhất.
create or replace function app.lead_routing_candidates()
  returns table (user_id text, roles text[], zone_names text[], on_leave boolean, joined_at timestamptz, last_routed_seq bigint)
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
            where l.company_id = m.company_id and l.matched_agent_user_id = m.user_id)
    from public.company_members m
    where m.company_id = app.current_company_id() and 'listing_agent' = any (m.roles)
  $$;
revoke all on function app.lead_routing_candidates() from public;
grant execute on function app.lead_routing_candidates() to quy_hang_app;

-- Chia một lead: chỉ lead không trùng chưa có người, chưa bỏ, người nhận là đầu chủ của sàn. Hai nhịp cùng lúc: nhịp sau
-- chờ khoá dòng rồi thấy lead đã có người — không chia hai lần.
create or replace function app.route_lead(p_lead uuid, p_agent text, p_now timestamptz) returns boolean
  language plpgsql volatile security definer set search_path = ''
  as $$
  begin
    update public.leads
      set matched_agent_user_id = p_agent, routed_at = p_now, routed_seq = nextval('app.lead_routing_seq')
      where company_id = app.current_company_id() and id = p_lead
        and outcome = 'new' and matched_agent_user_id is null and discarded_at is null
        and app.member_has_role(p_agent, 'listing_agent');
    return found;
  end
  $$;
revoke all on function app.route_lead(uuid, text, timestamptz) from public;
grant execute on function app.route_lead(uuid, text, timestamptz) to quy_hang_app;

-- Lead đã về người còn hạn mở: mốc hạn, mốc nhận, mốc gọi, loại đã báo cho mốc hạn ấy. Không số chủ.
create or replace function app.lead_deadline_facts()
  returns table (lead_id uuid, agent_user_id text, deadline_from timestamptz, accepted_at timestamptz,
                 first_called_at timestamptz, raised text[])
  language sql stable security definer set search_path = ''
  as $$
    select l.id, l.matched_agent_user_id, coalesce(l.routed_at, l.created_at), l.accepted_at, l.first_called_at,
           coalesce((select array_agg(a.kind order by a.kind) from public.lead_alerts a
                     where a.company_id = l.company_id and a.lead_id = l.id
                       and a.deadline_from = coalesce(l.routed_at, l.created_at)), '{}')
    from public.leads l
    where l.company_id = app.current_company_id()
      and l.matched_agent_user_id is not null and l.outcome in ('new', 'owner_has_agent') and l.discarded_at is null
      and (l.accepted_at is null or l.first_called_at is null)
    order by l.created_at, l.id
  $$;
revoke all on function app.lead_deadline_facts() from public;
grant execute on function app.lead_deadline_facts() to quy_hang_app;

-- Ghi một lời báo; trùng (cùng lead, loại, mốc hạn) thì bỏ qua. Người trễ hạn lấy từ dòng lead, không do bên gọi đưa.
create or replace function app.raise_lead_alert(p_lead uuid, p_kind text, p_from timestamptz, p_now timestamptz)
  returns boolean
  language plpgsql volatile security definer set search_path = ''
  as $$
  begin
    insert into public.lead_alerts (company_id, lead_id, kind, agent_user_id, deadline_from, raised_at)
      select l.company_id, l.id, p_kind, case when p_kind = 'unrouted' then null else l.matched_agent_user_id end, p_from, p_now
      from public.leads l
      where l.company_id = app.current_company_id() and l.id = p_lead
        and (p_kind = 'unrouted' or l.matched_agent_user_id is not null)
    on conflict on constraint lead_alerts_once do nothing;
    return found;
  end
  $$;
revoke all on function app.raise_lead_alert(uuid, text, timestamptz, timestamptz) from public;
grant execute on function app.raise_lead_alert(uuid, text, timestamptz, timestamptz) to quy_hang_app;

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

-- Trưởng nhóm giao một lead không trùng (chờ chia hay đã chia) hay lead chủ trùng cho một đầu chủ của sàn: mốc hạn bắt
-- đầu lại, mốc nhận và gọi xoá. 42501: không phải trưởng nhóm; P0002: không có lead; 22023: lead căn trùng hay đã bỏ;
-- 23503: người nhận không phải đầu chủ của sàn. Trả mốc hạn mới.
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
          accepted_at = null, first_called_at = null
      where company_id = v.company_id and id = v.id;
    return moc;
  end
  $$;
revoke all on function app.reassign_lead(uuid, text) from public;
grant execute on function app.reassign_lead(uuid, text) to quy_hang_app;
