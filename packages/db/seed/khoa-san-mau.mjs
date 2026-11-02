// Khoá tư vấn Postgres cho các tệp kiểm cùng dựng «[Mẫu] Sàn thử» trên một Postgres (du-lieu-mau.test.mjs dựng sàn mẫu
// dev, nap-ban-that.test.ts dựng sàn mẫu bản thật — cùng tên, cùng quản trị mẫu). Lượt chấm chạy các lệnh kiểm song song,
// nên không khoá thì tệp này thấy, hay gỡ mất, sàn mẫu của tệp kia (S4 r1 hàng nap-mau-co-anh). Giữ khoá suốt tệp kiểm.
import pg from "pg";

/** Chờ tới khi giữ được khoá; trả hàm nhả khoá và đóng kết nối. */
export async function giuKhoaSanMau(url) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  await c.query("select pg_advisory_lock(hashtext('quy-hang:san-mau'))");
  return async () => {
    await c.query("select pg_advisory_unlock(hashtext('quy-hang:san-mau'))").catch(() => {});
    await c.end();
  };
}
