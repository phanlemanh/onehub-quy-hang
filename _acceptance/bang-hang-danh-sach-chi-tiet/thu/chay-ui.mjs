// Phép nhìn màn hàng 105 trên chỗ thử dãy D (chạy dung-d.mjs trước). Mỗi ca in một dòng JSON đúng khoá steps của eval đòi
// và chụp ảnh vào --ra. Chrome không đầu qua CDP của hồ sơ bang-hang-kieu-sheet; bấm và kéo bằng sự kiện chuột thật của
// CDP (Input.dispatchMouseEvent). Lời đọc hồ sơ căn (`GET /api/v1/listings/<mã hàng>`) giữ chậm hay trả lỗi bằng lớp bọc
// fetch đặt vào trang trước khi tải; service worker bị chặn như hàng 92.
//   node _acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs --e1 --e2 --e3 --e4 --e6 --e7 --e10 --ra <thư mục>
//   --dung-lai (cùng --e3): chiều đỏ — sau mỗi bước thay nút gốc của bảng bằng bản sao (giả bảng dựng lại theo căn)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_GOC = "http://localhost:3477";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/bang-hang-danh-sach-chi-tiet");
const arg = (k) => process.argv.includes(k);
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : "_acceptance/bang-hang-danh-sach-chi-tiet/evidence");
mkdirSync(RA, { recursive: true });
const phien = JSON.parse(readFileSync(path.join(CHAY, "phien.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const h = { "content-type": "application/json", origin: URL_GOC };
const in1 = (o) => console.log(JSON.stringify(o));
const tron = (r) => (r ? Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Math.round(v)])) : null);

const BOC = `(() => { try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}
  if (window.__boc) return; window.__boc = true; window.__cham = window.__cham || 0; window.__loi = window.__loi || false; const f = window.fetch;
  window.fetch = async (u, o) => { const s = String(u && u.url ? u.url : u);
    if (/\\/api\\/v1\\/listings\\/[0-9a-f-]{36}$/.test(s) && (!o || !o.method || o.method === "GET")) {
      if (window.__cham) await new Promise((r) => setTimeout(r, window.__cham));
      if (window.__loi) return new Response("{}", { status: 500, headers: { "content-type": "application/json" } }); }
    return f(u, o); }; })()`;

const chrome = await moChrome();

