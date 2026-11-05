-- 038_vao_san_khac_thu_phien.sql · Vá Ngoài-6 của hàng dang-nhap-mat-khau (hàng va-dang-nhap-mat-khau, luật 64): người vào
-- một sàn khác sàn đã cấp thì mật khẩu gốc sàn cấp thôi dùng (034) — nay mọi phiên của người cũng bị thu trong cùng giao
-- dịch với lời mời. Phiên của quản trị sàn cấp, nếu người ấy đã đăng nhập bằng mật khẩu tạm trước người được cấp, không
-- sống sót sang sàn mới; người được mời vào lại bằng mã 6 số (Hỏi-1: thu mọi phiên). Thân y 034, cùng chữ ký và trigger,
-- cộng đúng câu xoá phiên. Mật khẩu tự đổi, chưa có mật khẩu, mời lại đúng sàn đã cấp: không khoá, không thu.
create or replace function app.vo_hieu_mat_khau_khi_vao_san() returns trigger
  language plpgsql volatile security definer set search_path = ''
  as $$
  begin
    perform pg_advisory_xact_lock(hashtextextended('mat-khau:' || new.user_id, 0));
    update identity.password_state
      set disabled_at = now(), disabled_reason = 'vao-san-khac', change_token_hash = null,
          change_token_expires_at = null, updated_at = now()
      where user_id = new.user_id and origin = 'san-cap' and disabled_at is null
        and issued_company_id is distinct from new.company_id;
    if found then
      delete from identity.session where "userId" = new.user_id;
      insert into identity.password_events (user_id, company_id, actor_user_id, kind)
        values (new.user_id, new.company_id, app.current_user_id(), 'vo-hieu-san-khac');
    end if;
    return new;
  end
  $$;
revoke all on function app.vo_hieu_mat_khau_khi_vao_san() from public;
