-- nen-du-an.sql · Dựng một lần cho mỗi dự án Supabase mới, chạy bằng vai postgres (SQL editor hoặc công cụ Supabase),
-- TRƯỚC migration đầu tiên. Không phải migration: Postgres local và CI không có vai của Supabase. ADR-0009.
--
-- Vì sao có vai chủ riêng: trên Supabase `postgres` không phải superuser và không đổi được mật khẩu bằng SQL. Vai
-- `quy_hang_owner` chạy migration nên sở hữu mọi bảng của Quỹ hàng; quyền mặc định Supabase đặt cho bảng của
-- `postgres` (cấp hết cho anon, authenticated, service_role) không áp vào bảng của vai này — Data API không thấy bảng
-- nào. App, migration và bộ kiểm cách ly đều đăng nhập bằng vai này; truy vấn bảng của công ty vẫn `set local role
-- quy_hang_app` như ở local (ADR-0001 §3).
--
-- <SCRAM> là chuỗi băm SCRAM-SHA-256 của mật khẩu, sinh ở máy người dựng; mật khẩu không đi qua SQL.

-- BYPASSRLS: vai chủ dựng sàn, mở sàn, dữ liệu thử — như superuser ở local. Không truyền sang quy_hang_app: luật theo dòng
-- áp ngay khi giao dịch `set local role quy_hang_app` (ca «vai chủ được, vai API bị chặn» trong bộ kiểm cách ly).
create role quy_hang_owner login createrole bypassrls password '<SCRAM>';
-- Postgres 16+: người tạo vai (không phải superuser) chỉ được quyền quản trị vai mới, không được SET ROLE sang nó.
-- Migration 001 tạo quy_hang_app bằng vai này, nên đặt để vai chủ tự có quyền SET sang vai API.
alter role quy_hang_owner set createrole_self_grant = 'set';
grant create on database postgres to quy_hang_owner;
grant usage, create on schema public to quy_hang_owner;
