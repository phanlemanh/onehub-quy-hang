// Kịch bản nhìn giao diện của Xuất bảng hàng (hàng 43: E1b, E6b, E7b, E8c) trên máy dev dãy H (dựng bằng dung-h.mjs, nạp
// hàng mẫu bằng nap-hang.mjs). Mỗi «máy» là một Chrome không đầu, hồ sơ riêng. In mỗi bước một dòng JSON (đã thấy gì), chụp
// ảnh và lưu tệp tải về vào --ra; người chấm xem ảnh, mở tệp và đối chiếu dòng.
//   node _acceptance/phat-hang/thu/chay-ui.mjs --e1b --ra _acceptance/phat-hang/evidence
//   node _acceptance/phat-hang/thu/chay-ui.mjs --e6b|--e7b|--e8c --ra _acceptance/phat-hang/evidence
// Bài chép bắt bằng cách bọc navigator.clipboard.writeText của trang (vẫn gọi bản gốc) — đúng chữ trang đưa cho bộ nhớ tạm.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3494";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG = path.join(GOC, "_acceptance/phat-hang/thu/dung-h.mjs");
const { values: a } = parseArgs({
  options: { e1b: { type: "boolean" }, e6b: { type: "boolean" }, e7b: { type: "boolean" }, e8c: { type: "boolean" }, ra: { type: "string" } },
});
const RA = path.resolve(GOC, a.ra ?? ".acceptance-runs/phat-hang/ui");
mkdirSync(RA, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const ghi = (buoc, thay) => console.log(JSON.stringify({ buoc, ...thay }));

const phien = (email, moi = false) =>
  JSON.parse(execFileSync("node", [DUNG, "--phien", email, ...(moi ? ["--moi"] : [])], { cwd: GOC }).toString()).cookie.map((c) => `${c.name}=${c.value}`);

const BAT_CHEP = `(() => { window.__chep = []; const c = navigator.clipboard; if (!c) return; const goc = c.writeText ? c.writeText.bind(c) : null;
  c.writeText = async (s) => { window.__chep.push(String(s)); try { if (goc) await goc(s); } catch {} }; })()`;

/** Một «máy»: Chrome riêng, khổ đã cho, đã đăng nhập; tệp tải về vào thư mục tạm của máy. */
async function may(rong, cao, ck, taiVe) {
  const chrome = await moChrome();
  const t = await chrome.trang(rong, cao);
  await t.datCookie(ck);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: BAT_CHEP });
  if (taiVe) {
    mkdirSync(taiVe, { recursive: true });
    await t.gui("Page.setDownloadBehavior", { behavior: "allow", downloadPath: taiVe });
  }
  return { chrome, t };
}
const anPortal = (t) =>
  t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; (document.head ?? document.documentElement).appendChild(s); return true; })()`);
const NUT = (chu, trongHop = false) =>
  `[...document.querySelectorAll('${trongHop ? '[role="dialog"] ' : ""}button')].find((b) => b.innerText.trim() === ${JSON.stringify(chu)})`;
const bam = (t, chu, trongHop = true) => t.tinh(`(() => { const b = ${NUT(chu, trongHop)}; if (!b || b.disabled) return false; b.click(); return true; })()`);
/** Bấm nhãn một lựa chọn trong nhóm (Mẫu / Người nhận) của hộp thoại theo chữ đầu nhãn. */
const chon = (t, nhom, chu) =>
  t.tinh(`(() => { const g = document.querySelector('[role="dialog"] [role="radiogroup"][aria-label="${nhom}"]'); if (!g) return false;
    const l = [...g.querySelectorAll("label")].find((x) => x.innerText.trim().startsWith(${JSON.stringify(chu)})); if (!l) return false; l.click(); return true; })()`);
const chuHop = (t) => t.tinh(`document.querySelector('[role="dialog"]')?.innerText ?? ""`);
const chup = async (t, ten) => {
  writeFileSync(path.join(RA, ten), await t.chup());
  return ten;
};

/** Mở bảng hàng, chờ có nút «Xuất bảng hàng» bấm được (lần kéo đầu của bộ đồng bộ có thể vẽ lại trang một lượt). */
async function moBang(t, duong = "/inventory") {
  // Nhiều trình khách cùng một máy dev (lượt chấm chạy song song các bài giao diện) có lúc làm lần kéo đầu kẹt ở «Đang tải
  // lần đầu»: mở lại trang, tối đa ba lần, mỗi lần chờ 80 giây — rồi mới báo hỏng.
  for (let lan = 1; ; lan++) {
    await t.di(duong);
    try {
      await t.cho(`(() => { const b = ${NUT("Xuất bảng hàng")}; return !!b; })()`, 80000);
      break;
    } catch (e) {
      if (lan >= 3) throw e;
      ghi("mo-lai-bang-hang", { lan, ly_do: "kẹt «Đang tải lần đầu» quá 80 giây" });
    }
  }
  await anPortal(t);
  await ngu(1500);
}
async function tich(t, n) {
  return t.tinh(`(() => { const o = [...document.querySelectorAll('[aria-label="Chọn dòng"]')].slice(0, ${n}); o.forEach((x) => x.click()); return o.length; })()`);
}
async function moHop(t) {
  for (let i = 0; i < 10; i++) {
    await bam(t, "Xuất bảng hàng", false);
    await ngu(1200);
    if (await t.tinh(`document.querySelector('[role="dialog"]') !== null`)) return true;
  }
  return false;
}
async function denBuoc3(t, mau, nguoiNhan) {
  await chon(t, "Mẫu", mau);
  await ngu(300);
  await bam(t, "Tiếp");
  await ngu(500);
  await chon(t, "Người nhận", nguoiNhan);
  await ngu(300);
  await bam(t, "Tiếp");
  await ngu(800);
}
/** Đi tới bước 4 và bấm chép hay tải; trả lời báo của hộp thoại và tệp mới tải về (nếu có). */
async function xuat(t, taiVe) {
  await bam(t, "Tiếp");
  await ngu(500);
  // Tệp tải về cùng tên lần trước thì bị ghi đè: dọn thư mục trước mỗi lần để mọi tệp sau bấm là của lần này.
  rmSync(taiVe, { recursive: true, force: true });
  mkdirSync(taiVe, { recursive: true });
  const truoc = new Set();
  const coBai = await bam(t, "Chép bài");
  if (!coBai) await bam(t, "Tải file");
  let tep = null;
  for (let i = 0; i < 40 && !tep && !coBai; i++) {
    await ngu(300);
    tep = readdirSync(taiVe).find((f) => !truoc.has(f) && !f.endsWith(".crdownload")) ?? null;
  }
  await ngu(1200);
  const bao = (await chuHop(t)).split("\n").filter((l) => /Đã chép bài|Đã tải|Chưa ghi được lần xuất/.test(l));
  const bai = coBai ? await t.tinh(`(window.__chep ?? []).at(-1) ?? null`) : null;
  return { bao, tep, bai };
}

const DAU_CHU = "dau-chu-1@mau.quy-hang.test";

if (a.e1b) {
  const ck = phien(DAU_CHU, true);
  const { chrome, t } = await may(1440, 900, ck);
  try {
    await moBang(t);
    await tich(t, 2);
    await ngu(500);
    await moHop(t);
    ghi("e1b-buoc-1", { anh: await chup(t, "E1b-buoc-1-1440.png"), chu: (await chuHop(t)).slice(0, 500) });
    await denBuoc3(t, "Excel", "Nhóm môi giới");
    const b3 = await chuHop(t);
    ghi("e1b-buoc-3-hai-can", { anh: await chup(t, "E1b-buoc-3-hai-can-1440.png"), tomTat: b3.match(/^\d+ căn$/m)?.[0], boQua: b3.match(/Cột không ra ngoài[^\n]*/)?.[0] ?? null });
    // Từ bước 3 quay lại hai bước (về bước 1), rồi tiến sang bước 2 đổi người nhận.
    await bam(t, "Quay lại");
    await ngu(400);
    await bam(t, "Quay lại");
    await ngu(400);
    const veBuoc1 = /Bài Zalo/.test(await chuHop(t));
    await bam(t, "Tiếp");
    await ngu(400);
    await chon(t, "Người nhận", "Khách riêng");
    await ngu(300);
    await bam(t, "Tiếp");
    await ngu(800);
    const kr = await chuHop(t);
    ghi("e1b-quay-lai-khach-rieng", { veBuoc1, nguoiNhan: kr.match(/(Nhóm môi giới|Khách riêng)$/m)?.[0] ?? null, anh: await chup(t, "E1b-quay-lai-khach-rieng-1440.png"), tomTat: kr.match(/^\d+ căn$/m)?.[0], coCotMaCan: /\tMã căn\t|Mã căn\t/.test(kr), boQua: kr.match(/Cột không ra ngoài[^\n]*/)?.[0] ?? null });
    await t.tinh(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })) || true`);
    await ngu(600);
    await tich(t, 2); // bỏ tích hai căn đã tích
    await ngu(500);
    await moHop(t);
    const b1 = await chuHop(t);
    ghi("e1b-khong-tich", { anh: await chup(t, "E1b-khong-tich-1440.png"), tomTat: b1.match(/^\d+ căn$/m)?.[0], khoa: (b1.match(/Quá 30 căn — dùng Excel hay PDF/g) ?? []).length });
  } finally {
    chrome.dong();
  }
  // Menu Tạo → /exports/new → về bảng hàng, hộp thoại mở.
  {
    const { chrome, t } = await may(1440, 900, ck);
    try {
      await t.di("/exports/new");
      await t.cho(`location.pathname === "/inventory" && document.querySelector('[role="dialog"]') !== null`, 240000);
      await anPortal(t);
      await ngu(800);
      ghi("e1b-menu-tao", { anh: await chup(t, "E1b-menu-tao-1440.png"), url: await t.tinh("location.pathname + location.search") });
    } finally {
      chrome.dong();
    }
  }
  // Khổ điện thoại: không có nút.
  {
    const { chrome, t } = await may(390, 844, ck);
    try {
      await t.di("/inventory");
      await ngu(15000);
      await anPortal(t);
      const coNut = await t.tinh(`(() => { const b = ${NUT("Xuất bảng hàng")}; return !!b && b.offsetParent !== null; })()`);
      ghi("e1b-dien-thoai", { anh: await chup(t, "E1b-dien-thoai-390.png"), coNutHien: coNut });
    } finally {
      chrome.dong();
    }
  }
}

