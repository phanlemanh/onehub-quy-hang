# Đóng đường gửi mã thừa — thiết kế

Hàng 55 của lộ trình (nền, dãy X, đợt nen-2, T3), đứng trên hàng 6 (đăng nhập theo sàn, ADR-0005). Mở từ Cổng Bằng
chứng hàng 6, mục Ngoài-6 và Ngoài-10 — chủ kho chọn «mở hợp đồng mới» ngày 30/10.

## Vấn đề

Đăng nhập bằng mã email dùng plugin `emailOTP` của better-auth (1.7.14). Giới hạn «mỗi email xin mã tối đa 5 lần trong
15 phút» (ADR-0005 mục 1) chỉ gác đúng một đường: hook `before` của `packages/api/src/auth/auth.ts` so
`ctx.path === "/email-otp/send-verification-otp"`. Plugin còn hai đường gửi mã khác chạy dưới `/api/v1/auth`:

| Đường của plugin | Gửi mã? | Hôm nay |
|---|---|---|
| `/email-otp/send-verification-otp` | có (sign-in, email-verification, forget-password) | có giới hạn |
| `/email-otp/request-password-reset` | có (forget-password) | **không giới hạn** |
| `/forget-password/email-otp` (cũ, sẽ bỏ ở bản lớn kế) | có (forget-password) | **không giới hạn** |
| `/email-otp/reset-password` | không — đặt lại mật khẩu | mở, vô nghĩa vì không có mật khẩu |
| `/email-otp/request-email-change` | có khi bật đổi email | cấu hình chưa bật đổi email → 400 |

Người lạ biết email của thành viên sàn gọi hai đường quên mật khẩu bao nhiêu lần cũng được: hộp thư thành viên bị dội
mã, và mã ấy không đăng nhập được (kho không có mật khẩu — `emailAndPassword.enabled: false`).

## Cách làm

1. **Đóng mọi đường gửi mã không dùng tới bằng `disabledPaths` của better-auth.** Năm đường vào `disabledPaths`: ba
   đường quên / đặt lại mật khẩu (`/email-otp/request-password-reset`, `/forget-password/email-otp`,
   `/email-otp/reset-password`) và hai đường đổi email (`/email-otp/request-email-change`, `/email-otp/change-email` —
   kho chưa bật đổi email, hôm nay trả 400). Bộ định tuyến của better-auth trả 404 trước khi chạy bộ xử lý, không gửi
   mã, không ghi dòng xin mã. Kho không có mật khẩu và chưa có đổi email nên không ai mất gì.
2. **Giới hạn gác theo tập đường gửi mã, không theo một đường.** Hằng `OTP_SEND_PATHS` (constants.ts) liệt mọi đường
   của plugin gửi mã mà còn phục vụ — hôm nay chỉ còn `/email-otp/send-verification-otp`. Hook `before` gác mọi đường
   trong tập (`OTP_SEND_PATHS.includes(ctx.path)`), cùng bộ đếm `identity.otp_requests` theo email. Mở lại một đường gửi
   mã về sau = thêm nó vào tập, không viết hook mới.
3. **Lưới chống đường mới.** Bài kiểm đọc danh sách đường của plugin từ chính bản cài (`auth.options.plugins` →
   `email-otp` → `endpoints`), đối chiếu bảng phân loại viết tay: «gửi mã, có giới hạn» · «đã tắt» · «không gửi mã».
   Cùng bài kiểm ghim hai lối gửi mã không qua endpoint: số hook của plugin (gửi mã khi đăng ký) và cấu hình xác minh
   email lõi (`overrideDefaultEmailVerification`, `sendVerificationOnSignUp`, `emailVerification.sendVerificationEmail`
   đều vắng). Nâng better-auth mà plugin thêm đường hay hook chưa phân loại → bài kiểm đỏ, gọi tên.

Lối khác đã loại: chặn ở bộ gửi (`sendVerificationOTP`) — bộ gửi chạy có thể sau khi trả lời, không trả được 429 cho
người gọi, và mã đã được tạo, lưu.

## Không làm

- Không đổi số 5 lần / 15 phút hay cách đếm (ADR-0005).
- Không bật đổi email (hai đường đổi email bị tắt như trên); không chặn kiểu mã khác «sign-in» trên đường xin mã chính (câu Hỏi-1 ở Cổng Phạm vi).
- Không thêm giới hạn theo địa chỉ IP.

## Đặc tả UX

Bỏ — hàng chỉ đổi đường API đăng nhập, màn đăng nhập gọi đúng đường xin mã chính và không đổi.
