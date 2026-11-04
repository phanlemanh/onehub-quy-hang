// Kịch bản ui-check E11 của hàng cai-dat-hop-nhat trên máy dev dãy H (dựng bằng dung-h.mjs). Mỗi cảnh một Chrome không đầu
// với phiên người mẫu riêng; in mỗi cảnh một dòng JSON (đã thấy gì) và chụp E11-<cảnh>.png.
//   node _acceptance/cai-dat-hop-nhat/thu/chay-ui.mjs [--ra <thư mục>]
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3494";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { values: a } = parseArgs({ options: { ra: { type: "string" } } });
const RA = path.resolve(GOC, a.ra ?? "_acceptance/cai-dat-hop-nhat/evidence");
mkdirSync(RA, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const phien = (email) =>
  JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/cai-dat-hop-nhat/thu/dung-h.mjs"), "--phien", email], { cwd: GOC }).toString()).cookie.map(
    (c) => `${c.name}=${c.value}`,
  );
const DAU_CHU = "dau-chu-1@mau.quy-hang.test";
const QUAN_TRI = "quan-tri@mau.quy-hang.test";

// Đo trên trang: đường dẫn đầu màn, câu phạm vi, bề rộng thân bố cục và độ lệch trái so với vùng nội dung, cột mục lục.
const DO = `(() => {
  // Màn dựng qua BoCuc đo gốc bố cục; Ô nhận lead (khuôn riêng của nhóm o-nhan-lead) đo khung đầu tiên của thân.
  const goc = document.querySelector("[data-bo-cuc-goc]") ?? document.querySelector('main [data-slot="frame"], [data-slot="sidebar-inset"] [data-slot="frame"]');
  const r = goc?.getBoundingClientRect();
  const cha = goc?.parentElement?.getBoundingClientRect();
  const nav = document.querySelector('nav[aria-label="breadcrumb"]');
  const cot = document.querySelector('aside[data-slot="second-column"]');
  const nut = [...(goc?.querySelectorAll("button") ?? [])].filter((b) => b.offsetParent !== null);
  const xaNhat = nut.length && r ? Math.max(...nut.map((b) => b.getBoundingClientRect().right)) - r.left : null;
  const text = goc?.innerText ?? "";
  return {
    duong: location.pathname + location.search,
    duongDan: nav ? [...nav.querySelectorAll("li")].map((l) => l.innerText.trim()).filter((x) => x && x !== "/" && x !== "›") : [],
    beRongThan: r ? Math.round(r.width) : null,
    // Lệch trái so với mép trong của vùng nội dung (trừ lề trong của khối cha — gốc BoCuc có lề 0, Ô nhận lead có lề vỏ).
    lechTrai: r && cha ? Math.round(r.left - cha.left - parseFloat(getComputedStyle(goc.parentElement).paddingLeft || "0")) : null,
    khoangNhanNut: xaNhat === null ? null : Math.round(xaNhat),
    phamVi: ["Áp cho tài khoản của bạn ở mọi sàn", "Chỉ áp cho sàn"].find((c) => text.includes(c)) ?? null,
    trenMayNay: (text.match(/Trên máy này/g) ?? []).length,
    bao: text.includes("Mục này chỉ quản trị sàn mở được"),
    sauNhom: ["Hồ sơ", "Sàn", "Cài lên màn hình chính", "Thông báo lead", "Máy đang đăng nhập", "Đăng xuất"].every((n) => text.includes(n)),
    cot: cot ? [...cot.querySelectorAll("p")].map((p) => p.innerText.trim()) : [],
    mucCot: cot ? [...cot.querySelectorAll("a")].map((x) => x.innerText.trim()) : [],
    tabSang: [...document.querySelectorAll('[data-slot="mobile-tab-bar"] [aria-current="page"]')].map((x) => x.innerText.trim()),
    tab: [...document.querySelectorAll('[data-slot="mobile-tab-bar"] a')].map((x) => x.innerText.trim()),
  };
})()`;

const chrome = await moChrome();
const ra = (canh, du) => console.log(JSON.stringify({ canh, ...du }));
async function trang(email, rong, cao) {
  const t = await chrome.trang(rong, cao);
  await t.datCookie(phien(email));
  return t;
}
const bam = (t, sel, chu) =>
  t.tinh(`(() => { const x = [...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => e.innerText.trim() === ${JSON.stringify(chu)} || e.getAttribute("aria-label") === ${JSON.stringify(chu)}); if (x) x.click(); return !!x; })()`);
const coThan = `(!!document.querySelector("[data-bo-cuc-goc]") || !!document.querySelector('[data-slot="frame"]')) && !document.querySelector('[data-slot="skeleton"]')`;
// Lần dựng đầu của máy dev (Turbopack) có lúc kẹt trang ở khung xương «Đang tải lần đầu» (lượt chấm 1, như hàng 43):
// hết 60 giây mà trang chưa ra thân thì mở lại đúng đường ấy, tối đa ba lần × 80 giây, ghi số lần mở lại.
async function choDuong(t, duong) {
  const dk = `location.pathname === ${JSON.stringify(duong)} && ${coThan}`;
  try {
    await t.cho(dk, 60000);
    return 0;
  } catch {
    for (let i = 1; i <= 3; i++) {
      await t.di(duong);
      try {
        await t.cho(dk, 80000);
        console.error(`mở lại ${duong} lần ${i}`);
        return i;
      } catch {
        // thử lần kế
      }
    }
    throw new Error(`${duong}: trang không ra thân sau ba lần mở lại`);
  }
}
// Menu tài khoản: bấm tới khi menu mở (trang có thể chưa gắn sự kiện ngay sau khi vẽ), tối đa mười lần.
async function moMenu(t) {
  const mo = `[...document.querySelectorAll('[role="menuitem"]')].length > 0`;
  for (let i = 0; i < 10; i++) {
    await bam(t, "button", "Tài khoản");
    await ngu(1000);
    if (await t.tinh(mo).catch(() => false)) return;
  }
  throw new Error("menu tài khoản không mở");
}
const chup = async (t, ten) => writeFileSync(path.join(RA, `E11-${ten}.png`), await t.chup());

