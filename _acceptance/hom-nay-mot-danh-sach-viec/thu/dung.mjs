// Chỗ thử cho các bài nhìn màn của hom-nay-mot-danh-sach-viec: Postgres riêng cổng 5599 nạp sàn mẫu, máy dev cổng 3462, và đủ
// tám loại việc. Dữ liệu nhãn mẫu, số 0900 000 0xx. Ghi phiên đăng nhập từng vai vào .acceptance-runs/<slug>/phien.json.
//   node _acceptance/hom-nay-mot-danh-sach-viec/thu/dung.mjs         # dựng
//   node _acceptance/hom-nay-mot-danh-sach-viec/thu/dung.mjs --tat   # tắt máy dev và Postgres thử
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import pg from "pg";

const SLUG = "hom-nay-mot-danh-sach-viec";
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs", SLUG);
const LOG = path.join(CHAY, "web-3462.log");
const PID = path.join(CHAY, "web-3462.pid");
const URL_GOC = "http://localhost:3462";
const DB = "postgres://postgres:quyhang@localhost:5599/postgres";
const JOB = "dev-viec-job-khong-dung-o-ban-that";
const TEN_DB = "quy-hang-db-hom-nay-viec";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(CHAY, { recursive: true });

if (process.argv.includes("--tat")) {
  if (existsSync(PID)) {
    try {
      process.kill(-Number(readFileSync(PID, "utf8")), "SIGTERM");
    } catch {
      // máy dev đã tắt
    }
  }
  spawnSync("docker", ["stop", TEN_DB]);
  process.exit(0);
}

