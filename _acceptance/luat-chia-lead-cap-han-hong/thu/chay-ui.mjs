// Phép nhìn E7 của hàng vá luat-chia-lead-cap-han-hong trên chỗ thử dãy D của hàng 48 (dung-d.mjs của luat-chia-lead:
// Postgres 5575 nạp sàn mẫu, máy dev 3495 chạy từ chính cây này, phiên quản trị sàn mẫu). Mỗi khung in một dòng JSON và
// chụp ảnh vào --ra. Dòng «có từ trước» chèn thẳng bằng kết nối chủ; sau mỗi khung dọn hai dòng hạn. Lời gọi PATCH của trang
// đi qua lớp bọc fetch đặt trước khi tải: sửa thân đi ra, ghi lại phản hồi thật (status + thân), hay thay phản hồi bằng một
// thân DỰNG TỪ GET THẬT của máy chủ. Khung 3 (va-e7-loi-that-cap-han): máy chủ tự sửa cặp hạn khi lưu một nửa (06/11), nên
// không lần lưu thật nào trả 200 còn lỗi ở khoá vừa lưu — khung 3 lấy nguyên `items` và `errors` của GET thật khi cặp đang
// hỏng làm thân phản hồi PATCH: không còn câu lỗi gõ tay, chữ lỗi của máy chủ đổi thì phép nhìn đỏ theo.
//   node _acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs --ra <thư mục>
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const URL_GOC = "http://localhost:3495";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : ".acceptance-runs/luat-chia-lead-cap-han-hong/evidence");
mkdirSync(RA, { recursive: true });
// Dựng (hay dùng lại) chỗ thử của hàng 48; dòng JSON của nó ra stderr để stdout chỉ còn dòng của các khung.
const dung = spawnSync(process.execPath, [path.join(GOC, "_acceptance/luat-chia-lead/thu/dung-d.mjs")], { cwd: GOC, stdio: ["ignore", 2, 2] });
if (dung.status !== 0) throw new Error(`dựng chỗ thử hỏng (dung-d.mjs thoát ${dung.status})`);
const phien = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/luat-chia-lead/phien.json"), "utf8"));
const SAN = phien.san;
const NHAN = "lead_routing.accept_minutes";
const GOI = "lead_routing.first_call_minutes";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const in1 = (o) => console.log(JSON.stringify(o));
const db = new pg.Client({ connectionString: "postgres://postgres:quyhang@localhost:5575/postgres" });
await db.connect();

const BOC = `(() => { try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}
  if (window.__boc) return; window.__boc = true; window.__patch = []; const f = window.fetch;
  window.fetch = async (u, o) => { const s = String(u && u.url ? u.url : u); const m = (o && o.method) || "GET";
    const laPatch = s.includes("/api/v1/company/settings") && m === "PATCH";
    if (laPatch) {
      if (window.__suaThan) o = { ...o, body: window.__suaThan };
      window.__patch.push(o.body);
    }
    if (laPatch && window.__thanTuGet) return new Response(window.__thanTuGet, { status: 200, headers: { "content-type": "application/json" } });
    const r = await f(u, o);
    if (laPatch) { try { window.__phanHoi = { status: r.status, than: await r.clone().text() }; } catch {} }
    return r; }; })()`;

// Đóng hẳn tab và Chrome của chính lượt này (luật đợt 8: chỉ kill PID mình đã ghi).
const chrome = await moChrome();
const PID_CHROME = spawnSync("ps", ["-axo", "pid=,ppid=,command="], { encoding: "utf8" })
  .stdout.split("\n")
  .map((l) => l.trim().split(/\s+/))
  .filter(([, ppid, ...cmd]) => Number(ppid) === process.pid && cmd.join(" ").includes("--headless=new"))
  .map(([pid]) => Number(pid));
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
    process.exit(128 + { SIGHUP: 1, SIGINT: 2, SIGTERM: 15 }[tin]);
  });
