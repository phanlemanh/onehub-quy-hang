// Đặt mật khẩu lần đầu (E4, AC-4): luật, phiên 30 ngày, mã đổi một lần, từ chối không tiêu mã.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { SESSION_EXPIRES_SEC } from "../../src/auth/constants";
import { cleanup, cookieOf, identityPool } from "../helpers";
import { capTam, dangNhapMk, datLanDau, loiCua, req, sanCoNguoi, suKien, trangThai } from "./chung";

after(cleanup);

async function maDoi() {
  const s = await sanCoNguoi();
  const t = await capTam(s.qt, s.userId);
  const { changeToken } = (await (await dangNhapMk(s.email, t.tempPassword)).json()) as { changeToken: string };
  return { ...s, changeToken };
}

test("đặt lần đầu: nhận rồi có phiên", async () => {
  const s = await maDoi();
  const res = await datLanDau(s.changeToken, "mưa rơi!");
  assert.equal(res.status, 200);
  assert.ok(res.headers.getSetCookie().some((c) => c.startsWith("qh.session_token=")), "không đặt cookie phiên");
  const { rows } = await identityPool.query<{ expiresAt: Date }>(`select "expiresAt" from identity.session where "userId" = $1`, [s.userId]);
  assert.equal(rows.length, 1);
  const lech = Math.abs(rows[0]!.expiresAt.getTime() - (Date.now() + SESSION_EXPIRES_SEC * 1000));
  assert.ok(lech < 60_000, `phiên không hết hạn sau 30 ngày (lệch ${lech} ms)`);
  assert.equal((await req("/api/v1/me", cookieOf(res))).status, 200);
  assert.equal((await trangThai(s.userId))?.kind, "tu-dat");
  assert.ok((await suKien(s.userId)).includes("dat-lan-dau"));
});

test("đặt lần đầu: mã đổi không dùng lại", async () => {
  const s = await maDoi();
  assert.equal((await datLanDau(s.changeToken, "mây trôi lững lờ")).status, 200);
  const lai = await datLanDau(s.changeToken, "mây trôi lững lờ 2");
  assert.deepEqual([lai.status, await loiCua(lai)], [403, "change-token-invalid"]);
});

test("đặt lần đầu: từ chối có lý do", async () => {
  const s = await maDoi();
  const ngan = await datLanDau(s.changeToken, "bienxan");
  assert.deepEqual([ngan.status, await loiCua(ngan)], [400, "password-too-short"]);
  const ten = s.email.split("@")[0]!;
  const ngucanh = await datLanDau(s.changeToken, `${ten} nhà tôi`);
  assert.deepEqual([ngucanh.status, await loiCua(ngucanh)], [400, "password-guessable"]);
  assert.equal((await datLanDau(s.changeToken, "mây trôi lững lờ")).status, 200, "mã đổi chết sau lần từ chối");
});

test("mã đổi: hai lời gọi song song, một 200 một 403", async () => {
  const s = await maDoi();
  const kq = await Promise.all([datLanDau(s.changeToken, "mây trôi lững lờ"), datLanDau(s.changeToken, "gió thổi qua đồi")]);
  assert.deepEqual(kq.map((r) => r.status).sort(), [200, 403]);
});
