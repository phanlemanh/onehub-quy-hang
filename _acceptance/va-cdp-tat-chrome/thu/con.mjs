// Tiến trình gọi con của bài đo va-cdp-tat-chrome: nạp đúng cdp.mjs được chỉ, mở Chrome, in một dòng JSON (PID của chính
// nó, PID Chrome, thư mục hồ sơ, PID người canh nếu có), rồi làm đúng một lối kết thúc theo --ca.
//   node con.mjs --cdp <đường cdp.mjs> --ca <ca> [--dau <tệp dấu>]
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const doi = (k) => {
  const i = process.argv.indexOf(k);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const ca = doi("--ca");
const { moChrome } = await import(pathToFileURL(doi("--cdp")).href);
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

// Bộ bắt riêng của lời gọi cài TRƯỚC khi mở Chrome là ca thường gặp ở chỗ thử cũ; ca bat-rieng cài SAU (như chay-ui.mjs).
const c = await moChrome();

// Chrome của lượt = con trực tiếp của tiến trình này mang --user-data-dir; người canh = con node mang thư mục ấy.
const ps = spawnSync("ps", ["-axww", "-o", "pid=,ppid=,command="], { encoding: "utf8" }).stdout.split("\n").map((l) => {
  const m = /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(l);
  return m ? { pid: Number(m[1]), ppid: Number(m[2]), lenh: m[3] } : null;
}).filter(Boolean);
const chrome = ps.find((x) => x.ppid === process.pid && /--user-data-dir=/.test(x.lenh) && /--headless/.test(x.lenh));
const dir = chrome ? /--user-data-dir=(\S+)/.exec(chrome.lenh)[1] : null;
const canh = ps.find((x) => x.ppid === process.pid && x.pid !== chrome?.pid && dir && x.lenh.includes(dir));
console.log(JSON.stringify({ con: process.pid, chrome: chrome?.pid ?? null, dir, canh: canh?.pid ?? null }));

// Giữ tiến trình sống tới khi bài đo kiểm đối chứng dương xong và gửi SIGUSR2 (ca tự kết thúc), hay gửi tín hiệu (ca tín
// hiệu). api và mo-coi đi thẳng.
const giu = setInterval(() => {}, 1000);
const songMai = () => {};
if (ca === "api" || ca === "mo-coi" || ca === "bat-rieng") await hanh();
else if (["dong", "thoat", "loi", "dong-exit-0", "dong-exit-3"].includes(ca)) process.once("SIGUSR2", () => hanh());
async function hanh() {
  if (ca === "thoat") clearInterval(giu);
  switch (ca) {
  case "dong": {
    c.dong();
    let lan2 = "ok";
    try {
      c.dong();
    } catch (e) {
      lan2 = String(e);
    }
    console.log(JSON.stringify({ lan2 }));
    songMai();
    break;
  }
  case "thoat":
    break; // hết việc, không gọi dong()
  case "loi":
    setTimeout(() => {
      throw new Error("lỗi thử của con");
    }, 50);
    break;
  case "dong-exit-0":
    c.dong();
    process.exit(0);
    break;
  case "dong-exit-3":
    c.dong();
    process.exit(3);
    break;
  case "bat-rieng":
    process.on("SIGTERM", () => {
      writeFileSync(doi("--dau"), "bat-rieng");
      process.exit(7);
    });
    songMai();
    break;
  case "api": {
    const t = await c.trang(800, 600);
    const w = await t.tinh("innerWidth");
    const anh = await t.chup();
    const png = Buffer.isBuffer(anh) && anh.length > 8 && anh.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    t.dong();
    c.dong(); // không await
    console.log(JSON.stringify({ w, png, dai: anh?.length ?? 0 }));
    songMai();
    break;
  }
  case "mo-coi":
    // moChrome() ở trên đã chạy bước dọn mồ côi; đóng rồi thoát.
    c.dong();
    await ngu(500);
    process.exit(0);
    break;
  default:
    // SIGTERM, SIGINT, SIGHUP, SIGKILL: đứng chờ bài đo gửi tín hiệu.
    songMai();
}
  }
