-- 017_mo_so_lead.sql · Mở số của lead (hàng mo-so-lead, tách từ Hỏi-3 hàng 22): đầu chủ đang được giao lead mở số chủ nhà
-- của lead ấy để gọi; mỗi lần mở một vết. Cùng nếp «Mở số» của hồ sơ căn (006, 008): số chỉ ra qua một hàm luôn ghi vết,
-- hàm trả bản mã để API giải bằng khoá; cột số của lead vẫn không cấp quyền đọc cho vai API. Số chủ là lớp nguồn (bất biến 2).

-- ---- Vết mở số của lead ----
-- Chỉ thêm; chỉ hàm mở số ghi. Người mở đọc vết của mình; trưởng nhóm cùng sàn đọc cả sàn (như owner_phone_reveals).
create table lead_phone_reveals (
  id            bigint generated always as identity primary key,
  company_id    uuid not null references companies (id) on delete cascade,
  lead_id       uuid not null,
  actor_user_id text not null,
  actor_roles   text[] not null,
  occurred_at   timestamptz not null default now(),
  constraint lead_phone_reveals_lead_fkey foreign key (company_id, lead_id)
    references leads (company_id, id) on delete cascade
);
create index lead_phone_reveals_lead_idx on lead_phone_reveals (company_id, lead_id);
alter table lead_phone_reveals enable row level security;
alter table lead_phone_reveals force row level security;
create policy lead_phone_reveals_read on lead_phone_reveals for select
  using (company_id = app.current_company_id()
         and (actor_user_id = app.current_user_id() or 'team_lead' = any (app.current_user_roles())));
-- Luật thêm cho hàm mở số (chạy bằng vai chủ của hàm); vai API không có quyền insert.
create policy lead_phone_reveals_insert on lead_phone_reveals for insert
  with check (company_id = app.current_company_id() and actor_user_id = app.current_user_id());
grant select on lead_phone_reveals to quy_hang_app;
create trigger lead_phone_reveals_chi_them before update or delete on lead_phone_reveals
  for each row execute function app.nguon_chi_them();
create trigger lead_phone_reveals_khong_truncate before truncate on lead_phone_reveals
  for each statement execute function app.nguon_khong_truncate();

-- ---- Cửa mở số của lead ----
-- Người gọi phải mang vai Đầu chủ (42501) và là người nhận hiện tại của một lead còn trong việc — cùng điều kiện lead mà
-- hạn nhận, hạn gọi dùng (app.lead_deadline_facts, 015): lead không trùng hay chủ trùng, chưa bỏ, chưa trả lại (P0002 —
-- không phân biệt «không có» với «không phải của bạn»). Ghi một vết rồi trả bản mã; không chạm cột nào của lead (Hỏi-2).
create or replace function app.reveal_lead_phone(p_lead uuid) returns bytea
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v_ban_ma bytea;
  begin
    if app.current_company_id() is null or app.current_user_id() is null
       or not ('listing_agent' = any (app.current_user_roles())) then
      raise exception 'chỉ đầu chủ mở số của lead' using errcode = '42501';
    end if;
    select l.owner_phone_enc into v_ban_ma from public.leads l
      where l.company_id = app.current_company_id() and l.id = p_lead
        and l.matched_agent_user_id = app.current_user_id()
        and l.outcome in ('new', 'owner_has_agent') and l.discarded_at is null and l.returned_at is null;
    if v_ban_ma is null then
      raise exception 'không có lead này của người gọi' using errcode = 'P0002';
    end if;
    insert into public.lead_phone_reveals (company_id, lead_id, actor_user_id, actor_roles)
      values (app.current_company_id(), p_lead, app.current_user_id(), app.current_user_roles());
    return v_ban_ma;
  end
  $$;
revoke all on function app.reveal_lead_phone(uuid) from public;
grant execute on function app.reveal_lead_phone(uuid) to quy_hang_app;