async function mo(ai, { w = 1440, hgt = 900, duong = "/inventory", cho = true } = {}) {
  const t = await chrome.trang(w, hgt);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: BOC });
  await t.datCookie(phien.cookie[ai].split(";").map((s) => s.trim()).filter(Boolean));
  await t.di(duong);
  await t.cho(`document.readyState === "complete" && !!document.querySelector("[data-bo-cuc-goc]")`, 180000);
  if (cho) await t.cho(`!!document.querySelector('[data-slot=data-grid] tbody [data-slot=row-number]')`, 180000);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(1200);
  return t;
}
const chup = async (t, ten) => writeFileSync(path.join(RA, `${ten}.png`), await t.chup());
const rect = (t, sel) => t.tinh(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }; })()`);

async function chuot(t, type, x, y) {
  await t.gui("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1 });
}
async function bamXY(t, x, y) {
  await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await chuot(t, "mousePressed", x, y);
  await chuot(t, "mouseReleased", x, y);
}
async function bam(t, sel) {
  const r = await rect(t, sel);
  if (!r) throw new Error(`không thấy ${sel}`);
  await bamXY(t, r.left + r.width / 2, r.top + r.height / 2);
}
async function keo(t, x1, y1, x2, y2) {
  await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x: x1, y: y1 });
  await chuot(t, "mousePressed", x1, y1);
  for (let i = 1; i <= 30; i++) await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x: x1 + ((x2 - x1) * i) / 30, y: y1 + ((y2 - y1) * i) / 30, button: "left", buttons: 1 });
  await chuot(t, "mouseReleased", x2, y2);
  await ngu(400);
}

/** Các dòng căn đang vẽ trong khung cuộn: mã căn, chỉ số, toạ độ một ô giữa dòng (không phải ô tích). */
const DONG_CAN = `JSON.stringify((() => { const vp = document.querySelector("[data-slot=data-grid] [data-slot=scroll-area-viewport]").getBoundingClientRect();
  return [...document.querySelectorAll("[data-slot=data-grid] tbody tr")].filter((tr) => tr.querySelector("[data-slot=row-number]")).map((tr) => {
    const td = [...tr.children]; const o = td[2] ?? td[1]; const r = o.getBoundingClientRect();
    return { ma: td.map((x) => x.textContent.trim()).find((s) => /^[A-Z]-\\d/.test(s)) ?? null, stt: tr.querySelector("[data-slot=row-number]").textContent.trim(),
      x: r.left + r.width / 2, y: r.top + r.height / 2, trong: r.top >= vp.top + 40 && r.bottom <= vp.bottom - 40, chon: tr.dataset.state === "selected" || tr.getAttribute("aria-selected") === "true" };
  }); })())`;
const dongCan = async (t) => JSON.parse(await t.tinh(DONG_CAN));
async function moDong(t, chiSo = 0) {
  const ds = (await dongCan(t)).filter((d) => d.trong);
  const d = ds[Math.min(chiSo, ds.length - 1)];
  await bamXY(t, d.x, d.y);
  await t.cho(`!!document.querySelector('[data-vung="cot-phu"] h2')`, 60000);
  await ngu(700);
  return d;
}
const tenCot = (t) => t.tinh(`document.querySelector('[data-vung="cot-phu"] h2')?.textContent.trim() ?? null`);
/** Tâm của phần tử là chính nó hay con của nó (không bị che). */
const khongBiChe = (sel) => `(() => [...document.querySelectorAll(${JSON.stringify(sel)})].filter((e) => e.getClientRects().length && e.getBoundingClientRect().width > 0).map((e) => {
  const r = e.getBoundingClientRect(); const o = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { nhan: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 30), ok: !!o && (o === e || e.contains(o)) }; }))()`;
const NUT_CONG_CU = `(() => { const ds = [...document.querySelectorAll("[data-vung=than] button, [data-vung=than] [role=combobox]")];
  const tim = (f) => ds.find(f); const nut = { "Nhóm": tim((b) => b.getAttribute("aria-label") === "Nhóm"), "Lọc": tim((b) => b.textContent.trim().startsWith("Lọc")),
    "Cột": tim((b) => b.textContent.trim() === "Cột"), "Xuất": tim((b) => b.textContent.includes("Xuất bảng hàng")) };
  return Object.fromEntries(Object.entries(nut).map(([k, e]) => { if (!e) return [k, false]; const r = e.getBoundingClientRect(); const o = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return [k, !!o && (o === e || e.contains(o))]; })); })()`;

async function chonSelect(t, trigger, chu) {
  await bam(t, trigger);
  await t.cho(`[...document.querySelectorAll("[role=option]")].some((o) => o.textContent.trim() === ${JSON.stringify(chu)})`, 10000);
  const r = await t.tinh(`(() => { const o = [...document.querySelectorAll("[role=option]")].find((o) => o.textContent.trim() === ${JSON.stringify(chu)}); const b = o.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
  await bamXY(t, r.x, r.y);
  await ngu(600);
}
// Chuỗi lọc: ô lọc có giá trị (cột Toà ghim nên luôn vẽ; cột ngoài khung nhìn không vẽ ô lọc) kèm dòng «n / N căn».
const chuoiLoc = (t) =>
  t.tinh(`[...[...document.querySelectorAll('[aria-label^="Lọc "]')].map((e) => [e.getAttribute("aria-label"), e.tagName === "INPUT" ? e.value : e.textContent.trim()])
    .filter(([n, v]) => v && !/^Mọi /.test(v)).map(([n, v]) => n + "=" + v), (/\\d+\\s*\\/\\s*\\d+ căn/.exec(document.querySelector("[data-vung=than]").textContent) ?? [""])[0]].join(" | ")`);
const chuoiNhom = (t) => t.tinh(`document.querySelector('[aria-label="Nhóm"]')?.textContent.trim() ?? null`);
const cuonBang = (t) => t.tinh(`document.querySelector("[data-slot=data-grid] [data-slot=scroll-area-viewport]").scrollTop`);
const demCan = (t) => t.tinh(`(() => { const m = /(\\d+)\\s*\\/\\s*(\\d+) căn/.exec(document.querySelector("[data-vung=than]").textContent); return m ? Number(m[1]) : null; })()`);
async function locToaA(t) {
  await bam(t, '[data-vung=than] button[aria-pressed]');
  await t.cho(`!!document.querySelector('[aria-label="Lọc Toà"]')`, 10000);
  await chonSelect(t, '[aria-label="Lọc Toà"]', "Toà A");
}

const KHO = [
  [1440, 900],
  [1280, 800],
];

try {
  if (arg("--e1")) {
    for (const [w, hgt] of KHO) {
      const t = await mo("dau-chu-1", { w, hgt });
      const thanhTruoc = tron(await rect(t, "[data-slot=app-header]"));
      await moDong(t, 2);
      const cot = tron(await rect(t, '[data-vung="cot-phu"]'));
      const khung = tron(await rect(t, "[data-vung=than] [data-slot=frame]"));
      const vungLamViec = tron(await rect(t, "[data-slot=sidebar-inset]"));
      const thanhSau = tron(await rect(t, "[data-slot=app-header]"));
      const nutThanhTren = await t.tinh(khongBiChe("[data-slot=app-header] button, [data-slot=app-header] a[data-slot=button]"));
      const coLopPhu = await t.tinh(`(() => { if (document.querySelector('[data-slot$="overlay"], [data-slot=sheet-backdrop], [data-slot=dialog-backdrop]')) return true;
        const k = document.querySelector("[data-vung=than] [data-slot=data-grid]").getBoundingClientRect(); const o = document.elementFromPoint(k.left + k.width / 2, k.top + k.height / 2);
        return !document.querySelector("[data-vung=than]").contains(o); })()`);
      await chup(t, `E1-${w}`);
      in1({
        ca: "e1",
        kho: `${w}x${hgt}`,
        cot,
        khung,
        vungLamViec,
        innerHeight: hgt,
        lechTren: Math.abs(cot.top - khung.top),
        lechDay: Math.abs(cot.bottom - vungLamViec.bottom),
        cotNgoaiKhung: cot.left >= khung.right,
        thanhTrenGiuNguyen: JSON.stringify(thanhTruoc) === JSON.stringify(thanhSau),
        nutThanhTren,
        moiNutKhongBiChe: nutThanhTren.every((n) => n.ok),
        coLopPhu,
      });
      t.dong();
    }
  }

  if (arg("--e2")) {
    for (const [w, hgt] of KHO) {
      const t = await mo("dau-chu-1", { w, hgt });
      await moDong(t, 1);
      // Tỉ lệ kéo chia tính trên hai panel (thân + cột) — đúng phần trăm của nhóm panel, tay kéo và lề hai bên tay không tính;
      // kèm tỉ lệ trên cả nhóm panel (vùng của bố cục) để đối chiếu.
      const do_ = async () => {
        const cot = await rect(t, '[data-vung="cot-phu"]');
        const than = await rect(t, "[data-slot=resizable-panel]#than, [data-slot=resizable-panel][data-panel]:first-child");
        const vung = await rect(t, "[data-slot=resizable-panel-group]");
        return { cot: tron(cot), vung: tron(vung), rongCot: Math.round(cot.width), rongVung: Math.round(cot.width + than.width), tiLe: Math.round((cot.width / (cot.width + than.width)) * 1000) / 1000, tiLeNhom: Math.round((cot.width / vung.width) * 1000) / 1000 };
      };
      const mo38 = await do_();
      const bang = await t.tinh(`(() => { const vp = document.querySelector("[data-slot=data-grid] [data-slot=scroll-area-viewport]").getBoundingClientRect();
        const c = document.querySelector('[data-vung="cot-phu"]').getBoundingClientRect();
        const th = [...document.querySelectorAll("[data-slot=data-grid] thead tr:first-child th")].map((e) => e.getBoundingClientRect())
          .map((r) => ({ trai: Math.max(r.left, vp.left), phai: Math.min(r.right, vp.right) })).filter((r) => r.phai - r.trai >= 40);
        const o = [...document.querySelectorAll("[data-slot=data-grid] tbody td")].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.left < vp.right)
          .map((r) => Math.min(r.right, vp.right));
        return { phaiNhatOBang: Math.round(Math.max(...o)), cotTrai: Math.round(c.left), moiOBenTrai: Math.max(...o) <= c.left + 1, soCotThay: th.length - 1 }; })()`);
      const nut = await t.tinh(NUT_CONG_CU);
      const keoTay = async (den) => {
        const tay = await rect(t, "[data-slot=resizable-handle]");
        const y = tay.top + tay.height / 2;
        await keo(t, tay.left + tay.width / 2, y, den, y);
      };
      await keoTay(0);
      const keo50 = await do_();
      await chup(t, `E2-keo-50${w === 1280 ? "-1280" : ""}`);
      await keoTay(w - 2);
      const keo28 = await do_();
      await chup(t, `E2-keo-28${w === 1280 ? "-1280" : ""}`);
      in1({ ca: "e2", kho: `${w}x${hgt}`, mo: mo38, rongCot: mo38.rongCot, rongVung: mo38.rongVung, tiLe: mo38.tiLe, bang, soCotThay: bang.soCotThay, nutCongCu: nut, keoTraiHetCo: keo50.tiLe, keoPhaiHetCo: keo28.tiLe, tiLeNhom: { mo: mo38.tiLeNhom, keo50: keo50.tiLeNhom, keo28: keo28.tiLeNhom } });
      t.dong();
    }
  }

  if (arg("--e3")) {
    const dungLai = arg("--dung-lai");
    const t = await mo("dau-chu-1");
    await locToaA(t);
    await chonSelect(t, '[aria-label="Nhóm"]', "Toà → Loại căn");
    await t.tinh(`(() => { const vp = document.querySelector("[data-slot=data-grid] [data-slot=scroll-area-viewport]"); vp.scrollTop = Math.round((vp.scrollHeight - vp.clientHeight) / 2); return vp.scrollTop; })()`);
    await ngu(800);
    const truoc = { loc: await chuoiLoc(t), nhom: await chuoiNhom(t), cuon: await cuonBang(t) };
    await t.tinh(`(window.__goc = document.querySelector("[data-slot=data-grid]"), true)`);
    const buoc = [];
    const ghi = async (ten) => {
      const sau = { loc: await chuoiLoc(t), nhom: await chuoiNhom(t), cuon: await cuonBang(t) };
      // Chiều đỏ: giả bảng dựng lại — lúc đo, nút gốc trên trang là một bản sao (đo xong trả nút thật để bước sau chạy tiếp).
      const conCungNut = await t.tinh(`(() => { const g = document.querySelector("[data-slot=data-grid]"); let sao = null;
        if (${dungLai}) { const y = g.querySelector("[data-slot=scroll-area-viewport]").scrollTop; sao = g.cloneNode(true); g.replaceWith(sao); sao.querySelector("[data-slot=scroll-area-viewport]").scrollTop = y; }
        const kq = !!window.__goc && window.__goc.isConnected && window.__goc === document.querySelector("[data-slot=data-grid]");
        if (sao) { const vp = g.querySelector("[data-slot=scroll-area-viewport]"); const y = sao.querySelector("[data-slot=scroll-area-viewport]").scrollTop; sao.replaceWith(g); vp.scrollTop = y; }
        return kq; })()`);
      const dongDangMo = (await dongCan(t)).filter((d) => d.chon).map((d) => d.ma);
      buoc.push({ buoc: ten, giuLoc: sau.loc === truoc.loc, giuNhom: sau.nhom === truoc.nhom, deltaCuon: Math.abs(sau.cuon - truoc.cuon), conCungNut, dongDangMo, ten: await tenCot(t) });
    };
    await moDong(t, 1);
    await ghi("mo");
    await chup(t, "E3-mo");
    const tenTruoc = await tenCot(t);
    const ds = (await dongCan(t)).filter((d) => d.trong && d.ma && d.ma !== tenTruoc);
    await bamXY(t, ds[ds.length > 3 ? 3 : 0].x, ds[ds.length > 3 ? 3 : 0].y);
    await t.cho(`document.querySelector('[data-vung="cot-phu"] h2')?.textContent.trim() !== ${JSON.stringify(tenTruoc)}`, 30000);
    await ngu(700);
    await ghi("doi-can");
    await bam(t, '[data-vung="cot-phu"] [aria-label="Đóng hồ sơ"]');
    await t.cho(`!document.querySelector('[data-vung="cot-phu"]')`, 30000);
    await ngu(700);
    await ghi("dong");
    await chup(t, "E3-dong");
    in1({ ca: "e3", dungLai, truoc, buoc, conCungNut: buoc.every((b) => b.conCungNut), giuLocNhomCuon: buoc.every((b) => b.giuLoc && b.giuNhom && b.deltaCuon <= 2) });
    t.dong();
  }

  if (arg("--e4")) {
    if (arg("--ban-goc")) in1({ ca: "e4-ban-goc", ghiChu: "đối chứng trên nhánh chính chỉ ghi số: chạy cùng lệnh trên một worktree của main" });
    for (const [w, hgt] of KHO) {
      const t = await mo("dau-chu-1", { w, hgt });
      const doTrang = async () =>
        JSON.parse(
          await t.tinh(`JSON.stringify((() => { const se = document.scrollingElement; const vo = document.querySelector("[data-slot=sidebar-inset] .overflow-y-auto");
            const vp = document.querySelector("[data-slot=data-grid] [data-slot=scroll-area-viewport]");
            return { scrollHeight: se.scrollHeight, innerHeight: innerHeight, trangKhongCuon: se.scrollHeight <= innerHeight,
              vungLamViecDu: vo ? vo.scrollHeight - vo.clientHeight : null, bangScrollHeight: vp.scrollHeight, bangClientHeight: vp.clientHeight, bangCuonTrongKhung: vp.scrollHeight > vp.clientHeight }; })())`),
        );
      const dong = await doTrang();
      await moDong(t, 0);
      const mo_ = await doTrang();
      await chup(t, `E4-${w}`);
      in1({ ca: "e4", kho: `${w}x${hgt}`, dong, mo: mo_ });
      t.dong();
    }
  }

  if (arg("--e6")) {
    let t = await mo("dau-chu-1", { w: 375, hgt: 812, cho: false });
    await t.cho(`[...document.querySelectorAll('[data-slot="item"]')].some((e) => e.getClientRects().length)`, 120000);
    await ngu(800);
    const the = JSON.parse(
      await t.tinh(`JSON.stringify({ soThe: [...document.querySelectorAll('[data-slot="item"]')].filter((e) => e.getClientRects().length).length,
        soTayKeo: [...document.querySelectorAll("[data-slot=resizable-handle]")].filter((e) => e.getClientRects().length).length })`),
    );
    await chup(t, "E6-the-375");
    t.dong();
    const ma = phien.can.daGan.ma;
    t = await mo("dau-chu-1", { w: 375, hgt: 812, duong: `/inventory?unit=${encodeURIComponent(ma)}&toa=${encodeURIComponent(phien.can.daGan.toa)}`, cho: false });
    await t.cho(`[...document.querySelectorAll('[data-slot="ho-so-can"]')].some((e) => e.getClientRects().length)`, 120000);
    await ngu(800);
    const hoSo = JSON.parse(
      await t.tinh(`JSON.stringify((() => { const e = [...document.querySelectorAll('[data-slot="ho-so-can"]')].find((x) => x.getClientRects().length); const khung = e.closest("[data-slot=frame]") ?? e;
        const r = khung.getBoundingClientRect(); const vung = document.querySelector("[data-slot=sidebar-inset]").getBoundingClientRect();
        return { rongKhung: Math.round(r.width), trai: Math.round(r.left), innerWidth, rongVungLamViec: Math.round(vung.width), tenCan: e.querySelector("h2")?.textContent.trim(),
          soTayKeo: [...document.querySelectorAll("[data-slot=resizable-handle]")].filter((x) => x.getClientRects().length).length }; })())`),
    );
    await chup(t, "E6-ho-so-375");
    in1({ ca: "e6", the, hoSo });
    t.dong();
  }

  if (arg("--e7")) {
    const t = await mo("dau-chu-2");
    const cotDauChu = async () =>
      JSON.parse(
        await t.tinh(`JSON.stringify((() => { const vp = document.querySelector("[data-slot=data-grid] [data-slot=scroll-area-viewport]"); vp.scrollLeft = vp.scrollWidth;
          const ths = [...document.querySelectorAll("[data-slot=data-grid] thead tr:first-child th")];
          const i = ths.findIndex((th) => th.textContent.includes("Đầu chủ"));
          const o = {}; if (i >= 0) for (const tr of document.querySelectorAll("[data-slot=data-grid] tbody tr")) { const td = [...tr.children]; const ma = td.map((x) => x.textContent.trim()).find((s) => /^[A-Z]-\\d/.test(s)); if (ma && td[i]) o[ma] = td[i].textContent.trim(); }
          return { coTieuDe: i >= 0, o }; })())`),
      );
    let dau = await cotDauChu();
    await ngu(800);
    dau = await cotDauChu();
    const { daGan, chuaGan, daRoi } = phien.can;
    const truoc = { daGan: dau.o[daGan.ma], chuaGan: dau.o[chuaGan.ma], daRoi: dau.o[daRoi.ma] };
    await chup(t, "E7-cot-dau-chu");
    await t.tinh(`(window.__chuaTaiLai = performance.getEntriesByType("navigation").length, true)`);
    const gan = await fetch(`${URL_GOC}/api/v1/listings/${daRoi.id}/listing-agent`, { method: "PUT", headers: { ...h, cookie: phien.cookie["truong-nhom"] }, body: JSON.stringify({ userId: phien.nguoi.dc2 }) });
    // Một lần kéo của bộ đồng bộ: quay lại trang (focus) gọi lượt kéo ngay.
    await t.tinh(`(window.dispatchEvent(new Event("focus")), true)`);
    let sau = null;
    for (let i = 0; i < 60; i++) {
      await ngu(1000);
      sau = (await cotDauChu()).o[daRoi.ma];
      if (sau === phien.ten["dau-chu-2"]) break;
    }
    const khongTaiLai = await t.tinh(`window.__chuaTaiLai === performance.getEntriesByType("navigation").length && window.__chuaTaiLai !== undefined`);
    await chup(t, "E7-sau-gan");
    // Ẩn cột ở trình đơn Cột.
    await bam(t, "[data-vung=than] button:has(svg.lucide-columns3)").catch(async () => {
      const r = await t.tinh(`(() => { const b = [...document.querySelectorAll("[data-vung=than] button")].find((x) => x.textContent.trim() === "Cột"); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; })()`);
      await bamXY(t, r.x, r.y);
    });
    await t.cho(`[...document.querySelectorAll("[role=menuitemcheckbox]")].some((m) => m.textContent.trim() === "Đầu chủ")`, 10000);
    const m = await t.tinh(`(() => { const e = [...document.querySelectorAll("[role=menuitemcheckbox]")].find((m) => m.textContent.trim() === "Đầu chủ"); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; })()`);
    await bamXY(t, m.x, m.y);
    await ngu(600);
    await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await ngu(400);
    const anCot = !(await cotDauChu()).coTieuDe;
    in1({
      ca: "e7",
      nguoiXem: "dau-chu-2",
      coTieuDe: dau.coTieuDe,
      truoc,
      mong: { daGan: phien.ten["dau-chu-1"], chuaGan: "—", daRoi: "Đã rời sàn" },
      ganQuaApi: gan.status,
      sauGan: sau,
      mongSauGan: phien.ten["dau-chu-2"],
      khongTaiLai,
      anCotOTrinhDonCot: anCot,
    });
    t.dong();
  }

  if (arg("--e10")) {
    const t = await mo("dau-chu-1");
    await locToaA(t);
    const loc = await chuoiLoc(t);
    const soTruoc = await demCan(t);
    await t.tinh(`(window.__cham = 3000, window.__loi = false, true)`);
    const ds = (await dongCan(t)).filter((d) => d.trong);
    await bamXY(t, ds[0].x, ds[0].y);
    await t.cho(`!!document.querySelector('[data-vung="cot-phu"]')`, 30000);
    await ngu(500);
    const choTai = {
      coKhungCho: await t.tinh(`!!document.querySelector('[data-vung="cot-phu"] [data-cho-tai], [data-vung="cot-phu"] [aria-busy="true"]')`),
      soDongBang: await demCan(t),
      giuLoc: (await chuoiLoc(t)) === loc,
    };
    await chup(t, "E10-cho-tai");
    await ngu(3500);
    await t.tinh(`(window.__cham = 0, window.__loi = true, true)`);
    await bamXY(t, ds[2].x, ds[2].y);
    await t.cho(`[...document.querySelectorAll('[data-vung="cot-phu"] button')].some((b) => b.textContent.trim() === "Thử lại")`, 30000);
    const tenLoi = await tenCot(t);
    const loi = {
      coChuLoi: await t.tinh(`document.querySelector('[data-vung="cot-phu"]').textContent.includes("Không tải được")`),
      coThuLai: true,
      soDongBang: await demCan(t),
      giuLoc: (await chuoiLoc(t)) === loc,
      ten: tenLoi,
    };
    await chup(t, "E10-loi");
    // Lúc lỗi vẫn bấm dòng khác đổi căn được.
    await bamXY(t, ds[4].x, ds[4].y);
    await t.cho(`document.querySelector('[data-vung="cot-phu"] h2')?.textContent.trim() !== ${JSON.stringify(tenLoi)}`, 30000);
    await t.cho(`[...document.querySelectorAll('[data-vung="cot-phu"] button')].some((b) => b.textContent.trim() === "Thử lại")`, 30000);
    loi.doiCanDuoc = (await tenCot(t)) !== tenLoi;
    await t.tinh(`(window.__loi = false, true)`);
    const r = await t.tinh(`(() => { const b = [...document.querySelectorAll('[data-vung="cot-phu"] button')].find((b) => b.textContent.trim() === "Thử lại"); b.scrollIntoView({ block: "center" }); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; })()`);
    await bamXY(t, r.x, r.y);
    try {
      await t.cho(`![...document.querySelectorAll('[data-vung="cot-phu"] button')].some((b) => b.textContent.trim() === "Thử lại")`, 30000);
    } catch (e) {
      await chup(t, "E10-go-loi");
      in1({ ca: "e10-go-loi", cot: await t.tinh(`document.querySelector('[data-vung="cot-phu"]').innerText.slice(0, 1500)`) });
      throw e;
    }
    const thuLai = { tenCan: await tenCot(t), hetLoi: true, soDongBang: await demCan(t) };
    await chup(t, "E10-thu-lai");
    in1({ ca: "e10", soDongTruoc: soTruoc, choTai, loi, thuLai });
    t.dong();
  }
} finally {
  chrome.dong();
}
