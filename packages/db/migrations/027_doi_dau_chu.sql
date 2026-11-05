-- 027_doi_dau_chu.sql · Đổi đầu chủ hàng loạt (hàng 89, ADR-0021 sửa đổi 05/11): trưởng nhóm đổi đầu chủ của nhiều
-- căn một lần; mọi căn khác của cùng chủ nhà (cùng liên hệ chủ nhà) đi theo, và người giữ liên hệ chủ nhà đổi theo — một
-- chủ một đầu chủ. Mỗi lần đổi ghi lại người giữ cũ của từng căn, từng liên hệ để hoàn tác được một lần. Bảng gán đầu chủ
-- vẫn chỉ thêm dòng; vai API không ghi thẳng bảng lần đổi hay cột người giữ — mọi ghi đi qua ba hàm dưới.

-- ---- Lần đổi đầu chủ ----
create table listing_agent_reassignments (
  company_id    uuid not null references companies (id) on delete cascade,
  id            uuid not null default gen_random_uuid(),
  to_user_id    text not null,
  reassigned_by text not null,
  reassigned_at timestamptz not null default now(),
  undone_by     text,
  undone_at     timestamptz,
  primary key (company_id, id),
  check ((undone_by is null) = (undone_at is null))
);

-- Từng căn, từng liên hệ của một lần đổi, kèm người giữ cũ. `selected` = căn trưởng nhóm đã tích (căn còn lại đi theo vì
-- cùng chủ nhà). `from_user_id` null = trước đó chưa có đầu chủ / người giữ.
create table listing_agent_reassignment_items (
  company_id      uuid not null,
  reassignment_id uuid not null,
  listing_id      uuid,
  contact_id      uuid,
  from_user_id    text,
  selected        boolean not null default false,
  check ((listing_id is null) <> (contact_id is null)),
  constraint listing_agent_reassignment_items_parent_fkey foreign key (company_id, reassignment_id)
    references listing_agent_reassignments (company_id, id) on delete cascade
);
create index listing_agent_reassignment_items_idx on listing_agent_reassignment_items (company_id, reassignment_id);

alter table listing_agent_reassignments enable row level security;
alter table listing_agent_reassignments force row level security;
create policy listing_agent_reassignments_read on listing_agent_reassignments for select
  using (company_id = app.current_company_id());
grant select on listing_agent_reassignments to quy_hang_app;

alter table listing_agent_reassignment_items enable row level security;
alter table listing_agent_reassignment_items force row level security;
create policy listing_agent_reassignment_items_read on listing_agent_reassignment_items for select
  using (company_id = app.current_company_id());
grant select on listing_agent_reassignment_items to quy_hang_app;

-- ---- Tập căn của một lần đổi ----
-- Căn đã tích cộng mọi căn khác có cùng liên hệ chủ nhà; mỗi căn kèm đầu chủ hiện tại và liên hệ chủ nhà.
-- P0002: người gọi không phải trưởng nhóm, hay có mã căn không thuộc sàn đang làm. 22023 'tran': quá 200 căn.
create or replace function app.preview_listing_agent_reassignment(p_listings uuid[])
  returns table (listing_id uuid, selected boolean, from_user_id text, contact_id uuid)
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    so int;
  begin
    if san is null or not ('team_lead' = any (app.current_user_roles())) then
      raise exception 'không có quyền đổi đầu chủ' using errcode = 'P0002';
    end if;
    if p_listings is null or cardinality(p_listings) = 0
       or (select count(*) from public.listings l where l.company_id = san and l.id = any (p_listings))
          <> (select count(distinct x) from unnest(p_listings) x) then
      raise exception 'không có hàng này' using errcode = 'P0002';
    end if;
    create temp table if not exists pg_temp.doi_tap (listing_id uuid primary key, selected boolean) on commit drop;
    truncate pg_temp.doi_tap;
    insert into pg_temp.doi_tap
      select distinct x, true from unnest(p_listings) x;
    insert into pg_temp.doi_tap
      select distinct o2.listing_id, false
      from public.listing_owners o1
      join public.listing_owners o2 on o2.company_id = o1.company_id and o2.contact_id = o1.contact_id
      where o1.company_id = san and o1.listing_id = any (p_listings) and o1.contact_id is not null
      on conflict do nothing;
    select count(*) into so from pg_temp.doi_tap;
    if so > 200 then
      raise exception 'tran' using errcode = '22023';
    end if;
    return query
      select t.listing_id, t.selected,
        (select a.user_id from public.listing_agent_assignments a
          where a.company_id = san and a.listing_id = t.listing_id order by a.seq desc limit 1),
        (select o.contact_id from public.listing_owners o where o.company_id = san and o.listing_id = t.listing_id)
      from pg_temp.doi_tap t
      order by t.selected desc, t.listing_id;
  end
  $$;
revoke all on function app.preview_listing_agent_reassignment(uuid[]) from public;
grant execute on function app.preview_listing_agent_reassignment(uuid[]) to quy_hang_app;

