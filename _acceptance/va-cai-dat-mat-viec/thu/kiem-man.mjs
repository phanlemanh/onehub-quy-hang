// Lệnh đo va-cai-dat-mat-viec trên màn thật (Chrome không đầu qua CDP, chỗ thử dãy D). Tám ca, mỗi ca một dòng JSON {ca, dat, …}.
// Thoát 0 khi mọi ca đạt · 1 khi có ca đỏ · 2 khi không dựng được chỗ thử hay thiếu axe.
//   node _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs              # đo, xong tắt máy dev
//   node _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs --giu-may    # đo, để máy dev chạy
//   node _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs --ca a,b     # chỉ đo các ca nêu tên (khi gỡ lỗi; lượt chấm chạy cả tám)
//   node _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs --dung-man   # dựng dữ liệu, chụp năm ảnh cho bài nhìn E10, xong dọn dữ liệu và tắt máy dev
// Dữ liệu thử nhãn mẫu, không tên người thật; mỗi ca dựng lại nhãn và mẫu nhập của sàn mẫu rồi trả lại.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const THU = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.resolve(THU, "../../..");
const URL_GOC = "http://localhost:3495";
process.env.QH_B_URL = URL_GOC;
const DUNG = path.join(GOC, "_acceptance/luat-chia-lead/thu/dung-d.mjs");
const AXE = path.join(GOC, "node_modules/axe-core/axe.min.js");
const ANH = path.join(GOC, "_acceptance/va-cai-dat-mat-viec/evidence");
const DUNG_MAN = process.argv.includes("--dung-man");
const GIU_MAY = process.argv.includes("--giu-may");
const iCa = process.argv.indexOf("--ca");
const CHON = iCa > 0 ? process.argv[iCa + 1].split(",") : null;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const coi = (x) => JSON.stringify(x);

// Lượt chấm chạy lệnh máy và bài nhìn song song, cả hai dùng chung máy dev 3495 và dữ liệu sàn mẫu: lần lượt qua khoá này.
const KHOA = path.join("/tmp", `quy-hang-d48-${path.basename(GOC)}`, "kiem-man.khoa");
mkdirSync(path.dirname(KHOA), { recursive: true });
for (const dau = Date.now(); ; await ngu(2000)) {
  try {
    writeFileSync(KHOA, String(process.pid), { flag: "wx" });
    break;
  } catch {
    let song = false;
    try {
      process.kill(Number(readFileSync(KHOA, "utf8")), 0);
      song = true;
    } catch {
      rmSync(KHOA, { force: true });
    }
    if (song && Date.now() - dau > 540000) {
      console.error("chờ khoá kiem-man quá 9 phút");
      process.exit(2);
    }
  }
}
process.on("exit", () => rmSync(KHOA, { force: true }));

if (!existsSync(AXE)) {
  console.error("thiếu axe-core");
  process.exit(2);
}
// Máy dev bật lại trên .next/dev cũ thì trang tự nạp lại liên tục.
const songSan = await fetch(`${URL_GOC}/api/v1/health`).then((r) => r.status === 200).catch(() => false);
if (!songSan) rmSync(path.join(GOC, "apps/web/.next/dev"), { recursive: true, force: true });
const dung = spawnSync(process.execPath, [DUNG], { cwd: GOC, stdio: ["ignore", 2, 2] });
if (dung.status !== 0) {
  console.error(`dựng chỗ thử hỏng (dung-d.mjs thoát ${dung.status})`);
  process.exit(2);
}
const phien = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/luat-chia-lead/phien.json"), "utf8"));
const SAN = phien.san;
const COOKIE = phien.cookie["quan-tri"];
const db = new pg.Client({ connectionString: "postgres://postgres:quyhang@localhost:5575/postgres" });
await db.connect();
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const chrome = await moChrome();

const BOC = `(() => { try { Object.defineProperty(navigator, "serviceWorker", { get: () => undefined }); } catch {}
  if (window.__boc) return; window.__boc = true; const f = window.fetch;
  window.fetch = async (u, o) => { const s = String(u && u.url ? u.url : u); const m = (o && o.method) || "GET";
    if (s.includes("/api/v1/company/import-templates/")) {
      const k = m === "DELETE" ? window.__chanXoa : m === "PUT" ? window.__chanSua : undefined;
      if (k === "mang") throw new TypeError("Failed to fetch");
      if (k === "treo") { await new Promise((r) => { window.__nhaXoa = r; }); return new Response("{}", { status: 500, headers: { "content-type": "application/json" } }); }
      if (k) return new Response("{}", { status: Number(k), headers: { "content-type": "application/json" } });
    }
    return f(u, o); }; })()`;

