// Chụp sáu ảnh trang ba lối hàng 28 (ba lối × 1440, 375) trên máy dev dãy D (cổng 3485). Đăng nhập người mẫu
// dau-chu-1 bằng mã email in ở nhật ký máy dev: chạy `--xin` để máy dev in mã, đọc mã ở nhật ký, rồi `--ma <mã>` để
// đăng nhập và chụp. Phiên giữ ở .acceptance-runs/cuoc-goi-khai-thac/ và dùng lại khi còn sống.
//   QH_B_URL=http://localhost:3485 node _acceptance/cuoc-goi-khai-thac/thu/chup-ba-loi.mjs --xin
//   QH_B_URL=http://localhost:3485 node _acceptance/cuoc-goi-khai-thac/thu/chup-ba-loi.mjs --ma 123456
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { GOC, moChrome, URL_GOC } from "../../bang-hang-kieu-sheet/thu/cdp.mjs";

const EMAIL = "dau-chu-1@mau.quy-hang.test";
const HS = path.join(GOC, "_acceptance/cuoc-goi-khai-thac");
const GIU = path.join(GOC, ".acceptance-runs/cuoc-goi-khai-thac/phien-dau-chu-1.json");
const { values } = parseArgs({ options: { xin: { type: "boolean" }, ma: { type: "string" } } });
const h = { "content-type": "application/json", origin: URL_GOC };

if (values.xin) {
  const r = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email: EMAIL, type: "sign-in" }) });
  console.log(`xin mã ${EMAIL}: ${r.status} — đọc mã ở nhật ký máy dev ([ma-dang-nhap])`);
  process.exit(r.ok ? 0 : 1);
}

async function phien() {
  if (existsSync(GIU)) {
    const c = JSON.parse(readFileSync(GIU, "utf8"));
    if ((await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: c.join("; ") } })).status === 200) return c;
  }
  if (!values.ma) throw new Error("chưa có phiên còn sống — chạy --xin rồi --ma <mã>");
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email: EMAIL, otp: values.ma }) });
  if (r.status !== 200) throw new Error(`đăng nhập: ${r.status}`);
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  const me = await (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: ck.join("; ") } })).json();
  const c = me.companies.length < 2 ? ck : [...ck, `qh_san=${me.companies.find((x) => x.name === "[Mẫu] Sàn thử").id}`];
  mkdirSync(path.dirname(GIU), { recursive: true });
  writeFileSync(GIU, JSON.stringify(c));
  return c;
}

const cookie = await phien();
const chrome = await moChrome();
try {
  for (const loi of ["trong-kho", "reui", "ve-moi"]) {
    for (const [rong, cao] of [[1440, 1000], [375, 812]]) {
      const t = await chrome.trang(rong, cao);
      await t.datCookie(cookie);
      await t.di(`/proto/cuoc-goi-khai-thac?loi=${loi}`);
      await t.cho(`document.querySelector('[data-loi="${loi}"]') !== null`);
      const tep = path.join(HS, "ba-loi", `${loi}-${rong}.png`);
      writeFileSync(tep, Buffer.from(await t.chup(), "base64"));
      console.log(`${loi} · ${rong} → ${path.relative(GOC, tep)}`);
    }
  }
} finally {
  chrome.dong();
}
