import { createApi, createAuth, devSender, resendSender, type OtpSender } from "@quy-hang/api";
import { attachDatabasePool } from "@vercel/functions";
import pg from "pg";

type Api = ReturnType<typeof createApi>;
let cached: Api | undefined;

/**
 * Cỡ pool (sự cố 06/11): pooler Supabase chế độ session cấp TỔNG 15 kết nối cho cả dự án, và mọi khách dùng chung
 * `DATABASE_URL` cùng chia. Mỗi bản triển khai (chính thức, xem trước — cùng biến môi trường) chạy HAI hàm có đồ thị mô-đun
 * riêng, mỗi hàm một bộ pool: hàm trang và API (`NOI_TRANG`), và hàm bước chặn đầu `proxy.ts` (`NOI_CHAN_DAU` — chỉ đọc
 * phiên để làm mới cookie). Mặc định của pg (10 mỗi pool) để một hàm giữ tới 20 kết nối. Nay hàm trang giữ tối đa 4, bước
 * chặn đầu tối đa 2, nhả kết nối rảnh sau 5 giây; `attachDatabasePool` nhả kết nối rảnh trước khi Vercel treo phiên bản;
 * yêu cầu vượt cỡ xếp hàng trong pool. Khoảng dư mỏng ở chế độ phiên — gốc lâu dài là pooler chế độ giao dịch (cổng 6543,
 * hồ sơ pooler-che-do-giao-dich): mã chạy được ở cả hai chế độ vì không bể nào giữ trạng thái phiên; đổi chế độ là đổi
 * `DATABASE_URL`, chủ kho quyết ở Cổng Bằng chứng.
 */
const NHA_SOM = { idleTimeoutMillis: 5_000, connectionTimeoutMillis: 10_000 } as const;
export const NOI_TRANG = { danhTinh: { max: 2, ...NHA_SOM }, ungDung: { max: 2, ...NHA_SOM } } as const;
export const NOI_CHAN_DAU = { danhTinh: { max: 1, ...NHA_SOM }, ungDung: { max: 1, ...NHA_SOM } } as const;
export type Noi = "trang" | "chan-dau";
const CO_THEO_NOI = { trang: NOI_TRANG, "chan-dau": NOI_CHAN_DAU } as const;
/**
 * Số bản triển khai có hàm cùng ấm (chính thức + một bản xem trước), mỗi bản một hàm trang và một hàm bước chặn đầu; và
 * số kết nối của khách khác (job migrate của CI, quản trị). Giả định: hàm trang và hàm API là một hàm (Vercel gom tuyến
 * của Next vào cùng hàm khi cấu hình như nhau).
 */
export const SO_BAN_DU_KIEN = 2;
export const KHACH_KHAC = 2;
export const TRAN_POOLER = 15;

/** Lỗi hạ tầng khi đọc phiên (cơ sở dữ liệu nghẽn, API lỗi) — khác «chưa đăng nhập»: vỏ hiện trang lỗi, không đá về đăng nhập. */
export class LoiDocPhien extends Error {
  constructor(readonly status: number) {
    super(`Không đọc được phiên (HTTP ${status})`);
    this.name = "LoiDocPhien";
  }
}

/**
 * Nghe lỗi kết nối (va-pool-nghe-loi): pooler cắt kết nối (cạn, khởi động lại) thì pg phát `error`; không ai nghe là lỗi
 * không bắt được và phiên bản hàm chết. Hai chỗ nghe, theo pg-pool 3.14:
 * - kết nối RẢNH: pool tự bỏ kết nối hỏng rồi phát `error` lên pool → ghi đúng một dòng (tên pool, nơi chạy, mã, câu lỗi;
 *   không in đối tượng lỗi hay cấu hình — chuỗi kết nối mang mật khẩu);
 * - kết nối ĐÃ MƯỢN: pool gỡ trình nghe rảnh lúc cho mượn, nên chính kết nối phát `error` → trình chặn lặng trên mỗi kết
 *   nối mới; truy vấn kế tiếp trên kết nối ấy vẫn nhận lỗi của chính nó (đi đường cũ), nên không ghi dòng thứ hai.
 */
