// Chụp các khung của eval ui-check E9 (hàng can-nhap-len-bang-chung) trên máy dev dãy G (3493) đã bật bằng thu/dung.mjs.
//   node _acceptance/can-nhap-len-bang-chung/thu/chup.mjs --kho 1440|375 [--ra <thư mục>]
// Dựng một sàn mới: đầu chủ A (dau-chu-1) nhập qua màn Nhập một tệp hai dòng «Đang bán» thiếu pháp lý, tình trạng sử dụng, có
// ngày xác nhận hôm nay; trưởng nhóm nhập hộ một dòng giao đầu chủ B (dau-chu-2). Khung: ket-qua-nhap, hom-nay, ho-so,
// bang-hang (A) và hom-nay-b (B). Mỗi khung in một dòng JSON và chụp E9-<khung>-<khổ>.png. Không dữ liệu thật.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

process.env.QH_B_URL = "http://localhost:3493";
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { values: a } = parseArgs({ options: { kho: { type: "string", default: "1440" }, ra: { type: "string" } } });
const RA = a.ra ?? path.join(GOC, "_acceptance/can-nhap-len-bang-chung/evidence");
const KHO = Number(a.kho);
const URL_GOC = "http://localhost:3493";
const [A_EMAIL, B_EMAIL, TN_EMAIL] = ["dau-chu-1", "dau-chu-2", "truong-nhom"].map((x) => `${x}@mau.quy-hang.test`);
mkdirSync(RA, { recursive: true });

const sql = (q) => execFileSync("docker", ["exec", "quy-hang-db-dkn-G", "psql", "-U", "postgres", "-tAc", q]).toString().trim();
const tsx = (tep, ...args) =>
  execFileSync("node", ["--import", "tsx", path.join(GOC, "_acceptance/can-nhap-len-bang-chung/thu", tep), ...args], {
    cwd: path.join(GOC, "apps/web"),
    env: { ...process.env, TSX_TSCONFIG_PATH: "tsconfig.test.json" },
  })
    .toString()
    .trim();
