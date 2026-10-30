import type pg from "pg";

/**
 * Tài khoản cho một email — tạo khi chưa có (hàng 7: quản trị mời là đường duy nhất để người mới có tài khoản, vì hàng 6
 * tắt tự đăng ký). Phần danh tính: chỉ chạm schema identity, trên kết nối danh tính.
 */
export async function ensureAccount(identityPool: pg.Pool, email: string): Promise<string> {
  const mail = email.trim().toLowerCase();
  await identityPool.query(
    `insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, $1, $1, true)
     on conflict (email) do nothing`,
    [mail],
  );
  const { rows } = await identityPool.query<{ id: string }>('select id from identity."user" where email = $1', [mail]);
  return rows[0]!.id;
}

/** Email của các tài khoản — để màn Người dùng hiện tên người; vai API không đọc được schema identity. */
export async function emailsOf(identityPool: pg.Pool, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { rows } = await identityPool.query<{ id: string; email: string }>(
    'select id, email from identity."user" where id = any($1::text[])',
    [ids],
  );
  return new Map(rows.map((r) => [r.id, r.email]));
}
