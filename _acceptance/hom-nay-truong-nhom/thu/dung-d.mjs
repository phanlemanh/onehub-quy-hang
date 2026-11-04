// Chỗ thử dãy D cho ba phép nhìn màn của hàng 42 (E6, E7, E10): Postgres dãy D (5575) nạp sàn mẫu, máy dev tạm cổng 3476,
// và một bộ dữ liệu đủ cho màn trưởng nhóm — căn Đang bán của hai đầu chủ (vài căn chưa xác nhận với chủ để thành «cần gọi
// lại»), ba lead: một chưa chia được (toà không ai phụ trách), một quá hạn nhận, một quá hạn gọi. Lead và căn đi qua lối
// API thật; chỉ hai việc dùng kết nối chủ: thêm một dòng ảnh thật cho căn (như themAnhThat của bộ kiểm API) và lùi mốc giao
// của lead để thành quá hạn. Dữ liệu nhãn mẫu, số 0900 000 0xx.
//   node _acceptance/hom-nay-truong-nhom/thu/dung-d.mjs          # dựng (chạy lại: dùng lại máy dev, thêm lead mới)
//   node _acceptance/hom-nay-truong-nhom/thu/dung-d.mjs --tat    # tắt máy dev (theo PID đã ghi; không pkill)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/hom-nay-truong-nhom");
const LOG = path.join(CHAY, "web-d42.log");
const PID = path.join(CHAY, "web-d42.pid");
export const URL_GOC = "http://localhost:3476";
const DB = "postgres://postgres:quyhang@localhost:5575/postgres";
const JOB = "dev-d42-job-khong-dung-o-ban-that";
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
      } catch {}
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

const nap = spawnSync("node", ["packages/db/seed/nap.mjs", "--nap"], { cwd: GOC, env: { ...process.env, DATABASE_URL: DB }, encoding: "utf8" });
if (nap.status !== 0) throw new Error(`nạp sàn mẫu hỏng: ${nap.stderr}`);

