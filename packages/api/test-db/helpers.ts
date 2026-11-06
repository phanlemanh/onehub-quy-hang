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
// Dựng như máy chủ (pooler-che-do-giao-dich): không tham số khởi động — bộ kiểm đỏ nếu còn câu dựa vào search_path.
export const identityPool = new pg.Pool({ connectionString: url, max: 4 });

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
  await identityPool.query(`delete from identity.password_failures where email like $1`, [`t-${RUN}-%`]);
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

/** Câu chạm bảng của công ty ở schema public. */
const PUBLIC_TABLE = /\b(companies|company_members|agreements)\b/i;
export type QueryRecord = { sql: string; currentUser: string };

/**
 * Pool bọc ghi lại mọi câu chạm bảng public kèm vai đang chạy (current_user đọc ngay trước câu, trên cùng kết nối).
 * Dùng thay appPool khi dựng API để khẳng định 100% truy vấn chạy bằng quy_hang_app (AC-8, E8b).
 */
export function recordingPool(pool: pg.Pool): { pool: pg.Pool; records: QueryRecord[] } {
  const records: QueryRecord[] = [];
  // Bọc bằng Proxy, không gán đè lên kết nối: kết nối của pool được tái dùng, gán đè thì câu ngoài phép đo cũng bị ghi.
  const wrapClient = (client: pg.PoolClient): pg.PoolClient => {
    const raw = client.query.bind(client) as (...a: unknown[]) => Promise<pg.QueryResult>;
    const query = async (...args: unknown[]) => {
      const sql = typeof args[0] === "string" ? args[0] : String((args[0] as { text?: string })?.text ?? "");
      if (PUBLIC_TABLE.test(sql)) {
        const who = await raw("select current_user as u");
        records.push({ sql, currentUser: String(who.rows[0]?.u) });
      }
      return raw(...args);
    };
    return new Proxy(client, {
      get(target, prop) {
        if (prop === "query") return query;
        const v = Reflect.get(target, prop) as unknown;
        return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(target) : v;
      },
    });
  };
  const wrapped = {
    connect: async () => wrapClient(await pool.connect()),
    query: async (sql: string, params?: unknown[]) => {
      const client = wrapClient(await pool.connect());
      try {
        return await client.query(sql, params);
      } finally {
        client.release();
      }
    },
  };
  return { pool: wrapped as unknown as pg.Pool, records };
}

/**
 * Thêm một ảnh thật (ngăn Gửi được, không ảnh mẫu) cho căn của hàng — bài kiểm đưa hàng lên Đang bán cần nó từ hàng 23
 * (luật lõi: vào Đang bán phải có ảnh thật). Ghi thẳng bằng kết nối chủ; byte ảnh không cần cho phép đếm.
 */
export async function themAnhThat(listingId: string): Promise<void> {
  const r = await appPool.query(
    `insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by)
     select gen_random_uuid(), company_id, building_name, unit_number, 'shareable', 'image/jpeg', 1000, 10, 10, 'bai-kiem'
     from listings where id = $1 and unit_number is not null`,
    [listingId],
  );
  if (r.rowCount !== 1) throw new Error(`themAnhThat: hàng ${listingId} không có hay không có mã căn`);
}
