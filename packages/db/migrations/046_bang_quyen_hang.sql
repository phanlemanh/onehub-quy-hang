-- 046_bang_quyen_hang.sql · Luật theo dòng của hàng và sự kiện hàng xét vai, không chỉ cách ly công ty (hàng
-- bang-quyen-theo-vai, chỗ hở G1 + G7 phần hàng của docs/plan/ra-soat-crud-phan-quyen.md; Tham chiếu luật 21, §9). Chỉ
-- người có Bảng hàng — một trong ba vai Đầu chủ, Đầu khách, Trưởng nhóm — đọc, tạo, sửa được hàng và sự kiện của hàng;
-- sự kiện đưa lên Đang bán chỉ người đủ cờ «Sẵn sàng bán» ghi được. Luật trùng `duocLamVoiHang` của packages/core
-- (access/quyen-hang.ts); bộ kiểm cách ly đo cả hai bằng cùng bảng 56 ô (access/bang-quyen-hang.json). Trục «Chỉ tôi»
-- vẫn chặn ở lõi và API, không ở đây (quyết định của hàng 12). Không bảng mới, không cột mới.
--
-- Hàm security definer của các hàng trước (kiểm trùng lead, mốc lên bảng của telesales, trang khách, Lần gửi, đổi đầu chủ)
-- chạy bằng vai chủ hàm, bỏ qua luật theo dòng (local superuser; thật quy_hang_owner bypassrls — xem 013), nên không đổi.

-- Người đang làm có Bảng hàng ở sàn đang làm.
create or replace function app.works_listings() returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select app.current_user_roles() && array['listing_agent', 'buyer_agent', 'team_lead']::text[]
  $$;
revoke all on function app.works_listings() from public;
grant execute on function app.works_listings() to quy_hang_app;

-- Người đang làm đủ cờ «Sẵn sàng bán» cho một hàng: có vai Trưởng nhóm, HOẶC (có vai Đầu chủ VÀ (dòng gán mới nhất của
-- căn là chính người ấy, HOẶC căn chưa có dòng gán nào)). Cùng ngoặc với `duocLamVoiHang(…, "dua_len_dang_ban", …)`.
create or replace function app.can_activate_listing(p_listing uuid) returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select 'team_lead' = any (app.current_user_roles())
      or (
        'listing_agent' = any (app.current_user_roles())
        and coalesce(
          (select a.user_id from public.listing_agent_assignments a
           where a.company_id = app.current_company_id() and a.listing_id = p_listing
           order by a.seq desc limit 1),
          app.current_user_id()
        ) = app.current_user_id()
      )
  $$;
revoke all on function app.can_activate_listing(uuid) from public;
grant execute on function app.can_activate_listing(uuid) to quy_hang_app;

-- Hàng (bản tính): đọc, tạo, sửa — cách ly công ty như 004, thêm trục vai.
drop policy if exists listings_read on listings;
drop policy if exists listings_insert on listings;
drop policy if exists listings_update on listings;
create policy listings_read on listings for select
  using (company_id = app.current_company_id() and app.works_listings());
create policy listings_insert on listings for insert
  with check (company_id = app.current_company_id() and app.works_listings());
create policy listings_update on listings for update
  using (company_id = app.current_company_id() and app.works_listings())
  with check (company_id = app.current_company_id() and app.works_listings());

-- Sự kiện của hàng: đọc và thêm — người ghi vẫn là người đang làm (004), thêm trục vai và cờ Đang bán.
drop policy if exists listing_events_read on listing_events;
drop policy if exists listing_events_insert on listing_events;
create policy listing_events_read on listing_events for select
  using (company_id = app.current_company_id() and app.works_listings());
create policy listing_events_insert on listing_events for insert
  with check (
    company_id = app.current_company_id()
    and actor_user_id = app.current_user_id()
    and app.works_listings()
    and (type <> 'status_changed' or payload ->> 'to' is distinct from 'Active' or app.can_activate_listing(listing_id))
  );
