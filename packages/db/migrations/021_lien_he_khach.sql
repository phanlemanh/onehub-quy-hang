-- 021_lien_he_khach.sql · Liên hệ khách (hàng 86, ADR-0021 sửa đổi 03/11): khách là liên hệ của hàng 85 mang `Buyer` hay
-- `Tenant`; việc của một đầu khách với một khách là một **nhu cầu khách** (RESO `Prospecting`) gắn liên hệ; mỗi **Lần gửi**
-- (một link, bộ căn) gắn một nhu cầu khách hay gửi nhóm môi giới, người gửi là chỗ ghi công. Đầu khách không đọc liên hệ —
-- liên hệ vừa là chủ trọn lớp nguồn (bất biến 2); liên hệ khách không có người giữ (người giữ là của phía chủ nhà, kiểm trùng
-- lead đi qua nó). Số khách vào `contact_phones` bằng bản mã ngữ cảnh `prospects:<sàn>:<nhu cầu>` (ADR-0013).

-- ---- Số của nhu cầu khách: thêm ngữ cảnh mã hoá ----
alter table contact_phones drop constraint contact_phones_enc_context_check;
alter table contact_phones add constraint contact_phones_enc_context_check
  check (enc_context ~ '^(listing_owners|leads|prospects):[0-9a-f-]{36}:[0-9a-f-]{36}$');

-- ---- Nhu cầu khách ----
create table prospects (
  company_id           uuid not null references companies (id) on delete cascade,
  id                   uuid not null default gen_random_uuid(),
  contact_id           uuid not null,
  owner_member_user_id text not null,
  display_name         text not null check (length(btrim(display_name)) between 1 and 200),
  need                 text not null check (need in ('purchase', 'lease', 'purchase_or_lease')),
  criteria             jsonb not null default '{}' check (jsonb_typeof(criteria) = 'object'),
  closed_at            timestamptz,
  created_by           text not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  primary key (company_id, id),
  constraint prospects_contact_fkey foreign key (company_id, contact_id) references contacts (company_id, id)
);
create index prospects_contact_idx on prospects (company_id, contact_id);
create index prospects_owner_idx on prospects (company_id, owner_member_user_id);
alter table prospects enable row level security;
alter table prospects force row level security;
-- Đầu khách giữ (còn vai Đầu khách) hay trưởng nhóm.
create policy prospects_read on prospects for select using (
  company_id = app.current_company_id()
  and ('team_lead' = any (app.current_user_roles())
       or (owner_member_user_id = app.current_user_id() and 'buyer_agent' = any (app.current_user_roles())))
);
grant select on prospects to quy_hang_app;

-- Sự kiện của nhu cầu khách: chỉ thêm (Tham chiếu §4). `inquiry_received` là «khách hỏi» — mốc đầu của số đo hai tuần thử.
create table prospect_events (
  company_id    uuid not null references companies (id) on delete cascade,
  id            uuid not null default gen_random_uuid(),
  prospect_id   uuid not null,
  type          text not null check (type in ('inquiry_received', 'phone_added', 'reassigned', 'closed')),
  actor_user_id text not null,
  actor_roles   text[] not null,
  occurred_at   timestamptz not null default now(),
  payload       jsonb not null default '{}' check (jsonb_typeof(payload) = 'object'),
  primary key (company_id, id),
  constraint prospect_events_prospect_fkey foreign key (company_id, prospect_id) references prospects (company_id, id) on delete cascade
);
create index prospect_events_prospect_idx on prospect_events (company_id, prospect_id, occurred_at);
alter table prospect_events enable row level security;
alter table prospect_events force row level security;
create policy prospect_events_read on prospect_events for select using (
  company_id = app.current_company_id()
  and exists (select 1 from prospects p where p.company_id = prospect_events.company_id and p.id = prospect_events.prospect_id)
);
grant select on prospect_events to quy_hang_app;

