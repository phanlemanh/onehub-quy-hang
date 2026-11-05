// Chụp lại bốn ảnh chuẩn của bố cục Danh sách – chi tiết (hàng 105: chi tiết nay là cột kéo chia) từ trang mẫu sống, cùng
// địa chỉ, khổ và giao diện như `_acceptance/he-bo-cuc/thu/chup-anh-chuan.cjs` (hàng 91) — bằng Chrome không đầu qua CDP
// (kho không có playwright ở main), trên máy dev của dung-d.mjs (cổng 3477). Ghi lại commit ở ke.json cho bốn tấm.
//   node _acceptance/bang-hang-danh-sach-chi-tiet/thu/chup-anh-chuan.mjs
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3477";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DIA_CHI = "/mau/he-bo-cuc/xem?bo-cuc=danh-sach-chi-tiet&trang-thai=mac-dinh";
const CAO = { 1440: 900, 1024: 768, 375: 812 };
const VIEC = [
  { kho: 1440, toi: false, tep: "danh-sach-chi-tiet-1440.png" },
  { kho: 1024, toi: false, tep: "danh-sach-chi-tiet-1024.png" },
  { kho: 375, toi: false, tep: "danh-sach-chi-tiet-375.png" },
  { kho: 1440, toi: true, tep: "danh-sach-chi-tiet-1440-toi.png" },
];
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = await moChrome();
try {
  for (const v of VIEC) {
    const t = await chrome.trang(v.kho, CAO[v.kho]);
    await t.gui("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: v.toi ? "dark" : "light" }] });
    await t.di(DIA_CHI);
    await t.cho(`document.readyState === "complete" && !!document.querySelector("[data-bo-cuc-goc]")`, 120000);
    await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
    await ngu(1500);
    writeFileSync(path.join(GOC, "design/anh-chuan", v.tep), await t.chup());
    const sw = await t.tinh("document.documentElement.scrollWidth");
    console.log(JSON.stringify({ tep: v.tep, cuonNgang: sw > v.kho ? sw : false, coCot: await t.tinh(`!!document.querySelector('[data-vung="cot-phu"]')`) }));
    t.dong();
  }
} finally {
  chrome.dong();
}
const sha = execSync("git rev-parse HEAD", { cwd: GOC }).toString().trim();
const KE = path.join(GOC, "design/anh-chuan/ke.json");
const ke = JSON.parse(readFileSync(KE, "utf8"));
for (const k of ke) if (VIEC.some((v) => v.tep === k.tep)) k.commit = sha;
writeFileSync(KE, JSON.stringify(ke, null, 2) + "\n");
