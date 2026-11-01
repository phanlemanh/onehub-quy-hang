// Dựng chỗ thử của hồ sơ cot-ho-so-can trên máy dãy H (luật đợt 7: Postgres 5562, dev 3482, container quy-hang-db-H) —
// dùng cho eval ui-check («DỰNG H»). Khuôn lấy từ _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs.
//   node _acceptance/cot-ho-so-can/thu/dung-h.mjs        dựng + nạp hàng mẫu + căn thử của AC-3, AC-4; in mã căn thử
//   Nhật ký máy chủ (mã đăng nhập): dòng đầu lệnh in ra, ở thư mục tạm của máy.
//   node _acceptance/cot-ho-so-can/thu/dung-h.mjs --tat  tắt máy chủ dev nó đã bật (chỉ kill PID đã ghi)
// Dữ liệu: sàn và người của packages/db/seed (hàng 5) + hàng mẫu nạp QUA API (đường ghi duy nhất), nhãn mẫu.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
// Nhật ký, PID và phiên nằm NGOÀI cây kho: máy chủ dev theo dõi cả cây, nhật ký ghi trong cây làm nó dựng lại liên tục và
// trang mở trong trình duyệt tải lại không dứt (đo 01/11 trên dãy H).
const CHAY = path.join(os.tmpdir(), "quy-hang-cot-ho-so-can");
const LOG = path.join(CHAY, "web-h.log");
const PID = path.join(CHAY, "web-h.pid");
const CONG = 3482;
const DB_CONG = 5562;
const URL_GOC = `http://localhost:${CONG}`;
const DATABASE_URL = `postgres://postgres:quyhang@localhost:${DB_CONG}/postgres`;
const MIEN = "mau.quy-hang.test";

const { values: a } = parseArgs({ options: { tat: { type: "boolean" } } });
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
const coContainer = chay("docker", ["ps", "-a", "--format", "{{.Names}} {{.State}}"]).split("\n").find((l) => l.startsWith("quy-hang-db-H "));
if (!coContainer) chay("docker", ["run", "--rm", "-d", "--name", "quy-hang-db-H", "-e", "POSTGRES_PASSWORD=quyhang", "-p", `${DB_CONG}:5432`, "postgres:16"]);
else if (!coContainer.endsWith("running")) chay("docker", ["start", "quy-hang-db-H"]);
for (let i = 0; ; i++) {
  try {
    chay("docker", ["exec", "quy-hang-db-H", "pg_isready", "-U", "postgres"]);
    break;
  } catch {
    if (i > 60) throw new Error("Postgres dãy H không lên");
    await ngu(1000);
  }
}
chay("npm", ["run", "db:migrate"]);
chay("node", ["packages/db/seed/nap.mjs", "--nap"]);

// 2. Máy chủ dev (dùng lại máy đang chạy ở 3482 nếu có).
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