if (!(await song())) {
  const out = openSync(LOG, "a");
  const p = spawn("npx", ["next", "dev", "-p", "3476", "apps/web"], {
    cwd: GOC,
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...process.env, DATABASE_URL: DB, BETTER_AUTH_SECRET: "dev-d42-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC, JOB_SECRET: JOB },
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; i < 120 && !(await song()); i++) await ngu(2000);
  if (!(await song())) throw new Error("máy dev không lên");
}
console.log(JSON.stringify({ buoc: "may-dev", url: URL_GOC, pid: readFileSync(PID, "utf8").trim() }));

const h = { "content-type": "application/json", origin: URL_GOC };
export async function dangNhap(email) {
  const maCua = () => readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  let ma = null;
  for (let i = 0; i < 60 && !ma; i++) {
    await ngu(500);
    const ds = maCua();
    if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
  }
  if (!ma) throw new Error(`không thấy mã đăng nhập của ${email}`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  if (!ck.length) throw new Error(`đăng nhập ${email} hỏng: ${r.status}`);
  return ck.join("; ");
}
const goi = async (cookie, method, p, body) => {
  const r = await fetch(`${URL_GOC}${p}`, { method, headers: { ...h, cookie }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const t = await r.text();
  let b = null;
  try {
    b = JSON.parse(t);
  } catch {}
  if (!r.ok) throw new Error(`${method} ${p} → ${r.status} ${t.slice(0, 200)}`);
  return b;
};

const db = new pg.Client({ connectionString: DB });
await db.connect();
try {
  const san = (await db.query("select id from companies where name = '[Mẫu] Sàn thử'")).rows[0]?.id;
  if (!san) throw new Error("không có sàn mẫu");
  const mail = (t) => `${t}@mau.quy-hang.test`;
  const ck = {};
  for (const t of ["telesales", "dau-chu-1", "dau-chu-2", "truong-nhom"]) ck[t] = `${await dangNhap(mail(t))}; qh_san=${san}`;
  writeFileSync(path.join(CHAY, "phien.json"), JSON.stringify({ san, cookie: ck }));

  // Căn Đang bán: đầu chủ 1 ba căn (hai căn tắt «vừa xác nhận với chủ» → cần gọi lại), đầu chủ 2 hai căn đã xác nhận.
  const daCo = Number((await db.query("select count(*)::int n from listings where company_id = $1", [san])).rows[0].n);
  if (daCo === 0) {
    const bo = [
      ["dau-chu-1", "Toà A", "A-12.03", false],
      ["dau-chu-1", "Toà A", "A-15.07", false],
      ["dau-chu-1", "Toà A", "A-08.01", true],
      ["dau-chu-2", "Toà B", "B-07.12", true],
      ["dau-chu-2", "Toà B", "B-11.02", true],
    ];
    for (const [ai, toa, can, xacNhan] of bo) {
      let r = await goi(ck[ai], "POST", "/api/v1/listings", { buildingName: toa, unitNumber: can });
      const id = r.id;
      let v = r.version;
      await db.query(
        `insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by)
         select gen_random_uuid(), company_id, building_name, unit_number, 'shareable', 'image/jpeg', 1000, 10, 10, 'cho-thu-42'
         from listings where id = $1`,
        [id],
      );
      for (const [type, payload] of [
        ["price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }],
        ["details_changed", { legalStatus: "pink_book", occupantType: "vacant" }],
        ["status_changed", { to: "Active" }],
      ]) {
        r = await goi(ck[ai], "POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: v, confirmedWithOwner: xacNhan });
        v = r.version;
      }
    }
  }

  // Đầu chủ giữ căn: trưởng nhóm gán qua lối thật (hàng 17) — căn tạo mới chưa có người giữ. Toà A → đầu chủ 1, Toà B → 2.
  const uid = {};
  for (const t of ["dau-chu-1", "dau-chu-2"]) uid[t] = (await goi(ck[t], "GET", "/api/v1/me")).user?.id ?? (await goi(ck[t], "GET", "/api/v1/me")).id;
  for (const r of (await db.query("select id, building_name from listings where company_id = $1", [san])).rows) {
    const ai = r.building_name === "Toà A" ? "dau-chu-1" : "dau-chu-2";
    await goi(ck["truong-nhom"], "PUT", `/api/v1/listings/${r.id}/listing-agent`, { userId: uid[ai] });
  }

  // Ba lead mới mỗi lần chạy: chưa chia được (toà không ai phụ trách), sẽ quá hạn nhận (Toà A), sẽ quá hạn gọi (Toà B).
  const so = Number((await db.query("select count(*)::int n from leads where company_id = $1", [san])).rows[0].n);
  const lead = (toa, can, i) => ({ ownerPhone: `0900 000 0${String(40 + ((so + i) % 60)).padStart(2, "0")}`, buildingName: toa, ...(can && { unitNumber: can }), need: "sale", listPrice: 3_200_000_000, feeInclusion: "included", desiredListingTime: "now" });
  const l0 = await goi(ck.telesales, "POST", "/api/v1/leads", lead("Toà Z", null, 0));
  const l1 = await goi(ck.telesales, "POST", "/api/v1/leads", lead("Toà A", "A-20.01", 1));
  const l2 = await goi(ck.telesales, "POST", "/api/v1/leads", lead("Toà B", "B-20.02", 2));
  await fetch(`${URL_GOC}/api/v1/jobs/lead-tick`, { method: "POST", headers: { ...h, authorization: `Bearer ${JOB}` } });
  await goi(ck["dau-chu-2"], "POST", `/api/v1/leads/${l2.id}/accept`);
  await db.query("update leads set routed_at = routed_at - interval '45 minutes' where id = any($1)", [[l1.id, l2.id]]);
  const hang = await goi(ck["truong-nhom"], "GET", "/api/v1/team/lead-queue");
  console.log(JSON.stringify({ buoc: "du-lieu", san, lead: { chuaChia: l0.id, quaHanNhan: l1.id, quaHanGoi: l2.id }, hangDoi: hang.items.map((x) => x.kind) }));
} finally {
  await db.end();
}
