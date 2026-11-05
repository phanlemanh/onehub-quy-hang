// Lệnh nạp phần ghi được của bộ mẫu thấp tầng (hàng 73) vào bảng hiện có: hai đầu chủ, hai vùng phụ trách, phân vùng —
// vào chính «[Mẫu] Sàn thử» (tạo nếu chưa có). Lô, căn ngoài khu, hàng, chủ nhà, lead nằm trong tệp, chờ hàng 76. Chung
// một sàn với bộ hàng 5 vì kiểm trùng chỉ chạy trong một công ty; xoá bằng lệnh xoá của hàng 5, một lệnh gỡ cả hai bộ:
//   node packages/db/seed/nap-thap-tang.mjs --nap
//   node packages/db/seed/nap.mjs --xoa
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import pg from "pg";
import { napMau } from "./nap.mjs";
import { TEP_DU_LIEU, THU_MUC_THAP_TANG } from "./sinh-thap-tang.mjs";

/** Nạp lại được: chạy lần hai không đổi dòng nào. Cùng đường ghi với bộ hàng 5 (tìm sàn mẫu theo tên, như hàng 5). */
export const napThapTang = (client, d, sanId) => napMau(client, { san: d.san, khu: d.vung, nguoi: d.nguoi }, sanId);

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { values } = parseArgs({ options: { nap: { type: "boolean" } } });
  if (!values.nap) {
    console.error("Cách dùng: node packages/db/seed/nap-thap-tang.mjs --nap   (xoá: node packages/db/seed/nap.mjs --xoa)");
    process.exit(2);
  }
  if (!process.env.DATABASE_URL) {
    try {
      process.loadEnvFile(path.join(THU_MUC_THAP_TANG, "../../../../.env.local"));
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
    const d = JSON.parse(readFileSync(path.join(THU_MUC_THAP_TANG, TEP_DU_LIEU), "utf8"));
    const { san } = await napThapTang(client, d);
    console.log(`đã nạp phần thấp tầng vào ${d.san.ten} (${san}) · ${d.nguoi.length} người mẫu · ${d.vung.length} vùng`);
    await client.query("commit");
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
