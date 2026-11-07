// Chụp các khung nhìn của hàng anh-khong-chan-ban (E8b) trên máy dev dãy G (3493) đã bật bằng thu/dung.mjs.
//   node _acceptance/anh-khong-chan-ban/thu/chup.mjs --kho 1440|375 [--ra <thư mục>]
// Dựng một sàn mới: quản trị và đầu chủ mẫu, một căn đủ năm mục, 0 ảnh, lên Đang bán. Khung: cai-dat (ô số ảnh tối thiểu,
// lưu 2, tải lại, lưu 21 lỗi, trả về 0), cai-dat-dau-chu (không thấy ô), hom-nay (nhóm «Bổ sung ảnh»), ho-so (mức đủ
// 5/6), bang-hang (ô Mức đủ). Mỗi khung in một dòng JSON và chụp E8b-<khung>-<khổ>.png. Không dữ liệu thật.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { values: a } = parseArgs({ options: { kho: { type: "string", default: "1440" }, ra: { type: "string" } } });
const RA = a.ra ?? path.join(GOC, "_acceptance/anh-khong-chan-ban/evidence");
const KHO = Number(a.kho);
const URL_GOC = "http://localhost:3493";
const QT = "quan-tri@mau.quy-hang.test";
const DC = "dau-chu-1@mau.quy-hang.test";
mkdirSync(RA, { recursive: true });

