-- 020_lien_he_sua_loai.sql · Liên hệ (hàng 85, ADR-0021): sửa lỗi quyền của app.set_contact_types (016) — liên hệ chưa có
-- người giữ làm phép so người giữ ra NULL, điều kiện từ chối không bật, đầu chủ bất kỳ trong sàn sửa được loại. Chỉ trưởng
-- nhóm, hay người giữ còn vai Đầu chủ, được sửa — như luật đọc của bảng.

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
    update public.contacts set contact_types = app.contact_types_order(p_types), updated_at = now()
      where company_id = san and id = p_contact;
  end
  $$;
