// Chỗ thử của Đổi đầu chủ hàng loạt (hàng 89) trên máy dãy H của đợt dau-khach-nhap (Postgres 5574 container
// quy-hang-db-dkn-H, dev 3494) — dùng cho eval ui-check E9, E9b. Khuôn lấy từ _acceptance/cai-dat-hop-nhat/thu/dung-h.mjs.
//   node _acceptance/doi-dau-chu-hang-loat/thu/dung-h.mjs        dựng Postgres + migrate + người mẫu + hàng mẫu + máy chủ dev
//   node _acceptance/doi-dau-chu-hang-loat/thu/dung-h.mjs --mau  dựng lại bộ mẫu của E9: 2 chủ nhà mẫu (3 + 2 căn đang bán của
//                                                               dau-chu-1), đầu chủ và người giữ về dau-chu-1; in JSON
//   node _acceptance/doi-dau-chu-hang-loat/thu/dung-h.mjs --doc  in JSON đầu chủ hiện tại của 5 căn và người giữ của 2 liên hệ
//   node _acceptance/doi-dau-chu-hang-loat/thu/dung-h.mjs --phien <email> --ua <UA>  đăng nhập MỚI một máy giả
//                                                                     → in JSON {url, cookie: [{name,value}], token}
//                                                         thêm --moi: xoá mọi phiên cũ của người ấy trước (máy đầu tiên)
//   node _acceptance/doi-dau-chu-hang-loat/thu/dung-h.mjs --tat                    tắt máy chủ dev lệnh này đã bật (chỉ kill PID đã ghi)
// Chỉ người mẫu …@mau.quy-hang.test; mỗi lần cấp phiên xoá bộ đếm xin mã của email ấy trên Postgres thử.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
// Nhật ký và PID nằm NGOÀI cây kho: máy chủ dev theo dõi cả cây, ghi trong cây làm nó dựng lại liên tục.
const CHAY = path.join(os.tmpdir(), "quy-hang-doi-dau-chu");
const LOG = path.join(CHAY, "web-h.log");
const PID = path.join(CHAY, "web-h.pid");
const CONG = 3494;
const DB_CONG = 5574;
const CONTAINER = "quy-hang-db-dkn-H";
const URL_GOC = `http://localhost:${CONG}`;
const DATABASE_URL = `postgres://postgres:quyhang@localhost:${DB_CONG}/postgres`;

const { values: a } = parseArgs({
  options: { tat: { type: "boolean" }, phien: { type: "string" }, ua: { type: "string" }, moi: { type: "boolean" }, "xoa-phien": { type: "string" }, mau: { type: "boolean" }, doc: { type: "boolean" } },
});
mkdirSync(CHAY, { recursive: true });
const env = { ...process.env, DATABASE_URL };
const chay = (cmd, args) => execFileSync(cmd, args, { cwd: GOC, env, stdio: ["ignore", "pipe", "inherit"] }).toString();
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

if (a.tat) {
  if (existsSync(PID)) {
    const pid = Number(readFileSync(PID, "utf8"));
    try {
      process.kill(pid);
      console.log(`đã tắt máy chủ dev PID ${pid}`);
    } catch {
      console.log(`PID ${pid} không còn chạy`);
    }
  }
  process.exit(0);
}

const MAU = path.join(CHAY, "mau.json");
const psql = (q) => chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-tAc", q]).trim();
const idCua = (email) => psql(`select id from identity."user" where email = '${email}'`);

if (a.mau) {
  // Năm căn đang bán của dau-chu-1 (lấy theo mã căn), hai liên hệ chủ nhà mới: X giữ 3 căn đầu, Y giữ 2 căn sau.
  const d1 = idCua("dau-chu-1@mau.quy-hang.test");
  const san = psql(`select company_id from company_members where user_id = '${d1}' limit 1`);
  const can = JSON.parse(psql(`select coalesce(json_agg(x order by x->>'ma'), '[]') from (select json_build_object('id', l.id, 'ma', l.unit_number) x
    from listings l where l.company_id = '${san}' and l.standard_status = 'Active' and l.unit_number is not null
      and (select a.user_id from listing_agent_assignments a where a.listing_id = l.id order by a.seq desc limit 1) = '${d1}'
    order by l.unit_number limit 5) t`));
  if (can.length < 5) throw new Error(`cần 5 căn đang bán của dau-chu-1, có ${can.length}`);
  const lh = [];
  for (const ten of ["[Mẫu] Chủ nhà X", "[Mẫu] Chủ nhà Y"]) {
    lh.push(psql(`insert into contacts (company_id, contact_types, owner_member_user_id, full_name, created_by) values ('${san}', '{Seller}', '${d1}', '${ten}', 'x') returning id`).split("\n")[0]);
  }
  can.forEach((c, i) => psql(`update listing_owners set contact_id = '${lh[i < 3 ? 0 : 1]}' where listing_id = '${c.id}'`));
  const out = { san, d1, d2: idCua("dau-chu-2@mau.quy-hang.test"), can, lienHe: lh };
  writeFileSync(MAU, JSON.stringify(out));
  console.log(JSON.stringify(out));
  process.exit(0);
}

