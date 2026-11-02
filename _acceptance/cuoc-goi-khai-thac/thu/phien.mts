// Cấp phiên đăng nhập thử cho bên chấm giao diện của hàng 28 (mọi bài ui-check) trên bản dev của dãy D (cổng 3485) — không đọc nhật ký máy
// chủ. Gửi mã và nhập mã qua lối đăng nhập thật, ký bằng đúng khoá bí mật dev của bản chạy (launch web-dcdv-d). In một dòng
// JSON: tên cookie phiên, giá trị, mã sàn mẫu — bên chấm đặt hai cookie `qh.session_token` và `qh_san` cho localhost.
//   node --env-file=.env.local --import tsx _acceptance/cuoc-goi-khai-thac/thu/phien.mts dau-chu-1@mau.quy-hang.test
import pg from "pg";
import { createAuth } from "../../../packages/api/src/auth/auth";
import { captureSender } from "../../../packages/api/src/auth/sender";

const email = process.argv[2];
if (!email?.endsWith("@mau.quy-hang.test")) throw new Error("chỉ cấp phiên cho người mẫu (…@mau.quy-hang.test)");
const BASE = "http://localhost:3485";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("thiếu DATABASE_URL");
const identityPool = new pg.Pool({ connectionString: url, options: "-c search_path=identity" });
const appPool = new pg.Pool({ connectionString: url });
const cap = captureSender();
const auth = createAuth({ identityPool, secret: "dev-dcdv-d-chuoi-thu-khong-dung-o-ban-that", baseURL: BASE, sender: cap.sender });
const goi = (path: string, body: unknown) =>
  auth.handler(new Request(`${BASE}/api/v1/auth${path}`, { method: "POST", headers: { "content-type": "application/json", origin: BASE }, body: JSON.stringify(body) }));
try {
  await goi("/email-otp/send-verification-otp", { email, type: "sign-in" });
  const ma = cap.sent.find((m) => m.email === email);
  if (!ma) throw new Error(`không có mã cho ${email}`);
  const r = await goi("/sign-in/email-otp", { email, otp: ma.otp });
  const tok = r.headers.getSetCookie().map((c) => c.split(";")[0]!).find((c) => c.startsWith("qh.session_token="));
  if (!tok) throw new Error(`đăng nhập ${email} không trả cookie phiên (${r.status})`);
  const san = (await appPool.query<{ id: string }>("select id from companies where name = '[Mẫu] Sàn thử' order by created_at limit 1")).rows[0]?.id;
  console.log(JSON.stringify({ name: "qh.session_token", value: tok.slice("qh.session_token=".length), qh_san: san }));
} finally {
  await identityPool.end();
  await appPool.end();
}
