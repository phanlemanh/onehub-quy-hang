// Dựng chỗ thử của hồ sơ bang-hang-dang-the trên máy dãy B (luật 7 của đợt dau-khach-nhap: Postgres 5572, dev 3492,
// container quy-hang-db-dkn-B) — dùng cho mọi eval ui-check («DỰNG B»). Chép khung từ bang-hang-kieu-sheet/thu/dung-b.mjs.
//   node _acceptance/bang-hang-dang-the/thu/dung-b.mjs              dựng + nạp 40 hàng mẫu có ảnh thật, in bảng và đáp án
//   node _acceptance/bang-hang-dang-the/thu/dung-b.mjs --nhan 5000  thêm sàn đo cuộn tới đủ N hàng (mã mẫu)
//   node _acceptance/bang-hang-dang-the/thu/dung-b.mjs --tat        tắt máy chủ dev nó đã bật (chỉ kill PID đã ghi)
// Dữ liệu: sàn và người của packages/db/seed (hàng 5) + hàng mẫu của mau/du-lieu-mau.json nạp QUA API (đường ghi duy
// nhất). Luật lõi (hàng 23) đòi ảnh thật ngăn Gửi được trước Đang bán: mỗi hàng lên bán nhận một ảnh vẽ bằng mã
// (packages/db/seed/anh-mau.mjs) qua API ảnh. Ba căn đặc biệt cho ảnh bìa (AC-7): một căn ba ảnh, bìa là ảnh thứ hai; một
// căn dời ảnh sang ngăn Nội bộ; một căn xoá ảnh sau khi lên bán. Đáp án đếm tính bằng vòng lặp riêng trên thân API.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { anhMau } from "../../../packages/db/seed/anh-mau.mjs";
import { CHAY, CONG, GOC, LOG, URL_GOC, cookieCua } from "./phien.mjs";

const PID = path.join(CHAY, "web-b.pid");
const DB_CONG = 5572;
const CONTAINER = "quy-hang-db-dkn-B";
const DATABASE_URL = `postgres://postgres:quyhang@localhost:${DB_CONG}/postgres`;
const MIEN = "mau.quy-hang.test";

const { values: a } = parseArgs({ options: { tat: { type: "boolean" }, nhan: { type: "string" } } });
mkdirSync(CHAY, { recursive: true });
mkdirSync(path.dirname(LOG), { recursive: true });

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

// Khoá dựng: các bài nhìn của một lượt chấm chạy song song — cùng migrate, cùng nạp, cùng bật máy chủ thì tranh nhau.
const KHOA = path.join(CHAY, "web-b.khoa");
for (let i = 0; ; i++) {
  try {
    mkdirSync(KHOA);
    break;
  } catch {
    try {
      if (Date.now() - statSync(KHOA).mtimeMs > 15 * 60_000) rmSync(KHOA, { recursive: true, force: true });
    } catch {
      // khoá vừa được nhả giữa hai lệnh
    }
    if (i > 1200) throw new Error("chờ khoá dựng quá lâu");
    await new Promise((r) => setTimeout(r, 1000));
  }
}
process.on("exit", () => rmSync(KHOA, { recursive: true, force: true }));

const env = { ...process.env, DATABASE_URL };
const chay = (cmd, args) => execFileSync(cmd, args, { cwd: GOC, env, stdio: ["ignore", "pipe", "inherit"] }).toString();
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const psql = (sql) => chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-qAtc", sql]);

// 1. Postgres của dãy.
const co = chay("docker", ["ps", "-a", "--format", "{{.Names}} {{.State}}"]).split("\n").find((l) => l.startsWith(`${CONTAINER} `));
if (!co) chay("docker", ["run", "--rm", "-d", "--name", CONTAINER, "-e", "POSTGRES_PASSWORD=quyhang", "-p", `${DB_CONG}:5432`, "postgres:16"]);
else if (!co.endsWith("running")) chay("docker", ["start", CONTAINER]);
for (let i = 0; ; i++) {
  try {
    chay("docker", ["exec", CONTAINER, "pg_isready", "-U", "postgres"]);
    break;
  } catch {
    if (i > 60) throw new Error("Postgres dãy B không lên");
    await ngu(1000);
  }
}
chay("npm", ["run", "db:migrate"]);
chay("node", ["packages/db/seed/nap.mjs", "--nap"]);
// Hai sàn phụ, mỗi sàn một quản trị kiêm đầu chủ: «Sàn trống» cho trạng thái trống, «Sàn đo cuộn» cho 5.000 hàng.
const SAN_PHU = [
  { ten: "[Mẫu] Sàn trống", email: `trong@${MIEN}` },
  { ten: "[Mẫu] Sàn đo cuộn", email: `do-cuon@${MIEN}` },
];
for (const s of SAN_PHU) {
  chay("node", ["packages/db/scripts/mo-san.mjs", "--ten", s.ten, "--email", s.email]);
  psql(`update company_members m set roles = '{company_admin,listing_agent}' from identity."user" u, companies c
        where u.id = m.user_id and c.id = m.company_id and u.email = '${s.email}' and c.name = '${s.ten}'`);
}

