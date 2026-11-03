// Chụp ảnh chuẩn của bảng thẻ (dòng «Khối đã chuyển thể» ở catalog.md) ở khổ 375 (giao diện của tài khoản mẫu) trên chỗ thử dãy B.
// Dùng lại trình duyệt CDP của hồ sơ bang-hang-kieu-sheet (Chrome có sẵn, không playwright), trỏ sang máy dev 3492.
//   node _acceptance/bang-hang-dang-the/thu/chup.mjs      (cần dung-b.mjs đã chạy)
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CHAY, GOC, URL_GOC, cookieCua } from "./phien.mjs";

process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");

const RA = path.join(GOC, "_acceptance/bang-hang-dang-the/evidence/chuan");
mkdirSync(RA, { recursive: true });
mkdirSync(CHAY, { recursive: true });
const cookie = await cookieCua("dau-khach@mau.quy-hang.test");
const chrome = await moChrome();
try {
  for (const toi of [false]) {
    const t = await chrome.trang(375, 812);
    await t.datCookie(cookie);
    if (toi) await t.gui("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
    await t.di("/inventory");
    await t.cho("document.querySelectorAll('[data-the-can] img').length >= 3 && [...document.querySelectorAll('[data-the-can] img')].slice(0, 3).every((i) => i.complete && i.naturalWidth > 0)");
    await new Promise((r) => setTimeout(r, 500));
    const tep = path.join(RA, "the-375.png");
    writeFileSync(tep, await t.chup());
    console.log(`chụp ${path.relative(GOC, tep)}`);
    t.dong();
  }
} finally {
  chrome.dong();
}
