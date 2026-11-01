-- 016_lien_he.sql · Liên hệ (hàng 85, ADR-0021): mỗi người làm việc với sàn là một liên hệ theo RESO `Contacts` — một
-- người, nhiều số (RESO `OtherPhone`), một hay nhiều loại (`ContactType`), một người giữ (`OwnerMemberKey`). Lead và chủ
-- nhà của hàng gắn liên hệ; kiểm trùng, người giữ và «lên bảng» đi qua liên hệ. Liên hệ chủ nhà là lớp nguồn (bất biến 2).
-- Khoá số không vào cơ sở dữ liệu (ADR-0013): số chuyển từ dữ liệu cũ chép nguyên bản mã kèm ngữ cảnh mã hoá gốc.

-- ---- Liên hệ ----
create table contacts (
  company_id           uuid not null references companies (id) on delete cascade,
  id                   uuid not null default gen_random_uuid(),
  full_name            text check (full_name is null or length(btrim(full_name)) between 1 and 200),
  contact_types        text[] not null
    check (cardinality(contact_types) > 0 and contact_types <@ array['Seller', 'Landlord', 'Buyer', 'Tenant']),
  owner_member_user_id text,
  -- Chỗ trường riêng theo loại liên hệ — giữ rỗng tới hàng 47 (ADR-0018 quyết định 8 cấm lớp nguồn; xem ADR-0021).
  custom               jsonb not null default '{}' check (custom = '{}'::jsonb),
  created_by           text not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  primary key (company_id, id),
  constraint contacts_company_id_unique unique (company_id, id)
);
alter table contacts enable row level security;
alter table contacts force row level security;
-- Liên hệ chủ nhà trọn lớp nguồn: trưởng nhóm, hay người giữ còn vai Đầu chủ. Chưa có người giữ → chỉ trưởng nhóm.
create policy contacts_read on contacts for select using (
  company_id = app.current_company_id()
  and ('team_lead' = any (app.current_user_roles())
       or (owner_member_user_id = app.current_user_id() and 'listing_agent' = any (app.current_user_roles())))
);
grant select on contacts to quy_hang_app;

create table contact_phones (
  company_id  uuid not null,
  id          uuid not null default gen_random_uuid(),
  contact_id  uuid not null,
  phone_enc   bytea not null check (get_byte(phone_enc, 0) = 1 and octet_length(phone_enc) between 39 and 64),
  phone_hash  bytea not null check (octet_length(phone_hash) = 32),
  -- Chuỗi ngữ cảnh mã hoá của chính bản mã (`listing_owners:<sàn>:<hàng>`, `leads:<sàn>:<lead>`): giải mã luôn đọc nó.
  enc_context text not null check (enc_context ~ '^(listing_owners|leads):[0-9a-f-]{36}:[0-9a-f-]{36}$'),
  label       text not null default 'Mobile' check (label in ('Home', 'Mobile', 'Work', 'Other')),
  is_primary  boolean not null,
  added_by    text not null,
  added_at    timestamptz not null default now(),
  primary key (company_id, id),
  constraint contact_phones_contact_fkey foreign key (company_id, contact_id) references contacts (company_id, id) on delete cascade,
  constraint contact_phones_one_hash unique (company_id, phone_hash)
);
create unique index contact_phones_one_primary on contact_phones (company_id, contact_id) where is_primary;
alter table contact_phones enable row level security;
alter table contact_phones force row level security;
create policy contact_phones_read on contact_phones for select using (
  company_id = app.current_company_id()
  and exists (select 1 from contacts c where c.company_id = contact_phones.company_id and c.id = contact_phones.contact_id)
);
-- Vai API không đọc bản mã, dấu vết, ngữ cảnh; không ghi thẳng — ghi qua app.contact_for_phone.
grant select (company_id, id, contact_id, label, is_primary, added_at) on contact_phones to quy_hang_app;

-- ---- Nối lead, chủ nhà của hàng, hàng với liên hệ ----
alter table leads add column contact_id uuid,
  add constraint leads_contact_fkey foreign key (company_id, contact_id) references contacts (company_id, id);
create index leads_contact_idx on leads (company_id, contact_id);
grant select (contact_id) on leads to quy_hang_app;

alter table listing_owners add column contact_id uuid,
  add constraint listing_owners_contact_fkey foreign key (company_id, contact_id) references contacts (company_id, id);
