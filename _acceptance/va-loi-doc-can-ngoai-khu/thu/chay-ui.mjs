// Phép nhìn màn E6 (chạy dung.mjs trước). Ngắt mạng thật bằng Network.setBlockedURLs; ca 500 và làm chậm dựng ở lớp fetch của trang.
// In một dòng JSON và chụp ảnh. Chrome không đầu qua CDP.
//   node _acceptance/va-loi-doc-can-ngoai-khu/thu/chay-ui.mjs --ra <thư mục>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3496";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/va-loi-doc-can-ngoai-khu/evidence");
mkdirSync(RA, { recursive: true });
const cookie = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/bang-hang-theo-loai-hinh/phien.json"), "utf8")).cookie;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = await moChrome();
const LUOI = `!!document.querySelector('[data-slot=data-grid] tbody [data-slot=row-number]')`;
const NGOAI_KHU = "*/api/v1/off-compound-units*";
const DANH_BA = "*/api/v1/company/member-names*";
const API_NK = "/api/v1/off-compound-units";

// Căn ngoài khu dựng bằng đường ghi thật của chỗ thử: đọc thẳng từ máy chủ, ngoài trang.
const CAN = (await (await fetch(`${URL_GOC}${API_NK}`, { headers: { cookie } })).json()).units;
const NHAN = { Townhouse: "Nhà phố", "Single Family Residence": "Biệt thự", "Unimproved Land": "Đất", Condominium: "Căn hộ" };

const LOP_FETCH = `(() => {
  try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}
  if (!sessionStorage.getItem("__daXoa")) {
    for (const k of Object.keys(localStorage)) if (k.startsWith("qh:can-ngoai-khu:")) localStorage.removeItem(k);
    sessionStorage.setItem("__daXoa", "1");
  }
  const goc = window.fetch;
  window.__dem = { ngoaiKhu: 0, danhBa: 0 };
  window.__tre = 0;
  window.fetch = async function (u) {
    const s = String(u?.url ?? u);
    const nk = s.includes("${API_NK}");
    if (nk) window.__dem.ngoaiKhu++;
    if (s.includes("/api/v1/company/member-names")) window.__dem.danhBa++;
    if (nk && window.__tre) await new Promise((r) => setTimeout(r, window.__tre));
    if (nk && sessionStorage.getItem("__tra500")) return new Response("{}", { status: 500 });
    return goc.apply(this, arguments);
  };
})();`;

async function mo({ chan = [], tra500 = false } = {}) {
  const t = await chrome.trang(1440, 900);
  await t.gui("Network.enable", {});
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: LOP_FETCH });
  if (tra500) await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: `sessionStorage.setItem("__tra500", "1");` });
  for (const c of cookie.split(";").map((s) => s.trim()).filter(Boolean)) {
    const [name, ...v] = c.split("=");
    await t.gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
  }
  await t.gui("Network.setBlockedURLs", { urls: chan });
  await t.gui("Page.navigate", { url: `${URL_GOC}/inventory` });
  await t.cho(LUOI, 180000);
  await ngu(2500);
  return t;
}
const anh = async (t, ten) => writeFileSync(path.join(RA, ten), await t.chup());
const NUT = `(() => { const b = [...document.querySelectorAll("[role=alert]")].find((e) => /Chưa đọc được/.test(e.textContent)); return b ? [...b.querySelectorAll("button")].find((x) => x.textContent.trim() === "Thử lại") : null; })()`;
async function bamThuLai(t) {
  const p = JSON.parse(await t.tinh(`JSON.stringify((() => { const e = ${NUT}; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })())`));
  if (!p) throw new Error("không thấy nút Thử lại");
  await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y });
  for (const type of ["mousePressed", "mouseReleased"]) await t.gui("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", buttons: type === "mousePressed" ? 1 : 0, clickCount: 1 });
}
const bao = (t) =>
  t.tinh(`JSON.stringify((() => {
    const bs = [...document.querySelectorAll("[role=alert]")].filter((e) => /Chưa đọc được/.test(e.textContent));
    const b = bs[0];
    if (!b) return { soBao: 0, bao: null, nutThuLai: 0 };
    const r = b.getBoundingClientRect();
    return { soBao: bs.length, bao: b.textContent.replace("Thử lại", "").trim(), nutThuLai: [...b.querySelectorAll("button")].filter((x) => x.textContent.trim() === "Thử lại").length, trongKhung: r.top >= 0 && r.bottom <= innerHeight };
  })())`).then(JSON.parse);
