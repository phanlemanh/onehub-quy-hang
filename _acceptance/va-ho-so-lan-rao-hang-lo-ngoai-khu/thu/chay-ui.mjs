// Phép nhìn màn E3 (chạy dung.mjs trước): mở hồ sơ hàng lô và hàng ngoài khu từ Bảng hàng theo ?hang=, bấm lần rao trong «Các lần
// rao», đọc lại. In một dòng JSON e3 và chụp ảnh. Chrome không đầu qua CDP của hồ sơ bang-hang-kieu-sheet.
//   node _acceptance/va-ho-so-lan-rao-hang-lo-ngoai-khu/thu/chay-ui.mjs --ra <thư mục>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3496";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/va-ho-so-lan-rao-hang-lo-ngoai-khu/evidence");
mkdirSync(RA, { recursive: true });
const phien = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/bang-hang-theo-loai-hinh/phien.json"), "utf8"));
const dung = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/va-ho-so-lan-rao-hang-lo-ngoai-khu/dung.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const TT = `[data-vung="cot-phu"] [data-muc="thuoc-tinh"]`;
const chrome = await moChrome();
const doc = (t) => t.tinh(`JSON.stringify({ tieuDe: document.querySelector('[data-vung="cot-phu"]')?.innerText.split("\\n")[0] ?? null, thay: !!document.querySelector('${TT}'), url: location.search })`).then(JSON.parse);
async function ca(ten, id) {
  const t = await chrome.trang(1440, 900);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: `try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}` });
  for (const c of phien.cookie.split(";").map((s) => s.trim()).filter(Boolean)) {
    const [name, ...v] = c.split("=");
    await t.gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
  }
  await t.gui("Page.navigate", { url: `${URL_GOC}/inventory?hang=${id}` });
  await t.cho(`!!document.querySelector('${TT}')`, 180000);
  await ngu(1500);
  const truocBam = await doc(t);
  const r = JSON.parse(await t.tinh(`JSON.stringify((() => { const a = [...document.querySelectorAll('[data-vung="cot-phu"] a')].find((e) => /Lần 1/.test(e.textContent)); if (!a) return null; a.scrollIntoView(); const b = a.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, href: a.getAttribute("href") }; })())`));
  if (!r) throw new Error(`${ten}: không thấy link lần rao`);
  await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x: r.x, y: r.y });
  for (const type of ["mousePressed", "mouseReleased"]) await t.gui("Input.dispatchMouseEvent", { type, x: r.x, y: r.y, button: "left", buttons: type === "mousePressed" ? 1 : 0, clickCount: 1 });
  await ngu(2500);
  const sauBam = await doc(t);
  writeFileSync(path.join(RA, `E3-${ten === "lo" ? "lo" : "ngoai-khu"}.png`), await t.chup());
  return { id, href: r.href, truocBam, sauBam };
}
const e3 = { lo: await ca("lo", dung.lo), ngoaiKhu: await ca("ngoaiKhu", dung.ngoaiKhu) };
console.log(JSON.stringify({ e3 }));
process.exit(0);
