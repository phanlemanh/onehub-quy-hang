-- 023_va_moc_goi_dau.sql · Vá mốc gọi đầu (hàng va-moc-goi-dau-lead-tra-lai, luật 31): lead đã trả lại rời việc của
-- đầu chủ (015), nhưng app.mark_first_call của 011 không kiểm returned_at — đầu chủ đã trả lead vẫn ghi được mốc gọi
-- đầu, lệch luật chia và hạn của hàng 25. Thân y 011, cùng chữ ký, cộng đúng điều kiện «chưa trả lại»: lead đã trả lại
-- rơi vào P0002 như lead không còn của người gọi, không cột nào đổi. Không bảng mới, luật cách ly không đổi.

-- Đầu chủ ghi đã gọi lần đầu; chưa nhận thì ghi luôn mốc nhận. P0002: không phải lead của người gọi (kể cả lead đã trả
-- lại); 23505: đã ghi.
create or replace function app.mark_first_call(p_lead uuid) returns void
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v public.leads%rowtype;
  begin
    select * into v from public.leads
      where company_id = app.current_company_id() and id = p_lead
        and matched_agent_user_id = app.current_user_id() and outcome in ('new', 'owner_has_agent') and discarded_at is null
        and returned_at is null
      for update;
    if not found then
      raise exception 'không có lead này của người gọi' using errcode = 'P0002';
    end if;
    if v.first_called_at is not null then
      raise exception 'đã ghi gọi lần đầu' using errcode = '23505';
    end if;
    update public.leads set first_called_at = now(), accepted_at = coalesce(accepted_at, now())
      where company_id = v.company_id and id = v.id;
  end
  $$;
revoke all on function app.mark_first_call(uuid) from public;
grant execute on function app.mark_first_call(uuid) to quy_hang_app;