const dem = (t) => t.tinh(`JSON.stringify(window.__dem)`).then(JSON.parse);
/** Lưới ảo: cuộn từ đầu tới cuối, gom chữ từng hàng theo số thứ tự. */
async function quetHang(t) {
  const ds = JSON.parse(
    await t.tinh(`(async () => {
      const v = document.querySelector('[data-slot=data-grid] [data-slot="scroll-area-viewport"]') ?? document.querySelector('[data-slot="scroll-area-viewport"]');
      const gom = new Map();
      const doc = () => { for (const tr of document.querySelectorAll("[data-slot=data-grid] tbody tr")) { const so = tr.querySelector("[data-slot=row-number]"); if (so) gom.set(so.textContent.trim(), tr.textContent); } };
      v.scrollTop = 0;
      for (let i = 0; i < 400; i++) { await new Promise((r) => setTimeout(r, 120)); doc(); if (v.scrollTop + v.clientHeight >= v.scrollHeight - 2) break; v.scrollTop += Math.max(200, v.clientHeight - 80); }
      await new Promise((r) => setTimeout(r, 120)); doc(); v.scrollTop = 0;
      return JSON.stringify([...gom.values()]);
    })()`),
  );
  const dongCua = CAN.map((c) => ds.find((x) => x.includes(c.unparsedAddress)) ?? null);
  return {
    soDong: ds.length,
    chuaRo: ds.filter((x) => x.includes("Chưa rõ")).length,
    coDiaChi: dongCua.filter(Boolean).length,
    dong: CAN.map((c, i) => ({ dia_chi: c.unparsedAddress, loai: NHAN[c.propertySubType], thay: !!dongCua[i], dung_loai: !!dongCua[i]?.includes(NHAN[c.propertySubType]) })),
  };
}
const banGiu = (t) => t.tinh(`Object.keys(localStorage).some((k) => k.startsWith("qh:can-ngoai-khu:") && JSON.parse(localStorage.getItem(k)).length > 0)`);
const trangThaiMayChu = (t) => t.tinh(`performance.getEntriesByType("resource").filter((e) => e.name.includes("${API_NK}")).at(-1)?.responseStatus ?? null`);

const ra = { so_can: CAN.length };
// Ca 1: ngắt mạng danh sách căn ngoài khu.
{
  const t = await mo({ chan: [NGOAI_KHU] });
  const dau = { ...(await bao(t)), ...(await quetHang(t)) };
  await anh(t, "E6-bao.png");
  const d0 = await dem(t);
  await ngu(8000);
  const d1 = await dem(t);
  await bamThuLai(t);
  await ngu(1500);
  const d2 = await dem(t);
  const vanChan = { ...(await bao(t)), tang: d2.ngoaiKhu - d1.ngoaiKhu };
  await t.tinh(`window.__tre = 3000; 1`);
  await bamThuLai(t);
  await ngu(800);
  const giuaChung = await bao(t);
  await ngu(3500);
  await t.tinh(`window.__tre = 0; 1`);
  const d3 = await dem(t);
  await t.gui("Network.setBlockedURLs", { urls: [] });
  await bamThuLai(t);
  await ngu(2500);
  const d4 = await dem(t);
  const sau = { ...(await bao(t)), ...(await quetHang(t)), banGiu: await banGiu(t), mayChu: await trangThaiMayChu(t), tang: d4.ngoaiKhu - d3.ngoaiKhu };
  await anh(t, "E6-sau.png");
  await t.gui("Network.setBlockedURLs", { urls: [NGOAI_KHU] });
  await t.gui("Page.reload", {});
  await ngu(1500);
  await t.cho(LUOI, 180000);
  await ngu(2500);
  const taiLai = { ...(await bao(t)), ...(await quetHang(t)) };
  ra.ca1 = { dau, cho: { soLanDocThem: d1.ngoaiKhu - d0.ngoaiKhu }, vanChan, giuaChung, sau, taiLai };
}
// Ca 500: máy chủ trả 500, tab mới nên bản giữ đã xoá.
{
  const t = await mo({ tra500: true });
  ra.ca500 = await bao(t);
}
// Ca 2: ngắt cả danh bạ.
{
  const t = await mo({ chan: [NGOAI_KHU, DANH_BA] });
  const dau = await bao(t);
  await anh(t, "E6-ca-hai.png");
  const d0 = await dem(t);
  await t.gui("Network.setBlockedURLs", { urls: [] });
  await bamThuLai(t);
  await ngu(2500);
  const d1 = await dem(t);
  ra.ca2 = { ...dau, sau: await bao(t), tang: { ngoaiKhu: d1.ngoaiKhu - d0.ngoaiKhu, danhBa: d1.danhBa - d0.danhBa } };
}
console.log(JSON.stringify(ra));
process.exit(0);