const idCua = (email) => sql(`select id from identity."user" where email = '${email}'`);
let tenSan = "";
function sanMoi() {
  tenSan = `[Sàn thử nhập ${KHO} ${Date.now()}]`;
  const id = sql(`insert into companies (name) values ('${tenSan}') returning id`).split("\n")[0];
  for (const [email, vai] of [[A_EMAIL, "listing_agent"], [B_EMAIL, "listing_agent"], [TN_EMAIL, "team_lead"]])
    sql(`insert into company_members (company_id, user_id, roles) select '${id}', id, '{${vai}}' from identity."user" where email = '${email}'`);
  return id;
}
function cookieCua(email, san) {
  const j = JSON.parse(execFileSync("node", [path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs"), "--phien", email], { cwd: GOC }).toString());
  return [...j.cookie.filter((c) => c.name !== "qh_san").map((c) => `${c.name}=${c.value}`), `qh_san=${san}`];
}

const chrome = await moChrome();
const t = await chrome.trang(KHO, KHO < 768 ? 812 : 900);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const chu = () => t.tinh("document.body.innerText");
const thay = (s, han = 180000) => t.cho(`document.body.innerText.includes(${JSON.stringify(s)})`, han);
const ghiNhan = (khung, x) => console.log(JSON.stringify({ khung, kho: KHO, ...x }));
const tran = () => t.tinh(`document.documentElement.scrollWidth > window.innerWidth + 1`);
const bam = (nhan) =>
  t.tinh(`(() => { const b = [...document.querySelectorAll("button, a")].find((x) => x.textContent.trim().startsWith(${JSON.stringify(nhan)}) && !x.disabled); if (!b) return false; b.click(); return true; })()`);
async function chup(ten) {
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); window.scrollTo(0, 0); return true; })()`);
  await ngu(500);
  writeFileSync(path.join(RA, `E9-${ten}-${KHO}.png`), await t.chup());
}
/** Chữ của trang với gạch nối chuẩn hoá (thẻ điện thoại có thể dùng gạch nối khác). */
const CHU_TRANG = `document.body.innerText.replace(/[\\u2010-\\u2015\\u2212]/g, "-")`;
/**
 * Một kiểu chờ cho mọi khung (S4 lượt 2, chủ kho chọn «đổi cách chờ»): mở `duong`, chờ tới khi ĐÚNG dữ liệu khung cần đọc
 * có trên màn — không chờ tiêu đề hay khung trang — quá 2 phút thì tải lại trang một lần rồi chờ thêm 3 phút. Hết giờ là
 * lỗi có tên, không chụp khung chờ tải.
 */
async function moVaCho(duong, dieuKien, ten) {
  await t.di(duong);
  await t.cho(dieuKien, 120000).catch(async () => {
    await t.di(duong);
    await t.cho(dieuKien, 180000).catch(() => {
      throw new Error(`khung ${ten}: dữ liệu chưa hiện sau khi tải lại — ${dieuKien}`);
    });
  });
  await ngu(1000);
}
const coMa = (ma) => `${CHU_TRANG}.includes(${JSON.stringify(ma)})`;
/** Vào sàn qua màn chọn sàn như người dùng, rồi tới `duong`. */
async function vaoSan(ck, duong) {
  await t.datCookie(ck.filter((c) => !c.startsWith("qh_san=")));
  await t.di("/select-company");
  await thay(tenSan, 60000);
  await ngu(2500);
  const ok = await t.tinh(`(() => { const b = [...document.querySelectorAll("button, a, [role=button]")].find((x) => x.textContent.includes(${JSON.stringify(tenSan)})); b?.click(); return !!b; })()`);
  if (!ok) throw new Error("không thấy nút sàn ở màn chọn sàn");
  await t.cho(`location.pathname !== "/select-company"`, 60000);
  await ngu(1500);
  await t.di(duong);
}
/** Hôm nay: nhóm chứa mã căn `ma` (tiêu đề nhóm gần nhất phía trên dòng có mã). */
const NHOM = ["Lead mới", "Nên gọi điều chỉnh giá", "Cần gọi lại", "Thiếu thông tin", "Bổ sung ảnh", "Mới đổi"];
/** Hôm nay: nhóm của căn mã `ma` — đi các nút chữ theo thứ tự trang (bảng ở máy tính, thẻ ở điện thoại), nhãn nhóm gần nhất phía trên. */
const nhomCua = (ma) =>
  t.tinh(`(() => { const NHOM = ${JSON.stringify(NHOM)}; const w = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT); let nhom = null; for (let n = w.nextNode(); n; n = w.nextNode()) { const c = n.textContent.trim(); if (NHOM.includes(c)) nhom = c; else if (c.includes(${JSON.stringify(ma)})) return nhom; } return null; })()`);

try {
  const san = sanMoi();
  const stamp = String(Date.now()).slice(-3);
  const ma = [`A-0${(Number(stamp) % 9) + 1}.05`, `A-0${(Number(stamp) % 9) + 1}.06`];
  const tep = path.join(RA, `.can-nhap-${KHO}.xlsx`);
  tsx("sinh-tep.mts", tep, ...ma);

  // Khung 1 — kết quả lần nhập của A qua màn Nhập.
  await vaoSan(cookieCua(A_EMAIL, san), "/imports/new");
  await t.cho(`!!document.querySelector('input[type=file]') && !document.querySelector('input[type=file]').disabled`, 180000);
  const { root } = await t.gui("DOM.getDocument");
  const { nodeId } = await t.gui("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await t.gui("DOM.setFileInputFiles", { nodeId, files: [tep] });
  await thay(`${path.basename(tep)} ·`);
  for (const cho of ["Cột trong tệp", "Từng ô sẽ ghi gì", "Máy chủ đã xem thử"]) {
    await bam("Tiếp");
    await thay(cho);
  }
  const bangTrung = await t.tinh(`document.querySelector('[aria-label="Từng dòng thành gì"]')?.innerText ?? ""`);
  // Huy hiệu «Thành» của từng dòng (biến thể theo hành động, không theo lý do).
  const badgeTrung = await t.tinh(`[...document.querySelectorAll('[aria-label="Từng dòng thành gì"] tbody [data-slot=badge]')].map((b) => ({ chu: b.textContent.trim(), bienThe: b.getAttribute("data-variant") ?? b.className.match(/(success|info|warning|destructive|secondary)[-a-z]*/)?.[0] ?? null }))`);
  await bam("Tiếp");
  await thay("căn mới, cập nhật");
  await bam("Ghi vào Quỹ hàng");
  await thay("Đã ghi vào Quỹ hàng");
  // Khối báo sau ghi là Alert của TrangThai: tông lỗi = role «alert» hay biến thể destructive; tông thường = role «status».
  const TONG_LOI = `(n) => n.getAttribute("role") === "alert" || /destructive/.test(n.className) || n.getAttribute("data-variant") === "destructive"`;
  const thongBao = await t.tinh(`(() => { const n = [...document.querySelectorAll("[data-slot=alert], [role=status], [role=alert]")].find((x) => x.textContent.includes("Đã ghi vào Quỹ hàng")); return n ? { chu: n.innerText, vai: n.getAttribute("role"), loi: (${TONG_LOI})(n) } : null; })()`);
  // Đối chứng dương cho bộ dò tông: một khối giả mang role «alert» phải bị dò ra là tông lỗi.
  const doiChung = await t.tinh(`(() => { const g = document.createElement("div"); g.setAttribute("role", "alert"); const kq = (${TONG_LOI})(g); return kq; })()`);
  ghiNhan("ket-qua-nhap", {
    lyDoDong: bangTrung.match(/lên Đang bán — còn thiếu[^\n\t]*/g) ?? [],
    coMaTho: /legalStatus|occupantType/.test(bangTrung),
    thongBao: thongBao?.chu ?? null,
    demDangBan: thongBao?.chu.match(/(\d+) căn lên Đang bán/)?.[1] ?? null,
    coChuaDu: /\d+ căn ở Chưa đủ để rao/.test(thongBao?.chu ?? ""),
    vaiThongBao: thongBao?.vai ?? null,
    tongLoi: thongBao?.loi ?? null,
    doiChungTongLoi: doiChung,
    huyHieuDong: badgeTrung,
    tranNgang: await tran(),
  });
  await chup("ket-qua-nhap");

  // Khung 2 — Hôm nay của A.
  await moVaCho("/today", `${coMa(ma[0])} && ${coMa(ma[1])}`, "hom-nay");
  ghiNhan("hom-nay", { nhom: [await nhomCua(ma[0]), await nhomCua(ma[1])], tranNgang: await tran() });
  await chup("hom-nay");

  // Khung 3 — hồ sơ căn đầu.
  await moVaCho(`/units/${encodeURIComponent(ma[0])}`, `!!document.querySelector('[data-slot=ho-so-can] [data-muc=muc-du]')`, "ho-so");
  const hoSo = await t.tinh(`(() => { const h = document.querySelector('[data-slot=ho-so-can]'); const m = h.querySelector('[data-muc=muc-du]'); const TT = ["Chưa đủ để rao", "Đang bán", "Đang giao dịch", "Tạm ngừng", "Đã bán", "Ngừng bán"]; const b = [...h.querySelectorAll('[data-slot=badge]')].map((x) => x.textContent.trim()).find((x) => TT.includes(x)); return { trangThai: b ?? null, mucDu: m.innerText }; })()`);
  const thieu = hoSo.mucDu.match(/thiếu ([^\n]*)/)?.[1] ?? "";
  ghiNhan("ho-so", { trangThai: hoSo.trangThai, mucDu: hoSo.mucDu.match(/\b\d\/[5-6]\b/)?.[0] ?? null, dongThieu: thieu, thieuPhapLy: /pháp lý/i.test(thieu), thieuTinhTrang: /tình trạng sử dụng/i.test(thieu) });
  await chup("ho-so");

  // Khung 4 — Bảng hàng.
  // Điện thoại: Bảng hàng là thẻ (khuôn bang-hang) — vẫn chờ đúng mã căn hiện trên thẻ.
  await moVaCho("/inventory", coMa(ma[0]), "bang-hang");
  const dongBang = await t.tinh(`(() => { const d = [...document.querySelectorAll("[role=row], tr, article, li")].find((x) => x.innerText.includes(${JSON.stringify(ma[0])})); return d ? d.innerText : null; })()`);
  ghiNhan(
    "bang-hang",
    KHO < 768
      ? { trangThai: "không có ở thẻ điện thoại (khuôn bang-hang)", coCan: await t.tinh(coMa(ma[0])), tranNgang: await tran() }
      : { dangBan: (dongBang ?? "").includes("Đang bán"), tranNgang: await tran() },
  );
  await chup("bang-hang");

  // Khung 5 — trưởng nhóm nhập hộ một dòng giao B; Hôm nay của B.
  const maB = `A-0${(Number(stamp) % 9) + 1}.04`;
  const ckTn = cookieCua(TN_EMAIL, san).join("; ");
  // Máy dev có lúc trả lỗi tạm khi đang dựng lại (manifest rỗng): thử lại tối đa ba lần.
  let idB = null;
  for (let lan = 1; !idB; lan++) {
    try {
      idB = tsx("nhap-ho.mts", URL_GOC, ckTn, idCua(B_EMAIL), maB);
    } catch (e) {
      if (lan >= 3) throw e;
      await ngu(10000);
    }
  }
  await vaoSan(cookieCua(B_EMAIL, san), "/today");
  await moVaCho("/today", coMa(maB), "hom-nay-b");
  ghiNhan("hom-nay-b", { idB, nhom: await nhomCua(maB), khongThayCuaA: !(await chu()).includes(ma[0]), tranNgang: await tran() });
  await chup("hom-nay-b");
} finally {
  await chrome.dong();
}