// ─── Dữ liệu ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const MA_THU = "THU-MAN-";
const NHAN = ["Nhãn một", "Nhãn hai", "Nhãn ba"];
const KHOA_DAI = "X".repeat(200);
const KHOA_QD = "Cột có quy đổi";
const KHOA_XOA = "Cột sẽ xoá";
const KHOA_BON = "Cột thử bốn";
const KHOA_NAM = "Cột thử năm";
const KHOA_SAU = "Cột thử sáu";
const KHOA_MAU = [KHOA_DAI, KHOA_QD, KHOA_XOA, KHOA_BON, KHOA_NAM, KHOA_SAU];

async function donNhan() {
  await db.query("delete from listings where company_id = $1 and unit_number like $2", [SAN, `${MA_THU}%`]);
  await db.query("update listings set status_label = null where company_id = $1", [SAN]);
  await db.query("delete from company_settings where company_id = $1 and key like 'labels.status.%'", [SAN]);
}
async function donMau() {
  await db.query("delete from import_templates where company_id = $1 and header_key = any($2)", [SAN, KHOA_MAU]);
}
/** Nạp n nhãn neo vào trạng thái chuẩn có đủ căn, mỗi nhãn một căn đang mang. Trả [{code, label, listing}]. */
async function napNhan(n) {
  await donNhan();
  // Sàn mẫu của chỗ thử chỉ có một căn: chép dòng căn ấy thành n căn thử, mỗi nhãn một căn (`donNhan` xoá chúng).
  const goc = (await db.query("select id, standard_status from listings where company_id = $1 and not voided order by id limit 1", [SAN])).rows[0];
  if (!goc) throw new Error("sàn mẫu không có căn nào");
  const neo = goc.standard_status;
  const can = [];
  for (let i = 0; i < n; i++)
    can.push(
      (await db.query("insert into listings select (jsonb_populate_record(l, jsonb_build_object('id', gen_random_uuid(), 'unit_number', $2::text))).* from listings l where l.id = $1 returning id", [goc.id, `${MA_THU}${i + 1}`])).rows[0],
    );
  const r = await fetch(`${URL_GOC}/api/v1/company/statuses`, {
    method: "PUT",
    headers: { "content-type": "application/json", origin: URL_GOC, cookie: COOKIE },
    body: JSON.stringify({ labels: NHAN.slice(0, n).map((label) => ({ label, anchor: neo })), replace: {} }),
  });
  if (!r.ok) throw new Error(`nạp nhãn: ${r.status} ${await r.text()}`);
  const bo = await r.json();
  const nhan = bo.statuses.find((s) => s.status === neo).labels;
  const ra = [];
  for (let i = 0; i < n; i++) {
    const code = nhan.find((x) => x.label === NHAN[i]).code;
    await db.query("update listings set status_label = $1 where id = $2", [code, can[i].id]);
    ra.push({ code, label: NHAN[i], listing: can[i].id });
  }
  return ra;
}
async function napMau() {
  await donMau();
  // Mỗi dòng một đích, một ngày nguồn, và hai dòng số quy đổi khác nhau, để phép đo theo từng dòng phân biệt được các dòng.
  const DICH = { [KHOA_DAI]: ["directionFaces", { Dong: "Đông", Tay: "Tây" }], [KHOA_QD]: ["buildingName", { A: "[Mẫu] Toà A" }], [KHOA_XOA]: ["keep_as_note", null], [KHOA_BON]: ["subdivisionName", null], [KHOA_NAM]: ["feeInclusion", null], [KHOA_SAU]: ["standardStatus", null] };
  for (const [i, k] of KHOA_MAU.entries()) {
    await db.query(
      "insert into import_templates (company_id, header_key, action, target, value_map, edited_by, edited_at) values ($1, $2, 'set', $3, $4, $5, now() - make_interval(days => $6))",
      [SAN, k, DICH[k][0], DICH[k][1], phien.nguoi.qt, i],
    );
  }
}
const nhanCuaCan = async (id) => (await db.query("select status_label from listings where id = $1", [id])).rows[0].status_label;
/** Nhãn còn hay không, đọc đúng đường màn đọc (`GET /company/statuses`) sau khi lưu. */
async function conKhoaNhan(code) {
  const r = await fetch(`${URL_GOC}/api/v1/company/statuses`, { headers: { cookie: COOKIE } });
  if (!r.ok) throw new Error(`đọc nhãn: ${r.status}`);
  return (await r.json()).statuses.some((s) => s.labels.some((l) => l.code === code));
}
/** Dòng mới nhất của một khoá trong sổ sửa mẫu nhập. */
const dongSoMau = async (k) => (await db.query("select action, value_map from import_templates where company_id = $1 and header_key = $2 order by edited_at desc limit 1", [SAN, k])).rows[0];

