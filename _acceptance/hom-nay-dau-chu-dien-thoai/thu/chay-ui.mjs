// Kịch bản ui-check E8 của hàng 39 (Hôm nay đầu chủ trên điện thoại) trên máy dev dãy H (dựng bằng dung-h.mjs). Chrome
// không đầu; mỗi cảnh in một dòng JSON (đã thấy gì) và chụp E8-<cảnh>.png. Bộ mẫu (lead 0900 000 091, căn giá 0900 000 092,
// căn của dau-chu-2) dựng lại bằng dung-h.mjs --mau ở đầu kịch bản. Khuôn từ _acceptance/doi-dau-chu-hang-loat/thu/chay-ui.mjs.
//   node _acceptance/hom-nay-dau-chu-dien-thoai/thu/chay-ui.mjs [--ra <thư mục>]
//
// Chặn tel:: trang gọi `window.location.assign("tel:…")` khi chạm «Gọi». Trước mỗi lần chạm, kịch bản cài bẫy trong trang:
// ghi đè `location.assign` (Chrome giữ thuộc tính này không ghi đè được thì bỏ qua) và nghe sự kiện `navigate` của Navigation
// API (huỷ điều hướng tel:) — href bắt được nằm ở `window.__telHref`, cách bắt ở `window.__telCach`.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3494";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG = path.join(GOC, "_acceptance/hom-nay-dau-chu-dien-thoai/thu/dung-h.mjs");
const { values: a } = parseArgs({ options: { ra: { type: "string" } } });
const RA = path.resolve(GOC, a.ra ?? "_acceptance/hom-nay-dau-chu-dien-thoai/evidence");
mkdirSync(RA, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const dung = (...x) => JSON.parse(execFileSync("node", [DUNG, ...x], { cwd: GOC }).toString());
const UA_DT = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const mau = dung("--mau");
const ck = [...dung("--phien", "dau-chu-1@mau.quy-hang.test", "--ua", UA_DT).cookie.map((c) => `${c.name}=${c.value}`), `qh_san=${mau.san}`];
const ID_LEAD = `lead:${mau.lead.id}`;
const ID_GIA = `can:${mau.canGia.id}`;
const ID_KHAC = `can:${mau.canKhac.id}`;
const ra = (canh, du) => console.log(JSON.stringify({ canh, ...du }));
const chrome = await moChrome();

async function trang(rong, cao, ua) {
  const t = await chrome.trang(rong, cao);
  if (ua) {
    await t.gui("Emulation.setUserAgentOverride", { userAgent: ua, platform: "iPhone" });
    await t.gui("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  }
  await t.datCookie(ck);
  return t;
}
const chup = async (t, ten) => writeFileSync(path.join(RA, `E8-${ten}.png`), await t.chup());
const sel = (id) => `li[data-the-viec=${JSON.stringify(id)}]`;

/** Mở Hôm nay tới khi thẻ của lead mẫu hiện; máy dev vừa dựng có lúc kẹt «Đang tải lần đầu» — mở lại tối đa ba lần × 80 giây. */
async function moHomNay(t, xong = `!!document.querySelector(${JSON.stringify(sel(ID_LEAD))})`) {
  for (let i = 0; i < 3; i++) {
    await t.di("/today");
    try {
      await t.cho(xong, 80000);
      return;
    } catch {
      // thử lần kế
    }
  }
  throw new Error("Hôm nay không lên sau ba lần mở");
}

/** Bẫy tel: — cài lại sau mỗi lần trang tải. Trả các cách bắt đã cài được. */
const BAY_TEL = `(() => {
  window.__telHref = null;
  window.__telLan = 0;
  const bat = (h) => { window.__telHref = String(h); window.__telLan += 1; };
  const cach = [];
  try {
    const goc = window.location.assign.bind(window.location);
    const thay = (h) => (String(h).startsWith("tel:") ? bat(h) : goc(h));
    thay.__qh = true;
    Object.defineProperty(window.location, "assign", { configurable: true, writable: true, value: thay });
    if (window.location.assign.__qh) cach.push("assign");
  } catch {}
  if (!window.__telNghe && window.navigation) {
    window.__telNghe = true;
    window.navigation.addEventListener("navigate", (e) => {
      const u = e.destination?.url ?? "";
      if (!u.startsWith("tel:")) return;
      if (!window.location.assign.__qh) bat(u);
      if (e.cancelable) e.preventDefault();
    });
  }
  if (window.__telNghe) cach.push("navigate");
  window.__telCach = cach;
  return cach;
})()`;
const docTel = (t) => t.tinh(`({ href: window.__telHref, lan: window.__telLan, cach: window.__telCach, duong: location.pathname })`);

/** Chạm nút «Gọi» của một thẻ. */
const bamGoi = (t, id) =>
  t.tinh(`(() => { const b = [...(document.querySelector(${JSON.stringify(sel(id))})?.querySelectorAll("button") ?? [])].find((x) => x.innerText.trim() === "Gọi"); if (b && !b.disabled) b.click(); return b ? (b.disabled ? "tat" : "bam") : "khong"; })()`);
/** Chạm một dòng của ngăn «Kết quả cuộc gọi». */
const bamKetQua = (t, ma) => t.tinh(`(() => { const x = document.querySelector('[data-ket-qua="${ma}"]'); if (x) x.click(); return !!x; })()`);

const DOC_NGAN = `(() => {
  const ds = [...document.querySelectorAll("[data-ket-qua]")];
  const hop = ds[0]?.closest('[data-vung="ngan-noi"]') ?? ds[0]?.closest('[role="dialog"]') ?? null;
  const r = hop?.getBoundingClientRect();
  return {
    mo: ds.length > 0,
    ma: ds.map((x) => x.getAttribute("data-ket-qua")),
    cao: ds.map((x) => Math.round(x.getBoundingClientRect().height * 10) / 10),
    caoNhoNhat: ds.length ? Math.min(...ds.map((x) => x.getBoundingClientRect().height)) : null,
    top: r ? Math.round(r.top) : null,
    innerHeight,
    nuaDuoi: r ? r.top >= innerHeight / 2 : false,
    tieuDe: hop?.querySelector("h2")?.innerText ?? null,
    text: hop?.innerText ?? "",
    khoa: (() => { try { return sessionStorage.getItem("quy-hang:hom-nay:ngan-ket-qua"); } catch { return null; } })(),
  };
})()`;
/** Dòng trên (tên) của một thẻ — ngăn kết quả mang nó ở mô tả. */
const tenThe = (t, id) => t.tinh(`document.querySelector(${JSON.stringify(sel(id))} + " > div > span > span")?.innerText ?? null`);

/** Chờ một số trên Postgres đổi (dung-h.mjs --doc) — tối đa 15 giây. */
async function choDoc(dk) {
  let d = dung("--doc");
  for (let i = 0; i < 30 && !dk(d); i++) {
    await ngu(500);
    d = dung("--doc");
  }
  return d;
}

try {
  const t = await trang(375, 812, UA_DT);
  await moHomNay(t);
  await ngu(800);

  // e8-the — thẻ thay lưới, hai tầng, tổng việc, số thẻ nằm trọn trong khung nhìn.
  const the = await t.tinh(`(() => {
    const li = [...document.querySelectorAll("li[data-the-viec]")];
    const dau = li[0];
    const o = dau?.querySelector(":scope > div > span");
    const tang = o ? [...o.children].filter((x) => x.tagName === "SPAN" && x.innerText.trim()).map((x) => x.innerText.trim()) : [];
    const trongKhung = li.filter((x) => { const r = x.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }).length;
    return {
      coThe: li.length > 0, coBang: !!document.querySelector("table"), coLuoi: !!document.querySelector('[data-slot="data-grid"]'),
      theDauHaiTang: tang.length === 2, theDau: tang,
      tong: li.length, trongKhung, innerWidth, innerHeight,
      nhom: [...document.querySelectorAll("section[data-nhom-the]")].map((s) => ({ ma: s.getAttribute("data-nhom-the"), so: s.querySelectorAll("li[data-the-viec]").length })),
      coLead: !!document.querySelector(${JSON.stringify(sel(ID_LEAD))}), coCanGia: !!document.querySelector(${JSON.stringify(sel(ID_GIA))}),
      ua: navigator.userAgent,
    };
  })()`);
  await chup(t, "the");
  ra("e8-the", { ...the, tongMau: mau.tong });

  // e8-goi — chạm «Gọi» ở lead mẫu: href tel:, đúng một lần mở số trên máy chủ, ngăn kết quả ở nửa dưới, nút cao ≥ 48 px.
  const truoc = dung("--doc");
  const tenLead = await tenThe(t, ID_LEAD);
  const cach = await t.tinh(BAY_TEL);
  const bam1 = await bamGoi(t, ID_LEAD);
  await t.cho(`!!document.querySelector("[data-ket-qua]")`, 20000).catch(() => {});
  await ngu(700); // ngăn trượt lên xong mới đo
  const tel1 = await docTel(t);
  const ngan1 = await t.tinh(DOC_NGAN);
  const sau1 = await choDoc((d) => d.moSoLead > truoc.moSoLead);
  await chup(t, "goi");
  ra("e8-goi", {
    bam: bam1, cachBatTel: cach, telHref: tel1.href, telDung: tel1.href === `tel:${mau.lead.so}`, conOTrang: tel1.duong,
    moSoTruoc: truoc.moSoLead, moSoSau: sau1.moSoLead, moSoTang: sau1.moSoLead - truoc.moSoLead,
    ngan: { mo: ngan1.mo, ma: ngan1.ma, cao: ngan1.cao, caoNhoNhat: ngan1.caoNhoNhat, du48: ngan1.caoNhoNhat !== null && ngan1.caoNhoNhat >= 48, top: ngan1.top, innerHeight: ngan1.innerHeight, nuaDuoi: ngan1.nuaDuoi, tieuDe: ngan1.tieuDe, khoa: ngan1.khoa },
    nganDungLead: ngan1.khoa === ID_LEAD && !!tenLead && ngan1.text.includes(tenLead),
  });

  // e8-quay-lai — (1) «Không nghe máy» đóng ngăn, chạm «Gọi» lần hai cùng lead: số đã mở dùng lại, không mở số lần nữa.
  const dongNgan = await bamKetQua(t, "khong-nghe");
  await t.cho(`!document.querySelector("[data-ket-qua]")`, 10000).catch(() => {});
  await t.tinh(BAY_TEL);
  const bam2 = await bamGoi(t, ID_LEAD);
  await t.cho(`!!document.querySelector("[data-ket-qua]")`, 20000).catch(() => {});
  await ngu(700);
  const tel2 = await docTel(t);
  await ngu(2000); // cho một lần mở số (nếu có) kịp ghi
  const sau2 = dung("--doc");
  // (2) Trang ẩn rồi hiện (như quay lại app sau cuộc gọi): ngăn còn.
  await t.tinh(`(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    return document.visibilityState;
  })()`);
  await ngu(800);
  const nganAnHien = await t.tinh(DOC_NGAN);
  // (3) Tải lại trang khi ngăn đang mở: ngăn của đúng lead mở lại.
  await t.tinh("window.__dauTaiLai = 1");
  await t.tinh("setTimeout(() => location.reload(), 0), true");
  await ngu(1500);
  await t.cho(`document.readyState === "complete" && !window.__dauTaiLai && !!document.querySelector(${JSON.stringify(sel(ID_LEAD))})`, 80000);
  await t.cho(`!!document.querySelector("[data-ket-qua]")`, 15000).catch(() => {});
  await ngu(700);
  const nganTaiLai = await t.tinh(DOC_NGAN);
  const daTaiLai = (await t.tinh("window.__dauTaiLai ?? null")) === null;
  await chup(t, "quay-lai");
  ra("e8-quay-lai", {
    khongNgheDong: dongNgan, bamLan2: bam2, telLan2: tel2.href, telLan2Dung: tel2.href === `tel:${mau.lead.so}`,
    moSoSauLan1: sau1.moSoLead, moSoSauLan2: sau2.moSoLead, khongMoThem: sau2.moSoLead === sau1.moSoLead,
    anHien: { mo: nganAnHien.mo, khoa: nganAnHien.khoa, dungLead: nganAnHien.khoa === ID_LEAD && !!tenLead && nganAnHien.text.includes(tenLead) },
    taiLai: { daTaiLai, mo: nganTaiLai.mo, khoa: nganTaiLai.khoa, dungLead: nganTaiLai.khoa === ID_LEAD && !!tenLead && nganTaiLai.text.includes(tenLead), nuaDuoi: nganTaiLai.nuaDuoi },
  });

  // e8-da-goi — trong ngăn của lead chọn «Đã gọi»: lead có lần gọi đầu trên Postgres.
  const daGoi = await bamKetQua(t, "da-goi");
  const dbDaGoi = await choDoc((d) => d.leadDaGoi);
  await ngu(800);
  await chup(t, "da-goi");
  ra("e8-da-goi", { bam: daGoi, leadDaGoi: dbDaGoi.leadDaGoi, leadNac: dbDaGoi.leadNac, nganDong: !(await t.tinh(`!!document.querySelector("[data-ket-qua]")`)) });

  // e8-goi-can — «Gọi» ở căn mẫu dau-chu-1 giữ: tel: số chủ, một lần mở số chủ; căn dau-chu-2 giữ không có «Gọi»; gọi thẳng
  // lối mở số chủ của căn ấy bị từ chối.
  const truocCan = dung("--doc");
  await t.cho(`!!document.querySelector(${JSON.stringify(sel(ID_GIA))})`, 20000);
  await t.tinh(`document.querySelector(${JSON.stringify(sel(ID_GIA))}).scrollIntoView({ block: "center" })`);
  await ngu(300);
  const tenGia = await tenThe(t, ID_GIA);
  await t.tinh(BAY_TEL);
  const bamCan = await bamGoi(t, ID_GIA);
  await t.cho(`!!document.querySelector("[data-ket-qua]")`, 20000).catch(() => {});
  await ngu(700);
  const telCan = await docTel(t);
  const nganCan = await t.tinh(DOC_NGAN);
  const sauCan = await choDoc((d) => d.moSoChu > truocCan.moSoChu);
  const theKhac = await t.tinh(`(() => { const li = document.querySelector(${JSON.stringify(sel(ID_KHAC))}); return { co: !!li, coGoi: !!li && [...li.querySelectorAll("button")].some((b) => b.innerText.trim() === "Gọi") }; })()`);
  const moThang = await t.tinh(`fetch(${JSON.stringify(`/api/v1/listings/${mau.canKhac.id}/owner/phone-reveal`)}, { method: "POST", credentials: "same-origin" }).then(async (r) => ({ status: r.status, coSo: /09\\d{8}|0900/.test(await r.text()) }))`);
  const sauThang = dung("--doc");
  await chup(t, "goi-can");
  ra("e8-goi-can", {
    bam: bamCan, telHref: telCan.href, telDung: telCan.href === `tel:${mau.canGia.so}`,
    moSoChuTruoc: truocCan.moSoChu, moSoChuSau: sauCan.moSoChu, moSoChuTang: sauCan.moSoChu - truocCan.moSoChu,
    nganMo: nganCan.mo, nganMa: nganCan.ma, nganDungCan: nganCan.khoa === ID_GIA && !!tenGia && nganCan.text.includes(tenGia),
    canKhac: { ...theKhac, moThang: moThang.status, biTuChoi: moThang.status !== 200, traSo: moThang.coSo, vetMoSoKhac: sauThang.moSoChuKhac },
  });

  // e8-giu-gia — «Còn · giữ giá» trong ngăn của căn mẫu: căn có xác nhận còn mới trên Postgres.
  let giuGia = await bamKetQua(t, "con-giu-gia");
  if (!giuGia) {
    // Ngăn không còn mở: chạm lại «Gọi» (số đã mở dùng lại) để mở ngăn rồi chọn.
    await t.tinh(BAY_TEL);
    await bamGoi(t, ID_GIA);
    await t.cho(`!!document.querySelector('[data-ket-qua="con-giu-gia"]')`, 15000).catch(() => {});
    giuGia = await bamKetQua(t, "con-giu-gia");
  }
  const dbGiu = await choDoc((d) => d.canXacNhan);
  await ngu(800);
  await chup(t, "giu-gia");
  ra("e8-giu-gia", { bam: giuGia, canXacNhan: dbGiu.canXacNhan, xacNhanLuc: dbGiu.xacNhanLuc, lastConfirmedAt: dbGiu.lastConfirmedAt });
  t.dong();

  // e8-may-tinh — 1440×900 cùng phiên: lưới, không thẻ.
  const mt = await trang(1440, 900, null);
  for (let i = 0; i < 3; i++) {
    await mt.di("/today");
    try {
      await mt.cho(`!!document.querySelector('table, [data-slot="data-grid"]') || !!document.querySelector("li[data-the-viec]")`, 80000);
      break;
    } catch {
      if (i === 2) throw new Error("Hôm nay (máy tính) không lên sau ba lần mở");
    }
  }
  await ngu(800);
  const luoi = await mt.tinh(`({ coBang: !!document.querySelector("table"), coLuoi: !!document.querySelector('[data-slot="data-grid"]'), coThe: !!document.querySelector("li[data-the-viec]"), soDong: document.querySelectorAll("tbody tr").length, innerWidth })`);
  await chup(mt, "may-tinh");
  ra("e8-may-tinh", { ...luoi, laLuoi: (luoi.coBang || luoi.coLuoi) && !luoi.coThe });
  mt.dong();
} finally {
  chrome.dong();
}
