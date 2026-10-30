// Hằng của đăng nhập bằng mã email (ADR-0003). Ghi thành hằng để test kiểm đúng số, không dựa vào mặc định thư viện.
export const OTP_LENGTH = 6;
export const OTP_EXPIRES_SEC = 300;
export const OTP_ALLOWED_ATTEMPTS = 3;
/** Mỗi email xin mã tối đa chừng này lần trong cửa sổ; lần kế trả 429. Đếm cả email lạ để 429 không thành đường dò. */
export const OTP_REQUEST_LIMIT = 5;
export const OTP_REQUEST_WINDOW_MIN = 15;

export const AUTH_BASE_PATH = "/api/v1/auth";
/** Cookie phiên là `qh.session_token` (bản https: `__Secure-qh.session_token`). */
export const COOKIE_PREFIX = "qh";
/** Sàn đang làm — chỉ là lựa chọn; API kiểm lại thành viên mỗi lời gọi. */
export const ACTIVE_COMPANY_COOKIE = "qh_san";
