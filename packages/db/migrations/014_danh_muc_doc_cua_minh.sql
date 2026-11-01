-- 014_danh_muc_doc_cua_minh.sql · Thu hẹp phần đọc của vùng danh mục dùng chung (hàng 10, AC-11; chủ kho «trả 10 sửa»
-- 01/11). Bất biến 1: dữ liệu gắn với một công ty chỉ công ty ấy thấy.
-- (1) Danh sách sàn được tin: mỗi sàn chỉ thấy dòng của chính mình. Hàm app.catalog_source_active chạy quyền người gọi
--     và chỉ hỏi dòng của sàn đang đặt, nên vẫn đúng mà không cần security definer.
-- (2) Mã thoả thuận trên dòng khu, căn: vai API ghi được nhưng không đọc được — danh mục đọc chung, thoả thuận thì không.

drop policy catalog_trusted_companies_read on catalog_trusted_companies;
create policy catalog_trusted_companies_read on catalog_trusted_companies for select
  using (company_id = app.current_company_id());

revoke select on catalog_subdivisions from quy_hang_app;
grant select (subdivision_key, subdivision_name, complex_name, provider, measured_at, updated_at)
  on catalog_subdivisions to quy_hang_app;

revoke select on catalog_units from quy_hang_app;
grant select (upi, subdivision_key, building_key, building_name, unit_number, stack, floor, living_area, bedrooms_total,
              direction_faces, property_type, property_sub_type, lot_size_area, stories_total, frontage_length,
              access_road_width, provider, measured_at, updated_at)
  on catalog_units to quy_hang_app;