create index listing_owners_contact_idx on listing_owners (company_id, contact_id);
-- Hàng tạo từ lead chưa có tên chủ nhà: tên thuộc liên hệ.
alter table listing_owners alter column owner_name drop not null;
grant select (contact_id) on listing_owners to quy_hang_app;
grant insert (contact_id) on listing_owners to quy_hang_app;
grant update (contact_id) on listing_owners to quy_hang_app;

-- Hàng tạo từ lead: một bảng nối riêng — bảng hàng chỉ mang cột tính từ sự kiện (ADR-0008). Một lead một hàng, một hàng
-- một lead. Đọc: cả sàn; thêm: người tạo hàng, ghi đúng tên mình; không sửa, không xoá.
create table lead_listings (
  company_id uuid not null references companies (id) on delete cascade,
  lead_id    uuid not null,
  listing_id uuid not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  primary key (company_id, lead_id),
  constraint lead_listings_listing_once unique (company_id, listing_id),
  constraint lead_listings_lead_fkey foreign key (company_id, lead_id) references leads (company_id, id),
  constraint lead_listings_listing_fkey foreign key (company_id, listing_id) references listings (company_id, id) on delete cascade
);
alter table lead_listings enable row level security;
alter table lead_listings force row level security;
create policy lead_listings_read on lead_listings for select using (company_id = app.current_company_id());
create policy lead_listings_insert on lead_listings for insert
  with check (company_id = app.current_company_id() and created_by = app.current_user_id());
grant select, insert on lead_listings to quy_hang_app;

-- ---- Ghi liên hệ ----
create or replace function app.contact_types_order(p_types text[]) returns text[]
  language sql immutable set search_path = ''
  as $$
    select coalesce(array_agg(t order by array_position(array['Seller', 'Landlord', 'Buyer', 'Tenant'], t)), '{}')
    from (select distinct unnest(p_types) as t) x
  $$;

-- Tìm liên hệ của một số theo dấu vết; có thì cộng loại và đặt người giữ khi đang trống; chưa có thì thêm số vào `p_into`
-- (số phụ) hay tạo liên hệ mới (số chính). Hai giao dịch cùng số: ràng buộc duy nhất giữ một liên hệ, bên sau đọc lại.
create or replace function app.contact_for_phone(p_hash bytea, p_enc bytea, p_ctx text, p_types text[], p_holder text, p_into uuid)
  returns uuid
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    c uuid;
    giu text := case when p_holder is not null and app.member_has_role(p_holder, 'listing_agent') then p_holder end;
  begin
    if san is null or app.current_user_id() is null then
      raise exception 'chưa có sàn đang làm' using errcode = '42501';
    end if;
    select p.contact_id into c from public.contact_phones p where p.company_id = san and p.phone_hash = p_hash;
    if c is null then
      if p_into is not null then
        if not exists (select 1 from public.contacts x where x.company_id = san and x.id = p_into) then
          raise exception 'không có liên hệ này' using errcode = 'P0002';
        end if;
        c := p_into;
      else
        insert into public.contacts (company_id, contact_types, owner_member_user_id, created_by)
          values (san, app.contact_types_order(p_types), giu, app.current_user_id())
          returning id into c;
      end if;
      insert into public.contact_phones (company_id, contact_id, phone_enc, phone_hash, enc_context, is_primary, added_by)
        values (san, c, p_enc, p_hash, p_ctx,
                not exists (select 1 from public.contact_phones q where q.company_id = san and q.contact_id = c and q.is_primary),
                app.current_user_id())
        on conflict on constraint contact_phones_one_hash do nothing;
      if not found then
        -- Giao dịch khác vừa ghi cùng số: bỏ liên hệ mới tạo (nếu có), trả liên hệ của số.
        if p_into is null then
          delete from public.contacts x where x.company_id = san and x.id = c;
        end if;
        select p.contact_id into c from public.contact_phones p where p.company_id = san and p.phone_hash = p_hash;
      end if;
    end if;
    update public.contacts x
      set contact_types = app.contact_types_order(x.contact_types || p_types),
          owner_member_user_id = coalesce(x.owner_member_user_id, giu),
          updated_at = now()
      where x.company_id = san and x.id = c;
    return c;
  end
  $$;
revoke all on function app.contact_for_phone(bytea, bytea, text, text[], text, uuid) from public;
grant execute on function app.contact_for_phone(bytea, bytea, text, text[], text, uuid) to quy_hang_app;

-- Liên hệ còn liên kết: chủ nhà của một hàng, hay một lead đang mở (không trùng hay chủ trùng, chưa bỏ, chưa trả lại).
create or replace function app.contact_has_links(p_company uuid, p_contact uuid, p_except_lead uuid) returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select exists (select 1 from public.listing_owners o where o.company_id = p_company and o.contact_id = p_contact)
        or exists (select 1 from public.leads l where l.company_id = p_company and l.contact_id = p_contact
                   and l.id is distinct from p_except_lead and l.outcome in ('new', 'owner_has_agent')
                   and l.discarded_at is null and l.returned_at is null)
  $$;
