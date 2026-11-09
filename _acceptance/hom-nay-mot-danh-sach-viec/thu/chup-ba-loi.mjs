// Chụp trang ba lối và ma trận trạng thái của hom-nay-mot-danh-sach-viec trên máy dev cổng 3460 (Postgres cổng 5599 đã nạp
// sàn mẫu). Đăng nhập tài khoản mẫu bằng mã email đọc từ nhật ký máy dev; trình duyệt CDP của hồ sơ bang-hang-kieu-sheet.
//   node _acceptance/hom-nay-mot-danh-sach-viec/thu/chup-ba-loi.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3460";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const SLUG = "hom-nay-mot-danh-sach-viec";
const BA_LOI = path.join(GOC, `_acceptance/${SLUG}/ba-loi`);
const DP = path.join(GOC, `_acceptance/${SLUG}/evidence/design-pass`);
const LOG = path.join(GOC, `.acceptance-runs/${SLUG}/web.log`);
const EMAIL = "dau-chu-1@mau.quy-hang.test";
mkdirSync(BA_LOI, { recursive: true });
mkdirSync(DP, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

async function dangNhap() {
  const h = { "content-type": "application/json", origin: URL_GOC };
  const maCua = () => readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${EMAIL} `));
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email: EMAIL, type: "sign-in" }) });
  let ma = null;
  for (let i = 0; i < 40 && !ma; i++) {
    await ngu(500);
    const ds = maCua();
    if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
  }
  if (!ma) throw new Error("không thấy mã đăng nhập trong nhật ký máy dev");
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email: EMAIL, otp: ma }) });
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  if (!ck.length) throw new Error(`đăng nhập hỏng: ${r.status}`);
  return ck;
}

const cookie = await dangNhap();
const CAO = { 1440: 900, 375: 812 };
const AN = `(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`;
const chrome = await moChrome();
async function chup(duong, moc, ra, kho) {
  const t = await chrome.trang(kho, CAO[kho]);
  await t.datCookie(cookie);
  await t.di(duong);
  await t.cho(`document.querySelector('${moc}') !== null && document.readyState === "complete"`);
  await t.tinh(AN);
  await ngu(1200);
  writeFileSync(ra, await t.chup());
  t.dong();
  console.log(path.basename(ra));
}
const P = `/proto/${SLUG}`;
try {
  for (const loi of ["trong-kho", "reui", "ve-moi"])
    for (const kho of [1440, 375]) await chup(`${P}?loi=${loi}`, `[data-loi="${loi}"]`, path.join(BA_LOI, `${loi}-${kho}.png`), kho);
  for (const [ten, q, kho] of [
    ["loi-mot-phan--desktop-1440", "trang=loi-mot-phan", 1440],
    ["trong--desktop-1440", "trang=trong", 1440],
    ["dau-khach--mobile-375", "vai=dau-khach", 375],
    ["telesales--mobile-375", "vai=telesales", 375],
  ])
    await chup(`${P}?${q}`, `[data-loi="trong-kho"]`, path.join(DP, `${ten}--dark.png`), kho);
  // Vật thật đang có: /today của người đủ vai (phải đặt đủ vai cho tài khoản mẫu ở Postgres thử trước khi chụp).
  await chup("/today", `[aria-label="Hôm nay của trưởng nhóm"] main`, path.join(DP, "hien-trang--desktop-1440--dark.png"), 1440);
} finally {
  chrome.dong();
}
