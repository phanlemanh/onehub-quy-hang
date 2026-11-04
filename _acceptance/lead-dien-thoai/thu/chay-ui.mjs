// Phép nhìn màn hàng 51 trên chỗ thử dãy D (chạy dung-d.mjs trước). Mỗi ca in một dòng JSON (đã thấy gì) và chụp ảnh vào
// thư mục --ra. Chrome không đầu qua CDP của hồ sơ bang-hang-kieu-sheet; mất mạng giả bằng Network.emulateNetworkConditions,
// lời gọi đếm và giữ chậm bằng một lớp bọc fetch đặt vào trang trước khi tải.
//   node _acceptance/lead-dien-thoai/thu/chay-ui.mjs --e1 --e2 … --ra _acceptance/lead-dien-thoai/evidence
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3476";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const arg = (k) => process.argv.includes(k);
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/lead-dien-thoai/evidence");
mkdirSync(RA, { recursive: true });
const phien = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/lead-dien-thoai/phien.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const h = { "content-type": "application/json", origin: URL_GOC };
const api = async (ai, method, duong, body) => {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { ...h, cookie: phien.cookie[ai] }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${duong} → ${r.status} ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
};
const nhip = () => fetch(`${URL_GOC}/api/v1/jobs/lead-tick`, { method: "POST", headers: { ...h, authorization: `Bearer ${phien.job}` } });
let soMoi = Math.floor(Math.random() * 80) + 10;
const soMau = () => `0900 000 0${String(soMoi++ % 90 + 10)}`;

// Lớp bọc fetch: đếm POST /api/v1/leads, giữ chậm GET /api/v1/leads khi window.__cham > 0.
const BOC = `(() => { if (window.__boc) return; window.__boc = true; window.__soPost = 0; window.__cham = 0; const f = window.fetch;
  window.fetch = async (u, o) => { const s = String(u); const m = (o && o.method) || "GET";
    if (m === "POST" && /\\/api\\/v1\\/leads$/.test(s)) window.__soPost++;
    if (m === "GET" && /\\/api\\/v1\\/leads$/.test(s.split("?")[0]) && window.__cham) await new Promise((r) => setTimeout(r, window.__cham));
    return f(u, o); }; })()`;

