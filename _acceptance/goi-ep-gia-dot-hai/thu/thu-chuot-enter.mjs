// Thử tay bằng chuột và phím THẬT của trình duyệt (CDP Input — sự kiện tin cậy, nút nhận hành vi mặc định):
//   ca 1: bấm chuột «Giữ giá» rồi Enter → đúng một owner_confirmed mới, «Giữ giá» vẫn được chọn;
//   ca 2: bấm chuột «Giữ giá», mũi tên phải sang lựa chọn kế, Enter → không owner_confirmed mới, lựa chọn kế được chọn.
// Mỗi ca một hồ sơ riêng (đang bán, của dau-chu-1):
//   QH_B_URL=http://localhost:3485 node --env-file=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/thu-chuot-enter.mjs <hồ sơ ca 1> <hồ sơ ca 2>
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GOC, moChrome } from "../../bang-hang-kieu-sheet/thu/cdp.mjs";

const [ca1, ca2] = process.argv.slice(2);
if (!ca1 || !ca2) throw new Error("cần hai mã hồ sơ");
const TEP_PHIEN = path.join(GOC, ".acceptance-runs/goi-ep-gia-dot-hai/phien-dau-chu-1.json");
if (!existsSync(TEP_PHIEN)) {
  const ra = execFileSync(process.execPath, ["--env-file=.env.local", "--import", "tsx", "_acceptance/cuoc-goi-khai-thac/thu/phien.mts", "dau-chu-1@mau.quy-hang.test"], { cwd: GOC, encoding: "utf8" });
  mkdirSync(path.dirname(TEP_PHIEN), { recursive: true });
  writeFileSync(TEP_PHIEN, ra.trim().split("\n").at(-1));
}
const phien = JSON.parse(readFileSync(TEP_PHIEN, "utf8"));
const NUT = `[...document.querySelectorAll('[aria-label="Kết quả cuộc gọi"] [data-slot="toggle-group-item"]')]`;
const demXacNhan = (hang) => `fetch("/api/v1/listings/${hang}").then((r) => r.json()).then((b) => b.events.filter((e) => e.type === "owner_confirmed").length)`;
const nghi = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = await moChrome();
let sai = 0;
async function mo(hang) {
  const t = await chrome.trang(1440, 1000);
  await t.datCookie([`${phien.name}=${phien.value}`, `qh_san=${phien.qh_san}`]);
  await t.di(`/units/call?hang=${hang}`);
  await t.cho(`${NUT}.length === 4`);
  return t;
}
async function bamChuot(t, chu) {
  const { x, y } = await t.tinh(`(() => { const r = ${NUT}.find((b) => b.innerText.includes(${JSON.stringify(chu)})).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  for (const type of ["mousePressed", "mouseReleased"]) await t.gui("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
}
async function phim(t, key, code, keyCode) {
  await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: keyCode, ...(key === "Enter" && { text: "\r" }) });
  await t.gui("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode });
}
const daChon = (t) => t.tinh(`${NUT}.filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.innerText.replace(/\\s+/g, " ").trim())`);
function kiem(dung, cau) {
  console.log(`${dung ? "đạt" : "SAI"}: ${cau}`);
  if (!dung) sai++;
}

try {
  {
    const t = await mo(ca1);
    const truoc = await t.tinh(demXacNhan(ca1));
    await bamChuot(t, "Giữ giá");
    await phim(t, "Enter", "Enter", 13);
    const daGhi = await t.cho(`document.body.innerText.includes("Đã ghi: Còn · giữ giá")`, 10000).then(() => true, () => false);
    kiem(daGhi, "ca 1 — màn báo «Đã ghi: Còn · giữ giá»");
    // Lần ghi đi qua hàng đợi trên máy: chờ chỉ báo đồng bộ hết thay đổi chờ gửi rồi mới đếm trên máy chủ.
    await t.cho(`(${demXacNhan(ca1)}).then((n) => n > ${truoc})`, 20000).catch(() => undefined);
    const sau = await t.tinh(demXacNhan(ca1));
    kiem(sau - truoc === 1, `ca 1 — owner_confirmed tăng đúng 1 (${truoc} → ${sau})`);
    const chon = await daChon(t);
    kiem(chon.length === 1 && chon[0].includes("Giữ giá"), `ca 1 — «Giữ giá» vẫn được chọn (${JSON.stringify(chon)})`);
  }
  {
    const t = await mo(ca2);
    const truoc = await t.tinh(demXacNhan(ca2));
    await bamChuot(t, "Giữ giá");
    await phim(t, "ArrowRight", "ArrowRight", 39);
    const dang = await t.tinh(`document.activeElement.innerText.replace(/\\s+/g, " ").trim()`);
    await phim(t, "Enter", "Enter", 13);
    await nghi(3000);
    const sau = await t.tinh(demXacNhan(ca2));
    kiem(sau === truoc, `ca 2 — không owner_confirmed mới (${truoc} → ${sau})`);
    const chon = await daChon(t);
    kiem(chon.length === 1 && chon[0] === dang && !dang.includes("Giữ giá"), `ca 2 — lựa chọn kế «${dang}» được chọn (${JSON.stringify(chon)})`);
  }
} finally {
  chrome.dong();
}
process.exit(sai ? 1 : 0);
