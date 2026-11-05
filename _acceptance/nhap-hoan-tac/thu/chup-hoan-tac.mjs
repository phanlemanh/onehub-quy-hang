// Chụp hoàn tác lần nhập trên máy dev dãy G (cổng 3493) cho eval ui-check E8b (hàng 66). --ca trong dựng một sàn MỚI (Postgres
// dãy G), gắn người mẫu dau-chu-1 làm Đầu chủ và ghi sàn vào tệp tạm cho các ca sau. Mỗi ca in một dòng JSON và chụp
// E8b-<ca>-<khổ>.png. Thứ tự: trong → sau-ghi → xac-nhan → da-hoan-tac → da-sua-sau → loi-giua-chung (cùng một khổ).
//   node _acceptance/nhap-hoan-tac/thu/chup-hoan-tac.mjs --ca <ca> --kho 1440|375 [--ra <thư mục>]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { values: a } = parseArgs({ options: { kho: { type: "string", default: "1440" }, ca: { type: "string", default: "trong" }, ra: { type: "string" } } });
const RA = a.ra ?? path.join(GOC, "_acceptance/nhap-hoan-tac/evidence");
const KHO = Number(a.kho);
const MAU_B = path.join(GOC, "packages/db/seed/mau/mau-b.xlsx");
const BAN = path.join(GOC, "_acceptance/man-nhap-excel/thu/ban-gia.xlsx");
const SAN = path.join(RA, `.san-e8b-${KHO}.json`);
const EMAIL = "dau-chu-1@mau.quy-hang.test";
mkdirSync(RA, { recursive: true });

const sql = (q) => execFileSync("docker", ["exec", "quy-hang-db-dkn-G", "psql", "-U", "postgres", "-tAc", q]).toString().trim();
function sanMoi() {
  const id = sql(`insert into companies (name) values ('[Sàn thử E8b ${Date.now()}]') returning id`).split("\n")[0];
  sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{listing_agent}' from identity."user" where email = '${EMAIL}'`);
  writeFileSync(SAN, JSON.stringify({ id }));
  return id;
}
const sanDangDung = () => {
  if (!existsSync(SAN)) throw new Error("chưa có sàn thử — chạy --ca trong trước");
  return JSON.parse(readFileSync(SAN, "utf8")).id;
};
function cookieCua(email, san) {
  const j = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs"), "--phien", email], { cwd: GOC }).toString());
  return [...j.cookie.filter((c) => c.name !== "qh_san").map((c) => `${c.name}=${c.value}`), `qh_san=${san}`];
}
/** Lần nhập mới nhất đã ghi (hay đã hoàn tác) của sàn. */
const lanMoiNhat = (san) => sql(`select id from imports where company_id = '${san}' and status in ('committed','undone') order by created_at desc limit 1`);
const hangTao = (lan) => sql(`select listing_id from import_rows where import_id = '${lan}' and action = 'create' order by row_number`).split("\n").filter(Boolean);

const chrome = await moChrome();
const t = await chrome.trang(KHO, KHO < 768 ? 812 : 900);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chu = () => t.tinh("document.body.innerText");
const HOP = `document.querySelector('[role=alertdialog]')`;
const chuHop = () => t.tinh(`${HOP}?.innerText ?? ""`);
/** Bấm nút mở (không tắt) có chữ bắt đầu bằng `nhan`, trong hộp xác nhận khi `trongHop`. */
const bam = (nhan, trongHop = false) =>
  t.tinh(
    `(() => { const g = ${trongHop ? HOP : "document"}; const b = g && [...g.querySelectorAll("button, a")].find((x) => x.textContent.trim().startsWith(${JSON.stringify(nhan)}) && !x.disabled); if (!b) return false; b.click(); return true; })()`,
  );
