import type pg from "pg";

/**
 * Cửa duy nhất tới bảng của công ty (bất biến 1, AC-8). Mỗi lời gọi một giao dịch chạy bằng vai `quy_hang_app` — không
 * phải chủ bảng — với người và sàn đặt bằng `set local`, nên luật theo dòng của Postgres luôn áp. Sàn được trống:
 * bước đọc danh sách sàn của người trước khi chọn sàn đang làm.
 */
export async function withCompany<T>(
  pool: pg.Pool,
  ctx: { userId: string; companyId: string | null },
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("set local role quy_hang_app");
    await client.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [
      ctx.userId,
      ctx.companyId ?? "",
    ]);
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
