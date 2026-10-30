// Công cụ vận hành mở sàn (AC-9): tạo sàn và gắn email đầu tiên; chạy lại không tạo trùng.
// Chạy trên Postgres thật đã áp migration; mỗi ca trong một giao dịch rồi rollback.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";
import { moSan } from "../scripts/mo-san.mjs";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bộ kiểm mở sàn cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

async function inTx(fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    return await fn(client);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

async function counts(c, email) {
  const q = async (sql, p) => Number((await c.query(sql, p)).rows[0].n);
  return {
    companies: await q("select count(*) n from companies where name like '[Sàn mở %'"),
    users: await q('select count(*) n from identity."user" where email = $1', [email]),
    members: await q(
      'select count(*) n from company_members m join identity."user" u on u.id = m.user_id where u.email = $1',
      [email],
    ),
  };
}

test("mở sàn: lần hai cùng tham số không tạo trùng", { skip }, async () => {
  await inTx(async (c) => {
    const email = "mo-san-1@example.test";
    const first = await moSan(c, { ten: "[Sàn mở 1]", email });
    assert.deepEqual(await counts(c, email), { companies: 1, users: 1, members: 1 });
    const second = await moSan(c, { ten: "[Sàn mở 1]", email });
    assert.deepEqual(await counts(c, email), { companies: 1, users: 1, members: 1 }, "lần hai tạo thêm dòng");
    assert.deepEqual(second, first);
  });
});

test("mở sàn: cùng email, tên sàn khác → người thuộc hai sàn", { skip }, async () => {
  await inTx(async (c) => {
    const email = "mo-san-2@example.test";
    const a = await moSan(c, { ten: "[Sàn mở 2A]", email });
    const b = await moSan(c, { ten: "[Sàn mở 2B]", email });
    assert.equal(a.userId, b.userId);
    assert.notEqual(a.companyId, b.companyId);
    assert.deepEqual(await counts(c, email), { companies: 2, users: 1, members: 2 });
  });
});

test("mở sàn: email viết hoa có khoảng trắng gắn vào cùng tài khoản", { skip }, async () => {
  await inTx(async (c) => {
    const a = await moSan(c, { ten: "[Sàn mở 3]", email: "mo-san-3@example.test" });
    const b = await moSan(c, { ten: "[Sàn mở 3]", email: "  Mo-San-3@Example.TEST " });
    assert.deepEqual(b, a);
    assert.deepEqual(await counts(c, "mo-san-3@example.test"), { companies: 1, users: 1, members: 1 });
  });
});
