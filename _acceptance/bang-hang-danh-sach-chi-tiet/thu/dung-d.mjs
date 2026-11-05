// Chỗ thử dãy D cho phép nhìn màn của hàng 105 (E1–E4, E6, E7b, E10; khuôn từ hàng 92): Postgres dãy D (5575) nạp sàn
// mẫu, máy dev tạm cổng 3477, phiên của đầu chủ mẫu (dau-chu-1), dau-chu-2, trưởng nhóm, đầu khách. Dựng thêm:
//   - đủ hàng cho dau-chu-1 để bảng cuộn trong khung (hàng chưa đủ để rao, mã căn trong danh mục mẫu, giá mẫu);
//   - ba căn Toàn sàn cho cột «Đầu chủ»: một căn gán dau-chu-1, một căn chưa gán, một căn gán cho một thành viên mẫu đã bị
//     gỡ khỏi sàn (mỗi lần dựng đặt lại cả ba — ca E7 gán lại căn thứ ba qua API).
// Dữ liệu nhãn mẫu, email miền mau.quy-hang.test (bộ xoá của sàn mẫu dọn được).
//   node _acceptance/bang-hang-danh-sach-chi-tiet/thu/dung-d.mjs          # dựng (chạy lại: dùng lại máy dev)
//   node _acceptance/bang-hang-danh-sach-chi-tiet/thu/dung-d.mjs --tat    # tắt máy dev (theo PID đã ghi; không pkill)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/bang-hang-danh-sach-chi-tiet");
const LOG = path.join(CHAY, "web-d105.log");
const PID = path.join(CHAY, "web-d105.pid");
const CONG = 3477;
const URL_GOC = `http://localhost:${CONG}`;
const DB = "postgres://postgres:quyhang@localhost:5575/postgres";
const MIEN = "mau.quy-hang.test";
const SO_HANG_DAU_CHU_1 = 70;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(CHAY, { recursive: true });

if (process.argv.includes("--tat")) {
  if (existsSync(PID)) {
    const pid = Number(readFileSync(PID, "utf8"));
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        // tiến trình đã tắt
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

// Next chỉ cho một máy dev mỗi thư mục: máy dev khác của chính worktree này chặn máy 3477. Tắt đúng các tiến trình nghe
// cổng mà thư mục làm việc là apps/web của worktree này — không đụng worktree khác.
function tatMayDevCungThuMuc() {
  const nghe = spawnSync("lsof", ["-iTCP", "-sTCP:LISTEN", "-P", "-t"], { encoding: "utf8" }).stdout.split("\n").filter(Boolean);
  for (const pid of new Set(nghe)) {
    const cwd = spawnSync("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"], { encoding: "utf8" }).stdout.split("\n").find((l) => l.startsWith("n"));
    const cong = spawnSync("lsof", ["-a", "-p", pid, "-iTCP", "-sTCP:LISTEN", "-P", "-Fn"], { encoding: "utf8" }).stdout;
    if (cwd === `n${path.join(GOC, "apps/web")}` && !cong.includes(`:${CONG}`)) {
      try {
        process.kill(Number(pid), "SIGTERM");
        console.log(JSON.stringify({ buoc: "tat-may-dev-cung-thu-muc", pid }));
      } catch {
        // đã tắt
      }
    }
  }
}

if (!(await song())) {
  tatMayDevCungThuMuc();
  await ngu(2000);
  const out = openSync(LOG, "a");
  const p = spawn("npx", ["next", "dev", "-p", String(CONG), "apps/web"], {
    cwd: GOC,
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...env, BETTER_AUTH_SECRET: "dev-d105-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC },
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; i < 120 && !(await song()); i++) await ngu(2000);
  if (!(await song())) throw new Error(`máy dev không lên — xem ${LOG}`);
}

const h = { "content-type": "application/json", origin: URL_GOC };
const PHIEN = path.join(CHAY, "phien.json");
const cu = existsSync(PHIEN) ? JSON.parse(readFileSync(PHIEN, "utf8")).cookie ?? {} : {};

/** Phiên của một người mẫu: dùng lại phiên còn sống (mỗi email chỉ xin được 5 mã trong 15 phút — ADR-0005). */
async function dangNhap(email, giu) {
  if (giu && (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: giu } })).status === 200) return giu;
  const maCua = () => (existsSync(LOG) ? readFileSync(LOG, "utf8") : "").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  const xin = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  if (xin.status === 429) throw new Error(`xin mã ${email}: 429 — xoá identity.otp_requests của email miền ${MIEN} trên Postgres dãy D rồi chạy lại`);
  let ma = null;
  for (let i = 0; i < 60 && !ma; i++) {
    await ngu(500);
    const ds = maCua();
    if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
  }
  if (!ma) throw new Error(`không thấy mã đăng nhập của ${email} — máy dev phải chạy từ dung-d.mjs (log ${LOG})`);
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

