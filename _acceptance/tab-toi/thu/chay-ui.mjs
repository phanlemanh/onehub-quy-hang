// Kịch bản nhìn giao diện của tab Tôi (hàng 38: E1b, E7c) trên máy dev dãy H (dựng bằng dung-h.mjs). Mỗi «máy» là một
// Chrome không đầu với thư mục hồ sơ riêng — cookie, IndexedDB tách nhau như hai trình duyệt thật. In mỗi bước một dòng
// JSON (đã thấy gì) và chụp ảnh vào --ra; người chấm xem ảnh và đối chiếu dòng.
//   node _acceptance/tab-toi/thu/chay-ui.mjs --e1b --ra .acceptance-runs/tab-toi/ui
//   node _acceptance/tab-toi/thu/chay-ui.mjs --e7c --ra .acceptance-runs/tab-toi/ui
// Người mẫu mặc định: dau-chu-1 (một máy), dau-chu-2 (ba máy), truong-nhom (E7c); đổi bằng QH_E1B_MOT, QH_E1B_BA, QH_E7C
// khi một email đã xin đủ 5 mã trong 15 phút.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3494";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG = path.join(GOC, "_acceptance/tab-toi/thu/dung-h.mjs");
const { values: a } = parseArgs({ options: { e1b: { type: "boolean" }, e7c: { type: "boolean" }, ra: { type: "string" } } });
const RA = path.resolve(GOC, a.ra ?? ".acceptance-runs/tab-toi/ui");
mkdirSync(RA, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const ghi = (buoc, thay) => console.log(JSON.stringify({ buoc, ...thay }));

const UA = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36",
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
};
/** Đăng nhập mới một máy giả cho người mẫu; trả cookie «tên=giá trị» và mã phiên. */
function phien(email, ua, moi = false) {
  const o = JSON.parse(execFileSync("node", [DUNG, "--phien", email, "--ua", ua, ...(moi ? ["--moi"] : [])], { cwd: GOC }).toString());
  return { ck: o.cookie.map((c) => `${c.name}=${c.value}`), token: o.token };
}