// ─── Trình duyệt ───────────────────────────────────────────────────────────────────────────────────────────────────────
async function mo(duong, cho, rong = 1440, cao = 900) {
  const t = await chrome.trang(rong, cao);
  await t.gui("Page.addScriptToEvaluateOnNewDocument", { source: BOC });
  await t.datCookie(COOKIE.split(";").map((s) => s.trim()).filter(Boolean));
  await t.di(duong);
  await t.cho(`document.readyState === "complete" && !!document.querySelector(${coi(cho)})`, 180000);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(800);
  return t;
}
const dong = async (t) => {
  await t.gui("Page.close").catch(() => {});
  t.dong();
};
const chup = async (t, ten) => writeFileSync(path.join(ANH, `${ten}.png`), await t.chup());
async function bamBieuThuc(t, expr, moTa) {
  const r = await t.tinh(`(() => { const e = ${expr}; if (!e) return null; e.scrollIntoView({ block: "center", inline: "nearest" }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, tat: !!e.disabled }; })()`);
  if (!r) throw new Error(`không thấy ${moTa}`);
  for (const [type, extra] of [["mouseMoved", {}], ["mousePressed", { button: "left", buttons: 1, clickCount: 1 }], ["mouseReleased", { button: "left", buttons: 0, clickCount: 1 }]])
    await t.gui("Input.dispatchMouseEvent", { type, x: r.x, y: r.y, ...extra });
  await ngu(700);
}
const HOP_TRANG = `document.querySelector("[role=alertdialog]")`;
const HOP_THUONG = `document.querySelector("[role=dialog]")`;
const nutTrong = (goc, chu) => `[...(${goc}?.querySelectorAll("button") ?? [])].find((b) => b.textContent.trim() === ${coi(chu)})`;
const nutTrang = (chu) => nutTrong("document", chu);
const coHop = (t, hop = HOP_TRANG) => t.tinh(`!!${hop}`);
const nhanTren = (t, l) => t.tinh(`[...document.querySelectorAll("input")].some((i) => i.value === ${coi(l)})`);
const luuMo = (t) => t.tinh(`(() => { const b = ${nutTrang("Lưu")}; return !!b && !b.disabled; })()`);
const goNhan = (t, l) => bamBieuThuc(t, `document.querySelector(${coi(`button[aria-label="Gỡ nhãn ${l}"]`)})`, `nút gỡ ${l}`);
const giu = (t) => bamBieuThuc(t, nutTrong(HOP_TRANG, "Giữ nhãn"), "Giữ nhãn");
const chuyen = async (t, value) => {
  await bamBieuThuc(t, `document.querySelector(${coi(`label[for="thay-${value}"]`)})`, `lựa chọn thay ${value}`);
  await bamBieuThuc(t, nutTrong(HOP_TRANG, "Gỡ và chuyển"), "Gỡ và chuyển");
};
async function esc(t) {
  for (const type of ["keyDown", "keyUp"]) await t.gui("Input.dispatchKeyEvent", { type, key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await ngu(700);
}
const manNhan = () => mo("/settings/statuses", `button[aria-label^="Gỡ nhãn"]`);
const bamLuu = async (t) => {
  await bamBieuThuc(t, nutTrang("Lưu"), "Lưu");
  await t.cho(`document.body.innerText.includes("Đã lưu trạng thái")`, 15000);
};

const dongMau = (k) => `[...document.querySelectorAll("tbody tr")].find((r) => r.cells[0]?.textContent.includes(${coi(k)}))`;
const coDong = (t, k) => t.tinh(`!!${dongMau(k)}`);
const nutDong = (k, chu) => nutTrong(dongMau(k), chu);
const BANG = `[...document.querySelectorAll("[data-slot=table-container]")].find((c) => c.offsetParent !== null)`;
const manMau = (rong, cao) => mo("/settings/templates", "tbody tr", rong, cao);
const trongMan = (e) => `(() => { const khung = (${e}).getBoundingClientRect(); return khung.left >= 0 && khung.right <= innerWidth + 0.5 && khung.top >= 0 && khung.bottom <= innerHeight + 0.5; })()`;
const khungKhongTran = (t) => t.tinh(`(() => { const c = ${BANG}; return !!c && c.scrollWidth <= c.clientWidth && document.documentElement.scrollWidth <= innerWidth; })()`);

async function hopTrongMan(t, hop) {
  return t.tinh(`(() => { const h = ${hop}; if (!h) return false; const nut = [...h.querySelectorAll("button")].filter((b) => b.offsetParent !== null);
    return ${trongMan("h")} && h.scrollWidth <= h.clientWidth && nut.length >= 2 && nut.every((b) => ${trongMan("b")}); })()`);
}

// ─── Các ca ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const CA = {
  async "giu-nhan"() {
    const [a, b] = await napNhan(2);
    const t = await manNhan();
    await goNhan(t, a.label);
    await chuyen(t, "mac-dinh");
    await goNhan(t, b.label);
    await giu(t);
    const nhanSauCon = await nhanTren(t, b.label);
    const nhanDauVanGo = !(await nhanTren(t, a.label));
    const luuBamDuoc = await luuMo(t);
    let daLuu = {};
    if (luuBamDuoc) {
      await bamLuu(t);
      daLuu = { canDauSangThay: (await nhanCuaCan(a.listing)) === null, nhanDauMat: !(await conKhoaNhan(a.code)), canSauGiu: (await nhanCuaCan(b.listing)) === b.code, nhanSauCon_csdl: await conKhoaNhan(b.code) };
    }
    await dong(t);
    return { nhanSauCon, nhanDauVanGo, luuBamDuoc, ...daLuu, dat: nhanSauCon && nhanDauVanGo && luuBamDuoc && Object.values(daLuu).length === 4 && Object.values(daLuu).every(Boolean) };
  },
  async "huy-nhieu-lan"() {
    const [a, b, c] = await napNhan(3);
    const t = await manNhan();
    await goNhan(t, a.label);
    await chuyen(t, "mac-dinh");
    await goNhan(t, b.label);
    await esc(t);
    const sauEsc = await nhanTren(t, b.label);
    if (!sauEsc) {
      await dong(t);
      return { sauEsc, dat: false };
    }
    await goNhan(t, c.label);
    await giu(t);
    const sauGiu = await nhanTren(t, c.label);
    const nhanMotVanGo = !(await nhanTren(t, a.label));
    await goNhan(t, b.label);
    const hoiMoi = (await coHop(t)) && (await t.tinh(`${HOP_TRANG}.querySelectorAll('[role=radio][aria-checked=true]').length === 0`));
    const nutKhoa = await t.tinh(`!!${nutTrong(HOP_TRANG, "Gỡ và chuyển")}?.disabled`);
    await giu(t);
    const luuBamDuoc = await luuMo(t);
    await dong(t);
    return { sauEsc, sauGiu, nhanMotVanGo, hoiMoi, nutKhoa, luuBamDuoc, dat: sauEsc && sauGiu && nhanMotVanGo && hoiMoi && nutKhoa && luuBamDuoc };
  },
  async "chuyen-hai"() {
    const [a, b, c] = await napNhan(3);
    const t = await manNhan();
    await goNhan(t, a.label);
    await chuyen(t, c.code);
    const hopDong1 = !(await coHop(t));
    await goNhan(t, b.label);
    await chuyen(t, "mac-dinh");
    const hopDong2 = !(await coHop(t));
    const hopDong = hopDong1 && hopDong2;
    await bamLuu(t);
    const canASangC = (await nhanCuaCan(a.listing)) === c.code;
    const canBVeMacDinh = (await nhanCuaCan(b.listing)) === null;
    const haiNhanMat = !(await conKhoaNhan(a.code)) && !(await conKhoaNhan(b.code));
    await dong(t);
    return { hopDong, canASangC, canBVeMacDinh, haiNhanMat, dat: hopDong && canASangC && canBVeMacDinh && haiNhanMat };
  },
  async "xoa-hong"() {
    await napMau();
    const t = await manMau();
    const kq = {};
    for (const [ten, kieu] of [["loi500", "500"], ["mang", "mang"]]) {
      await t.tinh(`window.__chanXoa = ${coi(kieu)}; true`);
      if (!(await coHop(t))) await bamBieuThuc(t, nutDong(KHOA_XOA, "Xoá"), "Xoá của dòng");
      await bamBieuThuc(t, nutTrong(HOP_TRANG, "Xoá"), "Xoá trong hộp");
      await ngu(600);
      const hopMo = await coHop(t);
      const coCauLoi = hopMo && (await t.tinh(`${HOP_TRANG}.innerText.includes("Chưa xoá được")`));
      const dongCon = await coDong(t, KHOA_XOA);
      kq[ten] = { hopMo, coCauLoi, dongCon };
      if (!hopMo) {
        await dong(t);
        return { ...kq, dat: false };
      }
    }
    // Huỷ sau lỗi, mở dòng khác: không còn câu cũ.
    await bamBieuThuc(t, nutTrong(HOP_TRANG, "Huỷ"), "Huỷ hộp xoá");
    await bamBieuThuc(t, nutDong(KHOA_BON, "Xoá"), "Xoá của dòng khác");
    const khongCauCu = !(await t.tinh(`${HOP_TRANG}.innerText.includes("Chưa xoá được")`));
    await bamBieuThuc(t, nutTrong(HOP_TRANG, "Huỷ"), "Huỷ hộp xoá");
    await bamBieuThuc(t, nutDong(KHOA_XOA, "Xoá"), "Xoá của dòng");
    // 403: câu về quyền, hộp còn mở.
    await t.tinh(`window.__chanXoa = "403"; true`);
    await bamBieuThuc(t, nutTrong(HOP_TRANG, "Xoá"), "Xoá trong hộp");
    const cau403 = (await coHop(t)) && (await t.tinh(`${HOP_TRANG}.innerText.includes("Chỉ quản trị sàn xoá được cột đã nhớ")`));
    // Đang gửi: hai nút khoá, Esc không đóng hộp; nhả 500 thì câu lỗi hiện trong hộp đang mở.
    await t.tinh(`window.__chanXoa = "treo"; window.__nhaXoa = undefined; true`);
    await bamBieuThuc(t, nutTrong(HOP_TRANG, "Xoá"), "Xoá trong hộp");
    const haiNutKhoa = await t.tinh(`!!${nutTrong(HOP_TRANG, "Xoá")}?.disabled && !!${nutTrong(HOP_TRANG, "Huỷ")}?.disabled`);
    await esc(t);
    const escKhongDong = await coHop(t);
    await t.tinh(`window.__nhaXoa?.(); true`);
    await ngu(700);
    const sauTreoCoCau = (await coHop(t)) && (await t.tinh(`${HOP_TRANG}.innerText.includes("Chưa xoá được")`));
    // Đối chứng dương: bỏ chặn, xoá thật tới máy chủ.
    await t.tinh(`window.__chanXoa = undefined; true`);
    await bamBieuThuc(t, nutTrong(HOP_TRANG, "Xoá"), "Xoá trong hộp");
    await t.cho(`!${HOP_TRANG} && !${dongMau(KHOA_XOA)}`, 15000).catch(() => {});
    const hopDong = !(await coHop(t));
    const dongMat = !(await coDong(t, KHOA_XOA));
    const soGhiXoa = (await dongSoMau(KHOA_XOA))?.action === "delete";
    // 404 thật: dòng bị xoá ở chỗ khác lúc màn còn mở.
    await bamBieuThuc(t, nutDong(KHOA_NAM, "Xoá"), "Xoá của dòng năm");
    await db.query("insert into import_templates (company_id, header_key, action, edited_by) values ($1, $2, 'delete', $3)", [SAN, KHOA_NAM, phien.nguoi.qt]);
    await bamBieuThuc(t, nutTrong(HOP_TRANG, "Xoá"), "Xoá trong hộp");
    await t.cho(`!${dongMau(KHOA_NAM)}`, 15000).catch(() => {});
    const cau404 = (await coHop(t)) && (await t.tinh(`${HOP_TRANG}.innerText.includes("Cột này đã bị xoá trước đó")`));
    const dong404Mat = !(await coDong(t, KHOA_NAM));
    await dong(t);
    const phu = { khongCauCu, cau403, haiNutKhoa, escKhongDong, sauTreoCoCau, hopDong, dongMat, soGhiXoa, cau404, dong404Mat };
    return { ...kq, ...phu, dat: [kq.loi500, kq.mang].every((x) => x.hopMo && x.coCauLoi && x.dongCon) && Object.values(phu).every(Boolean) };
  },
  async "sua-hong"() {
    await napMau();
    const dem = async () => (await db.query("select count(*)::int n from import_templates where company_id = $1 and header_key = $2", [SAN, KHOA_QD])).rows[0].n;
    const truoc = await dem();
    const t = await manMau();
    await t.tinh(`window.__chanSua = "500"; true`);
    await bamBieuThuc(t, nutDong(KHOA_QD, "Sửa"), "Sửa của dòng");
    await t.tinh(`(() => { const o = ${HOP_THUONG}.querySelector("textarea"); o.focus(); o.setSelectionRange(o.value.length, o.value.length); return true; })()`);
    await t.gui("Input.insertText", { text: "\nB → [Mẫu] Toà B" });
    await bamBieuThuc(t, nutTrong(HOP_THUONG, "Lưu"), "Lưu trong hộp sửa");
    await ngu(600);
    const hopMo = await coHop(t, HOP_THUONG);
    const coCauLoi = hopMo && (await t.tinh(`${HOP_THUONG}.innerText.includes("Chưa lưu được")`));
    await dong(t);
    const t2 = await manMau();
    const dongNhuCu = (await t2.tinh(`${dongMau(KHOA_QD)}.innerText.includes("1 giá trị")`)) && (await dem()) === truoc;
    // Đối chứng dương: bỏ chặn, cùng bản sửa lưu được và máy chủ giữ giá trị mới.
    await bamBieuThuc(t2, nutDong(KHOA_QD, "Sửa"), "Sửa của dòng");
    await t2.tinh(`(() => { const o = ${HOP_THUONG}.querySelector("textarea"); o.focus(); o.setSelectionRange(o.value.length, o.value.length); return true; })()`);
    await t2.gui("Input.insertText", { text: "\nB → [Mẫu] Toà B" });
    await bamBieuThuc(t2, nutTrong(HOP_THUONG, "Lưu"), "Lưu trong hộp sửa");
    await t2.cho(`!${HOP_THUONG}`, 15000).catch(() => {});
    const moi = (await dongSoMau(KHOA_QD))?.value_map ?? {};
    const boChanLuuDuoc = coi(Object.entries(moi).sort()) === coi([["A", "[Mẫu] Toà A"], ["B", "[Mẫu] Toà B"]]);
    await dong(t2);
    return { hopMo, coCauLoi, dongNhuCu, boChanLuuDuoc, dat: hopMo && coCauLoi && dongNhuCu && boChanLuuDuoc };
  },
  async "kho-375"() {
    await napMau();
    const rong = await manMau();
    const docRong = await rong.tinh(`Object.fromEntries([...document.querySelectorAll("tbody tr")].map((r) => [r.cells[0].firstChild.textContent.trim(), [r.cells[1].innerText.trim(), r.cells[2].innerText.trim(), r.cells[3].innerText.trim()]]))`);
    await dong(rong);
    const t = await manMau(375, 812);
    const khung = await khungKhongTran(t);
    const nutTrongManDat = await t.tinh(`(() => { const nut = [...document.querySelectorAll("tbody tr button")]; return nut.length >= 12 && nut.every((b) => { const x = b.getBoundingClientRect(); const c = ${BANG}.getBoundingClientRect(); return x.left >= c.left - 0.5 && x.right <= Math.min(c.right, innerWidth) + 0.5; }); })()`);
    const doDongPhu = `(() => { const rong = ${coi(docRong)}; const dong = [...document.querySelectorAll("tbody tr")]; return dong.length >= 6 && dong.every((r) => { const giaTri = rong[r.cells[0].firstChild.textContent.trim()]; const p = r.querySelector("[data-dong-phu]"); if (!giaTri || !p) return false; const b = p.getBoundingClientRect(); const h = r.getBoundingClientRect(); const [truong, quyDoi, nguon] = giaTri; const chu = p.innerText; return b.width > 0 && b.height > 0 && b.top >= h.top - 0.5 && b.bottom <= h.bottom + 0.5 && chu.includes("Ghép vào " + truong) && chu.includes(nguon) && (quyDoi === "—" ? !chu.includes("giá trị") : chu.includes(quyDoi)); }); })()`;
    const docDuocGhepVaoNguon = await t.tinh(doDongPhu);
    const dongPhuChungDuong = await t.tinh(`(() => { const ds = [...document.querySelectorAll("[data-dong-phu]")]; ds.forEach((p) => { p.style.display = "none"; }); const kq = ${doDongPhu}; ds.forEach((p) => { p.style.display = ""; }); return ds.length >= 6 && kq === false; })()`);
    const docDuocQuyDoi = await t.tinh(`!!${dongMau(KHOA_QD)}.querySelector("[data-dong-phu]")?.innerText.includes("1 giá trị") && !!${dongMau(KHOA_DAI)}.querySelector("[data-dong-phu]")?.innerText.includes("2 giá trị")`);
    await bamBieuThuc(t, nutDong(KHOA_DAI, "Xoá"), "Xoá của dòng dài");
    const hopXoaTrongMan = await hopTrongMan(t, HOP_TRANG);
    await bamBieuThuc(t, nutTrong(HOP_TRANG, "Huỷ"), "Huỷ hộp xoá");
    await bamBieuThuc(t, nutDong(KHOA_DAI, "Sửa"), "Sửa của dòng dài");
    const hopSuaTrongMan = await hopTrongMan(t, HOP_THUONG);
    await bamBieuThuc(t, nutTrong(HOP_THUONG, "Huỷ"), "Huỷ hộp sửa");
    const dongChungDuong = await t.tinh(`(() => { const c = ${BANG}; const d = document.createElement("div"); d.style.width = "2000px"; d.style.height = "1px"; c.appendChild(d); const tran = c.scrollWidth > c.clientWidth; d.remove(); return tran; })()`);
    await dong(t);
    return { khungKhongTran: khung, nutTrongMan: nutTrongManDat, docDuocGhepVaoNguon, docDuocQuyDoi, hopXoaTrongMan, hopSuaTrongMan, dongChungDuong, dongPhuChungDuong, dat: khung && nutTrongManDat && docDuocGhepVaoNguon && docDuocQuyDoi && hopXoaTrongMan && hopSuaTrongMan && dongChungDuong && dongPhuChungDuong };
  },
  async "kho-rong"() {
    await napMau();
    const kq = {};
    for (const rong of [768, 1024, 1440]) {
      const t = await manMau(rong, 900);
      kq[rong] = { soCot: await t.tinh(`[...document.querySelectorAll("thead th")].filter((c) => c.offsetParent !== null).length`), khongTran: await khungKhongTran(t), dongPhuAn: await t.tinh(`(() => { const ds = [...document.querySelectorAll("[data-dong-phu]")]; return ds.length === 0 || ds.every((p) => p.offsetParent === null); })()`) };
      await dong(t);
    }
    const dung = (x, n) => x.soCot === n && x.khongTran && x.dongPhuAn === (n === 5);
    return { ...kq, dat: dung(kq[768], 2) && dung(kq[1024], 5) && dung(kq[1440], 5) };
  },
  async "nhan-ti-le"() {
    const axe = readFileSync(AXE, "utf8");
    const kq = {};
    for (const [rong, cao] of [[1440, 900], [375, 812]]) {
      const t = await mo("/settings/fees", "[data-slot=number-field-input]", rong, cao);
      await t.tinh(`${axe}; true`);
      const dem = () => t.tinh(`axe.run(document, { runOnly: ["label"] }).then((r) => r.violations.reduce((n, v) => n + v.nodes.length, 0))`);
      const loiLabel = await dem();
      const tenO = await t.tinh(`(() => { axe.setup(document); const ten = axe.commons.text.accessibleTextVirtual(axe.utils.getNodeFromTree(document.querySelector("[data-slot=number-field-input]"))); axe.teardown(); return ten; })()`);
      const dongChungDuong = await (async () => {
        await t.tinh(`(() => { const o = document.createElement("input"); o.id = "__o-khong-nhan"; document.body.appendChild(o); return true; })()`);
        const n = await dem();
        await t.tinh(`document.getElementById("__o-khong-nhan").remove(); true`);
        return n === loiLabel + 1;
      })();
      const cu = await t.tinh(`document.querySelector("[data-slot=number-field-input]").value`);
      const moi = cu === "1,2" ? "1,3" : "1,2";
      await t.tinh(`(() => { const o = document.querySelector("[data-slot=number-field-input]"); o.focus(); o.select(); return true; })()`);
      await t.gui("Input.insertText", { text: moi });
      for (const type of ["keyDown", "keyUp"]) await t.gui("Input.dispatchKeyEvent", { type, key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      await ngu(500);
      const soHienDung = (await t.tinh(`document.querySelector("[data-slot=number-field-input]").value`)) === moi;
      const luuBamDuoc = await luuMo(t);
      kq[rong] = { loiLabel, tenO, dongChungDuong, soHienDung, luuBamDuoc };
      await dong(t);
    }
    return { ...kq, dat: Object.values(kq).every((x) => x.loiLabel === 0 && x.tenO === "Tỉ lệ môi giới (%)" && x.dongChungDuong && x.soHienDung && x.luuBamDuoc) };
  },
};

async function dungMan() {
  mkdirSync(ANH, { recursive: true });
  const [a, b] = await napNhan(2);
  let t = await manNhan();
  await goNhan(t, a.label);
  await chuyen(t, "mac-dinh");
  await goNhan(t, b.label);
  await giu(t);
  await chup(t, "giu-nhan");
  await dong(t);
  await napMau();
  t = await manMau();
  await chup(t, "mau-1440");
  await t.tinh(`window.__chanXoa = "500"; true`);
  await bamBieuThuc(t, nutDong(KHOA_XOA, "Xoá"), "Xoá của dòng");
  await bamBieuThuc(t, nutTrong(HOP_TRANG, "Xoá"), "Xoá trong hộp");
  await ngu(600);
  await chup(t, "xoa-loi");
  await dong(t);
  t = await manMau(375, 812);
  await chup(t, "mau-375");
  await bamBieuThuc(t, nutDong(KHOA_DAI, "Xoá"), "Xoá của dòng dài");
  await chup(t, "mau-375-hop");
  await dong(t);
  console.log(JSON.stringify({ anh: ["giu-nhan", "xoa-loi", "mau-375", "mau-375-hop", "mau-1440"].map((x) => `_acceptance/va-cai-dat-mat-viec/evidence/${x}.png`) }));
}

let doLai = [];
try {
  if (DUNG_MAN) await dungMan();
  else
    for (const [ten, chay] of Object.entries(CA).filter(([ten]) => !CHON || CHON.includes(ten))) {
      let kq;
      try {
        kq = await chay();
      } catch (e) {
        kq = { dat: false, loi: String(e.message ?? e).slice(0, 300) };
      }
      console.log(JSON.stringify({ ca: ten, ...kq }));
      if (!kq.dat) doLai.push(ten);
    }
} finally {
  await donNhan().catch(() => {});
  await donMau().catch(() => {});
  await db.end();
  // Không await: Chrome đã unref nên vòng sự kiện cạn trước lúc nó thoát và Node thoát 13; bộ tắt lúc thoát của cdp.mjs lo phần còn lại.
  chrome.dong();
  if (!GIU_MAY) spawnSync(process.execPath, [DUNG, "--tat"], { cwd: GOC, stdio: "ignore" });
}
if (doLai.length) console.error(`đỏ: ${doLai.join(", ")}`);
process.exit(doLai.length ? 1 : 0);
