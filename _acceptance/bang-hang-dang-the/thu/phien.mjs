// Phiên đăng nhập người mẫu cho chỗ thử dãy B của hồ sơ bang-hang-dang-the (máy dev 3492, luật 7 của đợt dau-khach-nhap).
// Mã một lần đọc ở nhật ký máy dev của dung-b.mjs; phiên giữ ở .acceptance-runs và dùng lại khi còn sống (mỗi email chỉ
// xin được 5 mã trong 15 phút). Chạy tay: in JSON hai cookie để bên chấm đặt cho localhost:3492.
//   node _acceptance/bang-hang-dang-the/thu/phien.mjs dau-khach@mau.quy-hang.test
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const CHAY = path.join(GOC, ".acceptance-runs/bang-hang-dang-the");
export const CONG = 3492;
export const URL_GOC = `http://localhost:${CONG}`;
// Nhật ký máy dev nằm NGOÀI cây kho: bộ theo dõi tệp của máy dev nhìn cả gốc kho, mỗi dòng ghi thêm vào một tệp trong kho
// làm nó biên dịch lại và trang tải lại liên tục.
export const LOG = path.join(tmpdir(), "quy-hang-bang-hang-dang-the", "web-b.log");
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cookie «tên=giá trị» của một người mẫu; người nhiều sàn mở vào «[Mẫu] Sàn thử» trừ khi `san` nêu sàn khác. */
export async function cookieCua(email, san = "[Mẫu] Sàn thử") {
  if (!email.endsWith("@mau.quy-hang.test")) throw new Error("chỉ cấp phiên cho người mẫu (…@mau.quy-hang.test)");
  mkdirSync(CHAY, { recursive: true });
  const giu = path.join(CHAY, `phien-${email}.json`);
  if (existsSync(giu)) {
    const c = JSON.parse(readFileSync(giu, "utf8"));
    if ((await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: c.join("; ") } })).status === 200) return c;
  }
  const h = { "content-type": "application/json", origin: URL_GOC };
  const maCua = () => readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  let ma = null;
  for (let i = 0; !ma && i < 40; i++) {
    await ngu(300);
    const ds = maCua();
    ma = ds.length > truoc ? (ds.at(-1)?.split(" ").at(-1) ?? null) : null;
  }
  if (!ma) throw new Error(`không thấy mã của ${email} trong ${LOG}`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  if (r.status !== 200) throw new Error(`đăng nhập ${email}: ${r.status}`);
  let ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  const me = await (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: ck.join("; ") } })).json();
  if (me.companies?.length > 1) ck = [...ck, `qh_san=${me.companies.find((c) => c.name === san).id}`];
  writeFileSync(giu, JSON.stringify(ck));
  return ck;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ck = await cookieCua(process.argv[2] ?? "", process.argv[3]);
  const lay = (ten) => ck.find((c) => c.startsWith(`${ten}=`))?.slice(ten.length + 1) ?? null;
  console.log(JSON.stringify({ url: URL_GOC, "qh.session_token": lay("qh.session_token"), qh_san: lay("qh_san") }));
}
