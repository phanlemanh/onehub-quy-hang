// Chỗ thử của hàng can-nhap-len-bang-chung trên máy dãy G (dev 3493, Postgres 5573): dùng lại chỗ thử của màn Nhập Excel.
//   node _acceptance/can-nhap-len-bang-chung/thu/dung.mjs          bật (Postgres + migrate + bộ mẫu + máy chủ dev)
//   node _acceptance/can-nhap-len-bang-chung/thu/dung.mjs --tat    tắt máy chủ dev (chỉ PID chỗ thử đã ghi)
//
// Máy chủ dev bật bằng webpack, không Turbopack: kho chính có package-lock.json ở thư mục cha nên Turbopack lấy cả kho chính
// làm gốc theo dõi — worktree của các dãy khác và thư mục đợt đổi liên tục làm máy dev dựng lại rồi tải lại trang không dứt
// (màn chọn sàn tải lại ~12 lần/giây, lượt chấm S4 07/11 kẹt ở bước đăng nhập; dãy H gặp cùng lỗi, hàng 43). Lệnh bật máy chủ
// trước bằng webpack, ghi đúng tệp PID và nhật ký của `dung-g.mjs`; `dung-g.mjs` thấy máy đã sống thì dùng lại.
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, openSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG_G = path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs");
const TAT = process.argv.includes("--tat");
const CHAY = path.join(os.tmpdir(), "quy-hang-man-nhap-excel");
const URL_GOC = "http://localhost:3493";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
async function song() {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).ok;
  } catch {
    return false;
  }
}

if (!TAT && !(await song())) {
  mkdirSync(CHAY, { recursive: true });
  const out = openSync(path.join(CHAY, "web-g.log"), "a");
  const p = spawn("npx", ["next", "dev", "--webpack", "-p", "3493", "apps/web"], {
    cwd: GOC,
    env: {
      ...process.env,
      DATABASE_URL: "postgres://postgres:quyhang@localhost:5573/postgres",
      BETTER_AUTH_SECRET: "dev-g-chuoi-thu-khong-dung-o-ban-that",
      BETTER_AUTH_URL: URL_GOC,
    },
    detached: true,
    stdio: ["ignore", out, out],
  });
  p.unref();
  writeFileSync(path.join(CHAY, "web-g.pid"), String(p.pid));
  for (let i = 0; !(await song()); i++) {
    if (i > 240) throw new Error(`máy chủ dev không lên — xem ${path.join(CHAY, "web-g.log")}`);
    await ngu(1000);
  }
}
execFileSync("node", [DUNG_G, ...(TAT ? ["--tat"] : [])], { cwd: GOC, stdio: "inherit" });