async function tatChrome() {
  chrome.dong();
  for (let i = 0; i < 20 && PID_CHROME.some(conSong); i++) await ngu(150);
  for (const pid of PID_CHROME.filter(conSong)) process.kill(pid, "SIGKILL");
}
async function mo() {
  const t = await chrome.trang(1440, 900);
  const ngat = t.dong.bind(t);
  t.dong = () => {
    t.gui("Page.close").catch(() => {});
    setTimeout(ngat, 300);
  };
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: BOC });
  for (const c of phien.cookie["quan-tri"].split(";").map((s) => s.trim()).filter(Boolean)) {
    const [name, ...v] = c.split("=");
    await t.gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
  }
  await t.gui("Page.navigate", { url: `${URL_GOC}/settings/lead-routing` });
  await t.cho(`document.readyState === "complete" && !!document.querySelector("[data-khoa]")`, 180000);
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
  const r = await t.tinh(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
  if (!r) throw new Error(`không thấy ${sel}`);
  await bamXY(t, r.x, r.y);
  await ngu(400);
}
async function bamLuu(t) {
  const r = await t.tinh(`(() => { const e = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Lưu"); if (!e) return null; e.scrollIntoView({ block: "center" }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
  if (!r) throw new Error("không thấy nút Lưu");
  await bamXY(t, r.x, r.y);
  await ngu(800);
}
async function go(t, khoa, chu) {
  await bam(t, `[data-khoa="${khoa}"] [data-slot=number-field-input]`);
  await t.tinh(`(() => { const o = document.querySelector('[data-khoa="${khoa}"] [data-slot=number-field-input]'); o.focus(); o.select(); return true; })()`);
  await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace" });
  await t.gui("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace" });
  if (chu) await t.gui("Input.insertText", { text: chu });
  await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab" });
  await t.gui("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab" });
  await ngu(500);
}
const oCua = (t, khoa) => t.tinh(`document.querySelector('[data-khoa="${khoa}"] [data-slot=number-field-input]')?.value ?? null`);
const loiDong = (t, khoa) => t.tinh(`document.querySelector('[data-khoa="${khoa}"] [data-slot=field-error]')?.textContent.trim() ?? null`);
const baoDau = (t) => t.tinh(`[...document.querySelectorAll("[role=status], [role=alert]")].map((e) => e.textContent.trim()).filter(Boolean)`);
const toast = (t) => t.tinh(`[...document.querySelectorAll("[data-sonner-toast]")].map((e) => e.querySelector("[data-title]")?.textContent.trim() ?? e.textContent.trim()).at(-1) ?? null`);
const coChu = (t, chu) => t.tinh(`document.body.innerText.includes(${JSON.stringify(chu)})`);
const api = async () =>
  (await (await fetch(`${URL_GOC}/api/v1/company/settings`, { headers: { cookie: phien.cookie["quan-tri"] } })).json());
const don = () => db.query("delete from company_settings where company_id = $1 and key = any($2)", [SAN, [NHAN, GOI]]);
const chenNhan60 = () =>
  db.query(`insert into company_settings (company_id, key, value, updated_by) values ($1, $2, '60'::jsonb, $3)
     on conflict (company_id, key) do update set value = excluded.value`, [SAN, NHAN, phien.nguoi.qt]);

try {
  // Khung 1: sửa một nửa cặp hỏng → lưu, hiện đúng cặp mới.
  await don();
  await chenNhan60();
  let t = await mo();
  const baoTruoc = await coChu(t, "đang chạy theo mặc định");
  await go(t, GOI, "40");
  await bamLuu(t);
  await t.cho(`!!document.querySelector("[data-sonner-toast]")`, 20000).catch(() => {});
  const toast1 = await toast(t);
  const chanDoan1 = { patch: await t.tinh("window.__patch"), bao: await baoDau(t), oGoi: await oCua(t, GOI) };
  await chup(t, "E7-cap-ok");
  t.dong();
  t = await mo();
  const g1 = await api();
  in1({
    ca: "cap-ok",
    baoMacDinhTruoc: baoTruoc,
    toast: toast1,
    oNhanSauTai: await oCua(t, NHAN),
    oGoiSauTai: await oCua(t, GOI),
    baoMacDinhSauTai: await coChu(t, "đang chạy theo mặc định"),
    apiErrors: g1.errors,
    chanDoan: chanDoan1,
  });
  t.dong();

  // Khung 2: ra cặp trái luật → 400 thật, lỗi ở dòng, không «Đã lưu». Màn khoá Lưu với 10 < 15, nên gõ 40 rồi sửa thân đi ra.
  await don();
  await chenNhan60();
  t = await mo();
  await go(t, GOI, "40");
  await t.tinh(`window.__suaThan = JSON.stringify({ "${GOI}": 10 })`);
  await bamLuu(t);
  await t.cho(`!!document.querySelector('[data-khoa="${GOI}"] [data-slot=field-error]')`, 20000).catch(() => {});
  const loi2 = await loiDong(t, GOI);
  const toast2 = await toast(t);
  await chup(t, "E7-cap-400");
  in1({ ca: "cap-400", patch: await t.tinh("window.__patch"), bao: await baoDau(t), loiDongGoi: loi2, toast: toast2, apiNhan: (await api()).items.find((x) => x.key === NHAN)?.value });
  t.dong();

  // Khung 3: phản hồi 200 còn lỗi ở khoá vừa lưu → báo «chưa áp», không «Đã lưu». Hạn nhận 60 có từ trước (cặp hỏng, đang
  // chạy theo mặc định): GET thật của máy chủ trả `errors` nêu khoá của cặp; thân ấy, nguyên văn, là phản hồi của lần lưu.
  await don();
  await chenNhan60();
  t = await mo();
  const getThat = await api();
  const coLoiGoi = (getThat.errors ?? []).some((e) => e.includes(GOI));
  await t.tinh(`window.__thanTuGet = ${JSON.stringify(JSON.stringify({ items: getThat.items, errors: getThat.errors }))}`);
  await go(t, GOI, "45");
  await bamLuu(t);
  // Vế âm «không Đã lưu» chờ cùng khoảng như khung 1 chờ toast (20 giây) — toast tới muộn vẫn bị bắt.
  await t.cho(`document.body.innerText.includes("chưa áp")`, 20000).catch(() => {});
  await t.cho(`!!document.querySelector("[data-sonner-toast]")`, 20000).catch(() => {});
  const bao3 = await baoDau(t);
  const toast3 = await toast(t);
  await chup(t, "E7-cap-con-loi");
  in1({ ca: "cap-con-loi", errorsTuGetThat: getThat.errors, errorsNeuKhoaGoi: coLoiGoi, baoDauKhung: bao3, toast: toast3 });
  t.dong();
} finally {
  await don();
  await tatChrome();
  await db.end();
}
