// Kịch bản ui-check E9, E9b của hàng 89 trên máy dev dãy H (dựng bằng dung-h.mjs). Chrome không đầu; mỗi cảnh in một dòng
// JSON (đã thấy gì) và chụp E9-<cảnh>.png. Bộ mẫu 2 chủ nhà, 5 căn dựng lại bằng dung-h.mjs --mau ở đầu kịch bản.
//   node _acceptance/doi-dau-chu-hang-loat/thu/chay-ui.mjs [--ra <thư mục>]
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3494";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG = path.join(GOC, "_acceptance/doi-dau-chu-hang-loat/thu/dung-h.mjs");
const { values: a } = parseArgs({ options: { ra: { type: "string" } } });
const RA = path.resolve(GOC, a.ra ?? "_acceptance/doi-dau-chu-hang-loat/evidence");
mkdirSync(RA, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const dung = (...x) => JSON.parse(execFileSync("node", [DUNG, ...x], { cwd: GOC }).toString());
const cookie = (email) => dung("--phien", email).cookie.map((c) => `${c.name}=${c.value}`);
const mau = dung("--mau");
// Mồi rò rỉ: tên và số chủ nhà thật của 5 căn (dung-h.mjs --mau ghi qua API), số ở cả dạng liền và dạng tách nhóm.
const MOC_CHU = mau.chu.flatMap((c) => [c.ten, c.so, c.so.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3")]);
const X = mau.can.slice(0, 3);
const Y = mau.can.slice(3);
const ra = (canh, du) => console.log(JSON.stringify({ canh, ...du }));
const chrome = await moChrome();

async function trang(email) {
  const t = await chrome.trang(1440, 900);
  await t.datCookie(cookie(email));
  return t;
}
const chup = async (t, ten) => writeFileSync(path.join(RA, `E9-${ten}.png`), await t.chup());
const bam = (t, sel, chu) =>
  t.tinh(`(() => { const x = [...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => e.innerText.trim() === ${JSON.stringify(chu)} || e.getAttribute("aria-label") === ${JSON.stringify(chu)}); if (x) x.click(); return !!x; })()`);

/** Mở bảng hàng; máy dev vừa dựng có lúc kẹt «Đang tải lần đầu» (hàng 43) — mở lại tối đa ba lần × 80 giây. */
async function moBang(t) {
  const xong = `!!document.querySelector('tr') && document.querySelectorAll('[aria-label="Chọn dòng"]').length > 0`;
  for (let i = 0; i < 3; i++) {
    await t.di("/inventory");
    try {
      await t.cho(xong, 80000);
      return;
    } catch {
      // thử lần kế
    }
  }
  throw new Error("bảng hàng không lên sau ba lần mở");
}

/** Tích dòng của một mã căn: cuộn lưới tới khi dòng hiện (lưới chỉ vẽ dòng trong tầm nhìn). */
async function tich(t, ma) {
  for (let i = 0; i < 60; i++) {
    const ok = await t.tinh(`(() => {
      const row = [...document.querySelectorAll('tr')].find((r) => r.innerText.split("\\n").some((x) => x.trim() === ${JSON.stringify(ma)}));
      const cb = row?.querySelector('[aria-label="Chọn dòng"]');
      if (cb) { cb.click(); return true; }
      const cuon = [...document.querySelectorAll("*")].find((e) => e.scrollHeight > e.clientHeight + 50 && e.querySelector('tr'));
      if (cuon) cuon.scrollTop += 300;
      return false;
    })()`);
    if (ok) return;
    await ngu(300);
  }
  throw new Error(`không thấy dòng ${ma}`);
}

async function moHop(t) {
  await bam(t, "button", "Đổi đầu chủ");
  await t.cho(`!!document.querySelector('ul[aria-label="Căn sẽ đổi"]')`, 30000);
}
const docHop = `(() => {
  const d = document.querySelector('[role="alertdialog"]');
  const li = [...(d?.querySelectorAll('ul[aria-label="Căn sẽ đổi"] li') ?? [])].map((x) => x.innerText.trim());
  return { tieuDe: d?.querySelector("h2")?.innerText ?? null, moTa: d?.querySelector("p")?.innerText ?? null, dong: li, text: d?.innerText ?? "" };
})()`;

try {
  // Tên hiển thị của D2 để chọn trong hộp.
  const tn = await trang("truong-nhom@mau.quy-hang.test");
  await moBang(tn);
  const ds = await tn.tinh(`fetch("/api/v1/team/listing-agents", { credentials: "same-origin" }).then((r) => r.json())`);
  const tenD2 = ds.items.find((x) => x.userId === mau.d2)?.displayName;
  const tenD1 = ds.items.find((x) => x.userId === mau.d1)?.displayName;

  // 1. Hộp hỏi: tích 1 căn mỗi chủ, chọn D2.
  await tich(tn, X[0].ma);
  await tich(tn, Y[0].ma);
  await moHop(tn);
  await tn.tinh(`(() => { const b = document.querySelector('[aria-label="Đầu chủ mới"]'); b?.click(); return !!b; })()`);
  await tn.cho(`[...document.querySelectorAll('[role="option"]')].length > 0`, 10000);
  await bam(tn, '[role="option"]', tenD2);
  await ngu(500);
  const hop = await tn.tinh(docHop);
  const lo = MOC_CHU.filter((m) => hop.text.includes(m));
  // Đối chứng dương: cài tạm một mồi vào hộp hỏi rồi đọc lại bằng đúng docHop — bài quét phải bắt được nó.
  await tn.tinh(`(() => { const s = document.createElement("span"); s.id = "moi-ro-ri"; s.textContent = ${JSON.stringify(MOC_CHU[0])}; document.querySelector('[role="alertdialog"]').appendChild(s); })()`);
  const batDuoc = (await tn.tinh(docHop)).text.includes(MOC_CHU[0]);
  await tn.tinh(`document.getElementById("moi-ro-ri")?.remove()`);
  ra("e9-hop-hoi", { tieuDe: hop.tieuDe, moTa: hop.moTa, soDong: hop.dong.length, cungChu: hop.dong.filter((x) => x.includes("cùng chủ nhà")).length, nguoiGiuCu: [...new Set(hop.dong.map((x) => x.split("đang giữ: ")[1]?.split(" · ")[0]))], tenD1, soMoi: MOC_CHU.length, loChuNha: lo, doiChungDuong: batDuoc });
  await chup(tn, "hop-hoi");

  // 2. Đổi — không tải lại trang; mở lại hộp để đọc «đang giữ».
  const dau = Date.now();
  // Dấu trên window đặt ngay trước khi bấm xác nhận: trang tải lại hay điều hướng thì dấu mất.
  await tn.tinh(`window.__dauDoi = ${dau}`);
  await tn.tinh(`(() => { const b = [...document.querySelectorAll('[role="alertdialog"] button')].find((x) => x.innerText.trim() === "Đổi đầu chủ"); b?.click(); return !!b; })()`);
  await tn.cho(`[...document.querySelectorAll("[data-sonner-toast]")].some((x) => x.innerText.includes("Đã đổi đầu chủ"))`, 30000);
  const thongBao = await tn.tinh(`[...document.querySelectorAll("[data-sonner-toast]")].map((x) => x.innerText.trim()).find((x) => x.includes("Đã đổi đầu chủ"))`);
  await chup(tn, "sau-doi");
  const db1 = dung("--doc");
  ra("e9-sau-doi", { thongBao, giay: Math.round((Date.now() - dau) / 100) / 10, khongTaiLai: (await tn.tinh("window.__dauDoi ?? null")) === dau });
  ra("e9-sau-doi-db", db1);

  // 3. Hoàn tác trên thông báo.
  await tn.tinh(`(() => { const b = [...document.querySelectorAll("[data-sonner-toast] button")].find((x) => x.innerText.trim() === "Hoàn tác"); b?.click(); return !!b; })()`);
  await tn.cho(`[...document.querySelectorAll("[data-sonner-toast]")].some((x) => x.innerText.includes("Đã trả lại người giữ cũ"))`, 30000);
  const tbHoanTac = await tn.tinh(`[...document.querySelectorAll("[data-sonner-toast]")].map((x) => x.innerText.trim()).find((x) => x.includes("Đã trả lại"))`);
  await chup(tn, "hoan-tac");
  ra("e9-hoan-tac", { thongBao: tbHoanTac, db: dung("--doc") });
  // Đối chứng dương cho ô khongTaiLai: tải lại thật thì dấu phải mất.
  await tn.tinh("location.reload()");
  await ngu(1500);
  await tn.cho("document.readyState === 'complete'", 30000);
  ra("e9-doi-chung-tai-lai", { dauConSauTaiLai: (await tn.tinh("window.__dauDoi ?? null")) !== null });
  tn.dong();

  // 4. Đầu chủ đăng nhập, tích căn: không có lệnh.
  const dc = await trang("dau-chu-1@mau.quy-hang.test");
  await moBang(dc);
  await tich(dc, X[0].ma);
  await ngu(500);
  const coLenh = await dc.tinh(`[...document.querySelectorAll("button")].some((b) => b.innerText.trim() === "Đổi đầu chủ")`);
  const coThanh = await dc.tinh(`!!document.querySelector('[aria-label="Sửa hàng loạt"]')`);
  await chup(dc, "dau-chu");
  ra("e9-dau-chu", { coThanh, coLenh });
  dc.dong();
} finally {
  chrome.dong();
}
