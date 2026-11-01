-- 015_lead_bon_nac.sql · Lead bốn nấc: trả lại, gửi lại, lên bảng, số đo «Số ngày lead → Sẵn sàng bán» (Tham chiếu §10,
-- §11, hàng 27, ADR-0020). Nấc của lead suy từ dữ kiện ở packages/core (dedupe/lead-stage) — không cột nấc nào được ghi.
-- Lead đã trả lại rời việc của đầu chủ: năm hàm của hàng 24, 25, 62 thay bằng `create or replace` cùng chữ ký, thân y cũ
-- cộng đúng điều kiện «chưa trả lại». Không hàm nào ở đây trả số chủ hay mã hàng.

-- ---- Trả lại và gửi lại ----
alter table leads
  add column returned_at         timestamptz,
  add column returned_by         text,
  add column resubmitted_at      timestamptz,
  add column resubmitted_lead_id uuid,
  add constraint leads_return_pair check ((returned_at is null) = (returned_by is null)),
  add constraint leads_resubmit_pair check ((resubmitted_at is null) = (resubmitted_lead_id is null)),
  add constraint leads_resubmit_after_return check (resubmitted_at is null or returned_at is not null),
  -- Chỉ lead đã về một đầu chủ (không trùng hay chủ trùng, chưa bỏ) mới trả lại được; lead căn trùng không có đầu chủ của lead.
  add constraint leads_return_has_agent check (
    returned_at is null
    or (matched_agent_user_id is not null and outcome in ('new', 'owner_has_agent') and discarded_at is null)
  ),
  add constraint leads_resubmitted_lead_fkey foreign key (company_id, resubmitted_lead_id) references leads (company_id, id);
create index leads_resubmitted_idx on leads (company_id, resubmitted_lead_id) where resubmitted_lead_id is not null;
-- Đọc bốn cột mới; không cấp sửa — trả lại và gửi lại đi qua app.return_lead, app.mark_resubmitted.
grant select (returned_at, returned_by, resubmitted_at, resubmitted_lead_id) on leads to quy_hang_app;

-- ---- Lên bảng (Hỏi-1) ----
-- Một định nghĩa cho cả sàn: lead đã về một đầu chủ, chưa bỏ, chưa trả lại, lên bảng lúc lần đầu một hàng mà chủ nhà mang
-- cùng dấu vết số và đầu chủ hiện tại là đầu chủ của lead chuyển sang Sẵn sàng bán (status_changed → Active) kể từ lúc nhập
-- lead. Hàm nội bộ: không cấp cho vai API — ba hàm dưới dùng chung, mỗi hàm tự lọc theo người và sàn.
create or replace function app.lead_board_at_all(p_company uuid) returns table (lead_id uuid, board_at timestamptz)
  language sql stable security definer set search_path = ''
  as $$
    -- Đọc bảng chủ nhà trước bảng lead: cùng thứ tự khoá với đường nhập lead (kiểm trùng) và với lần đổi ràng buộc hai bảng
    -- ở migration — đảo thứ tự là khoá chéo.
    select l.id, min(e.occurred_at)
    from public.listing_owners o
    join public.listing_events e on e.company_id = o.company_id and e.listing_id = o.listing_id
    join public.leads l on l.company_id = o.company_id and l.owner_phone_hash = o.owner_phone_hash
    where o.company_id = p_company
      and e.type = 'status_changed' and e.payload ->> 'to' = 'Active' and e.occurred_at >= l.created_at
      and l.matched_agent_user_id is not null and l.outcome in ('new', 'owner_has_agent')
      and l.discarded_at is null and l.returned_at is null
      and (select a.user_id from public.listing_agent_assignments a
           where a.company_id = o.company_id and a.listing_id = o.listing_id
           order by a.seq desc limit 1) = l.matched_agent_user_id
    group by l.id
  $$;
revoke all on function app.lead_board_at_all(uuid) from public;

-- Mốc lên bảng của các lead do người gọi nhập, ở sàn đang làm. Chỉ mã lead và mốc giờ.
create or replace function app.lead_board_dates(p_leads uuid[]) returns table (lead_id uuid, board_at timestamptz)
  language sql stable security definer set search_path = ''
  as $$
    select b.lead_id, b.board_at
    from app.lead_board_at_all(app.current_company_id()) b
    join public.leads l on l.company_id = app.current_company_id() and l.id = b.lead_id
    where b.lead_id = any (p_leads) and l.created_by = app.current_user_id()
    order by b.lead_id
  $$;
