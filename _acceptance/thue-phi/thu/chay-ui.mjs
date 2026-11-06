// Phép nhìn màn hàng 49 «Thuế phí» trên chỗ thử dãy Q (chuyển thể từ _acceptance/luat-chia-lead/thu/chay-ui.mjs của hàng
// 48). Mỗi ca in một dòng JSON đúng khoá steps của eval đòi và chụp ảnh vào --ra. Chrome không đầu qua CDP; thân PATCH lưu
// cấu hình bắt bằng sự kiện Network.requestWillBeSent của CDP (không bọc fetch). Trạng thái của sàn mẫu đặt qua lối thật
// (PATCH bằng phiên quản trị) hay xoá thẳng dòng fee.* bằng kết nối chủ để về mặc định.
//   node _acceptance/thue-phi/thu/chay-ui.mjs --e1 --e2 --e3 --e7 --e8 --ra <thư mục>
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const URL_GOC = "http://localhost:3497";
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/thue-phi");
const arg = (k) => process.argv.includes(k);
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : ".acceptance-runs/thue-phi/evidence");
mkdirSync(RA, { recursive: true });
// Mỗi lần chạy tự dựng (hay dùng lại) chỗ thử: dung-q dùng lại máy dev đang sống của cây này, nạp lại sàn mẫu, căn và lead
// mẫu. Dòng JSON của nó đi ra stderr để stdout chỉ còn dòng của các ca.
const dung = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "dung-q.mjs")], { cwd: GOC, stdio: ["ignore", 2, 2] });
if (dung.status !== 0) throw new Error(`dựng chỗ thử hỏng (dung-q.mjs thoát ${dung.status})`);
const phien = JSON.parse(readFileSync(path.join(CHAY, "phien.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const h = { "content-type": "application/json", origin: URL_GOC };
const in1 = (o) => console.log(JSON.stringify(o));
const db = new pg.Client({ connectionString: "postgres://postgres:quyhang@localhost:5577/postgres" });
await db.connect();
const SAN = phien.san;

// ——— Chrome không đầu qua CDP (khuôn _acceptance/bang-hang-kieu-sheet/thu/cdp.mjs, thêm nghe sự kiện) ———
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
async function moChrome() {
  const dir = mkdtempSync(path.join(tmpdir(), "qh-q49-chrome-"));
  const p = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${dir}`, "--no-first-run", "--hide-scrollbars", "about:blank"], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  const ws = await new Promise((res, rej) => {
    let buf = "";
    p.stderr.on("data", (d) => {
      buf += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf);
      if (m) res(m[1]);
    });
    p.on("exit", () => rej(new Error("Chrome thoát trước khi mở cổng gỡ lỗi")));
  });
  const base = ws.replace(/^ws:\/\/([^/]+).*/, "http://$1");
  return {
    pid: p.pid,
    async trang(rong, cao) {
      const t = await (await fetch(`${base}/json/new?about:blank`, { method: "PUT" })).json();
      return moTrang(t.webSocketDebuggerUrl, rong, cao);
    },
    dong() {
      p.kill();
    },
  };
}
async function moTrang(wsUrl, rong, cao) {
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const cho = new Map();
  const nghe = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id && cho.has(m.id)) {
      const { res, rej } = cho.get(m.id);
      cho.delete(m.id);
      if (m.error) rej(new Error(`${m.error.message}`));
      else res(m.result);
    } else if (m.method) for (const f of nghe) f(m.method, m.params);
  });
  const gui = (method, params = {}) =>
    new Promise((res, rej) => {
      const i = ++id;
      cho.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  // Thân PATCH tới lối cấu hình, bắt ở tầng mạng của trình duyệt.
  const patch = [];
  nghe.push((method, p) => {
    if (method === "Network.requestWillBeSent" && p.request.method === "PATCH" && p.request.url.includes("/api/v1/company/settings")) patch.push(p.request.postData ?? null);
  });
  await gui("Page.enable");
  await gui("Runtime.enable");
  await gui("Network.enable");
  await gui("Emulation.setDeviceMetricsOverride", { width: rong, height: cao, deviceScaleFactor: 1, mobile: rong < 768 });
  const tinh = async (expr) => {
    const r = await gui("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`lỗi trong trang: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    return r.result.value;
  };
  return {
    gui,
    tinh,
    patch,
    async cho(expr, hanMs = 30000) {
      const dau = Date.now();
      while (Date.now() - dau < hanMs) {
        try {
          if (await tinh(expr)) return;
        } catch {
          // trang đang chuyển
        }
        await ngu(200);
      }
      throw new Error(`hết giờ chờ: ${expr}`);
    },
    async chup() {
      return Buffer.from((await gui("Page.captureScreenshot", { format: "png" })).data, "base64");
    },
    dong() {
      gui("Page.close").catch(() => {});
      setTimeout(() => ws.close(), 300);
    },
  };
}

// Hàng 48 S4 vòng 1: tab mồ côi của Chrome không đầu giữ kênh HMR và kéo lượt sau vào vòng «Compiled → tải lại». Đóng hẳn
// từng tab, cuối lượt chắc chắn Chrome đã tắt — chỉ kill PID mình đã mở.
const chrome = await moChrome();
const PID_CHROME = [chrome.pid];
const conSong = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
for (const tin of ["SIGTERM", "SIGINT", "SIGHUP"])
  process.on(tin, () => {
    for (const pid of PID_CHROME.filter(conSong)) process.kill(pid, "SIGKILL");
    process.exit(128 + ({ SIGHUP: 1, SIGINT: 2, SIGTERM: 15 })[tin]);
  });
async function tatChrome() {
  chrome.dong();
  for (let i = 0; i < 20 && PID_CHROME.some(conSong); i++) await ngu(150);
  for (const pid of PID_CHROME.filter(conSong)) process.kill(pid, "SIGKILL");
}
const KHONG_SW = `try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}`;
async function mo(ai, { w = 1440, hgt = 900, duong = "/settings/fees", cho = "[data-khoan]" } = {}) {
  const t = await chrome.trang(w, hgt);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: KHONG_SW });
  for (const c of phien.cookie[ai].split(";").map((s) => s.trim()).filter(Boolean)) {
    const [name, ...v] = c.split("=");
    await t.gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
  }
  await t.gui("Page.navigate", { url: `${URL_GOC}${duong}` });
  await t.cho(`document.readyState === "complete" && !!document.querySelector("[data-slot=sidebar-inset]")`, 180000);
  if (cho) await t.cho(`!!document.querySelector(${JSON.stringify(cho)})`, 180000);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(800);
  return t;
}
const chup = async (t, ten) => writeFileSync(path.join(RA, `${ten}.png`), await t.chup());
async function bamXY(t, x, y) {
  await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await t.gui("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
  await t.gui("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });
}
async function bam(t, sel) {
  const r = await t.tinh(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({ block: "center" }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
  if (!r) throw new Error(`không thấy ${sel}`);
  await bamXY(t, r.x, r.y);
  await ngu(400);
}
const nutChu = (chu) => `[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === ${JSON.stringify(chu)})`;
async function bamNut(t, chu) {
  const r = await t.tinh(`(() => { const e = ${nutChu(chu)}; if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
  if (!r) throw new Error(`không thấy nút ${chu}`);
  await bamXY(t, r.x, r.y);
  await ngu(500);
}
/** Gõ vào một ô: chọn hết rồi gõ chữ, rời ô bằng Tab. */
async function goO(t, sel, chu, { roi = true } = {}) {
  await bam(t, sel);
  await t.tinh(`(() => { const o = document.querySelector(${JSON.stringify(sel)}); o.focus(); o.select(); return true; })()`);
  await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
  await t.gui("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
  if (chu) await t.gui("Input.insertText", { text: chu });
  if (roi) {
    await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await t.gui("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  }
  await ngu(500);
}
const O_MOI_GIOI = "[data-khoan=moi_gioi] [data-slot=number-field-input]";
// Công tắc base-ui: id nằm ở ô ẩn, bấm vào chính nút gạt.
const CONG_TAC = (ma) => `[data-khoan=${ma}] [data-slot=switch]`;
/** Ảnh chụp ba dòng khoản: tên, công tắc, tỉ lệ, chữ «theo luật», nguồn, lỗi. */
const DONG = `JSON.stringify([...document.querySelectorAll("[data-khoan]")].map((e) => { const f = e.closest("[data-slot=field]");
  const sw = e.querySelector("[data-slot=switch]"); const o = e.querySelector("[data-slot=number-field-input]"); const tl = e.querySelector("[data-ti-le]");
  return { ma: e.dataset.khoan, ten: f?.querySelector("[data-slot=field-label], [data-slot=field-title]")?.textContent.trim() ?? null,
    moTa: f?.querySelector("[data-slot=field-description]")?.textContent.trim() ?? null,
    congTac: sw ? (sw.getAttribute("aria-checked") === "true" || sw.hasAttribute("data-checked")) : null,
    oTiLe: o ? o.value : null, chuTiLe: tl ? tl.textContent.trim() : null,
    theoLuat: (f?.textContent ?? "").includes("theo luật"),
    nguon: e.querySelector("[id^=nguon-]")?.textContent.trim() ?? null,
    loi: e.querySelector("[data-slot=field-error], [role=alert]")?.textContent.trim() ?? null }; }))`;
const dong = async (t) => JSON.parse(await t.tinh(DONG));
const tiLeCua = (d) => (d.oTiLe !== null ? `${d.oTiLe.replace(".", ",")}%` : (d.chuTiLe?.split(" · ")[0] ?? null));
const coChu = (t, chu) => t.tinh(`document.body.innerText.includes(${JSON.stringify(chu)})`);
const toast = (t) => t.tinh(`[...document.querySelectorAll("[data-sonner-toast]")].map((e) => e.querySelector("[data-title]")?.textContent.trim() ?? e.textContent.trim()).at(-1) ?? null`);
const nutTat = (t, chu) => t.tinh(`!!(${nutChu(chu)})?.disabled`);

async function goi(ai, method, duong, body) {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { ...h, cookie: phien.cookie[ai] }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: r.status, than: await r.json().catch(() => null) };
}
/** Đưa sàn mẫu về định nghĩa mặc định: xoá dòng fee.* của sàn (nhật ký chỉ thêm, không xoá). */
async function veMacDinh() {
  await db.query("delete from company_settings where company_id = $1 and key like 'fee.%'", [SAN]);
}
const soSuKien = async () => (await db.query("select count(*)::int n from company_settings_events where company_id = $1", [SAN])).rows[0].n;
const tenQt = phien.ten["quan-tri"];
const ddmm = (d) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}`;
};
const ddmmyyyy = (d) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}/${p.year}`;
};

try {
  if (arg("--e1")) {
    await veMacDinh();
    let t = await mo("quan-tri");
    const truoc = await dong(t);
    await chup(t, "E1-truoc");
    t.dong();
    const r = await goi("quan-tri", "PATCH", "/api/v1/company/settings", { "fee.brokerage_pct": 1.5 });
    t = await mo("quan-tri");
    const sau = await dong(t);
    await chup(t, "E1-1440");
    in1({
      ca: "e1",
      patch: r.status,
      kho: "1440x900",
      tenDong: sau.map((d) => d.ten),
      congTac: sau.map((d) => d.congTac),
      tiLe: sau.map(tiLeCua),
      nguon: sau.map((d) => d.nguon),
      nguonMongDoi: `Đã đổi · ${tenQt} · ${ddmm(new Date())}`,
      theoLuat: sau.map((d) => (d.ma === "moi_gioi" ? null : d.theoLuat)),
      chuHaiDongLuat: sau.filter((d) => d.ma !== "moi_gioi").map((d) => d.chuTiLe),
      soOSuaTiLe: await t.tinh(`document.querySelectorAll("[data-khoan] [data-slot=number-field-input]").length`),
      truoc: { moiGioi: tiLeCua(truoc.find((d) => d.ma === "moi_gioi")), nguon: truoc.find((d) => d.ma === "moi_gioi")?.nguon },
    });
    t.dong();
  }

  if (arg("--e2")) {
    await veMacDinh();
    const t0 = await soSuKien();
    let t = await mo("quan-tri");
    await goO(t, O_MOI_GIOI, "2");
    await bam(t, CONG_TAC("le_phi_truoc_ba"));
    const dangSua = await dong(t);
    await bamNut(t, "Lưu");
    await t.cho(`!!document.querySelector("[data-sonner-toast]")`, 20000);
    await ngu(300);
    const tb = await toast(t);
    await chup(t, "E2-sau-luu");
    const patch = [...t.patch];
    t.dong();
    await ngu(500);
    t = await mo("quan-tri");
    const sauTai = await dong(t);
    t.dong();
    const api = (await goi("quan-tri", "GET", "/api/v1/company/settings")).than;
    const t1 = await soSuKien();
    in1({
      ca: "e2",
      dangSua: { moiGioi: dangSua.find((d) => d.ma === "moi_gioi")?.oTiLe, lePhi: dangSua.find((d) => d.ma === "le_phi_truoc_ba")?.congTac },
      thanPatch: patch.map((b) => (b ? JSON.parse(b) : b)),
      soPatch: patch.length,
      toast: tb,
      sauTai: { moiGioi: sauTai.find((d) => d.ma === "moi_gioi")?.oTiLe, congTac: Object.fromEntries(sauTai.map((d) => [d.ma, d.congTac])) },
      api: Object.fromEntries(api.items.filter((x) => x.key.startsWith("fee.")).map((x) => [x.key, x.value])),
      soSuKienTruoc: t0,
      soSuKienSau: t1,
      soSuKienThem: t1 - t0,
    });

    // Ca sai: gõ 6 vào Môi giới; rồi tắt cả ba công tắc.
    await veMacDinh();
    t = await mo("quan-tri");
    // Gõ 6, chưa rời ô: đọc câu lỗi và nút Lưu; rồi rời ô (Tab) đọc lại; rồi bấm Lưu.
    await goO(t, O_MOI_GIOI, "6", { roi: false });
    const dangGo6 = { o: (await dong(t)).find((d) => d.ma === "moi_gioi")?.oTiLe, loi: await t.tinh(`document.querySelector("#loi-moi-gioi")?.textContent.trim() ?? null`), luuKhoa: await nutTat(t, "Lưu") };
    await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await t.gui("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await ngu(500);
    const sai6 = (await dong(t)).find((d) => d.ma === "moi_gioi");
    const luuKhoa6 = await nutTat(t, "Lưu");
    await bamNut(t, "Lưu").catch(() => {});
    await ngu(800);
    const loi6 = await t.tinh(`document.querySelector("#loi-moi-gioi")?.textContent.trim() ?? null`);
    await chup(t, "E2-sai");
    const patch6 = t.patch.length;
    const thanPatch6 = t.patch.map((b) => (b ? JSON.parse(b) : b));
    t.dong();
    t = await mo("quan-tri");
    for (const ma of ["thue_tncn", "le_phi_truoc_ba", "moi_gioi"]) await bam(t, CONG_TAC(ma));
    const tatHet = await dong(t);
    const luuKhoaTat = await nutTat(t, "Lưu");
    await bamNut(t, "Lưu").catch(() => {});
    await ngu(800);
    const loiTat = await t.tinh(`document.querySelector("#loi-cong-tac")?.textContent.trim() ?? null`);
    const loiTatOdau = await t.tinh(`document.querySelector("#loi-cong-tac")?.closest("[data-khoan]")?.dataset.khoan ?? null`);
    await chup(t, "E2-sai-cong-tac");
    const patchTat = t.patch.length;
    t.dong();
    in1({
      ca: "e2-sai",
      go6: { dangGo: dangGo6, oSauKhiRoi: sai6?.oTiLe, loiDuoiMoiGioi: loi6, luuKhoa: luuKhoa6, soPatch: patch6, thanPatch: thanPatch6 },
      tatCaBa: { congTac: tatHet.map((d) => d.congTac), loiDuoiCongTac: loiTat, loiODong: loiTatOdau, luuKhoa: luuKhoaTat, soPatch: patchTat },
      soPatchCuaCa: patch6 + patchTat,
      soSuKienThemCuaCa: (await soSuKien()) - t1,
    });
  }

  if (arg("--e3")) {
    const ket = {};
    for (const ai of ["truong-nhom", "dau-chu-1"]) {
      const t = await mo(ai, { duong: "/settings/fees", cho: null });
      await t.cho(`location.pathname === "/settings/personal"`, 60000).catch(() => {});
      await ngu(1500);
      if (ai === "truong-nhom") await chup(t, "E3-truong-nhom");
      ket[ai] = { url: await t.tinh("location.pathname + location.search"), bao: await coChu(t, "Mục này chỉ quản trị sàn mở được") };
      t.dong();
    }
    const t = await mo("quan-tri");
    ket["quan-tri"] = { url: await t.tinh("location.pathname + location.search"), soDongKhoan: await t.tinh(`document.querySelectorAll("[data-khoan]").length`) };
    t.dong();
    in1({ ca: "e3", ...ket });
  }

  if (arg("--e7")) {
    // Căn bao phí 3 tỷ đã ghi khi sàn ở mặc định (dung-q); giờ quản trị đặt môi giới 2 — dòng phụ phải vẫn theo dấu cũ.
    await veMacDinh();
    const r = await goi("quan-tri", "PATCH", "/api/v1/company/settings", { "fee.brokerage_pct": 2 });
    const { baoPhi, khongBaoPhi } = phien.can;
    const dau = (await db.query("select included_items, rates, computed_at from listing_price_fee_basis where listing_id = $1 order by seq desc", [baoPhi.id])).rows;
    const soDauKbp = (await db.query("select count(*)::int n from listing_price_fee_basis where listing_id = $1", [khongBaoPhi.id])).rows[0].n;
    const duongCan = (ma) => `/units/${encodeURIComponent(ma)}?toa=${encodeURIComponent(phien.toa)}`;
    let t = await mo("dau-chu-1", { duong: duongCan(baoPhi.ma), cho: "[data-muc=muc-du]" });
    await t.cho(`!!document.querySelector("[data-dinh-nghia]")`, 20000).catch(() => {});
    await ngu(500);
    const chuBp = await t.tinh(`document.querySelector("[data-dinh-nghia]")?.textContent.trim() ?? null`);
    const giaBp = await t.tinh(`document.querySelector("[data-muc=muc-du] .text-2xl")?.textContent.trim() ?? null`);
    await chup(t, "E7-ho-so");
    t.dong();
    t = await mo("dau-chu-1", { duong: duongCan(khongBaoPhi.ma), cho: "[data-muc=muc-du]" });
    await ngu(4000);
    const chuKbp = await t.tinh(`document.querySelector("[data-dinh-nghia]")?.textContent.trim() ?? null`);
    const giaKbp = await t.tinh(`document.querySelector("[data-muc=muc-du] .text-2xl")?.textContent.trim() ?? null`);
    await chup(t, "E7-khong-bao-phi");
    t.dong();
    const ngayGhi = dau[0] ? ddmmyyyy(new Date(dau[0].computed_at)) : null;
    in1({
      ca: "e7",
      patch: r.status,
      canBaoPhi: { ma: baoPhi.ma, gia: giaBp, dongPhu: chuBp },
      mongDoi: ngayGhi && `Tính theo định nghĩa ngày ${ngayGhi}: Thuế TNCN 2% · Trước bạ 0,5% · Môi giới 1% — về tay 2,895 tỷ`,
      khop: chuBp === (ngayGhi && `Tính theo định nghĩa ngày ${ngayGhi}: Thuế TNCN 2% · Trước bạ 0,5% · Môi giới 1% — về tay 2,895 tỷ`),
      dauDb: dau.map((d) => ({ items: d.included_items, rates: d.rates, ngay: ddmmyyyy(new Date(d.computed_at)) })),
      canKhongBaoPhi: { ma: khongBaoPhi.ma, gia: giaKbp, dongPhu: chuKbp, soDauDb: soDauKbp },
    });
  }

  if (arg("--e8")) {
    const MAY = `[aria-label="Tính giá"]`;
    const docMay = `JSON.stringify((() => { const m = document.querySelector(${JSON.stringify(MAY)}); const o = [...m.querySelectorAll("input[data-o=may-tinh]")];
      return { khoan: [...m.querySelectorAll("ul li")].map((li) => li.querySelector("span")?.textContent.replace(/\\s+/g, " ").trim()),
        oGia: o[0]?.value, oMoiGioi: o[1]?.value, oVeTay: o[2]?.value,
        veTayDong: o[2]?.closest("label")?.querySelector(".text-muted-foreground")?.textContent.trim() ?? null }; })())`;
    const moMay = async () => {
      const t = await mo("dau-chu-1", { duong: `/units/call?lead=${phien.lead}`, cho: MAY });
      await goO(t, `${MAY} input[data-o=may-tinh]`, "3 tỷ", { roi: false });
      await ngu(500);
      return t;
    };
    await veMacDinh();
    const r = await goi("quan-tri", "PATCH", "/api/v1/company/settings", { "fee.inclusion": ["personalIncomeTax", "brokerageFee"], "fee.brokerage_pct": 2 });
    let t = await moMay();
    const a = JSON.parse(await t.tinh(docMay));
    await chup(t, "E8-may-tinh");
    t.dong();
    in1({ ca: "e8", patch: r.status, ...a });
    await veMacDinh();
    t = await moMay();
    const b = JSON.parse(await t.tinh(docMay));
    await chup(t, "E8-mac-dinh");
    t.dong();
    in1({ ca: "e8-mac-dinh", ...b });
  }
} finally {
  await tatChrome();
  await db.end();
}
