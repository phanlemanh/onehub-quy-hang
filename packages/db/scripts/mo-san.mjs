// Công cụ vận hành mở sàn (Kiến trúc §0: mở công ty mới là việc của đội vận hành, không phải của API).
// Tạo sàn và tài khoản theo email nếu chưa có, rồi gắn email làm thành viên mang đủ năm vai. Một lần mở sàn nhận
// diện bằng cặp (tên, email quản trị): chạy lại không tạo trùng, còn công ty mới trùng tên một sàn đang chạy thì được sàn
// riêng — không bao giờ gắn người vào sàn của công ty khác (hàng 56, bất biến 1).
// Chạy bằng tay trên kết nối chủ (vai bỏ qua luật theo dòng); không đường HTTP nào gọi tới tệp này.
//   npm run van-hanh:mo-san -w @quy-hang/db -- --ten "[Tên sàn]" --email <email>
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import pg from "pg";
import goiVai from "../../core/src/access/goi-vai.json" with { type: "json" };

// Trao Quản trị sàn là trao luôn bốn vai làm việc (cách B, Tham chiếu §12; hàng chu-san-du-vai): một nguồn với màn Người dùng.
const VAI_NGUOI_DAU_TIEN = ["company_admin", ...goiVai.company_admin];

/**
 * @param {pg.ClientBase} client kết nối chủ, đang ở trong một giao dịch hoặc không
 * @param {{ ten: string, email: string }} p
 * @returns {Promise<{ companyId: string, userId: string, daCo: number, chayLai: boolean }>}
 *   `daCo`: số sàn KHÁC cùng tên đã có trước lần mở này; `chayLai`: email đã là quản trị một sàn cùng tên.
 */
export async function moSan(client, { ten, email }) {
  const name = ten.trim();
  const mail = email.trim().toLowerCase();
  if (!name) throw new Error("thiếu tên sàn");
  if (!/^[^\s@]+@[^\s@]+$/.test(mail)) throw new Error(`email không hợp lệ: ${email}`);

  await client.query("savepoint mo_san");
  try {
    // Chạy lại = email đã là QUẢN TRỊ của một trong MỌI sàn cùng tên. Thành viên thường (được mời) không tính.
    const chayLaiId = (
      await client.query(
        `select c.id from companies c
         join company_members m on m.company_id = c.id
         join identity."user" u on u.id = m.user_id
         where c.name = $1 and u.email = $2 and 'company_admin' = any (m.roles)
         order by c.created_at limit 1`,
        [name, mail],
      )
    ).rows[0]?.id;
    const cungTen = Number((await client.query("select count(*) n from companies where name = $1", [name])).rows[0].n);
    const companyId =
      chayLaiId ?? (await client.query("insert into companies (name) values ($1) returning id", [name])).rows[0].id;
    const chayLai = Boolean(chayLaiId);
    const daCo = chayLai ? cungTen - 1 : cungTen;
    await client.query(
      `insert into identity."user" (id, name, email, "emailVerified")
       values (gen_random_uuid()::text, $1, $1, true)
       on conflict (email) do nothing`,
      [mail],
    );
    const userId = (await client.query('select id from identity."user" where email = $1', [mail])).rows[0].id;
    // Người được đội vận hành gắn vào sàn là quản trị sàn (hàng 7) và mang đủ vai làm việc: từ đó quản trị tự mời người khác.
    // Chạy lại không đổi vai: nhánh on conflict chỉ thêm quyền quản trị khi người đó chưa có, không trao thêm vai làm việc.
    await client.query(
      `insert into company_members (company_id, user_id, roles) values ($1, $2, $3)
       on conflict (company_id, user_id) do update
         set roles = company_members.roles || '{company_admin}'::text[]
         where not ('company_admin' = any (company_members.roles))`,
      [companyId, userId, VAI_NGUOI_DAU_TIEN],
    );
    await client.query("release savepoint mo_san");
    return { companyId, userId, daCo, chayLai };
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
    const { companyId, daCo, chayLai } = await moSan(client, { ten: values.ten, email: values.email });
    await client.query("commit");
    if (chayLai) console.log(`chạy lại — sàn có sẵn ${companyId}`);
    else if (daCo > 0) console.log(`đã có ${daCo} sàn khác cùng tên — đây là sàn mới ${companyId}`);
    console.log(`đã mở sàn ${values.ten.trim()} (${companyId}) · thành viên ${values.email.trim().toLowerCase()}`);
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