/** Một «máy»: Chrome riêng, một trang ở khổ đã cho, đã đặt cookie. */
async function may(rong, cao, ck) {
  const chrome = await moChrome();
  const t = await chrome.trang(rong, cao);
  if (ck) await t.datCookie(ck);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.documentElement.appendChild(s); return true; })()`).catch(() => {});
  return { chrome, t };
}
const anPortal = (t) => t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
async function toi(t, duong, dk) {
  await t.di(duong);
  await t.cho(`document.readyState === "complete" && (${dk})`, 60000);
  await anPortal(t);
  await ngu(800);
}
const chup = async (t, ten) => {
  writeFileSync(path.join(RA, ten), await t.chup());
  return ten;
};
const chu = (t) => t.tinh(`document.body.innerText`);
const nhomTrenMan = `["Hồ sơ","Sàn","Cài lên màn hình chính","Thông báo","Máy đang đăng nhập","Đăng xuất"]`;
const thuTuNhom = (t) =>
  // Tìm lần lượt trong vùng nội dung chính, mỗi nhãn sau nhãn trước (thanh đầu cũng có chữ «Sàn»).
  t.tinh(`(() => { const txt = (document.querySelector("main") ?? document.body).innerText; const ds = ${nhomTrenMan}; let tu = 0; const vt = ds.map((n) => { const v = txt.indexOf(n, tu); if (v >= 0) tu = v + n.length; return v; }); return { vt, dung: vt.every((v) => v >= 0) }; })()`);
const bamNut = (t, nhan) =>
  t.tinh(`(() => { const b = [...document.querySelectorAll("button")].find((x) => x.innerText.trim() === ${JSON.stringify(nhan)}); if (!b) return false; b.click(); return true; })()`);

if (a.e1b) {
  // Một máy: dau-chu-1 chỉ có phiên này.
  const mot = phien(process.env.QH_E1B_MOT ?? "dau-chu-1@mau.quy-hang.test", UA.iphone, true);
  for (const [rong, cao] of [[390, 844], [1440, 900]]) {
    const { chrome, t } = await may(rong, cao, mot.ck);
    await toi(t, "/me", `document.body.innerText.includes("Máy đang đăng nhập") && !document.body.innerText.includes("Đang kiểm")`);
    const txt = await chu(t);
    const tabToi = await t.tinh(`(() => { const a = [...document.querySelectorAll("a[aria-current=page], [data-active=true], [aria-selected=true]")].map((x) => x.innerText.trim()); return a; })()`);
    ghi(`e1b-mot-may-${rong}`, {
      anh: await chup(t, `E1b-mot-may-${rong}.png`),
      thuTu: await thuTuNhom(t),
      chiCoMayNay: txt.includes("Chỉ có máy này"),
      coNutBaoMat: txt.includes("Báo mất máy") && (await t.tinh(`[...document.querySelectorAll("button")].some((b) => b.innerText.trim() === "Báo mất máy")`)),
      dangChon: tabToi,
    });
    t.dong();
    chrome.dong();
  }
  const BA = process.env.QH_E1B_BA ?? "dau-chu-2@mau.quy-hang.test";
  // Ba máy: dau-chu-2 đăng nhập trên iPhone (máy đang bấm), Android và máy tính.
  const nay = phien(BA, UA.mac, true);
  phien(BA, UA.iphone);
  const khac = phien(BA, UA.android);
  {
    const { chrome, t } = await may(1440, 900, nay.ck);
    await toi(t, "/me", `[...document.querySelectorAll("button")].some((b) => b.innerText.trim() === "Báo mất máy")`);
    ghi("e1b-ba-may", { anh: await chup(t, "E1b-ba-may-1440.png"), chu: (await chu(t)).match(/Máy đang đăng nhập[\s\S]{0,300}/)?.[0] });
    await bamNut(t, "Báo mất máy");
    await t.cho(`document.querySelector('[role="alertdialog"]') !== null`);
    await ngu(500);
    ghi("e1b-hop-hoi", {
      anh: await chup(t, "E1b-hop-hoi-1440.png"),
      chu: await t.tinh(`document.querySelector('[role="alertdialog"]').innerText`),
      nutNguyHiem: await t.tinh(`(() => { const b = [...document.querySelectorAll('[role="alertdialog"] button')].find((x) => x.innerText.includes("Đăng xuất mọi máy khác")); return b ? b.getAttribute("data-variant") ?? b.className : null; })()`),
    });
    await bamNut(t, "Đăng xuất mọi máy khác");
    await t.cho(`document.body.innerText.includes("Đã đăng xuất")`, 30000);
    await ngu(800);
    ghi("e1b-da-bao", { anh: await chup(t, "E1b-da-bao-1440.png"), chu: (await chu(t)).match(/Máy đang đăng nhập[\s\S]{0,300}/)?.[0] });
    t.dong();
    chrome.dong();
  }
  // Máy Android vừa bị báo: mở /login?bi-bao-mat=1 bằng cookie cũ của nó.
  {
    const { chrome, t } = await may(390, 844, khac.ck);
    await toi(t, "/today", `location.pathname === "/login" && document.body.innerText.includes("Máy này đã bị báo mất")`);
    ghi("e1b-man-bao", { anh: await chup(t, "E1b-man-bao-390.png"), url: await t.tinh("location.pathname + location.search"), chu: (await chu(t)).slice(0, 300) });
    t.dong();
    chrome.dong();
  }
}

if (a.e7c) {
  const X = process.env.QH_E7C ?? "truong-nhom@mau.quy-hang.test";
  const A = phien(X, UA.mac, true);
  const B = phien(X, UA.android);
  const kho = (t) => t.tinh(`indexedDB.databases().then((d) => d.map((x) => x.name).filter((n) => n.startsWith("quy-hang-sync:")).sort())`);
  // B: nạp bảng hàng để có kho, rồi tắt mạng giả và đặt một thay đổi chờ vào ngăn của sàn; ghi kho của người khác Z.
  const mb = await may(390, 844, B.ck);
  await toi(mb.t, "/inventory", `indexedDB.databases().then((d) => d.some((x) => x.name.startsWith("quy-hang-sync:")))`);
  await ngu(2000);
  await mb.t.gui("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  const datCho = await mb.t.tinh(`(async () => {
    const ten = (await indexedDB.databases()).map((x) => x.name).find((n) => n.startsWith("quy-hang-sync:"));
    const db = await new Promise((ok, loi) => { const r = indexedDB.open(ten); r.onsuccess = () => ok(r.result); r.onerror = () => loi(r.error); });
    const st = db.transaction("ngan", "readwrite").objectStore("ngan");
    const khoa = await new Promise((ok) => { const r = st.getAllKeys(); r.onsuccess = () => ok(r.result); });
    const ngan = await new Promise((ok) => { const r = st.get(khoa[0]); r.onsuccess = () => ok(r.result); });
    ngan.queue = [...(ngan.queue ?? []), { clientId: "thu-e7c-1", kind: "price_changed", listingId: "thu", payload: {}, at: new Date().toISOString() }];
    await new Promise((ok) => { const r = st.put(ngan, khoa[0]); r.onsuccess = ok; });
    db.close();
    const z = await new Promise((ok, loi) => { const r = indexedDB.open("quy-hang-sync:z-mau-e7c", 1); r.onupgradeneeded = () => r.result.createObjectStore("ngan"); r.onsuccess = () => ok(r.result); r.onerror = () => loi(r.error); });
    await new Promise((ok) => { const r = z.transaction("ngan", "readwrite").objectStore("ngan").put({ queue: [{ clientId: "z-1" }] }, "s"); r.onsuccess = ok; });
    z.close();
    return { ten, ngan: khoa[0], soCho: ngan.queue.length };
  })()`);
  ghi("e7c-b-truoc", { anh: await chup(mb.t, "E7c-b-truoc-390.png"), kho: await kho(mb.t), datCho });
  await mb.t.gui("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  // A: bấm «Báo mất máy» và xác nhận.
  const ma = await may(1440, 900, A.ck);
  await toi(ma.t, "/me", `[...document.querySelectorAll("button")].some((b) => b.innerText.trim() === "Báo mất máy")`);
  await bamNut(ma.t, "Báo mất máy");
  await ma.t.cho(`document.querySelector('[role="alertdialog"]') !== null`);
  await bamNut(ma.t, "Đăng xuất mọi máy khác");
  await ma.t.cho(`document.body.innerText.includes("Đã đăng xuất")`, 30000);
  await ngu(600);
  ghi("e7c-a-da-bao", { anh: await chup(ma.t, "E7c-a-da-bao-1440.png"), chu: (await chu(ma.t)).match(/Đã đăng xuất[^\n]*/)?.[0] });
  ma.t.dong();
  ma.chrome.dong();
  // B: điều hướng /today bằng cookie cũ.
  await toi(mb.t, "/today", `location.pathname === "/login" && document.body.innerText.includes("Máy này đã bị báo mất")`);
  await ngu(1000);
  ghi("e7c-b-sau", { anh: await chup(mb.t, "E7c-b-sau-390.png"), url: await mb.t.tinh("location.pathname + location.search"), kho: await kho(mb.t) });
  mb.t.dong();
  mb.chrome.dong();
  // Đối chứng C: phiên bị xoá thẳng ở cơ sở dữ liệu (không qua báo mất) → /login không tham số, kho của X còn.
  const C = phien(X, UA.iphone);
  const mc = await may(390, 844, C.ck);
  await toi(mc.t, "/inventory", `indexedDB.databases().then((d) => d.some((x) => x.name.startsWith("quy-hang-sync:")))`);
  await ngu(2000);
  const truocC = await kho(mc.t);
  const xoa = JSON.parse(execFileSync("node", [DUNG, "--xoa-phien", C.token], { cwd: GOC }).toString());
  await toi(mc.t, "/today", `location.pathname === "/login"`);
  await ngu(1000);
  ghi("e7c-c-doi-chung", { anh: await chup(mc.t, "E7c-c-sau-390.png"), xoaPhien: xoa, url: await mc.t.tinh("location.pathname + location.search"), khoTruoc: truocC, khoSau: await kho(mc.t) });
  mc.t.dong();
  mc.chrome.dong();
}
