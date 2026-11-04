// Phép nhìn màn hàng 42 trên chỗ thử dãy D (chạy dung-d.mjs trước). Mỗi bước in một dòng JSON (đã thấy gì) và chụp ảnh
// vào thư mục --ra. Dùng trình duyệt CDP của hồ sơ bang-hang-kieu-sheet (Chrome có sẵn).
//   node _acceptance/hom-nay-truong-nhom/thu/chay-ui.mjs --e7 --e6 --e10 --ra _acceptance/hom-nay-truong-nhom/evidence
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3476";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const arg = (k) => process.argv.includes(k);
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/hom-nay-truong-nhom/evidence");
mkdirSync(RA, { recursive: true });
const { cookie } = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/hom-nay-truong-nhom/phien.json"), "utf8"));
const ck = cookie["truong-nhom"].split(";").map((s) => s.trim()).filter(Boolean);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

const docMan = `(() => {
  const chu = document.body.innerText;
  const o = {};
  for (const ten of ["Lead quá hạn", "Ngoại lệ", "Hàng cũ"]) {
    const el = [...document.querySelectorAll("*")].find((e) => e.childElementCount === 0 && e.textContent.trim() === ten);
    let p = el; let so = null;
    for (let i = 0; i < 6 && p && so === null; i++) { p = p.parentElement; const m = p && p.innerText.match(new RegExp(ten + "\\\\s+(\\\\d+)")); if (m) so = Number(m[1]); }
    o[ten] = so;
  }
  return JSON.stringify({ o, coGiaoLai: chu.includes("Giao lại"), coTheoNguoi: chu.includes("Theo đầu chủ") || chu.includes("đầu chủ"), coToanSan: chu.includes("Chỉ tính căn toàn sàn"), coPlaceholder: chu.includes("Đang dựng"), moMayTinh: chu.includes("mở trên máy tính"), soGiaoLai: (chu.match(/Giao lại/g) || []).length });
})()`;

const chrome = await moChrome();
const mo = async (w, hgt) => {
  const t = await chrome.trang(w, hgt);
  await t.datCookie(ck);
  await t.di("/today");
  await t.cho(`document.readyState === "complete" && (document.body.innerText.includes("Lead quá hạn") || document.body.innerText.includes("mở trên máy tính"))`);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(1500);
  return t;
};
const ghi = async (t, ten, buoc) => {
  const thay = JSON.parse(await t.tinh(docMan));
  writeFileSync(path.join(RA, `${ten}.png`), await t.chup());
  console.log(JSON.stringify({ buoc, anh: `${ten}.png`, ...thay }));
  return thay;
};
try {
  if (arg("--e7")) {
    const t = await mo(1440, 900);
    await ghi(t, "E7-bang-dieu-khien-1440", "e7");
    t.dong();
  }
  if (arg("--e6")) {
    const t = await mo(1440, 900);
    const truoc = await ghi(t, "E6-truoc-1440", "e6-truoc");
    // Bấm «Giao lại» ở dòng «Quá hạn nhận», chọn đầu chủ khác, xác nhận.
    const bam = await t.tinh(`(() => {
      const dong = [...document.querySelectorAll("*")].filter((e) => e.innerText && e.innerText.includes("Quá hạn nhận") && e.querySelector("button")).sort((a, b) => a.innerText.length - b.innerText.length)[0];
      const nut = dong && [...dong.querySelectorAll("button")].find((b) => b.innerText.includes("Giao lại"));
      if (!nut) return "khong-thay-nut"; nut.click(); return "da-bam";
    })()`);
    await ngu(800);
    const chon = await t.tinh(`(() => {
      // Chọn đầu chủ đầu tiên còn chọn được — người đang giữ lead bị tắt trong hộp, và lead trên chỗ thử có thể đã đổi người.
      const muc = [...document.querySelectorAll("[role=option], [cmdk-item], [data-slot=command-item]")].find((e) => e.getAttribute("aria-disabled") !== "true" && e.getAttribute("data-disabled") !== "true");
      if (!muc) return "khong-thay-muc:" + [...document.querySelectorAll("[role=option], [cmdk-item], [data-slot=command-item]")].map((e) => e.innerText).join("|");
      muc.click(); return "da-chon:" + muc.innerText.split("\\n")[0];
    })()`);
    await ngu(600);
    const xn = await t.tinh(`(() => { const b = [...document.querySelectorAll("button")].find((x) => /^(Giao|Xác nhận|Giao cho)/.test(x.innerText.trim()) && !x.innerText.includes("Giao lại")); if (b) { b.click(); return "da-xac-nhan:" + b.innerText.trim(); } return "khong-can-xac-nhan"; })()`);
    await ngu(2500);
    const sau = await ghi(t, "E6-sau-1440", "e6-sau");
    console.log(JSON.stringify({ buoc: "e6-ket-qua", bam, chon, xn, leadQuaHanTruoc: truoc.o["Lead quá hạn"], leadQuaHanSau: sau.o["Lead quá hạn"], soGiaoLaiTruoc: truoc.soGiaoLai, soGiaoLaiSau: sau.soGiaoLai }));
    t.dong();
  }
  if (arg("--e10")) {
    const t = await mo(390, 844);
    await ghi(t, "E10-dien-thoai-390", "e10");
    t.dong();
  }
} finally {
  chrome.dong();
}
