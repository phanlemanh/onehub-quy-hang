// Bảng xếp loại mọi endpoint của plugin mã email (hàng 55, AC-4). Kiểm thử của auth và bài kiểm trên Postgres cùng
// nhập tệp này, để đường «đã tắt» mà Postgres gọi là đúng đường đã đối chiếu với bản cài.

export type Nhan = "gửi mã, có giới hạn" | "đã tắt" | "không gửi mã";

/** Viết tay theo routes.mjs của better-auth 1.7.14 — không suy từ mã đang kiểm. Khoá là tên endpoint của plugin. */
export const BANG: Record<string, [path: string | null, nhan: Nhan]> = {
  sendVerificationOTP: ["/email-otp/send-verification-otp", "gửi mã, có giới hạn"],
  createVerificationOTP: [null, "không gửi mã"], // chỉ gọi từ máy chủ, không có đường
  getVerificationOTP: [null, "không gửi mã"], // chỉ gọi từ máy chủ, không có đường
  checkVerificationOTP: ["/email-otp/check-verification-otp", "không gửi mã"],
  verifyEmailOTP: ["/email-otp/verify-email", "không gửi mã"],
  signInEmailOTP: ["/sign-in/email-otp", "không gửi mã"],
  requestPasswordResetEmailOTP: ["/email-otp/request-password-reset", "đã tắt"],
  forgetPasswordEmailOTP: ["/forget-password/email-otp", "đã tắt"],
  resetPasswordEmailOTP: ["/email-otp/reset-password", "đã tắt"],
  requestEmailChangeEmailOTP: ["/email-otp/request-email-change", "đã tắt"],
  changeEmailEmailOTP: ["/email-otp/change-email", "đã tắt"],
};
/** Đường «đã tắt» của bảng — bài kiểm trên Postgres gọi đúng danh sách này. */
export const DUONG_DA_TAT = Object.values(BANG).filter(([, n]) => n === "đã tắt").map(([p]) => p as string);