const db = new pg.Client({ connectionString: DB });
await db.connect();
try {
  const san = (await db.query("select id from companies where name = '[Mẫu] Sàn thử'")).rows[0]?.id;
  if (!san) throw new Error("không có sàn mẫu");
  const idCua = async (email) => (await db.query('select id from identity."user" where email = $1', [email])).rows[0]?.id;
  const mail = (t) => `${t}@${MIEN}`;

  const ck = {};
  for (const t of ["dau-chu-1", "dau-chu-2", "truong-nhom", "dau-khach"]) {
    const giu = cu[t]?.replace(/; qh_san=.*$/, "");
    ck[t] = `${await dangNhap(mail(t), giu)}; qh_san=${san}`;
  }

  // 1. Đủ hàng cho đầu chủ mẫu để bảng cuộn trong khung: hàng mới chưa đủ để rao, mã căn trong danh mục mẫu, giá mẫu.
  const mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
  const canMau = mau.danhMuc.subdivisions.flatMap((p) => p.buildings.flatMap((b) => b.units.map((u) => ({ toa: b.buildingName, ma: u.unitNumber }))));
  const daCo = new Set((await db.query("select building_name || '|' || unit_number k from listings where company_id = $1 and unit_number is not null", [san])).rows.map((r) => r.k));
  const thay = async () => (await goi(ck["dau-chu-1"], "GET", "/api/v1/listings")).length;
  let n = await thay();
  // Hai phần ba Toà A, một phần ba Toà B — lọc theo một toà vẫn còn đủ dòng để cuộn.
  const hangDoi = [...canMau.filter((c) => c.toa === "Toà A"), ...canMau.filter((c) => c.toa !== "Toà A")].filter((c) => !daCo.has(`${c.toa}|${c.ma}`));
  const chon = [];
  for (let i = 0, a = 0, b = 0; chon.length < SO_HANG_DAU_CHU_1 && i < hangDoi.length; i++) {
    const c = hangDoi[i];
    if (c.toa === "Toà A" ? a++ < 46 : b++ < 24) chon.push(c);
  }
  for (const [i, c] of chon.entries()) {
    if (n >= SO_HANG_DAU_CHU_1) break;
    const l = await goi(ck["dau-chu-1"], "POST", "/api/v1/listings", { buildingName: c.toa, unitNumber: c.ma });
    await goi(ck["dau-chu-1"], "POST", `/api/v1/listings/${l.id}/events`, {
      type: "price_changed",
      payload: { listPrice: 2_500_000_000 + (i % 30) * 50_000_000, feeInclusion: i % 2 ? "included" : "excluded" },
      expectedVersion: l.version,
    });
    n++;
  }

  // 2. Ba căn Toàn sàn cho cột «Đầu chủ» — chọn trong các căn Đang bán của dau-chu-1 (đầu chủ khác thấy được).
  const dc1 = await idCua(mail("dau-chu-1"));
  const dc2 = await idCua(mail("dau-chu-2"));
  const tn = await idCua(mail("truong-nhom"));
  const dangBan = (
    await db.query(
      `select l.id, l.building_name toa, l.unit_number ma from listings l
        where l.company_id = $1 and l.standard_status = 'Active' and l.unit_number is not null and l.building_name = 'Toà A'
        order by l.unit_number`,
      [san],
    )
  ).rows;
  if (dangBan.length < 2) throw new Error("sàn mẫu dãy D cần ít nhất hai căn Đang bán ở Toà A");
  const [daGan, daRoi] = dangBan;
  const ganLai = async (listingId, userId) =>
    db.query(
      `insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by)
       values ($1, $2, (select coalesce(max(seq), 0) + 1 from listing_agent_assignments where listing_id = $2), $3, $4)`,
      [san, listingId, userId, tn],
    );
  await ganLai(daGan.id, dc1);
  // Căn chưa gán: bảng gán đầu chủ chỉ thêm (không gỡ được), nên dựng một hàng mới do dau-chu-2 tạo mà chưa ai nhận —
  // người tạo đọc được hàng «Chỉ tôi» của mình (ca E7 xem bằng dau-chu-2). Dựng một lần, ghi mã ở chua-gan.json.
  const TEP_CHUA_GAN = path.join(CHAY, "chua-gan.json");
  let chuaGan = existsSync(TEP_CHUA_GAN) ? JSON.parse(readFileSync(TEP_CHUA_GAN, "utf8")) : null;
  const conHang = chuaGan && (await db.query("select 1 from listings where id = $1", [chuaGan.id])).rowCount;
  const coNguoiGiu = conHang && (await db.query("select 1 from listing_agent_assignments where listing_id = $1", [chuaGan.id])).rowCount;
  if (!conHang || coNguoiGiu) {
    const daCo2 = new Set((await db.query("select building_name || '|' || unit_number k from listings where company_id = $1 and unit_number is not null", [san])).rows.map((r) => r.k));
    const c = canMau.find((x) => x.toa !== "Toà A" && !daCo2.has(`${x.toa}|${x.ma}`));
    const l = await goi(ck["dau-chu-2"], "POST", "/api/v1/listings", { buildingName: c.toa, unitNumber: c.ma });
    await goi(ck["dau-chu-2"], "POST", `/api/v1/listings/${l.id}/events`, { type: "price_changed", payload: { listPrice: 3_100_000_000, feeInclusion: "included" }, expectedVersion: l.version });
    chuaGan = { id: l.id, toa: c.toa, ma: c.ma };
    writeFileSync(TEP_CHUA_GAN, JSON.stringify(chuaGan));
  }
  // Thành viên mẫu đã rời sàn: vào sàn với vai đầu chủ, giữ căn thứ ba, rồi bị gỡ khỏi sàn.
  const emailRoi = mail("da-roi-105");
  await db.query(
    `insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, '[Mẫu] Đầu chủ đã rời', $1, true)
     on conflict (email) do nothing`,
    [emailRoi],
  );
  const roi = await idCua(emailRoi);
  await db.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{listing_agent}') on conflict do nothing", [san, roi]);
  await ganLai(daRoi.id, roi);
  await db.query("delete from company_members where company_id = $1 and user_id = $2", [san, roi]);

  const ten = Object.fromEntries((await db.query('select email, name from identity."user" where email like $1', [`%@${MIEN}`])).rows.map((r) => [r.email.split("@")[0], r.name]));
  const can = { daGan, chuaGan, daRoi };
  writeFileSync(PHIEN, JSON.stringify({ san, cookie: ck, can, nguoi: { dc1, dc2, tn, roi }, ten }));
  const soThay = {};
  for (const t of Object.keys(ck)) soThay[t] = (await goi(ck[t], "GET", "/api/v1/listings")).length;
  console.log(JSON.stringify({ buoc: "cho-thu", url: URL_GOC, pid: readFileSync(PID, "utf8").trim(), san, soThay, can: Object.fromEntries(Object.entries(can).map(([k, v]) => [k, v.ma])) }));
} finally {
  await db.end();
}
