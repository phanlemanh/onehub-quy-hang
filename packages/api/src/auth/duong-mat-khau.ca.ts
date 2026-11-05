// Bảng xếp loại đường lõi của better-auth chạm mật khẩu, đăng ký hay thư xác minh (hàng dang-nhap-mat-khau, E8). Bật
// mật khẩu ở thư viện là mở cả họ đường này; mỗi đường phải có đúng một loại: Quỹ hàng bọc, hay 404 trước bộ xử lý.
// Bài kiểm trên Postgres (E9) nhập tệp này để gọi đúng các đường «đã tắt».

export type NhanLoi = "bọc" | "đã tắt" | "chỉ gọi từ máy chủ";

/** Viết tay theo better-auth 1.7.14 — không suy từ mã đang kiểm. Khoá là tên endpoint của lõi. */
export const BANG_LOI: Record<string, [path: string | null, nhan: NhanLoi]> = {
  signInEmail: ["/sign-in/email", "bọc"],
  signUpEmail: ["/sign-up/email", "đã tắt"],
  changePassword: ["/change-password", "đã tắt"],
  setPassword: [null, "chỉ gọi từ máy chủ"],
  requestPasswordReset: ["/request-password-reset", "đã tắt"],
  resetPassword: ["/reset-password", "đã tắt"],
  requestPasswordResetCallback: ["/reset-password/:token", "đã tắt"],
  verifyPassword: ["/verify-password", "đã tắt"],
  sendVerificationEmail: ["/send-verification-email", "đã tắt"],
  verifyEmail: ["/verify-email", "đã tắt"],
};
/** Đường «đã tắt» của bảng lõi. */
export const DUONG_LOI_DA_TAT = Object.values(BANG_LOI).filter(([, n]) => n === "đã tắt").map(([p]) => p as string);

/** Endpoint lõi thuộc họ mật khẩu: tên hay đường có password, sign-up, verification-email, verify-email. */
export const thuocHoMatKhau = (ten: string, path: string | undefined) =>
  /password|signup|sign-up|verificationemail|verification-email|verifyemail|verify-email|\/sign-in\/email$/i.test(`${ten} ${path ?? ""}`);

/** Đường của bản cài thuộc họ mật khẩu mà bảng chưa xếp loại hay xếp lệch — rỗng là đủ. */
export function thieuLoai(bang: Record<string, [string | null, NhanLoi]>, banCai: [ten: string, path: string | undefined][]): string[] {
  const thieu: string[] = [];
  for (const [ten, path] of banCai) {
    if (!thuocHoMatKhau(ten, path)) continue;
    const dong = bang[ten];
    if (!dong || dong[0] !== (path ?? null)) thieu.push(path ?? ten);
  }
  return thieu;
}
