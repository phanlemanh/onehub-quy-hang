// Đồ dùng chung của test cần Postgres (npm run test:db, chạy trong npm run db:test và job isolation của CI).
// Thiếu DATABASE_URL là LỖI, không phải ca bỏ qua: lệnh này chỉ chạy khi có Postgres.
import pg from "pg";
import { moSan } from "../../db/scripts/mo-san.mjs";
import { createAuth } from "../src/auth/auth";
import { captureSender } from "../src/auth/sender";

export const BASE_URL = "http://localhost:3461";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("test:db cần DATABASE_URL (Postgres đã áp migration) — xem .env.example.");

export const appPool = new pg.Pool({ connectionString: url, max: 4 });
export const identityPool = new pg.Pool({ connectionString: url, max: 4, options: "-c search_path=identity" });

export function makeAuth() {
  const capture = captureSender();
  const auth = createAuth({ identityPool, secret: "test-secret-".padEnd(40, "x"), baseURL: BASE_URL, sender: capture.sender });
  return { auth, sent: capture.sent };
}

/** Nhãn riêng mỗi lượt chạy, để dữ liệu test không đụng nhau và xoá được một lần. */
export const RUN = Math.random().toString(36).slice(2, 8);
export const mail = (who: string) => `t-${RUN}-${who}@example.test`;

/** Mở sàn và gắn email bằng công cụ vận hành (kết nối chủ, có commit). */
export async function openCompany(name: string, email: string) {
  const c = await appPool.connect();
  try {
    await c.query("begin");
    const r = await moSan(c, { ten: name, email });
    await c.query("commit");
    return r;
  } finally {
    c.release();
  }
}

/** Tài khoản không thuộc sàn nào (như người đã bị bỏ khỏi mọi sàn). */
export async function createLoneUser(email: string): Promise<string> {
  const { rows } = await identityPool.query<{ id: string }>(
    `insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, $1, $1, true) returning id`,
    [email],
  );
  return rows[0]!.id;
}

export async function cleanup() {
  await identityPool.query(`delete from identity.otp_requests where email like $1`, [`t-${RUN}-%`]);
  await identityPool.query(`delete from identity.verification where identifier like $1`, [`%t-${RUN}-%`]);
  await identityPool.query(`delete from identity."user" where email like $1`, [`t-${RUN}-%`]);
  await appPool.query(`delete from companies where name like $1`, [`%${RUN}%`]);
  await appPool.end();
  await identityPool.end();
}

type Auth = ReturnType<typeof makeAuth>["auth"];

export async function authPost(auth: Auth, path: string, body: unknown, cookie?: string) {
  return auth.handler(
    new Request(`${BASE_URL}/api/v1/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    }),
  );
}

/** Rút cặp tên=giá trị của các cookie trong Set-Cookie để gửi lại ở lời gọi sau. */
export function cookieOf(res: Response): string {
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}
