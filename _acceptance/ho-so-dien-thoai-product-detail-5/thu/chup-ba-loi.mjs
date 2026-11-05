// Chụp trang ba lối «Hồ sơ căn trên điện thoại» ở 375 rộng, trọn trang, bằng Chrome không đầu (cdp.mjs của
// bang-hang-kieu-sheet). Máy dev dãy H dựng bằng dung-h.mjs cạnh tệp này. Người mẫu đầu khách; vai của nút chính đổi
// bằng `?vai=` của trang.
//   node _acceptance/ho-so-dien-thoai-product-detail-5/thu/chup-ba-loi.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.QH_B_URL = "http://localhost:3494";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = path.join(GOC, "_acceptance/ho-so-dien-thoai-product-detail-5/ba-loi");
mkdirSync(RA, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const UA_DT = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const { cookie } = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/ho-so-dien-thoai-product-detail-5/thu/dung-h.mjs"), "--phien", "dau-khach@mau.quy-hang.test"], { cwd: GOC }).toString());

const CANH = [
  ["trong-kho-375.png", "trong-kho", "dau-khach"],
  ["reui-375.png", "reui", "dau-khach"],
  ["ve-moi-375.png", "ve-moi", "dau-khach"],
  ["reui-375-dau-chu.png", "reui", "dau-chu"],
];
const chrome = await moChrome();
try {
  for (const [ten, loi, vai] of CANH) {
    const t = await chrome.trang(375, 812);
    await t.gui("Emulation.setUserAgentOverride", { userAgent: UA_DT, platform: "iPhone" });
    await t.gui("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await t.gui("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
    await t.datCookie(cookie);
    await t.di(`/proto/ho-so-dien-thoai?loi=${loi}&vai=${vai}`);
    await t.cho(`document.querySelector('[data-loi="${loi}"][data-vai="${vai}"]') && document.fonts.status === "loaded"`, 120000);
    await ngu(1500);
    // Nút chỉ báo của máy dev Next không thuộc màn.
    await t.tinh(`document.querySelectorAll("nextjs-portal").forEach((e) => e.remove())`);
    // Trọn trang: vỏ cuộn trong một vùng cao bằng khung nhìn — nới khung nhìn thêm phần tràn của vùng cuộn tới khi hết tràn.
    const tran = `Math.max(0, ...[...document.querySelectorAll("*")].filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY)).map((e) => e.scrollHeight - e.clientHeight), document.documentElement.scrollHeight - innerHeight)`;
    let cao = 812;
    for (let i = 0; i < 6; i++) {
      const them = await t.tinh(tran);
      if (them <= 1) break;
      cao += them;
      await t.gui("Emulation.setDeviceMetricsOverride", { width: 375, height: cao, deviceScaleFactor: 1, mobile: true });
      await ngu(600);
    }
    const chu = await t.tinh(`document.querySelector('[data-slot="nut-chinh"]')?.innerText ?? null`);
    writeFileSync(path.join(RA, ten), await t.chup());
    console.log(JSON.stringify({ ten, loi, vai, cao, nutChinh: chu }));
    t.dong();
  }
} finally {
  chrome.dong();
}
