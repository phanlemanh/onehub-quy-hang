// Thước của va-bang-hang-hydration: mở Bảng hàng trên bản DEV (React chỉ báo lệch hydration ở bản dev) bằng Chrome không
// đầu, thu MỌI lỗi console và ngoại lệ, đếm lỗi hydration. Bốn ca: khổ máy tính (1440) và điện thoại (375) × lần mở đầu
// (kho trên máy trống) và lần mở lại (kho trên máy đã có hàng — đúng ca của bốn khung lỗi ghi ở
// _acceptance/mau-bang-hang-va-bai/evidence/E10-console-errors.txt). Đối chứng dương mỗi ca: trang thật sự hiện hàng
// (đọc chữ «căn» của dòng đếm hay thẻ) — trang trắng hay đang tải mãi thì ca «không đo được», không phải «sạch».
//   node kiem-hydration.mjs                 đo cây chứa tệp này
//   node kiem-hydration.mjs --sha <sha>     đo một commit khác (worktree dưới .acceptance-runs, cài một lần) — đối chứng:
//                                           nhánh chính trước vòng phải đỏ.
// Thêm (gap-probe 07/11): khổ máy tính mở góc nhìn đã lưu, và mở lại khi chặn /api/v1 — hàng phải hiện trong 5 giây.
// Mỗi «mở đầu» xoá kho trên máy của trang trước (giữ cookie). Exit 0 = 0 lỗi hydration ở mọi ca · 1 = có lỗi (in khung đầu) · 2 = không đo được.
// Bàn đo dãy D: Postgres 5575/e11, dev 3585 (khoá chung .acceptance-runs/va-bang-hang-e11-hieu-nang/.khoa-kiem-e11).
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, rmdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { GOC, cookieCua, moChrome, URL_GOC } from "./cdp.mjs";

