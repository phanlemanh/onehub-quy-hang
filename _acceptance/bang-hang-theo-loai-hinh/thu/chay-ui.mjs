// Phép nhìn màn hàng 79 (E8) trên chỗ thử dãy X (chạy dung-x.mjs trước). Chrome không đầu qua CDP của hồ sơ
// bang-hang-kieu-sheet; khổ 1440 × 900. Lọc và nhóm đi qua góc nhìn đã lưu của chính người (tính năng của hàng 14) — đặt vào
// kho trên máy của trình duyệt rồi mở `/inventory/views/<id>`, như người bấm «Lưu góc nhìn». In một dòng JSON `e8` và chụp ảnh.
//   node _acceptance/bang-hang-theo-loai-hinh/thu/chay-ui.mjs --ra _acceptance/bang-hang-theo-loai-hinh/evidence
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3496";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/bang-hang-theo-loai-hinh");
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/bang-hang-theo-loai-hinh/evidence");
mkdirSync(RA, { recursive: true });
const phien = JSON.parse(readFileSync(path.join(CHAY, "phien.json"), "utf8"));
const dung = JSON.parse(readFileSync(path.join(CHAY, "dung-x.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

// Cột mặc định của Bảng hàng sau hàng 79 (viết tay — khớp COT_MAC_DINH).
const COT = ["buildingName", "unitNumber", "propertySubType", "unitType", "livingArea", "floor", "directionFaces", "lotSizeArea", "storiesTotal", "frontageLength", "accessRoadWidth", "standardStatus", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType", "confirmedAgeDays", "dau-chu", "completeness", "visibility"];
const gocNhin = (id, ten, loc, nhom) => ({ id, ten, luc: "2026-11-08T00:00:00.000Z", loc, cot: COT, sap: [], nhom });
const KHO = JSON.stringify({ v: 1, ds: [gocNhin("x79-dat", "[Mẫu] Chỉ đất", { propertySubType: "Unimproved Land" }, "khong"), gocNhin("x79-nhom", "[Mẫu] Theo loại hình", {}, "loai-hinh")] });
const KHOA = `qh:goc-nhin:v1:${phien.nguoi}:${phien.san}`;

const chrome = await moChrome();
async function mo(duong) {
  const t = await chrome.trang(1440, 900);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => { try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {} try { localStorage.setItem(${JSON.stringify(KHOA)}, ${JSON.stringify(KHO)}); } catch {} })()`,
  });
  for (const c of phien.cookie.split(";").map((s) => s.trim()).filter(Boolean)) {
    const [name, ...v] = c.split("=");
    await t.gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
  }
  await t.gui("Page.navigate", { url: `${URL_GOC}${duong}` });
  await t.cho(`document.readyState === "complete" && !!document.querySelector('[data-slot=data-grid] tbody [data-slot=row-number]')`, 180000);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(1500);
  return t;
}
const chup = async (t, ten) => writeFileSync(path.join(RA, `${ten}.png`), await t.chup());
const tieuDe = (t) => t.tinh(`JSON.stringify([...document.querySelectorAll("[data-slot=data-grid] thead th")].map((th) => th.textContent.trim()))`).then(JSON.parse);
const dongCan = (t) =>
  t
    .tinh(`JSON.stringify([...document.querySelectorAll("[data-slot=data-grid] tbody tr")].filter((tr) => tr.querySelector("[data-slot=row-number]")).map((tr) => { const td = [...tr.children].map((x) => x.textContent.trim()); const r = tr.children[2].getBoundingClientRect(); return { td, x: r.left + r.width / 2, y: r.top + r.height / 2 }; }))`)
    .then(JSON.parse);
const dongNhom = (t) =>
  t.tinh(`JSON.stringify([...document.querySelectorAll("[data-slot=data-grid] tbody tr")].filter((tr) => !tr.querySelector("[data-slot=row-number]")).map((tr) => tr.textContent.trim()).filter(Boolean))`).then(JSON.parse);
// Ô tiêu đề chứa cả ô lọc của cột khi hàng lọc mở — so bằng đầu chữ.
const chiSo = (ds, ten) => ds.findIndex((x) => x.startsWith(ten));
const coCot = (ds, ten) => chiSo(ds, ten) >= 0;

// 1. Bảng trộn: tiêu đề cột đầu «Vị trí», có cột Loại hình; ô của một dòng đất ngoài khu là địa chỉ đã gõ.
const t1 = await mo("/inventory");
const td1 = await tieuDe(t1);
const dong1 = await dongCan(t1);
const iViTri = chiSo(td1, "Vị trí");
const oDiaChi = iViTri < 0 ? [] : dong1.map((d) => d.td[iViTri] ?? "").filter((s) => dung.dat.includes(s));
await chup(t1, "E8-tron");

// 2. Lọc Loại hình = Đất (góc nhìn đã lưu).
const t2 = await mo("/inventory/views/x79-dat");
const td2 = await tieuDe(t2);
const dong2 = await dongCan(t2);
const iLh = chiSo(td2, "Loại hình");
await chup(t2, "E8-loc-dat");
// 3. Mở hồ sơ một dòng đất — ở Bảng hàng (trang góc nhìn đã lưu không có cột hồ sơ, từ trước hàng 79): dòng có ô Loại hình «Đất».
const iLh1 = chiSo(td1, "Loại hình");
const dat1 = dong1.find((d) => d.td[iLh1] === "Đất");
if (!dat1) throw new Error("bảng trộn không có dòng đất");
await t1.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x: dat1.x, y: dat1.y });
for (const type of ["mousePressed", "mouseReleased"]) await t1.gui("Input.dispatchMouseEvent", { type, x: dat1.x, y: dat1.y, button: "left", buttons: type === "mousePressed" ? 1 : 0, clickCount: 1 });
await t1.cho(`!!document.querySelector('[data-vung="cot-phu"] [data-muc="thuoc-tinh"]')`, 60000);
await ngu(1200);
const hoSo = await t1.tinh(`document.querySelector('[data-vung="cot-phu"] [data-muc="thuoc-tinh"]')?.innerText ?? ""`);
await chup(t1, "E8-ho-so-dat");

// 4. Nhóm theo loại hình.
const t3 = await mo("/inventory/views/x79-nhom");
const nhom = await dongNhom(t3);
await chup(t3, "E8-nhom-loai-hinh");

const NHAN = { Condominium: "Căn hộ", Townhouse: "Nhà phố", "Single Family Residence": "Biệt thự", "Unimproved Land": "Đất" };
const soNhom = Object.fromEntries(Object.entries(NHAN).map(([k, n]) => [n, Number((nhom.find((x) => x.startsWith(n)) ?? "").match(/(\d+) căn/)?.[1] ?? -1)]));
const e8 = {
  tron: { tieuDe: td1, coLoaiHinh: coCot(td1, "Loại hình"), cotDau: coCot(td1, "Vị trí") ? "Vị trí" : coCot(td1, "Toà") ? "Toà" : null, oDiaChiDat: oDiaChi },
  locDat: {
    tieuDe: td2,
    soDong: dong2.length,
    moiDongDat: iLh >= 0 && dong2.length > 0 && dong2.every((d) => d.td[iLh] === "Đất"),
    khongCo: ["Tầng", "Hướng", "Loại căn"].filter((x) => coCot(td2, x)),
    co: ["Diện tích đất", "Mặt tiền", "Lộ giới"].filter((x) => coCot(td2, x)),
  },
  hoSo: { loaiHinhDat: /Loại hình\s*\n?\s*Đất/.test(hoSo), coTang: /(^|\n)Tầng(\n|$)/.test(hoSo), chu: hoSo },
  nhom: { dong: nhom, soCan: soNhom, mong: Object.fromEntries(Object.entries(NHAN).map(([k, n]) => [n, dung.dem[k]])) },
};
console.log(JSON.stringify({ e8 }));
await chrome.dong?.();
process.exit(0);
