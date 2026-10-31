-- 007_o_nhan_lead.sql · Ô nhận lead và kiểm trùng lúc nhập (Tham chiếu §8 luật 19–21, hàng 24, ADR-0012).
-- Lead là bản ghi riêng, chưa là hàng (Hỏi-4): telesales thấy kết quả của lead, không thấy hàng. Số chủ của lead là lớp
-- source — vai API không được đọc cột số. Cơ sở dữ liệu chỉ chở dữ kiện kiểm trùng; luật quyết kết quả ở packages/core
-- (dedupe). Hàng 62 mã hoá số chủ thì đổi cột owner_phone và thân app.lead_dedupe_facts — phép so số chỉ nằm ở hàm ấy.

-- Mã căn so sau khi bỏ dấu cách, gạch, chấm và viết hoa: «a 02.06» và «A-02.06» là một căn.
create or replace function app.unit_key(p text) returns text
  language sql immutable set search_path = ''
  as $$ select nullif(upper(regexp_replace(coalesce(p, ''), '[^0-9A-Za-z]', '', 'g')), '') $$;
grant execute on function app.unit_key(text) to quy_hang_app;

create table leads (
  id                    uuid primary key,
  company_id            uuid not null references companies (id) on delete cascade,
  created_by            text not null,
  -- Năm mục (luật 19). Tên theo RESO khi có: BuildingName, UnitNumber, ListPrice.
  building_name         text not null check (length(btrim(building_name)) between 1 and 200),
  unit_number           text check (unit_number is null or length(btrim(unit_number)) between 1 and 200),
  need                  text not null check (need in ('sale', 'lease', 'sale_or_lease')),
  list_price            bigint not null check (list_price > 0),
  fee_inclusion         text not null check (fee_inclusion in ('included', 'excluded')),
  desired_listing_time  text not null check (desired_listing_time in ('now', 'within_1_month', 'within_3_months', 'undecided')),
  owner_phone           text not null check (owner_phone ~ '^0[0-9]{9}$'),
  -- Kết quả kiểm trùng lúc nhập (luật 20), ghi một lần.
  outcome               text not null check (outcome in ('new', 'owner_has_agent', 'unit_has_open_listing')),
  matched_agent_user_id text,
  matched_listing_id    uuid,
  created_at            timestamptz not null default now(),
  -- «Bỏ lead này» (L3): chỉ lead căn trùng, chỉ người nhập, một lần; dòng không xoá.
  discarded_by          text,
  discarded_at          timestamptz,
  constraint leads_company_id_unique unique (company_id, id),
  constraint leads_unit_match_has_listing check (outcome <> 'unit_has_open_listing' or matched_listing_id is not null),
  constraint leads_new_has_no_match check (outcome <> 'new' or (matched_agent_user_id is null and matched_listing_id is null)),
  constraint leads_owner_match_has_agent check (outcome <> 'owner_has_agent' or matched_agent_user_id is not null),
  constraint leads_discard_pair check ((discarded_by is null) = (discarded_at is null)),
  constraint leads_discard_only_unit check (discarded_at is null or outcome = 'unit_has_open_listing'),
  constraint leads_matched_listing_fkey foreign key (company_id, matched_listing_id) references listings (company_id, id)
);
create index leads_owner_phone_idx on leads (company_id, owner_phone);
alter table leads enable row level security;
alter table leads force row level security;
-- Người nhập thấy lead của mình; đầu chủ được khớp thấy lead về mình; trưởng nhóm thấy cả sàn.
create policy leads_read on leads for select using (
  company_id = app.current_company_id()
  and (created_by = app.current_user_id()
       or matched_agent_user_id = app.current_user_id()
       or 'team_lead' = any (app.current_user_roles()))
);
create policy leads_insert on leads for insert
  with check (company_id = app.current_company_id() and created_by = app.current_user_id());
-- Cột số KHÔNG cấp quyền đọc cho vai API (chốt 29/10: telesales không thấy lại số sau khi gửi). Không cấp sửa, xoá:
-- bỏ lead đi qua app.discard_lead.
grant select (id, company_id, created_by, building_name, unit_number, need, list_price, fee_inclusion, desired_listing_time,
              outcome, matched_agent_user_id, matched_listing_id, created_at, discarded_by, discarded_at) on leads to quy_hang_app;
grant insert on leads to quy_hang_app;

-- Hai dữ kiện kiểm trùng trong sàn đang làm, đọc bỏ qua luật theo dòng: hàng «Chỉ tôi» của người khác vẫn tính — «mỗi sàn
-- tối đa một hàng đang mở trên một căn» là gốc của kiểm trùng (Tham chiếu §4). Chỉ trả mã và người; không số, không trường
-- nào khác của hàng. p_open_statuses do lõi truyền (OPEN_STATUSES) — luật «hàng mở» chỉ nằm ở lõi.
create or replace function app.lead_dedupe_facts(p_phone text, p_building text, p_unit text, p_open_statuses text[])
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
        where o.company_id = app.current_company_id() and o.owner_phone = p_phone
        union all
        -- Lead trước cùng số đã về một đầu chủ và chưa bị bỏ.
        select d.matched_agent_user_id, d.created_at
        from public.leads d
        where d.company_id = app.current_company_id() and d.owner_phone = p_phone
          and d.matched_agent_user_id is not null and d.discarded_at is null
      ) x
      where dau_chu is not null
      order by luc desc
      limit 1
    )
    select (select id from mo), (select dau_chu from mo), (select dau_chu from chu)
  $$;
revoke all on function app.lead_dedupe_facts(text, text, text, text[]) from public;
grant execute on function app.lead_dedupe_facts(text, text, text, text[]) to quy_hang_app;

-- «Bỏ lead này»: đúng người nhập, đúng lead căn trùng, chưa bỏ. Mỗi ca một mã lỗi để API trả đúng mã HTTP.
create or replace function app.discard_lead(p_lead uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    select * into v from public.leads
      where company_id = app.current_company_id() and id = p_lead and created_by = app.current_user_id()
      for update;
    if not found then
      raise exception 'không có lead này' using errcode = 'P0002';
    end if;
    if v.outcome <> 'unit_has_open_listing' then
      raise exception 'chỉ bỏ được lead căn trùng' using errcode = '22023';
    end if;
    if v.discarded_at is not null then
      raise exception 'lead đã bỏ' using errcode = '23505';
    end if;
    update public.leads set discarded_by = app.current_user_id(), discarded_at = now()
      where company_id = app.current_company_id() and id = p_lead;
  end
  $$;
revoke all on function app.discard_lead(uuid) from public;
grant execute on function app.discard_lead(uuid) to quy_hang_app;
