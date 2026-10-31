// Dựng chỗ thử của hồ sơ bang-hang-kieu-sheet trên máy dãy B (luật đợt 7: Postgres 5561, dev 3481, container
// quy-hang-db-B) — dùng cho mọi eval ui-check («DỰNG B») và máy đo cuộn E11.
//   node _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs            dựng + nạp 40 hàng mẫu, in bảng người ↔ số hàng thấy
//   node _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs --nhan 5000 thêm hàng nhân từ 40 hàng mẫu tới đủ 5.000 (mã mẫu)
//   node _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs --build    như trên nhưng máy chủ là bản đã build (next start)
//   node _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs --tat       tắt máy chủ dev nó đã bật (chỉ kill PID đã ghi)
// Dữ liệu: sàn và người của packages/db/seed (hàng 5) + hàng mẫu của mau/du-lieu-mau.json nạp QUA API (đường ghi duy
// nhất). Hàng mẫu không có pháp lý và tình trạng sử dụng mà Đang bán bắt buộc: điền «[Mẫu] …» cho hàng cần.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { cookieCua } from "./cdp.mjs";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/bang-hang-kieu-sheet");
const LOG = path.join(CHAY, "web-b.log");
const PID = path.join(CHAY, "web-b.pid");
const CONG = 3481;
const DB_CONG = 5561;
const URL_GOC = `http://localhost:${CONG}`;
const DATABASE_URL = `postgres://postgres:quyhang@localhost:${DB_CONG}/postgres`;
const MIEN = "mau.quy-hang.test";

const { values: a } = parseArgs({ options: { tat: { type: "boolean" }, nhan: { type: "string" }, build: { type: "boolean" } } });
mkdirSync(CHAY, { recursive: true });

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

const env = { ...process.env, DATABASE_URL };
const chay = (cmd, args) => execFileSync(cmd, args, { cwd: GOC, env, stdio: ["ignore", "pipe", "inherit"] }).toString();
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. Postgres của dãy.
const coContainer = chay("docker", ["ps", "-a", "--format", "{{.Names}} {{.State}}"]).split("\n").find((l) => l.startsWith("quy-hang-db-B "));
if (!coContainer) chay("docker", ["run", "--rm", "-d", "--name", "quy-hang-db-B", "-e", "POSTGRES_PASSWORD=quyhang", "-p", `${DB_CONG}:5432`, "postgres:16"]);
else if (!coContainer.endsWith("running")) chay("docker", ["start", "quy-hang-db-B"]);
for (let i = 0; ; i++) {
  try {
    chay("docker", ["exec", "quy-hang-db-B", "pg_isready", "-U", "postgres"]);
    break;
  } catch {
    if (i > 60) throw new Error("Postgres dãy B không lên");
    await ngu(1000);
  }
}
chay("npm", ["run", "db:migrate"]);
chay("node", ["packages/db/seed/nap.mjs", "--nap"]);
// Hai sàn phụ, mỗi sàn một người mẫu quản trị kiêm đầu chủ (sàn cần ít nhất một quản trị): «Sàn trống» cho trạng thái trống (E10), «Sàn đo cuộn» cho 5.000 hàng của E11 —
// tách khỏi sàn thử để số hàng của các bài nhìn khác không đổi.
const SAN_PHU = [
  { ten: "[Mẫu] Sàn trống", email: `trong@${MIEN}` },
  { ten: "[Mẫu] Sàn đo cuộn", email: `do-cuon@${MIEN}` },
];
for (const s of SAN_PHU) {
  chay("node", ["packages/db/scripts/mo-san.mjs", "--ten", s.ten, "--email", s.email]);
  chay("docker", [
    "exec", "quy-hang-db-B", "psql", "-U", "postgres", "-qc",
    `update company_members m set roles = '{company_admin,listing_agent}' from identity."user" u, companies c
     where u.id = m.user_id and c.id = m.company_id and u.email = '${s.email}' and c.name = '${s.ten}'`,
  ]);
}

