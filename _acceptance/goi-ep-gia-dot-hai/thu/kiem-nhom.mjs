// Kiểm trước lượt chấm: các căn P của lượt dựng mới nhất có ở nhóm «Nên gọi điều chỉnh giá» trên Hôm nay của dau-chu-1 không.
//   QH_B_URL=http://localhost:3485 node --env-file=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/kiem-nhom.mjs A-23.04 A-23.08
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GOC, moChrome } from "../../bang-hang-kieu-sheet/thu/cdp.mjs";

const can = process.argv.slice(2);
// Phiên giữ ở .acceptance-runs (máy chủ giới hạn số lần gửi mã); hết hạn thì xoá tệp để cấp lại.
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
  await t.di("/today");
  await t.cho(`document.body.innerText.includes("Nên gọi điều chỉnh giá")`);
  await t.cho(`document.body.innerText.includes(${JSON.stringify(can[0] ?? "")})`, 15000).catch(() => undefined);
  const nhom = await t.tinh(`(() => { const t = document.body.innerText; const i = t.indexOf("Nên gọi điều chỉnh giá"); const j = t.indexOf("Cần gọi lại", i); return t.slice(i, j < 0 ? i + 4000 : j); })()`);
  if (process.env.IN) console.log(nhom.slice(0, 1500));
  for (const c of can) console.log(`${c}: ${nhom.includes(c) ? "có" : "KHÔNG"} ở nhóm «Nên gọi điều chỉnh giá»`);
} finally {
  chrome.dong();
}
