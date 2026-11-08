// Chỗ thử dãy X cho phép nhìn màn của hàng 79 (E8): Postgres dãy X (5576) nạp sàn mẫu hàng 5, máy dev tạm cổng 3496, phiên
// của đầu chủ mẫu (dau-chu-1). Dựng thêm qua đường ghi thật: căn ngoài khu mỗi loại hình (2 nhà phố, 1 biệt thự, 2 đất) và
// một hàng trên mỗi căn — địa chỉ «Đường Mẫu N» với tỉnh, xã của danh mục đơn vị hành chính công, không địa chỉ thật. Chạy lại
// được: cùng địa chỉ là cùng căn, căn đã có hàng thì không tạo thêm. In một dòng JSON: số hàng mỗi loại hình đầu chủ thấy.
//   node _acceptance/bang-hang-theo-loai-hinh/thu/dung-x.mjs          # dựng (máy dev đang chạy thì dùng lại)
//   node _acceptance/bang-hang-theo-loai-hinh/thu/dung-x.mjs --tat    # tắt máy dev (theo PID đã ghi; không pkill)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/bang-hang-theo-loai-hinh");
const LOG = path.join(CHAY, "web-x79.log");
const PID = path.join(CHAY, "web-x79.pid");
const CONG = 3496;
const URL_GOC = `http://localhost:${CONG}`;
const DB = "postgres://postgres:quyhang@localhost:5576/postgres";
const MIEN = "mau.quy-hang.test";
const KHOA_PHIEN = "dev-x79-chuoi-thu-khong-dung-o-ban-that";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(CHAY, { recursive: true });

if (process.argv.includes("--tat")) {
  if (existsSync(PID)) {
    const pid = Number(readFileSync(PID, "utf8"));
    for (const p of [-pid, pid]) {
      try {
        process.kill(p, "SIGTERM");
        break;
      } catch {
        // đã tắt
      }
    }
    console.log(`đã tắt máy dev PID ${pid}`);
  }
  process.exit(0);
}

const song = async () => {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).status === 200;
  } catch {
    return false;
  }
};

