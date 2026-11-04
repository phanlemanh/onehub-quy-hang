// Chụp màn Nhập Excel nhớ mẫu trên máy dev dãy G (cổng 3493) cho eval ui-check E7 (hàng 67). MỖI lần --ca ghi-lan-dau dựng
// một sàn MỚI (Postgres dãy G), gắn người mẫu dau-chu-1 làm Đầu chủ, ghi sàn ấy vào tệp tạm để các ca sau dùng lại — bộ
// nhớ của sàn mới rỗng, dữ liệu của lần chấm khác không lọt vào. Mỗi ca in một dòng JSON và chụp E7-<ca>-<khổ>.png.
//   node _acceptance/nhap-nho-mau/thu/chup-mau.mjs --ca ghi-lan-dau|nhap-lai|mot-phan|loi-mau --kho 1440|375 [--ra <thư mục>]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { values: a } = parseArgs({ options: { kho: { type: "string", default: "1440" }, ca: { type: "string", default: "nhap-lai" }, ra: { type: "string" } } });
const RA = a.ra ?? path.join(GOC, "_acceptance/nhap-nho-mau/evidence");
const KHO = Number(a.kho);
const MAU_B = path.join(GOC, "packages/db/seed/mau/mau-b.xlsx");
const BAN = path.join(GOC, "_acceptance/man-nhap-excel/thu/ban-gia.xlsx");
const SAN = path.join(RA, ".san-e7.json");
const EMAIL = "dau-chu-1@mau.quy-hang.test";
mkdirSync(RA, { recursive: true });

const sql = (q) => execFileSync("docker", ["exec", "quy-hang-db-dkn-G", "psql", "-U", "postgres", "-tAc", q]).toString().trim();
function sanMoi() {
  const id = sql(`insert into companies (name) values ('[Sàn thử E7 ${Date.now()}]') returning id`).split("\n")[0];
  sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{listing_agent}' from identity."user" where email = '${EMAIL}'`);
  writeFileSync(SAN, JSON.stringify({ id }));
  return id;
}
const sanDangDung = () => {
  if (!existsSync(SAN)) throw new Error("chưa có sàn thử — chạy --ca ghi-lan-dau trước");
  return JSON.parse(readFileSync(SAN, "utf8")).id;
};
function cookieCua(email, san) {
  const j = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs"), "--phien", email], { cwd: GOC }).toString());
  return [...j.cookie.filter((c) => c.name !== "qh_san").map((c) => `${c.name}=${c.value}`), `qh_san=${san}`];
}

const chrome = await moChrome();
const t = await chrome.trang(KHO, KHO < 768 ? 812 : 900);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chu = () => t.tinh("document.body.innerText");
const bam = (nhan) =>
  t.tinh(`(() => { const b = [...document.querySelectorAll("button, a")].find((x) => x.textContent.trim().startsWith(${JSON.stringify(nhan)}) && !x.disabled); if (!b) return false; b.click(); return true; })()`);
const thay = (s) => t.cho(`document.body.innerText.includes(${JSON.stringify(s)})`, 120000);
const ghiNhan = (ca, thayGi) => console.log(JSON.stringify({ ca, kho: KHO, ...thayGi }));
async function chup(ten) {
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(500);
  writeFileSync(path.join(RA, `E7-${ten}-${KHO}.png`), await t.chup());
}
async function moMan(san) {
  await t.datCookie(cookieCua(EMAIL, san));
  await t.di("/imports/new");
  await t.cho(`document.readyState === "complete" && document.body.innerText.includes("Nhập Excel")`);
  await ngu(800); // màn đọc mẫu đã nhớ một lần khi mở
}
async function chonTep(p) {
  await t.cho(`!!document.querySelector('input[type=file]') && !document.querySelector('input[type=file]').disabled`);
  const { root } = await t.gui("DOM.getDocument");
  const { nodeId } = await t.gui("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await t.gui("DOM.setFileInputFiles", { nodeId, files: [p] });
}
async function toiGhep(ten) {
  await thay(`${ten} ·`);
  await bam("Tiếp");
  await thay("Cột trong tệp");
}
/** Dải báo và nhãn ở bước Ghép cột. */
async function docGhep() {
  const c = await chu();
  const m = c.match(/Ghép theo mẫu đã nhớ — (\d+)\/(\d+) cột/);
  return { daiBao: m?.[0] ?? null, soCotTheoMau: m ? Number(m[1]) : 0, tongCot: m ? Number(m[2]) : null, nhanTheoMau: (c.match(/· theo mẫu/g) ?? []).length, baoLoiMau: c.includes("Không đọc được mẫu đã nhớ") };
}
const daGhi = (san) => Number(sql(`select count(*) from imports where company_id = '${san}' and status = 'committed'`));

try {
  switch (a.ca) {
    case "ghi-lan-dau": {
      const san = sanMoi();
      const soLanDaGhiTruoc = daGhi(san);
      await moMan(san);
      await chonTep(MAU_B);
      await toiGhep("mau-b.xlsx");
      const truocDoi = await docGhep();
      // Đổi đích cột «Ghi chú» sang «Giữ làm ghi chú» như người chỉnh tay.
      await t.tinh(`document.getElementById("nhap-dich-14")?.click()`);
      await t.cho(`[...document.querySelectorAll('[role=option]')].some((o) => o.textContent.trim() === "Giữ làm ghi chú")`);
      await t.tinh(`[...document.querySelectorAll('[role=option]')].find((o) => o.textContent.trim() === "Giữ làm ghi chú").click()`);
      await ngu(300);
      await chup("1-ghi-lan-dau");
      {
        for (const cho of ["Từng ô sẽ ghi gì", "Máy chủ đã xem thử", "căn mới, cập nhật"]) {
          await bam("Tiếp");
          await thay(cho);
        }
        await bam("Ghi vào Quỹ hàng");
        await thay("Đã ghi vào Quỹ hàng");
      }
      ghiNhan("ghi-lan-dau", { soLanDaGhiTruoc, ...truocDoi, daGhiSau: daGhi(san) });
      break;
    }
    case "nhap-lai": {
      const san = sanDangDung();
      await moMan(san);
      await chonTep(MAU_B);
      await toiGhep("mau-b.xlsx");
      const g = await docGhep();
      const dichGhiChu = await t.tinh(`document.getElementById("nhap-dich-14")?.textContent.trim() ?? null`);
      ghiNhan("nhap-lai", { ...g, dichGhiChu });
      await chup("2-nhap-lai");
      break;
    }
    case "mot-phan": {
      const san = sanDangDung();
      await moMan(san);
      await chonTep(BAN);
      await toiGhep("ban-gia.xlsx");
      ghiNhan("mot-phan", await docGhep());
      await chup("3-mot-phan");
      break;
    }
    case "loi-mau": {
      const san = sanDangDung();
      await t.gui("Network.enable");
      await t.gui("Network.setBlockedURLs", { urls: ["*/api/v1/imports/templates*"] });
      await moMan(san);
      await chonTep(MAU_B);
      await toiGhep("mau-b.xlsx");
      ghiNhan("loi-mau", await docGhep());
      await chup("4-loi-mau");
      break;
    }
    default:
      throw new Error(`ca lạ: ${a.ca}`);
  }
} finally {
  t.dong();
  chrome.dong();
}