-- ---- Đổi ----
-- Một giao dịch: thêm dòng gán cho căn đang do người khác giữ, đổi người giữ của từng liên hệ chủ nhà, ghi lần đổi.
-- 22023 'nguoi-nhan': người nhận không mang vai Đầu chủ của sàn đang làm. Trả mã lần đổi.
create or replace function app.reassign_listing_agents(p_listings uuid[], p_user text) returns uuid
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    toi text := app.current_user_id();
    lan uuid;
    r record;
  begin
    if san is null or not ('team_lead' = any (app.current_user_roles())) then
      raise exception 'không có quyền đổi đầu chủ' using errcode = 'P0002';
    end if;
    if p_user is null or not app.member_has_role(p_user, 'listing_agent') then
      raise exception 'nguoi-nhan' using errcode = '22023';
    end if;
    insert into public.listing_agent_reassignments (company_id, to_user_id, reassigned_by)
      values (san, p_user, toi) returning id into lan;
    for r in select * from app.preview_listing_agent_reassignment(p_listings) loop
      insert into public.listing_agent_reassignment_items (company_id, reassignment_id, listing_id, from_user_id, selected)
        values (san, lan, r.listing_id, r.from_user_id, r.selected);
      if r.from_user_id is distinct from p_user then
        insert into public.listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by)
          values (san, r.listing_id,
                  (select coalesce(max(a.seq), 0) + 1 from public.listing_agent_assignments a
                    where a.company_id = san and a.listing_id = r.listing_id),
                  p_user, toi);
      end if;
    end loop;
    for r in
      select distinct c.id, c.owner_member_user_id
      from public.listing_agent_reassignment_items i
      join public.listing_owners o on o.company_id = i.company_id and o.listing_id = i.listing_id
      join public.contacts c on c.company_id = o.company_id and c.id = o.contact_id
      where i.company_id = san and i.reassignment_id = lan
    loop
      insert into public.listing_agent_reassignment_items (company_id, reassignment_id, contact_id, from_user_id)
        values (san, lan, r.id, r.owner_member_user_id);
      if r.owner_member_user_id is distinct from p_user then
        update public.contacts set owner_member_user_id = p_user, updated_at = now() where company_id = san and id = r.id;
      end if;
    end loop;
    return lan;
  end
  $$;
revoke all on function app.reassign_listing_agents(uuid[], text) from public;
grant execute on function app.reassign_listing_agents(uuid[], text) to quy_hang_app;

-- ---- Hoàn tác ----
-- Trả người giữ cũ cho căn và liên hệ còn đang do người nhận giữ. Căn trước chưa có đầu chủ giữ người nhận (bảng gán chỉ
-- thêm dòng), và liên hệ của cùng chủ nhà với căn ấy cũng giữ người nhận cho nhất quán (Hỏi-2). Căn, liên hệ đã đổi tiếp
-- thì giữ nguyên, được đếm bỏ qua. P0002: không có lần đổi này (hay không phải trưởng nhóm); 55000 'da-hoan-tac'.
create or replace function app.undo_listing_agent_reassignment(p_id uuid)
  returns table (restored int, skipped int, kept_no_prior_agent int)
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    toi text := app.current_user_id();
    v public.listing_agent_reassignments%rowtype;
    tra int := 0;
    bo int := 0;
    giu int := 0;
    r record;
    hien text;
    giu_lien_he uuid[];
  begin
    if san is null or not ('team_lead' = any (app.current_user_roles())) then
      raise exception 'không có lần đổi này' using errcode = 'P0002';
    end if;
    select * into v from public.listing_agent_reassignments x where x.company_id = san and x.id = p_id for update;
    if not found then
      raise exception 'không có lần đổi này' using errcode = 'P0002';
    end if;
    if v.undone_at is not null then
      raise exception 'da-hoan-tac' using errcode = '55000';
    end if;
    -- Liên hệ của căn trước chưa có đầu chủ: giữ người nhận.
    select coalesce(array_agg(distinct o.contact_id), '{}') into giu_lien_he
    from public.listing_agent_reassignment_items i
    join public.listing_owners o on o.company_id = i.company_id and o.listing_id = i.listing_id
    where i.company_id = san and i.reassignment_id = p_id and i.listing_id is not null and i.from_user_id is null
      and o.contact_id is not null;
    for r in
      select i.listing_id, i.from_user_id from public.listing_agent_reassignment_items i
      where i.company_id = san and i.reassignment_id = p_id and i.listing_id is not null
    loop
      if r.from_user_id is null then
        giu := giu + 1;
        continue;
      end if;
      if r.from_user_id = v.to_user_id then
        continue;
      end if;
      select a.user_id into hien from public.listing_agent_assignments a
        where a.company_id = san and a.listing_id = r.listing_id order by a.seq desc limit 1;
      if hien is distinct from v.to_user_id or not app.member_has_role(r.from_user_id, 'listing_agent') then
        bo := bo + 1;
        continue;
      end if;
      insert into public.listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by)
        values (san, r.listing_id,
                (select coalesce(max(a.seq), 0) + 1 from public.listing_agent_assignments a
                  where a.company_id = san and a.listing_id = r.listing_id),
                r.from_user_id, toi);
      tra := tra + 1;
    end loop;
    for r in
      select i.contact_id, i.from_user_id from public.listing_agent_reassignment_items i
      where i.company_id = san and i.reassignment_id = p_id and i.contact_id is not null
    loop
      if r.contact_id = any (giu_lien_he) or r.from_user_id is not distinct from v.to_user_id then
        continue;
      end if;
      select c.owner_member_user_id into hien from public.contacts c where c.company_id = san and c.id = r.contact_id;
      if hien is distinct from v.to_user_id then
        bo := bo + 1;
        continue;
      end if;
      update public.contacts set owner_member_user_id = r.from_user_id, updated_at = now()
        where company_id = san and id = r.contact_id;
      tra := tra + 1;
    end loop;
    update public.listing_agent_reassignments set undone_by = toi, undone_at = now() where company_id = san and id = p_id;
    return query select tra, bo, giu;
  end
  $$;
revoke all on function app.undo_listing_agent_reassignment(uuid) from public;
grant execute on function app.undo_listing_agent_reassignment(uuid) to quy_hang_app;
