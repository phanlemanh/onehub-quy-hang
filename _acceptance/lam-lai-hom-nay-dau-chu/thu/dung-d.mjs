// Chỗ thử dãy D cho phép nhìn màn của hàng 92 (E1, E4, E5, E6, E9; khuôn từ hàng 51): Postgres dãy D (5575) nạp sàn mẫu, máy dev tạm cổng 3476,
// phiên đăng nhập của telesales, hai đầu chủ, đầu khách và một telesales mới chưa nhập lead nào (tạo ở đây, email miền
// mẫu). Lead do phép nhìn màn nhập qua màn thật. Dữ liệu nhãn mẫu, số 0900 000 0xx.
//   node _acceptance/lam-lai-hom-nay-dau-chu/thu/dung-d.mjs          # dựng (chạy lại: dùng lại máy dev)
//   node _acceptance/lam-lai-hom-nay-dau-chu/thu/dung-d.mjs --tat    # tắt máy dev (theo PID đã ghi; không pkill)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/lam-lai-hom-nay-dau-chu");
const LOG = path.join(CHAY, "web-d92.log");
const PID = path.join(CHAY, "web-d92.pid");
const URL_GOC = "http://localhost:3476";
const DB = "postgres://postgres:quyhang@localhost:5575/postgres";
const JOB = "dev-d92-job-khong-dung-o-ban-that";
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

const nap = spawnSync("node", ["packages/db/seed/nap.mjs", "--nap"], { cwd: GOC, env: { ...process.env, DATABASE_URL: DB }, encoding: "utf8" });
if (nap.status !== 0) throw new Error(`nạp sàn mẫu hỏng: ${nap.stderr}`);

// Next chỉ cho một máy dev mỗi thư mục: máy dev khác của chính worktree này (do lệnh nhìn màn hay lượt chấm bật) chặn máy
// 3476. Tắt đúng các tiến trình nghe cổng mà thư mục làm việc là apps/web của worktree này — không đụng worktree khác.
function tatMayDevCungThuMuc() {
  const nghe = spawnSync("lsof", ["-iTCP", "-sTCP:LISTEN", "-P", "-t"], { encoding: "utf8" }).stdout.split("\n").filter(Boolean);
  for (const pid of new Set(nghe)) {
    const cwd = spawnSync("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"], { encoding: "utf8" }).stdout.split("\n").find((l) => l.startsWith("n"));
    const cong = spawnSync("lsof", ["-a", "-p", pid, "-iTCP", "-sTCP:LISTEN", "-P", "-Fn"], { encoding: "utf8" }).stdout;
    if (cwd === `n${path.join(GOC, "apps/web")}` && !cong.includes(":3476")) {
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
  const p = spawn("npx", ["next", "dev", "-p", "3476", "apps/web"], {
    cwd: GOC,
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...process.env, DATABASE_URL: DB, BETTER_AUTH_SECRET: "dev-d92-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC, JOB_SECRET: JOB },
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; i < 120 && !(await song()); i++) await ngu(2000);
  if (!(await song())) throw new Error("máy dev không lên");
}

const h = { "content-type": "application/json", origin: URL_GOC };
async function dangNhap(email) {
  const maCua = () => (existsSync(LOG) ? readFileSync(LOG, "utf8") : "").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
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
  // Đầu chủ mới không có việc nào (E6, trống): tạo một lần, miền email mẫu để bộ xoá của sàn mẫu dọn được.
  const emailMoi = "dau-chu-moi-92@mau.quy-hang.test";
  await db.query(
    `insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, '[Mẫu] Đầu chủ mới', $1, true)
     on conflict (email) do nothing`,
    [emailMoi],
  );
  const idMoi = (await db.query('select id from identity."user" where email = $1', [emailMoi])).rows[0].id;
  await db.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{listing_agent}') on conflict do nothing", [san, idMoi]);
  await db.query("delete from leads where company_id = $1 and created_by = $2", [san, idMoi]);

  const mail = (t) => `${t}@mau.quy-hang.test`;
  const ck = {};
  for (const t of ["telesales", "dau-chu-1", "dau-chu-2", "dau-khach"]) ck[t] = `${await dangNhap(mail(t))}; qh_san=${san}`;
  ck["dau-chu-moi"] = `${await dangNhap(emailMoi)}; qh_san=${san}`;
  // Hàng đợi của đầu chủ 1 (Toà A): mỗi lần dựng ba lead mới qua lối API thật — một quá hạn nhận (lùi mốc giao 20 phút),
  // một còn dưới 15 phút (lùi 5 phút), một đã nhận (còn hạn gọi). Số mẫu 0900 000 0xx.
  const h2 = { ...h, cookie: ck.telesales };
  const so0 = Number((await db.query("select count(*)::int n from leads where company_id = $1", [san])).rows[0].n);
  const lead = async (i) => {
    const r = await fetch(`${URL_GOC}/api/v1/leads`, { method: "POST", headers: h2, body: JSON.stringify({ ownerPhone: `0900 000 0${String(10 + ((so0 + i) % 89)).padStart(2, "0")}`, buildingName: "Toà A", need: "sale", listPrice: 3_200_000_000, feeInclusion: "included", desiredListingTime: "now" }) });
    return (await r.json()).id;
  };
  const [lQua, lSap, lNhan] = [await lead(0), await lead(1), await lead(2)];
  await fetch(`${URL_GOC}/api/v1/jobs/lead-tick`, { method: "POST", headers: { ...h, authorization: `Bearer ${JOB}` } });
  await fetch(`${URL_GOC}/api/v1/leads/${lNhan}/accept`, { method: "POST", headers: { ...h, cookie: ck["dau-chu-1"] } });
  await db.query("update leads set routed_at = now() - interval '20 minutes' where id = $1", [lQua]);
  await db.query("update leads set routed_at = now() - interval '5 minutes' where id = $1", [lSap]);
  writeFileSync(path.join(CHAY, "lead.json"), JSON.stringify({ qua: lQua, sap: lSap, daNhan: lNhan }));
  writeFileSync(path.join(CHAY, "phien.json"), JSON.stringify({ san, job: JOB, cookie: ck }));
  console.log(JSON.stringify({ buoc: "cho-thu", url: URL_GOC, pid: readFileSync(PID, "utf8").trim(), san, phien: Object.keys(ck) }));
} finally {
  await db.end();
}
