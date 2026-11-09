// Bài nhìn màn E4 trên chỗ thử dãy Q: lệnh ghi sự kiện bị chặn ở tầng mạng của trình duyệt (như mạng yếu: lời đọc khác vẫn thông), sàn đổi
// môi giới 2% trong lúc giá chờ gửi, sửa giá ở ô Bảng hàng, bỏ chặn, đọc dòng định nghĩa ở cột hồ sơ. Mỗi mốc in một dòng JSON, chụp ảnh vào --ra.
//   node _acceptance/va-dinh-nghia-doc-lai/thu/chay-ui.mjs --ra <thư mục>
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const URL_GOC = "http://localhost:3497";
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : ".acceptance-runs/va-dinh-nghia-doc-lai/evidence");
mkdirSync(RA, { recursive: true });
const d = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "dung.mjs")], { cwd: GOC, stdio: ["ignore", 2, 2] });
if (d.status !== 0) throw new Error(`dựng chỗ thử hỏng (dung.mjs thoát ${d.status})`);
const phien = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/thue-phi/phien.json"), "utf8"));
const { id: canId, ma } = phien.can.baoPhi;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const in1 = (o) => console.log(JSON.stringify(o));
const db = new pg.Client({ connectionString: "postgres://postgres:quyhang@localhost:5577/postgres" });
await db.connect();
const goi = async (ai, method, duong, body) => {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { "content-type": "application/json", origin: URL_GOC, cookie: phien.cookie[ai] }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const t = await r.json().catch(() => null);
  if (r.status >= 300) throw new Error(`${method} ${duong} → ${r.status} ${JSON.stringify(t)}`);
  return t;
};

