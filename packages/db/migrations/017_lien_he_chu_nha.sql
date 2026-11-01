-- 017_lien_he_chu_nha.sql · Liên hệ (hàng 85, ADR-0021), phần nối tiếp 016: ghi chủ nhà của hàng ra liên hệ kể cả khi chưa
-- có số, mang tên chủ nhà; «Bỏ lead» bỏ người giữ của liên hệ khi người ấy không còn liên kết nào (cùng luật trả lại, ADR-0020).

-- Chủ nhà của hàng → liên hệ: có số thì đi app.contact_for_phone; chưa có số thì giữ liên hệ cũ của dòng hay tạo liên hệ
-- mới mang `Seller`. Tên của liên hệ là tên ghi lần sau cùng. Trả mã liên hệ.
create or replace function app.contact_for_owner(p_hash bytea, p_enc bytea, p_ctx text, p_name text, p_holder text, p_existing uuid)
  returns uuid
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    c uuid;
  begin
    if san is null or app.current_user_id() is null then
      raise exception 'chưa có sàn đang làm' using errcode = '42501';
    end if;
    if p_hash is not null then
      c := app.contact_for_phone(p_hash, p_enc, p_ctx, '{Seller}', p_holder, null);
    elsif p_existing is not null and exists (select 1 from public.contacts x where x.company_id = san and x.id = p_existing) then
      c := p_existing;
    else
      insert into public.contacts (company_id, contact_types, owner_member_user_id, created_by)
        values (san, '{Seller}',
                case when p_holder is not null and app.member_has_role(p_holder, 'listing_agent') then p_holder end,
                app.current_user_id())
        returning id into c;
    end if;
    update public.contacts set full_name = p_name, updated_at = now() where company_id = san and id = c;
    return c;
  end
  $$;
revoke all on function app.contact_for_owner(bytea, bytea, text, text, text, uuid) from public;
grant execute on function app.contact_for_owner(bytea, bytea, text, text, text, uuid) to quy_hang_app;

-- (007) «Bỏ lead này»: thân như cũ, thêm bỏ người giữ khi liên hệ không còn liên kết nào khác.
create or replace function app.discard_lead(p_lead uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    perform 1 from public.listing_owners where false;
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
    if v.contact_id is not null and not app.contact_has_links(v.company_id, v.contact_id, v.id) then
      update public.contacts set owner_member_user_id = null, updated_at = now()
        where company_id = v.company_id and id = v.contact_id;
    end if;
  end
  $$;
