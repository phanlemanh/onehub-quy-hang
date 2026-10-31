// Đồ dựng cho bài chấm màn Ô nhận lead (E10, «DỰNG L» ở evals.yaml). Nạp sàn và người mẫu của hàng 5, rồi năm hàng của
// bộ mẫu (H-04 căn mở của L-01, H-06 và H-21 của chủ CN-01, H-01 Đã bán, H-02 Ngừng hẳn) qua chính đường ghi của API
// (createListing, applyCommand, putOwner) dưới vai quy_hang_app với người là đầu chủ mẫu. Chạy lại được: sàn đã có năm hàng
// thì bỏ qua bước nạp hàng. Chỉ chạy trên Postgres của dãy hay của máy.
//   node --import tsx _acceptance/o-nhan-lead/thu/dung-mau.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { napMau } from "../../../packages/db/seed/nap.mjs";
import { withCompany } from "../../../packages/api/src/db.ts";
import { applyCommand, createListing, viewerOf } from "../../../packages/api/src/listings/store.ts";
import { putOwner } from "../../../packages/api/src/owners/store.ts";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
if (!process.env.DATABASE_URL) process.loadEnvFile(path.join(GOC, ".env.local"));
const d = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
const NAP = ["H-04", "H-06", "H-21", "H-01", "H-02"];
const TOA = Object.fromEntries(d.danhMuc.projects.flatMap((p) => p.buildings.map((b) => [b.buildingKey, b.buildingName])));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const chu = await pool.connect();
let san;
try {
  await chu.query("begin");
  san = (await napMau(chu, d)).san;
  await chu.query("commit");
} finally {
  chu.release();
}
const idCua = async (khoa) =>
  (await pool.query('select id from identity."user" where email = $1', [d.nguoi.find((n) => n.khoa === khoa).email])).rows[0].id;
const nguoi = Object.fromEntries(await Promise.all(d.nguoi.map(async (n) => [n.khoa, await idCua(n.khoa)])));
const daCo = (await pool.query("select count(*)::int n from listings where company_id = $1", [san])).rows[0].n;

const lenh = async (ctx, id, type, payload) =>
  withCompany(pool, ctx, async (tx) => {
    const v = (await tx.query("select version from listings where id = $1", [id])).rows[0].version;
    const r = await applyCommand(tx, await viewerOf(tx, ctx.userId), id, { type, payload, expectedVersion: v });
    if ("error" in r) throw new Error(`${type}: ${r.error.code}`);
  });

if (daCo >= NAP.length) {
  console.log(`sàn mẫu đã có ${daCo} hàng — bỏ qua bước nạp hàng`);
} else {
  for (const ma of NAP) {
    const h = d.hang.find((x) => x.ma === ma);
    const c = d.chuNha.find((x) => x.ma === h.chuNha);
    const ctx = { userId: nguoi[h.dauChu], companyId: san };
    const id = await withCompany(pool, ctx, async (tx) => {
      const r = await createListing(tx, { buildingName: TOA[h.maCan[0]], unitNumber: h.maCan });
      if ("error" in r) throw new Error(r.error.code);
      const o = await putOwner(tx, r.listingId, { ownerName: c.ten, ownerPhone: c.soDienThoai });
      if ("error" in o) throw new Error(o.error.code);
      return r.listingId;
    });
    if (h.trangThai !== "Incomplete") {
      await lenh(ctx, id, "price_changed", { listPrice: h.gia, feeInclusion: h.dieuKienPhi === "bao_phi" ? "included" : "excluded" });
      await lenh(ctx, id, "details_changed", { legalStatus: "pink_book", occupantType: "vacant" });
      if (h.trangThai === "Withdrawn") await lenh(ctx, id, "status_changed", { to: "Withdrawn", withdrawnReason: "owner_changed_mind" });
      else if (h.trangThai === "Hold") await lenh(ctx, id, "status_changed", { to: "Hold" });
      else {
        await lenh(ctx, id, "status_changed", { to: "Active" });
        if (h.trangThai === "Closed") await lenh(ctx, id, "status_changed", { to: "Closed", closePrice: h.gia, closeDate: "2026-10-01" });
      }
    }
  }
  console.log(`đã nạp ${NAP.length} hàng mẫu vào sàn ${san}`);
}
await pool.end();

const L01 = d.lead.find((l) => l.ma === "L-01");
const L02 = d.lead.find((l) => l.ma === "L-02");
console.log("\nNgười mẫu (đăng nhập bằng email, mã ở nhật ký máy chủ dev):");
for (const n of d.nguoi) console.log(`  ${n.email.padEnd(32)} ${n.vai.join(", ")}`);
console.log("\nBa ca của bài chấm màn:");
console.log(`  căn trùng   số ${L01.soDienThoai} · mã căn ${L01.maCan}`);
console.log(`  chủ trùng   số ${L02.soDienThoai} · mã căn B-09.08`);
console.log("  không trùng số 0900 000 088 · mã căn B-09.09");
