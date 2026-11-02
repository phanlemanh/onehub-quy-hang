// Thêm một đăng ký thông báo mẫu (một «điện thoại») cho người mẫu trên bản dev của dãy L (cổng 3483) — bước dựng khung 3
// của E8. Đi qua lối API thật `POST /api/v1/me/push-subscriptions` bằng phiên của chính người ấy; endpoint mẫu của Apple
// không trỏ máy thật nào, nên lần gửi sau đó lỗi ở dịch vụ đẩy mà không ai nhận — lời báo trên máy tính vẫn đếm thiết bị.
//   node --env-file=.env.local --import tsx _acceptance/goi-tu-may-tinh/thu/dang-ky.mts dau-chu-1@mau.quy-hang.test
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const email = process.argv[2];
if (!email?.endsWith("@mau.quy-hang.test")) throw new Error("chỉ dựng đăng ký cho người mẫu (…@mau.quy-hang.test)");
const BASE = "http://localhost:3483";
const PHIEN = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "thong-bao-lead", "thu", "phien.mts");
const p = JSON.parse(execFileSync(process.execPath, ["--env-file=.env.local", "--import", "tsx", PHIEN, email], { encoding: "utf8" }).trim().split("\n").at(-1)!) as {
  value: string;
  qh_san: string;
};
const r = await fetch(`${BASE}/api/v1/me/push-subscriptions`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: BASE, cookie: `qh.session_token=${p.value}; qh_san=${p.qh_san}` },
  body: JSON.stringify({
    endpoint: `https://web.push.apple.com/mau-dien-thoai-${randomBytes(6).toString("hex")}`,
    expirationTime: null,
    keys: { p256dh: randomBytes(65).toString("base64url"), auth: randomBytes(16).toString("base64url") },
  }),
});
console.log(JSON.stringify({ status: r.status }));
if (r.status !== 201) process.exit(1);