const G1 = 3_100_000_000;
await db.query("delete from company_settings where company_id = $1 and key like 'fee.%'", [phien.san]);
const v = (await db.query("select version from listings where id = $1", [canId])).rows[0].version;
await goi("dau-chu-1", "POST", `/api/v1/listings/${canId}/events`, { type: "price_changed", payload: { listPrice: G1, feeInclusion: "included" }, expectedVersion: v });

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const dir = mkdtempSync(path.join(tmpdir(), "qh-q-dn-chrome-"));
const p = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${dir}`, "--no-first-run", "--hide-scrollbars", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const wsTrinh = await new Promise((res, rej) => {
  let buf = "";
  p.stderr.on("data", (x) => {
    buf += x;
    const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf);
    if (m) res(m[1]);
  });
  p.on("exit", () => rej(new Error("Chrome thoát trước khi mở cổng gỡ lỗi")));
});
const base = wsTrinh.replace(/^ws:\/\/([^/]+).*/, "http://$1");
const tab = await (await fetch(`${base}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const cho = new Map();
const nghe = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(String(e.data));
  if (m.id && cho.has(m.id)) {
    const { res, rej } = cho.get(m.id);
    cho.delete(m.id);
    if (m.error) rej(new Error(m.error.message));
    else res(m.result);
  } else if (m.method) for (const f of nghe) f(m.method, m.params);
});
const gui = (method, params = {}) =>
  new Promise((res, rej) => {
    const i = ++id;
    cho.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const tinh = async (expr) => {
  const r = await gui("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`lỗi trong trang: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
  return r.result.value;
};
const choDen = async (expr, han = 30000) => {
  const dau = Date.now();
  while (Date.now() - dau < han) {
    if (await tinh(expr).catch(() => false)) return;
    await ngu(150);
  }
  throw new Error(`hết giờ chờ: ${expr}`);
};
const chup = async (ten) => writeFileSync(path.join(RA, `${ten}.png`), Buffer.from((await gui("Page.captureScreenshot", { format: "png" })).data, "base64"));

let chan = false;
let soDocDau = 0;
let soTaiTrang = 0;
let soLenhBiChan = 0;
nghe.push((m, x) => {
  if (m === "Network.requestWillBeSent" && x.request.url.includes("/fee-basis")) soDocDau++;
  if (m === "Page.frameNavigated" && !x.frame.parentId && x.frame.url.startsWith(URL_GOC)) soTaiTrang++;
  if (m === "Fetch.requestPaused") {
    if (chan && x.request.method === "POST") {
      soLenhBiChan++;
      gui("Fetch.failRequest", { requestId: x.requestId, errorReason: "InternetDisconnected" }).catch(() => {});
    } else gui("Fetch.continueRequest", { requestId: x.requestId }).catch(() => {});
  }
});
await gui("Page.enable");
await gui("Runtime.enable");
await gui("Network.enable");
await gui("Fetch.enable", { patterns: [{ urlPattern: "*/api/v1/listings/*/events*" }] });
await gui("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await gui("Page.addScriptToEvaluateOnNewDocument", { source: `try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}` });
for (const c of phien.cookie["dau-chu-1"].split(";").map((s) => s.trim()).filter(Boolean)) {
  const [name, ...g] = c.split("=");
  await gui("Network.setCookie", { name, value: g.join("="), url: URL_GOC });
}

const DONG = `document.querySelector("[data-dinh-nghia]")?.textContent.trim() ?? null`;
const GIA = `document.querySelector("[data-muc=muc-du] .text-2xl")?.textContent.trim() ?? null`;
const moc = async (ca, them = {}) => in1({ ca, dong: await tinh(DONG), gia: await tinh(GIA), ...them });
const CO_MANG = `window.dispatchEvent(new Event("online")); true`;

let loi = 0;
try {
  await gui("Page.navigate", { url: `${URL_GOC}/inventory?unit=${encodeURIComponent(ma)}&toa=${encodeURIComponent(phien.toa)}` });
  await choDen(`!!document.querySelector("[data-dinh-nghia]")`, 180000);
  await ngu(1500);
  await moc("truoc");
  await chup("E4-truoc");

  await goi("quan-tri", "PATCH", "/api/v1/company/settings", { "fee.brokerage_pct": 2 });
  chan = true;
  soDocDau = 0;
  soTaiTrang = 0;
  // Ô Giá của căn trên Bảng hàng: nhấp đúp mở trình sửa tại ô.
  const o = await tinh(`(async () => { const c = [...document.querySelectorAll('td[data-col-id="listPrice"]')].find((e) => e.textContent.includes("3,1 tỷ")); if (!c) return { thieu: [...document.querySelectorAll("th, td[data-col-id]")].map((e) => e.getAttribute("data-col-id") ?? e.textContent.trim()).slice(0, 30) }; let cuon = c.parentElement; while (cuon && cuon.scrollWidth <= cuon.clientWidth) cuon = cuon.parentElement; const ghim = c.closest("tr").querySelector('td[data-col-id="unitNumber"]').getBoundingClientRect().right; cuon.scrollLeft += c.getBoundingClientRect().left - ghim - 4; await new Promise((r) => setTimeout(r, 300)); const b = c.getBoundingClientRect(); const x = b.right - 12, y = b.y + b.height / 2; if (!c.contains(document.elementFromPoint(x, y))) return { thieu: ["ô Giá bị che", document.elementFromPoint(x, y)?.textContent] }; return { x, y }; })()`);
  if (o.thieu) throw new Error(`không thấy ô Giá của căn trên Bảng hàng: ${JSON.stringify(o.thieu)}`);
  await ngu(300);
  await gui("Input.dispatchMouseEvent", { type: "mouseMoved", x: o.x, y: o.y });
  for (const type of ["mousePressed", "mouseReleased"]) await gui("Input.dispatchMouseEvent", { type, x: o.x, y: o.y, button: "left", buttons: type === "mousePressed" ? 1 : 0, clickCount: 1 });
  await ngu(200);
  for (const type of ["keyDown", "keyUp"]) await gui("Input.dispatchKeyEvent", { type, key: "F2", code: "F2", windowsVirtualKeyCode: 113 });
  await choDen(`!!document.querySelector('input[aria-label="Giá"]')`, 10000);
  await tinh(`document.querySelector('input[aria-label="Giá"]').select(); true`);
  await gui("Input.insertText", { text: "3,2 tỷ" });
  await ngu(200);
  for (const type of ["keyDown", "keyUp"]) await gui("Input.dispatchKeyEvent", { type, key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: type === "keyDown" ? "\r" : undefined });
  await choDen(`(${GIA} ?? "").includes("3,2 tỷ")`, 10000);
  await tinh(CO_MANG); // một lượt gửi nữa trong lúc mạng yếu
  await ngu(3000);
  await moc("cho-gui", { soDocDau, soLenhBiChan });
  await chup("E4-cho-gui");

  chan = false;
  const luc = Date.now();
  await tinh(CO_MANG);
  await choDen(`(${DONG} ?? "").includes("Môi giới 2%")`, 20000);
  const giay = (Date.now() - luc) / 1000;
  await ngu(2000);
  await moc("da-len", { soDocDau, giayTuLucBoChan: giay, soTaiTrang: soTaiTrang + 1, mongDoi: "về tay 3,056 tỷ" });
  await chup("E4-da-len");
} catch (e) {
  loi = 1;
  console.error(e);
  await chup("E4-loi").catch(() => {});
  console.error(await tinh(`document.body.innerText.slice(0, 800)`).catch(() => ""));
} finally {
  await db.end();
  p.kill();
}
process.exit(loi);
