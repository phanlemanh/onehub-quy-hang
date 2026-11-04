// Chụp trang ba lối của màn Nhập Excel (hàng man-nhap-excel) ở khổ 1440 và 375 trên máy dev dãy G (cổng 3493). Dùng lại
// trình duyệt CDP của hồ sơ bang-hang-kieu-sheet (Chrome có sẵn, không playwright). Phiên của người mẫu qua QH_COOKIE.
//   QH_COOKIE='qh.session_token=…' node _acceptance/man-nhap-excel/thu/chup-ba-loi.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = path.join(GOC, "_acceptance/man-nhap-excel/ba-loi");
mkdirSync(RA, { recursive: true });
const cookie = (process.env.QH_COOKIE ?? "").split(";").map((s) => s.trim()).filter(Boolean);
if (!cookie.length) throw new Error("thiếu QH_COOKIE");
const CAO = { 1440: 900, 375: 812 };
const chrome = await moChrome();
try {
  for (const loi of ["trong-kho", "reui", "ve-moi"]) {
    for (const kho of [1440, 375]) {
      const t = await chrome.trang(kho, CAO[kho]);
      await t.datCookie(cookie);
      await t.di(`/proto/man-nhap-excel?loi=${loi}`);
      await t.cho(`document.body.innerText.includes("Mã căn") && document.readyState === "complete"`);
      await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
      await new Promise((r) => setTimeout(r, 800));
      writeFileSync(path.join(RA, `${loi}-${kho}.png`), await t.chup());
      t.dong();
      console.log(`${loi}-${kho}.png`);
    }
  }
} finally {
  chrome.dong();
}
