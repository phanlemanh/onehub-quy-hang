-- 037_gui_can_da_go.sql · Căn đã gỡ khi hoàn tác lần nhập (`listings.voided`, migration 025, hàng 66) không vào được Lần gửi
-- mới và không nhận «Quan tâm» (hàng vá va-gui-can-da-go — Ngoài-2 hàng 66, luật 65 của đợt). Thay `app.create_share` (021)
-- và `app.record_share_event` (031): giữ chữ ký, `security definer`, `search_path` rỗng, quyền và mã lỗi; chỉ thêm điều kiện
-- căn chưa gỡ. Chặn ở tầng dữ liệu, không ẩn ở giao diện (bất biến 4).

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
    -- Mọi căn đã lên bảng và chưa gỡ khỏi Quỹ hàng (037: căn `voided` không gửi được).
    if cardinality(p_listings) = 0 or exists (
      select 1 from unnest(p_listings) l(id)
      where not exists (
        select 1 from public.listing_events e
        where e.company_id = san and e.listing_id = l.id and e.type = 'status_changed' and e.payload ->> 'to' = 'Active'
      ) or exists (
        select 1 from public.listings x where x.company_id = san and x.id = l.id and x.voided
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

create or replace function app.record_share_event(p_code text, p_type text, p_listing uuid, p_visitor text) returns boolean
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    s record;
    n int;
  begin
    select * into s from app.share_by_code(p_code);
    if not found or not s.active then
      raise exception 'không có Lần gửi này' using errcode = 'P0002';
    end if;
    if p_type = 'link_opened' then
      if p_listing is not null then raise exception 'lượt mở không gắn căn' using errcode = '22023'; end if;
      insert into public.share_events (company_id, share_id, type, visitor)
        values (s.company_id, s.share_id, p_type, p_visitor)
        on conflict (company_id, share_id, visitor, day) where type = 'link_opened' do nothing;
    elsif p_type = 'interest' then
      if p_listing is null then raise exception 'quan tâm cần căn' using errcode = '22023'; end if;
      -- Căn còn Đang bán và chưa gỡ khỏi Quỹ hàng (037).
      if not exists (
        select 1 from public.share_listings sl join public.listings l on l.company_id = sl.company_id and l.id = sl.listing_id
         where sl.company_id = s.company_id and sl.share_id = s.share_id and sl.listing_id = p_listing and l.standard_status = 'Active'
           and not l.voided
      ) then
        raise exception 'căn không quan tâm được' using errcode = '23514';
      end if;
      insert into public.share_events (company_id, share_id, type, listing_id, visitor)
        values (s.company_id, s.share_id, p_type, p_listing, p_visitor)
        on conflict (company_id, share_id, listing_id, visitor) where type = 'interest' do nothing;
    else
      raise exception 'loại sự kiện lạ' using errcode = '22023';
    end if;
    get diagnostics n = row_count;
    return n > 0;
  end
  $$;
revoke all on function app.record_share_event(text, text, uuid, text) from public;
grant execute on function app.record_share_event(text, text, uuid, text) to quy_hang_app;
