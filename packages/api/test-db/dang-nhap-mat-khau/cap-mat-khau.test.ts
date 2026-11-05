// Quản trị cấp mật khẩu tạm (E1, AC-1): 16 ký tự, 72 giờ, băm của thư viện, thu mọi phiên, một sự kiện, không bản rõ.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { BANG_CHU_TAM } from "../../src/auth/constants";
import { nhomBon } from "../../src/auth/mat-khau";
import { cleanup, identityPool, mail, openCompany, RUN } from "../helpers";
import { batNhatKy, capTam, dangNhapMa, idCua, loiCua, sanCoNguoi, soPhien, vao } from "./chung";

after(cleanup);

test("cấp mật khẩu: quản trị cấp cho người chỉ ở sàn mình", async () => {
  const s = await sanCoNguoi();
  await dangNhapMa(s.email);
  assert.equal(await soPhien(s.userId), 1);
  const truoc = Date.now();
  const t = await capTam(s.qt, s.userId);
  assert.equal(t.status, 200);
  assert.equal(t.tempPassword.length, 16);
  for (const ch of t.tempPassword) assert.ok(BANG_CHU_TAM.includes(ch), `ký tự ngoài bảng: ${ch}`);
  assert.equal(nhomBon(t.tempPassword).split("-").length, 4);
  const lech = Math.abs(new Date(t.expiresAt).getTime() - (truoc + 72 * 3600_000));
  assert.ok(lech < 60_000, `hạn lệch 72 giờ ${lech} ms`);
  const { rows } = await identityPool.query<{ password: string }>(
    `select "password" from identity.account where "userId" = $1 and "providerId" = 'credential'`,
    [s.userId],
  );
  assert.match(rows[0]!.password, /^[0-9a-f]{32}:[0-9a-f]{128}$/, "băm không theo dạng scrypt của thư viện");
  assert.notEqual(rows[0]!.password, t.tempPassword);
  assert.equal(await soPhien(s.userId), 0, "phiên của người được cấp còn");
  const sk = await identityPool.query("select actor_user_id, user_id, company_id, kind from identity.password_events where user_id = $1", [s.userId]);
  const qtId = await idCua(s.qtEmail);
  assert.deepEqual(sk.rows, [{ actor_user_id: qtId, user_id: s.userId, company_id: s.companyId, kind: "cap" }]);
});

test("cấp mật khẩu: không bản rõ ở đâu", async () => {
  const s = await sanCoNguoi();
  const { kq: t, dong } = await batNhatKy(() => capTam(s.qt, s.userId));
  assert.equal(t.status, 200);
  for (const d of dong) assert.ok(!d.includes(t.tempPassword), "mật khẩu tạm lọt vào nhật ký");
  for (const bang of ["password_state", "password_failures", "password_events", "account"]) {
    const { rows } = await identityPool.query(`select * from identity.${bang}`);
    assert.ok(!JSON.stringify(rows).includes(t.tempPassword), `mật khẩu tạm nằm trong identity.${bang}`);
  }
});

test("cấp mật khẩu: không quản trị → 403", async () => {
  const s = await sanCoNguoi();
  const nguoi = vao(await dangNhapMa(s.email), s.companyId);
  const t = await capTam(nguoi, s.userId);
  assert.deepEqual([t.status, await loiCua(t.res)], [403, "admin-required"]);
});

test("cấp mật khẩu: người ngoài sàn → 404", async () => {
  const s = await sanCoNguoi();
  const khac = await openCompany(`[Sàn ${RUN} ngoai]`, mail("qt-ngoai"));
  void khac;
  const nguoiNgoai = (await idCua(mail("qt-ngoai")))!;
  const t = await capTam(s.qt, nguoiNgoai);
  assert.equal(t.status, 404);
  const { rowCount } = await identityPool.query(`select 1 from identity.account where "userId" = $1 and "providerId" = 'credential'`, [nguoiNgoai]);
  assert.equal(rowCount, 0);
});

test("tự cấp: phiên mình bị thu", async () => {
  const s = await sanCoNguoi();
  const qtId = (await idCua(s.qtEmail))!;
  const t = await capTam(s.qt, qtId);
  assert.equal(t.status, 200);
  assert.equal(await soPhien(qtId), 0, "phiên của quản trị tự cấp còn sống");
});
