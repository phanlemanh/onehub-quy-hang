// Chỗ thử E3: dựng trên chỗ thử hàng 79 (Postgres dãy X 5576, máy dev 3496, phiên dau-chu-1, căn ngoài khu), thêm một hàng lô của
// khu mẫu thấp tầng qua API. Chạy lại được. In một dòng JSON mã hàng lô, mã hàng ngoài khu.
//   node _acceptance/va-ho-so-lan-rao-hang-lo-ngoai-khu/thu/dung.mjs [--tat]
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const r79 = spawnSync("node", ["_acceptance/bang-hang-theo-loai-hinh/thu/dung-x.mjs", ...process.argv.slice(2)], { cwd: GOC, encoding: "utf8" });
if (r79.status !== 0) throw new Error(`dung-x hỏng: ${r79.stderr}`);
if (process.argv.includes("--tat")) process.exit(0);
const URL_GOC = "http://localhost:3496";
const CHAY79 = path.join(GOC, ".acceptance-runs/bang-hang-theo-loai-hinh");
const phien = JSON.parse(readFileSync(path.join(CHAY79, "phien.json"), "utf8"));
const goi = async (method, duong, body) => {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { "content-type": "application/json", origin: URL_GOC, cookie: phien.cookie }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const t = await r.json().catch(() => null);
  if (r.status >= 300) throw new Error(`${method} ${duong} → ${r.status} ${JSON.stringify(t)}`);
  return t;
};
const mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json"), "utf8"));
const khu = mau.danhMucThapTang.subdivisions[0];
const day = khu.blocks[0];
const ma = day.units[0].unitNumber;
let ds = await goi("GET", "/api/v1/listings");
let lo = ds.find((l) => l.blockName === day.blockName && l.unitNumber === ma);
if (!lo) lo = await goi("POST", "/api/v1/listings", { subdivisionName: khu.subdivisionName, blockName: day.blockName, unitNumber: ma });
ds = await goi("GET", "/api/v1/listings");
const nk = ds.find((l) => l.offCompoundUnitId);
if (!nk) throw new Error("không có hàng ngoài khu");
const CHAY = path.join(GOC, ".acceptance-runs/va-ho-so-lan-rao-hang-lo-ngoai-khu");
mkdirSync(CHAY, { recursive: true });
const kq = { lo: lo.id, ngoaiKhu: nk.id };
writeFileSync(path.join(CHAY, "dung.json"), JSON.stringify(kq));
console.log(JSON.stringify(kq));
