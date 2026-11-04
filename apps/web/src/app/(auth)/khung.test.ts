// Khuôn Khung theo auth-15 (hàng 93, dang-nhap-auth-15) — E4. Đọc mã nguồn ba màn xác thực: khối máy bị báo, hai đường
// API của hàng 6, không Frame/Card, không chữ OAuth, chân điều khoản.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CHAN_DIEU_KHOAN } from "./khung";

const GOC = fileURLToPath(new URL(".", import.meta.url));
const doc = (tep: string) => readFileSync(join(GOC, tep), "utf8");

/** Mọi tệp .ts/.tsx dưới (auth), trừ tệp kiểm. */
function tepAuth(thuMuc = GOC): string[] {
  return readdirSync(thuMuc).flatMap((ten) => {
    const p = join(thuMuc, ten);
    if (statSync(p).isDirectory()) return tepAuth(p);
    return /\.tsx?$/.test(ten) && !ten.endsWith(".test.ts") ? [p] : [];
  });
}

const OAUTH = /Google|Apple|GitHub/;
/** Tên tệp (tương đối (auth)) có chữ OAuth trong nguồn. */
const coOauth = (nguon: Record<string, string>) => Object.keys(nguon).filter((t) => OAUTH.test(nguon[t]));

test("khung: màn đăng nhập giữ khối máy bị báo và hai đường API", () => {
  const trang = doc("login/page.tsx");
  const biBao = trang.indexOf("<KhoiMayBiBao");
  const form = trang.indexOf("<FormDangNhap");
  assert.ok(biBao > 0 && form > biBao, "khối máy bị báo phải đứng trước form");
  const f = doc("login/form.tsx");
  for (const duong of ["/email-otp/send-verification-otp", "/sign-in/email-otp"]) assert.ok(f.includes(`"${duong}"`), duong);
  assert.ok(f.includes("fetch(`/api/v1/auth${path}`"), "gốc đường /api/v1/auth");
});

test("khung: không Frame, không Card", () => {
  const k = doc("khung.tsx");
  assert.ok(!k.includes("@/components/reui/frame"), "khung.tsx nhập Frame");
  assert.ok(!k.includes("@/components/ui/card"), "khung.tsx nhập Card");
  assert.ok(/chuyển thể khối `@reui\/auth-15`/i.test(k), "thiếu chú thích chuyển thể auth-15");
});

test("khung: không chữ OAuth", () => {
  const nguon = Object.fromEntries(tepAuth().map((p) => [p.slice(GOC.length), readFileSync(p, "utf8")]));
  assert.ok(Object.keys(nguon).length >= 7, "quét được các tệp của (auth)");
  // Chú thích chuyển thể nêu tên nút đã bỏ: chỉ khung.tsx được nhắc, và chỉ trong dòng chú thích.
  const ma = { ...nguon, "khung.tsx": nguon["khung.tsx"].split("\n").filter((l) => !l.trimStart().startsWith("//")).join("\n") };
  assert.deepEqual(coOauth(ma), []);
  // Đối chứng: chữ nút OAuth chèn vào một bản sao thì thước bắt được và nêu đúng tệp.
  assert.deepEqual(coOauth({ ...ma, "login/form.tsx": `${ma["login/form.tsx"]}\n<Button>Continue with Google</Button>` }), ["login/form.tsx"]);
});

test("khung: chân điều khoản", () => {
  assert.equal(CHAN_DIEU_KHOAN, "Sàn của bạn dùng Quỹ hàng theo điều khoản trong hợp đồng đã ký.");
  assert.match(doc("khung.tsx"), /<footer[^>]*>\s*<p[^>]*>\{CHAN_DIEU_KHOAN\}<\/p>/);
});

/** Thuộc tính và nhánh của hàng 6 còn trong nguồn form; trả tên mục thiếu. */
function thieuTrangThai(f: string): string[] {
  const can: [string, RegExp][] = [
    ["numeric", /inputMode="numeric"/],
    ["maxLength 6", /maxLength=\{6\}/],
    ["one-time-code", /autoComplete="one-time-code"/],
    ["email autoFocus", /id="email"[\s\S]{0,120}autoFocus/],
    ["Đang gửi…", /disabled=\{dangGui\}[\s\S]{0,60}"Đang gửi…"/],
    ["Gửi lại mã", /loi === "code-expired"[\s\S]{0,200}Gửi lại mã/],
  ];
  return can.filter(([, re]) => !re.test(f)).map(([ten]) => ten);
}

test("khung: trạng thái của hàng 6 còn đủ", async () => {
  const f = doc("login/form.tsx");
  assert.deepEqual(thieuTrangThai(f), []);
  const CHU_HANG_6: Record<string, string> = {
    "invalid-code": "Mã không đúng. Thử lại.",
    "code-expired": "Mã đã hết hạn hoặc sai quá số lần. Gửi lại mã.",
    "too-many-requests": "Bạn đã xin mã quá nhiều lần. Thử lại sau 15 phút.",
    khac: "Có lỗi, thử lại sau ít phút.",
  };
  assert.equal(Object.keys(CHU_HANG_6).length, 4);
  for (const [khoa, chu] of Object.entries(CHU_HANG_6)) assert.ok(f.includes(`${/^\w+$/.test(khoa) ? khoa : `"${khoa}"`}: "${chu}"`), khoa);
  // Đối chứng: bản sao bỏ one-time-code thì thước nêu đúng mục ấy.
  assert.deepEqual(thieuTrangThai(f.replace('autoComplete="one-time-code"', "")), ["one-time-code"]);
});