-- ---- Lần gửi ----
create table shares (
  company_id     uuid not null references companies (id) on delete cascade,
  id             uuid not null default gen_random_uuid(),
  -- Mã của link `/s/<mã>`: duy nhất toàn hệ — trang khách không biết sàn trước khi đọc mã.
  code           text not null check (code ~ '^[A-Za-z0-9_-]{12}$'),
  sender_user_id text not null,
  audience       text not null check (audience in ('client', 'agents')),
  prospect_id    uuid,
  created_at     timestamptz not null default now(),
  disabled_at    timestamptz,
  primary key (company_id, id),
  constraint shares_code_unique unique (code),
  constraint shares_prospect_fkey foreign key (company_id, prospect_id) references prospects (company_id, id),
  -- Khách riêng có đúng một nhu cầu khách; nhóm môi giới không có.
  constraint shares_audience_prospect check ((audience = 'client') = (prospect_id is not null))
);
create index shares_prospect_idx on shares (company_id, prospect_id, created_at);
create index shares_sender_idx on shares (company_id, sender_user_id, created_at);
alter table shares enable row level security;
alter table shares force row level security;
-- Người gửi, trưởng nhóm, hay người đang thấy nhu cầu khách của Lần gửi (luật đọc của prospects áp trong câu con).
create policy shares_read on shares for select using (
  company_id = app.current_company_id()
  and (sender_user_id = app.current_user_id()
       or 'team_lead' = any (app.current_user_roles())
       or exists (select 1 from prospects p where p.company_id = shares.company_id and p.id = shares.prospect_id))
);
grant select on shares to quy_hang_app;

create table share_listings (
  company_id uuid not null references companies (id) on delete cascade,
  share_id   uuid not null,
  listing_id uuid not null,
  position   int not null check (position between 0 and 29),
  primary key (company_id, share_id, listing_id),
  constraint share_listings_position_once unique (company_id, share_id, position),
  constraint share_listings_share_fkey foreign key (company_id, share_id) references shares (company_id, id) on delete cascade,
  constraint share_listings_listing_fkey foreign key (company_id, listing_id) references listings (company_id, id)
);
alter table share_listings enable row level security;
alter table share_listings force row level security;
create policy share_listings_read on share_listings for select using (
  company_id = app.current_company_id()
  and exists (select 1 from shares s where s.company_id = share_listings.company_id and s.id = share_listings.share_id)
);
grant select on share_listings to quy_hang_app;

-- ---- Ghi: chỉ qua hàm ----
create or replace function app.prospect_types(p_need text) returns text[]
  language sql immutable set search_path = ''
  as $$
    select case p_need when 'purchase' then array['Buyer'] when 'lease' then array['Tenant'] else array['Buyer', 'Tenant'] end
  $$;

create or replace function app.add_prospect_event(p_company uuid, p_prospect uuid, p_type text, p_payload jsonb) returns void
  language sql volatile security definer set search_path = ''
  as $$
    insert into public.prospect_events (company_id, prospect_id, type, actor_user_id, actor_roles, payload)
      values (p_company, p_prospect, p_type, app.current_user_id(), app.current_user_roles(), p_payload)
  $$;
revoke all on function app.add_prospect_event(uuid, uuid, text, jsonb) from public;

-- Đầu khách mở một nhu cầu khách bằng số: số → liên hệ (đường của hàng 85, không người giữ), rồi nhu cầu + «khách hỏi».
-- 42501: người gọi không mang vai Đầu khách.
create or replace function app.open_prospect(p_id uuid, p_hash bytea, p_enc bytea, p_name text, p_need text, p_criteria jsonb)
  returns uuid
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    c uuid;
  begin
    if san is null or not ('buyer_agent' = any (app.current_user_roles())) then
      raise exception 'cần vai Đầu khách' using errcode = '42501';
    end if;
    c := app.contact_for_phone(p_hash, p_enc, 'prospects:' || san || ':' || p_id, app.prospect_types(p_need), null, null);
    insert into public.prospects (company_id, id, contact_id, owner_member_user_id, display_name, need, criteria, created_by)
      values (san, p_id, c, app.current_user_id(), p_name, p_need, p_criteria, app.current_user_id());
    perform app.add_prospect_event(san, p_id, 'inquiry_received', jsonb_build_object('need', p_need));
    return p_id;
  end
  $$;