try {
  // 1. Đầu chủ, máy tính: từ Hôm nay bấm biểu tượng Cài đặt (một lần bấm) → Cá nhân.
  {
    const t = await trang(DAU_CHU, 1440, 900);
    await t.di("/today");
    await t.cho(`!!document.querySelector('[data-slot="home-rail"] a[aria-label="Cài đặt"]')`, 120000);
    await bam(t, '[data-slot="home-rail"] a', "Cài đặt");
    await choDuong(t, "/settings/personal");
    await ngu(1500);
    ra("e11-ca-nhan-1440", { ...(await t.tinh(DO)), soLanBam: 1 });
    await chup(t, "ca-nhan-1440");
    // Menu tài khoản: chỉ «Cá nhân»; từ Hôm nay hai lần bấm (mở menu, chọn mục).
    await t.di("/today");
    await t.cho(`!!document.querySelector('button[aria-label="Tài khoản"]')`, 60000);
    await moMenu(t);
    const menu = await t.tinh(`[...document.querySelectorAll('[role="menuitem"]')].map((m) => m.innerText.trim())`);
    await chup(t, "menu-dau-chu-1440");
    await bam(t, '[role="menuitem"]', "Cá nhân");
    await choDuong(t, "/settings/personal");
    ra("e11-menu-dau-chu", { menu, duong: await t.tinh("location.pathname"), soLanBam: 2 });
    // Gõ thẳng địa chỉ một mục sàn → về Cá nhân kèm câu báo.
    await t.di("/settings/users");
    await choDuong(t, "/settings/personal");
    await ngu(1000);
    ra("e11-chan", await t.tinh(DO));
    await chup(t, "chan-1440");
    // Ô nhận lead: bố cục Đọc hẹp.
    await t.di("/leads/new");
    await choDuong(t, "/leads/new");
    await ngu(1000);
    ra("e11-doc-1440-lead", await t.tinh(DO));
    await chup(t, "doc-lead-1440");
    t.dong();
  }
  // 2. Quản trị, máy tính: biểu tượng Cài đặt → Người dùng, cột hai nhóm; menu tài khoản có «Cài đặt sàn».
  {
    const t = await trang(QUAN_TRI, 1440, 900);
    await t.di("/");
    await t.cho(`!!document.querySelector('[data-slot="home-rail"] a[aria-label="Cài đặt"]')`, 120000);
    await bam(t, '[data-slot="home-rail"] a', "Cài đặt");
    await choDuong(t, "/settings/users");
    await ngu(1500);
    ra("e11-quan-tri-1440", { ...(await t.tinh(DO)), soLanBam: 1 });
    await chup(t, "quan-tri-1440");
    await t.di("/settings/personal");
    await choDuong(t, "/settings/personal");
    await moMenu(t);
    const menu = await t.tinh(`[...document.querySelectorAll('[role="menuitem"]')].map((m) => m.innerText.trim())`);
    await chup(t, "menu-quan-tri-1440");
    await bam(t, '[role="menuitem"]', "Cài đặt sàn");
    await choDuong(t, "/settings/users");
    ra("e11-menu-quan-tri", { menu, duong: await t.tinh("location.pathname"), soLanBam: 2 });
    await t.di("/settings/labels");
    await choDuong(t, "/settings/labels");
    await ngu(1000);
    ra("e11-doc-1440-trang-tam", await t.tinh(DO));
    await chup(t, "doc-trang-tam-1440");
    ra("e11-doc-1440-nguoi-dung", await (async () => {
      await t.di("/settings/users");
      await choDuong(t, "/settings/users");
      await ngu(1000);
      return t.tinh(DO);
    })());
    await chup(t, "doc-nguoi-dung-1440");
    t.dong();
  }
  // 3. Điện thoại: đầu chủ bấm tab Tôi → Cá nhân; người chỉ quản trị có tab Cài đặt sàn · Tôi, tab sáng theo đường.
  {
    const t = await trang(DAU_CHU, 390, 844);
    await t.di("/today");
    await t.cho(`!!document.querySelector('[data-slot="mobile-tab-bar"]')`, 120000);
    await bam(t, '[data-slot="mobile-tab-bar"] a', "Tôi");
    await choDuong(t, "/settings/personal");
    await ngu(1500);
    ra("e11-dien-thoai-390", await t.tinh(DO));
    await chup(t, "dien-thoai-390");
    t.dong();
  }
  {
    const t = await trang(QUAN_TRI, 390, 844);
    await t.di("/settings/personal");
    await choDuong(t, "/settings/personal");
    await ngu(1500);
    const caNhan = await t.tinh(DO);
    await chup(t, "quan-tri-390-ca-nhan");
    await t.di("/settings/users");
    await choDuong(t, "/settings/users");
    await ngu(1500);
    const san = await t.tinh(DO);
    await chup(t, "quan-tri-390-san");
    ra("e11-quan-tri-390", { tab: caNhan.tab, oCaNhan: caNhan.tabSang, oMucSan: san.tabSang });
    t.dong();
  }
} finally {
  chrome.dong();
}
