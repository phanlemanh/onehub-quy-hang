// Bài đo của hàng vá va-bang-hang-cuon-so-lon: Bảng hàng sàn 5.000 căn mở được, không sập (React #185), ở từng khổ màn.
// Bản build như ADR-0004, cổng 3491, trên bộ thử dãy B (Postgres 5561, sàn «[Mẫu] Sàn đo cuộn» 5.000 căn, phiên đã giữ của
// do-cuon@mau.quy-hang.test — dựng bằng _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs --nhan 5000).
//   node kiem-cuon.mjs --kho 1366x768 [--kho 1920x1080 --kho 375x812] [--khong-build] [--kem-e11]
// --kem-e11: dò xong thì tắt máy chủ rồi chạy máy đo cuộn E11 của bang-hang-kieu-sheet (do-cuon.mjs --khong-build) trên
// CHÍNH bản build này, tuần tự — hai bài cùng cổng 3491 và cùng thư mục build, chạy song song sẽ giẫm nhau. Vòng này chỉ
// đòi vế CHỨC NĂNG: cả ba lượt cuộn tới «dòng cuối thấy 5000» (trang không sập giữa cuộn). Ngưỡng hiệu năng của E11 phụ
// thuộc tải máy (06/11, tải ~10: commit tốt 1414c1e7 trượt 2,9% còn nặng hơn bản sửa) — in ra kèm tải máy, không quyết.
// Khổ rộng ≥ 768: bảng phải hiện «/ 5000 căn». Khổ điện thoại: bảng thẻ (chỉ căn Đang bán, Đang giao dịch) phải hiện
// «<N> căn» với N đếm từ API cùng lượt (đáp án không viết tay). Cả hai: không màn
// «Không mở được màn này», không lỗi console mang «#185» hay «Maximum update depth». Mỗi khổ một dòng JSON.
// Thoát 0 = mọi khổ đạt · 1 = có khổ lệch · 2 = không chạy được (thiếu bộ thử, bản build không lên).
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, openSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DAY = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.resolve(DAY, "../../..");
const CONG = 3491;
const URL_GOC = `http://localhost:${CONG}`;
process.env.QH_B_URL = URL_GOC;
const SO_HANG = 5000;
const PHIEN = path.join(GOC, ".acceptance-runs/bang-hang-kieu-sheet/phien-do-cuon@mau.quy-hang.test.json");
const RA = path.join(GOC, ".acceptance-runs/va-bang-hang-cuon-so-lon");
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const khos = process.argv.flatMap((a, i) => (process.argv[i - 1] === "--kho" ? [a] : []));
if (!khos.length) {
  console.error("thiếu --kho <rộng>x<cao>");
  process.exit(2);
}
if (!existsSync(PHIEN)) {
  console.error(`thiếu bộ thử dãy B: không có phiên ${path.relative(GOC, PHIEN)} — chạy dung-b.mjs --nhan 5000`);
  process.exit(2);
}
mkdirSync(RA, { recursive: true });
const { moChrome } = await import(path.join(GOC, "_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs"));

if (!process.argv.includes("--khong-build")) execFileSync("npm", ["run", "build", "-w", "@quy-hang/web"], { cwd: GOC, stdio: ["ignore", "ignore", "inherit"] });
const nhatKy = openSync(path.join(RA, "web-build.log"), "a");
const mayChu = spawn(path.join(GOC, "node_modules/.bin/next"), ["start", "-p", String(CONG), "apps/web"], {
  cwd: GOC,
  env: {
    ...process.env,
    DATABASE_URL: "postgres://postgres:quyhang@localhost:5561/postgres",
    BETTER_AUTH_SECRET: "dev-b-chuoi-thu-khong-dung-o-ban-that",
    BETTER_AUTH_URL: URL_GOC,
    RESEND_API_KEY: "khoa-gia-ban-build-khong-gui",
    OWNER_PHONE_KEY: randomBytes(32).toString("base64"),
    MAIL_FROM: "khong-gui@mau.quy-hang.test",
  },
  stdio: ["ignore", nhatKy, nhatKy],
});
const tat = () => {
  try {
    process.kill(mayChu.pid);
  } catch {
    // đã thoát
  }
};
process.on("exit", tat);

