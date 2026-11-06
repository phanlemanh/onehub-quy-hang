// Chỗ thử dãy Q cho phép nhìn màn hàng 49 «Thuế phí» (E1, E2a, E3b, E7c, E8b; chuyển thể từ
// _acceptance/luat-chia-lead/thu/dung-d.mjs của hàng 48): Postgres dãy Q (5577) nạp sàn mẫu, máy dev tạm cổng 3497, phiên
// của quản trị sàn mẫu, trưởng nhóm, đầu chủ 1 (và telesales mẫu chỉ để nhập lead). Dựng thêm, cả hai do đầu chủ 1 giữ:
// căn A-49.01 giá 3 tỷ bao phí (ghi khi sàn ở định nghĩa mặc định — dấu 200·50·100) và căn A-49.02 giá không bao phí;
// một lead mẫu ở Toà A giao cho đầu chủ 1, đã nhận — mở được /units/call?lead=<id>. Dữ liệu nhãn mẫu, email miền
// mau.quy-hang.test, số chủ dạng 0900 000 0xx.
//   node _acceptance/thue-phi/thu/dung-q.mjs          # dựng (chạy lại: dùng lại máy dev, căn và lead đã dựng)
//   node _acceptance/thue-phi/thu/dung-q.mjs --tat    # tắt máy dev (theo PID đã ghi; không pkill, không killall)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/thue-phi");
// Nhật ký và PID của máy dev nằm NGOÀI kho: Turbopack canh cả gốc kho, nên nhật ký trong kho tự nuôi vòng
// «Compiled → trang tải lại → thêm dòng nhật ký → Compiled» (hàng 48, S4 vòng 1). Đường cố định theo tên worktree để mọi
// tác tử chấm (TMPDIR mỗi phiên khác nhau) cùng tìm thấy máy dev đã dựng.
const NGOAI = path.join("/tmp", `quy-hang-q49-${path.basename(GOC)}`);
mkdirSync(NGOAI, { recursive: true });
const LOG = path.join(NGOAI, "web-q49.log");
const PID = path.join(NGOAI, "web-q49.pid");
const CONG = 3497;
const URL_GOC = `http://localhost:${CONG}`;
const DB = "postgres://postgres:quyhang@localhost:5577/postgres";
const MIEN = "mau.quy-hang.test";
const KHOA_PHIEN = "dev-q49-chuoi-thu-khong-dung-o-ban-that";
const TOA = "Toà A";
const CAN_BAO_PHI = "A-49.01";
const CAN_KHONG_BAO_PHI = "A-49.02";
const CAN_LEAD = "A-49.09";
const SO_LEAD = "0900 000 097";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(CHAY, { recursive: true });

if (process.argv.includes("--tat")) {
  if (existsSync(PID)) {
    const pid = Number(readFileSync(PID, "utf8"));
    try {
      // Máy dev chạy detached: PID đã ghi là trưởng nhóm tiến trình của chính nó.
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
} else {
  // Máy dev đã nghe 3497 thì chỉ dùng lại khi nó chạy từ CHÍNH cây này — lượt chấm không được đo mã của bản checkout khác.
  const nghe = spawnSync("lsof", ["-iTCP:" + CONG, "-sTCP:LISTEN", "-P", "-t"], { encoding: "utf8" }).stdout.split("\n").filter(Boolean);
  const thuMuc = nghe.map((pid) => (spawnSync("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"], { encoding: "utf8" }).stdout.split("\n").find((l) => l.startsWith("n")) ?? "n?").slice(1));
  const la = thuMuc.filter((d) => d !== GOC && !d.startsWith(`${GOC}/`));
  if (la.length) throw new Error(`cổng ${CONG} đang có máy dev chạy từ ${la.join(", ")} — không phải cây ${GOC}; tắt máy ấy rồi chạy lại`);
}

const h = { "content-type": "application/json", origin: URL_GOC };
const PHIEN = path.join(CHAY, "phien.json");
const cuBan = existsSync(PHIEN) ? JSON.parse(readFileSync(PHIEN, "utf8")) : {};
const cu = cuBan.cookie ?? {};

/** Phiên của một người mẫu: dùng lại phiên còn sống (mỗi email chỉ xin được 5 mã trong 15 phút — ADR-0005). */
async function dangNhap(email, giu) {
  if (giu && (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: giu } })).status === 200) return giu;
  const maCua = () => (existsSync(LOG) ? readFileSync(LOG, "utf8") : "").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  const xin = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  if (xin.status === 429) throw new Error(`xin mã ${email}: 429 — xoá identity.otp_requests của email miền ${MIEN} trên Postgres dãy Q rồi chạy lại`);
  let ma = null;
  for (let i = 0; i < 60 && !ma; i++) {
    await ngu(500);
    const ds = maCua();
    if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
  }
  if (!ma) throw new Error(`không thấy mã đăng nhập của ${email} — máy dev phải chạy từ dung-q.mjs (log ${LOG})`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  if (!ck.length) throw new Error(`đăng nhập ${email} hỏng: ${r.status}`);
  return ck.join("; ");
}

