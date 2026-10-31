-- 009_ma_hoa_so_lead.sql · Số chủ của lead chỉ ở dạng bản mã (hàng 62, ADR-0013, bất biến 2). Hàng 24 (migration 007)
-- gộp trước 62: bảng `leads` lưu số chủ dạng chữ và `app.lead_dedupe_facts` so số rõ. Migration này đưa lead về cùng khuôn
-- chủ nhà của 008 — bản mã (ngữ cảnh `leads:<company_id>:<lead_id>`) và dấu vết theo sàn — và cho hàm kiểm trùng so dấu
-- vết. Lead cũ còn số rõ: lệnh `packages/api/van-hanh/ma-hoa-lai.ts` chuyển rồi validate. Ràng buộc NOT VALID vẫn xét mọi
-- lần sửa dòng, nên lead cũ còn số rõ không «Bỏ lead» được tới khi chạy lệnh ấy: chạy nó ngay sau migrate.

alter table leads
  alter column owner_phone drop not null,
  add column owner_phone_enc bytea,
  add column owner_phone_hash bytea,
  add constraint leads_phone_enc_khuon
    check (owner_phone_enc is null or (get_byte(owner_phone_enc, 0) = 1 and octet_length(owner_phone_enc) between 39 and 64)),
  add constraint leads_phone_hash_khuon check (owner_phone_hash is null or octet_length(owner_phone_hash) = 32),
  add constraint leads_phone_cap check ((owner_phone_enc is null) = (owner_phone_hash is null)),
  -- Lead phải có số (năm mục bắt buộc của hàng 24) — thay chỗ `not null` cũ.
  add constraint leads_phone_co_so check (owner_phone is not null or owner_phone_enc is not null),
  add constraint leads_phone_chi_ban_ma check (owner_phone is null) not valid;
drop index leads_owner_phone_idx;
create index leads_owner_phone_hash_idx on leads (company_id, owner_phone_hash);
-- Chèn cả bảng đã cấp ở 007 nên phủ hai cột mới; đọc cấp theo cột nên vai API không đọc được chúng.

-- Kiểm trùng lúc nhập lead so dấu vết, không so số: không hàm nào của cơ sở dữ liệu còn nhận số chủ dạng chữ.
drop function app.lead_dedupe_facts(text, text, text, text[]);
create function app.lead_dedupe_facts(p_phone_hash bytea, p_building text, p_unit text, p_open_statuses text[])
  returns table (open_listing_id uuid, open_listing_agent text, owner_agent text)
  language sql stable security definer set search_path = ''
  as $$
    with mo as (
      select l.id,
             (select a.user_id from public.listing_agent_assignments a
              where a.company_id = l.company_id and a.listing_id = l.id order by a.seq desc limit 1) as dau_chu
      from public.listings l
      where l.company_id = app.current_company_id()
        and app.unit_key(p_unit) is not null
        and l.building_name = p_building
        and app.unit_key(l.unit_number) = app.unit_key(p_unit)
        and l.standard_status = any (p_open_statuses)
      order by l.id
      limit 1
    ),
    chu as (
      select dau_chu, luc from (
        -- Chủ nhà mang số này trên một hàng đã có đầu chủ: lần gán mới nhất.
        select (select a.user_id from public.listing_agent_assignments a
                where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) as dau_chu,
               (select a.assigned_at from public.listing_agent_assignments a
                where a.company_id = o.company_id and a.listing_id = o.listing_id order by a.seq desc limit 1) as luc
        from public.listing_owners o
        where o.company_id = app.current_company_id() and o.owner_phone_hash = p_phone_hash
        union all
        -- Lead trước cùng số đã về một đầu chủ và chưa bị bỏ.
        select d.matched_agent_user_id, d.created_at
        from public.leads d
        where d.company_id = app.current_company_id() and d.owner_phone_hash = p_phone_hash
          and d.matched_agent_user_id is not null and d.discarded_at is null
      ) x
      where dau_chu is not null
      order by luc desc
      limit 1
    )
    select (select id from mo), (select dau_chu from mo), (select dau_chu from chu)
  $$;
revoke all on function app.lead_dedupe_facts(bytea, text, text, text[]) from public;
grant execute on function app.lead_dedupe_facts(bytea, text, text, text[]) to quy_hang_app;