revoke all on function app.open_prospect(uuid, bytea, bytea, text, text, jsonb) from public;
grant execute on function app.open_prospect(uuid, bytea, bytea, text, text, jsonb) to quy_hang_app;

-- Đầu khách giữ thêm số vào khách của nhu cầu đang mở. Trả 'same' khi số đã thuộc liên hệ ấy, 'added' khi thêm.
-- P0002: không phải nhu cầu đang mở của người gọi; 23505: số thuộc liên hệ khác (không gộp, không nêu liên hệ nào).
create or replace function app.add_prospect_phone(p_prospect uuid, p_hash bytea, p_enc bytea) returns text
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    v public.prospects%rowtype;
    co uuid;
  begin
    select * into v from public.prospects p
      where p.company_id = san and p.id = p_prospect and p.owner_member_user_id = app.current_user_id()
        and 'buyer_agent' = any (app.current_user_roles()) and p.closed_at is null
      for update;
    if not found then
      raise exception 'không có nhu cầu khách này' using errcode = 'P0002';
    end if;
    select x.contact_id into co from public.contact_phones x where x.company_id = san and x.phone_hash = p_hash;
    if co = v.contact_id then
      return 'same';
    elsif co is not null then
      raise exception 'số đã thuộc liên hệ khác' using errcode = '23505';
    end if;
    co := app.contact_for_phone(p_hash, p_enc, 'prospects:' || san || ':' || v.id, app.prospect_types(v.need), null, v.contact_id);
    if co is distinct from v.contact_id then
      raise exception 'số đã thuộc liên hệ khác' using errcode = '23505';
    end if;
    perform app.add_prospect_event(san, v.id, 'phone_added', '{}'::jsonb);
    return 'added';
  end
  $$;
revoke all on function app.add_prospect_phone(uuid, bytea, bytea) from public;
grant execute on function app.add_prospect_phone(uuid, bytea, bytea) to quy_hang_app;

