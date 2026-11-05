/**
 * Đăng nhập bằng mật khẩu do sàn cấp (hàng dang-nhap-mat-khau, thiết kế §3.2). Đường `/sign-in/email` của thư viện bị
 * bọc: giới hạn thử, mật khẩu tạm và mã đổi đếm ở cơ sở dữ liệu; chỉ mật khẩu tự đặt mới tới thư viện để tạo phiên.
 * Đăng nhập bằng mật khẩu tạm không tạo phiên — chỉ cấp mã đổi cho bước «Đặt mật khẩu mới».
 *
 * Thân yêu cầu của các đường này mang mật khẩu: không bao giờ in thân, lỗi chỉ in mã.
 */
import { randomBytes } from "node:crypto";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import type { ApiDeps } from "../app";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { AUTH_BASE_PATH, SAI_TOI_DA } from "./constants";
import { chuanHoa, kiemMatKhau, type LyDoTuChoi } from "./mat-khau";
import {
  bamMaDoi,
  chuanEmail,
  datLanDau,
  datMaDoi,
  demSai,
  docTheoEmail,
  ghiSai,
  nguoiCuaMaDoi,
  xoaChuoiSai,
} from "./trang-thai-mat-khau";

const LOI_LUAT: Record<LyDoTuChoi, ApiErrorEntry> = {
  "password-too-short": API_ERRORS.passwordTooShort,
  "password-too-long": API_ERRORS.passwordTooLong,
  "password-common": API_ERRORS.passwordCommon,
  "password-guessable": API_ERRORS.passwordGuessable,
};
export const loiLuat = (code: LyDoTuChoi): ApiErrorEntry => LOI_LUAT[code];

/** Băm giả để email lạ cũng tốn một lần so mật khẩu — thời gian trả lời không lộ email có tài khoản. */
let bamGia: Promise<string> | null = null;
const layBamGia = () => (bamGia ??= hashPassword(randomBytes(16).toString("hex")));

/** Đọc thân JSON có hai trường chữ; không đúng khuôn thì null — không in gì. */
async function docThan<K extends string>(c: Context, khoa: readonly K[]): Promise<Record<K, string> | null> {
  const than: unknown = await c.req.json().catch(() => null);
  if (!than || typeof than !== "object") return null;
  const out = {} as Record<K, string>;
  for (const k of khoa) {
    const v = (than as Record<string, unknown>)[k];
    if (typeof v !== "string" || v.length === 0 || v.length > 1024) return null;
    out[k] = v;
  }
  return out;
}
const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);

/** So mật khẩu gõ với băm; mật khẩu tạm nhận cả dạng chia nhóm bằng gạch nối hay dấu cách. */
async function khop(hash: string, pw: string, tam: boolean): Promise<boolean> {
  if (await verifyPassword({ hash, password: pw })) return true;
  return tam && (await verifyPassword({ hash, password: pw.replace(/[-\s]/g, "") }));
}

export function registerPasswordAuth(api: OpenAPIHono, { identityPool, auth }: ApiDeps) {
  api.post(`${AUTH_BASE_PATH}/sign-in/email`, async (c) => {
    const than = await docThan(c, ["email", "password"] as const);
    if (!than) return tra(c, API_ERRORS.invalidEmailOrPassword);
    const email = chuanEmail(than.email);
    const pw = chuanHoa(than.password);
    if ((await demSai(identityPool, email)) >= SAI_TOI_DA) return tra(c, API_ERRORS.passwordRateLimited);

    const tk = await docTheoEmail(identityPool, email);
    const tam = tk?.state?.kind === "tam";
    const dung = tk?.hash && tk.state ? await khop(tk.hash, pw, tam) : (await verifyPassword({ hash: await layBamGia(), password: pw }), false);
    if (!dung || !tk?.state) {
      await ghiSai(identityPool, email, tk?.state ? tk.userId : null);
      return tra(c, API_ERRORS.invalidEmailOrPassword);
    }
    if (tk.state.disabledAt) return tra(c, API_ERRORS.passwordDisabled);
    await xoaChuoiSai(identityPool, tk.userId);
    if (tam) {
      if (!tk.state.tempExpiresAt || tk.state.tempExpiresAt <= new Date()) return tra(c, API_ERRORS.tempPasswordExpired);
      const ma = randomBytes(32).toString("base64url");
      await datMaDoi(identityPool, tk.userId, bamMaDoi(ma));
      return c.json({ mustChange: true, changeToken: ma }, 200);
    }
    return auth.api.signInEmail({ body: { email: tk.email, password: pw }, headers: c.req.raw.headers, asResponse: true });
  });

  api.post(`${AUTH_BASE_PATH}/password/first`, async (c) => {
    const than = await docThan(c, ["changeToken", "newPassword"] as const);
    if (!than) return tra(c, API_ERRORS.changeTokenInvalid);
    const maBam = bamMaDoi(than.changeToken);
    const nguoi = await nguoiCuaMaDoi(identityPool, maBam);
    if (!nguoi) return tra(c, API_ERRORS.changeTokenInvalid);
    const pw = chuanHoa(than.newPassword);
    const kq = kiemMatKhau(pw, nguoi.email);
    // Từ chối theo luật không tiêu mã đổi: người gõ lại trên cùng màn.
    if (!kq.ok) return tra(c, loiLuat(kq.code));
    if (!(await datLanDau(identityPool, { userId: nguoi.userId, maBam, hash: await hashPassword(pw) }))) {
      return tra(c, API_ERRORS.changeTokenInvalid);
    }
    return auth.api.signInEmail({ body: { email: nguoi.email, password: pw }, headers: c.req.raw.headers, asResponse: true });
  });
}
