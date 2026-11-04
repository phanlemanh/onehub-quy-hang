-- 032_tat_link.sql · Tắt link (hàng 36 da-gui): người gửi — hay trưởng nhóm của chính sàn ấy (Hỏi-2) — đặt
-- `shares.disabled_at`. Bảng `shares` vẫn không có grant update cho vai API: chỉ ghi qua hàm này (bất biến 1). Bản đầu không
-- bật lại (Hỏi-4). Trang khách đọc `disabled_at` qua `app.share_by_code` (migration 031).
create or replace function app.disable_share(p_share uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    s record;
  begin
    select company_id, sender_user_id, disabled_at into s from public.shares where id = p_share and company_id = san;
    if san is null or not found then
      raise exception 'không có Lần gửi này' using errcode = 'P0002';
    end if;
    if s.sender_user_id <> app.current_user_id() and not ('team_lead' = any (app.current_user_roles())) then
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