async function goi(cookie, method, duong, body) {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { ...h, cookie }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const than = await r.json().catch(() => null);
  return { status: r.status, than };
}
async function phai(p, ma, viec) {
  const r = await p;
  if (r.status !== ma) throw new Error(`${viec}: ${r.status} — ${JSON.stringify(r.than)}`);
  return r.than;
}

const db = new pg.Client({ connectionString: DB });
await db.connect();
try {
  const san = (await db.query("select id from companies where name = '[Mẫu] Sàn thử'")).rows[0]?.id;
  if (!san) throw new Error("không có sàn mẫu");
  const idCua = async (email) => (await db.query('select id from identity."user" where email = $1', [email])).rows[0]?.id;
  const mail = (t) => `${t}@${MIEN}`;
  const ck = {};
  for (const t of ["quan-tri", "truong-nhom", "dau-chu-1", "telesales"]) {
    const giu = cu[t]?.replace(/; qh_san=.*$/, "");
    ck[t] = `${await dangNhap(mail(t), giu)}; qh_san=${san}`;
  }
  const qt = await idCua(mail("quan-tri"));
  const dc1 = await idCua(mail("dau-chu-1"));
  const tn = await idCua(mail("truong-nhom"));

  /** Ghi một lệnh lên hồ sơ theo phiên bản hiện tại của máy chủ. */
  const lenh = async (id, body) => {
    const v = (await db.query("select version from listings where id = $1", [id])).rows[0].version;
    return phai(goi(ck["dau-chu-1"], "POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }), 200, `lệnh ${body.type} lên ${id}`);
  };
  /** Căn của đầu chủ 1 ở Toà A: dùng lại khi đã có, chưa có thì tạo qua đường ghi thật và ghi giá. */
  async function canMau(ma, listPrice, feeInclusion) {
    const co = (await db.query("select id, list_price, fee_inclusion from listings where company_id = $1 and building_name = $2 and unit_number = $3 and not voided order by id limit 1", [san, TOA, ma])).rows[0];
    let id = co?.id;
    if (!id) id = (await phai(goi(ck["dau-chu-1"], "POST", "/api/v1/listings", { buildingName: TOA, unitNumber: ma }), 201, `tạo căn ${ma}`)).id;
    if (!co || Number(co.list_price) !== listPrice || co.fee_inclusion !== feeInclusion) await lenh(id, { type: "price_changed", payload: { listPrice, feeInclusion } });
    // Tạo căn không tự gán người giữ: gán đầu chủ 1 làm đầu chủ giữ căn (trưởng nhóm gán, như hàng 48 dựng cột «Đầu chủ»).
    const giu = (await db.query("select user_id from listing_agent_assignments where listing_id = $1 order by seq desc limit 1", [id])).rows[0]?.user_id;
    if (giu !== dc1)
      await db.query(
        `insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by)
         values ($1, $2, (select coalesce(max(seq), 0) + 1 from listing_agent_assignments where listing_id = $2), $3, $4)`,
        [san, id, dc1, tn],
      );
    return id;
  }
  // Giá bao phí của căn mẫu phải đóng dấu định nghĩa MẶC ĐỊNH (200·50·100): chỉ đưa sàn về mặc định khi căn chưa có giá
  // ấy — lần dựng sau dùng lại căn và dấu cũ (giá không ghi lại nên dấu không đổi).
  const daCoGia = (await db.query("select 1 from listings where company_id = $1 and building_name = $2 and unit_number = $3 and list_price = 3000000000 and fee_inclusion = 'included'", [san, TOA, CAN_BAO_PHI])).rowCount;
  if (!daCoGia) await db.query("delete from company_settings where company_id = $1 and key like 'fee.%'", [san]);
  const canBp = await canMau(CAN_BAO_PHI, 3_000_000_000, "included");
  const canKbp = await canMau(CAN_KHONG_BAO_PHI, 2_500_000_000, "excluded");
  const dau = (await db.query("select included_items, rates, computed_at from listing_price_fee_basis where listing_id = $1 order by seq desc limit 1", [canBp])).rows[0] ?? null;

  // Lead mẫu ở Toà A giao cho đầu chủ 1, đã nhận: dùng lại khi đầu chủ 1 còn đọc được, chưa có thì nhập mới.
  let lead = (await db.query("select id from leads where company_id = $1 and building_name = $2 and unit_number = $3 order by created_at desc limit 1", [san, TOA, CAN_LEAD])).rows[0]?.id;
  if (!lead || (await goi(ck["dau-chu-1"], "GET", `/api/v1/leads/assigned/${lead}`)).status !== 200) {
    const r = await phai(
      goi(ck.telesales, "POST", "/api/v1/leads", { ownerPhone: SO_LEAD, buildingName: TOA, unitNumber: CAN_LEAD, need: "sale", listPrice: 3_200_000_000, feeInclusion: "included", desiredListingTime: "now" }),
      201,
      "nhập lead mẫu",
    );
    lead = r.id;
    const nac = (await db.query("select matched_agent_user_id, accepted_at from leads where id = $1", [lead])).rows[0];
    if (nac.matched_agent_user_id !== dc1) await phai(goi(ck["truong-nhom"], "POST", `/api/v1/leads/${lead}/assign`, { agentUserId: dc1 }), 200, "giao lead cho đầu chủ 1");
    if (!(await db.query("select accepted_at from leads where id = $1", [lead])).rows[0].accepted_at)
      await phai(goi(ck["dau-chu-1"], "POST", `/api/v1/leads/${lead}/accept`), 200, "đầu chủ 1 nhận lead");
    await phai(goi(ck["dau-chu-1"], "GET", `/api/v1/leads/assigned/${lead}`), 200, "đầu chủ 1 đọc lead mẫu");
  }

  const ten = Object.fromEntries((await db.query('select email, name from identity."user" where email like $1', [`%@${MIEN}`])).rows.map((r) => [r.email.split("@")[0], r.name]));
  // Làm nóng các trang của ca chấm bằng yêu cầu thường, TRƯỚC khi trình duyệt nào mở chúng (hàng 48: máy dev nguội mà trang
  // đầu tiên trình duyệt mở bị biên dịch lười thì HMR báo «Compiled», trang tải lại và lặp mãi). Chỉ là tật của máy dev.
  for (const [ai, duong] of [
    ["quan-tri", "/settings/fees"],
    ["quan-tri", "/settings/personal"],
    ["truong-nhom", "/settings/personal"],
    ["dau-chu-1", "/settings/personal"],
    ["dau-chu-1", "/inventory"],
    ["dau-chu-1", `/units/${encodeURIComponent(CAN_BAO_PHI)}?toa=${encodeURIComponent(TOA)}`],
    ["dau-chu-1", `/units/call?lead=${lead}`],
  ]) {
    const r = await fetch(`${URL_GOC}${duong}`, { headers: { cookie: ck[ai] } });
    await r.text();
    if (r.status !== 200) throw new Error(`làm nóng ${duong}: ${r.status}`);
  }
  writeFileSync(
    PHIEN,
    JSON.stringify({
      san,
      cookie: ck,
      nguoi: { qt, dc1, tn },
      ten,
      toa: TOA,
      can: { baoPhi: { id: canBp, ma: CAN_BAO_PHI }, khongBaoPhi: { id: canKbp, ma: CAN_KHONG_BAO_PHI } },
      dau: dau && { includedItems: dau.included_items, rates: dau.rates, computedAt: dau.computed_at },
      lead,
    }),
  );
  console.log(JSON.stringify({ buoc: "cho-thu", url: URL_GOC, pid: existsSync(PID) ? readFileSync(PID, "utf8").trim() : null, san, can: [CAN_BAO_PHI, CAN_KHONG_BAO_PHI], lead, dau: dau && { items: dau.included_items, rates: dau.rates } }));
} finally {
  await db.end();
}
