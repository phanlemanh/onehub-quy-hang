import { createApi, createAuth, devSender, resendSender, type OtpSender } from "@quy-hang/api";
import { attachDatabasePool } from "@vercel/functions";
import pg from "pg";

type Api = ReturnType<typeof createApi>;
let cached: Api | undefined;

/**
 * Cỡ pool của mỗi phiên bản hàm (sự cố 06/11): pooler Supabase chế độ session cấp TỔNG 15 kết nối cho cả dự án, và mọi
 * khách dùng chung `DATABASE_URL` cùng chia — phiên bản hàm của bản chính thức, của bản xem trước (cùng biến môi trường),
 * và job migrate của CI. Mặc định của pg (10 mỗi pool, hai pool) để một phiên bản giữ tới 20 kết nối. Nay mỗi phiên bản
 * giữ tối đa 4, nhả kết nối rảnh sau 5 giây; `attachDatabasePool` nhả kết nối rảnh trước khi Vercel treo phiên bản; yêu
 * cầu vượt cỡ xếp hàng trong pool. Khoảng dư mỏng — gốc lâu dài là pooler chế độ transaction (vòng riêng).
 */
export const POOL_DANH_TINH = { max: 2, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 10_000 } as const;
export const POOL_UNG_DUNG = { max: 2, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 10_000 } as const;
/** Số phiên bản hàm cùng sống mà cỡ trên tính cho (chính thức + xem trước), và số kết nối của khách khác (migrate, quản trị). */
export const SO_PHIEN_BAN_DU_KIEN = 3;
export const KHACH_KHAC = 2;
export const TRAN_POOLER = 15;

/** Lỗi hạ tầng khi đọc phiên (cơ sở dữ liệu nghẽn, API lỗi) — khác «chưa đăng nhập»: vỏ hiện trang lỗi, không đá về đăng nhập. */
export class LoiDocPhien extends Error {
  constructor(readonly status: number) {
    super(`Không đọc được phiên (HTTP ${status})`);
    this.name = "LoiDocPhien";
  }
}

/** Hai pool của một phiên bản hàm, đúng cỡ ở trên, cả hai gắn `attachDatabasePool` (tham số để bài kiểm thay). */
export function dungPools(url: string, attach: (pool: pg.Pool) => void = attachDatabasePool) {
  const identityPool = new pg.Pool({ ...POOL_DANH_TINH, connectionString: url, options: "-c search_path=identity" });
  const appPool = new pg.Pool({ ...POOL_UNG_DUNG, connectionString: url });
  attach(identityPool);
  attach(appPool);
  return { identityPool, appPool };
}

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
  const { identityPool, appPool } = dungPools(url);
  const auth = createAuth({
    identityPool,
    secret: need("BETTER_AUTH_SECRET"),
    baseURL: need("BETTER_AUTH_URL"),
    sender,
    env,
  });
  cached = createApi({ appPool, identityPool, auth, jobSecret: process.env.JOB_SECRET });
  return cached;
}

export type Me = {
  user: { id: string; email: string };
  companies: { id: string; name: string; roles: string[] }[];
  activeCompany: { id: string; name: string; roles: string[] } | null;
};

/** Phân loại phản hồi `/api/v1/me` (thuần, có bài kiểm): 5xx là lỗi hạ tầng — ném, không phải «chưa đăng nhập». */
export async function docPhanHoiMe(res: Response): Promise<{ me: Me } | { biBao: string } | null> {
  if (res.status >= 500) throw new LoiDocPhien(res.status);
  if (res.status === 200) return { me: (await res.json()) as Me };
  if (res.status === 401) {
    const b = (await res.json().catch(() => null)) as { error?: string; userId?: string } | null;
    if (b?.error === "device_reported_lost" && b.userId) return { biBao: b.userId };
  }
  return null;
}

const goiMe = (cookie: string) => getApi().request("http://quy-hang.local/api/v1/me", { headers: { cookie } });

/**
 * Đọc người đang đăng nhập cho trang dựng ở máy chủ; null khi chưa đăng nhập hay phiên đã hết. Lỗi hạ tầng (5xx) ném
 * `LoiDocPhien` để ranh giới lỗi hiện «Thử lại» — không coi là hết phiên.
 */
export async function readMe(cookie: string): Promise<Me | null> {
  const doc = await docPhanHoiMe(await goiMe(cookie));
  return doc && "me" in doc ? doc.me : null;
}

/**
 * Như `readMe`, kèm ca máy bị báo mất (hàng 38): 401 mang mã `device_reported_lost` trả mã người bị báo để vỏ chuyển sang
 * màn đăng nhập xoá kho của người ấy.
 */
export async function readMeHayBiBao(cookie: string): Promise<{ me: Me } | { biBao: string } | null> {
  return docPhanHoiMe(await goiMe(cookie));
}
