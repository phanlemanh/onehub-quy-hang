// Người mẫu cho ba màn xác thực của hồ sơ dang-nhap-auth-15 trên chỗ thử dãy B (Postgres 5572 · container
// quy-hang-db-dkn-B, dựng bằng _acceptance/bang-hang-dang-the/thu/dung-b.mjs). Chạy lại không đổi gì.
//   hai-san@mau.quy-hang.test  — quản trị «[Mẫu] Sàn thứ hai» và thành viên «[Mẫu] Sàn thử» → màn Chọn sàn
//   chua-gan@mau.quy-hang.test — có tài khoản, không thuộc sàn nào → màn Chưa thuộc sàn nào
// Mở sàn qua công cụ vận hành của kho (packages/db/scripts/mo-san.mjs); gắn thêm thành viên, tạo tài khoản bằng psql trên kết nối chủ.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CONTAINER = "quy-hang-db-dkn-B";
const env = { ...process.env, DATABASE_URL: "postgres://postgres:quyhang@localhost:5572/postgres" };
const chay = (cmd, args) => execFileSync(cmd, args, { cwd: GOC, env, encoding: "utf8" });
const psql = (sql) => chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-qAtc", sql]).trim();

chay("node", ["packages/db/scripts/mo-san.mjs", "--ten", "[Mẫu] Sàn thứ hai", "--email", "hai-san@mau.quy-hang.test"]);
psql(`insert into company_members (company_id, user_id, roles)
      select c.id, u.id, '{listing_agent}' from companies c, identity."user" u
      where c.name = '[Mẫu] Sàn thử' and u.email = 'hai-san@mau.quy-hang.test'
      on conflict do nothing`);
// Sàn không được để trống quản trị (trigger giu_mot_quan_tri), nên người chưa gắn sàn là một tài khoản tạo thẳng, không qua mở sàn.
psql(`insert into identity."user" (id, name, email, "emailVerified")
      select 'mau-chua-gan', '[Mẫu] Chưa gắn sàn', 'chua-gan@mau.quy-hang.test', true
      where not exists (select 1 from identity."user" where email = 'chua-gan@mau.quy-hang.test')`);

const dem = (email) =>
  psql(`select count(*) from company_members m join identity."user" u on u.id = m.user_id where u.email = '${email}'`);
console.log(`hai-san@mau.quy-hang.test thuộc ${dem("hai-san@mau.quy-hang.test")} sàn · chua-gan@mau.quy-hang.test thuộc ${dem("chua-gan@mau.quy-hang.test")} sàn`);
