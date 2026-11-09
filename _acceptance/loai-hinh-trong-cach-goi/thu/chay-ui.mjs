// Phép nhìn màn E9 (chạy dung.mjs trước): quản trị đặt tên riêng ở Cách gọi; đầu chủ xem Bảng hàng, hồ sơ cạnh bảng, toàn màn, Hôm nay;
// quản trị trả về mặc định; đầu chủ xem lại. In một dòng JSON từng bước và chụp ảnh. Chrome không đầu qua CDP.
//   node _acceptance/loai-hinh-trong-cach-goi/thu/chay-ui.mjs --ra <thư mục>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3496";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/loai-hinh-trong-cach-goi/evidence");
mkdirSync(RA, { recursive: true });
const CHAY = path.join(GOC, ".acceptance-runs/loai-hinh-trong-cach-goi");
const dauChu = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/bang-hang-theo-loai-hinh/phien.json"), "utf8")).cookie;
const quanTri = JSON.parse(readFileSync(path.join(CHAY, "phien-qt.json"), "utf8")).cookie;
const dung = JSON.parse(readFileSync(path.join(CHAY, "dung.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = await moChrome();
const TEN = { Townhouse: "Liền kề", Condominium: "Căn cao tầng" };

async function mo(cookie, duong, cho) {
  const t = await chrome.trang(1440, 900);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: `try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}` });
  for (const c of cookie.split(";").map((s) => s.trim()).filter(Boolean)) {
    const [name, ...v] = c.split("=");
    await t.gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
  }
  await t.gui("Page.navigate", { url: `${URL_GOC}${duong}` });
  await t.cho(cho, 180000);
  await ngu(1500);
  return t;
}
const anh = async (t, ten) => writeFileSync(path.join(RA, ten), await t.chup());
const bam = async (t, x, y) => {
  await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  for (const type of ["mousePressed", "mouseReleased"]) await t.gui("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons: type === "mousePressed" ? 1 : 0, clickCount: 1 });
};
const toaDo = (t, bieuThuc) => t.tinh(`JSON.stringify((() => { const e = ${bieuThuc}; if (!e) return null; e.scrollIntoView({ block: "center" }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })())`).then(JSON.parse);
const idO = (neo) => `v:propertySubType:${neo}`;
const O = (neo) => `document.getElementById(${JSON.stringify(idO(neo))})`;
const LUU = `[...document.querySelectorAll('button[type=submit]')].find((b) => b.textContent.trim() === "Lưu")`;
const DA_LUU = `document.body.innerText.includes("Đã lưu cách gọi")`;
const TT = `[data-muc="thuoc-tinh"]`;
const LUOI = `!!document.querySelector('[data-slot=data-grid] tbody [data-slot=row-number]')`;
const cotLoaiHinh = (t) => t.tinh(`JSON.stringify((() => { const th = [...document.querySelectorAll("[data-slot=data-grid] thead th")].map((e) => e.textContent.trim()); const i = th.findIndex((s) => s.startsWith("Loại hình")); return [...document.querySelectorAll("[data-slot=data-grid] tbody tr")].filter((tr) => tr.querySelector("[data-slot=row-number]")).map((tr) => tr.children[i]?.textContent.trim()); })())`).then(JSON.parse);

// Bước 1: quản trị đặt tên.
const t1 = await mo(quanTri, "/settings/labels", `!!${O("Townhouse")}`);
const buoc1 = { coO: await t1.tinh(`!!${O("Townhouse")} && document.body.innerText.includes("Loại hình · Nhà phố")`) };
for (const [neo, chu] of Object.entries(TEN)) {
  const p = await toaDo(t1, O(neo));
  await bam(t1, p.x, p.y);
  await t1.gui("Input.insertText", { text: chu });
  await ngu(200);
}
const pLuu = await toaDo(t1, LUU);
await bam(t1, pLuu.x, pLuu.y);
await t1.cho(DA_LUU, 30000);
buoc1.daLuu = true;
await anh(t1, "E9-cach-goi.png");

// Bước 2: đầu chủ xem cột và ô lọc.
const t2 = await mo(dauChu, "/inventory", LUOI);
const o = await cotLoaiHinh(t2);
const pLoc = await toaDo(t2, `[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Lọc")`);
await bam(t2, pLoc.x, pLoc.y);
await ngu(600);
const pChon = await toaDo(t2, `document.querySelector('[aria-label="Lọc Loại hình"]')`);
await bam(t2, pChon.x, pChon.y);
await ngu(800);
const luaChon = await t2.tinh(`JSON.stringify([...document.querySelectorAll('[role=option]')].map((e) => e.textContent.trim()))`).then(JSON.parse);
await anh(t2, "E9-bang-hang.png");
const buoc2 = { coLienKe: o.includes(TEN.Townhouse), coNhaPho: o.includes("Nhà phố"), luaChon };

// Bước 3: hồ sơ một nhà phố cạnh bảng.
const t3 = await mo(dauChu, `/inventory?hang=${dung.nhaPho}`, `!!document.querySelector('${TT}')`);
const buoc3 = { thuocTinh: await t3.tinh(`document.querySelector('${TT}').innerText`) };
await anh(t3, "E9-ho-so.png");

// Bước 4: hồ sơ toàn màn một căn hộ.
const t4 = await mo(dauChu, `/units/${encodeURIComponent(dung.canHo.ma)}?toa=${encodeURIComponent(dung.canHo.toa)}`, `!!document.querySelector('${TT}')`);
const buoc4 = { thuocTinh: await t4.tinh(`document.querySelector('${TT}').innerText`) };
await anh(t4, "E9-toan-man.png");

// Bước 5: cột hồ sơ ở Hôm nay.
const t5 = await mo(dauChu, `/today?hang=${dung.nhaPho}`, `!!document.querySelector('${TT}')`);
const buoc5 = { thuocTinh: await t5.tinh(`document.querySelector('${TT}').innerText`) };
await anh(t5, "E9-hom-nay.png");

// Bước 6: quản trị trả về mặc định, đầu chủ xem lại.
const t6 = await mo(quanTri, "/settings/labels", `!!${O("Townhouse")} && ${O("Townhouse")}.value === ${JSON.stringify(TEN.Townhouse)}`);
for (const neo of Object.keys(TEN)) {
  const p = await toaDo(t6, `[...${O(neo)}.parentElement.querySelectorAll("button")].find((b) => b.textContent.trim() === "Trả về mặc định")`);
  await bam(t6, p.x, p.y);
  await ngu(200);
}
const pLuu6 = await toaDo(t6, LUU);
await bam(t6, pLuu6.x, pLuu6.y);
await t6.cho(DA_LUU, 30000);
const t7 = await mo(dauChu, "/inventory", LUOI);
const o7 = await cotLoaiHinh(t7);
await anh(t7, "E9-tra-ve.png");
const buoc6 = { coNhaPho: o7.includes("Nhà phố"), coLienKe: o7.includes(TEN.Townhouse) };

console.log(JSON.stringify({ buoc1, buoc2, buoc3, buoc4, buoc5, buoc6 }));
process.exit(0);
