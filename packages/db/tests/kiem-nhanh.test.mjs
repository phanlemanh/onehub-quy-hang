// Kiểm nhanh sau migration (hàng va-deploy-csdl-tam): phần xét thuần trên ma trận viết trước, và phần đọc danh mục trên
// Postgres đã migrate — mọi ca phá thử nằm trong giao dịch rollback, không để lại gì.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { CAP_BAN_MA, chay, dongBanMa, ketQuaCli, moGiaoDich, soi, xet } from "../scripts/kiem-nhanh.mjs";

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

// ---- Bất biến 2: ràng buộc bản mã (hàng kiem-nhanh-rang-buoc-ban-ma) ----

// Ma trận viết trước 12 dòng: bảng × số rõ {0, 3} × ràng buộc {bật, chưa bật, vắng}. Cột: bảng, số rõ, bat (null = vắng),
// tập vế lỗi mong đợi, mảnh dòng báo mong đợi.
const LO = "listing_owners", LO_RB = "listing_owners_phone_chi_ban_ma", LE = "leads", LE_RB = "leads_phone_chi_ban_ma";
const MA_TRAN_BAN_MA = [
  [LO, LO_RB, 0, true, [], "listing_owners bật"],
  [LO, LO_RB, 0, false, ["bảng sạch mà ràng buộc chưa bật"], "listing_owners chưa bật"],
  [LO, LO_RB, 0, null, ["thiếu ràng buộc"], "listing_owners thiếu listing_owners_phone_chi_ban_ma"],
  [LO, LO_RB, 3, true, ["ràng buộc bật mà còn số rõ"], "listing_owners bật"],
  [LO, LO_RB, 3, false, [], "listing_owners còn 3 số rõ (chưa bật — chờ mã hoá lại)"],
  [LO, LO_RB, 3, null, ["thiếu ràng buộc"], "listing_owners thiếu listing_owners_phone_chi_ban_ma"],
  [LE, LE_RB, 0, true, [], "leads bật"],
  [LE, LE_RB, 0, false, ["bảng sạch mà ràng buộc chưa bật"], "leads chưa bật"],
  [LE, LE_RB, 0, null, ["thiếu ràng buộc"], "leads thiếu leads_phone_chi_ban_ma"],
  [LE, LE_RB, 3, true, ["ràng buộc bật mà còn số rõ"], "leads bật"],
  [LE, LE_RB, 3, false, [], "leads còn 3 số rõ (chưa bật — chờ mã hoá lại)"],
  [LE, LE_RB, 3, null, ["thiếu ràng buộc"], "leads thiếu leads_phone_chi_ban_ma"],
];
const VAI_LANH = { ton_tai: true, bypassrls: false, superuser: false };

test("kiểm nhanh: ma trận ràng buộc bản mã 12 dòng", () => {
  assert.equal(MA_TRAN_BAN_MA.length, 12, "ma trận phải đủ 12 dòng");
  assert.equal(new Set(MA_TRAN_BAN_MA.map((r) => r.slice(0, 4).join("|"))).size, 12, "12 dòng phải khác nhau");
  for (const [bang, rangBuoc, conSo, bat, mong, bao] of MA_TRAN_BAN_MA) {
    const banMa = [{ bang, rangBuoc, conSo, bat }];
    const { loi } = xet({ bang: [], vai: VAI_LANH, banMa, vaiKetNoi: { ten: "postgres", thayHet: true } });
    assert.deepEqual(loi.map((l) => l.ve), mong, `dòng ${bang} ${conSo} ${bat}`);
    for (const l of loi) assert.equal(l.rangBuoc, rangBuoc);
    assert.ok(dongBanMa(banMa).includes(bao), `báo ${bang} ${conSo} ${bat}: ${dongBanMa(banMa)}`);
  }
  assert.equal(CAP_BAN_MA.length, 2);
});

test("kiểm nhanh: vai chịu luật theo dòng thì không suy bảng sạch (xét thuần)", () => {
  const banMa = [{ bang: LO, rangBuoc: LO_RB, conSo: 0, bat: false }];
  assert.deepEqual(xet({ bang: [], vai: VAI_LANH, banMa, vaiKetNoi: { ten: "quy_hang_app", thayHet: false } }).loi, [
    { ve: "vai kết nối chịu luật theo dòng", ten: "quy_hang_app" },
  ]);
  assert.deepEqual(xet({ bang: [], vai: VAI_LANH, banMa, vaiKetNoi: { ten: "postgres", thayHet: true } }).loi.map((l) => l.ve), [
    "bảng sạch mà ràng buộc chưa bật",
  ]);
});

/** Gỡ ràng buộc rồi dựng lại ở dạng not valid (chưa bật). */
const veChuaBat = (c, bang, rb) =>
  c.query(`alter table public.${bang} drop constraint ${rb}; alter table public.${bang} add constraint ${rb} check (owner_phone is null) not valid`);