// 3. Phiên người mẫu: xin mã, đọc mã ở nhật ký máy chủ (máy dev in mã ra nhật ký). Máy chủ không do lệnh này bật thì
// nhật ký là của phiên đã bật nó — khai QH_H_LOG.
const NHAT_KY = process.env.QH_H_LOG ?? LOG;
async function cookieCua(email) {
  const giu = path.join(CHAY, `phien-${email}.json`);
  if (existsSync(giu)) {
    const c = JSON.parse(readFileSync(giu, "utf8"));
    if ((await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: c.join("; ") } })).status === 200) return c.join("; ");
  }
  const h = { "content-type": "application/json", origin: URL_GOC };
  const maCua = () => (existsSync(NHAT_KY) ? readFileSync(NHAT_KY, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `)) : []);
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  let ma = null;
  for (let i = 0; !ma && i < 30; i++) {
    await ngu(300);
    const ds = maCua();
    ma = ds.length > truoc ? (ds.at(-1)?.split(" ").at(-1) ?? null) : null;
  }
  if (!ma) throw new Error(`không thấy mã của ${email} trong ${NHAT_KY}`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  if (r.status !== 200) throw new Error(`đăng nhập ${email}: ${r.status}`);
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  writeFileSync(giu, JSON.stringify(ck));
  return ck.join("; ");
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

// 4. Hàng mẫu của hai đầu chủ (như dung-b.mjs).
const goi_mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
const toaCua = new Map();
const donVi = new Map();
for (const p of goi_mau.danhMuc.subdivisions)
  for (const b of p.buildings)
    for (const u of b.units) {
      toaCua.set(u.unitNumber, b.buildingName);
      donVi.set(u.unitNumber, { ...u, toa: b.buildingName, khu: p.subdivisionName });
    }
const PHI = { bao_phi: "included", khong_bao_phi: "excluded" };

async function taoHang(cookie, toa, ma) {
  const l = await goi(cookie, "POST", "/api/v1/listings", { buildingName: toa, unitNumber: ma });
  let v = l.version;
  return {
    id: l.id,
    su: async (ck, type, payload) => {
      v = (await goi(ck, "POST", `/api/v1/listings/${l.id}/events`, { type, payload, expectedVersion: v })).version;
    },
  };
}

async function napMot(cookie, h, i) {
  const { su } = await taoHang(cookie, toaCua.get(h.maCan), h.maCan);
  const s = (t, p) => su(cookie, t, p);
  const phi = PHI[h.dieuKienPhi] ?? "excluded";
  if (h.trangThai !== "Withdrawn" || i % 2) await s("price_changed", { listPrice: h.gia, feeInclusion: phi });
  const lenBan = ["Active", "Pending", "Closed"].includes(h.trangThai) || (h.trangThai === "Hold" && i % 2 === 0);
  if (lenBan) {
    await s("details_changed", { legalStatus: "[Mẫu] Sổ hồng", occupantType: i % 3 ? "[Mẫu] Để trống" : "[Mẫu] Chủ đang ở" });
    await s("status_changed", { to: "Active" });
  }
  if (h.trangThai === "Pending") await s("status_changed", { to: "Pending" });
  if (h.trangThai === "Closed") await s("status_changed", { to: "Closed", closePrice: h.gia, closeDate: "2026-10-20" });
  if (h.trangThai === "Hold") await s("status_changed", { to: "Hold" });
  if (h.trangThai === "Withdrawn") await s("status_changed", { to: "Withdrawn", withdrawnReason: "unreachable" });
  if (i % 3 === 0 && h.trangThai !== "Closed" && h.trangThai !== "Withdrawn") await s("owner_confirmed", {});
}

const ck = {};
for (const n of ["dau-chu-1", "dau-chu-2", "truong-nhom"]) ck[n] = await cookieCua(`${n}@${MIEN}`);
for (const n of ["dau-chu-1", "dau-chu-2"]) {
  const co = new Set((await goi(ck[n], "GET", "/api/v1/listings")).map((l) => `${l.buildingName}|${l.unitNumber}`));
  const cua = goi_mau.hang.filter((h) => h.dauChu === n);
  for (const [i, h] of cua.entries()) if (!co.has(`${toaCua.get(h.maCan)}|${h.maCan}`)) await napMot(ck[n], h, i);
}

// 5. Căn thử của hồ sơ — căn A trong danh mục, chưa có hàng mẫu: hai lần rao (một đã ngừng, một đang bán với đủ sáu sự
// kiện của AC-4 do Đầu chủ mẫu 1 và Trưởng nhóm mẫu làm); căn ngoài danh mục; cùng mã A ở Toà B (nhiều căn).
const daDung = new Set(goi_mau.hang.map((h) => h.maCan));
const A = [...donVi.values()].find((u) => u.toa === "Toà A" && !daDung.has(u.unitNumber) && u.floor > 5);
const C = goi_mau.hang.find((h) => h.dauChu === "dau-chu-1" && h.trangThai === "Active")?.maCan;
const NGOAI = "Z-99.99";
const hienCo = await goi(ck["dau-chu-1"], "GET", "/api/v1/listings");
const co = (toa, ma) => hienCo.some((l) => l.buildingName === toa && l.unitNumber === ma);
const d1 = ck["dau-chu-1"];
if (!co("Toà A", A.unitNumber)) {
  const cu = await taoHang(d1, "Toà A", A.unitNumber);
  await cu.su(d1, "price_changed", { listPrice: 3_100_000_000, feeInclusion: "included" });
  await cu.su(d1, "details_changed", { legalStatus: "[Mẫu] Sổ hồng", occupantType: "[Mẫu] Để trống" });
  await cu.su(d1, "status_changed", { to: "Active" });
  await cu.su(d1, "status_changed", { to: "Withdrawn", withdrawnReason: "owner_changed_mind" });
  const mo = await taoHang(d1, "Toà A", A.unitNumber);
  await mo.su(d1, "price_changed", { listPrice: 3_400_000_000, feeInclusion: "included" });
  await mo.su(d1, "details_changed", { legalStatus: "[Mẫu] Sổ hồng", occupantType: "[Mẫu] Để trống" });
  await mo.su(d1, "status_changed", { to: "Active" });
  await mo.su(ck["truong-nhom"], "price_changed", { listPrice: 3_250_000_000, feeInclusion: "included" });
  await mo.su(d1, "owner_confirmed", {});
}
if (!co("Toà A", NGOAI)) await taoHang(d1, "Toà A", NGOAI);
if (!co("Toà B", A.unitNumber)) await taoHang(d1, "Toà B", A.unitNumber);

// 6. Đáp án viết trước cho E9.
const loai = A.bedroomsTotal === 0 ? "Studio" : `${A.bedroomsTotal}PN`;
console.log(`máy chủ dev ${URL_GOC} · nhật ký ${NHAT_KY}`);
console.log(`căn A: ${A.unitNumber} · Toà A · thuộc tính: ${loai} · ${A.livingArea} m² · tầng ${A.floor} · ${A.directionFaces} · ${A.khu} · Căn hộ`);
console.log(`căn A: hai lần rao (Đang bán 3,25 tỷ · Ngừng hẳn 3,1 tỷ); lịch sử lần đang bán 6 dòng, người «Bạn» và «Trưởng nhóm»`);
console.log(`căn ngoài danh mục: ${NGOAI} · Toà A`);
console.log(`căn C (chưa mở lần nào trong phiên này): ${C} · ${toaCua.get(C)}`);
console.log(`mã trùng hai toà: ${A.unitNumber} (Toà A, Toà B) — /units/${A.unitNumber} không kèm toà ra «Nhiều căn»`);
