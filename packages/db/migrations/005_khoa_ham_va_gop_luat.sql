-- 005_khoa_ham_va_gop_luat.sql · Dọn cảnh báo của Supabase advisors trên môi trường thật (ADR-0009). Không đổi ai thấy gì:
-- bộ kiểm cách ly giữ nguyên. Chạy lại được — đã áp tay trên môi trường thật trước khi gộp.

-- Hai hàm đọc người và sàn của phiên nằm trong mọi luật theo dòng: khoá search_path để không ai chen hàm cùng tên vào
-- trước pg_catalog.
alter function app.current_company_id() set search_path = '';
alter function app.current_user_id() set search_path = '';

-- companies có hai luật đọc (001 companies_self, 002 companies_member) — Postgres chạy cả hai cho mỗi dòng. Gộp làm
-- một, cùng điều kiện: sàn đang làm, hoặc sàn người này là thành viên.
drop policy if exists companies_self on companies;
drop policy if exists companies_member on companies;
drop policy if exists companies_read on companies;
create policy companies_read on companies for select
  using (
    id = app.current_company_id()
    or exists (select 1 from company_members m where m.company_id = companies.id and m.user_id = app.current_user_id())
  );

-- Khoá ngoại member_zones → company_zones chưa có chỉ mục phủ: xoá khu phải quét cả bảng.
create index if not exists member_zones_zone_idx on member_zones (company_id, zone_id);