function ngheLoi(pool: pg.Pool, ten: "danh-tinh" | "ung-dung", noi: Noi) {
  pool.on("error", (err: Error & { code?: string }) => {
    console.error(`[pool:${ten}·${noi}] kết nối rảnh hỏng, đã bỏ — ${err.code ?? "?"}: ${err.message}`);
  });
  pool.on("connect", (client) => {
    client.on("error", () => {
      // Lặng: lỗi về truy vấn kế tiếp trên kết nối này; kết nối rảnh đã có dòng của pool ở trên.
    });
  });
}

/** Cổng của chuỗi kết nối — chỉ cổng, không máy chủ hay mật khẩu; vắng cổng là mặc định của Postgres. */
function congCua(url: string): string {
  try {
    return new URL(url).port || "5432";
  } catch {
    return "?";
  }
}

/**
 * Hai pool của một hàm, đúng cỡ của nơi chạy, cả hai gắn `attachDatabasePool` (tham số để bài kiểm thay) và nghe lỗi.
 * Không bể nào mang tham số khởi động (`options`): pooler chế độ giao dịch không giữ trạng thái phiên — lược đồ danh tính
 * đặt ở adapter của better-auth (`schemaName`) và truy vấn tay ghi `identity.`. Mỗi lần dựng ghi một dòng nêu cổng để
 * nhật ký của một triển khai nói nó nối chế độ nào (5432 phiên, 6543 giao dịch).
 */
export function dungPools(url: string, noi: Noi = "trang", attach: (pool: pg.Pool) => void = attachDatabasePool) {
  const co = CO_THEO_NOI[noi];
  console.log(`[pool:ket-noi] cổng ${congCua(url)} · ${noi}`);
  const identityPool = new pg.Pool({ ...co.danhTinh, connectionString: url });
  const appPool = new pg.Pool({ ...co.ungDung, connectionString: url });
  ngheLoi(identityPool, "danh-tinh", noi);
  ngheLoi(appPool, "ung-dung", noi);
  attach(identityPool);
  attach(appPool);
  return { identityPool, appPool };
}

/** Cổng mà công tắc `DATABASE_POOLER_PORT` nhận: 5432 pooler chế độ phiên, 6543 pooler chế độ giao dịch. */
export const CONG_POOLER = ["5432", "6543"] as const;

/**
 * Công tắc cổng (pooler-che-do-giao-dich, chủ kho chọn 06/11): `DATABASE_URL` trên Vercel là bí mật kín, không ai phải
 * cầm nó để đổi chế độ — biến thường `DATABASE_POOLER_PORT` đổi cổng lúc dựng bể. Vắng biến → giữ nguyên chuỗi; giá trị
 * khác 5432/6543 → ném (không khởi động với cổng lạ). Lỗi không in chuỗi kết nối.
 */
export function doiCong(url: string, cong: string | undefined): string {
  if (cong === undefined || cong === "") return url;
  if (!(CONG_POOLER as readonly string[]).includes(cong)) throw new Error(`DATABASE_POOLER_PORT chỉ nhận ${CONG_POOLER.join(" hoặc ")}, có «${cong}»`);
  const u = new URL(url);
  u.port = cong;
  return u.toString();
}

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu ${name} — xem .env.example.`);
  return v;
}

/**
 * App API dựng lười ở lời gọi đầu — không ở lúc nạp mô-đun, để `next build` chạy được khi không có cơ sở dữ liệu.
 * Có RESEND_API_KEY thì gửi mã qua Resend (ADR-0009); bản thật thiếu khoá thì createAuth ném «thiếu bộ gửi mã đăng nhập»
 * thay vì in mã ra nhật ký (AC-11). `noi` chọn cỡ pool: bước chặn đầu gọi `getApi("chan-dau")`; mọi nơi khác để mặc định.
 * Một đồ thị mô-đun dựng một lần — nơi gọi đầu tiên quyết cỡ (máy dev có thể chung đồ thị: cỡ vẫn trong giới hạn).
 */
export function getApi(noi: Noi = "trang"): Api {
  if (cached) return cached;
  const url = doiCong(need("DATABASE_URL"), process.env.DATABASE_POOLER_PORT);
  const env = process.env.NODE_ENV;
  const key = process.env.RESEND_API_KEY;
  const sender: OtpSender | undefined = key
    ? resendSender({ apiKey: key, from: need("MAIL_FROM") })
    : env === "production"
      ? undefined
      : devSender;
  const { identityPool, appPool } = dungPools(url, noi);
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
