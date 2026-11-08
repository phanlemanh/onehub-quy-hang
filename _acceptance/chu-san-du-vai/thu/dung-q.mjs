// Chỗ thử dãy Q cho hai bài nhìn màn (E3, E5b): Postgres dãy Q (5577) nạp sàn mẫu, máy dev tạm cổng 3497, phiên của quản trị
// sàn mẫu (người chỉ cấu hình) và người đầu tiên của một sàn mới mở bằng công cụ mở sàn thật. Khoá của máy dev là chuỗi thử.
//   node _acceptance/chu-san-du-vai/thu/dung-q.mjs          # dựng (chạy lại: dùng lại máy dev của cây này)
//   node _acceptance/chu-san-du-vai/thu/dung-q.mjs --tat    # tắt máy dev theo PID đã ghi (luật đợt 8: không pkill)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { moSan } from "../../../packages/db/scripts/mo-san.mjs";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/chu-san-du-vai");
// Nhật ký ngoài kho: Turbopack canh cả gốc kho, nhật ký trong kho tự nuôi vòng dựng lại (bài học hàng 48).
const NGOAI = path.join("/tmp", `quy-hang-q-du-vai-${path.basename(GOC)}`);
mkdirSync(NGOAI, { recursive: true });
mkdirSync(CHAY, { recursive: true });
const LOG = path.join(NGOAI, "web.log");
const PID = path.join(NGOAI, "web.pid");
const CONG = 3497;
const URL_GOC = `http://localhost:${CONG}`;
const DB = "postgres://postgres:quyhang@localhost:5577/postgres";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

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
for (const [lenh, args] of [["npm", ["run", "db:migrate"]], ["node", ["packages/db/seed/nap.mjs", "--nap"]]]) {
  const r = spawnSync(lenh, args, { cwd: GOC, env, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${lenh} ${args.join(" ")} hỏng: ${r.stderr}`);
}
if (!(await song())) {
  const out = openSync(LOG, "a");
  const p = spawn("npx", ["next", "dev", "-p", String(CONG), "apps/web"], {
    cwd: GOC,
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...env, BETTER_AUTH_SECRET: "dev-q-du-vai-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC, OWNER_PHONE_KEY: Buffer.alloc(32, 7).toString("base64") },
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; i < 120 && !(await song()); i++) await ngu(2000);
  if (!(await song())) throw new Error(`máy dev không lên — xem ${LOG}`);
} else {
  const nghe = spawnSync("lsof", [`-iTCP:${CONG}`, "-sTCP:LISTEN", "-P", "-t"], { encoding: "utf8" }).stdout.split("\n").filter(Boolean);
  const thuMuc = nghe.map((pid) => (spawnSync("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"], { encoding: "utf8" }).stdout.split("\n").find((l) => l.startsWith("n")) ?? "n?").slice(1));
  const la = thuMuc.filter((d) => d !== GOC && !d.startsWith(`${GOC}/`));
  if (la.length) throw new Error(`cổng ${CONG} đang có máy dev chạy từ ${la.join(", ")} — không phải cây ${GOC}`);
}

const h = { "content-type": "application/json", origin: URL_GOC };
async function dangNhap(email) {
  const maCua = () => (existsSync(LOG) ? readFileSync(LOG, "utf8") : "").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  const xin = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  if (!xin.ok) throw new Error(`xin mã ${email}: ${xin.status}`);
  let ma = null;
  for (let i = 0; i < 60 && !ma; i++) {
    await ngu(500);
    const ds = maCua();
    if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
  }
  if (!ma) throw new Error(`không thấy mã của ${email} — máy dev phải chạy từ dung-q.mjs (${LOG})`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  if (!ck.length) throw new Error(`đăng nhập ${email} hỏng: ${r.status}`);
  return ck.join("; ");
}

const NHAN = Date.now().toString(36);
const EMAIL_QT = "quan-tri@mau.quy-hang.test";
const EMAIL_MOI = `dau-tien-${NHAN}@example.test`;
const db = new pg.Client({ connectionString: DB });
await db.connect();
try {
  await db.query("delete from identity.otp_requests where email like '%@mau.quy-hang.test' or email like '%@example.test'").catch(() => {});
  const san = (await db.query(`select m.company_id id from company_members m join identity."user" u on u.id = m.user_id where u.email = $1 order by m.company_id limit 1`, [EMAIL_QT])).rows[0].id;
  await db.query("begin");
  const moi = await moSan(db, { ten: `[Thử] đủ vai ${NHAN}`, email: EMAIL_MOI });
  await db.query("commit");
  const cookie = { "quan-tri": `${await dangNhap(EMAIL_QT)}; qh_san=${san}`, "dau-tien": `${await dangNhap(EMAIL_MOI)}; qh_san=${moi.companyId}` };
  writeFileSync(path.join(CHAY, "phien.json"), JSON.stringify({ san, sanMoi: moi.companyId, emailMoi: EMAIL_MOI, cookie, url: URL_GOC, nhan: NHAN }));
  console.log(JSON.stringify({ san, sanMoi: moi.companyId, url: URL_GOC }));
} finally {
  await db.end();
}
