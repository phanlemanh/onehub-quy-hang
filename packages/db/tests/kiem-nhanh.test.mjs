// Kiểm nhanh sau migration (hàng va-deploy-csdl-tam): phần xét thuần trên ma trận viết trước, và phần đọc danh mục trên
// Postgres đã migrate — mọi ca phá thử nằm trong giao dịch rollback, không để lại gì.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

import { chay, moGiaoDich, soi, xet } from "../scripts/kiem-nhanh.mjs";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bài kiểm nhanh cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

// Ma trận toàn phần viết trước: luật theo dòng {bật+ép, chỉ bật, không bật} × quy_hang_app là chủ bảng × bypassrls ×
// superuser. Cột: bat, ep, chu là quy_hang_app, bypassrls, superuser, tập vế lỗi mong đợi.
const MA_TRAN = [
  [true, true, true, true, true, ["chủ bảng", "bypassrls", "superuser"]],
  [true, true, true, true, false, ["chủ bảng", "bypassrls"]],
  [true, true, true, false, true, ["chủ bảng", "superuser"]],
  [true, true, true, false, false, ["chủ bảng"]],
  [true, true, false, true, true, ["bypassrls", "superuser"]],
  [true, true, false, true, false, ["bypassrls"]],
  [true, true, false, false, true, ["superuser"]],
  [true, true, false, false, false, []],
  [true, false, true, true, true, ["chưa ép", "chủ bảng", "bypassrls", "superuser"]],
  [true, false, true, true, false, ["chưa ép", "chủ bảng", "bypassrls"]],
  [true, false, true, false, true, ["chưa ép", "chủ bảng", "superuser"]],
  [true, false, true, false, false, ["chưa ép", "chủ bảng"]],
  [true, false, false, true, true, ["chưa ép", "bypassrls", "superuser"]],
  [true, false, false, true, false, ["chưa ép", "bypassrls"]],
  [true, false, false, false, true, ["chưa ép", "superuser"]],
  [true, false, false, false, false, ["chưa ép"]],
  [false, false, true, true, true, ["chưa bật", "chủ bảng", "bypassrls", "superuser"]],
  [false, false, true, true, false, ["chưa bật", "chủ bảng", "bypassrls"]],
  [false, false, true, false, true, ["chưa bật", "chủ bảng", "superuser"]],
  [false, false, true, false, false, ["chưa bật", "chủ bảng"]],
  [false, false, false, true, true, ["chưa bật", "bypassrls", "superuser"]],
  [false, false, false, true, false, ["chưa bật", "bypassrls"]],
  [false, false, false, false, true, ["chưa bật", "superuser"]],
  [false, false, false, false, false, ["chưa bật"]],
];

test("kiểm nhanh: ma trận xét 24 dòng", () => {
  assert.equal(MA_TRAN.length, 24, "ma trận phải đủ 24 dòng");
  let soAssert = 0;
  for (const [bat, ep, laChu, bypassrls, superuser, mong] of MA_TRAN) {
    const { loi } = xet({
      bang: [{ ten: "t", bat, ep, chu: laChu ? "quy_hang_app" : "quy_hang_owner" }],
      vai: { ton_tai: true, bypassrls, superuser },
    });
    assert.deepEqual(loi.map((l) => l.ve), mong, `dòng ${JSON.stringify([bat, ep, laChu, bypassrls, superuser])}`);
    soAssert++;
  }
  assert.equal(soAssert, 24);
});

test("kiểm nhanh: thiếu vai quy_hang_app là lỗi, không nổ", () => {
  const { loi } = xet({ bang: [], vai: { ton_tai: false, bypassrls: false, superuser: false } });
  assert.deepEqual(loi, [{ ve: "thiếu vai" }]);
});

/** Một kết nối vai chủ trong giao dịch, rollback sau cùng. */
async function trongGiaoDich(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    return await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}

test("kiểm nhanh: cơ sở dữ liệu lành thì không lỗi", { skip }, async () => {
  const { loi, soBang } = await trongGiaoDich((c) => soi(c));
  assert.deepEqual(loi, [], "cơ sở dữ liệu đã migrate phải lành");
  assert.ok(soBang > 0, "phải soi được bảng");
});

