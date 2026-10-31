// Máy đo cuộn của ADR-0004 chạy lại trên màn thật (hàng 14, AC-9, E11): Bảng hàng của «[Mẫu] Sàn đo cuộn» có 5.000
// hàng, nhóm Toà → Loại căn, cột Toà và Mã căn ghim. Chrome không đầu 1366×768, CPU giảm tốc 4×, ba lượt hợp lệ lấy trung
// vị; mỗi lượt hiệu chuẩn trước trên trang rỗng (p95 khung ≤ 17,5 ms, không thì đo lại, tối đa 3 lần). Đối chứng đỏ
// trên cùng máy đo: tiêm việc bận 60 ms mỗi khung — phải trượt ngưỡng p95, không thì máy đo không phân biệt được.
//   node _acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs [--khong-build]   cần dung-b.mjs --nhan 5000 đã chạy (bản dev,
//   giữ phiên). Lệnh tự build, bật bản build ở 3491, đo, rồi tắt — đo bản build như ADR-0004, không đo bản dev.
import { execFileSync, spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Bản build riêng ở cổng 3491 (giám sát cấp cho lượt chấm, B-6) — bản dev ở 3481 phục vụ bài nhìn cùng lúc.
const CONG_BUILD = 3491;
process.env.QH_B_URL = `http://localhost:${CONG_BUILD}`;
const { GOC, cookieCua, moChrome } = await import("./cdp.mjs");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const URL_BUILD = process.env.QH_B_URL;

const NGUONG = { p95: 33.4, cham: 0.01 };
const SO_HANG = 5000;
const SO_LUOT = 3;
const RONG = 1366;
const CAO = 768;
const THOI_GIAN_CUON = 8000;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const p95 = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length * 0.95)] ?? Infinity;
const trungVi = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// Build rồi bật next start; tắt đúng PID đã ghi khi xong (luật đợt 8).
if (!process.argv.includes("--khong-build")) execFileSync("npm", ["run", "build", "-w", "@quy-hang/web"], { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"] });
const nhatKy = openSync(path.join(ROOT, ".acceptance-runs/bang-hang-kieu-sheet/web-build.log"), "a");
const mayChu = spawn(path.join(ROOT, "node_modules/.bin/next"), ["start", "-p", String(CONG_BUILD), "apps/web"], {
  cwd: ROOT,
  env: {
    ...process.env,
    DATABASE_URL: "postgres://postgres:quyhang@localhost:5561/postgres",
    BETTER_AUTH_SECRET: "dev-b-chuoi-thu-khong-dung-o-ban-that",
    BETTER_AUTH_URL: URL_BUILD,
    // Bản build đòi bộ gửi mã: khoá giả, không lời xin mã nào tới đây — phiên dùng lại từ bản dev.
    RESEND_API_KEY: "khoa-gia-ban-build-khong-gui",
    MAIL_FROM: "khong-gui@mau.quy-hang.test",
  },
  stdio: ["ignore", nhatKy, nhatKy],
});
const tatMayChu = () => {
  try {
    process.kill(mayChu.pid);
  } catch {
    // đã thoát
  }
};
process.on("exit", tatMayChu);
for (let i = 0; ; i++) {
  try {
    if ((await fetch(`${URL_BUILD}/api/v1/health`)).ok) break;
  } catch {
    // chưa lên
  }
  if (i > 120) throw new Error("bản build không lên ở cổng 3491");
  await ngu(1000);
}
const cookie = await cookieCua("do-cuon@mau.quy-hang.test", { chiPhienGiu: true });
const chrome = await moChrome();

/** Ghi dấu thời gian mỗi khung trong `ms` mili giây, trả khoảng cách giữa các khung. */
const GHI_KHUNG = (ms) => `new Promise((xong) => {
  const t = []; const dau = performance.now();
  const f = (now) => { t.push(now); if (now - dau < ${ms}) requestAnimationFrame(f); else xong(t.slice(1).map((x, i) => x - t[i])); };
  requestAnimationFrame(f);
})`;

async function hieuChuan(t) {
  await t.gui("Page.navigate", { url: "about:blank" });
  await ngu(300);
  return p95(await t.tinh(GHI_KHUNG(2000)));
}

async function luot(cham) {
  const t = await chrome.trang(RONG, CAO);
  await t.gui("Emulation.setCPUThrottlingRate", { rate: 4 });
  let hc = Infinity;
  for (let i = 0; i < 3 && hc > 17.5; i++) hc = await hieuChuan(t);
  await t.datCookie(cookie);
  await t.di("/inventory");
  await t.cho(`document.body.innerText.includes('/ ${SO_HANG.toLocaleString("en-US").replace(",", "")} căn') || document.body.innerText.includes('/ ${SO_HANG} căn')`, 180000);
  await ngu(1500);
  const vp = await t.tinh(`(() => { const v = document.querySelector('[data-slot="data-grid-scroll-area"] [data-slot="scroll-area-viewport"]'); const r = v.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, cao: v.scrollHeight - v.clientHeight }; })()`);
  if (cham) await t.tinh(`(() => { const f = () => { const d = performance.now(); while (performance.now() - d < 60); requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()`);
  const ghi = t.tinh(GHI_KHUNG(THOI_GIAN_CUON + 300));
  const buoc = Math.ceil(THOI_GIAN_CUON / 16);
  const delta = Math.ceil(vp.cao / buoc) + 1;
  for (let i = 0; i < buoc; i++) {
    await t.gui("Input.dispatchMouseEvent", { type: "mouseWheel", x: vp.x, y: vp.y, deltaX: 0, deltaY: delta });
    await ngu(16);
  }
  const khung = await ghi;
  await ngu(500);
  const cuoi = await t.tinh(`Math.max(0, ...[...document.querySelectorAll('[data-slot="row-number"]')].map((e) => Number(e.textContent) || 0))`);
  t.dong();
  return {
    hieu_chuan_p95: Math.round(hc * 10) / 10,
    hop_le: hc <= 17.5,
    p95: Math.round(p95(khung) * 10) / 10,
    ty_le_cham: Math.round((khung.filter((x) => x > 50).length / khung.length) * 10000) / 10000,
    so_khung: khung.length,
    dong_cuoi_thay: cuoi,
  };
}

const ket = { ngay: new Date().toISOString(), nguong: NGUONG, so_hang: SO_HANG, kho: `${RONG}x${CAO}`, cpu: 4, luot: [], doi_chung: null };
try {
  for (let i = 0; ket.luot.filter((l) => l.hop_le).length < SO_LUOT && i < SO_LUOT + 3; i++) {
    const l = await luot(false);
    ket.luot.push(l);
    console.log(`lượt ${i + 1}: hiệu chuẩn ${l.hieu_chuan_p95} ms${l.hop_le ? "" : " (loại — máy bận)"} · p95 ${l.p95} ms · khung > 50 ms ${(l.ty_le_cham * 100).toFixed(2)}% · dòng cuối thấy ${l.dong_cuoi_thay}`);
  }
  ket.doi_chung = await luot(true);
  console.log(`đối chứng bận 60 ms: p95 ${ket.doi_chung.p95} ms · khung > 50 ms ${(ket.doi_chung.ty_le_cham * 100).toFixed(1)}%`);
} finally {
  chrome.dong();
}

const hopLe = ket.luot.filter((l) => l.hop_le);
const tv = hopLe.length ? { p95: trungVi(hopLe.map((l) => l.p95)), ty_le_cham: trungVi(hopLe.map((l) => l.ty_le_cham)), dong_cuoi_thay: Math.min(...hopLe.map((l) => l.dong_cuoi_thay)) } : null;
ket.trung_vi = tv;
const loi = [];
if (hopLe.length < SO_LUOT) loi.push(`chỉ ${hopLe.length}/${SO_LUOT} lượt hiệu chuẩn hợp lệ`);
if (tv && tv.p95 > NGUONG.p95) loi.push(`p95 ${tv.p95} ms > ${NGUONG.p95} ms`);
if (tv && tv.ty_le_cham > NGUONG.cham) loi.push(`khung > 50 ms ${tv.ty_le_cham} > ${NGUONG.cham}`);
if (tv && tv.dong_cuoi_thay < SO_HANG) loi.push(`cuộn không tới căn cuối: dòng cuối thấy ${tv.dong_cuoi_thay}/${SO_HANG}`);
if (ket.doi_chung.p95 <= NGUONG.p95) loi.push(`máy đo không phân biệt được: đối chứng bận vẫn p95 ${ket.doi_chung.p95} ms`);
ket.ket_luan = loi.length ? `trượt: ${loi.join("; ")}` : "đạt";
writeFileSync(path.join(GOC, "_acceptance/bang-hang-kieu-sheet/thu/so-do-cuon.json"), JSON.stringify(ket, null, 2) + "\n");
console.log(`trung vị: ${JSON.stringify(tv)} → ${ket.ket_luan}`);
process.exit(loi.length ? 1 : 0);
