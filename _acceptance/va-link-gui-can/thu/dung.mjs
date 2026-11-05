// Dựng chỗ thử của hồ sơ va-link-gui-can: Postgres riêng (cổng 5581, container quy-hang-db-va-link) và máy chủ dev cổng
// 3460, sàn và người mẫu của packages/db/seed — KHÔNG nạp hàng, không Lần gửi nào, nên Đầu khách mẫu thấy đúng trạng thái
// trống của «Đã gửi» và của dòng tin Hôm nay, nơi hai nút «Gửi căn» sống. Chỗ thử riêng để không tranh dãy của đợt.
//   node _acceptance/va-link-gui-can/thu/dung.mjs                 dựng, in URL
//   node _acceptance/va-link-gui-can/thu/dung.mjs --phien <email>  in JSON cookie phiên của một người mẫu
//   node _acceptance/va-link-gui-can/thu/dung.mjs --tat            tắt máy chủ dev nó đã bật (chỉ kill PID đã ghi)
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/va-link-gui-can");
const PID = path.join(CHAY, "web.pid");
// Nhật ký máy dev nằm NGOÀI cây kho: máy dev theo dõi cả gốc kho, ghi vào tệp trong kho làm nó biên dịch lại liên tục.
const LOG = path.join(tmpdir(), "quy-hang-va-link-gui-can", "web.log");
const CONG = 3460;
const URL_GOC = `http://localhost:${CONG}`;
const DB_CONG = 5581;
const CONTAINER = "quy-hang-db-va-link";
const DATABASE_URL = `postgres://postgres:quyhang@localhost:${DB_CONG}/postgres`;

const { values: a } = parseArgs({ options: { tat: { type: "boolean" }, phien: { type: "string" } } });
mkdirSync(CHAY, { recursive: true });
mkdirSync(path.dirname(LOG), { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const env = { ...process.env, DATABASE_URL };
const chay = (cmd, args) => execFileSync(cmd, args, { cwd: GOC, env, stdio: ["ignore", "pipe", "inherit"] }).toString();

if (a.tat) {
  if (existsSync(PID)) {
    const pid = Number(readFileSync(PID, "utf8"));
    try {
      process.kill(-pid);
      console.log(`đã tắt máy chủ dev PID ${pid}`);
    } catch {
      console.log(`PID ${pid} không còn chạy`);
    }
  }
  process.exit(0);
}

async function song() {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).ok;
  } catch {
    return false;
  }
}

/** Cookie «tên=giá trị» của một người mẫu, đăng nhập bằng mã một lần đọc ở nhật ký máy dev. */
async function cookieCua(email) {
  if (!email.endsWith("@mau.quy-hang.test")) throw new Error("chỉ cấp phiên cho người mẫu (…@mau.quy-hang.test)");
  const giu = path.join(CHAY, `phien-${email}.json`);
  if (existsSync(giu)) {
    const c = JSON.parse(readFileSync(giu, "utf8"));
    if ((await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: c.join("; ") } })).status === 200) return c;
  }
  const h = { "content-type": "application/json", origin: URL_GOC };
  const maCua = () => readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  let ma = null;
  for (let i = 0; !ma && i < 40; i++) {
    await ngu(300);
    const ds = maCua();
    ma = ds.length > truoc ? (ds.at(-1)?.split(" ").at(-1) ?? null) : null;
  }
  if (!ma) throw new Error(`không thấy mã của ${email} trong ${LOG}`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  if (r.status !== 200) throw new Error(`đăng nhập ${email}: ${r.status}`);
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  writeFileSync(giu, JSON.stringify(ck));
  return ck;
}

if (a.phien) {
  const ck = await cookieCua(a.phien);
  const lay = (ten) => ck.find((c) => c.startsWith(`${ten}=`))?.slice(ten.length + 1) ?? null;
  console.log(JSON.stringify({ url: URL_GOC, "qh.session_token": lay("qh.session_token"), qh_san: lay("qh_san") }));
  process.exit(0);
}

// 1. Postgres riêng.
const co = chay("docker", ["ps", "-a", "--format", "{{.Names}} {{.State}}"]).split("\n").find((l) => l.startsWith(`${CONTAINER} `));
if (!co) chay("docker", ["run", "--rm", "-d", "--name", CONTAINER, "-e", "POSTGRES_PASSWORD=quyhang", "-p", `${DB_CONG}:5432`, "postgres:16"]);
else if (!co.endsWith("running")) chay("docker", ["start", CONTAINER]);
for (let i = 0; ; i++) {
  try {
    chay("docker", ["exec", CONTAINER, "pg_isready", "-U", "postgres"]);
    break;
  } catch {
    if (i > 60) throw new Error("Postgres của chỗ thử không lên");
    await ngu(1000);
  }
}
chay("npm", ["run", "db:migrate"]);
chay("node", ["packages/db/seed/nap.mjs", "--nap"]);

// 2. Máy chủ dev.
if (!(await song())) {
  const out = openSync(LOG, "a");
  const p = spawn("npx", ["next", "dev", "-p", String(CONG), "apps/web"], {
    cwd: GOC,
    env: { ...env, BETTER_AUTH_SECRET: "dev-va-link-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC },
    detached: true,
    stdio: ["ignore", out, out],
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; !(await song()); i++) {
    if (i > 180) throw new Error(`máy chủ dev không lên — xem ${LOG}`);
    await ngu(1000);
  }
}
console.log(`chỗ thử sẵn sàng: ${URL_GOC} · Postgres ${DB_CONG} · nhật ký ${LOG}`);
