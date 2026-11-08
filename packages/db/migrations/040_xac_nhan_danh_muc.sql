-- 040_xac_nhan_danh_muc.sql · «Xác nhận danh mục» (hàng 95, ADR-0017 §6 sửa đổi 03/11 của Invest, ADR-0027): loại kết nối
-- mới `catalog_confirmation` vào ràng buộc `kind` của `agreements` (giữ bảy loại cũ), và trần theo loại — thoả thuận loại
-- này chỉ chiều ra, chỉ lớp danh mục, không điều khoản riêng. Lõi chặn cùng luật ở `KIND_LIMITS` (agreements.ts).
--
-- Số 040 do giám sát giữ chỗ cho hàng 95 (luật đợt 74). Bản thật áp tệp này SAU 052, cơ sở dữ liệu mới áp TRƯỚC 041–052
-- (bộ chạy ghi sổ theo tên): tệp chỉ dựa vào đối tượng có từ ≤ 039 — bảng `agreements` (001), ràng buộc
-- `agreements_kind_check` (035) — và viết lặp lại được; không migration nào sau 040 được đổi lại hai ràng buộc dưới
-- (bài kiểm `packages/db/tests/xac-nhan-danh-muc.test.mjs`). Không bảng mới, không đổi luật theo dòng.

alter table agreements drop constraint if exists agreements_kind_check;
alter table agreements
  add constraint agreements_kind_check
  check (kind in ('catalog_source', 'listing_channel', 'lead_source', 'spreadsheet', 'company_partnership', 'company_api',
                  'ai_processing', 'catalog_confirmation'));

alter table agreements drop constraint if exists agreements_xac_nhan_chi_danh_muc;
alter table agreements
  add constraint agreements_xac_nhan_chi_danh_muc
  check (kind <> 'catalog_confirmation'
         or (direction = 'outbound' and data_classes = array['catalog']::text[] and not special_terms));
