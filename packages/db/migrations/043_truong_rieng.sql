-- 043_truong_rieng.sql · Trường riêng tối thiểu (hàng 47, Tham chiếu §7, ADR-0018 quyết định 8 sửa đổi 06/11, sổ điểm biến
-- thiên #22): bảng định nghĩa theo sàn + nhật ký chỉ thêm; giá trị của hàng ở `listings.custom` ghi bằng sự kiện
-- `custom_changed`; giá trị của liên hệ ở `contacts.custom` (chỗ hàng 85 giữ) ghi qua một hàm có kiểm quyền đọc liên hệ.
-- Trường của liên hệ có loại chủ (Seller, Landlord) mang lớp `source` — chủ kho duyệt Hỏi-1 ở Cổng Phạm vi 06/11.
-- Số 043 do giám sát giữ chỗ cho hàng 47 (LUAT.md luật 74).

-- ---- Định nghĩa ----
create table custom_fields (
  company_id    uuid not null references companies (id) on delete cascade,
  code          text not null constraint custom_fields_code_check check (code ~ '^[a-z][a-z0-9_]{0,31}$'),
  target        text not null constraint custom_fields_target_check check (target in ('listing', 'contact')),
  contact_types text[] not null default '{}'
    constraint custom_fields_contact_types_check
    check (contact_types <@ array['Seller', 'Landlord', 'Buyer', 'Tenant']
           and ((target = 'listing' and cardinality(contact_types) = 0) or (target = 'contact' and cardinality(contact_types) > 0))),
  kind          text not null constraint custom_fields_kind_check check (kind in ('bool', 'single_select')),
  label         text not null constraint custom_fields_label_check check (length(btrim(label)) between 1 and 40),
  options       jsonb not null default '[]'
    constraint custom_fields_options_check
    check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) <= 30
           and ((kind = 'bool' and jsonb_array_length(options) = 0) or (kind = 'single_select' and jsonb_array_length(options) > 0))),
  -- Lớp của GIÁ TRỊ: hàng → custom_field; liên hệ có loại chủ → source (bất biến 2); còn lại → custom_field. Lõi lặp luật
  -- này ở `lopTruongRieng` (packages/core/src/custom-fields); bộ kiểm cách ly chạy cùng ma trận cho hai bên.
  data_class    text not null
    constraint custom_fields_data_class_check
    check ((target = 'listing' and data_class = 'custom_field')
           or (target = 'contact'
               and data_class = case when contact_types && array['Seller', 'Landlord'] then 'source' else 'custom_field' end)),
  position      int not null default 0,
  archived_at   timestamptz,
  updated_by    text not null,
  updated_at    timestamptz not null default now(),
  primary key (company_id, code)
);
alter table custom_fields enable row level security;
alter table custom_fields force row level security;
create policy custom_fields_read on custom_fields for select
  using (company_id = app.current_company_id());
create policy custom_fields_insert on custom_fields for insert
  with check (company_id = app.current_company_id() and 'company_admin' = any (app.current_user_roles())
              and updated_by = app.current_user_id());
create policy custom_fields_update on custom_fields for update
  using (company_id = app.current_company_id() and 'company_admin' = any (app.current_user_roles()))
  with check (company_id = app.current_company_id() and 'company_admin' = any (app.current_user_roles())
              and updated_by = app.current_user_id());
-- Không cấp delete: bỏ trường là đặt archived_at, mã không dùng lại.
grant select, insert, update on custom_fields to quy_hang_app;

-- ---- Nhật ký (khuôn 026) ----
create table custom_field_events (
  company_id    uuid not null references companies (id) on delete cascade,
  id            bigint generated always as identity,
  code          text not null,
  value         jsonb not null,
  actor_user_id text not null,
  actor_roles   text[] not null default '{}',
  at            timestamptz not null default now(),
  primary key (company_id, id)
);
create index custom_field_events_code_idx on custom_field_events (company_id, code, at);
alter table custom_field_events enable row level security;
alter table custom_field_events force row level security;
create policy custom_field_events_read on custom_field_events for select
  using (company_id = app.current_company_id());
create policy custom_field_events_insert on custom_field_events for insert
  with check (company_id = app.current_company_id());