test("kiểm nhanh: bảng thiếu luật theo dòng thì lỗi gọi đúng tên", { skip }, async () => {
  await trongGiaoDich(async (c) => {
    await c.query("create table public.__kn_thieu (id int)");
    let { loi } = await soi(c);
    assert.deepEqual(loi, [{ ve: "chưa bật", ten: "__kn_thieu" }]);
    await c.query("alter table public.__kn_thieu enable row level security");
    ({ loi } = await soi(c));
    assert.deepEqual(loi, [{ ve: "chưa ép", ten: "__kn_thieu" }]);
    await c.query("alter table public.__kn_thieu force row level security");
    ({ loi } = await soi(c));
    assert.deepEqual(loi, [], "đối chứng dương: bật và ép thì hết lỗi");
  });
});

test("kiểm nhanh: vai của API là chủ bảng thì lỗi", { skip }, async () => {
  await trongGiaoDich(async (c) => {
    await c.query("create table public.__kn_chu (id int)");
    await c.query("alter table public.__kn_chu enable row level security");
    await c.query("alter table public.__kn_chu force row level security");
    assert.deepEqual((await soi(c)).loi, [], "đối chứng dương: chủ là vai chủ thì lành");
    await c.query("alter table public.__kn_chu owner to quy_hang_app");
    assert.deepEqual((await soi(c)).loi, [{ ve: "chủ bảng", ten: "__kn_chu" }]);
  });
});

test("kiểm nhanh: vai của API bypassrls hay superuser thì lỗi", { skip }, async () => {
  await trongGiaoDich(async (c) => {
    await c.query("alter role quy_hang_app bypassrls");
    assert.deepEqual((await soi(c)).loi, [{ ve: "bypassrls" }]);
  });
  await trongGiaoDich(async (c) => {
    await c.query("alter role quy_hang_app superuser");
    assert.deepEqual((await soi(c)).loi, [{ ve: "superuser" }]);
  });
  assert.deepEqual((await trongGiaoDich((c) => soi(c))).loi, [], "đối chứng dương: sau rollback vai lành");
});

test("kiểm nhanh: giao dịch chỉ đọc có trần thời gian", { skip }, async () => {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await moGiaoDich(c);
    await assert.rejects(c.query("create table public.__kn_ghi (id int)"), (e) => e.code === "25006");
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
});

test("kiểm nhanh: đường chạy thật chỉ đọc, đúng một kết nối", { skip }, async () => {
  let soKetNoi = 0;
  let dangMo = 0;
  class Dem extends pg.Client {
    async connect() {
      soKetNoi++;
      dangMo++;
      return super.connect();
    }
    async end() {
      dangMo--;
      return super.end();
    }
  }
  const quan = new pg.Client({ connectionString: url });
  await quan.connect();
  const demTen = async () =>
    Number((await quan.query("select count(*) n from pg_stat_activity where application_name = 'kiem-nhanh'")).rows[0].n);
  try {
    const truoc = await demTen();
    const { loi } = await chay(url, {
      Client: Dem,
      moc: async (k) => {
        assert.equal((await k.query("show transaction_read_only")).rows[0].transaction_read_only, "on");
        assert.notEqual((await k.query("show statement_timeout")).rows[0].statement_timeout, "0");
        assert.equal(await demTen(), truoc + 1, "trong lúc chạy: đúng một kết nối mang tên kiem-nhanh");
        assert.equal(dangMo, 1);
        await assert.rejects(k.query("create table public.__kn_ghi (id int)"), (e) => e.code === "25006");
      },
    });
    assert.deepEqual(loi, []);
    assert.equal(soKetNoi, 1, "chay mở đúng một kết nối");
    assert.equal(dangMo, 0, "chay đóng kết nối trước khi trả về");
    // pg_stat_activity cập nhật trễ một nhịp sau khi đóng
    for (let i = 0; i < 20 && (await demTen()) !== truoc; i++) await new Promise((r) => setTimeout(r, 50));
    assert.equal(await demTen(), truoc, "sau khi trả về: không còn kết nối kiem-nhanh");
  } finally {
    await quan.end();
  }
});
