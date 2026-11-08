// Công cụ vận hành mở sàn (AC-9): tạo sàn và gắn email đầu tiên; chạy lại không tạo trùng.
// Chạy trên Postgres thật đã áp migration; mỗi ca trong một giao dịch rồi rollback.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";
import goiVai from "../../core/src/access/goi-vai.json" with { type: "json" };
import { moSan } from "../scripts/mo-san.mjs";

/** Năm vai của người đầu tiên một sàn mới — lấy từ bảng ở lõi (hàng chu-san-du-vai, cách B). */
const DU_VAI = [...goiVai.company_admin, "company_admin"].sort();
/** Câu lệch giữa vai thật và vai mong — rỗng là khớp; nêu đúng vai thiếu, vai thừa. */
export function vaiLech(thuc, mong = DU_VAI) {
  const thieu = mong.filter((v) => !thuc.includes(v));
  const thua = thuc.filter((v) => !mong.includes(v));
  return [...thieu.map((v) => `thiếu vai: ${v}`), ...thua.map((v) => `thừa vai: ${v}`)];
}

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
    assert.deepEqual([second.companyId, second.userId, second.chayLai], [first.companyId, first.userId, true]);
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
    assert.deepEqual([b.companyId, b.userId, b.chayLai], [a.companyId, a.userId, true]);
    assert.deepEqual(await counts(c, "mo-san-3@example.test"), { companies: 1, users: 1, members: 1 });
  });
});

test("mở sàn: người đầu tiên mang đủ năm vai lấy từ bảng ở lõi", { skip }, async () => {
  await inTx(async (c) => {
    const { companyId, userId } = await moSan(c, { ten: "[Sàn mở 4]", email: "mo-san-4@example.test" });
    const { rows } = await c.query("select roles from company_members where company_id = $1 and user_id = $2", [companyId, userId]);
    assert.deepEqual(vaiLech(rows[0]?.roles ?? []), []);
    await moSan(c, { ten: "[Sàn mở 4]", email: "mo-san-4@example.test" });
    const lai = await c.query("select roles from company_members where company_id = $1 and user_id = $2", [companyId, userId]);
    assert.deepEqual(lai.rows[0]?.roles, rows[0]?.roles, "chạy lại làm đổi vai");
  });
});

// ---- Hàng 56 (mo-san-trung-ten): công ty mới trùng tên được sàn riêng, không gộp lặng vào sàn cũ ----
// Tên và email mang nhãn chạy, nên chạy bộ kiểm nhiều lần trên cùng cơ sở dữ liệu vẫn đúng daCo tuyệt đối.
const NHAN = Math.random().toString(36).slice(2, 8);
const thanhVien = async (c, companyId) =>
  (await c.query("select user_id, roles from company_members where company_id = $1 order by user_id", [companyId])).rows;

test("mở sàn: tên trùng, email khác → sàn riêng", { skip }, async () => {
  await inTx(async (c) => {
    const ten = `[Sàn trùng 1 ${NHAN}]`;
    const x = await moSan(c, { ten, email: `trung-1x-${NHAN}@example.test` });
    const truoc = await thanhVien(c, x.companyId);
    const y = await moSan(c, { ten, email: `trung-1y-${NHAN}@example.test` });
    assert.notEqual(y.companyId, x.companyId, "email Y vào sàn cũ");
    assert.deepEqual([x.daCo, x.chayLai, y.daCo, y.chayLai], [0, false, 1, false]);
    const [dauTien, ...khac] = await thanhVien(c, y.companyId);
    assert.equal(dauTien.user_id, y.userId);
    assert.deepEqual([vaiLech(dauTien.roles), khac], [[], []]);
    assert.equal((await thanhVien(c, x.companyId)).filter((m) => m.user_id === y.userId).length, 0, "Y là thành viên sàn cũ");
    assert.deepEqual(await thanhVien(c, x.companyId), truoc, "sàn cũ đổi danh sách thành viên");
  });
});

test("mở sàn: chạy lại sàn thứ hai trong hai sàn cùng tên", { skip }, async () => {
  await inTx(async (c) => {
    const ten = `[Sàn trùng 2 ${NHAN}]`;
    await moSan(c, { ten, email: `trung-2x-${NHAN}@example.test` });
    const y = await moSan(c, { ten, email: `trung-2y-${NHAN}@example.test` });
    const lai = await moSan(c, { ten, email: `  TRUNG-2Y-${NHAN}@Example.TEST ` });
    assert.deepEqual([lai.companyId, lai.userId, lai.chayLai, lai.daCo], [y.companyId, y.userId, true, 1]);
    const soSan = Number((await c.query("select count(*) n from companies where name = $1", [ten])).rows[0].n);
    assert.equal(soSan, 2, "chạy lại sàn thứ hai tạo thêm sàn");
    assert.equal((await thanhVien(c, y.companyId)).length, 1, "chạy lại thêm thành viên");
  });
});