revoke all on function app.contact_has_links(uuid, uuid, uuid) from public;

-- Người giữ (còn vai Đầu chủ) hay trưởng nhóm đổi loại. P0002: không thấy liên hệ; 22023: còn liên kết mà bỏ hết loại chủ nhà.
create or replace function app.set_contact_types(p_contact uuid, p_types text[]) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    v public.contacts%rowtype;
  begin
    perform 1 from public.listing_owners where false;
    select * into v from public.contacts x where x.company_id = san and x.id = p_contact for update;
    if not found or not ('team_lead' = any (app.current_user_roles())
                         or (v.owner_member_user_id = app.current_user_id() and 'listing_agent' = any (app.current_user_roles()))) then
      raise exception 'không có liên hệ này' using errcode = 'P0002';
    end if;
    if not (p_types && array['Seller', 'Landlord']) and app.contact_has_links(san, p_contact, null) then
      raise exception 'liên hệ còn hàng hay lead phải giữ loại chủ nhà' using errcode = '22023';
    end if;
    update public.contacts set contact_types = app.contact_types_order(p_types), updated_at = now()
      where company_id = san and id = p_contact;
  end
  $$;
revoke all on function app.set_contact_types(uuid, text[]) from public;
grant execute on function app.set_contact_types(uuid, text[]) to quy_hang_app;

-- Đầu chủ của lead tạo hàng từ lead: trả toà, căn, liên hệ. P0002: không phải lead của người gọi; 22023: trả lại, bỏ hay căn
-- trùng; 23505: lead đã có hàng.
create or replace function app.lead_for_listing(p_lead uuid)
  returns table (building_name text, unit_number text, contact_id uuid)
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    perform 1 from public.listing_owners where false;
    select * into v from public.leads l
      where l.company_id = app.current_company_id() and l.id = p_lead and l.matched_agent_user_id = app.current_user_id()
      for update;
    if not found then
      raise exception 'không có lead này của người gọi' using errcode = 'P0002';
    end if;
    if v.returned_at is not null or v.discarded_at is not null or v.outcome not in ('new', 'owner_has_agent') then
      raise exception 'lead không tạo hàng được' using errcode = '22023';
    end if;
    if exists (select 1 from public.lead_listings x where x.company_id = v.company_id and x.lead_id = v.id) then
      raise exception 'lead đã có hàng' using errcode = '23505';
    end if;
    return query select v.building_name, v.unit_number, v.contact_id;
  end
  $$;
revoke all on function app.lead_for_listing(uuid) from public;
grant execute on function app.lead_for_listing(uuid) to quy_hang_app;

-- ---- Năm hàm cũ đi qua liên hệ ----

-- (015) Lên bảng là dữ kiện: lần đầu hàng mang mã lead sang Sẵn sàng bán (Hỏi-2). Đọc bảng chủ nhà trước bảng lead.
create or replace function app.lead_board_at_all(p_company uuid) returns table (lead_id uuid, board_at timestamptz)
  language sql stable security definer set search_path = ''
  as $$
    select l.id, min(e.occurred_at)
    from public.listing_owners o
    join public.lead_listings x on x.company_id = o.company_id and x.listing_id = o.listing_id
    join public.listing_events e on e.company_id = x.company_id and e.listing_id = x.listing_id
    join public.leads l on l.company_id = x.company_id and l.id = x.lead_id
    where o.company_id = p_company
      and e.type = 'status_changed' and e.payload ->> 'to' = 'Active'
      and l.discarded_at is null and l.returned_at is null
    group by l.id
  $$;