if (a.doc) {
  const m = JSON.parse(readFileSync(MAU, "utf8"));
  const dauChu = m.can.map((c) => psql(`select user_id from listing_agent_assignments where listing_id = '${c.id}' order by seq desc limit 1`));
  const nguoiGiu = m.lienHe.map((k) => psql(`select coalesce(owner_member_user_id, '') from contacts where id = '${k}'`));
  const ten = (u) => (u === m.d1 ? "D1" : u === m.d2 ? "D2" : u || "trống");
  console.log(JSON.stringify({ dauChu: dauChu.map(ten), nguoiGiu: nguoiGiu.map(ten) }));
  process.exit(0);
}

if (a["xoa-phien"]) {
  // Cookie mang «token.chữ-ký» (có thể đã mã hoá URL); bảng giữ phần token.
  const token = decodeURIComponent(a["xoa-phien"]).split(".")[0];
  if (!/^[A-Za-z0-9_-]+$/.test(token)) throw new Error("token lạ");
  const n = chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-tAc", `delete from identity.session where token = '${token}' returning 1`]);
  console.log(JSON.stringify({ daXoa: n.trim().split("\n").filter((l) => l === "1").length }));
  process.exit(0);
}

if (a.phien) {
  const email = a.phien;
  if (!email.endsWith("@mau.quy-hang.test")) throw new Error("chỉ cấp phiên cho người mẫu (…@mau.quy-hang.test)");
  // Postgres thử của dãy: xoá bộ đếm xin mã của người mẫu này để kịch bản cần nhiều máy không vấp giới hạn 5 mã/15 phút.
  if (!/^[a-z0-9.-]+@mau\.quy-hang\.test$/.test(email)) throw new Error("email mẫu lạ");
  chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-tAc", `delete from identity.otp_requests where email = '${email}'`]);
  if (a.moi) chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-tAc", `delete from identity.session where "userId" = (select id from identity."user" where email = '${email}')`]);
  const h = { "content-type": "application/json", origin: URL_GOC, ...(a.ua ? { "user-agent": a.ua } : {}) };
  const maCua = () => (existsSync(LOG) ? readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `)) : []);
  const truoc = maCua().length;
  const xin = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  if (xin.status !== 200) throw new Error(`xin mã ${email}: ${xin.status}`);
  let ma = null;
  for (let i = 0; !ma && i < 40; i++) {
    await ngu(300);
    const ds = maCua();
    ma = ds.length > truoc ? (ds.at(-1)?.split(" ").at(-1) ?? null) : null;
  }
  if (!ma) throw new Error(`không thấy mã của ${email} trong ${LOG}`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  if (r.status !== 200) throw new Error(`đăng nhập ${email}: ${r.status}`);
  const cookie = r.headers.getSetCookie().map((c) => {
    const [nv] = c.split(";");
    const i = nv.indexOf("=");
    return { name: nv.slice(0, i), value: nv.slice(i + 1) };
  });
  console.log(JSON.stringify({ url: URL_GOC, cookie, token: cookie.find((c) => c.name.endsWith("session_token"))?.value ?? null }));
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
// Hàng mẫu có chủ nhà (bộ nạp của hàng 43, qua API) — chạy sau khi máy chủ dev lên, ở cuối.

// 2. Máy chủ dev (dùng lại máy đang chạy ở 3494 nếu có — khi đó mã đăng nhập nằm ở nhật ký của phiên đã bật nó).
async function song() {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).ok;
  } catch {
    return false;
  }
}
if (!(await song())) {
  const out = openSync(LOG, "a");
  const p = spawn("npx", ["next", "dev", "-p", String(CONG), "apps/web"], {
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
}
// 3. Hàng mẫu qua API (chạy lại không nạp trùng).
execFileSync("node", [path.join(GOC, "_acceptance/doi-dau-chu-hang-loat/thu/nap-hang.mjs")], { cwd: GOC, stdio: ["ignore", "ignore", "inherit"] });
// 4. Hâm nóng: lần dựng đầu của máy dev (Turbopack) có lúc làm trang tự tải lại liên tục (đo 04/11 ở hàng 43). Mở các
// đường lượt chấm dùng bằng phiên người mẫu cho máy dev dựng route, chạm giờ sửa một tệp vỏ để nó dựng lại một lần, chờ.
{
  const out = execFileSync("node", [fileURLToPath(import.meta.url), "--phien", "dau-chu-1@mau.quy-hang.test"], { cwd: GOC }).toString();
  const cookie = JSON.parse(out).cookie.map((c) => `${c.name}=${c.value}`).join("; ");
  const mo = () => Promise.all(["/today", "/inventory"].map((d) => fetch(`${URL_GOC}${d}`, { headers: { cookie } }).then((r) => r.text()).catch(() => "")));
  await mo();
  const tep = path.join(GOC, "apps/web/src/app/(app)/inventory/bang-hang.tsx");
  const nay = new Date();
  utimesSync(tep, nay, nay);
  await ngu(10000);
  await mo();
}
console.log(JSON.stringify({ url: URL_GOC, log: LOG, pid: existsSync(PID) ? Number(readFileSync(PID, "utf8")) : null }));
