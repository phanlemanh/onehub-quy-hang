// Đi màn Nhập Excel trên máy dev dãy G (cổng 3493) và chụp — dùng cho bước dựng (nhìn màn) và cho eval ui-check E9. Tự
// đăng nhập người mẫu qua dung-g.mjs; mỗi ca in một dòng JSON «đã thấy gì» và chụp ảnh E9-<ca>-<khổ>.png.
//   node _acceptance/man-nhap-excel/thu/chup-man.mjs --kho 1440 [--ghi] [--ca luong|xls|rong|khong-quyen|bo-het|loi-mang|truong-nhom|roi-trang] [--ra <thư mục>]
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { values: a } = parseArgs({ options: { kho: { type: "string", default: "1440" }, ghi: { type: "boolean" }, ca: { type: "string", default: "luong" }, ra: { type: "string" } } });
const RA = a.ra ?? path.join(GOC, "_acceptance/man-nhap-excel/evidence");
const KHO = Number(a.kho);
const MAU_B = path.join(GOC, "packages/db/seed/mau/mau-b.xlsx");
mkdirSync(RA, { recursive: true });

function cookieCua(email) {
  const j = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs"), "--phien", email], { cwd: GOC }).toString());
  return j.cookie.map((c) => `${c.name}=${c.value}`);
}
const tam = mkdtempSync(path.join(tmpdir(), "qh-nhap-"));
const tepTam = (ten, noiDung) => {
  const p = path.join(tam, ten);
  writeFileSync(p, noiDung);
  return p;
};

const chrome = await moChrome();
const t = await chrome.trang(KHO, KHO < 768 ? 812 : 900);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chu = () => t.tinh("document.body.innerText");
const bam = (nhan) =>
  t.tinh(`(() => { const b = [...document.querySelectorAll("button, a")].find((x) => x.textContent.trim().startsWith(${JSON.stringify(nhan)}) && !x.disabled); if (!b) return false; b.click(); return true; })()`);
const thay = (s) => t.cho(`document.body.innerText.includes(${JSON.stringify(s)})`, 120000);
const tiepKhoa = () => t.tinh(`[...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Tiếp"))?.disabled === true`);
const ghiNhan = (ca, thayGi) => console.log(JSON.stringify({ ca, kho: KHO, ...thayGi }));
async function chup(ten) {
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(500);
  writeFileSync(path.join(RA, `E9-${ten}-${KHO}.png`), await t.chup());
}
async function moMan(email) {
  await t.datCookie(cookieCua(email));
  await t.di("/imports/new");
  await t.cho(`document.readyState === "complete" && document.body.innerText.includes("Nhập Excel")`);
}
async function chonTep(p) {
  await t.cho(`!!document.querySelector('input[type=file]') && !document.querySelector('input[type=file]').disabled`);
  const { root } = await t.gui("DOM.getDocument");
  const { nodeId } = await t.gui("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await t.gui("DOM.setFileInputFiles", { nodeId, files: [p] });
}
/** Từ bước tải tới tóm tắt bằng nút Tiếp. */
async function toiTomTat() {
  await thay("mau-b.xlsx ·");
  for (const cho of ["Cột trong tệp", "Từng ô sẽ ghi gì", "Máy chủ đã xem thử", "căn mới, cập nhật"]) {
    await bam("Tiếp");
    await thay(cho);
  }
}

try {
  switch (a.ca) {
    case "luong": {
      await moMan("dau-chu-1@mau.quy-hang.test");
      await chonTep(MAU_B);
      await thay("mau-b.xlsx ·");
      await chup("1-tai");
      await bam("Tiếp");
      await thay("Cột trong tệp");
      ghiNhan("2-ghep", { cotNguonChiHinhDang: !(await chu()).includes("0900 000") });
      await chup("2-ghep");
      await bam("Tiếp");
      await thay("Từng ô sẽ ghi gì");
      await chup("3-xem-truoc");
      await bam("Tiếp");
      await thay("Máy chủ đã xem thử");
      await chup("4-trung");
      await bam("Tiếp");
      await thay("căn mới, cập nhật");
      ghiNhan("5-tom-tat", { cau: (await chu()).match(/Ghi \d+ căn mới, cập nhật \d+, tin bổ sung \d+, bỏ \d+/)?.[0] ?? null });
      await chup("5-tom-tat");
      if (a.ghi) {
        await bam("Ghi vào Quỹ hàng");
        await thay("Đã ghi vào Quỹ hàng");
        ghiNhan("6-xong", { coLoiVeBangHang: (await chu()).includes("Mở Bảng hàng") });
        await chup("6-xong");
      }
      break;
    }
    case "xls":
    case "rong": {
      await moMan("dau-chu-1@mau.quy-hang.test");
      await chonTep(a.ca === "xls" ? tepTam("bang-hang.xls", Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0])) : tepTam("bang-hang.csv", ""));
      await thay("Không đọc được tệp này");
      const c = await chu();
      ghiNhan(a.ca, { huongDanLuuLai: c.includes("Lưu thành"), tepRong: c.includes("Tệp chưa có dòng nào") });
      await chup(a.ca);
      break;
    }
    case "khong-quyen": {
      await moMan("dau-khach@mau.quy-hang.test");
      await thay("Chỉ Đầu chủ và Trưởng nhóm nhập được");
      ghiNhan("khong-quyen", { coOChonTep: await t.tinh("!!document.querySelector('input[type=file]')") });
      await chup("khong-quyen");
      break;
    }
    case "bo-het": {
      await moMan("dau-chu-1@mau.quy-hang.test");
      await chonTep(MAU_B);
      await thay("mau-b.xlsx ·");
      for (const cho of ["Cột trong tệp", "Từng ô sẽ ghi gì", "Máy chủ đã xem thử"]) {
        await bam("Tiếp");
        await thay(cho);
      }
      for (let i = 0; i < 60 && (await bam("Bỏ")); i++) await ngu(100);
      await bam("Xem thử lại");
      await thay("Không dòng nào sẽ được ghi");
      ghiNhan("bo-het", { tiepKhoa: await tiepKhoa() });
      await chup("bo-het");
      break;
    }
    case "loi-mang": {
      await moMan("dau-chu-2@mau.quy-hang.test");
      await chonTep(MAU_B);
      await toiTomTat();
      await t.gui("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      await bam("Ghi vào Quỹ hàng");
      await thay("chưa ghi được");
      ghiNhan("loi-mang", { nutThuLai: (await chu()).includes("Thử lại gói") });
      await chup("loi-mang");
      await t.gui("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      await bam("Thử lại gói");
      await thay("Đã ghi vào Quỹ hàng");
      ghiNhan("loi-mang-thu-lai", { xong: true });
      break;
    }
    case "truong-nhom": {
      await moMan("truong-nhom@mau.quy-hang.test");
      await chonTep(MAU_B);
      await thay("Đầu chủ giữ căn");
      await thay("mau-b.xlsx ·");
      ghiNhan("truong-nhom", { tiepKhoaKhiChuaChon: await tiepKhoa() });
      await chup("truong-nhom");
      break;
    }
    case "roi-trang": {
      await moMan("dau-chu-1@mau.quy-hang.test");
      await chonTep(MAU_B);
      await thay("mau-b.xlsx ·");
      const hoi = await t.tinh(`(() => { const e = new Event("beforeunload", { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; })()`);
      ghiNhan("roi-trang", { trinhDuyetHoiLai: hoi });
      break;
    }
    default:
      throw new Error(`ca lạ: ${a.ca}`);
  }
} finally {
  t.dong();
  chrome.dong();
}
