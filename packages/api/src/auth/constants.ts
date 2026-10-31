// Hằng của đăng nhập bằng mã email (ADR-0005). Ghi thành hằng để test kiểm đúng số, không dựa vào mặc định thư viện.
export const OTP_LENGTH = 6;
export const OTP_EXPIRES_SEC = 300;
export const OTP_ALLOWED_ATTEMPTS = 3;
/** Mỗi email xin mã tối đa chừng này lần trong cửa sổ; lần kế trả 429. Đếm cả email lạ để 429 không thành đường dò. */
export const OTP_REQUEST_LIMIT = 5;
export const OTP_REQUEST_WINDOW_MIN = 15;
/**
 * Mọi đường của plugin mã email gửi được mã mà còn phục vụ — giới hạn trên gác cả tập, cùng một bộ đếm theo email.
 * Mở lại một đường gửi mã (đổi email chẳng hạn) là thêm nó vào đây, không viết hook mới (hàng 55).
 */
export const OTP_SEND_PATHS: readonly string[] = ["/email-otp/send-verification-otp"];
/** Đường xin mã chỉ phát mã đăng nhập: thư nào cũng mang tiêu đề «mã đăng nhập», mã kiểu khác gây nhầm (hàng 55). */
export const OTP_ALLOWED_TYPE = "sign-in";
export const OTP_TYPE_NOT_ALLOWED = "code-type-not-allowed";
/**
 * Đường của plugin không dùng tới, trả 404 trước bộ xử lý: kho không có mật khẩu (quên, đặt lại mật khẩu) và chưa có
 * đổi email — để mở thì chỉ là chỗ dội mã vào hộp thư người khác (hàng 55).
 */
export const AUTH_DISABLED_PATHS = [
  "/email-otp/request-password-reset",
  "/forget-password/email-otp",
  "/email-otp/reset-password",
  "/email-otp/request-email-change",
  "/email-otp/change-email",
];
/** Phiên sống 30 ngày, trượt theo ngày dùng: dùng lại sau hơn một ngày thì hạn dời về «bây giờ + 30 ngày». */
export const SESSION_EXPIRES_SEC = 30 * 24 * 60 * 60;
export const SESSION_UPDATE_AGE_SEC = 24 * 60 * 60;

export const AUTH_BASE_PATH = "/api/v1/auth";
/** Cookie phiên là `qh.session_token` (bản https: `__Secure-qh.session_token`). */
export const COOKIE_PREFIX = "qh";
/** Sàn đang làm — chỉ là lựa chọn; API kiểm lại thành viên mỗi lời gọi. */
export const ACTIVE_COMPANY_COOKIE = "qh_san";
