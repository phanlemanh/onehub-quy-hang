// Dựng chỗ thử của hồ sơ anh-can-ba-ngan trên máy dãy H (Postgres 5562, dev 3482) — cho eval ui-check E10 («DỰNG H»).
//   node _acceptance/anh-can-ba-ngan/thu/dung-h.mjs        dựng (qua dung-h của hàng 17), gán Đầu chủ mẫu 1 giữ căn A,
//                                                          sinh ảnh mẫu; in mã căn A, đường ảnh mẫu, cookie từng người
//   node _acceptance/anh-can-ba-ngan/thu/dung-h.mjs --tat  tắt máy chủ dev đã bật
// Ảnh mẫu vẽ bằng mã (khối màu, chữ «[Sổ mẫu]»), không ảnh thật; JPEG có EXIF ngày chụp 2026:10:20 chèn bằng mã.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG17 = path.join(GOC, "_acceptance/cot-ho-so-can/thu/dung-h.mjs");
const CHAY17 = path.join(os.tmpdir(), "quy-hang-cot-ho-so-can");
const ANH = path.join(os.tmpdir(), "quy-hang-anh-can-ba-ngan");
const URL_GOC = "http://localhost:3482";
const MIEN = "mau.quy-hang.test";

if (process.argv.includes("--tat")) {
  execFileSync("node", [DUNG17, "--tat"], { stdio: "inherit" });
  process.exit(0);
}
const ra = execFileSync("node", [DUNG17], { cwd: GOC }).toString();
const ma = /căn A: (\S+) · Toà A/.exec(ra)?.[1];
if (!ma) throw new Error(`dung-h hàng 17 không in căn A:\n${ra}`);

// Đăng nhập: dùng lại phiên hàng 17 đã giữ; người chưa có phiên thì xin mã và đọc ở nhật ký.
const NHAT_KY = path.join(CHAY17, "web-h.log");
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
async function cookieCua(n) {
  const email = `${n}@${MIEN}`;
  const giu = path.join(CHAY17, `phien-${email}.json`);
  if (existsSync(giu)) {
    const c = JSON.parse(readFileSync(giu, "utf8")).join("; ");
    if ((await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: c } })).status === 200) return c;
  }
  const h = { "content-type": "application/json", origin: URL_GOC };
  const maCua = () => readFileSync(NHAT_KY, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  let otp = null;
  for (let i = 0; !otp && i < 30; i++) {
    await ngu(300);
    const ds = maCua();
    otp = ds.length > truoc ? ds.at(-1).split(" ").at(-1) : null;
  }
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp }) });
  if (r.status !== 200) throw new Error(`đăng nhập ${email}: ${r.status}`);
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  writeFileSync(giu, JSON.stringify(ck));
  return ck.join("; ");
}
const ck = {};
for (const n of ["dau-chu-1", "dau-chu-2", "dau-khach", "truong-nhom"]) ck[n] = await cookieCua(n);

// Gán Đầu chủ mẫu 1 giữ lần rao mới nhất của căn A (trưởng nhóm gán — luật hàng 11).
const hang = await (await fetch(`${URL_GOC}/api/v1/listings`, { headers: { cookie: ck["dau-chu-1"] } })).json();
const cuaA = hang.filter((l) => l.buildingName === "Toà A" && l.unitNumber === ma);
const moi = cuaA.find((l) => l.standardStatus === "Active") ?? cuaA.at(-1);
const r = await fetch(`${URL_GOC}/api/v1/listings/${moi.id}/listing-agent`, {
  method: "PUT",
  headers: { "content-type": "application/json", origin: URL_GOC, cookie: ck["truong-nhom"] },
  body: JSON.stringify({ userId: JSON.parse(await (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: ck["dau-chu-1"] } })).text()).user.id }),
});
if (r.status !== 200) throw new Error(`gán đầu chủ giữ căn A: ${r.status} ${await r.text()}`);

