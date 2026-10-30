# ADR-0003: Đăng nhập theo sàn

Ngày: 2026-10-30 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `dang-nhap-theo-san` 30/10, cả bốn
khuyến nghị; duyệt kế hoạch cùng ngày kèm tên schema `identity`) · Liên quan: ADR-0001 mục «Chưa chốt», Kiến trúc §5 và
§10, hàng 6 của lộ trình

## Bối cảnh

ADR-0001 để better-auth có tổ chức làm hướng khởi điểm và để cách đăng nhập (email hay số điện thoại) cho vòng đăng
nhập theo sàn. Nền cách ly đã có (migration 001): mọi bảng của công ty mang luật theo dòng theo `app.current_company_id()`.
Còn thiếu đoạn nối người → phiên → sàn đang làm → giao dịch của API.

## Quyết định

1. **Email + mã 6 số qua email** cho bản đầu. Đầu chủ ngồi máy tính nhưng đọc email trên điện thoại; link đăng nhập mở
   ra ở máy đọc email, còn mã gõ được ở máy nào cũng xong. Cùng luồng «định danh → mã» đổi sang số điện thoại + OTP khi
   có sàn ngoài mà không đổi màn. Google và số điện thoại để sau. Mã hết hạn sau 5 phút, sai 3 lần thì hỏng; mỗi email
   xin mã tối đa 5 lần trong 15 phút.
2. **better-auth chỉ giữ danh tính** (tài khoản, phiên, mã), không dùng phần «tổ chức». Thành viên sàn là bảng
   `company_members` của Quỹ hàng, có luật theo dòng như mọi bảng của công ty. Sàn đã là `companies`; vai và «một người
   nhiều vai, có khu» là việc của hàng 7 trên bảng của mình.
3. **Danh tính ở schema `identity`**, kết nối chủ riêng; vai `quy_hang_app` không có quyền gì trên schema này. Không dùng
   tên `auth` vì Supabase giữ schema ấy cho hệ đăng nhập của chính nó.
4. **Không tự đăng ký**: chỉ email đã có tài khoản mới nhận mã; tài khoản sinh ra khi đội vận hành mở sàn
   (`npm run van-hanh:mo-san -w @quy-hang/db`), sau này khi quản trị sàn mời. Email lạ nhận cùng câu trả lời, không
   có mã nào được gửi.
5. **Sàn đang làm chọn ở API mỗi lời gọi**: sàn trong cookie `qh_san` nếu người còn là thành viên, không thì sàn duy
   nhất; nhiều sàn chưa chọn → 409 `chon-san`; không sàn → 403 `chua-gan-san`. Mọi truy vấn bảng của công ty đi qua
   một hàm `withCompany` đặt vai `quy_hang_app`, `app.user_id`, `app.company_id`.
6. **Màn đăng nhập tạm tự viết** tối giản; chuyển thể khối ReUI `auth-15` sau khi hàng 4 (chuẩn giao diện) gộp.
7. **Bản thật thiếu bộ gửi email thì không khởi động** — không bao giờ rơi về bộ gửi dev in mã ra nhật ký.

## Hệ quả

- Gửi email thật (nhà cung cấp, tên miền gửi) là việc của hàng nơi chạy; tới đó bản thật không chạy được.
- Test cần Postgres của API ở `packages/api/test-db/`, chạy trong `npm run db:test` — job `isolation` của CI chạy chúng.
- Hàng 7 thêm quyền ghi `company_members` cho vai API cùng vai, khu, lời mời bằng migration mới.
