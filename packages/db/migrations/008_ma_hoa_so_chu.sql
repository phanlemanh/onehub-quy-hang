-- 008_ma_hoa_so_chu.sql · Số chủ chỉ ở dạng bản mã (hàng 62, ADR-0013, bất biến 2). Khoá OWNER_PHONE_KEY nằm ở môi trường
-- chạy app, không bao giờ vào cơ sở dữ liệu: API mã hoá trước khi ghi (AES-256-GCM, bản mã `0x01 ‖ nonce ‖ thẻ ‖ thân`) và
-- giải sau khi hàm mở số trả bản mã. Cột `owner_phone` cũ giữ lại (migration không có khoá nên không mã hoá được dòng cũ,
-- và xoá cột là xoá dữ liệu): ràng buộc NOT VALID chặn mọi số rõ mới; lệnh `packages/api/src/owners/ma-hoa-lai.ts`
-- chuyển dòng cũ rồi validate. Xoá cột là migration của hàng sau.

alter table listing_owners
  add column owner_phone_enc bytea,
  add column owner_phone_hash bytea,
  add constraint listing_owners_phone_enc_khuon
    check (owner_phone_enc is null or (get_byte(owner_phone_enc, 0) = 1 and octet_length(owner_phone_enc) between 39 and 64)),
  add constraint listing_owners_phone_hash_khuon check (owner_phone_hash is null or octet_length(owner_phone_hash) = 32),
  add constraint listing_owners_phone_cap check ((owner_phone_enc is null) = (owner_phone_hash is null)),
  add constraint listing_owners_phone_chi_ban_ma check (owner_phone is null) not valid;

-- Cờ «có số» theo bản mã. Dòng còn số rõ (chưa mã hoá lại) coi như chưa có số — mở số trả «chưa có số chủ».
alter table listing_owners drop column has_phone;
alter table listing_owners add column has_phone boolean generated always as (owner_phone_enc is not null) stored;
grant select (has_phone) on listing_owners to quy_hang_app;

-- Vai API ghi được bản mã và dấu vết, KHÔNG đọc được — như cột số cũ; số chỉ ra qua hàm mở số.
grant insert (owner_phone_enc, owner_phone_hash) on listing_owners to quy_hang_app;
grant update (owner_phone_enc, owner_phone_hash) on listing_owners to quy_hang_app;

-- Cửa DUY NHẤT ra số chủ, nay trả bản mã: xét quyền, ghi một sự kiện mở số, rồi trả bản mã để API giải bằng khoá.
drop function app.reveal_owner_phone(uuid);
create function app.reveal_owner_phone(p_listing uuid) returns bytea
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    v_ban_ma bytea;
  begin
    if app.current_company_id() is null or app.current_user_id() is null or not app.can_see_source(p_listing) then
      raise exception 'không có quyền mở số chủ' using errcode = '42501';
    end if;
    select o.owner_phone_enc into v_ban_ma from public.listing_owners o
      where o.company_id = app.current_company_id() and o.listing_id = p_listing;
    if v_ban_ma is null then
      raise exception 'chưa có số chủ' using errcode = 'P0002';
    end if;
    insert into public.owner_phone_reveals (company_id, listing_id, actor_user_id, actor_roles)
      values (app.current_company_id(), p_listing, app.current_user_id(), app.current_user_roles());
    return v_ban_ma;
  end
  $$;
revoke all on function app.reveal_owner_phone(uuid) from public;
grant execute on function app.reveal_owner_phone(uuid) to quy_hang_app;

-- Lưới cho mọi bảng sau này (bảng lead của hàng 24 và các hàng khác): cột kiểu chữ tên chứa `phone` phải bị ràng buộc
-- `check (<cột> is null)` — số chỉ được lưu ở cột bytea (bản mã, dấu vết). Bộ kiểm cách ly gọi hàm này; danh sách phải rỗng.
create or replace function app.cot_so_ro_chua_chan() returns table (cot text)
  language sql stable set search_path = ''
  as $$
    select c.table_schema || '.' || c.table_name || '.' || c.column_name
    from information_schema.columns c
    where c.table_schema not in ('pg_catalog', 'information_schema', 'pg_toast')
      and c.column_name ilike '%phone%'
      and c.data_type in ('text', 'character varying', 'character')
      and not exists (
        select 1 from pg_catalog.pg_constraint k
        join pg_catalog.pg_class t on t.oid = k.conrelid
        join pg_catalog.pg_namespace n on n.oid = t.relnamespace
        where n.nspname = c.table_schema and t.relname = c.table_name and k.contype = 'c'
          and pg_catalog.pg_get_constraintdef(k.oid) ilike '%(' || c.column_name || ' IS NULL)%'
      )
    order by 1
  $$;
revoke all on function app.cot_so_ro_chua_chan() from public;