// Căn A bắt đầu không ảnh: ảnh của lần dựng trước đánh dấu đã xoá và xoá byte (dữ liệu thử của dãy H; sự kiện giữ nguyên
// vì bảng sự kiện chỉ thêm).
const sql = `update unit_photos set removed_at = now(), removed_by = 'dung-h', is_cover = false
  where building_name = 'Toà A' and app.unit_key(unit_number) = app.unit_key('${ma.replace(/'/g, "")}') and removed_at is null;
  delete from unit_photo_files f using unit_photos p where p.company_id = f.company_id and p.id = f.photo_id and p.removed_at is not null;`;
execFileSync("docker", ["exec", "quy-hang-db-H", "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-c", sql], { stdio: "ignore" });

// Ảnh mẫu: PNG vẽ bằng mã; JPEG đổi từ PNG bằng sips rồi chèn APP1 EXIF DateTimeOriginal.
mkdirSync(ANH, { recursive: true });
const crc = (b) => {
  let c = ~0;
  for (const x of b) {
    c ^= x;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
};
function png(w, h, [r0, g0, b0]) {
  const dong = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) dong.set([r0 + ((x * 40) / w) | 0, g0, b0 + ((y * 40) / h) | 0], y * (w * 3 + 1) + 1 + x * 3);
  const khoi = (t, d) => {
    const l = Buffer.alloc(4);
    l.writeUInt32BE(d.length);
    const td = Buffer.concat([Buffer.from(t), d]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([l, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), khoi("IHDR", ihdr), khoi("IDAT", deflateSync(dong)), khoi("IEND", Buffer.alloc(0))]);
}
function exif(ngay) {
  const t = [];
  const u16 = (v) => t.push(v & 0xff, (v >> 8) & 0xff);
  const u32 = (v) => (u16(v & 0xffff), u16(v >>> 16));
  t.push(0x49, 0x49); u16(42); u32(8);
  u16(1); u16(0x8769); u16(4); u32(1); u32(26); u32(0);
  u16(1); u16(0x9003); u16(2); u32(20); u32(44); u32(0);
  for (const c of ngay) t.push(c.charCodeAt(0));
  t.push(0);
  const app1 = Buffer.concat([Buffer.from("Exif\0\0", "latin1"), Buffer.from(t)]);
  const len = Buffer.alloc(2);
  len.writeUInt16BE(app1.length + 2);
  return Buffer.concat([Buffer.from([0xff, 0xe1]), len, app1]);
}
const tep = (ten, b) => (writeFileSync(path.join(ANH, ten), b), path.join(ANH, ten));
const p1 = tep("phong-khach.png", png(1600, 1200, [90, 110, 140]));
tep("bep.png", png(1200, 1600, [140, 110, 90]));
tep("so-mau.png", png(1000, 1400, [150, 80, 100]));
const jpgTam = path.join(ANH, "ban-cong-tam.jpg");
execFileSync("sips", ["-s", "format", "jpeg", p1, "--out", jpgTam], { stdio: "ignore" });
const j = readFileSync(jpgTam);
tep("ban-cong-exif.jpg", Buffer.concat([j.subarray(0, 2), exif("2026:10:20 08:15:00"), j.subarray(2)]));
tep("tin-nhan.jpg", Buffer.from("[Mẫu] đây là tin nhắn, không phải ảnh\n"));

console.log(`máy chủ dev ${URL_GOC} · căn A: Toà A ${ma} · Đầu chủ mẫu 1 giữ căn (lần rao ${moi.id})`);
console.log(`ảnh mẫu ở ${ANH}: ban-cong-exif.jpg (EXIF 20/10/2026) · phong-khach.png · bep.png · so-mau.png («sổ») · tin-nhan.jpg (chữ)`);
for (const [n, c] of Object.entries(ck)) console.log(`cookie ${n}: ${c}`);
