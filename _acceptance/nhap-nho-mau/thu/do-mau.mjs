// Lệnh đo của hàng 67 (AC-11, Hỏi-3): mỗi lần nhập đã ghi của một sàn in ba số đọc từ kế hoạch đã lưu — cột theo mẫu, cột
// người đổi đích, tổng cột — bằng hàm `doMau` của lõi. Không đọc ô, không đọc dòng. Cần DATABASE_URL (Postgres dãy hay thật).
//   node _acceptance/nhap-nho-mau/thu/do-mau.mjs --san <companyId> [--json]
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values: a } = parseArgs({ options: { san: { type: "string" }, json: { type: "boolean" }, help: { type: "boolean" } } });
if (a.help || !a.san) {
  console.log("dùng: node _acceptance/nhap-nho-mau/thu/do-mau.mjs --san <companyId> [--json] — ba số mỗi lần nhập đã ghi: theo mẫu · người đổi · tổng cột");
  process.exit(a.help ? 0 : 2);
}
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { register } = await import("tsx/esm/api");
register();
const { doMau } = await import(path.join(GOC, "packages/core/src/import/index.ts"));
const { default: pg } = await import("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const { rows } = await pool.query("select id, plan, created_at from imports where company_id = $1 and status = 'committed' order by created_at", [a.san]);
  const ds = rows.map((r) => ({ importId: r.id, at: r.created_at.toISOString(), ...doMau(r.plan) }));
  if (a.json) console.log(JSON.stringify(ds));
  else for (const d of ds) console.log(`${d.at} · ${d.importId} · theo mẫu ${d.theoMau}/${d.tong} · người đổi ${d.nguoiDoi}`);
} finally {
  await pool.end();
}