let ket = [];
try {
  let len = false;
  for (let i = 0; i < 120 && !len; i++) {
    try {
      len = (await fetch(`${URL_GOC}/api/v1/health`)).ok;
    } catch {
      // chưa lên
    }
    if (!len) await ngu(1000);
  }
  if (!len) throw new Error(`bản build không lên ở cổng ${CONG}`);
  const cookie = JSON.parse(readFileSync(PHIEN, "utf8"));
  // Đối chứng dương: sàn đo cuộn thật sự có đủ 5.000 căn qua API.
  const r = await fetch(`${URL_GOC}/api/v1/listings`, { headers: { cookie: cookie.join("; ") } });
  const ds = r.ok ? await r.json() : [];
  const so = r.ok ? ds.length : -1;
  const soThe = ds.filter((l) => l.standardStatus === "Active" || l.standardStatus === "Pending").length;
  if (so !== SO_HANG) throw new Error(`đối chứng dương hỏng: sàn đo cuộn có ${so} căn qua API, cần ${SO_HANG}`);

  const chrome = await moChrome();
  try {
    for (const kho of khos) {
      const [w, h] = kho.split("x").map(Number);
      const dienThoai = w < 768;
      const t = await chrome.trang(w, h);
      await t.gui("Page.addScriptToEvaluateOnNewDocument", {
        source: "window.__loi=[];const e0=console.error;console.error=(...a)=>{try{window.__loi.push(a.map(x=>x&&x.message?x.message:String(x)).join(' ').slice(0,300))}catch{};e0(...a)};window.addEventListener('error',e=>window.__loi.push(String(e.message)));",
      });
      await t.datCookie(cookie);
      await t.di("/inventory");
      const dich = dienThoai ? new RegExp(`(^|\\n)${soThe} căn`) : new RegExp(`/ ${SO_HANG} căn`);
      let txt = "";
      let thay = false;
      for (let i = 0; i < 90 && !thay; i++) {
        await ngu(1000);
        txt = await t.tinh("document.body.innerText").catch(() => "");
        thay = dich.test(txt) || txt.includes("Không mở được màn này");
      }
      await ngu(1500);
      txt = await t.tinh("document.body.innerText").catch(() => "");
      const loiConsole = (await t.tinh("window.__loi").catch(() => [])) ?? [];
      const loi = [];
      if (txt.includes("Không mở được màn này")) loi.push(`màn sập «Không mở được màn này» (${kho})`);
      const l185 = loiConsole.filter((x) => /#185|Maximum update depth/.test(x));
      if (l185.length) loi.push(`lỗi vòng cập nhật (${kho}): ${l185[0].slice(0, 120)}`);
      if (!dich.test(txt)) loi.push(`không thấy «${dienThoai ? `${soThe}` : `/ ${SO_HANG}`} căn» (${kho})`);
      ket.push({ kho, ok: loi.length === 0, loi });
      t.dong();
    }
  } finally {
    chrome.dong();
  }
} catch (e) {
  for (const k of ket) console.log(JSON.stringify(k));
  console.error(`không chạy được: ${e.message}`);
  tat();
  process.exit(2);
}
for (const k of ket) console.log(JSON.stringify(k));
tat();
if (process.argv.includes("--kem-e11")) {
  await ngu(1500);
  const r = spawnSync(process.execPath, ["_acceptance/bang-hang-kieu-sheet/thu/do-cuon.mjs", "--khong-build"], { cwd: GOC, encoding: "utf8", timeout: 900_000 });
  const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-12).join("\n");
  const luot = ra.split("\n").filter((l) => /^lượt \d/.test(l));
  const toi = luot.filter((l) => l.includes(`dòng cuối thấy ${SO_HANG}`)).length;
  const loi = [];
  if (luot.length < 3) loi.push(`máy đo cuộn E11 không chạy đủ ba lượt (thoát ${r.status}): ${ra.split("\n").at(-1)}`);
  else if (toi < luot.length) loi.push(`cuộn không tới căn cuối: ${toi}/${luot.length} lượt thấy dòng ${SO_HANG}`);
  const tai = (await import("node:os")).loadavg().map((x) => x.toFixed(1)).join(" ");
  ket.push({ kho: "e11", ok: loi.length === 0, loi, hieu_nang: ra.split("\n").at(-1), tai_may: tai });
  console.log(JSON.stringify(ket.at(-1)));
}
process.exit(ket.every((k) => k.ok) ? 0 : 1);