grant select on custom_field_events to quy_hang_app;

create trigger custom_field_events_chi_them before update or delete on custom_field_events
  for each row execute function app.cau_hinh_su_kien_chi_them();
create trigger custom_field_events_khong_truncate before truncate on custom_field_events
  for each statement execute function app.cau_hinh_su_kien_khong_truncate();

create or replace function app.truong_rieng_ghi_nhat_ky() returns trigger
  language plpgsql security definer set search_path = ''
  as $$
  begin
    insert into public.custom_field_events (company_id, code, value, actor_user_id, actor_roles)
    values (new.company_id, new.code,
            jsonb_build_object('target', new.target, 'contactTypes', to_jsonb(new.contact_types), 'kind', new.kind,
                               'label', new.label, 'options', new.options, 'dataClass', new.data_class,
                               'archived', new.archived_at is not null),
            new.updated_by, coalesce(app.current_user_roles(), '{}'::text[]));
    return new;
  end
  $$;
revoke all on function app.truong_rieng_ghi_nhat_ky() from public;
create trigger truong_rieng_ghi_nhat_ky after insert or update on custom_fields
  for each row execute function app.truong_rieng_ghi_nhat_ky();

-- ---- Giá trị của hàng ----
alter table listings add column custom jsonb not null default '{}'
  constraint listings_custom_check check (jsonb_typeof(custom) = 'object');
grant update (custom) on listings to quy_hang_app;

alter table listing_events drop constraint listing_events_type_check;
alter table listing_events add constraint listing_events_type_check
  check (type in ('created', 'details_changed', 'price_changed', 'status_changed', 'owner_confirmed', 'unit_number_assigned',
                  'voided', 'custom_changed'));

-- ---- Giá trị của liên hệ ----
alter table contacts drop constraint contacts_custom_check;
alter table contacts add constraint contacts_custom_check check (jsonb_typeof(custom) = 'object');

-- Ghi giá trị trường riêng của một liên hệ: người đọc được liên hệ (cùng luật đọc lớp nguồn của 036), mỗi khoá là mã một
-- trường liên hệ còn sống của sàn áp cho loại của người ấy, giá trị đúng kiểu; null xoá giá trị. 42501: không có quyền;
-- 22023: mã hay giá trị sai (thông điệp nêu mã). Trả custom mới.
create or replace function app.set_contact_custom(p_contact uuid, p_patch jsonb) returns jsonb
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    v public.contacts%rowtype;
    f public.custom_fields%rowtype;
    k text;
    gia jsonb;
    moi jsonb;
  begin
    if san is null or not app.contact_readable(san, p_contact) then
      raise exception 'không có quyền ghi trường riêng của liên hệ này' using errcode = '42501';
    end if;
    if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then
      raise exception 'custom: cần một object có ít nhất một trường' using errcode = '22023';
    end if;
    select * into v from public.contacts x where x.company_id = san and x.id = p_contact for update;
    moi := v.custom;
    for k, gia in select * from jsonb_each(p_patch) loop
      select * into f from public.custom_fields c
        where c.company_id = san and c.code = k and c.target = 'contact' and c.archived_at is null
          and c.contact_types && v.contact_types;
      if not found then
        raise exception 'custom.%: không phải trường riêng còn sống của liên hệ này', k using errcode = '22023';
      end if;
      if jsonb_typeof(gia) = 'null' then
        moi := moi - k;
      elsif f.kind = 'bool' and jsonb_typeof(gia) = 'boolean' then
        moi := moi || jsonb_build_object(k, gia);
      elsif f.kind = 'single_select' and jsonb_typeof(gia) = 'string'
            and exists (select 1 from jsonb_array_elements(f.options) o where o ->> 'code' = gia #>> '{}') then
        moi := moi || jsonb_build_object(k, gia);
      else
        raise exception 'custom.%: giá trị sai kiểu hay lựa chọn không có', k using errcode = '22023';
      end if;
    end loop;
    update public.contacts set custom = moi, updated_at = now() where company_id = san and id = p_contact;
    return moi;
  end
  $$;
revoke all on function app.set_contact_custom(uuid, jsonb) from public;
grant execute on function app.set_contact_custom(uuid, jsonb) to quy_hang_app;
