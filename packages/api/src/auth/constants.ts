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
 * Đường không dùng tới, trả 404 trước bộ xử lý: không quên hay đặt lại mật khẩu qua thư, chưa có đổi email — để mở thì
 * chỉ là chỗ dội mã vào hộp thư người khác (hàng 55); mật khẩu chỉ đi các đường của Quỹ hàng (dang-nhap-mat-khau).
 */
export const AUTH_DISABLED_PATHS = [
  "/email-otp/request-password-reset",
  "/forget-password/email-otp",
  "/email-otp/reset-password",
  "/email-otp/request-email-change",
  "/email-otp/change-email",
  // Lõi thư viện khi bật mật khẩu: không tự đăng ký, không quên mật khẩu qua thư, đổi mật khẩu đi đường của Quỹ hàng.
  "/sign-up/email",
  "/change-password",
  "/request-password-reset",
  "/reset-password",
  "/reset-password/:token",
  "/verify-password",
  "/send-verification-email",
  "/verify-email",
];
/** Phiên sống 30 ngày, trượt theo ngày dùng: dùng lại sau hơn một ngày thì hạn dời về «bây giờ + 30 ngày». */
export const SESSION_EXPIRES_SEC = 30 * 24 * 60 * 60;
export const SESSION_UPDATE_AGE_SEC = 24 * 60 * 60;

export const AUTH_BASE_PATH = "/api/v1/auth";
/** Cookie phiên là `qh.session_token` (bản https: `__Secure-qh.session_token`). */
export const COOKIE_PREFIX = "qh";
/** Sàn đang làm — chỉ là lựa chọn; API kiểm lại thành viên mỗi lời gọi. */
export const ACTIVE_COMPANY_COOKIE = "qh_san";

// Mật khẩu do sàn cấp (hàng dang-nhap-mat-khau, ADR-0005 bổ sung 04/11). Ba số giữ cứng vì quyền và an toàn (Hỏi-3):
// một sàn nới độ dài hay giới hạn thử là mở lối đoán vào số chủ nhà.
/** Độ dài mật khẩu người tự đặt, tính theo ký tự Unicode sau khi chuẩn hoá NFC (chủ kho chọn 8 tại Cổng Phạm vi). */
export const MAT_KHAU_MIN = 8;
export const MAT_KHAU_MAX = 128;
/** Mật khẩu tạm: 16 ký tự từ bảng chữ không dễ nhầm (bỏ 0 O o 1 l I), dùng lại được tới khi đặt xong hay hết hạn. */
export const MAT_KHAU_TAM_DO_DAI = 16;
export const BANG_CHU_TAM = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
export const TAM_HAN_GIO = 72;
/** Mã đổi cấp mỗi lần đăng nhập bằng mật khẩu tạm — chỉ mở được bước đặt mật khẩu mới. */
export const MA_DOI_PHUT = 15;
/** Sai chừng này lần trong cửa sổ theo email (email lạ cũng đếm) thì chờ; sai liên tiếp tới ngưỡng khoá thì vô hiệu. */
export const SAI_TOI_DA = 5;
export const SAI_CUA_SO_PHUT = 15;
export const SAI_LIEN_TIEP_KHOA = 20;
/** Đường mật khẩu của thư viện mà Quỹ hàng bọc bằng Hono, đăng ký trước đường bắt-tất-cả. */
export const PASSWORD_WRAPPED_PATHS: readonly string[] = ["/sign-in/email"];
