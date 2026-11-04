-- 033_tat_link_chan_null.sql · Vá `app.disable_share` (migration 032, hàng 36 da-gui — S4 vòng 1 bắt): phiên có sàn mà không
-- có người (`app.user_id` rỗng) làm phép so `sender_user_id <> app.current_user_id()` ra NULL, điều kiện chặn không chạy và
-- hàm security definer tắt được mọi link của sàn. Nay phiên không người bị từ chối trước, và so người bằng `is distinct from`.
create or replace function app.disable_share(p_share uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    nguoi text := app.current_user_id();
    s record;
  begin
    select company_id, sender_user_id, disabled_at into s from public.shares where id = p_share and company_id = san;
    if san is null or not found then
      raise exception 'không có Lần gửi này' using errcode = 'P0002';
    end if;
    if nguoi is null or (s.sender_user_id is distinct from nguoi and not ('team_lead' = any (coalesce(app.current_user_roles(), '{}')))) then
      raise exception 'không được tắt link này' using errcode = '42501';
    end if;
    if s.disabled_at is not null then
      raise exception 'link đã tắt' using errcode = '55000';
    end if;
    update public.shares set disabled_at = now() where id = p_share and company_id = san;
  end
  $$;
revoke all on function app.disable_share(uuid) from public;
grant execute on function app.disable_share(uuid) to quy_hang_app;