const chrome = await moChrome();
async function mo(ai, duong, w = 390, hgt = 844) {
  const t = await chrome.trang(w, hgt);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: BOC });
  await t.datCookie(phien.cookie[ai].split(";").map((s) => s.trim()).filter(Boolean));
  await t.di(duong);
  // Lần biên dịch đầu của máy dev chậm: chờ thân trang có nội dung (ô nhập, vùng Lead đã nhập hay khối báo).
  await t.cho(`document.readyState === "complete" && !!document.querySelector("[data-bo-cuc-goc]") && !!document.querySelector("#so-chu, section[aria-label], [data-trang-thai], [data-slot=alert]")`, 120000);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(1200);
  return t;
}
const matMang = (t, tat) => t.gui("Network.emulateNetworkConditions", { offline: tat, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
const chup = async (t, ten) => writeFileSync(path.join(RA, `${ten}.png`), await t.chup());
const in1 = (o) => console.log(JSON.stringify(o));
const chu = (t) => t.tinh("document.body.textContent");
const bam = (t, chuNut) => t.tinh(`(() => { const b = [...document.querySelectorAll("button,[role=tab],a")].find((x) => x.offsetParent !== null && x.textContent.trim() === ${JSON.stringify(chuNut)}); if (!b) return false; b.click(); return true; })()`);

/** Điền ô nhận lead; `bo` là tên mục bỏ trống. */
async function dien(t, { bo = null, so = soMau() } = {}) {
  await t.tinh(`(() => {
    const dat = (el, v) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true })); };
    ${bo === "so" ? "" : `dat(document.querySelector("#so-chu"), ${JSON.stringify(so)});`}
    ${bo === "gia" ? "" : `dat(document.querySelector("#gia"), "3200000000");`}
    return true; })()`);
  const nut = (c) => bam(t, c);
  if (bo !== "nhu-cau") await nut("Bán");
  if (bo !== "gia") await nut("Bao phí");
  if (bo !== "thoi-gian") await nut("Ngay");
  if (bo !== "toa") {
    await t.tinh(`(() => { const b = document.querySelector('[aria-label="Toà"]'); b && b.click(); return !!b; })()`);
    await ngu(400);
    await t.tinh(`(() => { const o = [...document.querySelectorAll("[role=option]")].find((x) => x.textContent.trim() === "Toà A"); o && o.click(); return !!o; })()`);
    await ngu(300);
  }
  return so;
}
const gui = async (t) => (await bam(t, "Gửi lead"), await ngu(2000));
const docMuc = (t) =>
  t.tinh(`JSON.stringify({ so: document.querySelector("#so-chu")?.value, gia: document.querySelector("#gia")?.value,
    nut: [...document.querySelectorAll('[aria-pressed="true"],[data-pressed]')].map((x) => x.textContent.trim()), toa: document.querySelector('[aria-label="Toà"]')?.textContent.trim() })`).then(JSON.parse);
const loiO = (t) =>
  t.tinh(`JSON.stringify([...document.querySelectorAll('[data-invalid="true"] label, [data-invalid] label')].map((x) => x.textContent.trim()))`).then(JSON.parse);
const soLeadCua = async (ai) => (await api(ai, "GET", "/api/v1/leads")).length;
const nacDau = (t) =>
  t.tinh(`(() => { const r = document.querySelector('section[aria-label="Lead đã nhập"] tbody tr'); return r ? JSON.stringify({ dong: r.textContent, nac: r.querySelector('[data-slot="badge"]')?.textContent.trim() ?? null }) : "null"; })()`).then(JSON.parse);
const cuonNgang = (t) => t.tinh("document.documentElement.scrollWidth > document.documentElement.clientWidth");

try {
  if (arg("--e1")) {
    const t = await mo("telesales", "/leads/new");
    const o = JSON.parse(
      await t.tinh(`JSON.stringify({ soMuc: document.querySelectorAll('form [data-slot="field"]').length, inputModeSo: document.querySelector("#so-chu")?.inputMode,
        inputModeGia: document.querySelector("#gia")?.inputMode, coPhanDaNhap: [...document.querySelectorAll("[role=tab]")].some((x) => x.textContent.trim() === "Lead đã nhập" && x.offsetParent !== null) })`),
    );
    await chup(t, "E1-nhap-390");
    const nut = await t.tinh(`(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Gửi lead"); b.scrollIntoView(); const r = b.getBoundingClientRect(); return r.bottom <= innerHeight && r.width > 0; })()`);
    in1({ ca: "e1", cuonNgang: await cuonNgang(t), ...o, nutGuiBamDuoc: nut });
    t.dong();
  }
  if (arg("--e2")) {
    const ket = [];
    for (const bo of ["so", "toa", "nhu-cau", "gia", "thoi-gian"]) {
      const t = await mo("telesales", "/leads/new");
      await dien(t, { bo });
      await gui(t);
      ket.push({ bo, loiO: await loiO(t), soPostLead: await t.tinh("window.__soPost") });
      if (bo === "so") await chup(t, "E2-thieu-so-390");
      t.dong();
    }
    const t = await mo("telesales", "/leads/new");
    await dien(t);
    await gui(t);
    in1({ ca: "e2", thieu: ket, doiChung: { soPostLead: await t.tinh("window.__soPost") } });
    t.dong();
  }
  if (arg("--e3")) {
    const t = await mo("telesales", "/leads/new");
    await dien(t);
    await gui(t);
    const c = await chu(t);
    await chup(t, "E3-ket-qua-390");
    await nhip();
    await bam(t, "Xem ở Lead đã nhập");
    await ngu(2000);
    await chup(t, "E3-da-nhap-390");
    in1({ ca: "e3", coKetQua: /Không trùng|đã có đầu chủ|đã có hàng mở/.test(c), coLoiTheoDoi: c.includes("Xem ở Lead đã nhập"), dau: await nacDau(t) });
    t.dong();
  }
  if (arg("--e4")) {
    // Lead mới của telesales về Toà A (đầu chủ 1 phụ trách); đầu chủ nhận, gọi, đưa lên bảng qua lối API thật.
    const so = soMau();
    const lead = await api("telesales", "POST", "/api/v1/leads", { ownerPhone: so, buildingName: "Toà A", need: "sale", listPrice: 3_200_000_000, feeInclusion: "included", desiredListingTime: "now" });
    await nhip();
    const doc = async (ten) => {
      const t = await mo("telesales", "/leads/new");
      await bam(t, "Lead đã nhập");
      await ngu(2000);
      const d = await nacDau(t);
      const c = await t.tinh("document.body.innerHTML");
      await chup(t, ten);
      const kq = { nac: d?.nac, cuonNgang: await cuonNgang(t), coSoChu: c.includes(so) || c.includes(so.replace(/\s/g, "")) };
      t.dong();
      return kq;
    };
    const truoc = await doc("E4-da-gui-390");
    await api("dau-chu-1", "POST", `/api/v1/leads/${lead.id}/accept`);
    const sauNhan = await doc("E4-da-nhan-390");
    await api("dau-chu-1", "POST", `/api/v1/leads/${lead.id}/first-call`);
    const sauGoi = await doc("E4-da-goi-390");
    await api("dau-chu-1", "POST", `/api/v1/leads/${lead.id}/listing`);
    const sauLenBang = await doc("E4-len-bang-390");
    in1({ ca: "e4", outcome: lead.outcome, nacTruoc: truoc.nac, nacSauNhan: sauNhan.nac, nacSauGoi: sauGoi.nac, nacSauLenBang: sauLenBang.nac, cuonNgang: [truoc, sauNhan, sauGoi, sauLenBang].some((x) => x.cuonNgang), coSoChu: [truoc, sauNhan, sauGoi, sauLenBang].some((x) => x.coSoChu) });
  }
  if (arg("--e5")) {
    const t = await mo("telesales", "/leads/new");
    const truoc = await soLeadCua("telesales");
    await dien(t);
    const da = await docMuc(t);
    await matMang(t, true);
    await gui(t);
    const c = await chu(t);
    const sau = await docMuc(t);
    await chup(t, "E5-mat-mang-390");
    await matMang(t, false);
    await ngu(3000);
    const chuaBam = (await soLeadCua("telesales")) - truoc;
    await gui(t);
    const sauBam = (await soLeadCua("telesales")) - truoc;
    await chup(t, "E5-gui-lai-390");
    in1({ ca: "e5", lucMat: { thongBao: c.includes("Chưa gửi được — mất mạng"), giuNguyen: JSON.stringify(da) === JSON.stringify(sau), muc: sau }, coMangChuaBam: { soLeadMoi: chuaBam }, sauKhiBam: { soLeadMoi: sauBam } });
    t.dong();
  }
  if (arg("--e6")) {
    const ket = {};
    for (const [ten, duong, vaoPhan] of [["tab", "/leads/new", true], ["trang", "/leads/mine", false]]) {
      // Tab: mở trang có mạng, mất mạng rồi mới bấm sang phần Lead đã nhập (phần tải khi mở). Trang riêng: lời tải danh
      // sách được giữ chậm 4 giây, mạng mất trong khoảng ấy — lời tải đầu tiên rơi vào lúc mất mạng.
      const t = await chrome.trang(390, 844);
      await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: BOC + `; window.__cham = ${vaoPhan ? 0 : 4000};` });
      await t.datCookie(phien.cookie.telesales.split(";").map((s) => s.trim()).filter(Boolean));
      await t.di(duong);
      await t.cho(`document.readyState === "complete" && !!document.querySelector("[data-bo-cuc-goc]") && !!document.querySelector("#so-chu, section[aria-label], [data-trang-thai], [data-slot=alert]")`, 120000);
      await ngu(vaoPhan ? 1200 : 300);
      await matMang(t, true);
      if (vaoPhan) await bam(t, "Lead đã nhập");
      if (!vaoPhan) await ngu(4500);
      await ngu(2000);
      let c = await chu(t);
      const lucMat = { coChuaCoLead: c.includes("Chưa có lead nào"), coThuLai: c.includes("Thử lại"), coDaiMatMang: c.includes("mất mạng") };
      await chup(t, `E6-${ten}-mat-mang-390`);
      await matMang(t, false);
      await ngu(1500);
      c = await chu(t);
      const coDaiSau = c.includes("Đang xem bản đã tải — mất mạng");
      await bam(t, "Thử lại");
      await ngu(2000);
      const soDong = await t.tinh(`document.querySelectorAll('section[aria-label="Lead đã nhập"] tbody tr').length`);
      await chup(t, `E6-${ten}-co-mang-390`);
      ket[ten] = { lucMat, sauKhiCoMang: { coDaiMatMang: coDaiSau, soDong } };
      t.dong();
    }
    in1({ ca: "e6", ...ket });
  }
  if (arg("--e9")) {
    const doc = async (ai, ten, cham = 0) => {
      const t = await chrome.trang(390, 844);
      await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: BOC + `; window.__cham = ${cham};` });
      await t.datCookie(phien.cookie[ai].split(";").map((s) => s.trim()).filter(Boolean));
      await t.di("/leads/new");
      await t.cho(`document.readyState === "complete" && !!document.querySelector("[data-bo-cuc-goc]") && !!document.querySelector("#so-chu, section[aria-label], [data-trang-thai], [data-slot=alert]")`, 120000);
      await ngu(1000);
      if (ai.startsWith("telesales")) await bam(t, "Lead đã nhập");
      await ngu(cham ? 600 : 2000);
      const o = JSON.parse(
        await t.tinh(`JSON.stringify({ coForm: !!document.querySelector("#so-chu"), coBaoVai: document.body.textContent.includes("nhập được lead"),
          coChuaCoLead: document.body.textContent.includes("Chưa có lead nào"), coKhungCho: !!document.querySelector("[data-cho-tai]"),
          trang: (document.querySelector('section[aria-label="Lead đã nhập"]')?.textContent.trim() ?? "x") === "Lead đã nhập" && !document.querySelector("[data-cho-tai]") })`),
      );
      await chup(t, ten);
      t.dong();
      return o;
    };
    in1({ ca: "e9", dauChu: await doc("dau-chu-1", "E9-dau-chu-390"), muaHang: await doc("dau-khach", "E9-dau-khach-390"), moi: await doc("telesales-moi", "E9-telesales-moi-390"), dangTai: await doc("telesales", "E9-dang-tai-390", 3000) });
  }
  if (arg("--e8")) {
    const t = await mo("telesales", "/leads/new", 1440, 900);
    const soMuc = await t.tinh(`document.querySelectorAll('form [data-slot="field"]').length`);
    const tabHien = await t.tinh(`[...document.querySelectorAll("[role=tablist]")].some((x) => x.offsetParent !== null)`);
    await chup(t, "E8-nhap-1440");
    const cn = await cuonNgang(t);
    t.dong();
    const t2 = await mo("telesales", "/leads/mine", 1440, 900);
    await ngu(1500);
    const soCotBang = await t2.tinh(`(() => { const r = document.querySelector('section[aria-label="Lead đã nhập"] thead tr'); return r ? [...r.children].filter((x) => getComputedStyle(x).display !== "none").length : 0; })()`);
    await chup(t2, "E8-da-nhap-1440");
    in1({ ca: "e8", soMuc, tabHienTrenMayTinh: tabHien, soCotBang, cuonNgang: cn || (await cuonNgang(t2)) });
    t2.dong();
  }
} finally {
  chrome.dong();
}
