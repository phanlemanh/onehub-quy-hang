/** Bộ gửi mã đăng nhập. Gửi email thật là việc của hàng nơi chạy; bản này chỉ có bộ gửi dev. */
export type OtpSender = (m: { email: string; otp: string }) => Promise<void>;

/** In mã ra nhật ký máy chủ — chỉ cho máy dev; production phải khai bộ gửi thật (createAuth ném lỗi nếu thiếu). */
export const devSender: OtpSender = async ({ email, otp }) => {
  console.log(`[ma-dang-nhap] ${email} ${otp}`);
};

/** Bộ gửi giữ mã trong bộ nhớ — cho test. */
export function captureSender(): { sender: OtpSender; sent: { email: string; otp: string }[] } {
  const sent: { email: string; otp: string }[] = [];
  return { sent, sender: async (m) => void sent.push(m) };
}
