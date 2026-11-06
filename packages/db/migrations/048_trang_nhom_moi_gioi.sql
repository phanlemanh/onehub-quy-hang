-- Trang nhóm môi giới (hàng 44, trang-nhom-moi-gioi): Lần gửi mang mức chia của bộ và định nghĩa «Bao phí» lúc gửi.
-- Mức chia: mặc định của sàn (điểm #15), người gửi sửa theo bộ, hiệu lực «mới» — bộ mang mức lúc gửi (Tham chiếu §12,
-- chốt 29/10). Định nghĩa phí: điểm #8 `fee.inclusion` hiệu lực «mới» — chụp lúc gửi; Lần gửi trước 048 để rỗng và đọc theo
-- cấu hình hiện tại. Chỉ thêm: hai cột rỗng được, ràng buộc của bảng, một bản mới của `app.create_share`. Luật theo dòng của
-- `shares` (021) giữ nguyên. Hai cột là cấu hình nội bộ của sàn gửi, không thuộc lớp nguồn.

alter table shares add column commission_split_pct numeric(5, 2);
alter table shares add column fee_inclusion text[];

alter table shares add constraint shares_commission_split_range
  check (commission_split_pct is null or (commission_split_pct >= 0 and commission_split_pct <= 100));
-- Khách riêng không mang mức chia: mức chia là lời hứa với môi giới sàn khác.
alter table shares add constraint shares_commission_split_agents_only
  check (commission_split_pct is null or audience = 'agents');
-- Tập đóng của điểm #8, khác rỗng khi có.
alter table shares add constraint shares_fee_inclusion_closed
  check (
    fee_inclusion is null
    or (cardinality(fee_inclusion) > 0 and fee_inclusion <@ array['personalIncomeTax', 'registrationFee', 'brokerageFee']::text[])
  );

-- Hàm tạo Lần gửi thêm mức chia và định nghĩa phí lúc gửi, hai tham số mặc định rỗng: lời gọi năm tham số (021, 037) chạy
-- như cũ, và kho vẫn có đúng một hàm `create_share` (bài kiểm 037 ghim chữ ký và quyền theo tên).
drop function app.create_share(uuid, text, text, uuid, uuid[]);
create function app.create_share(
  p_id uuid, p_code text, p_audience text, p_prospect uuid, p_listings uuid[],
  p_commission_split numeric default null, p_fee_inclusion text[] default null
) returns void
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
    insert into public.shares (company_id, id, code, sender_user_id, audience, prospect_id, commission_split_pct, fee_inclusion)
      values (san, p_id, p_code, app.current_user_id(), p_audience, p_prospect, p_commission_split, p_fee_inclusion);
    for i in 1 .. cardinality(p_listings) loop
      insert into public.share_listings (company_id, share_id, listing_id, position) values (san, p_id, p_listings[i], i - 1);
    end loop;
  end
  $$;
revoke all on function app.create_share(uuid, text, text, uuid, uuid[], numeric, text[]) from public;
grant execute on function app.create_share(uuid, text, text, uuid, uuid[], numeric, text[]) to quy_hang_app;

