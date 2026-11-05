// Chụp bản bấm được «Chụp ảnh khi đi xem nhà» (hàng 41) ngay trên hồ sơ căn điện thoại thật, 375×812, bằng Chrome không đầu
// (cdp.mjs của bang-hang-kieu-sheet). Máy dev dãy H dựng bằng _acceptance/ho-so-dien-thoai-product-detail-5/thu/dung-h.mjs
// (Postgres 5574, dev 3494) và tắt bằng `--tat` của chính lệnh ấy. Người mẫu đầu chủ giữ căn; ảnh là PNG khối màu vẽ bằng mã
// (packages/db/seed/anh-mau.mjs) — không dữ liệu thật.
//   node _acceptance/chup-anh-dien-thoai/thu/chup-design-pass.mjs [--ma A-01.02]
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3494";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const { anhMau } = await import("../../../packages/db/seed/anh-mau.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = path.join(GOC, "_acceptance/chup-anh-dien-thoai/design-pass");
mkdirSync(RA, { recursive: true });
const { values: a } = parseArgs({ options: { ma: { type: "string", default: "A-01.02" } } });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const UA_DT = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const tam = mkdtempSync(path.join(os.tmpdir(), "qh-chup-anh-"));
const tep = [41, 42, 43].map((i) => {
  const f = path.join(tam, `anh-${i}.png`);
  writeFileSync(f, anhMau(i).goc);
  return f;
});
const { cookie } = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/ho-so-dien-thoai-product-detail-5/thu/dung-h.mjs"), "--phien", "dau-chu-1@mau.quy-hang.test"], { cwd: GOC }).toString());

const chrome = await moChrome();
try {
  const t = await chrome.trang(375, 812);
  await t.gui("DOM.enable");
  await t.gui("Emulation.setUserAgentOverride", { userAgent: UA_DT, platform: "iPhone" });
  await t.gui("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await t.gui("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await t.datCookie(cookie);
  await t.di(`/units/${a.ma}`);
  await t.cho(`document.querySelector('[data-nut="chup-anh"]') && document.fonts.status === "loaded"`, 180000);
  await ngu(1500);
  const chup = async (ten) => {
    await t.tinh(`document.querySelectorAll("nextjs-portal").forEach((e) => e.remove())`);
    await ngu(400);
    writeFileSync(path.join(RA, ten), await t.chup());
    const ds = await t.tinh(`[...document.querySelectorAll("[data-cho]")].map((e) => e.dataset.cho)`);
    console.log(JSON.stringify({ ten, cho: ds }));
  };
  const bam = (sel) => t.tinh(`document.querySelector(${JSON.stringify(sel)}).click()`);
  const napTep = async (files) => {
    const { root } = await t.gui("DOM.getDocument", { depth: -1, pierce: true });
    const { nodeId } = await t.gui("DOM.querySelector", { nodeId: root.nodeId, selector: 'input[data-o="may-anh"]' });
    await t.gui("DOM.setFileInputFiles", { nodeId, files });
  };

  await chup("ho-so-truoc.png");
  // Nút có từ bản dựng sẵn của máy chủ — bấm lại tới khi trang đã nhận sự kiện và ngăn mở.
  for (let i = 0; i < 20 && !(await t.tinh(`!!document.querySelector('[data-slot="khay-chup"]')`)); i++) {
    await bam('[data-nut="chup-anh"]');
    await ngu(1000);
  }
  await ngu(800);
  await chup("chon-ngan.png");

  // Mất mạng: hai ảnh Gửi được rồi một ảnh sổ vào Nội bộ — cả ba chờ trên máy.
  await t.gui("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await t.cho(`!navigator.onLine`);
  await napTep([tep[0]]);
  await t.cho(`document.querySelectorAll('[data-cho="cho-mang"]').length === 1`);
  await napTep([tep[1]]);
  await t.cho(`document.querySelectorAll('[data-cho="cho-mang"]').length === 2`);
  await bam('[data-o="chon-ngan"] [value="internal"], [data-o="chon-ngan"] button:nth-child(2)');
  await ngu(300);
  await napTep([tep[2]]);
  await t.cho(`document.querySelectorAll('[data-cho="cho-mang"]').length === 3`);
  await chup("cho-mang.png");

  // Có mạng lại: hàng chờ tự tải theo thứ tự chụp.
  await t.gui("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await t.cho(`document.querySelectorAll('[data-cho="da-tai"]').length === 3`, 60000);
  await chup("da-tai.png");
  await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await t.cho(`!document.querySelector('[data-slot="khay-chup"]')`);
  await t.cho(`document.querySelectorAll('[data-khoi="anh"] figure').length >= 3`, 30000);
  await ngu(1000);
  await chup("da-tai-anh-lon.png");
  t.dong();
} finally {
  chrome.dong();
}
