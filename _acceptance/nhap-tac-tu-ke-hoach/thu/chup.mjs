// Chụp ba ca nhìn màn của hàng 68 trên máy dev dãy G (3493) đã bật bằng thu/dung-ai.mjs (khách AI giả, không khoá thật).
// Mỗi ca in một dòng JSON (chữ thấy được, lời gọi mạng) và chụp E<eval>-<ca>-<khổ>.png vào evidence/ của hồ sơ.
//   node _acceptance/nhap-tac-tu-ke-hoach/thu/chup.mjs --ca <ca> --kho 1440|375 [--ra <thư mục>]
// Ca Cài đặt (E5b), theo thứ tự: ai-tat → ai-bat → ai-het-tran → ai-loi → dau-chu-khong-thay.
// Ca Nhập (E7b, E8c): dang-de-xuat (gồm cho-duyet, dong-y-mot, dong-y-het) · tat-dinh-loi · tat-dinh-chua-bat.
// Mỗi khổ dựng sàn thử MỚI ở lần chạy đầu (ai-tat hay dang-de-xuat) và ghi vào tệp tạm cho các ca sau. Chỉ người mẫu.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { values: a } = parseArgs({ options: { kho: { type: "string", default: "1440" }, ca: { type: "string", default: "ai-tat" }, ra: { type: "string" } } });
const RA = a.ra ?? path.join(GOC, "_acceptance/nhap-tac-tu-ke-hoach/evidence");
const KHO = Number(a.kho);
const AI_GIA = path.join(os.tmpdir(), "quy-hang-ai-gia");
const XLSX = path.join(os.tmpdir(), "quy-hang-ai-xlsx");
const SAN = path.join(RA, `.san-ai-${KHO}.json`);
const QT = "quan-tri@mau.quy-hang.test";
const DC = "dau-chu-1@mau.quy-hang.test";
mkdirSync(RA, { recursive: true });

const sql = (q) => execFileSync("docker", ["exec", "quy-hang-db-dkn-G", "psql", "-U", "postgres", "-tAc", q]).toString().trim();
function sanMoi(ten, coAi) {
  const id = sql(`insert into companies (name) values ('[Sàn thử AI ${ten} ${Date.now()}]') returning id`).split("\n")[0];
  sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{company_admin}' from identity."user" where email = '${QT}'`);
  sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{listing_agent}' from identity."user" where email = '${DC}'`);
  if (coAi)
    sql(`insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by) values ('${id}', 'ai_processing', 'outbound', 'anthropic', '{catalog,shareable_listing}', now(), '[Tên]')`);
  return id;
}
const docSan = () => (existsSync(SAN) ? JSON.parse(readFileSync(SAN, "utf8")) : {});
const ghiSan = (k, v) => writeFileSync(SAN, JSON.stringify({ ...docSan(), [k]: v }));
const san = (k) => {
  const s = docSan()[k];
  if (!s) throw new Error(`chưa có sàn «${k}» — chạy ca đầu của nhóm trước`);
  return s;
};
function cookieCua(email, sanId) {
  const j = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs"), "--phien", email], { cwd: GOC }).toString());
  return [...j.cookie.filter((c) => c.name !== "qh_san").map((c) => `${c.name}=${c.value}`), `qh_san=${sanId}`];
}

const chrome = await moChrome();
const t = await chrome.trang(KHO, KHO < 768 ? 812 : 900);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chu = () => t.tinh("document.body.innerText");
const thay = (s, han = 60000) => t.cho(`document.body.innerText.includes(${JSON.stringify(s)})`, han);
const bam = (nhan, dung = false) =>
  t.tinh(
    `(() => { const b = [...document.querySelectorAll("button, a, [role=switch]")].find((x) => (${dung} ? x.textContent.trim() === ${JSON.stringify(nhan)} : x.textContent.trim().startsWith(${JSON.stringify(nhan)})) && !x.disabled && x.getAttribute("aria-disabled") !== "true"); if (!b) return false; b.click(); return true; })()`,
  );
