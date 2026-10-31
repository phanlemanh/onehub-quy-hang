import { OTP_EXPIRES_SEC } from "./constants";

/** Bộ gửi mã đăng nhập. Bản thật gửi qua Resend (ADR-0009); máy dev in ra nhật ký. */
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

/** Thư mã đăng nhập — chỉ mã và hạn, không đường link: mã gõ được ở máy nào cũng xong (ADR-0005 §1). */
export function otpEmail(otp: string): { subject: string; text: string } {
  const phut = Math.round(OTP_EXPIRES_SEC / 60);
  return {
    subject: `${otp} là mã đăng nhập Quỹ hàng`,
    text: `Mã đăng nhập Quỹ hàng của bạn: ${otp}\n\nMã hết hạn sau ${phut} phút. Bạn không xin mã thì bỏ qua thư này.`,
  };
}

/**
 * Gửi mã qua API của Resend. Lỗi gửi ném ra để better-auth trả lỗi cho người xin mã, không nuốt lặng — và không ghi mã
 * vào thông báo lỗi.
 */
export function resendSender(o: { apiKey: string; from: string; fetch?: typeof fetch }): OtpSender {
  const send = o.fetch ?? fetch;
  return async ({ email, otp }) => {
    const res = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${o.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: o.from, to: [email], ...otpEmail(otp) }),
    });
    if (!res.ok) throw new Error(`gửi mã đăng nhập thất bại: Resend ${res.status}`);
  };
}
