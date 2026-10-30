#!/usr/bin/env node
// Máy đo của bài thử lưới: Chrome có sẵn, khổ 1366×768, CPU giảm tốc 4× (DevTools Emulation.setCPUThrottlingRate).
// playwright-core nằm trên nhánh thử, không ở main: đường node_modules truyền bằng --nm.
//
//   node do.mjs --url http://localhost:3462 --nm <gốc nhánh thử> --moc-bench <ms> [--cham 1|phim] [--luot 3]
// In JSON: { che, luot: [{ may, cuon, go, dan }…], trung_vi: { cuon, go, dan }, danh_gia }.
// Các hàm truyền cho page.evaluate chạy trong trình duyệt, nên dùng biến toàn cục của trình duyệt:
/* global window, document, requestAnimationFrame */
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { danhGia, hieuChuanHopLe, phanVi, thuocCuon, trungVi } from "./nguong.mjs";

const a = process.argv.slice(2);
const opt = (k, d) => (a.includes(k) ? a[a.lastIndexOf(k) + 1] : d);
const URL_GOC = opt("--url", "http://localhost:3462");
const NM = resolve(opt("--nm", process.cwd()));
const CHE = opt("--cham", "");
const SO_LUOT = Number(opt("--luot", "3"));
const MOC_BENCH = Number(opt("--moc-bench", "0"));
const THU_LAI = 3;

const { chromium } = createRequire(join(NM, "package.json"))("playwright-core");

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const BENCH = () => {
  const t = performance.now();
  let s = 0;
  for (let i = 0; i < 3e6; i++) s += Math.sqrt(i) % 7;
  return { ms: performance.now() - t, s };
};

async function hieuChuan(page) {
  await page.setContent("<!doctype html><body></body>");
  const rongP95 = await page.evaluate(
    () =>
      new Promise((xong) => {
        const t = [];
        const v = (x) => {
          t.push(x);
          if (t.length < 90) requestAnimationFrame(v);
          else {
            const kc = t.slice(1).map((x2, i) => x2 - t[i]).sort((p, q) => p - q);
            xong(kc[Math.ceil(0.95 * kc.length) - 1]);
          }
        };
        requestAnimationFrame(v);
      }),
  );
  const benchMs = (await page.evaluate(`(${BENCH.toString()})()`)).ms;
  return { rongP95, benchMs, ...hieuChuanHopLe({ rongP95, benchMs, mocBenchMs: MOC_BENCH || benchMs }) };
}

