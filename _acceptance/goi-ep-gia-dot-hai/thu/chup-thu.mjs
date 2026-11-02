// Chụp trang thử chế độ ép giá (hàng 29, design-pass) trên máy dev dãy D (cổng 3485): hai cách xếp của Hỏi-1 × hai khổ, và
// một khung ở trạng thái đã chọn «Hạ giá». Phiên lấy bằng lệnh cấp phiên thử của hàng 28 (không đọc nhật ký máy chủ).
//   QH_B_URL=http://localhost:3485 node --env-file=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/chup-thu.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GOC, moChrome } from "../../bang-hang-kieu-sheet/thu/cdp.mjs";

const DICH = path.join(GOC, "_acceptance/goi-ep-gia-dot-hai/design-pass");
mkdirSync(DICH, { recursive: true });
const phien = JSON.parse(
  execFileSync(process.execPath, ["--env-file=.env.local", "--import", "tsx", "_acceptance/cuoc-goi-khai-thac/thu/phien.mts", "dau-chu-1@mau.quy-hang.test"], { cwd: GOC, encoding: "utf8" })
    .trim()
    .split("\n")
    .at(-1),
);
const cookie = [`${phien.name}=${phien.value}`, `qh_san=${phien.qh_san}`];
const chrome = await moChrome();
try {
  for (const boCuc of ["ho-so", "ba-cot"]) {
    for (const [rong, cao] of [[1440, 1000], [375, 812]]) {
      const t = await chrome.trang(rong, cao);
      await t.datCookie(cookie);
      await t.di(`/proto/goi-ep-gia-dot-hai?bo-cuc=${boCuc}`);
      await t.cho(`document.querySelector('[data-bo-cuc="${boCuc}"]') !== null`);
      const tep = path.join(DICH, `${boCuc}-${rong}.png`);
      writeFileSync(tep, await t.chup());
      console.log(`${boCuc} · ${rong} → ${path.relative(GOC, tep)}`);
    }
  }
  const t = await chrome.trang(1440, 1000);
  await t.datCookie(cookie);
  await t.di("/proto/goi-ep-gia-dot-hai?bo-cuc=ho-so");
  await t.cho(`document.querySelector('[data-bo-cuc="ho-so"]') !== null`);
  await t.tinh(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "h" })), true`);
  await t.cho(`document.body.innerText.includes("Hiểu là 2,72 tỷ")`);
  const tep = path.join(DICH, "ho-so-ha-gia-1440.png");
  writeFileSync(tep, await t.chup());
  console.log(`ho-so · hạ giá → ${path.relative(GOC, tep)}`);
} finally {
  chrome.dong();
}
