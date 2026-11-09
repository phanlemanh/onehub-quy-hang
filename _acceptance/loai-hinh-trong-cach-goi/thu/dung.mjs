// Chỗ thử E9: dựng trên chỗ thử hàng 79 (Postgres dãy X 5576, máy dev 3496, phiên dau-chu-1, căn ngoài khu, căn hộ), thêm phiên quản
// trị sàn mẫu và trả cách gọi về mặc định. Chạy lại được. In một dòng JSON mã hàng nhà phố, mã căn hộ.
//   node _acceptance/loai-hinh-trong-cach-goi/thu/dung.mjs [--tat]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const URL_GOC = "http://localhost:3496";
const song = async () => {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).status === 200;
  } catch {
    return false;
  }
};
// Bật máy dev trên bộ đệm cũ làm trang tự nạp lại liên tục: xoá khi máy chưa chạy.
if (!process.argv.includes("--tat") && !(await song())) rmSync(path.join(GOC, "apps/web/.next/dev"), { recursive: true, force: true });
const r79 = spawnSync("node", ["_acceptance/bang-hang-theo-loai-hinh/thu/dung-x.mjs", ...process.argv.slice(2)], { cwd: GOC, encoding: "utf8" });
if (r79.status !== 0) throw new Error(`dung-x hỏng: ${r79.stderr}`);
if (process.argv.includes("--tat")) process.exit(0);

const CHAY79 = path.join(GOC, ".acceptance-runs/bang-hang-theo-loai-hinh");
const LOG = path.join(CHAY79, "web-x79.log");
const CHAY = path.join(GOC, ".acceptance-runs/loai-hinh-trong-cach-goi");
mkdirSync(CHAY, { recursive: true });
const phien = JSON.parse(readFileSync(path.join(CHAY79, "phien.json"), "utf8"));
const h = { "content-type": "application/json", origin: URL_GOC };
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const EMAIL = "quan-tri@mau.quy-hang.test";
const FILE_QT = path.join(CHAY, "phien-qt.json");

async function dangNhap() {
  const cu = existsSync(FILE_QT) ? JSON.parse(readFileSync(FILE_QT, "utf8")).goc : null;
  if (cu && (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: cu } })).status === 200) return cu;
  const maCua = () => readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${EMAIL} `));
  const truoc = maCua().length;
  const xin = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email: EMAIL, type: "sign-in" }) });
  if (xin.status >= 300) throw new Error(`xin mã: ${xin.status}`);
  let ma = null;
  for (let i = 0; i < 60 && !ma; i++) {
    await ngu(500);
    const ds = maCua();
    if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
  }
  if (!ma) throw new Error("không thấy mã đăng nhập của quản trị mẫu");
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email: EMAIL, otp: ma }) });
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  if (!ck.length) throw new Error(`đăng nhập hỏng: ${r.status}`);
  return ck.join("; ");
}
const goc = await dangNhap();
const cookie = `${goc}; qh_san=${phien.san}`;
writeFileSync(FILE_QT, JSON.stringify({ goc, cookie }, null, 2));

const goi = async (ck, method, duong, body) => {
  const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { ...h, cookie: ck }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const t = await r.json().catch(() => null);
  if (r.status >= 300) throw new Error(`${method} ${duong} → ${r.status} ${JSON.stringify(t)}`);
  return t;
};
await goi(cookie, "PUT", "/api/v1/company/labels", { fields: [], values: [] });
const ds = await goi(phien.cookie, "GET", "/api/v1/listings");
const can = (await goi(phien.cookie, "GET", "/api/v1/off-compound-units")).units;
const nhaPho = ds.find((l) => l.offCompoundUnitId && can.find((c) => c.id === l.offCompoundUnitId)?.propertySubType === "Townhouse");
const canHo = ds.find((l) => l.buildingName && l.unitNumber);
if (!nhaPho || !canHo) throw new Error("thiếu hàng nhà phố hay căn hộ mẫu");
const kq = { nhaPho: nhaPho.id, canHo: { ma: canHo.unitNumber, toa: canHo.buildingName } };
writeFileSync(path.join(CHAY, "dung.json"), JSON.stringify(kq));
console.log(JSON.stringify(kq));
