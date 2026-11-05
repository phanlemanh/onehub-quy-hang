// Giới hạn thử (E6, AC-6): 5 sai / 15 phút theo email (email lạ cũng đếm) → 429; 20 sai liên tiếp → vô hiệu.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup, identityPool, mail } from "../helpers";
import { capTam, dangNhapMk, loiCua, nguoiCoMatKhau, suKien } from "./chung";

after(cleanup);

const MK = "gió thổi qua đồi";
const SAI = "gió thổi qua sông";
const donCuaSo = (email: string) => identityPool.query("delete from identity.password_failures where email = $1", [email.toLowerCase()]);

test("giới hạn thử: 5 sai trong 15 phút", async () => {
  const s = await nguoiCoMatKhau(MK);
  for (let i = 1; i <= 5; i++) assert.equal((await dangNhapMk(s.email, SAI)).status, 401, `lần sai ${i}`);
  const res = await dangNhapMk(s.email, MK);
  assert.deepEqual([res.status, await loiCua(res)], [429, "password-rate-limited"]);
});

test("giới hạn thử: email lạ cũng đếm", async () => {
  const s = await nguoiCoMatKhau(MK);
  const la = mail("la-dem");
  for (let i = 1; i <= 5; i++) assert.equal((await dangNhapMk(la, SAI)).status, 401);
  const res = await dangNhapMk(la, SAI);
  const that = await (async () => {
    for (let i = 1; i <= 5; i++) await dangNhapMk(s.email, SAI);
    return dangNhapMk(s.email, SAI);
  })();
  assert.equal(res.status, 429);
  assert.equal(await res.text(), await that.text(), "email lạ và email thật nhận thân 429 khác nhau");
});

test("giới hạn thử: hoa thường và khoảng trắng chung một cửa sổ", async () => {
  const s = await nguoiCoMatKhau(MK);
  for (let i = 1; i <= 5; i++) await dangNhapMk(i % 2 ? ` ${s.email.toUpperCase()} ` : s.email, SAI);
  assert.equal((await dangNhapMk(s.email, MK)).status, 429);
});

test("giới hạn thử: 20 liên tiếp thì vô hiệu", async () => {
  const s = await nguoiCoMatKhau(MK);
  for (let i = 1; i <= 20; i++) {
    if (i % 5 === 1) await donCuaSo(s.email);
    assert.equal((await dangNhapMk(s.email, SAI)).status, 401, `lần sai ${i}`);
  }
  await donCuaSo(s.email);
  const res = await dangNhapMk(s.email, MK);
  assert.deepEqual([res.status, await loiCua(res)], [403, "password-disabled"]);
  assert.ok((await suKien(s.userId)).includes("khoa-20"));
  const t = await capTam(s.qt, s.userId);
  assert.equal((await dangNhapMk(s.email, t.tempPassword)).status, 200, "cấp lại mà không đăng nhập tạm được");
});

test("giới hạn thử: đúng giữa chừng thì về 0", async () => {
  const s = await nguoiCoMatKhau(MK);
  const sai = async (n: number) => {
    for (let i = 1; i <= n; i++) {
      if (i % 5 === 1) await donCuaSo(s.email);
      await dangNhapMk(s.email, SAI);
    }
    await donCuaSo(s.email);
  };
  await sai(19);
  assert.equal((await dangNhapMk(s.email, MK)).status, 200);
  await sai(19);
  assert.equal((await dangNhapMk(s.email, MK)).status, 200, "chuỗi sai không về 0 sau lần đúng");
});
