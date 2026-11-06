// Chụp ba ca nhìn màn của hàng 69 (E4b) trên máy dev dãy G (3493) đã bật bằng thu/dung-o-la.mjs (khách AI giả).
//   node _acceptance/nhap-o-la/thu/chup-o-la.mjs --kho 1440|375 [--ra <thư mục>]
// Ca: co-de-xuat → da-dung (bấm «Dùng» ở một ô trạng thái) → tat-dinh (khách giả ở chế độ lỗi). Mỗi ca in một dòng JSON
// (chữ thấy được, lời gọi mạng) và chụp E4b-<ca>-<khổ>.png. Tệp mẫu cùng khuôn với apps/web/src/lib/nhap/o-la.fixture.ts.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const ExcelJS = createRequire(path.join(GOC, "apps/web/package.json"))("exceljs");
const { values: a } = parseArgs({ options: { kho: { type: "string", default: "1440" }, ra: { type: "string" } } });
const RA = a.ra ?? path.join(GOC, "_acceptance/nhap-o-la/evidence");
const KHO = Number(a.kho);
const AI_GIA = path.join(os.tmpdir(), "quy-hang-ai-gia");
const XLSX = path.join(os.tmpdir(), "quy-hang-o-la.xlsx");
const QT = "quan-tri@mau.quy-hang.test";
const DC = "dau-chu-1@mau.quy-hang.test";
mkdirSync(RA, { recursive: true });

const LUOI = [
  ["Toà", "Mã căn", "Giá (tỷ)", "Trạng thái"],
  ["A", "A-0101", "4.6–4.8 tỷ", "Đang bán"],
  ["A", "A-0102", "4.6–4.8 tỷ", "Đang bán"],
  ["A", "A-0103", "4.6–4.8 tỷ", "đang đàm phán"],
  ["A", "A-0104", "thu về 4.2", "đang đàm phán"],
  ["A", "A-0105", "5 tỷ", "Đang bán"],
];
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Bảng hàng");
for (const r of LUOI) ws.addRow(r);
await wb.xlsx.writeFile(XLSX);

const sql = (q) => execFileSync("docker", ["exec", "quy-hang-db-dkn-G", "psql", "-U", "postgres", "-tAc", q]).toString().trim();
function sanMoi() {
  const id = sql(`insert into companies (name) values ('[Sàn thử ô lạ ${KHO} ${Date.now()}]') returning id`).split("\n")[0];
  sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{company_admin}' from identity."user" where email = '${QT}'`);
  sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{listing_agent}' from identity."user" where email = '${DC}'`);
  sql(`insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by) values ('${id}', 'ai_processing', 'outbound', 'anthropic', '{catalog,shareable_listing}', now(), '[Tên]')`);
  return id;
}
function cookieCua(email, sanId) {
  const j = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs"), "--phien", email], { cwd: GOC }).toString());
  return [...j.cookie.filter((c) => c.name !== "qh_san").map((c) => `${c.name}=${c.value}`), `qh_san=${sanId}`];
}

const chrome = await moChrome();
const t = await chrome.trang(KHO, KHO < 768 ? 812 : 900);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chu = () => t.tinh("document.body.innerText");
const thay = (s, han = 60000) => t.cho(`document.body.innerText.includes(${JSON.stringify(s)})`, han);
const bam = (nhan) =>
  t.tinh(`(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().startsWith(${JSON.stringify(nhan)}) && !x.disabled); if (!b) return false; b.click(); return true; })()`);
const mang = () => t.tinh(`performance.getEntriesByType("resource").map((e) => new URL(e.name).pathname).filter((p) => p.startsWith("/api/v1/imports/ai"))`);
const ghiNhan = (ca, x) => console.log(JSON.stringify({ ca, kho: KHO, ...x }));
async function chup(ten) {
  // Khổ hẹp: lưới cuộn ngang như hôm nay — cuộn tới ô có đề xuất đầu tiên để ảnh thấy nó.
  if (KHO < 768) await t.tinh(`(() => { const o = document.querySelector("[data-de-xuat-o-la]") ?? [...document.querySelectorAll("td")].find((x) => x.innerText.includes("Cần người")); o?.scrollIntoView({ block: "center", inline: "nearest" }); return true; })()`);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(500);
  writeFileSync(path.join(RA, `E4b-${ten}-${KHO}.png`), await t.chup());
}
async function denXemTruoc(sanId) {
  await t.datCookie(cookieCua(DC, sanId));
  await t.di("/imports/new");
  await t.cho(`document.readyState === "complete" && !!document.querySelector('input[type=file]') && !document.querySelector('input[type=file]').disabled`, 60000);
  await ngu(1500);
  const { root } = await t.gui("DOM.getDocument");
  const { nodeId } = await t.gui("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await t.gui("DOM.setFileInputFiles", { nodeId, files: [XLSX] });
  await thay("quy-hang-o-la.xlsx ·");
  await bam("Tiếp");
  await thay("Cột trong tệp", 30000);
  await ngu(1000);
  await bam("Tiếp");
  await thay("Chỉ dòng cần người", 30000);
}
const soDeXuat = () => t.tinh(`document.querySelectorAll("[data-de-xuat-o-la]").length`);
const tran = () => t.tinh(`document.documentElement.scrollWidth > window.innerWidth + 1`);
const nutDung = () => t.tinh(`(() => { const b = [...document.querySelectorAll("[data-de-xuat-o-la] button")]; return b.map((x) => { const r = x.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width) }; }); })()`);

try {
  rmSync(path.join(AI_GIA, ".loi"), { force: true });
  const id = sanMoi();
  await denXemTruoc(id);
  await thay("Máy đề xuất", 30000);
  const s = await chu();
  ghiNhan("co-de-xuat", { soDeXuat: await soDeXuat(), thay: ["4,8 tỷ", "4,2 tỷ KBP", "Đang giao dịch"].filter((x) => s.includes(x)), nutDung: await nutDung(), tranNgang: await tran(), mang: await mang() });
  await chup("co-de-xuat");

  const daBam = await t.tinh(`(() => { const b = [...document.querySelectorAll("[data-de-xuat-o-la] button")].find((x) => x.getAttribute("aria-label")?.includes("Trạng thái")); if (!b) return false; b.click(); return true; })()`);
  await thay("Đã đổi theo 1 ô cùng chữ", 15000);
  ghiNhan("da-dung", { daBam, dongDoiTheo: (await chu()).includes("Đã đổi theo 1 ô cùng chữ"), soDeXuat: await soDeXuat() });
  await chup("da-dung");

  writeFileSync(path.join(AI_GIA, ".loi"), "");
  const id2 = sanMoi();
  await denXemTruoc(id2);
  await thay("Sửa tay lần này", 30000);
  ghiNhan("tat-dinh", { dong: (await chu()).match(/Sửa tay lần này[^\n]*\n?[^\n]*/)?.[0], soDeXuat: await soDeXuat() });
  await chup("tat-dinh");
  rmSync(path.join(AI_GIA, ".loi"), { force: true });
} finally {
  await chrome.dong();
}
