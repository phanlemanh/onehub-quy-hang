// Lệnh nạp và xoá dữ liệu mẫu ở phần ghi được vào cơ sở dữ liệu hiện có: sàn thử, người mẫu, vai, khu, khu phụ trách.
// Danh mục, hàng, chủ nhà, lead nằm trong mau/du-lieu-mau.json, chờ các hàng dựng bảng (8, 9–10, 11, 24).
// Chạy bằng tay trên kết nối chủ như mo-san.mjs, chỉ trên Postgres của dãy hay của máy — kho chưa có môi trường thật.
//   node packages/db/seed/nap.mjs --nap | --xoa
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import pg from "pg";
import { MIEN_EMAIL, TEN_SAN } from "./du-lieu-mau.mjs";
import { THU_MUC_MAU } from "./sinh.mjs";

/**
 * Nạp lại được: chạy lần hai không đổi số dòng hay nội dung. Vai đặt bằng đúng ma trận, không cộng dồn. `sanId` có thì
 * nạp vào đúng sàn ấy — bộ nạp bản thật (`nap-ban-that.ts`) tự nhận sàn mẫu, không tìm theo tên.
 */
export async function napMau(client, d, sanId) {
  let san = sanId ?? (await client.query("select id from companies where name = $1 order by created_at limit 1", [d.san.ten])).rows[0]?.id;
  if (!san) san = (await client.query("insert into companies (name) values ($1) returning id", [d.san.ten])).rows[0].id;
  const khu = {};
  for (const k of d.khu) {
    await client.query("insert into company_zones (company_id, name) values ($1, $2) on conflict (company_id, name) do nothing", [san, k.ten]);
    khu[k.ten] = (await client.query("select id from company_zones where company_id = $1 and name = $2", [san, k.ten])).rows[0].id;
  }
  for (const n of d.nguoi) {
    await client.query(
      `insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, $1, $2, true)
       on conflict (email) do update set name = excluded.name where identity."user".name is distinct from excluded.name`,
      [n.ten, n.email],
    );
    const nguoi = (await client.query('select id from identity."user" where email = $1', [n.email])).rows[0].id;
    await client.query(
      `insert into company_members (company_id, user_id, roles) values ($1, $2, $3)
       on conflict (company_id, user_id) do update set roles = excluded.roles
         where company_members.roles is distinct from excluded.roles`,
      [san, nguoi, n.vai],
    );
    for (const ten of n.khu) {
      await client.query("insert into member_zones (company_id, user_id, zone_id) values ($1, $2, $3) on conflict do nothing", [
        san,
        nguoi,
        khu[ten],
      ]);
    }
  }
  return { san };
}

// Mọi câu xoá mang một trong hai nhãn: email thuộc miền mẫu, hoặc tên sàn đúng tên sàn thử. Xoá tài khoản dây chuyền
// thành viên và khu phụ trách của nó; xoá sàn dây chuyền khu. Bài kiểm phá thử chạy trên bản sao của chính danh sách này.
export const CAU_XOA = [
  [`delete from identity."user" where email like $1`, [`%@${MIEN_EMAIL}`]],
  ["delete from companies where name = $1", [TEN_SAN]],
];

/** @returns {Promise<{ nguoi: number, san: number }>} */
export async function xoaMau(client, cau = CAU_XOA) {
  const dem = [];
  for (const [sql, tham] of cau) dem.push((await client.query(sql, tham)).rowCount ?? 0);
  return { nguoi: dem[0], san: dem[1] };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { values } = parseArgs({ options: { nap: { type: "boolean" }, xoa: { type: "boolean" } } });
  if (values.nap === values.xoa) {
    console.error("Cách dùng: node packages/db/seed/nap.mjs --nap | --xoa");
    process.exit(2);
  }
  // Như npm run van-hanh:mo-san: lấy DATABASE_URL từ .env.local ở gốc kho khi biến chưa đặt.
  if (!process.env.DATABASE_URL) {
    try {
      process.loadEnvFile(path.join(THU_MUC_MAU, "../../../../.env.local"));
    } catch {
      // không có .env.local — báo thiếu ngay dưới
    }
  }
  if (!process.env.DATABASE_URL) {
    console.error("Thiếu DATABASE_URL — đặt trong .env.local ở gốc kho (xem .env.example) hoặc export trước khi chạy.");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("begin");
    if (values.nap) {
      const d = JSON.parse(readFileSync(path.join(THU_MUC_MAU, "du-lieu-mau.json"), "utf8"));
      const { san } = await napMau(client, d);
      console.log(`đã nạp ${d.san.ten} (${san}) · ${d.nguoi.length} người mẫu · ${d.khu.length} khu`);
    } else {
      const { nguoi, san } = await xoaMau(client);
      console.log(`đã xoá ${san} sàn mẫu · ${nguoi} tài khoản mẫu`);
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