const thay = (s) => t.cho(`document.body.innerText.includes(${JSON.stringify(s)})`, 120000);
const ghiNhan = (ca, thayGi) => console.log(JSON.stringify({ ca, kho: KHO, ...thayGi }));
async function chup(ten) {
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(500);
  writeFileSync(path.join(RA, `E8b-${ten}-${KHO}.png`), await t.chup());
}
async function moMan(san) {
  await t.datCookie(cookieCua(EMAIL, san));
  await t.di("/imports/new");
  await t.cho(`document.readyState === "complete" && document.body.innerText.includes("Nhập Excel")`);
  const DS = `document.querySelector('section[aria-label="Lần nhập gần đây"]')`;
  await t.cho(`!!${DS} && !${DS}.innerText.includes("Đang tải lần nhập gần đây")`, 60000);
}
async function chonTep(p) {
  await t.cho(`!!document.querySelector('input[type=file]') && !document.querySelector('input[type=file]').disabled`);
  const { root } = await t.gui("DOM.getDocument");
  const { nodeId } = await t.gui("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await t.gui("DOM.setFileInputFiles", { nodeId, files: [p] });
}
async function ghiTep(p, ten) {
  await chonTep(p);
  await thay(`${ten} ·`);
  for (const cho of ["Cột trong tệp", "Từng ô sẽ ghi gì", "Máy chủ đã xem thử", "căn mới, cập nhật"]) {
    await bam("Tiếp");
    await thay(cho);
  }
  await bam("Ghi vào Quỹ hàng");
  await thay("Đã ghi vào Quỹ hàng");
}
/** Mở hộp hoàn tác từ dòng đầu của «Lần nhập gần đây» và chờ bản xem thử. */
async function moHopTuDanhSach() {
  await t.cho(`[...document.querySelectorAll('section[aria-label="Lần nhập gần đây"] button')].some((b) => b.textContent.trim() === "Hoàn tác")`);
  await t.tinh(`[...document.querySelectorAll('section[aria-label="Lần nhập gần đây"] button')].find((b) => b.textContent.trim() === "Hoàn tác").click()`);
  await t.cho(`(${HOP}?.innerText ?? "").includes("Gỡ ")`, 60000);
}
const tom = (c) => {
  const m = c.match(/Gỡ (\d+) căn khỏi Quỹ hàng · Trả giá cũ cho (\d+) căn · (\d+) căn không hoàn tác được/);
  return { tomTat: m?.[0] ?? null, go: m ? Number(m[1]) : null, traGia: m ? Number(m[2]) : null, khongDuoc: m ? Number(m[3]) : null };
};
/** Căn của lần nhập còn ở Bảng hàng (đọc qua API như màn Bảng hàng). */
const conOBangHang = async (ids) => t.tinh(`fetch("/api/v1/listings").then((r) => r.json()).then((ds) => ds.filter((h) => ${JSON.stringify(ids)}.includes(h.id)).length)`);

try {
  switch (a.ca) {
    case "trong": {
      const san = sanMoi();
      await moMan(san);
      ghiNhan("trong", { soLanTruoc: Number(sql(`select count(*) from imports where company_id = '${san}'`)), chuaCo: (await chu()).includes("Chưa có lần nhập nào") });
      await chup("1-trong");
      break;
    }
    case "sau-ghi": {
      const san = sanDangDung();
      await moMan(san);
      await ghiTep(MAU_B, "mau-b.xlsx");
      const coNut = (await chu()).includes("Hoàn tác lần nhập này");
      await bam("Hoàn tác lần nhập này");
      await t.cho(`(${HOP}?.innerText ?? "").includes("Gỡ ")`, 60000);
      ghiNhan("sau-ghi", { coNut, soDongTao: hangTao(lanMoiNhat(san)).length, ...tom(await chuHop()) });
      await chup("2-sau-ghi");
      break;
    }
    case "xac-nhan": {
      const san = sanDangDung();
      const lan = lanMoiNhat(san);
      await moMan(san);
      await moHopTuDanhSach();
      const truoc = await conOBangHang(hangTao(lan));
      await bam("Hoàn tác", true);
      await t.cho(`(${HOP}?.innerText ?? "").includes("Đã hoàn tác lần nhập")`, 120000);
      ghiNhan("xac-nhan", { conOBangHangTruoc: truoc, conOBangHangSau: await conOBangHang(hangTao(lan)), ...tom(await chuHop()) });
      await chup("3-xac-nhan");
      break;
    }
    case "da-hoan-tac": {
      const san = sanDangDung();
      await moMan(san);
      const c = await t.tinh(`document.querySelector('section[aria-label="Lần nhập gần đây"]')?.innerText ?? ""`);
      ghiNhan("da-hoan-tac", { coNhan: c.includes("Đã hoàn tác"), soNutHoanTac: (c.match(/^Hoàn tác$/gm) ?? []).length });
      await chup("4-da-hoan-tac");
      break;
    }
    case "da-sua-sau": {
      const san = sanDangDung();
      await moMan(san);
      await ghiTep(BAN, "ban-gia.xlsx");
      const lan = lanMoiNhat(san);
      const sua = hangTao(lan)[0];
      // Sửa một căn của lần nhập qua lệnh hàng thường (như sửa ở Bảng hàng).
      const kq = await t.tinh(
        `fetch("/api/v1/listings/${sua}").then((r) => r.json()).then((h) => fetch("/api/v1/listings/${sua}/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "details_changed", payload: { furnished: "Cơ bản" }, expectedVersion: h.version }) })).then((r) => r.status)`,
      );
      await moMan(san);
      await moHopTuDanhSach();
      const c = await chuHop();
      ghiNhan("da-sua-sau", { suaTrangThai: kq, ...tom(c), coLyDo: c.includes("Đã có người sửa sau lần nhập") });
      await chup("5-da-sua-sau");
      break;
    }
    case "loi-giua-chung": {
      const san = sanDangDung();
      await moMan(san);
      await moHopTuDanhSach();
      await t.gui("Network.enable");
      await t.gui("Network.setBlockedURLs", { urls: ["*/undo"] });
      await bam("Hoàn tác", true);
      await t.cho(`(${HOP}?.innerText ?? "").includes("Hoàn tác chưa xong")`, 60000);
      const loi = (await chuHop()).includes("Hoàn tác chưa xong — bấm lại để làm tiếp");
      await chup("6-loi-giua-chung");
      await t.gui("Network.setBlockedURLs", { urls: [] });
      await bam("Hoàn tác tiếp", true);
      await t.cho(`(${HOP}?.innerText ?? "").includes("Đã hoàn tác lần nhập")`, 120000);
      ghiNhan("loi-giua-chung", { baoChuaXong: loi, xongSauKhiBamLai: (await chuHop()).includes("Đã hoàn tác lần nhập") });
      break;
    }
    default:
      throw new Error(`ca lạ: ${a.ca}`);
  }
} finally {
  t.dong();
  chrome.dong();
}
