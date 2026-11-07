// Phép nhìn màn hàng 48 trên chỗ thử dãy D (chạy dung-d.mjs trước). Mỗi ca in một dòng JSON đúng khoá steps của eval đòi
// và chụp ảnh vào --ra. Chrome không đầu qua CDP của hồ sơ bang-hang-kieu-sheet. Lời gọi từ trình duyệt (PATCH lưu cấu hình,
// đọc danh bạ) đi qua lớp bọc fetch đặt vào trang trước khi tải: ghi thân PATCH, sửa thân (400 thật của máy chủ), làm hỏng
// mạng, chặn danh bạ. Lỗi phía máy chủ là lỗi thật trên Postgres dãy D: gỡ vai quản trị (403), thu quyền đọc bảng cấu hình
// của vai API (tải hỏng), chèn dòng cặp hạn trái luật — mỗi ca trả lại như cũ sau khi đo.
//   node _acceptance/luat-chia-lead/thu/chay-ui.mjs --e1 --e2 --e5 --e6 --e7 --e10 --ra <thư mục>
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const URL_GOC = "http://localhost:3495";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/luat-chia-lead");
const arg = (k) => process.argv.includes(k);
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : ".acceptance-runs/luat-chia-lead/evidence");
mkdirSync(RA, { recursive: true });
// Mỗi lần chạy tự dựng (hay dùng lại) chỗ thử: S4 vòng 2, tác tử chấm E10b tới sau khi tác tử trước đã tắt máy dev chung,
// không có máy dev ở 3495 nên chặn. dung-d dùng lại máy dev đang sống của cây này, nạp lại sàn mẫu và trả lại quyền bị thu
// dở. Dòng JSON của nó đi ra stderr để stdout chỉ còn dòng của các ca.
const dung = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "dung-d.mjs")], { cwd: GOC, stdio: ["ignore", 2, 2] });
if (dung.status !== 0) throw new Error(`dựng chỗ thử hỏng (dung-d.mjs thoát ${dung.status})`);
const phien = JSON.parse(readFileSync(path.join(CHAY, "phien.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const h = { "content-type": "application/json", origin: URL_GOC };
const in1 = (o) => console.log(JSON.stringify(o));
const db = new pg.Client({ connectionString: "postgres://postgres:quyhang@localhost:5575/postgres" });
await db.connect();
const SAN = phien.san;

const KHOA = [
  "lead_routing.strategy",
  "lead_routing.accept_minutes",
  "lead_routing.first_call_minutes",
  "lead_routing.alert_to",
  "queue.call_back_after_days",
  "queue.price_negotiation_after_days",
];

const BOC = `(() => { try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}
  if (window.__boc) return; window.__boc = true; window.__patch = []; window.__demDanhBa = 0; const f = window.fetch;
  window.fetch = async (u, o) => { const s = String(u && u.url ? u.url : u); const m = (o && o.method) || "GET";
    if (s.includes("/api/v1/company/settings") && m === "PATCH") {
      window.__patch.push(o.body);
      if (window.__matMang) throw new TypeError("Failed to fetch");
      if (window.__suaThan) o = { ...o, body: window.__suaThan };
    }
    if (s.includes("/api/v1/company/member-names")) {
      window.__demDanhBa++;
      if (window.__chanDanhBa) return new Response("{}", { status: 503, headers: { "content-type": "application/json" } });
    }
    return f(u, o); }; })()`;

// S4 vòng 1: tab đóng bằng t.dong() chỉ ngắt CDP, tab vẫn mở trang của máy dev; chrome.dong() gửi SIGTERM mà Chrome không
// đầu vẫn sống (cha chết → mồ côi). Tab mồ côi giữ kênh HMR, mỗi lần máy dev dựng lại thì tải lại và kéo tab chấm của lượt
// sau vào vòng «Compiled → tải lại» (E1, E10b kẹt «Đang tải lần đầu»). Nên: đóng hẳn từng tab, ghi PID Chrome lúc dựng
// (con trực tiếp của tiến trình này) và cuối lượt chắc chắn nó đã tắt — luật đợt 8: chỉ kill PID mình đã ghi.
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
// Tác tử chấm hết giờ thì giết tiến trình này — finally không chạy, nên tắt Chrome ngay trong bộ bắt tín hiệu.
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
async function mo(ai, { w = 1440, hgt = 900, duong = "/settings/lead-routing", cho = "[data-khoa]", truocTai } = {}) {
  const t = await chrome.trang(w, hgt);
  const ngat = t.dong.bind(t);
  t.dong = () => {
    t.gui("Page.close").catch(() => {});
    setTimeout(ngat, 300);
  };
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: BOC });
  if (truocTai) await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: truocTai });
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
  const r = await t.tinh(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
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
/** Gõ vào ô số của một khoá: chọn hết rồi gõ chữ, rời ô. */
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
async function chon(t, khoa, chu) {
  await bam(t, `[data-khoa="${khoa}"] [data-slot=select-trigger]`);
  await t.cho(`[...document.querySelectorAll("[role=option]")].some((o) => o.textContent.trim() === ${JSON.stringify(chu)})`, 10000);
  const r = await t.tinh(`(() => { const o = [...document.querySelectorAll("[role=option]")].find((o) => o.textContent.trim() === ${JSON.stringify(chu)}); const b = o.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
  await bamXY(t, r.x, r.y);
  await ngu(500);
}
/** Ảnh chụp sáu dòng: tên, giá trị trên ô, chữ nguồn, lỗi, khoá. */
const DONG = `JSON.stringify([...document.querySelectorAll("[data-khoa]")].map((e) => { const f = e.closest("[data-slot=field]");
  const s = e.querySelector("[data-slot=select-value]"); const o = s ? null : e.querySelector("[data-slot=number-field-input]");
  return { khoa: e.dataset.khoa, ten: f?.querySelector("[data-slot=field-label], [data-slot=field-title]")?.textContent.trim() ?? null,
    giaTri: s ? s.textContent.trim() : (o ? o.value : null), nguon: e.querySelector("[id^=nguon-]")?.textContent.trim() ?? null,
    loi: e.querySelector("[data-slot=field-error], [role=alert]")?.textContent.trim() ?? null,
    khoa_: !!(o?.disabled || e.querySelector("[data-slot=select-trigger]")?.hasAttribute("data-disabled") || e.querySelector("[data-slot=select-trigger]")?.disabled) }; }))`;
const dong = async (t) => JSON.parse(await t.tinh(DONG));
const coChu = (t, chu) => t.tinh(`document.body.innerText.includes(${JSON.stringify(chu)})`);
const toast = (t) => t.tinh(`[...document.querySelectorAll("[data-sonner-toast]")].map((e) => e.querySelector("[data-title]")?.textContent.trim() ?? e.textContent.trim()).at(-1) ?? null`);
const nutTat = (t, chu) => t.tinh(`!!(${nutChu(chu)})?.disabled`);

async function goi(ai, method, duong, body) {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { ...h, cookie: phien.cookie[ai] }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: r.status, than: await r.json().catch(() => null) };
}
/** Đưa sàn mẫu về mặc định: xoá dòng cấu hình của sáu khoá và bộ nhóm riêng (nhật ký chỉ thêm, không xoá). */
async function veMacDinh() {
  await db.query("delete from company_settings where company_id = $1 and (key = any($2) or key = 'queue.groups')", [SAN, KHOA]);
}
const soSuKien = async () => (await db.query("select count(*)::int n from company_settings_events where company_id = $1", [SAN])).rows[0].n;
const tenQt = phien.ten["quan-tri"];
const ddmm = (d) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}`;
};

try {
  if (arg("--e1")) {
    await veMacDinh();
    let t = await mo("quan-tri");
    const truoc = await dong(t);
    await chup(t, "E1-truoc");
    t.dong();
    const r = await goi("quan-tri", "PATCH", "/api/v1/company/settings", { "lead_routing.accept_minutes": 20 });
    t = await mo("quan-tri");
    const sau = await dong(t);
    await chup(t, "E1-1440");
    const api = (await goi("quan-tri", "GET", "/api/v1/company/settings")).than;
    in1({
      ca: "e1",
      patch: r.status,
      tenDong: sau.map((d) => d.ten),
      giaTri: Object.fromEntries(sau.map((d) => [d.khoa, d.giaTri])),
      giaTriApi: Object.fromEntries(KHOA.map((k) => [k, api.items.find((x) => x.key === k)?.value])),
      nguon: Object.fromEntries(sau.map((d) => [d.khoa, d.nguon])),
      nguonMongDoi: `Đã đổi · ${tenQt} · ${ddmm(new Date())}`,
      nguonTruoc: truoc.find((d) => d.khoa === "lead_routing.accept_minutes")?.nguon,
    });
    t.dong();
  }

  if (arg("--e2")) {
    await veMacDinh();
    const t0 = await soSuKien();
    let t = await mo("quan-tri");
    await go(t, "lead_routing.accept_minutes", "25");
    await chon(t, "lead_routing.strategy", "Kho chung");
    await bamNut(t, "Lưu");
    await t.cho(`!!document.querySelector("[data-sonner-toast]")`, 20000);
    const tb = await toast(t);
    const patch = await t.tinh("window.__patch");
    await chup(t, "E2-sau-luu");
    t.dong();
    t = await mo("quan-tri");
    const sauTai = await dong(t);
    const api = (await goi("quan-tri", "GET", "/api/v1/company/settings")).than;
    const moi = (await db.query("select key, actor_user_id, actor_roles from company_settings_events where company_id = $1 order by id desc limit 2", [SAN])).rows;
    in1({
      ca: "e2",
      thanPatch: patch.map((b) => JSON.parse(b)),
      toast: tb,
      sauTai: { accept: sauTai.find((d) => d.khoa === "lead_routing.accept_minutes")?.giaTri, strategy: sauTai.find((d) => d.khoa === "lead_routing.strategy")?.giaTri },
      api: { accept: api.items.find((x) => x.key === "lead_routing.accept_minutes")?.value, strategy: api.items.find((x) => x.key === "lead_routing.strategy")?.value },
      soSuKienThem: (await soSuKien()) - t0,
      suKienMoi: moi.map((e) => ({ key: e.key, nguoiLaQt: e.actor_user_id === phien.nguoi.qt, vai: e.actor_roles })),
    });
    // Chỉ đổi điểm áp ngay.
    await go(t, "queue.call_back_after_days", "20");
    await bamNut(t, "Lưu");
    await t.cho(`[...document.querySelectorAll("[data-sonner-toast]")].length > 0`, 20000);
    await ngu(300);
    in1({ ca: "e2-ngay", toast: await toast(t) });
    t.dong();
    // Hoàn lại.
    t = await mo("quan-tri");
    const truocHoan = await t.tinh("window.__patch.length");
    await go(t, "lead_routing.first_call_minutes", "55");
    await chon(t, "lead_routing.alert_to", "Trưởng nhóm và quản trị sàn");
    const dangSua = await dong(t);
    await bamNut(t, "Hoàn lại");
    const sauHoan = await dong(t);
    await chup(t, "E2-hoan-lai");
    const api2 = (await goi("quan-tri", "GET", "/api/v1/company/settings")).than;
    in1({
      ca: "e2-hoan-lai",
      dangSua: Object.fromEntries(dangSua.map((d) => [d.khoa, d.giaTri])),
      sauHoan: Object.fromEntries(sauHoan.map((d) => [d.khoa, d.giaTri])),
      api: Object.fromEntries(KHOA.map((k) => [k, api2.items.find((x) => x.key === k)?.value])),
      soPatch: (await t.tinh("window.__patch.length")) - truocHoan,
    });
    t.dong();
  }

  if (arg("--e5")) {
    await veMacDinh();
    // Vai của hai người mẫu phải là vai gốc trước ca (lượt trước có thể dừng giữa chừng).
    let t = await mo("quan-tri");
    await go(t, "lead_routing.accept_minutes", "0");
    const ca1 = (await dong(t)).find((d) => d.khoa === "lead_routing.accept_minutes");
    const luu1 = await nutTat(t, "Lưu");
    await chup(t, "E5-o-sai");
    await go(t, "lead_routing.accept_minutes", "15");
    await go(t, "lead_routing.first_call_minutes", "10");
    const ca2 = (await dong(t)).find((d) => d.khoa === "lead_routing.first_call_minutes");
    in1({ ca: "e5", nhan0: { loi: ca1.loi }, luuKhoa0: luu1, goi10: { loi: ca2.loi }, luuKhoa10: await nutTat(t, "Lưu"), soPatch: await t.tinh("window.__patch.length") });
    t.dong();

    // 400 thật: gõ 40, sửa thân đi ra thành hạn gọi 10 — máy chủ thật từ chối cặp hạn.
    t = await mo("quan-tri");
    await go(t, "lead_routing.first_call_minutes", "40");
    await t.tinh(`window.__suaThan = JSON.stringify({ "lead_routing.first_call_minutes": 10 })`);
    await bamNut(t, "Lưu");
    await t.cho(`!!document.querySelector('[data-khoa="lead_routing.first_call_minutes"] [data-slot=field-error]')`, 20000);
    const ca400 = (await dong(t)).find((d) => d.khoa === "lead_routing.first_call_minutes");
    await chup(t, "E5-400");
    const api = (await goi("quan-tri", "GET", "/api/v1/company/settings")).than;
    in1({ ca: "e5-400", loiTrongDong: ca400.loi, oVan: ca400.giaTri, apiFirstCall: api.items.find((x) => x.key === "lead_routing.first_call_minutes")?.value });
    t.dong();

    // 403 thật: gỡ vai quản trị sau khi mở màn.
    t = await mo("quan-tri");
    await go(t, "lead_routing.accept_minutes", "22");
    // Sàn phải còn một quản trị (ràng buộc can_mot_quan_tri): tạm thêm vai quản trị cho trưởng nhóm, gỡ của quản trị mẫu.
    const vaiCua = async (u) => (await db.query("select roles from company_members where company_id = $1 and user_id = $2", [SAN, u])).rows[0].roles;
    const vaiCu = await vaiCua(phien.nguoi.qt);
    const vaiTnCu = await vaiCua(phien.nguoi.tn);
    await db.query("update company_members set roles = array_append(roles, 'company_admin') where company_id = $1 and user_id = $2", [SAN, phien.nguoi.tn]);
    await db.query("update company_members set roles = '{listing_agent}' where company_id = $1 and user_id = $2", [SAN, phien.nguoi.qt]);
    try {
      await bamNut(t, "Lưu");
      await t.cho(`document.body.innerText.includes("Chỉ quản trị sàn đổi được luật này")`, 20000);
      const o = (await dong(t)).find((d) => d.khoa === "lead_routing.accept_minutes");
      await chup(t, "E5-403");
      in1({ ca: "e5-403", bao: await coChu(t, "Chỉ quản trị sàn đổi được luật này"), oVan: o.giaTri });
    } finally {
      await db.query("update company_members set roles = $3 where company_id = $1 and user_id = $2", [SAN, phien.nguoi.qt, vaiCu]);
      await db.query("update company_members set roles = $3 where company_id = $1 and user_id = $2", [SAN, phien.nguoi.tn, vaiTnCu]);
    }
    t.dong();

    // Mạng hỏng lúc lưu, rồi thử lại.
    t = await mo("quan-tri");
    await go(t, "lead_routing.accept_minutes", "18");
    await t.tinh("window.__matMang = true");
    await bamNut(t, "Lưu");
    await t.cho(`!!(${nutChu("Thử lại")})`, 20000);
    const o = (await dong(t)).find((d) => d.khoa === "lead_routing.accept_minutes");
    await chup(t, "E5-mang");
    const coBao = await coChu(t, "Chưa lưu được");
    await t.tinh("window.__matMang = false");
    await bamNut(t, "Thử lại");
    await t.cho(`!!document.querySelector("[data-sonner-toast]")`, 20000);
    in1({ ca: "e5-mang", bao: coBao, coThuLai: true, oVan: o.giaTri, toastSauThuLai: await toast(t) });
    t.dong();
  }

  if (arg("--e6")) {
    const ket = {};
    for (const ai of ["truong-nhom", "dau-chu-1"]) {
      const t = await mo(ai, { duong: "/settings/personal", cho: null });
      await ngu(1500);
      const coMuc = await t.tinh(`!!document.querySelector('a[href="/settings/lead-routing"]')`);
      await t.gui("Page.navigate", { url: `${URL_GOC}/settings/lead-routing` });
      await t.cho(`location.pathname === "/settings/personal"`, 60000);
      await ngu(1500);
      if (ai === "truong-nhom") await chup(t, "E6-truong-nhom");
      ket[ai] = { coMucTrongCot: coMuc, url: await t.tinh("location.pathname + location.search"), bao: await coChu(t, "Mục này chỉ quản trị sàn mở được") };
      t.dong();
    }
    const t = await mo("quan-tri");
    ket["quan-tri"] = { url: await t.tinh("location.pathname") };
    t.dong();
    in1({ ca: "e6", ...ket });
  }

  if (arg("--e7")) {
    await veMacDinh();
    // (a) Bộ nhóm Hôm nay riêng hợp lệ: lấy chính bộ mặc định máy chủ trả rồi ghi lại làm bộ của sàn.
    const bo = (await goi("quan-tri", "GET", "/api/v1/company/settings/queue")).than;
    const put = await goi("quan-tri", "PUT", "/api/v1/company/settings/queue", { groups: bo.groups });
    let t = await mo("quan-tri");
    const a = (await dong(t)).filter((d) => d.khoa.startsWith("queue."));
    await chup(t, "E7-bo-nhom");
    in1({ ca: "e7-a", put: put.status, nguonBo: (await goi("quan-tri", "GET", "/api/v1/company/settings/queue")).than.source, nguongKhoa: a.map((d) => d.khoa_), bao: await coChu(t, "Sàn đang dùng bộ nhóm Hôm nay riêng") });
    t.dong();
    await veMacDinh();
    // (b) Dòng cặp hạn trái luật có từ trước, chèn thẳng như dòng cũ (không qua lối kiểm).
    for (const [k, v] of [
      ["lead_routing.accept_minutes", 60],
      ["lead_routing.first_call_minutes", 30],
    ])
      await db.query(
        `insert into company_settings (company_id, key, value, updated_by, data_class) values ($1, $2, $3::jsonb, $4, 'company_internal')
         on conflict (company_id, key) do update set value = excluded.value`,
        [SAN, k, JSON.stringify(v), phien.nguoi.qt],
      );
    const loiApi = (await goi("quan-tri", "GET", "/api/v1/company/settings")).than.errors;
    t = await mo("quan-tri");
    await chup(t, "E7-dong-hong");
    in1({ ca: "e7-b", loiApi, bao: await t.tinh(`[...document.querySelectorAll("[role=status]")].map((e) => e.textContent.trim()).find((s) => s.includes("mặc định")) ?? null`) });
    t.dong();
    await veMacDinh();
    // (c) Tải hỏng: thu quyền đọc bảng cấu hình của vai API, mở màn, trả quyền, bấm Thử lại.
    await db.query("revoke select on company_settings from quy_hang_app");
    let c;
    try {
      t = await mo("quan-tri", { cho: null });
      await t.cho(`document.body.innerText.includes("Chưa tải được luật chia lead")`, 60000);
      await chup(t, "E7-loi-tai");
      c = { bao: true, coThuLai: await t.tinh(`!!(${nutChu("Thử lại")})`) };
    } finally {
      await db.query("grant select on company_settings to quy_hang_app");
    }
    await bamNut(t, "Thử lại");
    await t.cho(`document.querySelectorAll("[data-khoa]").length === 6`, 60000);
    in1({ ca: "e7-c", ...c, soDongSauThuLai: await t.tinh(`document.querySelectorAll("[data-khoa]").length`) });
    t.dong();
  }

  if (arg("--e10")) {
    const khoaDb = `qh:danh-ba:v1:${SAN}`;
    const t = await mo("dau-chu-1", {
      duong: "/inventory",
      cho: "[data-slot=data-grid] tbody",
      truocTai: `try { localStorage.removeItem(${JSON.stringify(khoaDb)}); } catch {} window.__chanDanhBa = true;`,
    });
    await t.cho(`document.body.innerText.includes("Chưa đọc được danh bạ thành viên")`, 60000);
    const dem0 = await t.tinh("window.__demDanhBa");
    await ngu(10000);
    const dem10 = await t.tinh("window.__demDanhBa");
    await chup(t, "E10-loi");
    const coBao = await coChu(t, "Chưa đọc được danh bạ thành viên");
    await t.tinh("window.__chanDanhBa = false");
    await bamNut(t, "Thử lại");
    await t.cho(`!document.body.innerText.includes("Chưa đọc được danh bạ thành viên")`, 30000);
    await ngu(800);
    const ten = phien.ten["dau-chu-1"];
    await chup(t, "E10-sau-thu-lai");
    in1({ ca: "e10", bao: coBao, coThuLai: true, soLanGoiTrong10s: dem10, soLanGoiLucBao: dem0, baoSauThuLai: await coChu(t, "Chưa đọc được danh bạ thành viên"), tenDauChuHien: await coChu(t, ten) });
    t.dong();
  }
} finally {
  await tatChrome();
  await db.end();
}