// dau-chu-2 cũng là đầu chủ ở Sàn trống — người hai sàn cho vế «sàn khác không thấy góc nhìn» của E8.
chay("docker", [
  "exec", "quy-hang-db-B", "psql", "-U", "postgres", "-qc",
  `insert into company_members (company_id, user_id, roles)
   select c.id, u.id, '{listing_agent}' from companies c, identity."user" u
   where c.name = '[Mẫu] Sàn trống' and u.email = 'dau-chu-2@${MIEN}'
   on conflict (company_id, user_id) do nothing`,
]);

// 2. Máy chủ dev.
async function song() {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).ok;
  } catch {
    return false;
  }
}
// Khoá bật máy chủ: các bài nhìn của một lượt chấm chạy song song, cùng thấy máy chủ chưa lên thì cùng bật và tranh
// một cổng (E8 lượt 3 trượt vì thế). Thư mục khoá tạo nguyên tử; khoá quá 5 phút coi là mồ côi.
const KHOA = path.join(CHAY, "web-b.khoa");
async function giuKhoa() {
  for (let i = 0; ; i++) {
    try {
      mkdirSync(KHOA);
      return;
    } catch {
      try {
        if (Date.now() - statSync(KHOA).mtimeMs > 5 * 60_000) rmSync(KHOA, { recursive: true, force: true });
      } catch {}
      if (i > 300) throw new Error("chờ khoá bật máy chủ quá lâu");
      await ngu(1000);
    }
  }
}
if (!(await song())) {
  await giuKhoa();
  try {
    if (!(await song())) await batMayChu();
  } finally {
    rmSync(KHOA, { recursive: true, force: true });
  }
}
async function batMayChu() {
  const out = openSync(LOG, "a");
  // --build: chạy bản đã build (`npm run build -w @quy-hang/web`) — máy đo cuộn đo bản này như ADR-0004, không đo bản dev.
  const p = spawn("npx", ["next", a.build ? "start" : "dev", "-p", String(CONG), "apps/web"], {
    cwd: GOC,
    env: {
      ...env,
      BETTER_AUTH_SECRET: "dev-b-chuoi-thu-khong-dung-o-ban-that",
      BETTER_AUTH_URL: URL_GOC,
      // Bản build đòi bộ gửi mã thật: khai khoá giả để máy chủ dựng được — bản build KHÔNG nhận lời xin mã nào, phiên
      // dùng lại từ lần chạy bản dev (cdp.mjs giữ ở .acceptance-runs).
      ...(a.build ? { RESEND_API_KEY: "khoa-gia-ban-build-khong-gui", MAIL_FROM: `khong-gui@${MIEN}` } : {}),
    },
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

if (a.build) {
  console.log(`bản build ${URL_GOC} · nhật ký ${path.relative(GOC, LOG)} — không nạp, không đăng nhập (dùng phiên đã giữ)`);
  process.exit(0);
}

// 3. Đăng nhập bằng mã đọc từ nhật ký máy chủ dev.
/** Phiên của một người mẫu — dùng lại phiên đã giữ của cdp.mjs (mỗi email chỉ xin được 5 mã trong 15 phút). */
async function dangNhap(email) {
  return (await cookieCua(email)).join("; ");
}

async function goi(cookie, method, p, body) {
  const r = await fetch(`${URL_GOC}${p}`, {
    method,
    headers: { "content-type": "application/json", origin: URL_GOC, cookie },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const than = await r.json().catch(() => null);
  if (r.status >= 300) throw new Error(`${method} ${p} → ${r.status} ${JSON.stringify(than)}`);
  return than;
}

// 4. Nạp hàng mẫu.
const goi_mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
const toaCua = new Map();
for (const p of goi_mau.danhMuc.projects) for (const b of p.buildings) for (const u of b.units) toaCua.set(u.unitNumber, b.buildingName);
const PHI = { bao_phi: "included", khong_bao_phi: "excluded" };

async function napMot(cookie, h, maCan, i) {
  const l = await goi(cookie, "POST", "/api/v1/listings", { buildingName: toaCua.get(h.maCan), unitNumber: maCan });
  let phienBan = l.version;
  const su = async (type, payload) => {
    phienBan = (await goi(cookie, "POST", `/api/v1/listings/${l.id}/events`, { type, payload, expectedVersion: phienBan })).version;
  };
  const phi = PHI[h.dieuKienPhi] ?? "excluded";
  if (h.trangThai !== "Withdrawn" || i % 2) await su("price_changed", { listPrice: h.gia, feeInclusion: phi });
  const lenBan = ["Active", "Pending", "Closed"].includes(h.trangThai) || (h.trangThai === "Hold" && i % 2 === 0);
  if (lenBan) {
    await su("details_changed", { legalStatus: "[Mẫu] Sổ hồng", occupantType: i % 3 ? "[Mẫu] Để trống" : "[Mẫu] Chủ đang ở" });
    await su("status_changed", { to: "Active" });
  }
  if (h.trangThai === "Pending") await su("status_changed", { to: "Pending" });
  if (h.trangThai === "Closed") await su("status_changed", { to: "Closed", closePrice: h.gia, closeDate: "2026-10-20" });
  if (h.trangThai === "Hold") await su("status_changed", { to: "Hold" });
  if (h.trangThai === "Withdrawn") await su("status_changed", { to: "Withdrawn", withdrawnReason: "unreachable" });
  if (i % 3 === 0 && h.trangThai !== "Closed" && h.trangThai !== "Withdrawn") await su("owner_confirmed", {});
}

const nguoiMau = ["dau-chu-1", "dau-chu-2"];
const cookie = {};
for (const n of nguoiMau) cookie[n] = await dangNhap(`${n}@${MIEN}`);
for (const n of nguoiMau) {
  const co = new Set((await goi(cookie[n], "GET", "/api/v1/listings")).map((l) => l.unitNumber));
  const cua = goi_mau.hang.filter((h) => h.dauChu === n);
  for (const [i, h] of cua.entries()) if (!co.has(h.maCan)) await napMot(cookie[n], h, h.maCan, i);
}

// 5. Sàn đo cuộn: nhân 40 hàng mẫu tới đủ N (mã mẫu «A-01.03-M0042» — ngoài danh mục nên loại căn «Chưa rõ»; hàng
// đầu mỗi vòng giữ mã gốc để nhóm loại căn có đủ các nhóm).
if (a.nhan) {
  const muc = Number(a.nhan);
  const ck = await dangNhap(`do-cuon@${MIEN}`);
  let k = (await goi(ck, "GET", "/api/v1/listings")).length;
  const lo = [];
  while (k < muc) {
    const h = goi_mau.hang[k % goi_mau.hang.length];
    const ma = k < goi_mau.hang.length ? h.maCan : `${h.maCan}-M${String(k).padStart(4, "0")}`;
    lo.push(napMot(ck, h, ma, k));
    k++;
    if (lo.length >= 16) await Promise.all(lo.splice(0));
  }
  await Promise.all(lo);
}

// 6. Bảng người ↔ số hàng thấy (đáp án viết trước cho E3).
console.log(`máy chủ dev ${URL_GOC} · nhật ký ${path.relative(GOC, LOG)}`);
for (const n of [...nguoiMau, "truong-nhom", "dau-khach", "trong", ...(a.nhan ? ["do-cuon"] : [])]) {
  const ck = cookie[n] ?? (await dangNhap(`${n}@${MIEN}`));
  const ds = await goi(ck, "GET", "/api/v1/listings");
  console.log(`${n}@${MIEN}\tthấy ${ds.length} hàng`);
}
