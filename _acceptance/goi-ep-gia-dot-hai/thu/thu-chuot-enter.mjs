// Thử tay: bấm chuột «Giữ giá» rồi Enter trên chế độ ép giá phải ghi «Còn · giữ giá» (đúng một owner_confirmed), không bỏ chọn.
//   QH_B_URL=http://localhost:3485 node --env-file=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/thu-chuot-enter.mjs <mã hồ sơ>
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GOC, moChrome } from "../../bang-hang-kieu-sheet/thu/cdp.mjs";

const [hang] = process.argv.slice(2);
const TEP_PHIEN = path.join(GOC, ".acceptance-runs/goi-ep-gia-dot-hai/phien-dau-chu-1.json");
if (!existsSync(TEP_PHIEN)) {
  const ra = execFileSync(process.execPath, ["--env-file=.env.local", "--import", "tsx", "_acceptance/cuoc-goi-khai-thac/thu/phien.mts", "dau-chu-1@mau.quy-hang.test"], { cwd: GOC, encoding: "utf8" });
  mkdirSync(path.dirname(TEP_PHIEN), { recursive: true });
  writeFileSync(TEP_PHIEN, ra.trim().split("\n").at(-1));
}
const phien = JSON.parse(readFileSync(TEP_PHIEN, "utf8"));
const chrome = await moChrome();
try {
  const t = await chrome.trang(1440, 1000);
  await t.datCookie([`${phien.name}=${phien.value}`, `qh_san=${phien.qh_san}`]);
  await t.di(`/units/call?hang=${hang}`);
  await t.cho(`document.querySelector('[aria-label="Kết quả cuộc gọi"] [data-slot="toggle-group-item"]') !== null`);
  // Bấm chuột thật trên nút «Giữ giá» (con trỏ vào nút), rồi Enter.
  await t.tinh(`(() => { const b = [...document.querySelectorAll('[aria-label="Kết quả cuộc gọi"] [data-slot="toggle-group-item"]')].find((x) => x.innerText.includes("Giữ giá")); b.focus(); b.click(); return true; })()`);
  await t.tinh(`document.activeElement.innerText`);
  await t.tinh(`(() => { const el = document.activeElement; for (const type of ["keydown", "keyup"]) el.dispatchEvent(new KeyboardEvent(type, { key: "Enter", bubbles: true, cancelable: true })); return true; })()`);
  await t.cho(`document.body.innerText.includes("Đã ghi: Còn · giữ giá")`, 10000);
  console.log("đạt: Enter sau khi bấm chuột ghi «Còn · giữ giá»");
} finally {
  chrome.dong();
}
