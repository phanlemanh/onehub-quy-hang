// Chỗ thử dãy D cho phép nhìn màn hàng 48 (E1, E2a, E5b, E6a, E7b, E10b; khuôn từ hàng 105): Postgres dãy D (5575) nạp sàn
// mẫu, máy dev tạm cổng 3495 (luật đợt 7: cổng dev của dãy D), phiên của quản trị sàn mẫu, trưởng nhóm, đầu chủ 1. Dựng
// thêm: một căn Đang bán ở Toà A gán đầu chủ 1 (cột «Đầu chủ» của E10). Dữ liệu nhãn mẫu, email miền mau.quy-hang.test.
//   node _acceptance/luat-chia-lead/thu/dung-d.mjs          # dựng (chạy lại: dùng lại máy dev)
//   node _acceptance/luat-chia-lead/thu/dung-d.mjs --tat    # tắt máy dev (theo PID đã ghi; không pkill — luật đợt 8)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/luat-chia-lead");
const LOG = path.join(CHAY, "web-d48.log");
const PID = path.join(CHAY, "web-d48.pid");
const CONG = 3495;
const URL_GOC = `http://localhost:${CONG}`;
const DB = "postgres://postgres:quyhang@localhost:5575/postgres";
const MIEN = "mau.quy-hang.test";
const KHOA_PHIEN = "dev-d48-chuoi-thu-khong-dung-o-ban-that";
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

// Next chỉ cho một máy dev mỗi thư mục: tắt đúng tiến trình nghe cổng khác mà thư mục làm việc là apps/web của worktree này.
function tatMayDevCungThuMuc() {
  const nghe = spawnSync("lsof", ["-iTCP", "-sTCP:LISTEN", "-P", "-t"], { encoding: "utf8" }).stdout.split("\n").filter(Boolean);
  for (const pid of new Set(nghe)) {
    const cwd = spawnSync("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"], { encoding: "utf8" }).stdout.split("\n").find((l) => l.startsWith("n"));
    const cong = spawnSync("lsof", ["-a", "-p", pid, "-iTCP", "-sTCP:LISTEN", "-P", "-Fn"], { encoding: "utf8" }).stdout;
    if (cwd === `n${path.join(GOC, "apps/web")}` && !cong.includes(`:${CONG}`)) {
      try {
        process.kill(Number(pid), "SIGTERM");
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
    env: { ...env, BETTER_AUTH_SECRET: KHOA_PHIEN, BETTER_AUTH_URL: URL_GOC },
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; i < 120 && !(await song()); i++) await ngu(2000);
  if (!(await song())) throw new Error(`máy dev không lên — xem ${LOG}`);
}

const h = { "content-type": "application/json", origin: URL_GOC };
const PHIEN = path.join(CHAY, "phien.json");
const cu = existsSync(PHIEN) ? (JSON.parse(readFileSync(PHIEN, "utf8")).cookie ?? {}) : {};

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

const db = new pg.Client({ connectionString: DB });
await db.connect();
try {
  const san = (await db.query("select id from companies where name = '[Mẫu] Sàn thử'")).rows[0]?.id;
  if (!san) throw new Error("không có sàn mẫu");
  const idCua = async (email) => (await db.query('select id from identity."user" where email = $1', [email])).rows[0]?.id;
  const mail = (t) => `${t}@${MIEN}`;
  const ck = {};
  for (const t of ["quan-tri", "truong-nhom", "dau-chu-1"]) {
    const giu = cu[t]?.replace(/; qh_san=.*$/, "");
    ck[t] = `${await dangNhap(mail(t), giu)}; qh_san=${san}`;
  }
  const qt = await idCua(mail("quan-tri"));
  const dc1 = await idCua(mail("dau-chu-1"));
  const tn = await idCua(mail("truong-nhom"));
  // Một căn Đang bán ở Toà A gán đầu chủ 1 — cột «Đầu chủ» của Bảng hàng có tên để đối chiếu (E10).
  const can = (
    await db.query(
      `select l.id, l.unit_number ma from listings l where l.company_id = $1 and l.standard_status = 'Active' and l.unit_number is not null
        and l.building_name = 'Toà A' order by l.unit_number limit 1`,
      [san],
    )
  ).rows[0];
  if (!can) throw new Error("sàn mẫu dãy D cần một căn Đang bán ở Toà A");
  await db.query(
    `insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by)
     values ($1, $2, (select coalesce(max(seq), 0) + 1 from listing_agent_assignments where listing_id = $2), $3, $4)`,
    [san, can.id, dc1, tn],
  );
  const ten = Object.fromEntries((await db.query('select email, name from identity."user" where email like $1', [`%@${MIEN}`])).rows.map((r) => [r.email.split("@")[0], r.name]));
  writeFileSync(PHIEN, JSON.stringify({ san, cookie: ck, can, nguoi: { qt, dc1, tn }, ten }));
  console.log(JSON.stringify({ buoc: "cho-thu", url: URL_GOC, pid: readFileSync(PID, "utf8").trim(), san, can: can.ma }));
} finally {
  await db.end();
}
