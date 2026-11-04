// Phép nhìn màn hàng 92 trên chỗ thử dãy D (chạy dung-d.mjs trước). Mỗi ca in một dòng JSON và chụp ảnh vào --ra. Chrome
// không đầu qua CDP của hồ sơ bang-hang-kieu-sheet; mất mạng giả bằng Network.emulateNetworkConditions; lời tải giữ chậm
// hay trả lỗi bằng lớp bọc fetch đặt vào trang trước khi tải. Dòng việc nhận ra qua nút ⋯ «Việc khác của …».
//   node _acceptance/lam-lai-hom-nay-dau-chu/thu/chay-ui.mjs --e1 --e4 … --ra _acceptance/lam-lai-hom-nay-dau-chu/evidence
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3476";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/lam-lai-hom-nay-dau-chu");
const arg = (k) => process.argv.includes(k);
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/lam-lai-hom-nay-dau-chu/evidence");
mkdirSync(RA, { recursive: true });
const phien = JSON.parse(readFileSync(path.join(CHAY, "phien.json"), "utf8"));
const lead = JSON.parse(readFileSync(path.join(CHAY, "lead.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const h = { "content-type": "application/json", origin: URL_GOC };
const api = async (ai, duong) => (await fetch(`${URL_GOC}${duong}`, { headers: { ...h, cookie: phien.cookie[ai] } })).json();

// Lớp bọc fetch: giữ chậm (window.__cham ms) hay trả lỗi (window.__loi) cho lời tải lead của Hôm nay.
const BOC = `(() => { if (window.__boc) return; window.__boc = true; window.__cham = window.__cham || 0; const f = window.fetch;
  window.fetch = async (u, o) => { const s = String(u);
    if (/\\/api\\/v1\\/leads\\/assigned/.test(s)) { if (window.__cham) await new Promise((r) => setTimeout(r, window.__cham)); if (window.__loi) return new Response("{}", { status: 500 }); }
    return f(u, o); }; })()`;

const chrome = await moChrome();
async function mo(ai, { cham = 0, loi = false, w = 1440, hgt = 900, choNoiDung = true } = {}) {
  const t = await chrome.trang(w, hgt);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: `window.__cham = ${cham}; window.__loi = ${loi};` + BOC });
  await t.datCookie(phien.cookie[ai].split(";").map((s) => s.trim()).filter(Boolean));
  await t.di("/today");
  await t.cho(`document.readyState === "complete" && !!document.querySelector("[data-bo-cuc-goc]")`, 120000);
  if (choNoiDung) await t.cho(`!!document.querySelector('[aria-label^="Việc khác của"], [data-trang-thai], [data-cho-tai]') || document.body.textContent.includes("Không còn việc")`, 120000);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(1500);
  return t;
}
const chup = async (t, ten) => writeFileSync(path.join(RA, `${ten}.png`), await t.chup());
const in1 = (o) => console.log(JSON.stringify(o));
const matMang = (t, tat) => t.gui("Network.emulateNetworkConditions", { offline: tat, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

/** Mỗi dòng việc: nút ngoài ⋯, nhãn, kiểu viền, bề rộng, hai tầng, màu hạn. */
const DOC_DONG = `JSON.stringify([...document.querySelectorAll('[aria-label^="Việc khác của"]')].map((menu) => {
  const tr = menu.closest("tr"); const td = [...tr.children];
  const nut = [...tr.querySelectorAll("button, a[data-slot=button]")].filter((b) => b !== menu && b.offsetParent !== null);
  const viSao = td[1]?.querySelector("span.flex-col"); const tang = viSao ? [...viSao.children] : [];
  return { ten: menu.getAttribute("aria-label").replace("Việc khác của ", ""), soNutNgoai: nut.length, nhan: nut[0]?.textContent.trim(),
    vien: nut[0] ? getComputedStyle(nut[0]).borderTopStyle : null, rong: nut[0] ? Math.round(nut[0].getBoundingClientRect().width) : null,
    tangViec: td[0]?.querySelectorAll(":scope > div > span, :scope > div > a").length, tangViSao: tang.length,
    dam: tang[0] ? Number(getComputedStyle(tang[0]).fontWeight) : null, hanChu: tang[1]?.textContent ?? null,
    hanMau: tang[1] ? getComputedStyle(tang[1]).color : null };
}))`;

try {
  if (arg("--e1")) {
    const t = await mo("dau-chu-1");
    const cot = JSON.parse(await t.tinh(`JSON.stringify([...document.querySelectorAll("thead th")].map((x) => x.textContent.trim()).filter(Boolean))`));
    const dong = JSON.parse(await t.tinh(DOC_DONG));
    const token = JSON.parse(await t.tinh(`JSON.stringify((() => { const m = (c) => { const e = document.createElement("span"); e.className = c; document.body.appendChild(e); const v = getComputedStyle(e).color; e.remove(); return v; }; return { destructive: m("text-destructive"), warning: m("text-warning") }; })())`));
    await chup(t, "E1-hom-nay-1440");
    in1({ ca: "e1", tieuDeCot: cot, soDong: dong.length, rongNut: [...new Set(dong.map((d) => d.rong))], vien: [...new Set(dong.map((d) => d.vien))], dong, token });
    t.dong();
  }
  if (arg("--e4")) {
    const t = await mo("dau-chu-1");
    const dongCua = async () => JSON.parse(await t.tinh(DOC_DONG));
    const truoc = (await dongCua()).filter((d) => d.nhan === "Nhận");
    await chup(t, "E4-truoc-1440");
    const ten = truoc[0]?.ten;
    await t.tinh(`(() => { const tr = document.querySelector('[aria-label="Việc khác của ${ten}"]').closest("tr"); [...tr.querySelectorAll("button")].find((b) => b.textContent.trim() === "Nhận").click(); return true; })()`);
    await ngu(2500);
    const coHopThoai = await t.tinh(`!!document.querySelector('[role=alertdialog], [role=dialog]')`);
    const sau = (await dongCua()).find((d) => d.ten === ten);
    await chup(t, "E4-sau-1440");
    const giao = await api("dau-chu-1", "/api/v1/leads/assigned");
    in1({ ca: "e4", ten, nutTruoc: truoc[0]?.nhan, coHopThoai, nutSau: sau?.nhan, soLeadDaNhan: (giao.items ?? giao).filter?.((l) => l.acceptedAt).length });
    t.dong();
  }
  if (arg("--e5")) {
    const t = await mo("dau-chu-1");
    const nhom = () => t.tinh(`JSON.stringify([...document.querySelectorAll("tbody tr")].filter((tr) => !tr.querySelector('[aria-label^="Việc khác của"]') && tr.querySelector("button[aria-expanded], [data-slot=badge]")).map((tr) => ({ ten: tr.textContent.replace(/\\d+$/, "").trim(), so: Number(tr.querySelector("[data-slot=badge]")?.textContent ?? 0) })))`).then(JSON.parse);
    const truoc = await nhom();
    const soDong = await t.tinh(`document.querySelectorAll('[aria-label^="Việc khác của"]').length`);
    const ids = JSON.parse(await t.tinh(DOC_DONG)).map((d) => d.ten);
    await t.tinh(`(() => { const b = document.querySelector("tbody button[aria-expanded]"); b && b.click(); return !!b; })()`);
    await ngu(800);
    const thuGon = await t.tinh(`document.querySelectorAll('[aria-label^="Việc khác của"]').length`);
    await chup(t, "E5-thu-gon-1440");
    await t.tinh(`(() => { const b = document.querySelector("tbody button[aria-expanded]"); b && b.click(); return !!b; })()`);
    await ngu(800);
    const moLai = await t.tinh(`document.querySelectorAll('[aria-label^="Việc khác của"]').length`);
    await chup(t, "E5-mo-lai-1440");
    const bo = await api("dau-chu-1", "/api/v1/company/settings/queue");
    in1({ ca: "e5", nhom: truoc, boNhom: (bo.groups ?? []).map((g) => g.label), soDong, thuGon, moLai, tongDem: truoc.reduce((a, n) => a + n.so, 0), trung: ids.length - new Set(ids).size });
    t.dong();
  }
  if (arg("--e6")) {
    const ket = {};
    let t = await mo("dau-chu-1", { cham: 4000, choNoiDung: false });
    await ngu(500);
    ket.dangTai = { coKhungCho: await t.tinh(`!!document.querySelector("[data-cho-tai]")`) };
    await chup(t, "E6-dang-tai-1440");
    t.dong();
    t = await mo("dau-chu-moi");
    ket.trong = { coLoiBangHang: await t.tinh(`!![...document.querySelectorAll("a")].find((a) => a.getAttribute("href") === "/inventory")`) };
    await chup(t, "E6-trong-1440");
    t.dong();
    t = await mo("dau-chu-1", { loi: true });
    ket.loi = { coThuLai: await t.tinh(`document.body.textContent.includes("Thử lại")`) };
    await chup(t, "E6-loi-1440");
    t.dong();
    t = await mo("dau-chu-1");
    await matMang(t, true);
    await ngu(1500);
    ket.matMang = { coDai: await t.tinh(`document.body.textContent.includes("mất mạng")`) };
    await chup(t, "E6-mat-mang-1440");
    await matMang(t, false);
    await ngu(1500);
    ket.coMang = { coDai: await t.tinh(`document.body.textContent.includes("Đang xem bản đã tải — mất mạng")`) };
    t.dong();
    in1({ ca: "e6", ...ket });
  }
  if (arg("--e9")) {
    const t = await mo("dau-chu-1");
    const dong = JSON.parse(await t.tinh(DOC_DONG));
    const tenLead = dong.find((d) => d.nhan === "Đã gọi")?.ten;
    const moMenu = (ten) => t.tinh(`(() => { document.querySelector('[aria-label="Việc khác của ${ten}"]').click(); return true; })()`);
    const chon = (chu) => t.tinh(`(() => { const m = [...document.querySelectorAll("[role=menuitem]")].find((x) => x.textContent.startsWith(${JSON.stringify(chu)})); m && m.click(); return !!m; })()`);
    const conTrongHangDoi = () => t.tinh(`!!document.querySelector('[aria-label="Việc khác của ${tenLead}"]')`);
    await moMenu(tenLead);
    await ngu(500);
    await chup(t, "E9-menu-1440");
    await chon("Trả lại");
    await ngu(600);
    const huyCo = await t.tinh(`!!document.querySelector("[role=alertdialog]")`);
    await chup(t, "E9-hoi-lai-1440");
    await t.tinh(`(() => { [...document.querySelectorAll("[role=alertdialog] button")].find((b) => b.textContent.trim() === "Giữ lại").click(); return true; })()`);
    await ngu(800);
    const sauHuy = await conTrongHangDoi();
    await moMenu(tenLead);
    await ngu(500);
    await chon("Trả lại");
    await ngu(600);
    await t.tinh(`(() => { [...document.querySelectorAll("[role=alertdialog] button")].find((b) => b.textContent.trim() === "Trả lại").click(); return true; })()`);
    await ngu(2500);
    const sauXacNhan = await conTrongHangDoi();
    const tenCan = JSON.parse(await t.tinh(DOC_DONG)).find((d) => d.nhan === "Còn · giữ giá")?.ten;
    let moHoSo = null;
    if (tenCan) {
      await moMenu(tenCan);
      await ngu(500);
      await chon("Đổi giá, trạng thái");
      await ngu(1500);
      moHoSo = await t.tinh("location.href");
    }
    in1({ ca: "e9", tenLead, traLaiHuy: { coHopThoai: huyCo, leadConTrongHangDoi: sauHuy }, traLaiXacNhan: { leadConTrongHangDoi: sauXacNhan }, tenCan, moHoSo });
    t.dong();
  }
} finally {
  chrome.dong();
}