const nutTiep = () => t.tinh(`(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().startsWith("Tiếp")); return b ? { co: true, khoa: b.disabled } : { co: false }; })()`);
const mang = () => t.tinh(`performance.getEntriesByType("resource").map((e) => new URL(e.name).pathname).filter((p) => p.startsWith("/api/v1/imports"))`);
const ghiNhan = (ca, thayGi) => console.log(JSON.stringify({ ca, kho: KHO, ...thayGi }));
async function chup(ten) {
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(500);
  writeFileSync(path.join(RA, `${ten}-${KHO}.png`), await t.chup());
}
async function moNhap(sanId) {
  await t.datCookie(cookieCua(DC, sanId));
  await t.di("/imports/new");
  await t.cho(`document.readyState === "complete" && !!document.querySelector('input[type=file]') && !document.querySelector('input[type=file]').disabled`, 60000);
  await ngu(1500); // trạng thái AI và mẫu đã nhớ đọc xong
}
async function chonTep(ten) {
  if (!existsSync(path.join(XLSX, `${ten}.xlsx`))) execFileSync("node", ["--import", "tsx", path.join(GOC, "_acceptance/nhap-tac-tu-ke-hoach/thu/sinh-xlsx.ts"), XLSX], { cwd: GOC });
  const { root } = await t.gui("DOM.getDocument");
  const { nodeId } = await t.gui("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await t.gui("DOM.setFileInputFiles", { nodeId, files: [path.join(XLSX, `${ten}.xlsx`)] });
  await thay(`${ten}.xlsx ·`, 60000);
  await bam("Tiếp");
  await thay("Cột trong tệp", 30000);
}
const ve = (s) => (s.match(/Còn (\d+) cột máy đề xuất chưa duyệt/) ?? [])[1] ?? null;

try {
  switch (a.ca) {
    case "ai-tat": {
      ghiSan("caiDat", sanMoi("cai-dat", false));
      await t.datCookie(cookieCua(QT, san("caiDat")));
      await t.di("/settings/ai");
      await thay("Không gửi chủ nhà");
      const s = await chu();
      ghiNhan("ai-tat", { congTac: await t.tinh(`document.querySelector('[role=switch]')?.getAttribute("aria-checked")`), guiGi: s.includes("mã căn, giá, phí, trạng thái"), khongGuiGi: s.includes("Không gửi chủ nhà, số điện thoại, giá đáy, ghi chú hay tên người") });
      await chup("E5b-ai-tat");
      break;
    }
    case "ai-bat": {
      await t.datCookie(cookieCua(QT, san("caiDat")));
      await t.di("/settings/ai");
      await thay("Không gửi chủ nhà");
      await t.tinh(`document.querySelector('[role=switch]').click()`);
      await thay("Tháng này đã dùng");
      ghiNhan("ai-bat", { congTac: await t.tinh(`document.querySelector('[role=switch]')?.getAttribute("aria-checked")`), dong: (await chu()).match(/Tháng này đã dùng [^\n]*/)?.[0] });
      await chup("E5b-ai-bat");
      break;
    }
    case "ai-het-tran": {
      sql(`insert into ai_usage (company_id, user_id, model, cost_usd, result) values ('${san("caiDat")}', 'u-mau', 'claude-opus-5-5', 10, 'ok')`);
      await t.datCookie(cookieCua(QT, san("caiDat")));
      await t.di("/settings/ai");
      await thay("Đã hết trần tháng này");
      ghiNhan("ai-het-tran", { bao: (await chu()).includes("Đã hết trần tháng này — nhập đang chạy không AI"), dong: (await chu()).match(/Tháng này đã dùng [^\n]*/)?.[0] });
      await chup("E5b-ai-het-tran");
      break;
    }
    case "ai-loi": {
      await t.datCookie(cookieCua(QT, san("caiDat")));
      await t.gui("Network.setBlockedURLs", { urls: ["*/api/v1/imports/ai"] });
      await t.di("/settings/ai");
      await thay("Chưa đọc được trạng thái AI");
      ghiNhan("ai-loi", { thuLai: (await chu()).includes("Thử lại") });
      await chup("E5b-ai-loi");
      await t.gui("Network.setBlockedURLs", { urls: [] });
      break;
    }
    case "dau-chu-khong-thay": {
      await t.datCookie(cookieCua(DC, san("caiDat")));
      await t.di("/settings/ai");
      await ngu(3000);
      ghiNhan("dau-chu-khong-thay", { duongDan: await t.tinh("location.pathname"), coCongTac: await t.tinh(`!!document.querySelector('[role=switch]')`) });
      await chup("E5b-dau-chu-khong-thay");
      break;
    }
    case "dang-de-xuat": {
      ghiSan("nhap", sanMoi("nhap", true));
      writeFileSync(path.join(AI_GIA, ".cham"), "6000");
      await moNhap(san("nhap"));
      await chonTep("la-a-dong-nghia");
      await thay("Máy đang đề xuất cách ghép…");
      ghiNhan("dang-de-xuat", { tiep: await nutTiep() });
      await chup("E7b-dang-de-xuat");
      rmSync(path.join(AI_GIA, ".cham"), { force: true });
      await thay("cột máy đề xuất chưa duyệt", 30000);
      const s1 = await chu();
      ghiNhan("cho-duyet", { choDuyet: ve(s1), huyHieu: (s1.match(/Máy đề xuất/g) ?? []).length, nutDongYHet: s1.includes("Đồng ý mọi đề xuất"), tiep: await nutTiep(), mang: await mang() });
      await chup("E7b-cho-duyet");
      await bam("Đồng ý", true);
      await thay("Đã đồng ý");
      const s2 = await chu();
      ghiNhan("dong-y-mot", { choDuyet: ve(s2), daDongY: (s2.match(/Đã đồng ý/g) ?? []).length, tiep: await nutTiep() });
      await chup("E7b-dong-y-mot");
      await bam("Đồng ý mọi đề xuất");
      await t.cho(`!document.body.innerText.includes("cột máy đề xuất chưa duyệt")`);
      const tiep = await nutTiep();
      const mangTruoc = await mang();
      await bam("Tiếp");
      await thay("Từng ô sẽ ghi gì", 30000);
      ghiNhan("dong-y-het", { tiepTruocKhiBam: tiep, mangTruocKhiTiep: mangTruoc, sangXemTruoc: true });
      await chup("E7b-dong-y-het");
      break;
    }
    case "tat-dinh-loi": {
      writeFileSync(path.join(AI_GIA, ".loi"), "1");
      await moNhap(san("nhap"));
      await chonTep("la-a-dong-nghia");
      await thay("Chưa dùng được AI");
      const s = await chu();
      ghiNhan("tat-dinh-loi", { dai: s.match(/Chưa dùng được AI: [^\n]*/)?.[0], huyHieu: (s.match(/Máy đề xuất/g) ?? []).length, tiep: await nutTiep() });
      await chup("E8c-tat-dinh-loi");
      await bam("Tiếp");
      await thay("Từng ô sẽ ghi gì", 30000);
      ghiNhan("tat-dinh-loi-xem-truoc", { sangXemTruoc: true });
      rmSync(path.join(AI_GIA, ".loi"), { force: true });
      break;
    }
    case "tat-dinh-chua-bat": {
      ghiSan("tat", sanMoi("tat", false));
      await moNhap(san("tat"));
      await chonTep("la-a-dong-nghia");
      await thay("Cột trong tệp", 30000);
      await ngu(2000);
      const s = await chu();
      ghiNhan("tat-dinh-chua-bat", { daiAi: s.includes("Chưa dùng được AI") || s.includes("Máy đang đề xuất"), huyHieu: (s.match(/Máy đề xuất/g) ?? []).length, mang: await mang() });
      await chup("E8c-tat-dinh-chua-bat");
      break;
    }
    default:
      throw new Error(`ca lạ: ${a.ca}`);
  }
} finally {
  await chrome.dong?.();
}
process.exit(0);
