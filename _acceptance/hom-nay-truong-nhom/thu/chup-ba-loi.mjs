// Chụp trang ba lối Hôm nay của trưởng nhóm (hàng 42) ở khổ 1440 và 375 trên máy dev tạm của dãy D (cổng 3476, Postgres
// dãy D đã nạp sàn mẫu). Đăng nhập tài khoản mẫu trưởng nhóm bằng mã email đọc từ nhật ký máy dev, rồi dùng trình duyệt CDP
// của hồ sơ bang-hang-kieu-sheet (Chrome có sẵn, không playwright).
//   node _acceptance/hom-nay-truong-nhom/thu/chup-ba-loi.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3476";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = path.join(GOC, "_acceptance/hom-nay-truong-nhom/ba-loi");
const LOG = path.join(GOC, ".acceptance-runs/hom-nay-truong-nhom/web-d42.log");
const EMAIL = "truong-nhom@mau.quy-hang.test";
mkdirSync(RA, { recursive: true });
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
const chrome = await moChrome();
try {
  for (const loi of ["trong-kho", "reui", "ve-moi"]) {
    for (const kho of [1440, 375]) {
      const t = await chrome.trang(kho, CAO[kho]);
      await t.datCookie(cookie);
      await t.di(`/proto/hom-nay-truong-nhom?loi=${loi}`);
      await t.cho(`document.querySelector('[data-loi="${loi}"]') !== null && document.readyState === "complete"`);
      await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
      await ngu(800);
      writeFileSync(path.join(RA, `${loi}-${kho}.png`), await t.chup());
      t.dong();
      console.log(`${loi}-${kho}.png`);
    }
  }
} finally {
  chrome.dong();
}
