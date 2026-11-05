-- 025_hoan_tac_nhap.sql · Hoàn tác cả lần nhập bằng sự kiện bù (hàng 66, ADR-0011 quyết định 8): loại sự kiện `voided` — cờ
-- khi gấp, không phải trạng thái — và cột `listings.voided` (bản gấp, để lọc hàng đã gỡ); lần nhập nhận trạng thái `undone`
-- và người, lúc hoàn tác; mỗi dòng ghi kết cục hoàn tác để gọi lại không ghi trùng. Chỉ thêm — không xoá sự kiện nào; luật
-- cách ly giữ nguyên, thêm luật sửa `import_rows` cho người tạo lần nhập (như luật thêm của 024).

alter table listing_events drop constraint listing_events_type_check;
alter table listing_events add constraint listing_events_type_check
  check (type in ('created', 'details_changed', 'price_changed', 'status_changed', 'owner_confirmed', 'unit_number_assigned', 'voided'));

alter table listings add column voided boolean not null default false;

alter table imports drop constraint imports_status_check;
alter table imports add constraint imports_status_check check (status in ('planned', 'committed', 'undone'));
alter table imports add column undone_at timestamptz;
alter table imports add column undone_by text;
grant update (status, undone_at, undone_by) on imports to quy_hang_app;

alter table import_rows add column undo_outcome text
  check (undo_outcome is null or undo_outcome in ('go', 'tra-gia', 'khong-doi', 'da-sua-sau', 'khong-tra-duoc', 'tin-bo-sung', 'bo-qua'));
alter table import_rows add column undone_at timestamptz;
create policy import_rows_update on import_rows for update
  using (
    company_id = app.current_company_id()
    and exists (select 1 from imports i where i.company_id = import_rows.company_id and i.id = import_rows.import_id
                and i.created_by = app.current_user_id())
  )
  with check (
    company_id = app.current_company_id()
    and exists (select 1 from imports i where i.company_id = import_rows.company_id and i.id = import_rows.import_id
                and i.created_by = app.current_user_id())
  );
grant update (undo_outcome, undone_at) on import_rows to quy_hang_app;
