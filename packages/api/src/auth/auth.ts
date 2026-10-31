import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import type pg from "pg";
import {
  AUTH_BASE_PATH,
  COOKIE_PREFIX,
  OTP_ALLOWED_ATTEMPTS,
  OTP_EXPIRES_SEC,
  OTP_LENGTH,
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
    advanced: { cookiePrefix: COOKIE_PREFIX },
    session: { expiresIn: SESSION_EXPIRES_SEC, updateAge: SESSION_UPDATE_AGE_SEC },
    emailAndPassword: { enabled: false },
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
        if (ctx.path !== "/email-otp/send-verification-otp") return;
        const email = typeof ctx.body?.email === "string" ? ctx.body.email : "";
        if (!(await allowOtpRequest(o.identityPool, email))) {
          throw new APIError("TOO_MANY_REQUESTS", { code: OTP_RATE_LIMITED, message: OTP_RATE_LIMITED });
        }
      }),
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