const DAY = path.dirname(fileURLToPath(import.meta.url));
const RA = path.join(GOC, ".acceptance-runs/va-bang-hang-hydration");
const RA_D = path.join(GOC, ".acceptance-runs/va-bang-hang-e11-hieu-nang");
const KHOA = path.join(RA_D, ".khoa-kiem-e11");
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const { values: a } = parseArgs({ options: { sha: { type: "string" } } });
mkdirSync(RA, { recursive: true });
const chay = (cmd, args, opt = {}) => execFileSync(cmd, args, { cwd: GOC, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", ...opt });
const thoat = (ma, chu) => {
  console.log(chu);
  process.exit(ma);
};

// Khoá chung của bàn đo dãy D (cổng 3585): chờ tối đa 2 giờ, khoá bỏ quên quá 90 phút thì gỡ.
for (let i = 0; ; i++) {
  try {
    mkdirSync(KHOA);
    break;
  } catch {
    if (Date.now() - statSync(KHOA).mtimeMs > 90 * 60_000) rmdirSync(KHOA);
    if (i > 720) thoat(2, "hydration: chờ khoá đo dãy D quá 2 giờ");
    await ngu(10_000);
  }
}
const donDep = [];
process.on("exit", () => {
  for (const f of donDep.reverse()) {
    try {
      f();
    } catch {
      // đã dọn
    }
  }
  try {
    rmdirSync(KHOA);
  } catch {
    // đã nhả
  }
});
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => process.exit(2));

// 1. Cây đo.
let CAY = GOC;
if (a.sha) {
  const sha = chay("git", ["rev-parse", a.sha]).trim();
  CAY = path.join(RA, `wt-${sha.slice(0, 8)}`);
  if (!existsSync(CAY)) chay("git", ["worktree", "add", "-q", "--detach", CAY, sha]);
  if (!existsSync(path.join(CAY, "node_modules"))) chay("npm", ["ci", "--silent"], { cwd: CAY });
}
const SHA_CAY = chay("git", ["rev-parse", "HEAD"], { cwd: CAY }).trim();

// 2. Dữ liệu và phiên: dung-d.mjs (bản dev của cây này) nạp hàng mẫu và giữ phiên của người mẫu, rồi tắt.
try {
  chay("node", [path.join(DAY, "dung-d.mjs")]);
} catch (e) {
  thoat(2, `hydration: dựng dữ liệu lỗi — ${String(e.stderr ?? e).split("\n").slice(-3).join(" ")}`);
} finally {
  try {
    chay("node", [path.join(DAY, "dung-d.mjs"), "--tat"]);
  } catch {
    // không có gì để tắt
  }
}
for (let i = 0; i < 30; i++) {
  try {
    await fetch(`${URL_GOC}/api/v1/health`);
    await ngu(1000);
  } catch {
    break;
  }
}
const cookie = await cookieCua("dau-chu-1@mau.quy-hang.test", { chiPhienGiu: true }).catch(() => null);
if (!cookie) {
  // phiên giữ hết hạn: xin lại cần máy chủ dev đang chạy — để lần bật bên dưới lo.
}

// 3. Bản dev của cây đo ở 3585, nhóm tiến trình riêng.
const nhatKy = openSync(path.join(RA, `web-${SHA_CAY.slice(0, 8)}.log`), "a");
const may = spawn(path.join(CAY, "node_modules/.bin/next"), ["dev", "-p", "3585", "apps/web"], {
  cwd: CAY,
  env: {
    ...process.env,
    DATABASE_URL: "postgres://postgres:quyhang@localhost:5575/e11",
    BETTER_AUTH_SECRET: "dev-b-chuoi-thu-khong-dung-o-ban-that",
    BETTER_AUTH_URL: URL_GOC,
  },
  detached: true,
  stdio: ["ignore", nhatKy, nhatKy],
});
donDep.push(() => process.kill(-may.pid, "SIGTERM"));
for (let i = 0; ; i++) {
  try {
    if ((await fetch(`${URL_GOC}/api/v1/health`)).ok) break;
  } catch {
    // chưa lên
  }
  if (i > 180) thoat(2, "hydration: bản dev không lên ở 3585");
  await ngu(1000);
}
const ck = cookie ?? (await cookieCua("dau-chu-1@mau.quy-hang.test").catch(() => null));
if (!ck) thoat(2, "hydration: không có phiên của dau-chu-1");
// Làm nóng: bản dev biên dịch trang lần đầu khi có người gọi — gọi /inventory và một góc nhìn trước để ca đầu không đo
// lượt biên dịch (lượt chấm 08/11: ca «máy tính · mở đầu» hết 120 giây khi máy tải nặng).
for (const duong of ["/inventory", "/inventory/views/lam-nong"]) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${URL_GOC}${duong}`, { headers: { cookie: ck.join("; ") } })).status < 500) break;
    } catch {
      // đang biên dịch
    }
    await ngu(3000);
  }
}

// 4. Các ca. Đối chứng dương: máy tính đọc dòng đếm «N / M căn»; điện thoại đếm thẻ căn ([data-the-can]).
const LA_HYDRATION = /hydrat|did not match|#418|#423|#425/i;
const DEM_DONG = `/\\d+\\s*\\/\\s*\\d+\\s*căn/.test(document.body.innerText)`;
const CO_THE = `document.querySelectorAll('[data-the-can]').length > 0`;
const chrome = await moChrome();
donDep.push(() => chrome.dong());
setTimeout(() => thoat(2, "hydration: quá 20 phút"), 20 * 60_000).unref();
const me = await (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: ck.join("; ") } })).json();
const ket = [];
const doCa = async (t, ten, duong, coHangExpr, loi) => {
  loi.length = 0;
  await t.di(duong);
  let coHang = false;
  try {
    await t.cho(coHangExpr, 120_000);
    coHang = true;
  } catch {
    coHang = false;
  }
  await ngu(4000);
  const hyd = loi.filter((l) => LA_HYDRATION.test(l));
  ket.push({ ca: ten, coHang, hydration: hyd.length, loiKhac: loi.length - hyd.length, mau: hyd[0]?.split("\n").slice(0, 3).join(" ") });
};
const moTrang = async (rong, cao) => {
  const t = await chrome.trang(rong, cao);
  const loi = [];
  t.nghe((m, p) => {
    if (m === "Runtime.consoleAPICalled" && p.type === "error") loi.push(p.args.map((x) => x.value ?? x.description ?? "").join(" "));
    if (m === "Runtime.exceptionThrown") loi.push(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text);
  });
  await t.datCookie(ck);
  return { t, loi };
};
// Xoá kho trên máy của trang (giữ cookie) — «mở đầu» thật sự là kho trống.
const xoaKho = (t) => t.gui("Storage.clearDataForOrigin", { origin: URL_GOC, storageTypes: "local_storage,indexeddb,cache_storage,service_workers" });
for (const [kho, rong, cao, expr] of [
  ["máy tính", 1440, 900, DEM_DONG],
  ["điện thoại", 375, 812, CO_THE],
]) {
  const { t, loi } = await moTrang(rong, cao);
  await t.di("/inventory");
  await ngu(1500);
  await xoaKho(t);
  await doCa(t, `${kho} · mở đầu`, "/inventory", expr, loi);
  await doCa(t, `${kho} · mở lại`, "/inventory", expr, loi);
  if (rong > 768) {
    // Góc nhìn đã lưu (localStorage theo người và sàn) — đường vào thứ hai của Bảng hàng.
    const goc = { v: 1, ds: [{ id: "thu-hydration", ten: "[Mẫu] Góc nhìn thử", luc: "", loc: {}, cot: ["buildingName", "unitNumber", "standardStatus"], sap: [], nhom: "toa-loai" }] };
    await t.tinh(`localStorage.setItem(${JSON.stringify(`qh:goc-nhin:v1:${me.user.id}:${me.activeCompany.id}`)}, ${JSON.stringify(JSON.stringify(goc))}); true`);
    await doCa(t, `${kho} · góc nhìn đã lưu · mở lại`, "/inventory/views/thu-hydration", expr, loi);
    // Mất mạng: chặn /api/v1 — hàng phải hiện từ kho trên máy trong 5 giây (lượt hydrat chỉ trễ một lượt dựng).
    await t.gui("Network.setBlockedURLs", { urls: ["*/api/v1/*"] });
    loi.length = 0;
    await t.di("/inventory");
    let nhanh = false;
    try {
      await t.cho(expr, 5000);
      nhanh = true;
    } catch {
      nhanh = false;
    }
    await t.gui("Network.setBlockedURLs", { urls: [] });
    const hyd = loi.filter((l) => LA_HYDRATION.test(l));
    ket.push({ ca: `${kho} · mở lại · mất mạng`, coHang: true, nhanh, hydration: hyd.length, loiKhac: 0, mau: hyd[0]?.split("\n").slice(0, 3).join(" ") });
  }
  t.dong();
}

console.log(`cây ${SHA_CAY}`);
for (const k of ket)
  console.log(`${k.ca}: ${k.coHang ? "có hàng" : "KHÔNG thấy hàng"}${k.nhanh === undefined ? "" : k.nhanh ? " · hàng từ kho trên máy hiện trong 5 giây" : " · hàng KHÔNG hiện trong 5 giây khi mất mạng"} · lỗi hydration ${k.hydration} · lỗi console khác ${k.loiKhac}${k.mau ? ` · «${k.mau.slice(0, 160)}»` : ""}`);
if (ket.some((k) => !k.coHang)) thoat(2, "hydration: KHÔNG ĐO ĐƯỢC — có ca trang không hiện hàng");
const tong = ket.reduce((s, k) => s + k.hydration, 0);
if (tong > 0) thoat(1, `hydration ĐỎ: ${tong} lỗi hydration trên Bảng hàng`);
if (ket.some((k) => k.nhanh === false)) thoat(1, "hydration ĐỎ: mất mạng thì hàng trong kho trên máy không hiện trong 5 giây");
thoat(0, `hydration SẠCH: 0 lỗi hydration ở cả ${ket.length} ca; mất mạng vẫn hiện hàng trong 5 giây`);