const chay = (lenh, doi, env = {}) => {
  const r = spawnSync(lenh, doi, { cwd: GOC, env: { ...process.env, ...env }, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${lenh} ${doi.join(" ")}: ${r.stderr.slice(-400)}`);
  return r.stdout;
};

if (!chay("docker", ["ps", "--format", "{{.Names}}"]).includes(TEN_DB)) {
  chay("docker", ["run", "--rm", "-d", "--name", TEN_DB, "-e", "POSTGRES_PASSWORD=quyhang", "-p", "5599:5432", "postgres:16"]);
  for (let i = 0; i < 40; i++) {
    if (spawnSync("docker", ["exec", TEN_DB, "pg_isready", "-U", "postgres"]).status === 0) break;
    await ngu(1000);
  }
  await ngu(1500);
  chay("npm", ["run", "-s", "db:migrate"], { DATABASE_URL: DB });
  chay("node", ["--import", "tsx", "packages/db/seed/nap-ban-that.ts", "--nap", "--email", "chu-kho-thu@vi-du.test"], { DATABASE_URL: DB, OWNER_PHONE_KEY: randomBytes(32).toString("base64") });
}

const song = async () => {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).status === 200;
  } catch {
    return false;
  }
};
if (!(await song())) {
  rmSync(path.join(GOC, "apps/web/.next/dev"), { recursive: true, force: true });
  const out = openSync(LOG, "a");
  const p = spawn("npm", ["run", "dev", "-w", "@quy-hang/web", "--", "-p", "3462"], {
    cwd: GOC,
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...process.env, DATABASE_URL: DB, BETTER_AUTH_SECRET: "dev-viec-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC, JOB_SECRET: JOB },
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; i < 120 && !(await song()); i++) await ngu(2000);
  if (!(await song())) throw new Error("máy dev không lên");
}

const h = { "content-type": "application/json", origin: URL_GOC };
async function dangNhap(email) {
  const maCua = () => readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  let ma = null;
  for (let i = 0; i < 60 && !ma; i++) {
    await ngu(500);
    const ds = maCua();
    if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
  }
  if (!ma) throw new Error(`không thấy mã của ${email}`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  if (!ck.length) throw new Error(`đăng nhập ${email} hỏng: ${r.status}`);
  return ck.join("; ");
}
const goi = async (cookie, method, p, body) => {
  const r = await fetch(`${URL_GOC}${p}`, { method, headers: { ...h, ...(cookie ? { cookie } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${p} → ${r.status} ${t.slice(0, 240)}`);
  return t ? JSON.parse(t) : null;
};

const db = new pg.Client({ connectionString: DB });
await db.connect();
try {
  const san = (await db.query("select id from companies where name = '[Mẫu] Sàn thử'")).rows[0].id;
  const MAIL = { "du-vai": "dau-chu-1@mau.quy-hang.test", "dau-chu": "dau-chu-2@mau.quy-hang.test", "truong-nhom": "truong-nhom@mau.quy-hang.test", telesales: "telesales@mau.quy-hang.test", "dau-khach": "dau-khach@mau.quy-hang.test", "quan-tri": "quan-tri@mau.quy-hang.test" };
  await db.query(`update company_members m set roles = '{company_admin,team_lead,listing_agent,buyer_agent,telesales}' from identity."user" u where u.id = m.user_id and u.email = $1`, [MAIL["du-vai"]]);
  const ck = {};
  for (const [k, m] of Object.entries(MAIL)) ck[k] = `${await dangNhap(m)}; qh_san=${san}`;
  writeFileSync(path.join(CHAY, "phien.json"), JSON.stringify({ san, url: URL_GOC, cookie: ck }));

  const so = Number((await db.query("select count(*)::int n from leads where company_id = $1", [san])).rows[0].n);
  const lead = (toa, can, i) => ({ ownerPhone: `0900 000 0${String(30 + ((so + i) % 60)).padStart(2, "0")}`, buildingName: toa, ...(can && { unitNumber: can }), need: "sale", listPrice: 3_100_000_000, feeInclusion: "excluded", desiredListingTime: "now" });
  // Lead chưa chia được: toà không ai phụ trách.
  const chuaChia = await goi(ck.telesales, "POST", "/api/v1/leads", lead("Toà Z", null, 0)).catch((e) => ({ loi: String(e) }));
  await fetch(`${URL_GOC}/api/v1/jobs/lead-tick`, { method: "POST", headers: { ...h, authorization: `Bearer ${JOB}` } });
  await db.query("update leads set routed_at = routed_at - interval '45 minutes' where id in (select id from leads where company_id = $1 and routing_strategy is not null and matched_agent_user_id is not null and accepted_at is null order by id limit 3)", [san]);
  // Lead bị trả lại: đầu chủ nhận lead rồi trả.
  const uid1 = (await db.query(`select id from identity."user" where email = $1`, [MAIL["du-vai"]])).rows[0].id;
  const motLead = (await db.query("select id from leads where company_id = $1 and matched_agent_user_id = $2 and returned_at is null order by id desc limit 1", [san, uid1])).rows[0]?.id;
  if (motLead) await goi(ck["du-vai"], "POST", `/api/v1/leads/${motLead}/return`).catch(() => {});

  // Người đủ vai cũng có một lead bị trả lại: tự nhập lead, người được chia trả lại.
  const leadTra = await goi(ck["du-vai"], "POST", "/api/v1/leads", lead("Toà B", null, 5));
  await fetch(`${URL_GOC}/api/v1/jobs/lead-tick`, { method: "POST", headers: { ...h, authorization: `Bearer ${JOB}` } });
  const nhanLead = (await db.query(`select u.email from leads l join identity."user" u on u.id = l.matched_agent_user_id where l.id = $1`, [leadTra.id])).rows[0]?.email;
  const vaiNhan = Object.keys(MAIL).find((k) => MAIL[k] === nhanLead);
  if (vaiNhan) await goi(ck[vaiNhan], "POST", `/api/v1/leads/${leadTra.id}/return`);

  // Danh mục cho hai căn cùng toà, cùng số phòng ngủ: điều kiện để máy nhận ra căn mới khớp. Danh mục do Invest đẩy, không có đường ghi API.
  const KHU = "khu-mau-viec";
  let ag = (await db.query("select id from agreements where company_id = $1 and kind = 'catalog_source' limit 1", [san])).rows[0]?.id;
  if (!ag) {
    ag = (await db.query("insert into agreements (company_id, kind, direction, counterparty, counterparty_company_id, data_classes, valid_from, approved_by) values ($1, 'catalog_source', 'inbound', 'onehub-invest', null, '{catalog}', now(), '[Tên]') returning id", [san])).rows[0].id;
    await db.query("insert into catalog_subdivisions (subdivision_key, subdivision_name, provider, measured_at, agreement_id) values ($1, '[Khu thử]', 'thu', now(), $2)", [KHU, ag]);
  }
  for (const ma of ["A-06.03", "A-08.03"])
    await db.query("insert into catalog_units (upi, subdivision_key, building_key, building_name, unit_number, bedrooms_total, property_type, property_sub_type, provider, measured_at, agreement_id) values ($1, $2, 'toa-a', 'Toà A', $3, 2, 'Residential', 'Condominium', 'thu', now(), $4) on conflict do nothing", [`UPI-mau-${ma}`, KHU, ma, ag]);
  const can = async (ma) => (await db.query("select id, version, list_price::bigint as gia, standard_status as tt from listings where company_id = $1 and building_name = 'Toà A' and unit_number = $2", [san, ma])).rows[0];
  const doiTrangThai = async (ma, to) => {
    const c = await can(ma);
    return goi(ck["du-vai"], "POST", `/api/v1/listings/${c.id}/events`, { type: "status_changed", payload: { to }, expectedVersion: c.version });
  };
  // Căn sẽ «mới lên»: tạm ngừng trước khi gửi link, lên Đang bán lại sau khi gửi.
  if ((await can("A-08.03")).tt === "Active") await doiTrangThai("A-08.03", "Hold");

  // Tin của khách, cho đầu khách và người đủ vai: gửi link hai căn, khách mở và quan tâm, một căn đổi giá, một căn mới khớp.
  const canGui = [(await can("A-06.03")).id, (await can("A-10.05")).id];
  let thu = 0;
  for (const vai of ["dau-khach", "du-vai"]) {
    const khach = await goi(ck[vai], "POST", "/api/v1/prospects", { displayName: `[Mẫu] Khách ${vai}`, phone: `0900 000 0${String(70 + ((so + thu++) % 20))}`, need: "purchase", criteria: {} });
    const lan = await goi(ck[vai], "POST", "/api/v1/shares", { audience: "client", prospectId: khach.id, listingIds: canGui });
    await goi(null, "POST", `/api/v1/public/shares/${lan.code}/events`, { type: "link_opened", visitor: `v-mau-khach-${vai}` });
    await goi(null, "POST", `/api/v1/public/shares/${lan.code}/events`, { type: "interest", visitor: `v-mau-khach-${vai}`, listingId: canGui[0] });
  }
  const doi = await can("A-10.05");
  await goi(ck["du-vai"], "POST", `/api/v1/listings/${doi.id}/events`, { type: "price_changed", payload: { listPrice: Number(doi.gia) - 100_000_000, feeInclusion: "included" }, expectedVersion: doi.version });
  await doiTrangThai("A-08.03", "Active");

  const dem = {
    hangDoi: (await goi(ck["truong-nhom"], "GET", "/api/v1/team/lead-queue")).items.map((x) => x.kind),
    leadCuaToi: (await goi(ck.telesales, "GET", "/api/v1/leads")).map((x) => x.stage),
    tin: (await goi(ck["dau-khach"], "GET", "/api/v1/today/buyer")).items.map((x) => x.kind),
    duVai: {
      tin: (await goi(ck["du-vai"], "GET", "/api/v1/today/buyer")).items.map((x) => x.kind),
      traLai: (await goi(ck["du-vai"], "GET", "/api/v1/leads")).filter((x) => x.stage === "returned").length,
    },
  };
  console.log(JSON.stringify({ url: URL_GOC, phien: path.relative(GOC, path.join(CHAY, "phien.json")), chuaChia: chuaChia?.id ?? chuaChia, ...dem }));
} finally {
  await db.end();
}
