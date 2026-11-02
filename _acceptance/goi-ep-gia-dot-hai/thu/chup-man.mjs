// Chụp chế độ cuộc gọi trên máy dev dãy D (cổng 3485): ép giá (`?hang=`) và khai thác (`?lead=`) trên bố cục Hồ sơ × hai
// khổ, và một khung ép giá đã chọn «Hạ giá». Phiên lấy bằng lệnh cấp phiên thử của hàng 28 (không đọc nhật ký máy chủ).
//   QH_B_URL=http://localhost:3485 node --env-file=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/chup-man.mjs <mã hồ sơ> [mã lead]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GOC, moChrome } from "../../bang-hang-kieu-sheet/thu/cdp.mjs";

const [hang, lead] = process.argv.slice(2);
if (!hang) throw new Error("thiếu mã hồ sơ");
const DICH = path.join(GOC, ".acceptance-runs/goi-ep-gia-dot-hai/chup");
mkdirSync(DICH, { recursive: true });
// Phiên giữ ở .acceptance-runs (máy chủ giới hạn số lần gửi mã); hết hạn thì xoá tệp để cấp lại.
const TEP_PHIEN = path.join(GOC, ".acceptance-runs/goi-ep-gia-dot-hai/phien-dau-chu-1.json");
if (!existsSync(TEP_PHIEN)) {
  const ra = execFileSync(process.execPath, ["--env-file=.env.local", "--import", "tsx", "_acceptance/cuoc-goi-khai-thac/thu/phien.mts", "dau-chu-1@mau.quy-hang.test"], { cwd: GOC, encoding: "utf8" });
  mkdirSync(path.dirname(TEP_PHIEN), { recursive: true });
  writeFileSync(TEP_PHIEN, ra.trim().split("\n").at(-1));
}
const phien = JSON.parse(readFileSync(TEP_PHIEN, "utf8"));
const cookie = [`${phien.name}=${phien.value}`, `qh_san=${phien.qh_san}`];
const chrome = await moChrome();
const MAN = [["ep-gia", `/units/call?hang=${hang}`, `document.querySelector('[aria-label="Căn đang gọi"]') !== null`]];
if (lead) MAN.push(["khai-thac", `/units/call?lead=${lead}`, `document.querySelector('[data-bo-cuc="ho-so"]') !== null`]);
try {
  for (const [ten, duong, san] of MAN) {
    for (const [rong, cao] of [[1440, 1000], [375, 812]]) {
      const t = await chrome.trang(rong, cao);
      await t.datCookie(cookie);
      await t.di(duong);
      await t.cho(san);
      await t.cho(`!document.body.innerText.includes("Đang tải lịch sử")`, 10000).catch(() => undefined);
      const tep = path.join(DICH, `${ten}-${rong}.png`);
      writeFileSync(tep, await t.chup());
      console.log(`${ten} · ${rong} → ${path.relative(GOC, tep)}`);
    }
  }
  const t = await chrome.trang(1440, 1000);
  await t.datCookie(cookie);
  await t.di(`/units/call?hang=${hang}`);
  await t.cho(MAN[0][2]);
  await t.tinh(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "h" })), true`);
  await t.cho(`document.querySelector('[data-o="gia-moi"]') !== null`);
  const tep = path.join(DICH, "ep-gia-ha-gia-1440.png");
  writeFileSync(tep, await t.chup());
  console.log(`ép giá · hạ giá → ${path.relative(GOC, tep)}`);
} finally {
  chrome.dong();
}