revoke all on function app.lead_board_dates(uuid[]) from public;
grant execute on function app.lead_board_dates(uuid[]) to quy_hang_app;

-- Đầu chủ của lead trả lại vì số không liên lạc được — kể cả đã ghi gọi lần đầu, tới khi lead lên bảng (Hỏi-4). P0002: không
-- phải lead của người gọi (kể cả lead căn trùng); 23505: đã trả lại; 22023: đã lên bảng.
create or replace function app.return_lead(p_lead uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    -- Khoá đọc bảng chủ nhà trước khi khoá dòng lead (thứ tự khoá như app.lead_board_at_all).
    perform 1 from public.listing_owners where false;
    select * into v from public.leads
      where company_id = app.current_company_id() and id = p_lead
        and matched_agent_user_id = app.current_user_id() and outcome in ('new', 'owner_has_agent') and discarded_at is null
      for update;
    if not found then
      raise exception 'không có lead này của người gọi' using errcode = 'P0002';
    end if;
    if v.returned_at is not null then
      raise exception 'lead đã trả lại' using errcode = '23505';
    end if;
    if exists (select 1 from app.lead_board_at_all(v.company_id) b where b.lead_id = v.id) then
      raise exception 'lead đã lên bảng' using errcode = '22023';
    end if;
    update public.leads set returned_at = now(), returned_by = app.current_user_id()
      where company_id = v.company_id and id = v.id;
  end
  $$;
revoke all on function app.return_lead(uuid) from public;
grant execute on function app.return_lead(uuid) to quy_hang_app;

-- Đánh dấu lead đã trả lại là «đã gửi lại», trỏ lead mới. Lối API tạo lead mới rồi gọi hàm này trong cùng giao dịch; hai lần
-- gửi lại cùng lúc: lần sau chờ khoá dòng rồi thấy lead đã gửi lại. P0002: lead cũ hay lead mới không phải của người gọi ở
-- sàn đang làm; 22023: lead cũ chưa trả lại; 23505: đã gửi lại.
create or replace function app.mark_resubmitted(p_old uuid, p_new uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    select * into v from public.leads
      where company_id = app.current_company_id() and id = p_old and created_by = app.current_user_id()
      for update;
    if not found or p_new = p_old or not exists (
      select 1 from public.leads n
      where n.company_id = app.current_company_id() and n.id = p_new and n.created_by = app.current_user_id()
    ) then
      raise exception 'không có lead này của người gọi' using errcode = 'P0002';
    end if;
    if v.returned_at is null then
      raise exception 'lead chưa trả lại' using errcode = '22023';
    end if;
    if v.resubmitted_at is not null then
      raise exception 'lead đã gửi lại' using errcode = '23505';
    end if;
    update public.leads set resubmitted_at = now(), resubmitted_lead_id = p_new
      where company_id = v.company_id and id = v.id;
  end
  $$;
revoke all on function app.mark_resubmitted(uuid, uuid) from public;
grant execute on function app.mark_resubmitted(uuid, uuid) to quy_hang_app;

-- Số đo «Số ngày lead → Sẵn sàng bán» (Tham chiếu §11): lead của sàn lên bảng trong [từ, đến), lúc nhập lead đầu chuỗi (đi
-- ngược resubmitted_lead_id qua các lần gửi lại), lúc lên bảng, số ngày một chữ số lẻ. Hàm báo cáo cả sàn: chỉ kết nối chủ
-- chạy được — không cấp cho vai API. Không số chủ, không mã hàng.
create or replace function app.lead_board_metric(p_company uuid, p_from timestamptz, p_to timestamptz)
  returns table (lead_id uuid, first_created_at timestamptz, board_at timestamptz, days numeric)
  language sql stable security definer set search_path = ''
  as $$
    with recursive b as (
      select x.lead_id, x.board_at from app.lead_board_at_all(p_company) x
      where x.board_at >= p_from and x.board_at < p_to
    ),
    chuoi as (
      select b.lead_id as goc, l.id, l.created_at
      from b join public.leads l on l.company_id = p_company and l.id = b.lead_id
      union all
      select c.goc, p.id, p.created_at
      from chuoi c join public.leads p on p.company_id = p_company and p.resubmitted_lead_id = c.id
    ),
    dau as (select goc, min(created_at) as first_created_at from chuoi group by goc)
    select b.lead_id, d.first_created_at, b.board_at,
           round(extract(epoch from b.board_at - d.first_created_at) / 86400, 1)
    from b join dau d on d.goc = b.lead_id
    order by b.board_at, b.lead_id
  $$;
revoke all on function app.lead_board_metric(uuid, timestamptz, timestamptz) from public;

-- ---- Năm hàm cũ: lead đã trả lại rời việc của đầu chủ ----

-- (011) Sàn có việc: bỏ lead đã trả lại.
create or replace function app.lead_job_companies() returns table (company_id uuid)
  language sql stable security definer set search_path = ''
  as $$
    select distinct l.company_id
    from public.leads l
    where l.discarded_at is null and l.outcome in ('new', 'owner_has_agent') and l.returned_at is null
      and (l.routing_strategy is null or l.matched_agent_user_id is null or l.accepted_at is null or l.first_called_at is null)
  $$;

-- (011) Lead chờ chia: lead trước cùng số đã trả lại không làm ai thành người của lead trước.
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
                and p.matched_agent_user_id is not null and p.discarded_at is null and p.returned_at is null
            ) x
            where x.dau_chu is not null
            order by x.luc desc
            limit 1)
    from public.leads l
    where l.company_id = app.current_company_id() and l.routing_strategy is not null
      and l.outcome = 'new' and l.matched_agent_user_id is null and l.discarded_at is null
    order by l.created_at, l.id
  $$;

