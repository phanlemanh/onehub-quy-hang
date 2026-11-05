// Người thuộc sàn khác (E2, AC-2): 409 ở hàm cơ sở dữ liệu, khoá với lời mời đồng thời, vào sàn khác vô hiệu mật khẩu gốc sàn cấp.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import pg from "pg";
import { withCompany } from "../../src/db";
import { appPool, cleanup, identityPool } from "../helpers";
import { capTam, dangNhapMk, idCua, loiCua, nguoiCoMatKhau, sanCoNguoi, send, soPhien, suKien } from "./chung";

after(cleanup);

const anh = async (userId: string) => ({
  account: (await identityPool.query(`select "password" from identity.account where "userId" = $1`, [userId])).rows,
  session: await soPhien(userId),
  events: await suKien(userId),
});

test("cấp mật khẩu: người ở hai sàn → 409", async () => {
  const a = await sanCoNguoi();
  const b = await sanCoNguoi();
  assert.equal((await send("POST", "/api/v1/company/members", { email: a.email, roles: ["telesales"] }, b.qt)).status, 201);
  const truoc = await anh(a.userId);
  const t = await capTam(a.qt, a.userId);
  assert.deepEqual([t.status, await loiCua(t.res)], [409, "user-in-other-company"]);
  const than = await t.res.text();
  assert.ok(!than.includes(b.companyId) && !than.includes("Sàn"), "thân lỗi nêu sàn khác");
  assert.deepEqual(await anh(a.userId), truoc, "lời gọi bị từ chối vẫn đổi tài khoản, phiên hay sự kiện");
});

test("cấp mật khẩu: gọi thẳng hàm bằng vai API cũng bị từ chối", async () => {
  const a = await sanCoNguoi();
  const b = await sanCoNguoi();
  await send("POST", "/api/v1/company/members", { email: a.email, roles: ["telesales"] }, b.qt);
  const qtA = (await idCua(a.qtEmail))!;
  const truoc = await anh(a.userId);
  await assert.rejects(
    withCompany(appPool, { userId: qtA, companyId: a.companyId }, (tx) =>
      tx.query("select app.cap_mat_khau_tam($1, 'bam-thu', now() + interval '72 hours')", [a.userId]),
    ),
    /user_in_other_company/,
  );
  assert.deepEqual(await anh(a.userId), truoc);
});

test("cấp mật khẩu: mời đồng thời phải chờ khoá", async () => {
  const a = await sanCoNguoi();
  const b = await sanCoNguoi();
  const qtA = (await idCua(a.qtEmail))!;
  const giu = new pg.Client({ connectionString: process.env.DATABASE_URL });
  const moi = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await giu.connect();
  await moi.connect();
  try {
    await giu.query("begin");
    await giu.query("set local role quy_hang_app");
    await giu.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [qtA, a.companyId]);
    await giu.query("select app.cap_mat_khau_tam($1, 'bam-thu', now() + interval '72 hours')", [a.userId]);
    let xong = false;
    const chen = moi
      .query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{telesales}')", [b.companyId, a.userId])
      .then(() => (xong = true));
    await new Promise((r) => setTimeout(r, 400));
    assert.equal(xong, false, "lời mời vào sàn B không chờ khoá của lần cấp");
    const cho = await identityPool.query("select count(*)::int n from pg_locks where locktype = 'advisory' and not granted");
    assert.ok(cho.rows[0].n >= 1, "không thấy khoá tư vấn đang chờ");
    await giu.query("commit");
    await chen;
  } finally {
    await giu.end();
    await moi.end();
  }
  const t = await capTam(a.qt, a.userId);
  assert.equal(t.status, 409, "sau khi vào sàn B mà vẫn cấp được");
});

test("vào sàn khác: mật khẩu gốc sàn cấp bị vô hiệu", async () => {
  // Bảng viết trước ba hình: mật khẩu tạm chưa dùng · đặt lần đầu từ mật khẩu tạm · tự đổi ở Cá nhân sau đặt lần đầu.
  const MK = "gió thổi qua đồi";
  const MK2 = "nắng vàng trên phố";
  const hinh = [
    { ten: "tạm chưa dùng", ket: 403 },
    { ten: "đặt lần đầu từ tạm", ket: 403 },
    { ten: "tự đổi ở Cá nhân", ket: 200 },
  ] as const;
  assert.equal(hinh.length, 3);
  for (const h of hinh) {
    const b = await sanCoNguoi();
    let email: string, userId: string, matKhau: string;
    if (h.ten === "tạm chưa dùng") {
      const a = await sanCoNguoi();
      const t = await capTam(a.qt, a.userId);
      ({ email, userId } = a);
      matKhau = t.tempPassword;
    } else {
      const a = await nguoiCoMatKhau(MK);
      ({ email, userId } = a);
      matKhau = MK;
      if (h.ten === "tự đổi ở Cá nhân") {
        assert.equal((await send("PUT", "/api/v1/me/password", { currentPassword: MK, newPassword: MK2 }, a.cookie)).status, 200);
        matKhau = MK2;
      }
    }
    assert.equal((await send("POST", "/api/v1/company/members", { email, roles: ["telesales"] }, b.qt)).status, 201);
    const res = await dangNhapMk(email, matKhau);
    assert.equal(res.status, h.ket, `hình «${h.ten}»`);
    if (h.ket === 403) {
      assert.equal(await loiCua(res), "password-disabled", `hình «${h.ten}»`);
      assert.ok((await suKien(userId)).includes("vo-hieu-san-khac"), `hình «${h.ten}»: thiếu sự kiện`);
    }
  }
});
