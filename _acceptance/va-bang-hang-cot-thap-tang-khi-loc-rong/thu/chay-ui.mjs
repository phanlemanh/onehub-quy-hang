// Phép nhìn màn E5 (chạy dung.mjs trước). Ca 1: gõ giá trị không khớp vào ô Diện tích đất rồi xoá. Ca 2: lọc Đất, gõ ô Giá không khớp.
// In một dòng JSON và chụp ảnh. Chrome không đầu qua CDP.
//   node _acceptance/va-bang-hang-cot-thap-tang-khi-loc-rong/thu/chay-ui.mjs --ra <thư mục>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3496";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/va-bang-hang-cot-thap-tang-khi-loc-rong/evidence");
mkdirSync(RA, { recursive: true });
const cookie = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/bang-hang-theo-loai-hinh/phien.json"), "utf8")).cookie;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = await moChrome();
const LUOI = `!!document.querySelector('[data-slot=data-grid] tbody [data-slot=row-number]')`;

async function mo() {
  const t = await chrome.trang(1440, 900);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: `try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}` });
  for (const c of cookie.split(";").map((s) => s.trim()).filter(Boolean)) {
    const [name, ...v] = c.split("=");
    await t.gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
  }
  await t.gui("Page.navigate", { url: `${URL_GOC}/inventory` });
  await t.cho(LUOI, 180000);
  await ngu(1500);
  return t;
}
const bam = async (t, p) => {
  await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y });
  for (const type of ["mousePressed", "mouseReleased"]) await t.gui("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", buttons: type === "mousePressed" ? 1 : 0, clickCount: 1 });
};
const toaDo = (t, bt) => t.tinh(`JSON.stringify((() => { const e = ${bt}; if (!e) return null; e.scrollIntoView({ block: "nearest", inline: "center" }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })())`).then(JSON.parse);
const nutLoc = `[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Lọc")`;
const oSo = (nhan) => `document.querySelector('input[aria-label="Lọc ${nhan} theo luật số"]')`;
const anh = async (t, ten) => writeFileSync(path.join(RA, ten), await t.chup());
const trangThai = (t, o) =>
  t.tinh(`JSON.stringify((() => {
    const ra = {};
    ra.soDong = document.querySelectorAll("[data-slot=data-grid] tbody [data-slot=row-number]").length;
    const oLoc = ${o ? oSo(o) : "null"};
    ra.oLoc = oLoc ? oLoc.value : null;
    ra.focus = document.activeElement?.getAttribute("aria-label") ?? null;
    const bao = [...document.querySelectorAll("[data-slot=data-grid] tbody *")].filter((e) => e.children.length === 0).find((e) => /Không căn nào khớp bộ lọc/.test(e.textContent));
    if (bao) { const r = bao.getBoundingClientRect(); ra.baoRong = { chu: bao.textContent.trim().slice(0, 80), trongKhung: r.top >= 0 && r.bottom <= innerHeight }; }
    return ra;
  })())`).then(JSON.parse);
/** Lưới chỉ dựng cột trong tầm nhìn: đọc tiêu đề ở đầu cuộn ngang, nên mỗi lần đọc so được với nhau. Đọc xong con trỏ có thể rời ô. */
const docCot = async (t) => {
  await t.tinh(`(() => { const v = document.querySelector('[data-slot=data-grid] [data-slot="scroll-area-viewport"]') ?? document.querySelector('[data-slot="scroll-area-viewport"]'); if (v) v.scrollLeft = 0; return 1; })()`);
  await ngu(500);
  return t.tinh(`JSON.stringify([...document.querySelectorAll("[data-slot=data-grid] thead tr:first-child th")].map((e) => e.textContent.trim()).filter(Boolean))`).then(JSON.parse);
};
const go = async (t, chu) => {
  await t.gui("Input.insertText", { text: chu });
  await ngu(900);
};
async function xoaHet(t, soKyTu) {
  for (let i = 0; i < soKyTu; i++) {
    await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
    await t.gui("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
    await ngu(80);
  }
  await ngu(900);
}

// Ca 1.
const t1 = await mo();
await bam(t1, await toaDo(t1, nutLoc));
await ngu(700);
const truoc = { ...(await trangThai(t1, "Diện tích đất")), cot: await docCot(t1) };
await bam(t1, await toaDo(t1, oSo("Diện tích đất")));
const GO = ">99999999";
await go(t1, GO);
const rong = await trangThai(t1, "Diện tích đất");
await anh(t1, "E5-rong.png");
rong.cot = await docCot(t1);
await bam(t1, await toaDo(t1, oSo("Diện tích đất")));
await ngu(300);
await xoaHet(t1, GO.length);
const sau = { ...(await trangThai(t1, "Diện tích đất")), cot: await docCot(t1) };
await anh(t1, "E5-sau.png");

// Ca 2: lọc Đất rồi gõ ô Giá không khớp.
const t2 = await mo();
await bam(t2, await toaDo(t2, nutLoc));
await ngu(700);
await bam(t2, await toaDo(t2, `document.querySelector('[aria-label="Lọc Loại hình"]')`));
await ngu(700);
await bam(t2, await toaDo(t2, `[...document.querySelectorAll('[role=option]')].find((e) => e.textContent.trim() === "Đất")`));
await ngu(1200);
const truoc2 = { ...(await trangThai(t2, "Giá")), cot: await docCot(t2) };
await bam(t2, await toaDo(t2, oSo("Giá")));
await go(t2, ">999999999");
const rong2 = await trangThai(t2, "Giá");
await anh(t2, "E5-cot-chung.png");
rong2.cot = await docCot(t2);

console.log(JSON.stringify({ ca1: { truoc, rong, sau }, ca2: { truoc: truoc2, rong: rong2 } }));
process.exit(0);
