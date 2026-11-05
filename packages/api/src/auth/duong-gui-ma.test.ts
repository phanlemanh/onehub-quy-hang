// Mọi đường và lối gửi mã của plugin mã email đều đã xếp loại (hàng 55, hồ sơ dong-duong-gui-ma-thua, AC-4). Không cần
// cơ sở dữ liệu: đọc danh sách đường từ chính bản better-auth đang cài, gọi thẳng hook trước với một bộ đếm thay thế.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";
import { createAuth } from "./auth";
import { AUTH_DISABLED_PATHS, OTP_SEND_PATHS, OTP_TYPE_NOT_ALLOWED } from "./constants";
import { BANG, DUONG_DA_TAT } from "./duong-gui-ma.ca";

/** Plugin hôm nay có đúng một hook sau: gửi mã khi đăng ký — kho tắt đăng ký mật khẩu nên nó không chạy. */
const SO_HOOK_SAU = 1;

function moAuth(pool: pg.Pool) {
  const auth = createAuth({ identityPool: pool, secret: "s".repeat(40), baseURL: "http://localhost:3461" });
  const plugin = (auth.options.plugins ?? []).find((p) => p.id === "email-otp") as
    | { endpoints: Record<string, { path?: string }>; hooks?: { after?: { matcher: (c: { path: string }) => boolean }[]; before?: unknown[] }; options?: Record<string, unknown> }
    | undefined;
  assert.ok(plugin, "createAuth không có plugin email-otp");
  return { auth, plugin };
}

test("mọi đường của plugin mã email có đúng một nhãn", async () => {
  const pool = new pg.Pool();
  try {
    const { auth, plugin } = moAuth(pool);
    const banCai = Object.entries(plugin.endpoints);
    const khoaBang = Object.keys(BANG);
    for (const [k, e] of banCai) {
      assert.ok(k in BANG, `endpoint chưa phân loại: ${k} (${e.path ?? "không có đường"})`);
      assert.equal(e.path ?? null, BANG[k]![0], `${k}: đường trong bảng lệch bản cài`);
    }
    for (const k of khoaBang) assert.ok(banCai.some(([kk]) => kk === k), `bảng có ${k} mà bản cài không có`);
    assert.equal(banCai.length, khoaBang.length, "số endpoint bản cài khác số dòng bảng");

    const tat = auth.options.disabledPaths ?? [];
    let so = 0;
    for (const [path, nhan] of Object.values(BANG)) {
      if (nhan === "gửi mã, có giới hạn") assert.ok(OTP_SEND_PATHS.includes(path!), `${path} gửi mã mà không nằm trong OTP_SEND_PATHS`);
      if (nhan === "đã tắt") assert.ok(tat.includes(path!), `${path} mang nhãn «đã tắt» mà không nằm trong disabledPaths`);
      if (nhan !== "gửi mã, có giới hạn" && path) assert.ok(!OTP_SEND_PATHS.includes(path), `${path} không gửi mã mà nằm trong OTP_SEND_PATHS`);
      so++;
    }
    assert.equal(so, khoaBang.length, "số dòng đã xét phải bằng bảng");
    assert.deepEqual([...tat].sort(), [...AUTH_DISABLED_PATHS].sort(), "disabledPaths phải đúng AUTH_DISABLED_PATHS");
    for (const p of DUONG_DA_TAT) assert.ok(AUTH_DISABLED_PATHS.includes(p), `${p} «đã tắt» mà thiếu ở AUTH_DISABLED_PATHS`);
    assert.ok(!OTP_SEND_PATHS.some((p) => tat.includes(p)), "một đường vừa gửi mã vừa bị tắt");
  } finally {
    await pool.end();
  }
});

test("hook gác theo OTP_SEND_PATHS", async () => {
  // Bộ đếm thay thế: mỗi lời gọi query của hook là một lần chạm bộ đếm xin mã.
  let cham = 0;
  const pool = { query: async () => (cham++, { rows: [{ n: "0" }] }), connect: async () => ({ release() {} }), end: async () => {} } as unknown as pg.Pool;
  const { auth } = moAuth(pool);
  const before = (auth.options.hooks as { before: (c: unknown) => Promise<unknown> }).before;
  const goi = async (path: string, type: string) => {
    cham = 0;
    try {
      await before({ path, body: { email: "[ten]@example.test", type }, context: {} });
      return { loi: null as string | null, cham };
    } catch (e) {
      return { loi: (e as { body?: { code?: string } }).body?.code ?? String(e), cham };
    }
  };
  let so = 0;
  for (const path of OTP_SEND_PATHS) {
    const r = await goi(path, "sign-in");
    assert.equal(r.loi, null, `${path}: mã đăng nhập bị chặn (${r.loi})`);
    assert.ok(r.cham > 0, `${path} nằm trong OTP_SEND_PATHS mà hook không chạm bộ đếm`);
    for (const type of ["email-verification", "forget-password"]) {
      const k = await goi(path, type);
      assert.deepEqual([k.loi, k.cham], [OTP_TYPE_NOT_ALLOWED, 0], `${path} kiểu ${type}: phải chặn trước khi đếm`);
    }
    so++;
  }
  assert.equal(so, OTP_SEND_PATHS.length, "số đường đã thử phải bằng OTP_SEND_PATHS");
  // Đối chứng: đường không gửi mã thì hook không chạm bộ đếm.
  const ngoai = await goi("/email-otp/check-verification-otp", "sign-in");
  assert.deepEqual([ngoai.loi, ngoai.cham], [null, 0], "hook chạm bộ đếm ở đường không gửi mã");
});

test("không lối gửi mã ngoài đường", async () => {
  const pool = new pg.Pool();
  try {
    const { auth, plugin } = moAuth(pool);
    const sau = plugin.hooks?.after ?? [];
    assert.equal(sau.length, SO_HOOK_SAU, `plugin có ${sau.length} hook sau — xếp loại hook mới trước khi nâng`);
    assert.equal((plugin.hooks?.before ?? []).length, 0, "plugin thêm hook trước — xếp loại trước khi nâng");
    assert.equal(sau[0]!.matcher({ path: "/sign-up/email" }), false, "hook gửi mã khi đăng ký đang bật");
    assert.ok(!plugin.options?.overrideDefaultEmailVerification, "plugin đổi xác minh email lõi sang mã");
    assert.ok(!plugin.options?.sendVerificationOnSignUp, "plugin gửi mã khi đăng ký");
    assert.equal((auth.options as { emailVerification?: { sendVerificationEmail?: unknown } }).emailVerification?.sendVerificationEmail, undefined, "lõi có bộ gửi thư xác minh email");
    // Mật khẩu bật từ hàng dang-nhap-mat-khau nhưng không tự đăng ký — đường đăng ký còn bị tắt ở duong-mat-khau.ca.ts.
    assert.equal(auth.options.emailAndPassword?.disableSignUp, true, "mật khẩu bật mà cho tự đăng ký");
  } finally {
    await pool.end();
  }
});