const env = { ...process.env, DATABASE_URL: DB };
for (const [lenh, args] of [
  ["npm", ["run", "db:migrate"]],
  ["node", ["packages/db/seed/nap.mjs", "--nap"]],
]) {
  const r = spawnSync(lenh, args, { cwd: GOC, env, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${lenh} ${args.join(" ")} hỏng: ${r.stderr}`);
}

if (!(await song())) {
  const out = openSync(LOG, "a");
  const p = spawn("npx", ["next", "dev", "-p", String(CONG), "apps/web"], {
    cwd: GOC,
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...env, BETTER_AUTH_SECRET: KHOA_PHIEN, BETTER_AUTH_URL: URL_GOC },
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; i < 120 && !(await song()); i++) await ngu(2000);
  if (!(await song())) throw new Error(`máy dev không lên — xem ${LOG}`);
}

const h = { "content-type": "application/json", origin: URL_GOC };
const PHIEN = path.join(CHAY, "phien.json");
const cu = existsSync(PHIEN) ? JSON.parse(readFileSync(PHIEN, "utf8")) : {};

/** Phiên của người mẫu: dùng lại phiên còn sống (mỗi email chỉ xin được 5 mã trong 15 phút — ADR-0005). */
async function dangNhap(email, giu) {
  if (giu && (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: giu } })).status === 200) return giu;
  const maCua = () => (existsSync(LOG) ? readFileSync(LOG, "utf8") : "").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  const xin = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  if (xin.status === 429) throw new Error(`xin mã ${email}: 429 — đợi 15 phút hay xoá identity.otp_requests của email miền ${MIEN} trên Postgres dãy X`);
  let ma = null;
  for (let i = 0; i < 60 && !ma; i++) {
    await ngu(500);
    const ds = maCua();
    if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
  }
  if (!ma) throw new Error(`không thấy mã đăng nhập của ${email} — máy dev phải chạy từ dung-x.mjs (log ${LOG})`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  if (!ck.length) throw new Error(`đăng nhập ${email} hỏng: ${r.status}`);
  return ck.join("; ");
}

async function goi(cookie, method, duong, body) {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { ...h, cookie }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const than = await r.json().catch(() => null);
  if (r.status >= 300) throw new Error(`${method} ${duong} → ${r.status} ${JSON.stringify(than)}`);
  return than;
}

/** Căn ngoài khu viết trước — mỗi loại hình ít nhất một, đất hai để nhóm có hơn một dòng. */
const CAN = [
  ["Townhouse", "31 Đường Mẫu 3, Phường Phú Xuân, Thành phố Huế"],
  ["Townhouse", "33 Đường Mẫu 3, Phường Phú Xuân, Thành phố Huế"],
  ["Single Family Residence", "35 Đường Mẫu 5, Phường Tân Định, Thành phố Hồ Chí Minh"],
  ["Unimproved Land", "37 Đường Mẫu 7, Phường Tân Định, Thành phố Hồ Chí Minh"],
  ["Unimproved Land", "39 Đường Mẫu 7, Phường Tân Định, Thành phố Hồ Chí Minh"],
];

const db = new pg.Client({ connectionString: DB });
await db.connect();
try {
  const san = (await db.query("select id from companies where name = '[Mẫu] Sàn thử'")).rows[0]?.id;
  if (!san) throw new Error("không có sàn mẫu");
  const email = `dau-chu-1@${MIEN}`;
  const nguoi = (await db.query('select id from identity."user" where email = $1', [email])).rows[0]?.id;
  const ck = `${await dangNhap(email, cu.cookie?.replace(/; qh_san=.*$/, ""))}; qh_san=${san}`;
  writeFileSync(PHIEN, JSON.stringify({ cookie: ck, san, nguoi }, null, 2));

  const hangCo = new Set((await db.query("select off_compound_unit_id id from listings where company_id = $1 and off_compound_unit_id is not null", [san])).rows.map((r) => r.id));
  const canDaTao = [];
  for (const [loai, diaChi] of CAN) {
    const c = await goi(ck, "POST", "/api/v1/off-compound-units", { address: diaChi, propertySubType: loai });
    if (!hangCo.has(c.id)) await goi(ck, "POST", "/api/v1/listings", { offCompoundUnitId: c.id });
    canDaTao.push({ id: c.id, loai, diaChi: c.unparsedAddress });
  }

  // Sáu hàng căn hộ trên căn của danh mục mẫu hàng 5 (chưa có hàng nào ở toà + mã ấy), giá mẫu — để bảng trộn có căn hộ.
  const mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
  const canMau = mau.danhMuc.subdivisions.flatMap((p) => p.buildings.flatMap((b) => b.units.map((u) => ({ toa: b.buildingName, ma: u.unitNumber }))));
  const daCo = new Set((await db.query("select building_name || '|' || unit_number k from listings where company_id = $1 and unit_number is not null", [san])).rows.map((r) => r.k));
  const canHoThay = (await goi(ck, "GET", "/api/v1/listings")).filter((l) => l.buildingName).length;
  for (const [i, c] of canMau.filter((c) => !daCo.has(`${c.toa}|${c.ma}`)).slice(0, Math.max(0, 6 - canHoThay)).entries()) {
    const l = await goi(ck, "POST", "/api/v1/listings", { buildingName: c.toa, unitNumber: c.ma });
    await goi(ck, "POST", `/api/v1/listings/${l.id}/events`, { type: "price_changed", payload: { listPrice: 2_500_000_000 + i * 100_000_000, feeInclusion: "included" }, expectedVersion: l.version });
  }

  // Số hàng mỗi loại hình đầu chủ thấy: căn hộ = hàng có toà; ngoài khu theo loại hình của căn.
  const ds = await goi(ck, "GET", "/api/v1/listings");
  const cans = (await goi(ck, "GET", "/api/v1/off-compound-units")).units;
  const loaiCua = new Map(cans.map((c) => [c.id, c.propertySubType]));
  const dem = { Condominium: 0, Townhouse: 0, "Single Family Residence": 0, "Unimproved Land": 0 };
  for (const l of ds) {
    if (l.buildingName) dem.Condominium++;
    else if (l.offCompoundUnitId && loaiCua.has(l.offCompoundUnitId)) dem[loaiCua.get(l.offCompoundUnitId)]++;
  }
  const kq = { buoc: "dung-x", san, nguoi, url: URL_GOC, dem, dat: canDaTao.filter((c) => c.loai === "Unimproved Land").map((c) => c.diaChi) };
  writeFileSync(path.join(CHAY, "dung-x.json"), JSON.stringify(kq, null, 2));
  console.log(JSON.stringify(kq));
} finally {
  await db.end();
}