const sql = (q) => execFileSync("docker", ["exec", "quy-hang-db-dkn-G", "psql", "-U", "postgres", "-tAc", q]).toString().trim();
let tenSan = "";
function sanMoi() {
  tenSan = `[Sàn thử ảnh ${KHO} ${Date.now()}]`;
  const id = sql(`insert into companies (name) values ('${tenSan}') returning id`).split("\n")[0];
  sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{company_admin}' from identity."user" where email = '${QT}'`);
  sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{listing_agent}' from identity."user" where email = '${DC}'`);
  return id;
}
function cookieCua(email, sanId) {
  const j = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs"), "--phien", email], { cwd: GOC }).toString());
  return [...j.cookie.filter((c) => c.name !== "qh_san").map((c) => `${c.name}=${c.value}`), `qh_san=${sanId}`];
}
async function api(cookie, method, duong, body) {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { cookie: cookie.join("; "), origin: URL_GOC, ...(body ? { "content-type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${duong}: ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
/** Căn của đầu chủ: đủ năm mục, 0 ảnh, lên Đang bán. */
async function canKhongAnh(ck) {
  const ma = `T-${String(Date.now()).slice(-5)}.01`;
  let h = await api(ck, "POST", "/api/v1/listings", { buildingName: "[Toà thử ảnh]", unitNumber: ma });
  await api(ck, "PUT", `/api/v1/listings/${h.id}/owner`, { ownerName: "[Tên]" });
  for (const [type, payload] of [
    ["price_changed", { listPrice: 3_200_000_000, feeInclusion: "included" }],
    ["details_changed", { legalStatus: "pink_book", occupantType: "vacant", furnished: "full", financing: "cash" }],
    ["status_changed", { to: "Active" }],
  ]) h = await api(ck, "POST", `/api/v1/listings/${h.id}/events`, { type, payload, expectedVersion: h.version });
  return { id: h.id, ma, h };
}

const chrome = await moChrome();
const t = await chrome.trang(KHO, KHO < 768 ? 812 : 900);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chu = () => t.tinh("document.body.innerText");
const thay = (s, han = 180000) => t.cho(`document.body.innerText.includes(${JSON.stringify(s)})`, han);
const ghiNhan = (khung, x) => console.log(JSON.stringify({ khung, kho: KHO, ...x }));
const tran = () => t.tinh(`document.documentElement.scrollWidth > window.innerWidth + 1`);
/** Vào sàn bằng màn chọn sàn (như người dùng): đặt phiên, mở /select-company, bấm tên sàn. */
async function vaoSan(ck, duong) {
  await t.datCookie(ck.filter((c) => !c.startsWith("qh_san=")));
  await t.di("/select-company");
  await thay(tenSan, 30000);
  await ngu(2500); // chờ trang chọn sàn nhận sự kiện bấm
  const bam = await t.tinh(`(() => { const b = [...document.querySelectorAll("button, a, [role=button]")].find((x) => x.textContent.includes(${JSON.stringify(tenSan)})); b?.click(); return b ? b.tagName : null; })()`);
  if (!bam) throw new Error("không thấy nút sàn ở màn chọn sàn");
  await t.cho(`location.pathname !== "/select-company"`, 30000);
  await ngu(1500);
  await t.di(duong);
}
async function chup(ten, chon) {
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); ${chon ? `document.querySelector(${JSON.stringify(chon)})?.scrollIntoView({ block: "center" });` : "window.scrollTo(0, 0);"} return true; })()`);
  await ngu(500);
  writeFileSync(path.join(RA, `E8b-${ten}-${KHO}.png`), await t.chup());
}
const giaTriO = () => t.tinh(`document.querySelector("#anh-toi-thieu")?.value ?? null`);
async function datO(n) {
  await t.tinh(`(() => { const o = document.querySelector("#anh-toi-thieu"); o.focus(); o.select(); return true; })()`);
  await t.gui("Input.insertText", { text: String(n) });
  await t.tinh(`document.querySelector("#anh-toi-thieu").blur()`);
  await ngu(300);
  await t.tinh(`(() => { const b = [...document.querySelectorAll("[data-o-anh-toi-thieu]")][0].closest("[data-slot=frame]")?.querySelector("footer button, [data-slot=frame-footer] button") ?? [...document.querySelectorAll("button")].filter((x) => x.textContent.trim() === "Lưu").pop(); b.click(); return true; })()`);
}

try {
  const san = sanMoi();
  const ckQt = cookieCua(QT, san);
  const ckDc = cookieCua(DC, san);
  const can = await canKhongAnh(ckDc);

  // Cài đặt › Trạng thái: quản trị.
  await vaoSan(ckQt, "/settings/statuses");
  await thay("Số ảnh thật tối thiểu");
  ghiNhan("cai-dat", { giaTri: await giaTriO(), coCauNghia: (await chu()).includes("0 — căn lên Đang bán khi chưa có ảnh"), tranNgang: await tran() });
  await chup("cai-dat", "[data-o-anh-toi-thieu]");
  await datO(2);
  await thay("Đã lưu", 60000);
  await t.di("/settings/statuses");
  await thay("Số ảnh thật tối thiểu");
  ghiNhan("cai-dat-luu-2", { giaTriSauTaiLai: await giaTriO(), mayChu: sql(`select value from company_settings where company_id = '${san}' and key = 'listing.ready_min_real_photos'`) });
  await datO(21);
  await ngu(1500);
  const loi = (await chu()).match(/Cần số nguyên[^\n]*|Chưa lưu được[^\n]*/)?.[0] ?? null;
  ghiNhan("cai-dat-21", { loi });
  await chup("cai-dat-21", "[data-o-anh-toi-thieu]");
  await api(ckQt, "PATCH", "/api/v1/company/settings", { "listing.ready_min_real_photos": 0 });

  // Đầu chủ: không thấy ô.
  await vaoSan(ckDc, "/settings/statuses");
  // Đối chứng dương: trang đích đã dựng xong (bị chuyển sang Cài đặt › Cá nhân, chữ «Cá nhân» đã hiện) rồi mới đọc ô.
  await t.cho(`location.pathname === "/settings/personal" && document.body.innerText.includes("Cá nhân")`, 60000);
  await ngu(1500);
  ghiNhan("cai-dat-dau-chu", {
    thayO: await t.tinh(`!!document.querySelector("#anh-toi-thieu")`),
    url: await t.tinh("location.pathname"),
    trangDaDung: await t.tinh(`document.body.innerText.includes("Cá nhân")`),
    thayMucTrangThai: await t.tinh(`document.body.innerText.includes("Nhãn trạng thái của sàn")`),
  });
  await chup("cai-dat-dau-chu");

  // Hôm nay của đầu chủ: nhóm «Bổ sung ảnh».
  await t.di("/today");
  await thay("Bổ sung ảnh", 180000);
  await thay(can.ma, 180000);
  const s = await chu();
  ghiNhan("hom-nay", { coNhom: s.includes("Bổ sung ảnh"), coCan: s.includes(can.ma) || s.includes(can.ma.replace(/\.01$/, "")), tranNgang: await tran() });
  await chup("hom-nay");
  // Mở hồ sơ căn từ nhóm: nút «Mở hồ sơ» của dòng (hành động của nhóm), hay bấm dòng.
  // Máy tính: dòng của lưới; điện thoại: thẻ — tìm phần tử nhỏ nhất chứa mã căn mà có nút «Mở hồ sơ».
  await t.tinh(`(() => { const ma = ${JSON.stringify(can.ma)}; const nut = [...document.querySelectorAll("button, a")].filter((x) => x.textContent.trim() === "Mở hồ sơ" || /Mở hồ sơ$/.test(x.textContent.trim())); const b = nut.find((x) => { let p = x; for (let i = 0; i < 8 && p; i++, p = p.parentElement) if (p.innerText?.includes(ma)) return true; return false; }); b?.click(); return !!b; })()`);
  await thay("Mức đủ", 30000).catch(() => undefined);
  await ngu(1500);
  const s2 = await chu();
  ghiNhan("ho-so", { mucDu: s2.match(/\d\/6/)?.[0] ?? null, coAnhThat: s2.includes("Ảnh thật") });
  await chup("ho-so", "[data-slot=muc-du], [data-muc-du]");

  // Bảng hàng: ô Mức đủ của căn.
  await t.di("/inventory");
  await thay(can.ma, 180000);
  // Cột «Mức đủ» nằm bên phải lưới: cuộn ngang lưới tới cuối để cột được dựng và vào ảnh.
  await t.tinh(`(() => { for (const el of document.querySelectorAll("*")) if (el.scrollWidth > el.clientWidth + 20 && getComputedStyle(el).overflowX !== "visible") el.scrollLeft = el.scrollWidth; return true; })()`);
  await ngu(1200);
  const o = await t.tinh(`(() => { const d = [...document.querySelectorAll("[role=row], tr")].find((x) => x.innerText.includes(${JSON.stringify(can.ma)})); return d ? (d.innerText.match(/\\d\\/6[^\\n\\t]*/)?.[0] ?? null) : null; })()`);
  // Khổ điện thoại Bảng hàng là thẻ, không có cột Mức đủ (khuôn bang-hang) — chỉ đo không tràn ngang.
  ghiNhan("bang-hang", KHO < 768 ? { cotMucDu: "không có ở thẻ điện thoại", coCan: (await chu()).includes(can.ma), tranNgang: await tran() } : { oMucDu: o, tranNgang: await tran() });
  await t.tinh(`(() => { document.querySelector("nextjs-portal")?.remove(); return true; })()`);
  await ngu(300);
  writeFileSync(path.join(RA, `E8b-bang-hang-${KHO}.png`), await t.chup());
} finally {
  await chrome.dong();
}
