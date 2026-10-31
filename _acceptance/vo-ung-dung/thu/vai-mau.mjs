// Người mẫu cho bài nhìn của vỏ (E3–E9, E13): mỗi vai một người, người nhiều vai, người hai sàn. Chạy lại không tạo
// trùng — vai bị ghi đè đúng như bảng. Không dữ liệu thật: email *@example.test, sàn «Sàn mẫu A/B».
//   DATABASE_URL=postgres://postgres:quyhang@localhost:5546/postgres node _acceptance/vo-ung-dung/thu/vai-mau.mjs
import pg from "pg";
import { moSan } from "../../../packages/db/scripts/mo-san.mjs";

const SAN_A = "Sàn mẫu A";
const SAN_B = "Sàn mẫu B";

/**
 * [email, sàn, vai] — sàn B có người riêng để danh sách Người dùng của hai sàn khác nhau (E3). Quản trị đứng đầu mỗi
 * sàn: sàn phải luôn còn một quản trị, nên người được mở sàn rồi hạ vai chỉ hạ được khi đã có quản trị khác.
 */
const NGUOI = [
  ["quan-tri@example.test", SAN_A, ["company_admin"]],
  ["hai-san@example.test", SAN_A, ["company_admin"]],
  ["hai-san@example.test", SAN_B, ["company_admin"]],
  ["telesales@example.test", SAN_A, ["telesales"]],
  ["dau-chu@example.test", SAN_A, ["listing_agent"]],
  ["dau-khach@example.test", SAN_A, ["buyer_agent"]],
  ["truong-nhom@example.test", SAN_A, ["team_lead"]],
  ["truong-nhom-2@example.test", SAN_A, ["team_lead"]],
  ["nhieu-vai@example.test", SAN_A, ["team_lead", "company_admin"]],
  ["moi-vai@example.test", SAN_A, ["telesales", "listing_agent", "buyer_agent", "team_lead", "company_admin"]],
  ["dau-chu-san-b@example.test", SAN_B, ["listing_agent"]],
];

if (!process.env.DATABASE_URL) {
  console.error("Thiếu DATABASE_URL");
  process.exit(1);
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("begin");
  for (const [email, san, vai] of NGUOI) {
    const { companyId, userId } = await moSan(client, { ten: san, email });
    await client.query("update company_members set roles = $3 where company_id = $1 and user_id = $2", [
      companyId,
      userId,
      vai,
    ]);
  }
  await client.query("commit");
  for (const [email, san, vai] of NGUOI) console.log(`${email.padEnd(28)} ${san.padEnd(10)} ${vai.join(", ")}`);
} catch (err) {
  await client.query("rollback").catch(() => {});
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await client.end();
}