test("kiểm nhanh: bảng sạch mà ràng buộc bản mã chưa bật thì lỗi", { skip }, async () => {
  for (const [bang, rb] of CAP_BAN_MA) {
    await trongGiaoDich(async (c) => {
      await veChuaBat(c, bang, rb);
      const kq = await soi(c);
      assert.deepEqual(kq.loi, [{ ve: "bảng sạch mà ràng buộc chưa bật", ten: bang, rangBuoc: rb }]);
      const cli = ketQuaCli(kq);
      assert.equal(cli.ma, 1);
      assert.ok(cli.dong.some((d) => d.includes(bang) && d.includes(rb) && d.includes("bảng sạch mà ràng buộc chưa bật")), cli.dong.join("\n"));
      await c.query(`alter table public.${bang} validate constraint ${rb}`);
      const sau = await soi(c);
      assert.deepEqual(sau.loi, [], "đối chứng dương: validate lại thì hết lỗi");
      assert.equal(ketQuaCli(sau).ma, 0);
    });
  }
});

test("kiểm nhanh: bảng còn số rõ thì chỉ báo", { skip }, async () => {
  await trongGiaoDich(async (c) => {
    await c.query(`alter table public.listing_owners drop constraint ${LO_RB}`);
    await c.query("set local session_replication_role = replica");
    await c.query(
      "insert into public.listing_owners (company_id, listing_id, updated_by, owner_phone) values (gen_random_uuid(), gen_random_uuid(), '[Tên]', '0900000061')",
    );
    await c.query("set local session_replication_role = origin");
    await c.query(`alter table public.listing_owners add constraint ${LO_RB} check (owner_phone is null) not valid`);
    const kq = await soi(c);
    assert.deepEqual(kq.loi, []);
    assert.ok(dongBanMa(kq.banMa).includes("listing_owners còn 1 số rõ (chưa bật — chờ mã hoá lại)"), dongBanMa(kq.banMa));
  });
});

test("kiểm nhanh: ràng buộc vắng thì lỗi", { skip }, async () => {
  await trongGiaoDich(async (c) => {
    await c.query(`alter table public.leads drop constraint ${LE_RB}`);
    assert.deepEqual((await soi(c)).loi, [{ ve: "thiếu ràng buộc", ten: "leads", rangBuoc: LE_RB }]);
  });
});

test("kiểm nhanh: vai chịu luật theo dòng thì không đếm", { skip }, async () => {
  await trongGiaoDich(async (c) => {
    await veChuaBat(c, "listing_owners", LO_RB);
    await c.query("set local role quy_hang_app");
    const ve = (await soi(c)).loi.map((l) => l.ve);
    assert.ok(ve.includes("vai kết nối chịu luật theo dòng"), JSON.stringify(ve));
    assert.ok(!ve.includes("bảng sạch mà ràng buộc chưa bật"), "không suy bảng sạch từ số đếm của vai chịu luật");
  });
  const ve = (await trongGiaoDich((c) => soi(c))).loi.map((l) => l.ve);
  assert.ok(!ve.includes("vai kết nối chịu luật theo dòng"), "đối chứng dương: vai postgres thấy hết");
});

/** Câu nào chạm bảng chủ nhà hay lead mà trả khác đúng một cột int8 thì là vi phạm. */
const viPham = (ghi) =>
  ghi.filter((g) => /\b(listing_owners|leads)\b/.test(g.sql) && /from public\./.test(g.sql)).filter((g) => !(g.fields.length === 1 && g.fields[0].dataTypeID === 20));

test("kiểm nhanh: không đọc giá trị số", { skip }, async () => {
  assert.equal(viPham([{ sql: "select count(*), max(owner_phone) from public.leads", fields: [{ dataTypeID: 20 }, { dataTypeID: 25 }] }]).length, 1, "đối chứng đỏ: hai cột phải bị bắt");
  await trongGiaoDich(async (c) => {
    const ghi = [];
    const goc = c.query.bind(c);
    c.query = async (sql, ...rest) => {
      const r = await goc(sql, ...rest);
      ghi.push({ sql: String(sql), fields: r.fields ?? [] });
      return r;
    };
    await soi(c);
    assert.ok(ghi.filter((g) => /from public\.(listing_owners|leads)/.test(g.sql)).length === 2, "phải đếm cả hai bảng");
    assert.deepEqual(viPham(ghi), []);
  });
});

test("kiểm nhanh: dòng xanh nêu ràng buộc bản mã", { skip }, () => {
  const r = spawnSync(process.execPath, [fileURLToPath(new URL("../scripts/kiem-nhanh.mjs", import.meta.url))], {
    env: { PATH: process.env.PATH, DATABASE_URL: url },
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes("ràng buộc bản mã: listing_owners bật · leads bật"), r.stdout);
  assert.equal(dongBanMa([{ bang: "leads", rangBuoc: LE_RB, conSo: 2, bat: false }]), "ràng buộc bản mã: leads còn 2 số rõ (chưa bật — chờ mã hoá lại)");
});
