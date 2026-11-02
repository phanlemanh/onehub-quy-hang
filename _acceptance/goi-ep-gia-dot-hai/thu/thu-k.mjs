// Bước K của E8 trên một Chrome riêng (không chung tab với bài chấm khác): phím K thật (CDP) trên chế độ ép giá → về /today,
// không ghi gì. In URL theo thời gian, phiên bản và số sự kiện trước/sau; thoát 1 khi URL cuối không phải /today hay số đổi.
//   QH_B_URL=http://localhost:3485 node --env-file=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/thu-k.mjs <mã hồ sơ>
//   QUA_HOM_NAY=1 … — mở chế độ cuộc gọi bằng nút «Ghi cuộc gọi» trên dòng căn ở Hôm nay (chuột thật) thay vì mở thẳng.
import { readFileSync } from "node:fs";
import path from "node:path";
import { GOC, moChrome } from "../../bang-hang-kieu-sheet/thu/cdp.mjs";

const [hang] = process.argv.slice(2);
const phien = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/goi-ep-gia-dot-hai/phien-dau-chu-1.json"), "utf8"));
const DEM = `fetch("/api/v1/listings/${hang}").then((r) => r.json()).then((b) => ({ version: b.version, events: b.events.length }))`;
const chrome = await moChrome();
try {
  const t = await chrome.trang(1440, 1000);
  await t.datCookie([`${phien.name}=${phien.value}`, `qh_san=${phien.qh_san}`]);
  if (process.env.QUA_HOM_NAY) {
    // Đi đúng đường người dùng: Hôm nay → nút «Ghi cuộc gọi» trên dòng căn (chuột thật).
    await t.di("/today?nhom=price_adjustment");
    const sel = `[...document.querySelectorAll('a[href="/units/call?hang=${hang}"]')][0]`;
    await t.cho(`${sel} !== undefined`);
    await t.tinh(`${sel}.scrollIntoView({ block: "center" }), true`);
    const { x, y } = await t.tinh(`(() => { const r = ${sel}.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
    for (const type of ["mousePressed", "mouseReleased"]) await t.gui("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  } else await t.di(`/units/call?hang=${hang}`);
  await t.cho(`document.querySelector('[aria-label="Kết quả cuộc gọi"]') !== null`);
  const truoc = await t.tinh(DEM);
  console.log("trước K", JSON.stringify(truoc));
  await t.gui("Input.dispatchKeyEvent", { type: "keyDown", key: "k", code: "KeyK", windowsVirtualKeyCode: 75, text: "k" });
  await t.gui("Input.dispatchKeyEvent", { type: "keyUp", key: "k", code: "KeyK", windowsVirtualKeyCode: 75 });
  let cuoi = "";
  for (const ms of [500, 1500, 3000, 6000]) {
    await new Promise((r) => setTimeout(r, ms));
    cuoi = await t.tinh("location.pathname + location.search");
    console.log(ms, cuoi);
  }
  const sau = await t.tinh(DEM);
  console.log("sau K", JSON.stringify(sau));
  const dat = cuoi === "/today" && sau.version === truoc.version && sau.events === truoc.events;
  console.log(dat ? "đạt: K về /today, không ghi gì" : "SAI");
  if (!dat) process.exitCode = 1;
} finally {
  chrome.dong();
}