if (a.e6b) {
  const ck = phien(DAU_CHU, true);
  const taiVe = path.join(RA, "tai-ve-e6b");
  rmSync(taiVe, { recursive: true, force: true });
  const { chrome, t } = await may(1440, 900, ck, taiVe);
  try {
    for (const [n, mau, ten] of [
      [12, "Ảnh", "E6b-12-can.png"],
      [12, "PDF", "E6b-12-can.pdf"],
      [30, "Ảnh", "E6b-30-can.png"],
      [0, "PDF", "E6b-tren-30-can.pdf"], // không tích: mọi căn đang hiện (33 căn mẫu của dau-chu-1) — trên ngưỡng 30
    ]) {
      await moBang(t);
      // Bảng chỉ vẽ sẵn các dòng đang thấy: 30 căn = «Chọn hết» (33 căn mẫu) rồi bỏ tích 3 dòng đầu.
      let daTich = 0;
      if (n === 30) {
        await t.tinh(`(() => { const h = document.querySelector('[aria-label="Chọn hết"]'); if (h) h.click(); return !!h; })()`);
        await ngu(500);
        await tich(t, 3);
        daTich = 30;
      } else if (n > 0) daTich = await tich(t, n);
      await ngu(500);
      await moHop(t);
      const b1 = await chuHop(t);
      const khoaAnh = /Ảnh\s+Quá 30 căn/.test(b1);
      ghi(`e6b-${n}-${mau}-buoc-1`, { anh: await chup(t, `E6b-${n}-${mau === "Ảnh" ? "anh" : "pdf"}-buoc-1.png`), daTich, soCan: b1.match(/^(\d+) căn$/m)?.[1], khoaAnh });
      await denBuoc3(t, mau, "Nhóm môi giới");
      const r = await xuat(t, taiVe);
      if (r.tep) renameSync(path.join(taiVe, r.tep), path.join(RA, ten));
      ghi(`e6b-${n}-${mau}`, { tepTaiVe: r.tep, luuThanh: r.tep ? ten : null, bao: r.bao });
      await t.tinh(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })) || true`);
    }
  } finally {
    chrome.dong();
  }
}

if (a.e7b || a.e8c) {
  // Đáp án viết trước: chủ nhà, số, giá đáy của hàng dau-chu-1 nạp bởi nap-hang.mjs (cùng nguồn du-lieu-mau.json).
  const mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
  const chuNha = new Map(mau.chuNha.map((c) => [c.ma, c]));
  const moi = [];
  for (const h of mau.hang.filter((x) => x.dauChu === "dau-chu-1")) {
    const cn = chuNha.get(h.chuNha);
    if (cn) moi.push(cn.ten, cn.soDienThoai, cn.soDienThoai.replace(/\s/g, ""));
    const day = Math.round((h.gia * 0.9) / 1_000_000) * 1_000_000;
    moi.push(String(day));
  }
  const tim = (vanBan) => [...new Set(moi.filter((m) => vanBan.includes(m)))];
  const docXlsx = (tep) => execFileSync("python3", ["-I", path.join(GOC, "packages/db/seed/doc-xlsx.py"), tep], { cwd: GOC }).toString();
  const lanXuat = () => JSON.parse(execFileSync("node", [DUNG, "--lan-xuat"], { cwd: GOC }).toString());

  const ck = phien(DAU_CHU, true);
  const taiVe = path.join(RA, a.e7b ? "tai-ve-e7b" : "tai-ve-e8c");
  rmSync(taiVe, { recursive: true, force: true });
  const { chrome, t } = await may(1440, 900, ck, taiVe);
  try {
    if (a.e7b) {
      for (const [mauXuat, nguoiNhan] of [
        ["Excel", "Nhóm môi giới"],
        ["Bài Zalo", "Nhóm môi giới"],
        ["Excel", "Khách riêng"],
        ["Bài Zalo", "Khách riêng"],
      ]) {
        await moBang(t);
        await tich(t, 20);
        await ngu(500);
        await moHop(t);
        await denBuoc3(t, mauXuat, nguoiNhan);
        const r = await xuat(t, taiVe);
        const chu = r.bai ?? (r.tep ? docXlsx(path.join(taiVe, r.tep)) : "");
        const maCan = (chu.match(/\b[AB]-\d{2}\.\d{2}\b/g) ?? []).length;
        ghi(`e7b-${mauXuat}-${nguoiNhan}`, { tep: r.tep, bao: r.bao, doDai: chu.length, ro: tim(chu), soMaCan: maCan });
        writeFileSync(path.join(RA, `E7b-${mauXuat === "Excel" ? "xlsx" : "bai-zalo"}-${nguoiNhan === "Khách riêng" ? "khach-rieng" : "nhom-moi-gioi"}.txt`), chu);
        await t.tinh(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })) || true`);
      }
      ghi("e7b-chuoi-do", { soChuoiMoi: moi.length, viDu: moi.slice(0, 3).map((m) => m.replace(/\d(?=\d{2})/g, "•")) });
    }
    if (a.e8c) {
      const truoc = lanXuat();
      for (const [mauXuat, nguoiNhan] of [
        ["Bài Zalo", "Nhóm môi giới"],
        ["Excel", "Khách riêng"],
      ]) {
        await moBang(t);
        await tich(t, 3);
        await ngu(500);
        await moHop(t);
        await denBuoc3(t, mauXuat, nguoiNhan);
        const r = await xuat(t, taiVe);
        ghi(`e8c-${mauXuat}-${nguoiNhan}`, { bao: r.bao, tep: r.tep });
        await t.tinh(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })) || true`);
      }
      await ngu(1500);
      const sau = lanXuat();
      const moiThem = sau.slice(truoc.length);
      const soDo = execFileSync("node", ["--import", "tsx", path.join(GOC, "_acceptance/phat-hang/thu/so-do.ts")], {
        cwd: GOC,
        input: JSON.stringify(moiThem.map((x) => ({ createdAt: x.created_at }))),
      }).toString().trim();
      ghi("e8c-bang-exports", { truoc: truoc.length, sau: sau.length, them: moiThem.map((x) => ({ format: x.format, recipient: x.recipient, listing_count: x.listing_count })), soDo });
      await chup(t, "E8c-sau-1440.png");
    }
  } finally {
    chrome.dong();
  }
}
