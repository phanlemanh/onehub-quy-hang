// Đi năm bước của màn Nhập Excel trên máy dev dãy G (cổng 3493) và chụp từng bước ở một khổ — dùng cho bước dựng (nhìn màn)
// và cho eval ui-check E9. Phiên người mẫu qua QH_COOKIE; tệp qua QH_TEP (mặc định mẫu B của sàn thử).
//   QH_COOKIE='…' QH_KHO=1440 QH_RA=<thư mục> node _acceptance/man-nhap-excel/thu/chup-man.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = process.env.QH_RA ?? path.join(GOC, "_acceptance/man-nhap-excel/evidence");
const KHO = Number(process.env.QH_KHO ?? 1440);
const TEP = process.env.QH_TEP ?? path.join(GOC, "packages/db/seed/mau/mau-b.xlsx");
mkdirSync(RA, { recursive: true });
const cookie = (process.env.QH_COOKIE ?? "").split(";").map((s) => s.trim()).filter(Boolean);
if (!cookie.length) throw new Error("thiếu QH_COOKIE");

const chrome = await moChrome();
const t = await chrome.trang(KHO, KHO < 768 ? 812 : 900);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const bam = (chu) => t.tinh(`(() => { const b = [...document.querySelectorAll("button, a")].find((x) => x.textContent.trim().startsWith(${JSON.stringify(chu)}) && !x.disabled); if (!b) return false; b.click(); return true; })()`);
const chup = async (ten) => {
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(500);
  writeFileSync(path.join(RA, `E9-${ten}-${KHO}.png`), await t.chup());
  console.log(`E9-${ten}-${KHO}.png`);
};
try {
  await t.datCookie(cookie);
  await t.di("/imports/new");
  await t.cho(`!!document.querySelector('input[type=file]') && !document.querySelector('input[type=file]').disabled`);
  const { root } = await t.gui("DOM.getDocument");
  const { nodeId } = await t.gui("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await t.gui("DOM.setFileInputFiles", { nodeId, files: [TEP] });
  await t.cho(`document.body.innerText.includes("dòng")`);
  await chup("1-tai");
  await bam("Tiếp");
  await t.cho(`document.body.innerText.includes("Cột trong tệp")`);
  await chup("2-ghep");
  await bam("Tiếp");
  await t.cho(`document.body.innerText.includes("Từng ô sẽ ghi gì")`);
  await chup("3-xem-truoc");
  await bam("Tiếp");
  await t.cho(`document.body.innerText.includes("Máy chủ đã xem thử")`, 120000);
  await chup("4-trung");
  await bam("Tiếp");
  await t.cho(`document.body.innerText.includes("căn mới, cập nhật") || document.body.innerText.includes("Không dòng nào")`);
  await chup("5-tom-tat");
  if (process.env.QH_GHI === "1") {
    await bam("Ghi");
    await t.cho(`document.body.innerText.includes("Đã ghi vào Quỹ hàng")`, 120000);
    await chup("6-xong");
  }
} finally {
  t.dong();
  chrome.dong();
}
