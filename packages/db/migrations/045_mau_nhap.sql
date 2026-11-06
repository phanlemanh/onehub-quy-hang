-- 045_mau_nhap.sql · Sổ sửa mẫu file nhập (hàng 50 mau-nhap-va-bai; ADR-0011 quyết định 6, sổ điểm số 25 `import.templates`):
-- mẫu file của sàn vẫn rút từ kế hoạch các lần nhập đã ghi (hàng 67); bảng này chỉ ghi thêm mỗi lần Quản trị sàn sửa hay
-- xoá một cột đã nhớ. Đọc mẫu = gộp hai nguồn, mỗi khoá tiêu đề giữ mục mới nhất (lõi `apSuaMau`). Không ô, không dòng, không
-- tên tệp; bảng quy đổi chỉ ở năm trường giá trị đóng của lõi — không trường nào thuộc lớp nguồn (bất biến 2).
-- Số 045 do giám sát đợt cấp (luật đợt 25, L-33).

create table import_templates (
  company_id  uuid not null references companies (id) on delete cascade,
  id          uuid not null default gen_random_uuid(),
  header_key  text not null check (length(header_key) between 1 and 200),
  action      text not null check (action in ('set', 'delete')),
  target      text,
  transform   jsonb,
  value_map   jsonb,
  edited_by   text not null default app.current_user_id(),
  edited_at   timestamptz not null default now(),
  primary key (company_id, id),
  -- Xoá không mang đích, phép biến đổi hay quy đổi; sửa phải có đích.
  constraint import_templates_xoa_khong_dich check (
    action <> 'delete' or (target is null and transform is null and value_map is null)
  ),
  constraint import_templates_sua_co_dich check (action <> 'set' or (target is not null and length(target) between 1 and 100)),
  -- Bảng quy đổi chỉ ở trường giá trị đóng (TRUONG_CACH_GOI của packages/core/src/import/memory/mau.ts) và phải là object.
  constraint import_templates_quy_doi_truong_dong check (
    value_map is null
    or (jsonb_typeof(value_map) = 'object'
        and target in ('standardStatus', 'feeInclusion', 'directionFaces', 'buildingName', 'subdivisionName'))
  )
);
-- Đọc mẫu: mọi dòng của sàn theo khoá, mới nhất trước.
create index import_templates_khoa_idx on import_templates (company_id, header_key, edited_at desc);

alter table import_templates enable row level security;
alter table import_templates force row level security;
create policy import_templates_read on import_templates for select using (company_id = app.current_company_id());
-- Chỉ Quản trị sàn ghi, và chỉ ghi dưới tên chính mình vào sàn đang làm.
create policy import_templates_insert on import_templates for insert
  with check (
    company_id = app.current_company_id()
    and edited_by = app.current_user_id()
    and app.member_has_role(app.current_user_id(), 'company_admin')
  );
-- Không update, không delete: sổ sửa chỉ thêm.
grant select, insert on import_templates to quy_hang_app;