// 2. Máy chủ dev.
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
    env: { ...env, BETTER_AUTH_SECRET: "dev-dkn-b-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC },
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

async function goi(cookie, method, p, body) {
  const r = await fetch(`${URL_GOC}${p}`, {
    method,
    headers: { ...(body instanceof FormData ? {} : { "content-type": "application/json" }), origin: URL_GOC, cookie },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });
  const than = await r.json().catch(() => null);
  if (r.status >= 300) throw new Error(`${method} ${p} → ${r.status} ${JSON.stringify(than)}`);
  return than;
}

/** Một ảnh vẽ bằng mã qua API ảnh (bản gốc trong thân — kho Postgres của máy dev). */
async function themAnh(cookie, toa, ma, i, ngan = "shareable") {
  const { goc, nhe, width, height } = anhMau(i);
  await goi(cookie, "POST", "/api/v1/units/photos/upload-url", { toa, ma, contentType: "image/png", byteSize: goc.length });
  const fd = new FormData();
  fd.set("toa", toa);
  fd.set("ma", ma);
  fd.set("compartment", ngan);
  fd.set("width", String(width));
  fd.set("height", String(height));
  fd.set("original", new Blob([goc], { type: "image/png" }), "mau.png");
  fd.set("thumb", new Blob([nhe], { type: "image/png" }), "thumb");
  return goi(cookie, "POST", "/api/v1/units/photos", fd);
}
const anhCua = async (cookie, toa, ma) => (await goi(cookie, "GET", `/api/v1/units/photos?${new URLSearchParams({ toa, ma })}`)).anh;

// 3. Nạp hàng mẫu.
const goi_mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
const toaCua = new Map();
const canCua = new Map();
for (const p of goi_mau.danhMuc.subdivisions)
  for (const b of p.buildings)
    for (const u of b.units) {
      toaCua.set(u.unitNumber, b.buildingName);
      canCua.set(`${b.buildingName}|${u.unitNumber}`, u);
    }
const PHI = { bao_phi: "included", khong_bao_phi: "excluded" };

async function napMot(cookie, h, maCan, i, coAnh = true) {
  const toa = toaCua.get(h.maCan);
  const l = await goi(cookie, "POST", "/api/v1/listings", { buildingName: toa, unitNumber: maCan });
  let phienBan = l.version;
  const su = async (type, payload) => {
    phienBan = (await goi(cookie, "POST", `/api/v1/listings/${l.id}/events`, { type, payload, expectedVersion: phienBan })).version;
  };
  if (h.trangThai !== "Withdrawn" || i % 2) await su("price_changed", { listPrice: h.gia, feeInclusion: PHI[h.dieuKienPhi] ?? "excluded" });
  const lenBan = ["Active", "Pending", "Closed"].includes(h.trangThai) || (h.trangThai === "Hold" && i % 2 === 0);
  if (lenBan) {
    await su("details_changed", { legalStatus: "[Mẫu] Sổ hồng", occupantType: i % 3 ? "[Mẫu] Để trống" : "[Mẫu] Chủ đang ở" });
    if (coAnh) await themAnh(TN, toa, maCan, i);
    await su("status_changed", { to: "Active" });
  }
  if (h.trangThai === "Pending") await su("status_changed", { to: "Pending" });
  if (h.trangThai === "Closed") await su("status_changed", { to: "Closed", closePrice: h.gia, closeDate: "2026-10-20" });
  if (h.trangThai === "Hold") await su("status_changed", { to: "Hold" });
  if (h.trangThai === "Withdrawn") await su("status_changed", { to: "Withdrawn", withdrawnReason: "unreachable" });
  return l.id;
}

const nguoiMau = ["dau-chu-1", "dau-chu-2"];
// Ảnh: chỉ người giữ căn và trưởng nhóm thêm, sửa được (quyenAnh của lõi) — bộ dựng thêm ảnh bằng phiên trưởng nhóm.
const TN = (await cookieCua(`truong-nhom@${MIEN}`)).join("; ");
const cookie = {};
for (const n of nguoiMau) cookie[n] = (await cookieCua(`${n}@${MIEN}`)).join("; ");
for (const n of nguoiMau) {
  const co = new Set((await goi(cookie[n], "GET", "/api/v1/listings")).map((l) => l.unitNumber));
  const cua = goi_mau.hang.filter((h) => h.dauChu === n);
  for (const h of cua) if (!co.has(h.maCan)) await napMot(cookie[n], h, h.maCan, goi_mau.hang.indexOf(h));
}

// 4. Ba căn ảnh đặc biệt (Đang bán, Toà A; ảnh sửa bằng phiên trưởng nhóm) — làm một lần, nhận ra lại bằng số ảnh.
const C1 = TN;
const BIA = { toa: "Toà A", ma: "A-04.06" };
const NOI_BO = { toa: "Toà A", ma: "A-06.03" };
const KHONG_ANH = { toa: "Toà A", ma: "A-08.03" };
let bia = await anhCua(C1, BIA.toa, BIA.ma);
if (bia.length < 3) {
  await themAnh(C1, BIA.toa, BIA.ma, 101);
  await themAnh(C1, BIA.toa, BIA.ma, 102);
  bia = await anhCua(C1, BIA.toa, BIA.ma);
  const thuHai = bia.filter((p) => p.compartment === "shareable").sort((x, y) => x.displayOrder - y.displayOrder)[1];
  await goi(C1, "PATCH", `/api/v1/units/photos/${thuHai.id}`, { isCover: true });
  bia = await anhCua(C1, BIA.toa, BIA.ma);
}
for (const p of (await anhCua(C1, NOI_BO.toa, NOI_BO.ma)).filter((p) => p.compartment === "shareable"))
  await goi(C1, "PATCH", `/api/v1/units/photos/${p.id}`, { compartment: "internal" });
for (const p of await anhCua(C1, KHONG_ANH.toa, KHONG_ANH.ma)) await goi(C1, "DELETE", `/api/v1/units/photos/${p.id}`);
const noiBo = await anhCua(C1, NOI_BO.toa, NOI_BO.ma);

// 5. Sàn đo cuộn: nhân hàng mẫu tới đủ N (mã mẫu «A-01.03-M0042» — ngoài danh mục). Ảnh của hàng lên bán chèn thẳng
// bằng SQL (không byte — thẻ hiện ô ảnh trống): 5.000 lần tải ảnh qua API là quá chậm cho bài đếm thẻ.
if (a.nhan) {
  const muc = Number(a.nhan);
  const ck = (await cookieCua(`do-cuon@${MIEN}`, "[Mẫu] Sàn đo cuộn")).join("; ");
  const san = psql(`select id from companies where name = '[Mẫu] Sàn đo cuộn' order by created_at limit 1`).trim();
  let k = (await goi(ck, "GET", "/api/v1/listings")).length;
  const lo = [];
  while (k < muc) {
    const h = goi_mau.hang[k % goi_mau.hang.length];
    const ma = `${h.maCan}-M${String(k).padStart(4, "0")}`;
    // Ảnh trước khi lên bán: chèn metadata một dòng cho đúng toà + mã (đủ luật «ảnh thật» của lõi).
    psql(`insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by)
          values (gen_random_uuid(), '${san}', '${toaCua.get(h.maCan)}', '${ma}', 'shareable', 'image/png', 1000, 10, 10, 'bai-kiem')`);
    lo.push(napMot(ck, h, ma, k, false));
    k++;
    if (lo.length >= 16) await Promise.all(lo.splice(0));
  }
  await Promise.all(lo);
}

// 6. Bảng người ↔ số căn thấy và đáp án viết trước (đếm bằng vòng lặp riêng trên thân API + danh mục của gói mẫu).
console.log(`máy chủ dev ${URL_GOC} · nhật ký ${path.relative(GOC, LOG)}`);
for (const n of [...nguoiMau, "dau-khach", "truong-nhom", "trong", ...(a.nhan ? ["do-cuon"] : [])]) {
  const ck = (await cookieCua(`${n}@${MIEN}`, n === "do-cuon" ? "[Mẫu] Sàn đo cuộn" : n === "trong" ? "[Mẫu] Sàn trống" : "[Mẫu] Sàn thử")).join("; ");
  const ds = await goi(ck, "GET", "/api/v1/listings");
  let ban = 0;
  let gd = 0;
  for (const l of ds) {
    if (l.standardStatus === "Active") ban++;
    if (l.standardStatus === "Pending") gd++;
  }
  console.log(`${n}@${MIEN}\tthấy ${ds.length} hàng · Đang bán ${ban} · Đang giao dịch ${gd} · lên thẻ ${ban + gd}`);
}
const dsKhach = await goi((await cookieCua(`dau-khach@${MIEN}`)).join("; "), "GET", "/api/v1/listings");
let dapAn = 0;
for (const l of dsKhach) {
  if (l.standardStatus !== "Active" && l.standardStatus !== "Pending") continue;
  const u = canCua.get(`${l.buildingName}|${l.unitNumber}`);
  if (l.listPrice !== null && l.listPrice >= 2e9 && l.listPrice <= 5e9 && u?.bedroomsTotal === 2 && l.buildingName === "Toà A") dapAn++;
}
const dangGd = dsKhach.filter((l) => l.standardStatus === "Pending").map((l) => `${l.unitNumber} (${l.buildingName})`);
console.log(`đáp án «2–5 tỷ · 2PN · Toà A»: ${dapAn} căn`);
console.log(`căn Đang giao dịch: ${dangGd.join(", ")}`);
const biaId = bia.filter((p) => p.compartment === "shareable").find((p) => p.isCover)?.id;
console.log(`ảnh bìa: ${BIA.ma} (${BIA.toa}) — ba ảnh Gửi được, bìa là ảnh thứ hai, id ${biaId}`);
console.log(`chỉ ảnh Nội bộ: ${NOI_BO.ma} (${NOI_BO.toa}) — id Nội bộ ${noiBo.map((p) => p.id).join(", ")}`);
console.log(`không ảnh: ${KHONG_ANH.ma} (${KHONG_ANH.toa})`);
console.log("hàng chưa mã căn: không lên thẻ (luật hàng 23 — chưa mã không lên Đang bán)");