async function moTrang(page) {
  const q = CHE ? `?cham=${CHE}` : "";
  await page.goto(`${URL_GOC}/spikes/luoi${q}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__luoi?.dong === 5000 && window.__do);
}

const khungCuon = (page) =>
  page.evaluate(() => {
    const els = [...document.querySelectorAll("div")].filter((e) => e.scrollHeight > e.clientHeight + 1000);
    const el = els.sort((p, q) => q.scrollHeight - p.scrollHeight)[0];
    el.setAttribute("data-do-cuon", "");
    el.scrollTop = 0;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, cao: el.scrollHeight };
  });

async function doCuon(page) {
  const k = await khungCuon(page);
  await page.mouse.move(k.x, k.y);
  await page.evaluate(() => {
    window.__do.khung = [];
    window.__do.khungCb = [];
    window.__do.ghiKhung = true;
  });
  const BUOC = 240;
  for (let i = 0; i < BUOC; i++) {
    await page.mouse.wheel(0, Math.ceil(k.cao / BUOC));
    await ngu(33);
  }
  const { khung, khungCb } = await page.evaluate(() => {
    window.__do.ghiKhung = false;
    return { khung: window.__do.khung, khungCb: window.__do.khungCb };
  });
  const cuoi = await page.evaluate(() => {
    const el = document.querySelector("[data-do-cuon]");
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
  });
  // Số phụ (không vào ngưỡng): nhịp lúc callback khung chạy, gồm cả việc xử lý đầu vào trong khung.
  return { ...thuocCuon(khung), phu_callback: thuocCuon(khungCb), toi_cuoi: cuoi };
}

const veDau = (page) =>
  page.evaluate(async () => {
    document.querySelector("[data-do-cuon]").scrollTop = 0;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

/** Ô (dòng r, cột c) đang hiện trong DOM của phần thân bảng. */
const o = (page, r, c) => page.locator("tbody tr").nth(r).locator("td").nth(c);

async function doGo(page) {
  await veDau(page);
  await o(page, 2, 17).click();
  await page.evaluate(() => (window.__do.go = []));
  const CHU = "thulethuanhatbaimuoikytucuoi30";
  await page.keyboard.type(CHU, { delay: 60 });
  await page.keyboard.press("Enter");
  await ngu(300);
  const go = await page.evaluate(() => window.__do.go);
  const giaTri = await page.evaluate(() => window.__luoi.o(2, 17));
  return { so_phim: go.length, p95: phanVi(go, 95), gia_tri_dung: giaTri === CHU };
}

async function doDan(page) {
  await veDau(page);
  const tsv = Array.from({ length: 25 }, (_, r) => Array.from({ length: 20 }, (_, c) => `P${r}-${c}`).join("\t")).join("\n");
  await page.evaluate((t) => navigator.clipboard.writeText(t), tsv);
  await o(page, 4, 0).click();
  await page.evaluate(() => {
    window.__do.dan = null;
    window.__do.danT0 = null;
  });
  await page.keyboard.press(process.platform === "darwin" ? "Meta+V" : "Control+V");
  await page.waitForFunction(() => window.__do.dan !== null, null, { timeout: 15000 }).catch(() => {});
  const dan = await page.evaluate(() => window.__do.dan);
  // Ô mẫu: góc đầu và giữa trên DOM đang hiện; góc cuối (dòng 28, cột 19) đọc lại sau khi cuộn tới.
  const dauDom = (await o(page, 4, 0).innerText()).trim();
  const giua = await page.evaluate(() => window.__luoi.o(4 + 12, 10));
  await page.evaluate(async () => {
    document.querySelector("[data-do-cuon]").scrollTop = 28 * 32;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const cuoiDom = await page.evaluate(() =>
    [...document.querySelectorAll("tbody tr td")].some((td) => td.innerText.trim() === "P24-19"),
  );
  return { ms: dan?.ms ?? Number.NaN, o_mau_dung: dauDom === "P0-0" && giua === "P12-10" && cuoiDom };
}

async function motLuot(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: URL_GOC });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const may = await hieuChuan(page);
  await moTrang(page);
  const loi = [];
  page.on("pageerror", (e) => loi.push(String(e)));
  const cuon = await doCuon(page);
  const go = await doGo(page);
  const dan = await doDan(page);
  await ctx.close();
  return { may, cuon, go, dan, loi_trang: loi };
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
if (a.includes("--chi-trang")) {
  // AC-1: chỉ kiểm cỡ dữ liệu và nhãn mẫu — không phụ thuộc lưới có đạt ngưỡng hay không.
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  await moTrang(page);
  const trang = await page.evaluate(() => ({ dong: window.__luoi.dong, cot: window.__luoi.cot, mau: window.__luoi.mau }));
  await browser.close();
  console.log(JSON.stringify({ trang }));
  process.exit(0);
}
const luot = [];
for (let i = 0; i < SO_LUOT; i++) {
  let r;
  for (let thu = 0; thu < THU_LAI; thu++) {
    r = await motLuot(browser);
    if (r.may.hop_le) break;
  }
  luot.push(r);
}
await browser.close();

const tv = (f) => trungVi(luot.map(f));
const trung_vi = {
  cuon: { p95: tv((l) => l.cuon.p95), ti_le_cham: tv((l) => l.cuon.ti_le_cham) },
  go: { p95: tv((l) => l.go.p95), gia_tri_dung: luot.every((l) => l.go.gia_tri_dung) },
  dan: { ms: tv((l) => l.dan.ms), o_mau_dung: luot.every((l) => l.dan.o_mau_dung) },
};
console.log(
  JSON.stringify({
    che: CHE || "thuong",
    hieu_chuan_hop_le: luot.every((l) => l.may.hop_le),
    luot,
    trung_vi,
    danh_gia: danhGia(trung_vi),
  }),
);