-- Đầu khách giữ hay trưởng nhóm đóng nhu cầu. P0002: không thấy; 23505: đã đóng.
create or replace function app.close_prospect(p_prospect uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    v public.prospects%rowtype;
  begin
    select * into v from public.prospects p
      where p.company_id = san and p.id = p_prospect
        and ('team_lead' = any (app.current_user_roles())
             or (p.owner_member_user_id = app.current_user_id() and 'buyer_agent' = any (app.current_user_roles())))
      for update;
    if not found then
      raise exception 'không có nhu cầu khách này' using errcode = 'P0002';
    end if;
    if v.closed_at is not null then
      raise exception 'nhu cầu khách đã đóng' using errcode = '23505';
    end if;
    update public.prospects set closed_at = now(), updated_at = now() where company_id = san and id = v.id;
    perform app.add_prospect_event(san, v.id, 'closed', '{}'::jsonb);
  end
  $$;
revoke all on function app.close_prospect(uuid) from public;
grant execute on function app.close_prospect(uuid) to quy_hang_app;

-- Trưởng nhóm đổi đầu khách giữ nhu cầu; Lần gửi cũ đi theo nhu cầu, người gửi không đổi.
-- P0002: người gọi không phải trưởng nhóm hay không có nhu cầu; 22023: đích không mang vai Đầu khách.
create or replace function app.reassign_prospect(p_prospect uuid, p_user text) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    v public.prospects%rowtype;
  begin
    if not ('team_lead' = any (app.current_user_roles())) then
      raise exception 'không có nhu cầu khách này' using errcode = 'P0002';
    end if;
    select * into v from public.prospects p where p.company_id = san and p.id = p_prospect for update;
    if not found then
      raise exception 'không có nhu cầu khách này' using errcode = 'P0002';
    end if;
    if not app.member_has_role(p_user, 'buyer_agent') then
      raise exception 'đích không mang vai Đầu khách' using errcode = '22023';
    end if;
    update public.prospects set owner_member_user_id = p_user, updated_at = now() where company_id = san and id = v.id;
    perform app.add_prospect_event(san, v.id, 'reassigned', jsonb_build_object('from', v.owner_member_user_id, 'to', p_user));
  end
  $$;
revoke all on function app.reassign_prospect(uuid, text) from public;
grant execute on function app.reassign_prospect(uuid, text) to quy_hang_app;

-- Tạo một Lần gửi: người gửi là người gọi (vai Đầu khách hay Trưởng nhóm); khách riêng cần nhu cầu đang mở của người gọi;
-- mọi căn đã lên bảng (nấc «Toàn sàn» của hàng 12: từng sang Active). 42501: không vai; P0002: nhu cầu; 22023: căn.
create or replace function app.create_share(p_id uuid, p_code text, p_audience text, p_prospect uuid, p_listings uuid[]) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    i int;
  begin
    if san is null or not (app.current_user_roles() && array['buyer_agent', 'team_lead']) then
      raise exception 'cần vai Đầu khách' using errcode = '42501';
    end if;
    if p_prospect is not null and not exists (
      select 1 from public.prospects p
      where p.company_id = san and p.id = p_prospect and p.owner_member_user_id = app.current_user_id()
        and 'buyer_agent' = any (app.current_user_roles()) and p.closed_at is null
    ) then
      raise exception 'không có nhu cầu khách này' using errcode = 'P0002';
    end if;
    if cardinality(p_listings) = 0 or exists (
      select 1 from unnest(p_listings) l(id)
      where not exists (
        select 1 from public.listing_events e
        where e.company_id = san and e.listing_id = l.id and e.type = 'status_changed' and e.payload ->> 'to' = 'Active'
      )
    ) then
      raise exception 'căn chưa lên bảng' using errcode = '22023';
    end if;
    insert into public.shares (company_id, id, code, sender_user_id, audience, prospect_id)
      values (san, p_id, p_code, app.current_user_id(), p_audience, p_prospect);
    for i in 1 .. cardinality(p_listings) loop
      insert into public.share_listings (company_id, share_id, listing_id, position) values (san, p_id, p_listings[i], i - 1);
    end loop;
  end
  $$;
revoke all on function app.create_share(uuid, text, text, uuid, uuid[]) from public;
grant execute on function app.create_share(uuid, text, text, uuid, uuid[]) to quy_hang_app;

-- (016) Sửa loại liên hệ: thêm vế giữ loại khách — còn nhu cầu đang mở cần `Buyer` / `Tenant` thì không bỏ được (23514).
create or replace function app.set_contact_types(p_contact uuid, p_types text[]) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    v public.contacts%rowtype;
  begin
    perform 1 from public.listing_owners where false;
    select * into v from public.contacts x where x.company_id = san and x.id = p_contact for update;
    -- Người giữ trống không bao giờ khớp (so bằng `is not distinct from`, không để NULL lọt qua điều kiện).
    if not found or not ('team_lead' = any (app.current_user_roles())
                         or (v.owner_member_user_id is not null
                             and v.owner_member_user_id is not distinct from app.current_user_id()
                             and 'listing_agent' = any (app.current_user_roles()))) then
      raise exception 'không có liên hệ này' using errcode = 'P0002';
    end if;
    if not (p_types && array['Seller', 'Landlord']) and app.contact_has_links(san, p_contact, null) then
      raise exception 'liên hệ còn hàng hay lead phải giữ loại chủ nhà' using errcode = '22023';
    end if;
    if exists (
      select 1 from public.prospects p
      where p.company_id = san and p.contact_id = p_contact and p.closed_at is null
        and not (app.prospect_types(p.need) <@ p_types)
    ) then
      raise exception 'liên hệ còn nhu cầu khách đang mở phải giữ loại khách' using errcode = '23514';
    end if;
    update public.contacts set contact_types = app.contact_types_order(p_types), updated_at = now()
      where company_id = san and id = p_contact;
  end
  $$;
