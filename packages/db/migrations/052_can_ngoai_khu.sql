-- Hàng 76 «căn ngoài khu» (ADR-0016 quyết định 3, 4, 5): căn ngoài khu là bản ghi của sàn, định danh bằng địa chỉ chuẩn
-- của lõi; hàng tạo được trên lô (khu · dãy · lô) và trên căn ngoài khu, không chỉ trên toà. Cùng khoá địa chỉ trong một
-- sàn là một căn; hai sàn cùng địa chỉ là hai căn (bất biến 1). Sự kiện đã ghi không đổi: hàng cũ giữ toà, ba cột mới null.

create table off_compound_units (
  company_id             uuid not null references companies (id) on delete cascade,
  id                     uuid not null default gen_random_uuid(),
  -- Loại hình RESO nguyên văn — giữ cứng ba giá trị (Hỏi-3 Cổng Phạm vi 07/11).
  property_sub_type      text not null
    constraint off_compound_units_sub_type_check check (property_sub_type in ('Townhouse', 'Single Family Residence', 'Unimproved Land')),
  state_or_province_code text not null constraint off_compound_units_province_check check (state_or_province_code ~ '^[0-9]{2}$'),
  ward_code              text not null constraint off_compound_units_ward_check check (ward_code ~ '^[0-9]{5}$'),
  street_name            text not null constraint off_compound_units_street_check check (length(btrim(street_name)) between 1 and 200),
  street_number          text constraint off_compound_units_number_check check (street_number is null or length(btrim(street_number)) between 1 and 100),
  unparsed_address       text not null constraint off_compound_units_unparsed_check check (length(btrim(unparsed_address)) between 1 and 300),
  -- Khoá địa chỉ của lõi (`maTinh|maXa|tenDuong|soNha`); null khi chưa có số nhà — căn không gộp theo địa chỉ (Hỏi-2).
  address_key            text constraint off_compound_units_key_check check (address_key is null or length(address_key) between 1 and 400),
  created_by             text not null default app.current_user_id(),
  created_at             timestamptz not null default now(),
  -- Địa chỉ, loại hình của căn ngoài khu thuộc lớp chia sẻ theo luật ẩn (ADR-0016 «Chỗ chạm bất biến»); không cột nào lớp nguồn.
  data_class             text not null default 'shareable_listing'
    constraint off_compound_units_data_class_check check (data_class = 'shareable_listing'),
  primary key (company_id, id),
  constraint off_compound_units_key_needs_number check ((address_key is null) = (street_number is null))
);
create unique index off_compound_units_id_key on off_compound_units (id);
create unique index off_compound_units_address_key on off_compound_units (company_id, address_key) where address_key is not null;
alter table off_compound_units enable row level security;
alter table off_compound_units force row level security;
-- Như bảng hàng từ 046: cách ly công ty và chỉ người có Bảng hàng.
create policy off_compound_units_read on off_compound_units for select
  using (company_id = app.current_company_id() and app.works_listings());
create policy off_compound_units_insert on off_compound_units for insert
  with check (company_id = app.current_company_id() and app.works_listings() and created_by = app.current_user_id());
-- Căn không sửa, không xoá ở vòng này.
grant select, insert on off_compound_units to quy_hang_app;

-- Bảng hàng: ba cách gọi căn. Toà thôi bắt buộc; đúng một dạng mỗi hàng.
alter table listings alter column building_name drop not null;
alter table listings add column subdivision_name text
  constraint listings_subdivision_name_check check (subdivision_name is null or length(btrim(subdivision_name)) between 1 and 200);
alter table listings add column block_name text
  constraint listings_block_name_check check (block_name is null or length(btrim(block_name)) between 1 and 200);
alter table listings add column off_compound_unit_id uuid;
-- Khoá ngoại GHÉP theo sàn: Postgres kiểm khoá ngoại không qua luật theo dòng, nên chỉ khoá ghép chặn ở tầng dữ liệu một
-- hàng của sàn A trỏ căn của sàn B, ở mọi lối ghi.
alter table listings add constraint listings_off_compound_unit_fkey
  foreign key (company_id, off_compound_unit_id) references off_compound_units (company_id, id);
alter table listings add constraint listings_mot_dang_dinh_danh check (
  (building_name is not null)::int
  + (block_name is not null or subdivision_name is not null)::int
  + (off_compound_unit_id is not null)::int = 1
  and (block_name is null) = (subdivision_name is null)
  and (block_name is null or unit_number is not null)
  and (off_compound_unit_id is null or unit_number is null)
);
