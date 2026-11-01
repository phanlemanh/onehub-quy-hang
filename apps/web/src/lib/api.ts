import { createApi, createAuth, devSender, resendSender, type OtpSender } from "@quy-hang/api";
import pg from "pg";

type Api = ReturnType<typeof createApi>;
let cached: Api | undefined;

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu ${name} — xem .env.example.`);
  return v;
}

/**
 * App API dựng lười ở lời gọi đầu — không ở lúc nạp mô-đun, để `next build` chạy được khi không có cơ sở dữ liệu.
 * Có RESEND_API_KEY thì gửi mã qua Resend (ADR-0009); bản thật thiếu khoá thì createAuth ném «thiếu bộ gửi mã đăng nhập»
 * thay vì in mã ra nhật ký (AC-11).
 */
export function getApi(): Api {
  if (cached) return cached;
  const url = need("DATABASE_URL");
  const env = process.env.NODE_ENV;
  const key = process.env.RESEND_API_KEY;
  const sender: OtpSender | undefined = key
    ? resendSender({ apiKey: key, from: need("MAIL_FROM") })
    : env === "production"
      ? undefined
      : devSender;
  const identityPool = new pg.Pool({ connectionString: url, options: "-c search_path=identity" });
  const auth = createAuth({
    identityPool,
    secret: need("BETTER_AUTH_SECRET"),
    baseURL: need("BETTER_AUTH_URL"),
    sender,
    env,
  });
  cached = createApi({ appPool: new pg.Pool({ connectionString: url }), identityPool, auth, jobSecret: process.env.JOB_SECRET });
  return cached;
}

export type Me = {
  user: { id: string; email: string };
  companies: { id: string; name: string; roles: string[] }[];
  activeCompany: { id: string; name: string; roles: string[] } | null;
};

/** Đọc người đang đăng nhập cho trang dựng ở máy chủ; null khi chưa đăng nhập hay phiên đã hết. */
export async function readMe(cookie: string): Promise<Me | null> {
  const res = await getApi().request("http://quy-hang.local/api/v1/me", { headers: { cookie } });
  return res.status === 200 ? ((await res.json()) as Me) : null;
}
