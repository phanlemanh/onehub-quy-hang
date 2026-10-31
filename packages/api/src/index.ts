export { API_VERSION, createApi, type ApiDeps } from "./app";
export { createAuth, type Auth, type CreateAuthOptions } from "./auth/auth";
export { devSender, resendSender, type OtpSender } from "./auth/sender";
export { API_ERRORS, OTP_RATE_LIMITED, type ApiErrorCode, type ApiErrorKey } from "./errors";
