// Công cụ vận hành mở sàn (Kiến trúc §0: mở công ty mới là việc của đội vận hành, không phải của API).
// Tạo sàn theo tên và tài khoản theo email nếu chưa có, rồi gắn email làm thành viên. Chạy lại không tạo trùng.
// Chạy bằng tay trên kết nối chủ (vai bỏ qua luật theo dòng); không đường HTTP nào gọi tới tệp này.
//   npm run van-hanh:mo-san -w @quy-hang/db -- --ten "[Tên sàn]" --email <email>
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import pg from "pg";

/**
 * @param {pg.ClientBase} client kết nối chủ, đang ở trong một giao dịch hoặc không
 * @param {{ ten: string, email: string }} p
 * @returns {Promise<{ companyId: string, userId: string }>}
 */
export async function moSan(client, { ten, email }) {
  const name = ten.trim();
  const mail = email.trim().toLowerCase();
  if (!name) throw new Error("thiếu tên sàn");
  if (!/^[^\s@]+@[^\s@]+$/.test(mail)) throw new Error(`email không hợp lệ: ${email}`);

  await client.query("savepoint mo_san");
  try {
    let companyId = (await client.query("select id from companies where name = $1 order by created_at limit 1", [name]))
      .rows[0]?.id;
    if (!companyId) {
      companyId = (await client.query("insert into companies (name) values ($1) returning id", [name])).rows[0].id;
    }
    await client.query(
      `insert into identity."user" (id, name, email, "emailVerified")
       values (gen_random_uuid()::text, $1, $1, true)
       on conflict (email) do nothing`,
      [mail],
    );
    const userId = (await client.query('select id from identity."user" where email = $1', [mail])).rows[0].id;
    await client.query(
      "insert into company_members (company_id, user_id) values ($1, $2) on conflict do nothing",
      [companyId, userId],
    );
    await client.query("release savepoint mo_san");
    return { companyId, userId };
  } catch (err) {
    await client.query("rollback to savepoint mo_san");
    throw err;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { values } = parseArgs({ options: { ten: { type: "string" }, email: { type: "string" } } });
  if (!values.ten || !values.email) {
    console.error('Cách dùng: npm run van-hanh:mo-san -w @quy-hang/db -- --ten "[Tên sàn]" --email <email>');
    process.exit(2);
  }
  if (!process.env.DATABASE_URL) {
    console.error("Thiếu DATABASE_URL — xem .env.example.");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("begin");
    const { companyId } = await moSan(client, { ten: values.ten, email: values.email });
    await client.query("commit");
    console.log(`đã mở sàn ${values.ten.trim()} (${companyId}) · thành viên ${values.email.trim().toLowerCase()}`);
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