-- (015) Trả lại: thêm bỏ người giữ khi liên hệ không còn liên kết nào khác (ADR-0020 «số đã trả không neo chủ nhà»).
create or replace function app.return_lead(p_lead uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
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
    if v.contact_id is not null and not app.contact_has_links(v.company_id, v.contact_id, v.id) then
      update public.contacts set owner_member_user_id = null, updated_at = now()
        where company_id = v.company_id and id = v.contact_id;
    end if;
  end
  $$;

-- (015) Kiểm trùng lúc nhập: vế chủ đi qua liên hệ — số → liên hệ → người giữ. Vế căn trùng giữ nguyên.
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
    lien_he as (
      select c.owner_member_user_id as giu
      from public.contact_phones p
      join public.contacts c on c.company_id = p.company_id and c.id = p.contact_id
      where p.company_id = app.current_company_id() and p.phone_hash = p_phone_hash
    ),
    -- Số chưa thuộc liên hệ nào (dữ liệu trước khi chuyển): luật của 015 — hàng có chủ nhà mang số, lead trước chưa trả lại.
    cu as (
      select dau_chu from (
        select (select a.user_id from public.listing_agent_assignments a
                where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) as dau_chu,
               (select a.assigned_at from public.listing_agent_assignments a
                where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) as luc
        from public.listing_owners o
        where o.company_id = app.current_company_id() and o.owner_phone_hash = p_phone_hash
        union all
        select d.matched_agent_user_id, d.created_at
        from public.leads d
        where d.company_id = app.current_company_id() and d.owner_phone_hash = p_phone_hash
          and d.matched_agent_user_id is not null and d.discarded_at is null and d.returned_at is null
      ) x
      where dau_chu is not null
      order by luc desc
      limit 1
    )
    select (select id from mo), (select dau_chu from mo),
           case when exists (select 1 from lien_he) then (select giu from lien_he) else (select dau_chu from cu) end
  $$;

-- (011) Nhịp chia: chia xong thì liên hệ của lead nhận người giữ khi đang trống.
create or replace function app.route_lead(p_lead uuid, p_agent text, p_now timestamptz) returns boolean
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    c uuid;
  begin
    update public.leads
      set matched_agent_user_id = p_agent, routed_at = p_now, routed_seq = nextval('app.lead_routing_seq')
      where company_id = app.current_company_id() and id = p_lead and routing_strategy is not null
        and outcome = 'new' and matched_agent_user_id is null and discarded_at is null
        and app.member_has_role(p_agent, 'listing_agent')
      returning contact_id into c;
    if not found then
      return false;
    end if;
    update public.contacts set owner_member_user_id = p_agent, updated_at = now()
      where company_id = app.current_company_id() and id = c and owner_member_user_id is null;
    return true;
  end
  $$;

-- (011) Kho chung: đầu chủ tự nhận — liên hệ nhận người giữ khi đang trống.
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
    update public.contacts set owner_member_user_id = app.current_user_id(), updated_at = now()
      where company_id = v.company_id and id = v.contact_id and owner_member_user_id is null;
  end
  $$;

-- (011) Trưởng nhóm giao lead: liên hệ nhận người giữ khi đang trống (Hỏi-3: không đổi người giữ đã có).
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
    update public.contacts set owner_member_user_id = p_agent, updated_at = now()
      where company_id = v.company_id and id = v.contact_id and owner_member_user_id is null;
    return moc;
  end
  $$;

-- ---- Chuyển dữ liệu cũ (Hỏi-1) ----
-- Mỗi dấu vết số của một sàn thành đúng một liên hệ; chủ nhà của hàng không số thành liên hệ riêng. Người giữ = đầu chủ có
-- mốc gán (hàng) hay mốc chia (lead chưa trả lại) mới nhất. Bản mã chép kèm ngữ cảnh gốc. Cột cũ không đổi. Chạy lại không đổi
-- gì. Chạy bằng kết nối chủ (migration gọi một lần); không cấp cho vai API.
create or replace function app.lien_he_chuyen_du_lieu(p_company uuid default null)
  returns table (company_id uuid, leads int, contacts int, gop int)
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid;
    r record;
    c uuid;
    n_lead int;
    n_lh int;
    n_gop int;
  begin
    for san in select x.id from public.companies x where p_company is null or x.id = p_company order by x.id loop
      -- Nguồn số: chủ nhà của hàng và lead chưa gắn liên hệ, mỗi dấu vết một nhóm.
      for r in
        with nguon as (
          select o.owner_phone_hash h, o.owner_phone_enc enc, 'listing_owners:' || san || ':' || o.listing_id ctx,
                 o.updated_at moc_ghi, array['Seller'] loai, o.owner_name ten,
                 (select a.user_id from public.listing_agent_assignments a
                  where a.company_id = san and a.listing_id = o.listing_id order by a.seq desc limit 1) dau_chu,
                 (select a.assigned_at from public.listing_agent_assignments a
                  where a.company_id = san and a.listing_id = o.listing_id order by a.seq desc limit 1) moc
          from public.listing_owners o where o.company_id = san and o.owner_phone_hash is not null
          union all
          select l.owner_phone_hash, l.owner_phone_enc, 'leads:' || san || ':' || l.id, l.created_at,
                 case l.need when 'sale' then array['Seller'] when 'lease' then array['Landlord'] else array['Seller', 'Landlord'] end,
                 null, case when l.returned_at is null and l.discarded_at is null then l.matched_agent_user_id end,
                 coalesce(l.routed_at, l.created_at)
          from public.leads l where l.company_id = san and l.owner_phone_hash is not null and l.owner_phone_enc is not null
        )
        select n.h,
               (array_agg(n.enc order by n.moc_ghi))[1] enc,
               (array_agg(n.ctx order by n.moc_ghi))[1] ctx,
               app.contact_types_order(array(select unnest(n2.loai) from nguon n2 where n2.h = n.h)) loai,
               (array_agg(n.ten order by n.moc_ghi desc) filter (where n.ten is not null))[1] ten,
               (array_agg(n.dau_chu order by n.moc desc) filter (where n.dau_chu is not null))[1] giu
        from nguon n group by n.h
      loop
        select p.contact_id into c from public.contact_phones p where p.company_id = san and p.phone_hash = r.h;
        if c is null then
          insert into public.contacts (company_id, full_name, contact_types, owner_member_user_id, created_by)
            values (san, r.ten, r.loai, r.giu, 'lien-he-chuyen-du-lieu') returning id into c;
          insert into public.contact_phones (company_id, contact_id, phone_enc, phone_hash, enc_context, is_primary, added_by)
            values (san, c, r.enc, r.h, r.ctx, true, 'lien-he-chuyen-du-lieu');
        end if;
        update public.listing_owners set contact_id = c where company_id = san and owner_phone_hash = r.h and contact_id is null;
        update public.leads set contact_id = c where company_id = san and owner_phone_hash = r.h and contact_id is null;
      end loop;
      -- Chủ nhà của hàng chưa có số: một liên hệ riêng mang tên.
      for r in select o.listing_id, o.owner_name,
                      (select a.user_id from public.listing_agent_assignments a
                       where a.company_id = san and a.listing_id = o.listing_id order by a.seq desc limit 1) giu
               from public.listing_owners o where o.company_id = san and o.contact_id is null loop
        insert into public.contacts (company_id, full_name, contact_types, owner_member_user_id, created_by)
          values (san, r.owner_name, array['Seller'], r.giu, 'lien-he-chuyen-du-lieu') returning id into c;
        update public.listing_owners set contact_id = c where company_id = san and listing_id = r.listing_id;
      end loop;
      select count(*) into n_lead from public.leads l where l.company_id = san;
      select count(*) into n_lh from public.contacts x where x.company_id = san;
      select count(*) into n_gop from app.lien_he_gop_cua(san);
      raise notice 'lien-he: sàn % · lead % · liên hệ % · gộp từ nhiều đầu chủ %', san, n_lead, n_lh, n_gop;
      company_id := san; leads := n_lead; contacts := n_lh; gop := n_gop;
      return next;
    end loop;
  end
  $$;
revoke all on function app.lien_he_chuyen_du_lieu(uuid) from public;

-- Liên hệ mà các hàng và lead đang mở của họ đứng tên nhiều đầu chủ khác nhau.
create or replace function app.lien_he_gop_cua(p_company uuid) returns table (contact_id uuid, agents text[])
  language sql stable security definer set search_path = ''
  as $$
    select x.cid, array_agg(distinct x.agent order by x.agent)
    from (
      select o.contact_id cid,
             (select a.user_id from public.listing_agent_assignments a
              where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) agent
      from public.listing_owners o where o.company_id = p_company and o.contact_id is not null
      union all
      select l.contact_id, l.matched_agent_user_id from public.leads l
      where l.company_id = p_company and l.contact_id is not null and l.matched_agent_user_id is not null
        and l.returned_at is null and l.discarded_at is null
    ) x
    where x.agent is not null
    group by x.cid
    having count(distinct x.agent) > 1
  $$;
revoke all on function app.lien_he_gop_cua(uuid) from public;

-- Danh sách gộp cho trưởng nhóm của sàn đang làm.
create or replace function app.lien_he_gop_nhieu_dau_chu() returns table (contact_id uuid, agents text[])
  language sql stable security definer set search_path = ''
  as $$
    select g.contact_id, g.agents from app.lien_he_gop_cua(app.current_company_id()) g
    where 'team_lead' = any (app.current_user_roles())
  $$;
revoke all on function app.lien_he_gop_nhieu_dau_chu() from public;
grant execute on function app.lien_he_gop_nhieu_dau_chu() to quy_hang_app;

select * from app.lien_he_chuyen_du_lieu(null);