-- (011) Đầu chủ của sàn: lead đã trả lại không là lead đang mở.
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
              and l.outcome in ('new', 'owner_has_agent') and l.discarded_at is null and l.first_called_at is null
              and l.returned_at is null)
    from public.company_members m
    where m.company_id = app.current_company_id() and 'listing_agent' = any (m.roles)
    order by m.user_id
  $$;

-- (011) Dữ kiện hạn: lead đã trả lại không bị báo quá hạn.
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
      and l.outcome in ('new', 'owner_has_agent') and l.discarded_at is null and l.returned_at is null
      and (l.matched_agent_user_id is null or l.accepted_at is null or l.first_called_at is null)
    order by l.created_at, l.id
  $$;

-- (009) Kiểm trùng lúc nhập: số không liên lạc được không neo chủ nhà cho đầu chủ đã trả lại.
create or replace function app.lead_dedupe_facts(p_phone_hash bytea, p_building text, p_unit text, p_open_statuses text[])
  returns table (open_listing_id uuid, open_listing_agent text, owner_agent text)
  language sql stable security definer set search_path = ''
  as $$
    with mo as (
      select l.id,
             (select a.user_id from public.listing_agent_assignments a
              where a.company_id = l.company_id and a.listing_id = l.id order by a.seq desc limit 1) as dau_chu
      from public.listings l
      where l.company_id = app.current_company_id()
        and app.unit_key(p_unit) is not null
        and l.building_name = p_building
        and app.unit_key(l.unit_number) = app.unit_key(p_unit)
        and l.standard_status = any (p_open_statuses)
      order by l.id
      limit 1
    ),
    chu as (
      select dau_chu, luc from (
        -- Chủ nhà mang số này trên một hàng đã có đầu chủ: lần gán mới nhất.
        select (select a.user_id from public.listing_agent_assignments a
                where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) as dau_chu,
               (select a.assigned_at from public.listing_agent_assignments a
                where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) as luc
        from public.listing_owners o
        where o.company_id = app.current_company_id() and o.owner_phone_hash = p_phone_hash
        union all
        -- Lead trước cùng số đã về một đầu chủ, chưa bị bỏ, chưa trả lại.
        select d.matched_agent_user_id, d.created_at
        from public.leads d
        where d.company_id = app.current_company_id() and d.owner_phone_hash = p_phone_hash
          and d.matched_agent_user_id is not null and d.discarded_at is null and d.returned_at is null
      ) x
      where dau_chu is not null
      order by luc desc
      limit 1
    )
    select (select id from mo), (select dau_chu from mo), (select dau_chu from chu)
  $$;
