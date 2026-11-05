// Mọi đường lõi chạm mật khẩu có đúng một loại (E8): đọc đường của bản better-auth đang cài, không suy từ bảng.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";
import { createAuth } from "./auth";
import { AUTH_DISABLED_PATHS, PASSWORD_WRAPPED_PATHS } from "./constants";
import { BANG_LOI, DUONG_LOI_DA_TAT, thieuLoai, thuocHoMatKhau } from "./duong-mat-khau.ca";
import { DUONG_DA_TAT } from "./duong-gui-ma.ca";

const BAT_BUOC = ["/sign-up/email", "/sign-in/email", "/change-password", "/request-password-reset", "/reset-password",
  "/reset-password/:token", "/verify-password", "/send-verification-email", "/verify-email"];

function banCaiLoi(): [string, string | undefined][] {
  const auth = createAuth({ identityPool: new pg.Pool(), secret: "s".repeat(40), baseURL: "http://localhost:3461" });
  const plugin = new Set(Object.keys((auth.options.plugins ?? []).find((p) => p.id === "email-otp")?.endpoints ?? {}));
  return Object.entries(auth.api as Record<string, { path?: string }>)
    .filter(([k]) => !plugin.has(k))
    .map(([k, e]) => [k, e.path]);
}

test("xếp loại: mọi đường lõi chạm mật khẩu có loại", () => {
  const banCai = banCaiLoi();
  assert.deepEqual(thieuLoai(BANG_LOI, banCai), [], "đường lõi họ mật khẩu chưa xếp loại");
  const coDuong = Object.values(BANG_LOI).map(([p]) => p);
  for (const p of BAT_BUOC) assert.ok(coDuong.includes(p), `bảng thiếu ${p}`);
  for (const [ten, [path]] of Object.entries(BANG_LOI)) {
    assert.ok(banCai.some(([k, pp]) => k === ten && (pp ?? null) === path), `bảng có ${ten} mà bản cài không có`);
    assert.ok(thuocHoMatKhau(ten, path ?? undefined), `${ten} trong bảng mà không thuộc họ mật khẩu`);
  }
  for (const [path, nhan] of Object.values(BANG_LOI)) {
    if (nhan === "bọc") assert.ok(PASSWORD_WRAPPED_PATHS.includes(path!), `${path} mang nhãn «bọc» mà không có đường bọc`);
    if (nhan === "đã tắt") assert.ok(AUTH_DISABLED_PATHS.includes(path!), `${path} mang nhãn «đã tắt» mà không bị tắt`);
  }
  assert.deepEqual([...AUTH_DISABLED_PATHS].sort(), [...DUONG_DA_TAT, ...DUONG_LOI_DA_TAT].sort(), "AUTH_DISABLED_PATHS lệch hai bảng");
});

test("xếp loại: đối chứng — bảng thiếu /change-password thì nêu đúng đường ấy", () => {
  const thieu = { ...BANG_LOI };
  delete thieu.changePassword;
  assert.deepEqual(thieuLoai(thieu, banCaiLoi()), ["/change-password"]);
});
