import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import type pg from "pg";
import {
  AUTH_BASE_PATH,
  AUTH_DISABLED_PATHS,
  COOKIE_PREFIX,
  MAT_KHAU_MAX,
  MAT_KHAU_MIN,
  OTP_ALLOWED_ATTEMPTS,
  OTP_EXPIRES_SEC,
  OTP_ALLOWED_TYPE,
  OTP_LENGTH,
  OTP_SEND_PATHS,
  OTP_TYPE_NOT_ALLOWED,
  PASSWORD_WRAPPED_PATHS,
  SESSION_EXPIRES_SEC,
  SESSION_UPDATE_AGE_SEC,
} from "./constants";
import { allowOtpRequest } from "./otp-limit";
import { devSender, type OtpSender } from "./sender";
import { OTP_RATE_LIMITED } from "../errors";

export type CreateAuthOptions = {
  /** Kết nối chủ, search_path = identity — chỉ cho danh tính, không bao giờ chạm bảng của công ty. */
  identityPool: pg.Pool;
  secret: string;
  baseURL: string;
  sender?: OtpSender;
  env?: string;
};

/**
 * Danh tính của Quỹ hàng (ADR-0005): email + mã 6 số, không tự đăng ký — chỉ tài khoản đã được mở mới nhận mã.
 * Sàn đang làm không nằm ở đây: thành viên sàn là bảng company_members của Quỹ hàng.
 */
export function createAuth(o: CreateAuthOptions) {
  if (o.env === "production" && !o.sender) throw new Error("thiếu bộ gửi mã đăng nhập");
  const sender = o.sender ?? devSender;
  return betterAuth({
    database: o.identityPool,
    secret: o.secret,
    baseURL: o.baseURL,
    basePath: AUTH_BASE_PATH,
    disabledPaths: AUTH_DISABLED_PATHS,
    advanced: { cookiePrefix: COOKIE_PREFIX },
    session: { expiresIn: SESSION_EXPIRES_SEC, updateAge: SESSION_UPDATE_AGE_SEC },
    // Mật khẩu do sàn cấp (dang-nhap-mat-khau): không tự đăng ký; đăng nhập đi đường bọc của Quỹ hàng, các đường lõi
    // khác của họ mật khẩu bị tắt (duong-mat-khau.ca.ts).
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: MAT_KHAU_MIN,
      maxPasswordLength: MAT_KHAU_MAX,
    },
    plugins: [
      emailOTP({
        otpLength: OTP_LENGTH,
        expiresIn: OTP_EXPIRES_SEC,
        allowedAttempts: OTP_ALLOWED_ATTEMPTS,
        disableSignUp: true,
        storeOTP: "hashed",
        sendVerificationOTP: ({ email, otp }) => sender({ email, otp }),
      }),
    ],
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // Đường mật khẩu đã bọc chỉ chạy khi Quỹ hàng gọi từ máy chủ (auth.api, không có yêu cầu HTTP): một biến thể
        // địa chỉ lọt qua đường bọc tới thẳng thư viện thì 404, không được đăng nhập bằng mật khẩu tạm.
        if (PASSWORD_WRAPPED_PATHS.includes(ctx.path) && ctx.request) throw new APIError("NOT_FOUND");
        if (!OTP_SEND_PATHS.includes(ctx.path)) return;
        // Kiểu mã khác đăng nhập bị từ chối trước khi đếm: không gửi thư, không đốt lượt xin mã.
        if (ctx.body?.type !== OTP_ALLOWED_TYPE) {
          throw new APIError("BAD_REQUEST", { code: OTP_TYPE_NOT_ALLOWED, message: OTP_TYPE_NOT_ALLOWED });
        }
        const email = typeof ctx.body?.email === "string" ? ctx.body.email : "";
        if (!(await allowOtpRequest(o.identityPool, email))) {
          throw new APIError("TOO_MANY_REQUESTS", { code: OTP_RATE_LIMITED, message: OTP_RATE_LIMITED });
        }
      }),
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
