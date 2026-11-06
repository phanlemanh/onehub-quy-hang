import type pg from "pg";

/**
 * Tên hiển thị của người từ phần danh tính (như tên đầu chủ ở lời báo). Tài khoản mời chưa đặt tên mang tên = email —
 * khi ấy chỉ trả phần trước «@», không trả email.
 */
export async function tenHienThi(identityPool: pg.Pool, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { rows } = await identityPool.query<{ id: string; name: string | null }>('select id, name from identity."user" where id = any($1)', [ids]);
  return new Map(rows.map((r) => [r.id, (r.name ?? "").split("@")[0]!.trim()]));
}
