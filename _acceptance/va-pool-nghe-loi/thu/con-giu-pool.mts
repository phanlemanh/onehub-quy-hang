// va-pool-nghe-loi E3, E8: tiến trình con giữ một kết nối tới chỗ thử (Postgres sau công tắc mạng cổng 5599), rồi chờ lệnh.
//   node --import tsx con-giu-pool.mts <dungPools|tran> <ranh|muon>
// dungPools = nạp dungPools THẬT từ apps/web/src/lib/api.ts; tran = pg.Pool trần (đối chứng).
// ranh = select 1 rồi để kết nối rảnh trong pool; muon = mượn kết nối bằng pool.connect(), select 1, GIỮ không trả.
// In «san-sang» khi đã giữ kết nối; nhận một dòng bất kỳ trên stdin thì làm bước kế, in kết quả, thoát 0.
import { createInterface } from "node:readline";
import pg from "pg";

import { dungPools } from "../../../apps/web/src/lib/api";

const [cach, kieu] = process.argv.slice(2);
const url = process.env.DATABASE_URL ?? "";
if (!url || !["dungPools", "tran"].includes(cach ?? "") || !["ranh", "muon"].includes(kieu ?? "")) {
  console.error("dùng: con-giu-pool.mts <dungPools|tran> <ranh|muon> (cần DATABASE_URL)");
  process.exit(2);
}

const pool = cach === "dungPools" ? dungPools(url, "trang", () => {}).appPool : new pg.Pool({ connectionString: url, max: 2 });
let muon: pg.PoolClient | undefined;

if (kieu === "ranh") {
  await pool.query("select 1");
} else {
  muon = await pool.connect();
  await muon.query("select 1");
}
console.log("san-sang");

const rl = createInterface({ input: process.stdin });
rl.once("line", async () => {
  if (muon) {
    try {
      await muon.query("select 1");
      console.log("muon-van-chay");
    } catch {
      console.log("muon-tu-choi");
    }
    muon.release(true);
  }
  const r = await pool.query("select 1 as n");
  console.log(`ket-qua ${r.rows[0].n}`);
  rl.close();
  await pool.end();
  process.exit(0);
});
