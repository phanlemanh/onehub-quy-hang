// Chỗ chụp trang ba lối «Hồ sơ căn trên điện thoại» (hồ sơ ho-so-dien-thoai-product-detail-5) trên máy dãy H (Postgres
// 5574 container quy-hang-db-dkn-H, dev 3494). Rút gọn từ _acceptance/hom-nay-dau-chu-dien-thoai/thu/dung-h.mjs: trang
// ba lối dùng dữ liệu mẫu trong mã, chỉ cần người mẫu có Bảng hàng — không nạp hàng.
//   node _acceptance/ho-so-dien-thoai-product-detail-5/thu/dung-h.mjs          dựng Postgres + migrate + người mẫu + dev
//   node _acceptance/ho-so-dien-thoai-product-detail-5/thu/dung-h.mjs --phien <email>  đăng nhập → in JSON {cookie}
//   node _acceptance/ho-so-dien-thoai-product-detail-5/thu/dung-h.mjs --tat    tắt máy chủ dev lệnh này đã bật (kill PID đã ghi)
// Chỉ người mẫu …@mau.quy-hang.test; mỗi lần cấp phiên xoá bộ đếm xin mã của email ấy trên Postgres thử.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
// Nhật ký và PID nằm NGOÀI cây kho: máy chủ dev theo dõi cả cây.
const CHAY = path.join(os.tmpdir(), "quy-hang-ho-so-dt");
const LOG = path.join(CHAY, "web-h.log");
const PID = path.join(CHAY, "web-h.pid");
const CONG = 3494;
const DB_CONG = 5574;
const CONTAINER = "quy-hang-db-dkn-H";
const URL_GOC = `http://localhost:${CONG}`;
const DATABASE_URL = `postgres://postgres:quyhang@localhost:${DB_CONG}/postgres`;

const { values: a } = parseArgs({ options: { tat: { type: "boolean" }, phien: { type: "string" } } });
mkdirSync(CHAY, { recursive: true });
const env = { ...process.env, DATABASE_URL };
const chay = (cmd, args) => execFileSync(cmd, args, { cwd: GOC, env, stdio: ["ignore", "pipe", "inherit"] }).toString();
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

if (a.tat) {
  if (existsSync(PID)) {
    const pid = Number(readFileSync(PID, "utf8"));
    try {
      // Nhóm tiến trình của máy dev (bật detached) — chỉ PID lệnh này đã ghi.
      process.kill(-pid);
      console.log(`đã tắt máy chủ dev PID ${pid}`);
    } catch {
      try {
        process.kill(pid);
        console.log(`đã tắt máy chủ dev PID ${pid}`);
      } catch {
        console.log(`PID ${pid} không còn chạy`);
      }
    }
  }
  process.exit(0);
}

if (a.phien) {
  const email = a.phien;
  if (!/^[a-z0-9.-]+@mau\.quy-hang\.test$/.test(email)) throw new Error("chỉ cấp phiên cho người mẫu (…@mau.quy-hang.test)");
  chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-tAc", `delete from identity.otp_requests where email = '${email}'`]);
  const h = { "content-type": "application/json", origin: URL_GOC };
  const nhatKy = () => [LOG, ...readdirSync(os.tmpdir()).filter((d) => d.startsWith("quy-hang-")).map((d) => path.join(os.tmpdir(), d, "web-h.log"))];
  const maCua = () =>
    [...new Set(nhatKy())].filter((f) => existsSync(f)).flatMap((f) => readFileSync(f, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `)).map((l) => `${f}\u0000${l}`));
  const truoc = new Set(maCua());
  const xin = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  if (xin.status !== 200) throw new Error(`xin mã ${email}: ${xin.status}`);
  let ma = null;
  for (let i = 0; !ma && i < 40; i++) {
    await ngu(300);
    const moi = maCua().filter((x) => !truoc.has(x));
    ma = moi.length ? (moi.at(-1).split("\u0000")[1].trim().split(" ").at(-1) ?? null) : null;
  }
  if (!ma) throw new Error(`không thấy mã của ${email} trong ${LOG}`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  if (r.status !== 200) throw new Error(`đăng nhập ${email}: ${r.status}`);
  const cookie = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  const me = await (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: cookie.join("; ") } })).json();
  const san = me.companies?.find((c) => c.name === "[Mẫu] Sàn thử")?.id ?? me.companies?.[0]?.id;
  console.log(JSON.stringify({ cookie: san ? [...cookie, `qh_san=${san}`] : cookie }));
  process.exit(0);
}

// 1. Postgres của dãy.
const coContainer = chay("docker", ["ps", "-a", "--format", "{{.Names}} {{.State}}"]).split("\n").find((l) => l.startsWith(`${CONTAINER} `));
if (!coContainer) chay("docker", ["run", "--rm", "-d", "--name", CONTAINER, "-e", "POSTGRES_PASSWORD=quyhang", "-p", `${DB_CONG}:5432`, "postgres:16"]);
else if (!coContainer.endsWith("running")) chay("docker", ["start", CONTAINER]);
for (let i = 0; ; i++) {
  try {
    chay("docker", ["exec", CONTAINER, "pg_isready", "-U", "postgres"]);
    break;
  } catch {
    if (i > 60) throw new Error("Postgres dãy H không lên");
    await ngu(1000);
  }
}
chay("npm", ["run", "db:migrate"]);
chay("node", ["packages/db/seed/nap.mjs", "--nap"]);

// 2. Máy chủ dev (webpack — xem lý do ở dung-h.mjs của hàng 39).
async function song() {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).ok;
  } catch {
    return false;
  }
}
if (await song()) throw new Error(`cổng ${CONG} đã có máy dev — không dùng máy của worktree khác; tắt nó bằng --tat của chỗ thử đã bật`);
const out = openSync(LOG, "a");
const p = spawn("npx", ["next", "dev", "--webpack", "-p", String(CONG), "apps/web"], {
  cwd: GOC,
  env: { ...env, BETTER_AUTH_SECRET: "dev-h-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC },
  detached: true,
  stdio: ["ignore", out, out],
});
p.unref();
writeFileSync(PID, String(p.pid));
for (let i = 0; !(await song()); i++) {
  if (i > 180) throw new Error(`máy chủ dev không lên — xem ${LOG}`);
  await ngu(1000);
}
console.log(JSON.stringify({ url: URL_GOC, log: LOG, pid: p.pid }));
