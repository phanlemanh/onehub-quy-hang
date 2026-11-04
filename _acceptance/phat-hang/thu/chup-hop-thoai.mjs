// Chụp hộp thoại Xuất bảng hàng (hàng 43) ở khổ 1440 làm ảnh chuẩn của khối dialog-5 đã chuyển thể (dòng catalog.md, ảnh ở _acceptance/phat-hang/anh-chuan/),
// trên máy dev dãy H (dựng bằng dung-h.mjs). Đầu chủ mẫu mở /inventory?phat-hang=1, chụp bước 1 và bước 3.
//   node _acceptance/phat-hang/thu/chup-hop-thoai.mjs [--ra <thư mục>]
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3494";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { values: a } = parseArgs({ options: { ra: { type: "string" } } });
const RA = path.resolve(GOC, a.ra ?? "_acceptance/phat-hang/anh-chuan");
mkdirSync(RA, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const o = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/phat-hang/thu/dung-h.mjs"), "--phien", "dau-chu-1@mau.quy-hang.test", "--moi"], { cwd: GOC }).toString());
const chrome = await moChrome();
try {
  const t = await chrome.trang(1440, 900);
  await t.datCookie(o.cookie.map((c) => `${c.name}=${c.value}`));
  await t.di("/inventory");
  const NUT = `[...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "Xuất bảng hàng")`;
  await t.cho(`(() => { const b = ${NUT}; return !!b && !b.disabled; })()`, 240000);
  // Trang có thể vẽ lại một lượt sau lần kéo đầu của bộ đồng bộ: bấm tới khi hộp thoại mở, tối đa mười lần.
  for (let i = 0; i < 10; i++) {
    await t.tinh(`(() => { const b = ${NUT}; if (b && !b.disabled) b.click(); return true; })()`).catch(() => {});
    await ngu(1500);
    if (await t.tinh(`document.querySelector('[role="dialog"]') !== null`).catch(() => false)) break;
  }
  await t.cho(`document.querySelector('[role="dialog"]') !== null`, 5000);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; (document.head ?? document.documentElement).appendChild(s); return true; })()`);
  await ngu(1200);
  writeFileSync(path.join(RA, "hop-thoai-buoc-1-1440.png"), await t.chup());
  console.log(JSON.stringify({ buoc1: await t.tinh(`document.querySelector('[role="dialog"]').innerText.slice(0, 400)`) }));
  for (let i = 0; i < 2; i++) {
    await t.tinh(`(() => { const b = [...document.querySelectorAll('[role="dialog"] button')].find((x) => x.innerText.trim() === "Tiếp"); if (b) b.click(); return !!b; })()`);
    await ngu(800);
  }
  await ngu(800);
  writeFileSync(path.join(RA, "hop-thoai-buoc-3-1440.png"), await t.chup());
  console.log(JSON.stringify({ buoc3: await t.tinh(`document.querySelector('[role="dialog"]').innerText.slice(0, 600)`) }));
  t.dong();
} finally {
  chrome.dong();
}