test("mở sàn: thành viên thường không tính là chạy lại", { skip }, async () => {
  await inTx(async (c) => {
    const ten = `[Sàn trùng 3 ${NHAN}]`;
    const x = await moSan(c, { ten, email: `trung-3x-${NHAN}@example.test` });
    const z = await moSan(c, { ten: `[Sàn khác 3 ${NHAN}]`, email: `trung-3z-${NHAN}@example.test` });
    await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{listing_agent}')", [x.companyId, z.userId]);
    const moi = await moSan(c, { ten, email: `trung-3z-${NHAN}@example.test` });
    assert.notEqual(moi.companyId, x.companyId, "thành viên thường bị coi là chạy lại");
    assert.deepEqual([moi.chayLai, moi.daCo], [false, 1]);
  });
});

test("mở sàn: ba lần cùng tên, ba email → ba sàn", { skip }, async () => {
  await inTx(async (c) => {
    const ten = `[Sàn trùng 4 ${NHAN}]`;
    const EMAIL = ["a", "b", "c"].map((k) => `trung-4${k}-${NHAN}@example.test`);
    const kq = [];
    for (const email of EMAIL) kq.push(await moSan(c, { ten, email }));
    assert.equal(kq.length, EMAIL.length, "số lần gọi phải bằng ma trận viết trước");
    assert.equal(new Set(kq.map((k) => k.companyId)).size, 3, "ba lần mở không ra ba sàn");
    assert.deepEqual(kq.map((k) => k.daCo), [0, 1, 2]);
    for (const k of kq) {
      const ds = await thanhVien(c, k.companyId);
      assert.deepEqual(ds.map((m) => m.user_id), [k.userId]);
      assert.deepEqual(vaiLech(ds[0].roles), []);
    }
  });
});

test("dòng lệnh mở sàn: báo trùng tên và chạy lại", { skip }, async () => {
  const { execFileSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const tool = fileURLToPath(new URL("../scripts/mo-san.mjs", import.meta.url));
  const ten = `[Sàn mở cli ${NHAN}]`;
  const email = [`cli-a-${NHAN}@example.test`, `cli-b-${NHAN}@example.test`];
  const chay = (e) => execFileSync(process.execPath, [tool, "--ten", ten, "--email", e], { env: { ...process.env, DATABASE_URL: url } }).toString();
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    const mot = chay(email[0]);
    assert.ok(!mot.includes("sàn khác cùng tên"), `lần một báo trùng tên: ${mot}`);
    const hai = chay(email[1]);
    const ids = (await c.query("select id from companies where name = $1 order by created_at", [ten])).rows.map((r) => r.id);
    assert.equal(ids.length, 2);
    assert.ok(hai.includes(`đã có 1 sàn khác cùng tên — đây là sàn mới ${ids[1]}`), `thiếu dòng báo trùng tên: ${hai}`);
    const ba = chay(email[1]);
    assert.ok(ba.includes(`chạy lại — sàn có sẵn ${ids[1]}`), `thiếu dòng báo chạy lại: ${ba}`);
  } finally {
    await c.query("delete from companies where name = $1", [ten]);
    await c.query('delete from identity."user" where email = any($1)', [email]);
    await c.end();
  }
});

test("mở sàn: sàn đang chạy không đổi vai ai — người chỉ mang Quản trị sàn giữ nguyên khi chạy lại và khi có sàn trùng tên", { skip }, async () => {
  await inTx(async (c) => {
    const ten = `[Sàn đang chạy ${NHAN}]`;
    const email = `dang-chay-${NHAN}@example.test`;
    const x = await moSan(c, { ten, email });
    await c.query("update company_members set roles = '{company_admin}' where company_id = $1 and user_id = $2", [x.companyId, x.userId]);
    const lai = await moSan(c, { ten, email });
    assert.equal(lai.chayLai, true);
    await moSan(c, { ten, email: `dang-chay-khac-${NHAN}@example.test` });
    assert.deepEqual(await thanhVien(c, x.companyId), [{ user_id: x.userId, roles: ["company_admin"] }]);
  });
});

test("vaiLech — đối chứng đỏ: bảng thiếu một vai thì nêu đúng vai thiếu", () => {
  assert.deepEqual(vaiLech(DU_VAI.filter((v) => v !== "telesales")), ["thiếu vai: telesales"]);
  assert.deepEqual(vaiLech([...DU_VAI, "vai_la"]), ["thừa vai: vai_la"]);
  assert.deepEqual(vaiLech(DU_VAI), []);
});
