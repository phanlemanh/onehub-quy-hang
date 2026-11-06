// Bộ kiểm cách ly: «công ty này không thấy gì của công ty kia» — check bắt buộc trước mỗi lần phát hành.
// Chạy trên Postgres thật đã áp migration. Mỗi ca trong một giao dịch rồi rollback, không để lại dữ liệu.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import pg from "pg";

const url = process.env.DATABASE_URL;
// Trên CI thiếu DATABASE_URL là lỗi, không được lặng lẽ bỏ qua.
if (!url && process.env.CI) throw new Error("Bộ kiểm cách ly cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

const COMPANY_A = "00000000-0000-4000-8000-00000000000a";
const COMPANY_B = "00000000-0000-4000-8000-00000000000b";

/** Dựng hai công ty và thoả thuận của từng bên bằng vai chủ, rồi chuyển sang vai của API. */
async function asCompany(companyId, fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    await client.query(
      `insert into agreements (company_id, kind, direction, counterparty, counterparty_company_id, data_classes,
                               valid_from, approved_by)
       values ($1, 'catalog_source', 'inbound', 'onehub-invest', null, '{catalog}', now(), '[Tên]'),
              ($2, 'listing_channel', 'outbound', 'onehub-platform', null, '{shareable_listing}', now(), '[Tên]'),
              ($2, 'company_partnership', 'outbound', 'sàn A', $1, '{shareable_listing}', now(), '[Tên]')`,
      [COMPANY_A, COMPANY_B],
    );
    await client.query("set local role quy_hang_app");
    if (companyId) await client.query("select set_config('app.company_id', $1, true)", [companyId]);
    return await fn(client);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

/** Chạy một câu dự kiến lỗi mà không làm hỏng giao dịch của ca. */
async function expectError(client, sql, params, pattern) {
  await client.query("savepoint expect_error");
  await assert.rejects(client.query(sql, params), pattern);
  await client.query("rollback to savepoint expect_error");
}

test("không đặt công ty thì không thấy gì", { skip }, async () => {
  await asCompany(null, async (c) => {
    assert.equal((await c.query("select * from companies")).rowCount, 0);
    assert.equal((await c.query("select * from agreements")).rowCount, 0);
  });
});

test("công ty A chỉ thấy chính mình", { skip }, async () => {
  await asCompany(COMPANY_A, async (c) => {
    const { rows } = await c.query("select id from companies");
    assert.deepEqual(rows.map((r) => r.id), [COMPANY_A]);
  });
});

test("A thấy thoả thuận của mình và thoả thuận hợp tác B mở với A, không thấy thoả thuận riêng của B", { skip }, async () => {
  await asCompany(COMPANY_A, async (c) => {
    const { rows } = await c.query("select company_id, kind from agreements order by kind");
    assert.deepEqual(rows, [
      { company_id: COMPANY_A, kind: "catalog_source" },
      { company_id: COMPANY_B, kind: "company_partnership" },
    ]);
  });
});

test("A không ghi được thoả thuận đứng tên B, không sửa được thoả thuận của B", { skip }, async () => {
  await asCompany(COMPANY_A, async (c) => {
    await expectError(
      c,
      `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by)
       values ($1, 'spreadsheet', 'outbound', 'x', '{catalog}', now(), '[Tên]')`,
      [COMPANY_B],
      /row-level security/,
    );
    const updated = await c.query("update agreements set status = 'paused' where company_id = $1", [COMPANY_B]);
    assert.equal(updated.rowCount, 0);
  });
});

test("thoả thuận có lớp «nguồn» bị cơ sở dữ liệu từ chối", { skip }, async () => {
  await asCompany(COMPANY_A, async (c) => {
    await expectError(
      c,
      `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by)
       values ($1, 'listing_channel', 'outbound', 'onehub-platform', '{shareable_listing,source}', now(), '[Tên]')`,
      [COMPANY_A],
      /agreements_never_source/,
    );
  });
});

test("mọi bảng dữ liệu đều bật và ép luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relname
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' and c.relname <> 'schema_migrations'
         and not (c.relrowsecurity and c.relforcerowsecurity)`,
    );
    assert.deepEqual(rows.map((r) => r.relname), [], "bảng thiếu luật theo dòng");
  } finally {
    await client.end();
  }
});

// ---- Thành viên sàn và danh tính (002_dang_nhap_theo_san) ----
const COMPANY_C = "00000000-0000-4000-8000-00000000000c";
const USER_1 = "u-iso-1"; // thuộc A
const USER_2 = "u-iso-2"; // thuộc A và B

/** Dựng ba sàn, hai người và thành viên bằng vai chủ, rồi chuyển sang vai của API với người và sàn đã cho. */
async function asUser(userId, companyId, fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]'), ($3, '[Sàn C]')", [
      COMPANY_A,
      COMPANY_B,
      COMPANY_C,
    ]);
    await client.query(
      `insert into identity."user" (id, name, email, "emailVerified")
       values ($1, '[Tên]', 'iso-1@example.test', true), ($2, '[Tên]', 'iso-2@example.test', true)`,
      [USER_1, USER_2],
    );
    await client.query(
      "insert into company_members (company_id, user_id) values ($1, $3), ($1, $4), ($2, $4)",
      [COMPANY_A, COMPANY_B, USER_1, USER_2],
    );
    await client.query("set local role quy_hang_app");
    if (userId) await client.query("select set_config('app.user_id', $1, true)", [userId]);
    if (companyId) await client.query("select set_config('app.company_id', $1, true)", [companyId]);
    return await fn(client);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

test("thành viên: U1 ở sàn A thấy thành viên A, không thấy thành viên B", { skip }, async () => {
  await asUser(USER_1, COMPANY_A, async (c) => {
    const { rows } = await c.query("select distinct company_id from company_members order by company_id");
    assert.deepEqual(rows.map((r) => r.company_id), [COMPANY_A]);
  });
});

test("thành viên: U2 chưa đặt sàn thấy hai dòng của mình và tên A, B, không thấy C", { skip }, async () => {
  await asUser(USER_2, null, async (c) => {
    const members = await c.query("select company_id from company_members order by company_id");
    assert.deepEqual(members.rows.map((r) => r.company_id), [COMPANY_A, COMPANY_B]);
    const companies = await c.query("select id from companies order by id");
    assert.deepEqual(companies.rows.map((r) => r.id), [COMPANY_A, COMPANY_B]);
  });
});

test("thành viên: không đặt người, không đặt sàn thì rỗng", { skip }, async () => {
  await asUser(null, null, async (c) => {
    assert.equal((await c.query("select * from company_members")).rowCount, 0);
    assert.equal((await c.query("select * from companies")).rowCount, 0);
  });
});

test("thành viên: quy_hang_app không thêm được thành viên", { skip }, async () => {
  await asUser(USER_1, COMPANY_A, async (c) => {
    await expectError(
      c,
      "insert into company_members (company_id, user_id) values ($1, $2)",
      [COMPANY_C, USER_1],
      // Từ 003 vai API có quyền ghi bảng, nhưng luật theo dòng chỉ cho quản trị của sàn đang làm (USER_1 không phải).
      /row-level security/,
    );
  });
});

test("danh tính: quy_hang_app không đọc được identity.user", { skip }, async () => {
  await asUser(USER_1, COMPANY_A, async (c) => {
    await expectError(c, 'select * from identity."user"', [], /permission denied for schema identity/);
  });
});

// ---- Vai, khu và khu phụ trách (003_moi_nguoi_vai_khu) ----
const ZONE_A = "00000000-0000-4000-8000-0000000000a1";
const ZONE_B = "00000000-0000-4000-8000-0000000000b1";
const UA = "u-vk-qt-a"; // quản trị A
const UN = "u-vk-thuong"; // thuộc A, vai đầu khách
const UB = "u-vk-qt-b"; // quản trị B

/** Dựng hai sàn, ba người, khu và khu phụ trách bằng vai chủ, rồi chuyển sang vai API với người và sàn đã cho. */
async function asRole(userId, companyId, fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    await client.query(
      `insert into identity."user" (id, name, email, "emailVerified") values
         ($1, '[Tên]', 'vk-a@example.test', true), ($2, '[Tên]', 'vk-n@example.test', true), ($3, '[Tên]', 'vk-b@example.test', true)`,
      [UA, UN, UB],
    );
    await client.query(
      `insert into company_members (company_id, user_id, roles) values
         ($1, $3, '{company_admin}'), ($1, $4, '{buyer_agent}'), ($2, $5, '{company_admin}')`,
      [COMPANY_A, COMPANY_B, UA, UN, UB],
    );
    await client.query("insert into company_zones (id, company_id, name) values ($1, $2, '[Toà A]'), ($3, $4, '[Toà B]')", [
      ZONE_A,
      COMPANY_A,
      ZONE_B,
      COMPANY_B,
    ]);
    await client.query("insert into member_zones (company_id, user_id, zone_id) values ($1, $2, $3), ($4, $5, $6)", [
      COMPANY_A,
      UN,
      ZONE_A,
      COMPANY_B,
      UB,
      ZONE_B,
    ]);
    await client.query("set local role quy_hang_app");
    await client.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [userId, companyId]);
    return await fn(client);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

test("khu: khu và khu phụ trách ép luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relname, c.relrowsecurity and c.relforcerowsecurity as ep
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname in ('company_zones', 'member_zones') order by c.relname`,
    );
    assert.deepEqual(rows, [
      { relname: "company_zones", ep: true },
      { relname: "member_zones", ep: true },
    ]);
  } finally {
    await client.end();
  }
});

test("khu: quản trị A không đọc khu, khu phụ trách của B", { skip }, async () => {
  await asRole(UA, COMPANY_A, async (c) => {
    assert.deepEqual((await c.query("select id from company_zones")).rows.map((r) => r.id), [ZONE_A]);
    assert.deepEqual((await c.query("select distinct company_id from member_zones")).rows.map((r) => r.company_id), [COMPANY_A]);
  });
});

test("quản trị A không ghi thành viên, khu của B", { skip }, async () => {
  await asRole(UA, COMPANY_A, async (c) => {
    await expectError(c, "insert into company_members (company_id, user_id, roles) values ($1, $2, '{buyer_agent}')", [COMPANY_B, UA], /row-level security/);
    await expectError(c, "insert into company_zones (company_id, name) values ($1, '[Toà lạ]')", [COMPANY_B], /row-level security/);
    assert.equal((await c.query("update company_members set roles = '{telesales}' where company_id = $1", [COMPANY_B])).rowCount, 0);
    assert.equal((await c.query("delete from company_members where company_id = $1", [COMPANY_B])).rowCount, 0);
  });
});

test("vai: cơ sở dữ liệu từ chối giá trị lạ", { skip }, async () => {
  await asRole(UA, COMPANY_A, async (c) => {
    await expectError(c, "update company_members set roles = '{giam_doc}' where user_id = $1", [UN], /company_members_roles_valid/);
  });
});

test("không phải quản trị: cơ sở dữ liệu từ chối ghi thành viên, khu, khu phụ trách", { skip }, async () => {
  await asRole(UN, COMPANY_A, async (c) => {
    await expectError(c, "insert into company_members (company_id, user_id, roles) values ($1, $2, '{buyer_agent}')", [COMPANY_A, UB], /row-level security/);
    assert.equal((await c.query("update company_members set roles = '{company_admin}' where user_id = $1", [UN])).rowCount, 0, "người thường tự gắn vai quản trị");
    assert.equal((await c.query("delete from company_members where user_id = $1", [UA])).rowCount, 0);
    await expectError(c, "insert into company_zones (company_id, name) values ($1, '[Toà mới]')", [COMPANY_A], /row-level security/);
    await expectError(c, "insert into member_zones (company_id, user_id, zone_id) values ($1, $2, $3)", [COMPANY_A, UA, ZONE_A], /row-level security/);
    assert.equal((await c.query("delete from member_zones where user_id = $1", [UN])).rowCount, 0);
  });
});

test("khu: giao khu của sàn B bị khoá ngoại từ chối", { skip }, async () => {
  await asRole(UA, COMPANY_A, async (c) => {
    await expectError(c, "insert into member_zones (company_id, user_id, zone_id) values ($1, $2, $3)", [COMPANY_A, UN, ZONE_B], /member_zones_zone_fkey|foreign key/);
  });
});

test("quản trị cuối: cơ sở dữ liệu từ chối trực tiếp", { skip }, async () => {
  await asRole(UA, COMPANY_A, async (c) => {
    await expectError(c, "delete from company_members where user_id = $1", [UA], /sàn cần ít nhất một quản trị/);
    await expectError(c, "update company_members set roles = '{buyer_agent}' where user_id = $1", [UA], /sàn cần ít nhất một quản trị/);
  });
});

test("hai quản trị gỡ nhau cùng lúc: đúng một giao dịch thành công", { skip }, async () => {
  const co = "00000000-0000-4000-8000-0000000000d1";
  const [x, y] = ["u-vk-dong-x", "u-vk-dong-y"];
  const owner = new pg.Client({ connectionString: url });
  const a = new pg.Client({ connectionString: url });
  const b = new pg.Client({ connectionString: url });
  await Promise.all([owner.connect(), a.connect(), b.connect()]);
  try {
    await owner.query("insert into companies (id, name) values ($1, '[Sàn đồng thời]')", [co]);
    await owner.query(
      `insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', 'vk-x@example.test', true), ($2, '[Tên]', 'vk-y@example.test', true)`,
      [x, y],
    );
    await owner.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{company_admin}'), ($1, $3, '{company_admin}')", [co, x, y]);
    await a.query("begin");
    await b.query("begin");
    await a.query("delete from company_members where company_id = $1 and user_id = $2", [co, x]);
    const bXong = b.query("delete from company_members where company_id = $1 and user_id = $2", [co, y]).then(
      () => "ok",
      (e) => e.message,
    );
    // Cho giao dịch sau kịp chạy hết (không có khoá) hoặc kịp đứng chờ khoá (có khoá) TRƯỚC khi giao dịch đầu commit —
    // không có quãng chờ này, thứ tự hai lệnh phụ thuộc mạng và ca xanh cả khi trigger thiếu khoá.
    await new Promise((r) => setTimeout(r, 300));
    await a.query("commit");
    const kq = await bXong;
    await b.query(kq === "ok" ? "commit" : "rollback");
    assert.match(kq, /sàn cần ít nhất một quản trị/, "giao dịch thứ hai cũng gỡ được");
    const con = await owner.query("select count(*)::int n from company_members where company_id = $1 and 'company_admin' = any(roles)", [co]);
    assert.equal(con.rows[0].n, 1);
  } finally {
    await a.query("rollback").catch(() => {});
    await b.query("rollback").catch(() => {});
    await a.end();
    await b.end();
    await owner.query("delete from companies where id = $1", [co]).catch(() => {});
    await owner.query("delete from identity.\"user\" where id in ($1, $2)", [x, y]).catch(() => {});
    await owner.end();
  }
});

test("dọn sàn: xoá sàn kéo theo thành viên không bị trigger chặn", { skip }, async () => {
  await asRole(UA, COMPANY_A, async (c) => {
    await c.query("reset role");
    const del = await c.query("delete from companies where id = $1", [COMPANY_A]);
    assert.equal(del.rowCount, 1);
  });
});

// ---- Hàng và sự kiện của hàng (004_loi_hang_va_su_kien, ADR-0008) ----
const LISTING_A = "00000000-0000-4000-8000-0000000000a1";
const LISTING_B = "00000000-0000-4000-8000-0000000000b1";

/** Dựng hai sàn, một hàng mỗi sàn (sự kiện created + bản tính) bằng vai chủ, rồi sang vai API với U1 ở sàn đã cho. */
async function withListings(companyId, fn) {
  return asUser(null, null, async (c) => {
    await c.query("reset role");
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $3, 1, 'created', '{"buildingName":"[Toà A]"}', $5, '{listing_agent}', false),
              ($2, $4, 1, 'created', '{"buildingName":"[Toà B]"}', $6, '{listing_agent}', false)`,
      [COMPANY_A, COMPANY_B, LISTING_A, LISTING_B, USER_1, USER_2],
    );
    await c.query(
      `insert into listings (id, company_id, building_name, standard_status, version)
       values ($1, $3, '[Toà A]', 'Incomplete', 1), ($2, $4, '[Toà B]', 'Incomplete', 1)`,
      [LISTING_A, LISTING_B, COMPANY_A, COMPANY_B],
    );
    // Từ 046 chỉ người có Bảng hàng đọc, ghi được hàng: người ghi hàng của hai sàn là Đầu chủ (hàng bang-quyen-theo-vai).
    await c.query("update company_members set roles = '{listing_agent}' where user_id in ($1, $2)", [USER_1, USER_2]);
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.user_id', $1, true)", [USER_1]);
    if (companyId) await c.query("select set_config('app.company_id', $1, true)", [companyId]);
    return fn(c);
  });
}

test("hàng: hai bảng mới nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relname, c.relrowsecurity and c.relforcerowsecurity as ep from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname in ('listings', 'listing_events') order by c.relname`,
    );
    assert.deepEqual(rows, [{ relname: "listing_events", ep: true }, { relname: "listings", ep: true }]);
  } finally {
    await client.end();
  }
});

test("hàng: sàn A không đọc, không ghi hàng và sự kiện của sàn B", { skip }, async () => {
  await withListings(COMPANY_A, async (c) => {
    // Đối chứng: cùng câu trên hàng của chính A thì đọc và ghi được.
    assert.deepEqual((await c.query("select id from listings")).rows.map((r) => r.id), [LISTING_A]);
    assert.deepEqual((await c.query("select listing_id from listing_events")).rows.map((r) => r.listing_id), [LISTING_A]);
    assert.equal((await c.query("update listings set furnished = 'full' where id = $1", [LISTING_A])).rowCount, 1);
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 2, 'owner_confirmed', '{}', $3, '{listing_agent}', true)`,
      [COMPANY_A, LISTING_A, USER_1],
    );
    // Hàng của B: không thấy, sửa không trúng dòng nào, ghi sự kiện bị luật từ chối.
    assert.equal((await c.query("select 1 from listings where id = $1", [LISTING_B])).rowCount, 0);
    assert.equal((await c.query("update listings set furnished = 'full' where id = $1", [LISTING_B])).rowCount, 0);
    await expectError(
      c,
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 2, 'owner_confirmed', '{}', $3, '{listing_agent}', true)`,
      [COMPANY_B, LISTING_B, USER_1],
      /row-level security/,
    );
    await expectError(
      c,
      "insert into listings (id, company_id, building_name, standard_status, version) values (gen_random_uuid(), $1, '[Toà]', 'Incomplete', 1)",
      [COMPANY_B],
      /row-level security/,
    );
  });
});

test("hàng: sự kiện ghi đúng tên người đang làm", { skip }, async () => {
  await withListings(COMPANY_A, async (c) => {
    await expectError(
      c,
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 2, 'owner_confirmed', '{}', $3, '{listing_agent}', true)`,
      [COMPANY_A, LISTING_A, USER_2],
      /row-level security/,
    );
  });
});

test("sự kiện: không sửa, không xoá được, kể cả chủ bảng", { skip }, async () => {
  await withListings(COMPANY_A, async (c) => {
    // Đối chứng dương: vai API thêm được sự kiện.
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 2, 'owner_confirmed', '{}', $3, '{listing_agent}', true)`,
      [COMPANY_A, LISTING_A, USER_1],
    );
    await expectError(c, "update listing_events set payload = '{}' where listing_id = $1", [LISTING_A], /permission denied/);
    await expectError(c, "delete from listing_events where listing_id = $1", [LISTING_A], /permission denied/);
    await c.query("reset role");
    await expectError(c, "update listing_events set confirmed_with_owner = false where listing_id = $1", [LISTING_A], /chỉ thêm/);
    await expectError(c, "delete from listing_events where listing_id = $1", [LISTING_A], /chỉ thêm/);
    await expectError(c, "truncate listing_events", [], /chỉ thêm/);
    const n = await c.query("select count(*)::int n from listing_events where listing_id = $1", [LISTING_A]);
    assert.equal(n.rows[0].n, 2, "số sự kiện phải giữ nguyên");
  });
});

/** Hàm trong cơ sở dữ liệu có thân ghi vào bảng hàng hay bảng sự kiện. */
const HAM_GHI_HANG = `select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'app')
    and p.prosrc ~* '(insert\\s+into|update|delete\\s+from)\\s+(public\\.)?(listings|listing_events)\\M'
  order by p.proname`;

test("cơ sở dữ liệu: không hàm hay trigger nào ghi vào bảng hàng, bảng sự kiện", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    assert.deepEqual((await client.query(HAM_GHI_HANG)).rows.map((r) => r.proname), [], "hàm ghi thẳng vào hàng");
    // Đối chứng dương: một hàm ghi vào listing_events (dựng trong giao dịch rồi huỷ) phải bị phép liệt bắt.
    await client.query("begin");
    await client.query(
      "create function public.ghi_len_hang() returns void language sql as $$ insert into listing_events (company_id) values (null) $$",
    );
    assert.deepEqual((await client.query(HAM_GHI_HANG)).rows.map((r) => r.proname), ["ghi_len_hang"], "phép liệt không bắt hàm cấy");
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
});

// ---- Lớp trường nguồn (006_lop_truong_nguon, hàng 11: AC-2, AC-8, AC-9) ----
// Bảng 12 ô của AC-2 là tệp dữ liệu viết tay của lõi — kiểm lõi và kiểm cơ sở dữ liệu nạp CÙNG một tệp.
const BANG_XEM_NGUON = JSON.parse(
  readFileSync(new URL("../../core/src/access/bang-xem-nguon.json", import.meta.url), "utf8"),
);
const SO_MAU = "0900000012";
// Hàng 62 (migration 008): số chủ chỉ ở dạng bản mã `0x01 ‖ nonce ‖ thẻ ‖ thân` (39 byte) và dấu vết 32 byte. Bộ kiểm cách ly
// không có khoá nên dùng bản mã đúng khuôn sinh ngẫu nhiên; khứ hồi thật đo ở packages/api (ma-hoa.test.ts, test-db).
const BAN_MA_MAU = Buffer.concat([Buffer.from([1]), randomBytes(38)]);
const DAU_VET_MAU = randomBytes(32);
const U_DC = "u-ng-dau-chu"; // đầu chủ giữ các hàng «không giữ» của ma trận
const U_TN_A = "u-ng-truong-nhom-a";
const U_DC_B = "u-ng-dau-chu-b";
const LISTING_NB = "00000000-0000-4000-8000-0000000002b1"; // hàng của sàn B có chủ nhà
const nguoiO = (i) => `u-ng-o-${i}`;
const hangO = (i) => `00000000-0000-4000-8000-0000000002${String(i).padStart(2, "0")}`;

/** Dựng hai sàn, người theo từng ô của bảng, mỗi ô một hàng có chủ nhà — bằng vai chủ; rồi chuyển sang vai API ở sàn A. */
async function withNguon(fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    const nguoi = [
      [U_DC, COMPANY_A, ["listing_agent"]],
      [U_TN_A, COMPANY_A, ["team_lead"]],
      [U_DC_B, COMPANY_B, ["listing_agent"]],
      ...BANG_XEM_NGUON.map((o, i) => [nguoiO(i), COMPANY_A, o.vai]),
    ];
    for (const [id, san, vai] of nguoi) {
      await client.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [id, `${id}@example.test`]);
      await client.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [san, id, vai]);
    }
    const hang = [...BANG_XEM_NGUON.map((o, i) => [hangO(i), COMPANY_A, o.giu ? nguoiO(i) : U_DC]), [LISTING_NB, COMPANY_B, U_DC_B]];
    for (const [id, san, giu] of hang) {
      await client.query(
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, $2, 1, 'created', '{"buildingName":"[Toà]"}', $3, '{listing_agent}', false)`,
        [san, id, giu],
      );
      await client.query("insert into listings (id, company_id, building_name, standard_status, version) values ($1, $2, '[Toà]', 'Incomplete', 1)", [id, san]);
      await client.query(
        "insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, $3)",
        [san, id, giu],
      );
      await client.query(
        "insert into listing_owners (company_id, listing_id, owner_name, owner_phone_enc, owner_phone_hash, floor_price, updated_by) values ($1, $2, '[Tên]', $3, $4, 3200000000, $5)",
        [san, id, BAN_MA_MAU, DAU_VET_MAU, giu],
      );
    }
    await client.query("set local role quy_hang_app");
    await client.query("select set_config('app.company_id', $1, true)", [COMPANY_A]);
    return await fn(client);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}
const lamNguoi = (c, userId, companyId = COMPANY_A) =>
  c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [userId, companyId]);
/** Đếm sự kiện mở số của một hàng bằng vai chủ, rồi trở lại vai API. */
async function demMoSo(c, listingId) {
  await c.query("reset role");
  const n = (await c.query("select count(*)::int n from owner_phone_reveals where listing_id = $1", [listingId])).rows[0].n;
  await c.query("set local role quy_hang_app");
  return n;
}

test("lớp nguồn: ba bảng mới nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relname, c.relrowsecurity and c.relforcerowsecurity as ep from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname in ('listing_agent_assignments', 'listing_owners', 'owner_phone_reveals')
       order by c.relname`,
    );
    assert.deepEqual(rows, [
      { relname: "listing_agent_assignments", ep: true },
      { relname: "listing_owners", ep: true },
      { relname: "owner_phone_reveals", ep: true },
    ]);
  } finally {
    await client.end();
  }
});

test("lớp nguồn ở cơ sở dữ liệu: bảng 12 ô của AC-2 dưới vai quy_hang_app", { skip }, async () => {
  await withNguon(async (c) => {
    let soO = 0;
    for (const [i, o] of BANG_XEM_NGUON.entries()) {
      const hang = hangO(i);
      await lamNguoi(c, nguoiO(i));
      const thay = (await c.query("select app.can_see_source($1) t", [hang])).rows[0].t;
      assert.equal(thay, o.thay, `ô «${o.o}»: can_see_source ra ${thay}, cần ${o.thay}`);
      const truoc = await demMoSo(c, hang);
      await lamNguoi(c, nguoiO(i));
      if (o.thay) {
        assert.equal((await c.query("select owner_name from listing_owners where listing_id = $1", [hang])).rowCount, 1, o.o);
        await expectError(c, "select owner_phone from listing_owners where listing_id = $1", [hang], /permission denied/);
        assert.deepEqual((await c.query("select app.reveal_owner_phone($1) so", [hang])).rows[0].so, BAN_MA_MAU, o.o);
        assert.equal(await demMoSo(c, hang), truoc + 1, `ô «${o.o}»: mở số phải ghi đúng một sự kiện`);
      } else {
        assert.equal((await c.query("select owner_name from listing_owners where listing_id = $1", [hang])).rowCount, 0, o.o);
        assert.equal((await c.query("update listing_owners set floor_price = 1 where listing_id = $1", [hang])).rowCount, 0, o.o);
        await expectError(
          c,
          "insert into listing_owners (company_id, listing_id, owner_name, updated_by) values ($1, $2, '[Tên]', $3)",
          [COMPANY_A, hang, nguoiO(i)],
          /row-level security/,
        );
        await expectError(c, "select app.reveal_owner_phone($1)", [hang], /không có quyền mở số chủ/);
        assert.equal(await demMoSo(c, hang), truoc, `ô «${o.o}»: bị từ chối thì không ghi sự kiện`);
      }
      soO++;
    }
    assert.equal(soO, 12);
  });
});

test("lớp nguồn: sự kiện mở số và bảng gán chỉ thêm", { skip }, async () => {
  await withNguon(async (c) => {
    const hang = hangO(0);
    await lamNguoi(c, nguoiO(0));
    await expectError(
      c,
      "insert into owner_phone_reveals (company_id, listing_id, actor_user_id, actor_roles) values ($1, $2, $3, '{listing_agent}')",
      [COMPANY_A, hang, nguoiO(0)],
      /permission denied/,
    );
    await c.query("select app.reveal_owner_phone($1)", [hang]);
    for (const bang of ["owner_phone_reveals", "listing_agent_assignments"]) {
      await expectError(c, `update ${bang} set listing_id = listing_id where listing_id = $1`, [hang], /permission denied/);
      await expectError(c, `delete from ${bang} where listing_id = $1`, [hang], /permission denied/);
    }
    await c.query("reset role");
    for (const bang of ["owner_phone_reveals", "listing_agent_assignments"]) {
      await expectError(c, `update ${bang} set listing_id = listing_id where listing_id = $1`, [hang], /chỉ thêm/);
      await expectError(c, `delete from ${bang} where listing_id = $1`, [hang], /chỉ thêm/);
      await expectError(c, `truncate ${bang}`, [], /chỉ thêm/);
    }
    assert.equal((await c.query("select count(*)::int n from owner_phone_reveals where listing_id = $1", [hang])).rows[0].n, 1);
    assert.equal((await c.query("select count(*)::int n from listing_agent_assignments where listing_id = $1", [hang])).rows[0].n, 1);
  });
});

test("lớp nguồn: sự kiện của hàng mang khoá nguồn bị ràng buộc từ chối", { skip }, async () => {
  await withNguon(async (c) => {
    await c.query("reset role");
    const cau = `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
                 values ($1, $2, 2, 'owner_confirmed', $3, $4, '{listing_agent}', true)`;
    for (const khoa of ["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto"]) {
      await expectError(c, cau, [COMPANY_A, hangO(0), JSON.stringify({ [khoa]: SO_MAU }), U_DC], /listing_events_no_source/);
    }
    // Đối chứng dương: cùng câu, payload rỗng thì thêm được.
    assert.equal((await c.query(cau, [COMPANY_A, hangO(0), "{}", U_DC])).rowCount, 1);
  });
});

test("lớp nguồn: sàn A không đọc, không ghi đầu chủ, chủ nhà, sự kiện mở số của sàn B", { skip }, async () => {
  await withNguon(async (c) => {
    await lamNguoi(c, U_TN_A);
    // Đối chứng dương: trưởng nhóm A đọc, mở số được trên hàng của A.
    assert.equal((await c.query("select 1 from listing_owners where listing_id = $1", [hangO(1)])).rowCount, 1);
    assert.equal((await c.query("select 1 from listing_agent_assignments where listing_id = $1", [hangO(1)])).rowCount, 1);
    assert.deepEqual((await c.query("select app.reveal_owner_phone($1) so", [hangO(1)])).rows[0].so, BAN_MA_MAU);
    // Hàng của B.
    const truoc = await demMoSo(c, LISTING_NB);
    await lamNguoi(c, U_TN_A);
    for (const bang of ["listing_owners", "listing_agent_assignments", "owner_phone_reveals"]) {
      assert.equal((await c.query(`select 1 from ${bang} where listing_id = $1`, [LISTING_NB])).rowCount, 0, bang);
    }
    assert.equal((await c.query("update listing_owners set floor_price = 1 where listing_id = $1", [LISTING_NB])).rowCount, 0);
    await expectError(
      c,
      "insert into listing_owners (company_id, listing_id, owner_name, updated_by) values ($1, $2, '[Tên]', $3)",
      [COMPANY_B, LISTING_NB, U_TN_A],
      /row-level security/,
    );
    await expectError(
      c,
      "insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 2, $3, $3)",
      [COMPANY_B, LISTING_NB, U_TN_A],
      /row-level security/,
    );
    await expectError(c, "select app.reveal_owner_phone($1)", [LISTING_NB], /không có quyền mở số chủ/);
    assert.equal(await demMoSo(c, LISTING_NB), truoc, "sự kiện mở số của B không đổi");
  });
});

// ---- Hai sàn cùng tên (hàng 56, mo-san-trung-ten): người sàn mới không đọc được dòng nào của sàn cũ ----
const CHEN_CHU = (cot) =>
  `insert into listing_owners (company_id, listing_id, owner_name, ${cot}, updated_by) values ($1, $2, '[Tên]', $3, $4)`;

test("số chủ: cơ sở dữ liệu từ chối số rõ ở mọi vai", { skip }, async () => {
  await withNguon(async (c) => {
    // Vai API (đầu chủ giữ hàng ô 0, hàng đã có chủ nhà): sửa số rõ bị từ chối; vai chủ: chèn và sửa số rõ bị từ chối.
    const hang = hangO(0);
    await lamNguoi(c, nguoiO(0));
    await c.query("savepoint sp");
    await expectError(c, "update listing_owners set owner_phone = $2 where listing_id = $1", [hang, SO_MAU], /listing_owners_phone_chi_ban_ma/);
    await c.query("rollback to savepoint sp");
    await c.query("reset role");
    await expectError(c, "update listing_owners set owner_phone = $2 where listing_id = $1", [hang, SO_MAU], /listing_owners_phone_chi_ban_ma/);
    await c.query("delete from listing_owners where listing_id = $1", [hang]);
    await expectError(c, CHEN_CHU("owner_phone"), [COMPANY_A, hang, SO_MAU, U_DC], /listing_owners_phone_chi_ban_ma/);
    // Đối chứng dương: cùng hàng, số ở dạng bản mã đúng khuôn thì chèn được.
    const ok = await c.query(
      "insert into listing_owners (company_id, listing_id, owner_name, owner_phone_enc, owner_phone_hash, updated_by) values ($1, $2, '[Tên]', $3, $4, $5)",
      [COMPANY_A, hang, BAN_MA_MAU, DAU_VET_MAU, U_DC],
    );
    assert.equal(ok.rowCount, 1);
    assert.equal((await c.query("select has_phone from listing_owners where listing_id = $1", [hang])).rows[0].has_phone, true);
  });
});

test("số chủ: bản mã sai khuôn bị từ chối", { skip }, async () => {
  await withNguon(async (c) => {
    await c.query("reset role");
    const hang = hangO(0);
    const sai = [
      ["byte đầu 0x02", Buffer.concat([Buffer.from([2]), randomBytes(38)]), DAU_VET_MAU, /listing_owners_phone_enc_khuon/],
      ["bản mã 20 byte", Buffer.concat([Buffer.from([1]), randomBytes(19)]), DAU_VET_MAU, /listing_owners_phone_enc_khuon/],
      ["dấu vết 16 byte", BAN_MA_MAU, randomBytes(16), /listing_owners_phone_hash_khuon/],
      ["bản mã không dấu vết", BAN_MA_MAU, null, /listing_owners_phone_cap/],
    ];
    for (const [ten, enc, hash, loi] of sai) {
      await c.query("savepoint sp");
      await expectError(c, "update listing_owners set owner_phone_enc = $2, owner_phone_hash = $3 where listing_id = $1", [hang, enc, hash], loi);
      await c.query("rollback to savepoint sp");
      assert.ok(ten);
    }
  });
});

test("số chủ: vai API không đọc ba cột số", { skip }, async () => {
  await withNguon(async (c) => {
    const hang = hangO(0);
    await lamNguoi(c, nguoiO(0));
    for (const cot of ["owner_phone", "owner_phone_enc", "owner_phone_hash"]) {
      await c.query("savepoint sp");
      await expectError(c, `select ${cot} from listing_owners where listing_id = $1`, [hang], /permission denied/);
      await c.query("rollback to savepoint sp");
    }
    // Đối chứng dương: cờ «có số» đọc được.
    assert.equal((await c.query("select has_phone from listing_owners where listing_id = $1", [hang])).rows[0].has_phone, true);
  });
});

test("lược đồ: mọi cột chữ tên chứa phone bị ràng buộc is null", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    assert.deepEqual((await client.query("select cot from app.cot_so_ro_chua_chan()")).rows, [], "cột số dạng chữ không bị chặn");
    // Đối chứng âm cùng hàm quét: một bảng cấy cột số dạng chữ phải bị gọi tên.
    await client.query("create table public.x_quet (x_phone text, x_phone_enc bytea)");
    assert.deepEqual((await client.query("select cot from app.cot_so_ro_chua_chan()")).rows, [{ cot: "public.x_quet.x_phone" }]);
    await client.query("alter table public.x_quet add constraint x_quet_chan check (x_phone is null)");
    assert.deepEqual((await client.query("select cot from app.cot_so_ro_chua_chan()")).rows, []);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
});

test("sàn trùng tên: người sàn mới không đọc được dòng nào của sàn cũ", { skip }, async () => {
  const { moSan } = await import("../scripts/mo-san.mjs");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    const nhan = Math.random().toString(36).slice(2, 8);
    const ten = `[Sàn trùng iso ${nhan}]`;
    // Mở bằng công cụ thật, không chèn tay bảng sàn.
    const cu = await moSan(client, { ten, email: `iso-cu-${nhan}@example.test` });
    const moi = await moSan(client, { ten, email: `iso-moi-${nhan}@example.test` });
    assert.notEqual(moi.companyId, cu.companyId, "hai sàn trùng tên cùng mã");
    // Mỗi sàn một hàng (sự kiện created + bản tính), dựng bằng vai chủ.
    for (const [san, nguoi] of [[cu.companyId, cu.userId], [moi.companyId, moi.userId]]) {
      const hang = (await client.query("select gen_random_uuid() id")).rows[0].id;
      await client.query(
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, $2, 1, 'created', '{"buildingName":"[Toà]"}', $3, '{listing_agent}', false)`,
        [san, hang, nguoi],
      );
      await client.query(
        "insert into listings (id, company_id, building_name, standard_status, version) values ($1, $2, '[Toà]', 'Incomplete', 1)",
        [hang, san],
      );
    }
    // Danh sách bảng có cột company_id rút từ cơ sở dữ liệu; chỉ bảng sàn cũ thật sự có dòng mới tính là đã xét.
    const bang = (
      await client.query(
        `select table_name from information_schema.columns
         where table_schema = 'public' and column_name = 'company_id' order by table_name`,
      )
    ).rows.map((r) => r.table_name);
    const daXet = [];
    const rong = [];
    for (const t of bang) {
      const n = Number((await client.query(`select count(*) n from public."${t}" where company_id = $1`, [cu.companyId])).rows[0].n);
      (n > 0 ? daXet : rong).push(t);
    }
    assert.equal(daXet.length + rong.length, bang.length, "số bảng đã xét phải bằng danh sách rút ra");
    for (const t of ["company_members", "listings", "listing_events"]) assert.ok(daXet.includes(t), `bảng ${t} không có dòng của sàn cũ để xét`);

    await client.query("set local role quy_hang_app");
    const dat = async (nguoi, san) => {
      await client.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [nguoi, san]);
    };
    // Đối chứng dương: quản trị sàn cũ đặt sàn cũ thấy dòng của sàn cũ.
    await dat(cu.userId, cu.companyId);
    assert.equal((await client.query("select 1 from companies where id = $1", [cu.companyId])).rowCount, 1, "quản trị cũ không thấy sàn của mình");
    assert.ok((await client.query("select 1 from company_members where company_id = $1", [cu.companyId])).rowCount > 0, "quản trị cũ không thấy thành viên sàn mình");
    await dat(moi.userId, moi.companyId);
    for (const t of daXet) {
      const n = (await client.query(`select 1 from public."${t}" where company_id = $1`, [cu.companyId])).rowCount;
      assert.equal(n, 0, `người sàn mới đọc được ${n} dòng của sàn cũ ở bảng ${t}`);
    }
    assert.equal((await client.query("select 1 from companies where id = $1", [cu.companyId])).rowCount, 0, "người sàn mới thấy sàn cũ");
    // Người chỉ đặt được sàn mình là thành viên: API chọn sàn trong danh sách thành viên (packages/api/src/auth/company.ts).
    // Luật theo dòng tin sàn đang đặt — kiểm thành viên ở cơ sở dữ liệu là hàng mới (chủ kho 31/10).
    await client.query("reset role");
    const thanhVienCu = (await client.query("select 1 from company_members where company_id = $1 and user_id = $2", [cu.companyId, moi.userId])).rowCount;
    assert.equal(thanhVienCu, 0, "người mới là thành viên sàn cũ");
    const sanChonDuoc = (
      await client.query(
        "select c.id from companies c join company_members m on m.company_id = c.id and m.user_id = $1 order by c.id",
        [moi.userId],
      )
    ).rows.map((r) => r.id);
    assert.deepEqual(sanChonDuoc, [moi.companyId], "đường chọn sàn của API chọn được sàn khác sàn mới");
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
});

// ---- Ô nhận lead (007_o_nhan_lead, hàng 24: AC-6, AC-7) ----
const LEAD_B = "00000000-0000-4000-8000-0000000003b1";
const MO = ["Incomplete", "Active", "Pending", "Hold"];

/** Sàn B có hàng mở trên căn «A-02.06» của «[Toà]», chủ nhà mang số mẫu và một lead; người hỏi ở sàn A. */
async function withLeadB(fn) {
  return withNguon(async (c) => {
    await c.query("reset role");
    await c.query("update listings set unit_number = 'A-02.06' where id = $1", [LISTING_NB]);
    await c.query(
      `insert into leads (id, company_id, created_by, building_name, unit_number, need, list_price, fee_inclusion,
                          desired_listing_time, owner_phone_enc, owner_phone_hash, outcome, matched_agent_user_id, matched_listing_id)
       values ($1, $2, $3, '[Toà]', 'A-02.06', 'sale', 3200000000, 'included', 'now', $4, $5, 'unit_has_open_listing', $3, $6)`,
      [LEAD_B, COMPANY_B, U_DC_B, BAN_MA_MAU, DAU_VET_MAU, LISTING_NB],
    );
    await c.query("set local role quy_hang_app");
    return fn(c);
  });
}

test("lead: bảng leads nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query("select relrowsecurity r, relforcerowsecurity f from pg_class where relname = 'leads'");
    assert.deepEqual(rows, [{ r: true, f: true }]);
  } finally {
    await client.end();
  }
});

test("lead: sàn A không thấy dữ kiện, lead của sàn B và không ghi được lead đứng tên B", { skip }, async () => {
  await withLeadB(async (c) => {
    // Đối chứng dương: ở sàn B cùng số, cùng căn ra đủ hai dữ kiện.
    await lamNguoi(c, U_DC_B, COMPANY_B);
    // Hàng 62 (migration 009): hàm dữ kiện nhận dấu vết; bộ dựng dùng chung một dấu vết mẫu cho chủ nhà và lead.
    const b = (await c.query("select * from app.lead_dedupe_facts($1, '[Toà]', 'a 02.06', $2)", [DAU_VET_MAU, MO])).rows[0];
    assert.deepEqual(b, { open_listing_id: LISTING_NB, open_listing_agent: U_DC_B, owner_agent: U_DC_B });
    assert.equal((await c.query("select 1 from leads where id = $1", [LEAD_B])).rowCount, 1);
    // Sàn A: cùng số, cùng toà, cùng căn — không dữ kiện nào của B.
    await lamNguoi(c, U_TN_A);
    const a = (await c.query("select * from app.lead_dedupe_facts($1, '[Toà]', 'A-02.06', $2)", [DAU_VET_MAU, MO])).rows[0];
    assert.equal(a.open_listing_id, null, "sàn A thấy hàng mở của sàn B");
    // Số mẫu cũng là chủ nhà của mọi hàng sàn A (withNguon) — dữ kiện chủ phải là đầu chủ của A, không phải của B.
    assert.notEqual(a.owner_agent, U_DC_B, "sàn A thấy đầu chủ của sàn B");
    assert.equal((await c.query("select 1 from leads where id = $1", [LEAD_B])).rowCount, 0, "trưởng nhóm A đọc lead của B");
    await expectError(
      c,
      `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time,
                          owner_phone_enc, owner_phone_hash, outcome)
       values (gen_random_uuid(), $1, $2, '[Toà]', 'sale', 1, 'included', 'now', $3, $4, 'new')`,
      [COMPANY_B, U_TN_A, BAN_MA_MAU, DAU_VET_MAU],
      /row-level security/,
    );
    await expectError(c, "select app.discard_lead($1)", [LEAD_B], /không có lead này/);
  });
});

test("lead: vai API không đọc được cột số, không sửa, không xoá lead", { skip }, async () => {
  await withLeadB(async (c) => {
    await lamNguoi(c, U_DC_B, COMPANY_B);
    // Đối chứng dương: cột kết quả đọc được.
    assert.equal((await c.query("select outcome from leads where id = $1", [LEAD_B])).rows[0].outcome, "unit_has_open_listing");
    await expectError(c, "select owner_phone from leads where id = $1", [LEAD_B], /permission denied/);
    await expectError(c, "update leads set outcome = 'new' where id = $1", [LEAD_B], /permission denied/);
    await expectError(c, "delete from leads where id = $1", [LEAD_B], /permission denied/);
  });
});

const CHEN_LEAD = (cot) =>
  `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time, ${cot}, outcome)
   values (gen_random_uuid(), $1, $2, '[Toà]', 'sale', 1, 'included', 'now', $3, $4, 'new')`;

test("số chủ của lead: cơ sở dữ liệu từ chối số rõ, vai API không đọc ba cột", { skip }, async () => {
  await withLeadB(async (c) => {
    await lamNguoi(c, U_DC_B, COMPANY_B);
    for (const cot of ["owner_phone", "owner_phone_enc", "owner_phone_hash"]) {
      await c.query("savepoint sp");
      await expectError(c, `select ${cot} from leads where id = $1`, [LEAD_B], /permission denied/);
      await c.query("rollback to savepoint sp");
    }
    // Vai API (telesales vai đầu chủ của B) chèn lead số rõ: ràng buộc từ chối.
    await c.query("savepoint sp");
    await expectError(c, CHEN_LEAD("owner_phone, owner_phone_hash"), [COMPANY_B, U_DC_B, SO_MAU, DAU_VET_MAU], /leads_phone_chi_ban_ma|leads_phone_cap/);
    await c.query("rollback to savepoint sp");
    await c.query("reset role");
    await expectError(c, "update leads set owner_phone = $2 where id = $1", [LEAD_B, SO_MAU], /leads_phone_chi_ban_ma/);
    // Đối chứng dương: bản mã đúng khuôn chèn được.
    await c.query("set local role quy_hang_app");
    await lamNguoi(c, U_DC_B, COMPANY_B);
    assert.equal((await c.query(CHEN_LEAD("owner_phone_enc, owner_phone_hash"), [COMPANY_B, U_DC_B, BAN_MA_MAU, DAU_VET_MAU])).rowCount, 1);
  });
});

test("số chủ của lead: lead không số bị từ chối", { skip }, async () => {
  await withLeadB(async (c) => {
    await c.query("reset role");
    await expectError(
      c,
      `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time, outcome)
       values (gen_random_uuid(), $1, $2, '[Toà]', 'sale', 1, 'included', 'now', 'new')`,
      [COMPANY_B, U_DC_B],
      /leads_phone_co_so/,
    );
    // Đối chứng dương: cùng câu, có bản mã và dấu vết thì chèn được.
    assert.equal((await c.query(CHEN_LEAD("owner_phone_enc, owner_phone_hash"), [COMPANY_B, U_DC_B, BAN_MA_MAU, DAU_VET_MAU])).rowCount, 1);
  });
});

test("lead: khoá mã căn giữ chữ và số, bỏ dấu, viết hoa", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const BANG = [
      ["A-12.06", "A1206"],
      ["a 12.06", "A1206"],
      ["A.12-06", "A1206"],
      ["B-12.06", "B1206"],
      ["  ", null],
      [null, null],
    ];
    let dem = 0;
    for (const [vao, ra] of BANG) {
      assert.equal((await client.query("select app.unit_key($1) k", [vao])).rows[0].k, ra, String(vao));
      dem++;
    }
    assert.equal(dem, 6);
  } finally {
    await client.end();
  }
});

// ---- Chia lead và hạn (011_chia_lead_va_han, hàng 25: AC-9) ----
const DC_A = "u-cl-dau-chu-a";
const TN_A = "u-cl-truong-nhom-a";
const QT_A = "u-cl-quan-tri-a";
const NG_B = "u-cl-nguoi-b"; // sàn B: đầu chủ, trưởng nhóm, quản trị — đủ vai để mọi hàm qua cổng vai
const ZONE_CL_A = "00000000-0000-4000-8000-0000000004a1";
const L_CHUA_DAU = "00000000-0000-4000-8000-0000000004a2"; // lead A chưa đóng dấu
const L_CHO = "00000000-0000-4000-8000-0000000004a3"; // lead A đã đóng dấu, chờ chia
const L_VE = "00000000-0000-4000-8000-0000000004a4"; // lead A đã về DC_A
const L_KHO = "00000000-0000-4000-8000-0000000004a5"; // lead A ở kho chung
const L_B = "00000000-0000-4000-8000-0000000004b1"; // lead B chờ chia

/** Sàn A có đầu chủ phụ trách «Toà A», trưởng nhóm, quản trị, bốn lead, một dòng cấu hình, một người nghỉ, một lời báo;
 * sàn B có một người đủ vai và một lead. Dựng bằng vai chủ rồi chuyển sang vai API. */
async function withChia(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    for (const [id, san, vai] of [
      [DC_A, COMPANY_A, ["listing_agent"]],
      [TN_A, COMPANY_A, ["team_lead"]],
      [QT_A, COMPANY_A, ["company_admin"]],
      [NG_B, COMPANY_B, ["listing_agent", "team_lead", "company_admin"]],
    ]) {
      await c.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [id, `${id}@example.test`]);
      await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [san, id, vai]);
    }
    await c.query("insert into company_zones (id, company_id, name) values ($1, $2, 'Toà A')", [ZONE_CL_A, COMPANY_A]);
    await c.query("insert into member_zones (company_id, user_id, zone_id) values ($1, $2, $3)", [COMPANY_A, DC_A, ZONE_CL_A]);
    const lead = (id, san, them = "") =>
      c.query(
        `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time,
                            owner_phone_enc, owner_phone_hash, outcome ${them ? ", " + them.split("=")[0] : ""})
         values ($1, $2, $3, 'Toà A', 'sale', 1, 'included', 'now', $4, $5, 'new' ${them ? ", " + them.split("=")[1] : ""})`,
        [id, san, san === COMPANY_A ? TN_A : NG_B, Buffer.concat([Buffer.from([1]), randomBytes(38)]), randomBytes(32)],
      );
    await lead(L_CHUA_DAU, COMPANY_A);
    await lead(L_CHO, COMPANY_A, "routing_strategy, accept_minutes, first_call_minutes='zone_round_robin', 15, 30");
    await lead(L_KHO, COMPANY_A, "routing_strategy, accept_minutes, first_call_minutes='open_pool', 15, 30");
    await lead(L_B, COMPANY_B, "routing_strategy, accept_minutes, first_call_minutes='zone_round_robin', 15, 30");
    await lead(
      L_VE,
      COMPANY_A,
      `routing_strategy, accept_minutes, first_call_minutes, matched_agent_user_id, routed_at, routed_seq='zone_round_robin', 15, 30, '${DC_A}', now(), nextval('app.lead_routing_seq')`,
    );
    await c.query(
      "insert into company_settings (company_id, key, value, updated_by) values ($1, 'lead_routing.alert_to', '\"team_lead_and_admin\"', $2)",
      [COMPANY_A, QT_A],
    );
    await c.query("insert into member_availability (company_id, user_id, on_leave, changed_by) values ($1, $2, false, $2)", [COMPANY_A, DC_A]);
    await c.query(
      "insert into lead_alerts (company_id, lead_id, kind, agent_user_id, deadline_from, raised_at) values ($1, $2, 'accept_overdue', $3, now(), now())",
      [COMPANY_A, L_VE, DC_A],
    );
    await c.query("set local role quy_hang_app");
    return await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}
/** Đọc bằng vai chủ rồi trở lại vai API với người và sàn đã cho. */
async function docChu(c, sql, params, quayVe) {
  await c.query("reset role");
  const r = (await c.query(sql, params)).rows;
  await c.query("set local role quy_hang_app");
  await lamNguoi(c, quayVe[0], quayVe[1]);
  return r;
}
const dongLead = (c, id, quayVe) =>
  docChu(
    c,
    "select matched_agent_user_id, routing_strategy, accepted_at, first_called_at, reassign_count from leads where id = $1",
    [id],
    quayVe,
  ).then((r) => r[0]);
const demBao = (c, quayVe) => docChu(c, "select count(*)::int n from lead_alerts where company_id = $1", [COMPANY_A], quayVe).then((r) => r[0].n);

test("chia lead: ba bảng mới nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select relname, relrowsecurity r, relforcerowsecurity f from pg_class
       where relname in ('company_settings', 'member_availability', 'lead_alerts') order by relname`,
    );
    assert.deepEqual(rows, [
      { relname: "company_settings", r: true, f: true },
      { relname: "lead_alerts", r: true, f: true },
      { relname: "member_availability", r: true, f: true },
    ]);
  } finally {
    await client.end();
  }
});

test("chia lead: hàm ghi của sàn B không đổi lead nào của sàn A, cùng lời gọi dưới A đổi đúng một dòng", { skip }, async () => {
  await withChia(async (c) => {
    // Mỗi ca: [tên, người A, lời gọi, đọc lại, kết quả mong dưới B (mã lỗi hay giá trị)]
    const ca = [
      ["stamp_leads", TN_A, "select app.stamp_leads('manual', 5, 10) v", L_CHUA_DAU, { tra: 0 }],
      ["route_lead", TN_A, `select app.route_lead('${L_CHO}', '${DC_A}', now()) v`, L_CHO, { tra: false }],
      ["claim_lead", DC_A, `select app.claim_lead('${L_KHO}') v`, L_KHO, { loi: /không có lead kho chung này/ }],
      ["accept_lead", DC_A, `select app.accept_lead('${L_VE}') v`, L_VE, { loi: /không có lead này của người gọi/ }],
      ["reassign_lead", TN_A, `select app.reassign_lead('${L_VE}', '${DC_A}') v`, L_VE, { loi: /không có lead này/ }],
      ["mark_first_call", DC_A, `select app.mark_first_call('${L_VE}') v`, L_VE, { loi: /không có lead này của người gọi/ }],
    ];
    let so = 0;
    for (const [ten, nguoiA, sql, id, mong] of ca) {
      // Dưới sàn B, cùng mã người của A (không thuộc B) và người đủ vai của B: dòng của A không đổi.
      for (const ai of [nguoiA, NG_B]) {
        await lamNguoi(c, ai, COMPANY_B);
        const truoc = await dongLead(c, id, [ai, COMPANY_B]);
        if (mong.loi && ai === NG_B) await expectError(c, sql, [], mong.loi);
        else {
          await c.query("savepoint sp");
          const r = await c.query(sql).then((x) => x.rows[0].v, (e) => e);
          await c.query("rollback to savepoint sp");
          if (mong.loi) assert.ok(r instanceof Error, `${ten}: B gọi được`);
          else assert.equal(r, mong.tra, `${ten} dưới B`);
        }
        assert.deepEqual(await dongLead(c, id, [ai, COMPANY_B]), truoc, `${ten}: dòng của A đổi dưới B`);
      }
      // Đối chứng dương: cùng lời gọi dưới A đổi dòng ấy.
      await lamNguoi(c, nguoiA, COMPANY_A);
      const truoc = await dongLead(c, id, [nguoiA, COMPANY_A]);
      await c.query(sql);
      assert.notDeepEqual(await dongLead(c, id, [nguoiA, COMPANY_A]), truoc, `${ten}: đối chứng dưới A không đổi gì`);
      so++;
    }
    assert.equal(so, ca.length);
    // raise_lead_alert: B không chèn được lời báo cho lead của A; dưới A chèn đúng một dòng.
    await lamNguoi(c, NG_B, COMPANY_B);
    const truoc = await demBao(c, [NG_B, COMPANY_B]);
    assert.equal((await c.query("select app.raise_lead_alert($1, 'unrouted', now(), now()) v", [L_CHO])).rows[0].v, false);
    assert.equal(await demBao(c, [NG_B, COMPANY_B]), truoc, "B chèn được lời báo cho lead của A");
    await lamNguoi(c, TN_A, COMPANY_A);
    const l2 = "00000000-0000-4000-8000-0000000004a6";
    await c.query("reset role");
    await c.query(
      `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time,
                          owner_phone_enc, owner_phone_hash, outcome, routing_strategy, accept_minutes, first_call_minutes)
       values ($1, $2, $3, 'Toà A', 'sale', 1, 'included', 'now', $4, $5, 'new', 'manual', 15, 30)`,
      [l2, COMPANY_A, TN_A, Buffer.concat([Buffer.from([1]), randomBytes(38)]), randomBytes(32)],
    );
    await c.query("set local role quy_hang_app");
    await lamNguoi(c, TN_A, COMPANY_A);
    assert.equal((await c.query("select app.raise_lead_alert($1, 'unrouted', now(), now()) v", [l2])).rows[0].v, true);
    assert.equal(await demBao(c, [TN_A, COMPANY_A]), truoc + 1, "đối chứng: dưới A không chèn đúng một dòng");
  });
});

test("chia lead: hàm đọc và bảng mới của sàn B không trả dòng nào của sàn A", { skip }, async () => {
  await withChia(async (c) => {
    const idA = [L_CHUA_DAU, L_CHO, L_VE, L_KHO];
    const nguoiA = [DC_A, TN_A, QT_A];
    // Đối chứng dương dưới A: mỗi hàm và bảng có dòng.
    await lamNguoi(c, DC_A, COMPANY_A);
    const a = {
      queue: (await c.query("select * from app.lead_routing_queue()")).rows,
      cand: (await c.query("select * from app.lead_routing_candidates()")).rows,
      facts: (await c.query("select * from app.lead_deadline_facts()")).rows,
      pool: (await c.query("select * from app.lead_pool()")).rows,
      settings: (await c.query("select * from app.lead_routing_settings_rows()")).rows,
      admin: (await c.query("select app.lead_alerts_to_admin() v")).rows[0].v,
    };
    assert.ok(a.queue.length && a.cand.length && a.facts.length && a.pool.length && a.settings.length, "đối chứng dưới A rỗng");
    assert.equal(a.admin, true);
    for (const bang of ["company_settings", "member_availability"]) {
      assert.ok((await c.query(`select 1 from ${bang} where company_id = $1`, [COMPANY_A])).rowCount > 0, `${bang} dưới A rỗng`);
    }
    await lamNguoi(c, TN_A, COMPANY_A);
    assert.ok((await c.query("select 1 from lead_alerts where company_id = $1", [COMPANY_A])).rowCount > 0, "lead_alerts dưới A rỗng");
    assert.ok((await c.query("select * from app.lead_alert_list()")).rowCount > 0, "danh sách báo dưới A rỗng");
    // Dưới B.
    await lamNguoi(c, NG_B, COMPANY_B);
    const ids = (rows) => rows.map((r) => r.lead_id);
    assert.deepEqual(ids((await c.query("select * from app.lead_routing_queue()")).rows).filter((x) => idA.includes(x)), []);
    assert.deepEqual((await c.query("select * from app.lead_routing_candidates()")).rows.map((r) => r.user_id).filter((x) => nguoiA.includes(x)), []);
    assert.deepEqual(ids((await c.query("select * from app.lead_deadline_facts()")).rows).filter((x) => idA.includes(x)), []);
    assert.deepEqual(ids((await c.query("select * from app.lead_pool()")).rows).filter((x) => idA.includes(x)), []);
    assert.deepEqual((await c.query("select * from app.lead_routing_settings_rows()")).rows, []);
    assert.deepEqual(ids((await c.query("select * from app.lead_alert_list()")).rows).filter((x) => idA.includes(x)), []);
    assert.equal((await c.query("select app.lead_alerts_to_admin() v")).rows[0].v, false, "B mang cấu hình người đọc báo của A");
    for (const bang of ["company_settings", "lead_alerts", "member_availability"]) {
      assert.equal((await c.query(`select 1 from ${bang} where company_id = $1`, [COMPANY_A])).rowCount, 0, `${bang} của A lộ sang B`);
    }
    await expectError(
      c,
      "insert into company_settings (company_id, key, value, updated_by) values ($1, 'lead_routing.strategy', '\"manual\"', $2)",
      [COMPANY_A, NG_B],
      /row-level security/,
    );
    // Đối chứng dương: quản trị B ghi được cấu hình của chính B.
    assert.equal(
      (await c.query(
        "insert into company_settings (company_id, key, value, updated_by) values ($1, 'lead_routing.strategy', '\"manual\"', $2)",
        [COMPANY_B, NG_B],
      )).rowCount,
      1,
    );
    for (const sql of [
      "update leads set routing_strategy = 'manual' where id = $1",
      "delete from leads where id = $1",
      "update lead_alerts set kind = 'unrouted' where lead_id = $1",
      "delete from lead_alerts where lead_id = $1",
    ]) {
      await expectError(c, sql, [L_B], /permission denied/);
    }
    const f = await c.query("select * from app.lead_job_companies()");
    assert.deepEqual(f.fields.map((x) => x.name), ["company_id"]);
  });
});

test("chia lead: cấu hình chỉ quản trị sàn ghi được, ghi đúng tên người đổi", { skip }, async () => {
  await withChia(async (c) => {
    const chen = "insert into company_settings (company_id, key, value, updated_by) values ($1, 'lead_routing.accept_minutes', '5', $2)";
    for (const ai of [DC_A, TN_A]) {
      await lamNguoi(c, ai, COMPANY_A);
      await expectError(c, chen, [COMPANY_A, ai], /row-level security/);
    }
    await lamNguoi(c, QT_A, COMPANY_A);
    await expectError(c, chen, [COMPANY_A, TN_A], /row-level security/);
    await expectError(c, "insert into company_settings (company_id, key, value, updated_by) values ($1, 'Lead Routing', '1', $2)", [COMPANY_A, QT_A], /company_settings_key_check/);
    assert.equal((await c.query(chen, [COMPANY_A, QT_A])).rowCount, 1);
  });
});

// ---- Cách gọi riêng (039_cach_goi_rieng, hàng 45: E8) ----
test("cách gọi: dòng labels.* theo sàn", { skip }, async () => {
  await withChia(async (c) => {
    const chen = "insert into company_settings (company_id, key, value, updated_by) values ($1, $2, $3::jsonb, $4)";
    await lamNguoi(c, QT_A, COMPANY_A);
    await c.query(chen, [COMPANY_A, "labels.field.feeInclusion", '"Phí CN"', QT_A]);
    await c.query(chen, [COMPANY_A, "labels.value.feeInclusion", '{"included":"BP"}', QT_A]);
    // Đối chứng dương: quản trị A đọc được hai dòng nhãn của A.
    const docNhan = () => c.query("select key from company_settings where company_id = $1 and key like 'labels.%' order by key", [COMPANY_A]);
    assert.deepEqual((await docNhan()).rows.map((r) => r.key), ["labels.field.feeInclusion", "labels.value.feeInclusion"]);
    // Sàn B không đọc được dòng nhãn nào của A.
    await lamNguoi(c, NG_B, COMPANY_B);
    assert.equal((await docNhan()).rowCount, 0, "sàn B đọc được nhãn của sàn A");
    // Check khoá chỉ mở đúng hai họ nhãn, tên trường RESO camelCase.
    for (const k of ["labels.field.Fee Inclusion", "labels.other.feeInclusion", "labels.field.FeeInclusion"]) {
      await expectError(c, chen, [COMPANY_B, k, '"x"', NG_B], /company_settings_key_check/);
    }
  });
});

// ---- Lead bốn nấc (015_lead_bon_nac, hàng 27: AC-9) ----
const BN_DC_A = "u-bn-dau-chu-a";
const BN_TS_A = "u-bn-telesales-a";
const BN_NG_B = "u-bn-nguoi-b"; // sàn B: đầu chủ, telesales, trưởng nhóm
const BN_TRA = "00000000-0000-4000-8000-0000000005a1"; // lead A đã về BN_DC_A, chưa trả lại
const BN_DA_TRA = "00000000-0000-4000-8000-0000000005a2"; // lead A đã trả lại, chưa gửi lại
const BN_MOI = "00000000-0000-4000-8000-0000000005a3"; // lead A mới của cùng người nhập
const BN_LEN = "00000000-0000-4000-8000-0000000005a4"; // lead A đã lên bảng
const BN_HANG = "00000000-0000-4000-8000-0000000005a5";
const BN_B = "00000000-0000-4000-8000-0000000005b1"; // lead B của BN_NG_B

/** Sàn A: đầu chủ, telesales, bốn lead chủ trùng và một hàng Sẵn sàng bán của đầu chủ với chủ nhà mang dấu vết số của
 * BN_LEN; sàn B: một người đủ vai và một lead. Dựng bằng vai chủ rồi chuyển sang vai API. */
async function withBonNac(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    for (const [id, san, vai] of [
      [BN_DC_A, COMPANY_A, ["listing_agent"]],
      [BN_TS_A, COMPANY_A, ["telesales"]],
      [BN_NG_B, COMPANY_B, ["listing_agent", "telesales", "team_lead"]],
    ]) {
      await c.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [id, `${id}@example.test`]);
      await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [san, id, vai]);
    }
    const dauLen = randomBytes(32);
    const lead = (id, san, nguoi, dauChu, hash = randomBytes(32), them = "") =>
      c.query(
        `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time,
                            owner_phone_enc, owner_phone_hash, outcome, matched_agent_user_id ${them ? ", returned_at, returned_by" : ""})
         values ($1, $2, $3, 'Toà A', 'sale', 1, 'included', 'now', $4, $5, 'owner_has_agent', $6 ${them ? ", now(), $6" : ""})`,
        [id, san, nguoi, Buffer.concat([Buffer.from([1]), randomBytes(38)]), hash, dauChu],
      );
    await lead(BN_TRA, COMPANY_A, BN_TS_A, BN_DC_A);
    await lead(BN_DA_TRA, COMPANY_A, BN_TS_A, BN_DC_A, randomBytes(32), "tra");
    await lead(BN_MOI, COMPANY_A, BN_TS_A, BN_DC_A);
    await lead(BN_LEN, COMPANY_A, BN_TS_A, BN_DC_A, dauLen);
    await lead(BN_B, COMPANY_B, BN_NG_B, BN_NG_B);
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 1, 'created', '{"buildingName":"Toà A"}', $3, '{listing_agent}', false),
              ($1, $2, 2, 'status_changed', '{"to":"Active"}', $3, '{listing_agent}', true)`,
      [COMPANY_A, BN_HANG, BN_DC_A],
    );
    await c.query("insert into listings (id, company_id, building_name, standard_status, version) values ($1, $2, 'Toà A', 'Active', 2)", [BN_HANG, COMPANY_A]);
    await c.query("insert into lead_listings (company_id, lead_id, listing_id, created_by) values ($1, $2, $3, $4)", [COMPANY_A, BN_LEN, BN_HANG, BN_DC_A]);
    await c.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, $3)", [COMPANY_A, BN_HANG, BN_DC_A]);
    await c.query(
      "insert into listing_owners (company_id, listing_id, owner_name, owner_phone_enc, owner_phone_hash, updated_by) values ($1, $2, '[Tên]', $3, $4, $5)",
      [COMPANY_A, BN_HANG, Buffer.concat([Buffer.from([1]), randomBytes(38)]), dauLen, BN_DC_A],
    );
    await c.query("set local role quy_hang_app");
    return await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}
const dongBonNac = (c, id, quayVe) =>
  docChu(c, "select returned_at, returned_by, resubmitted_at, resubmitted_lead_id from leads where id = $1", [id], quayVe).then((r) => r[0]);

test("lead bốn nấc: hàm ghi của sàn B không đổi lead nào của sàn A, cùng lời gọi dưới A đổi đúng một dòng", { skip }, async () => {
  await withBonNac(async (c) => {
    // [tên, người A, lời gọi, lead đọc lại]
    const ca = [
      ["return_lead", BN_DC_A, `select app.return_lead('${BN_TRA}')`, BN_TRA],
      ["mark_resubmitted", BN_TS_A, `select app.mark_resubmitted('${BN_DA_TRA}', '${BN_MOI}')`, BN_DA_TRA],
    ];
    let so = 0;
    for (const [ten, nguoiA, sql, id] of ca) {
      for (const ai of [nguoiA, BN_NG_B]) {
        await lamNguoi(c, ai, COMPANY_B);
        const truoc = await dongBonNac(c, id, [ai, COMPANY_B]);
        await expectError(c, sql, [], /không có lead này của người gọi/);
        assert.deepEqual(await dongBonNac(c, id, [ai, COMPANY_B]), truoc, `${ten}: dòng của A đổi dưới B`);
      }
      await lamNguoi(c, nguoiA, COMPANY_A);
      const truoc = await dongBonNac(c, id, [nguoiA, COMPANY_A]);
      await c.query(sql);
      assert.notDeepEqual(await dongBonNac(c, id, [nguoiA, COMPANY_A]), truoc, `${ten}: đối chứng dưới A không đổi gì`);
      so++;
    }
    assert.equal(so, ca.length);
    // B cũng không trỏ lead của mình vào lead của A.
    await lamNguoi(c, BN_NG_B, COMPANY_B);
    await expectError(c, "select app.mark_resubmitted($1, $2)", [BN_B, BN_MOI], /không có lead này của người gọi/);
  });
});

test("lead bốn nấc: hàm lên bảng của sàn B không trả lead nào của sàn A, trả đúng hai cột", { skip }, async () => {
  await withBonNac(async (c) => {
    const tat = [BN_TRA, BN_DA_TRA, BN_MOI, BN_LEN];
    await lamNguoi(c, BN_TS_A, COMPANY_A);
    const a = await c.query("select * from app.lead_board_dates($1)", [tat]);
    assert.deepEqual(a.fields.map((f) => f.name), ["lead_id", "board_at"]);
    assert.deepEqual(a.rows.map((r) => r.lead_id), [BN_LEN], "đối chứng dưới A");
    for (const ai of [BN_TS_A, BN_NG_B]) {
      await lamNguoi(c, ai, COMPANY_B);
      assert.deepEqual((await c.query("select * from app.lead_board_dates($1)", [tat])).rows, [], `lead của A lộ sang B (${ai})`);
    }
    // Người khác trong cùng sàn A (đầu chủ) không đọc mốc lead telesales nhập.
    await lamNguoi(c, BN_DC_A, COMPANY_A);
    assert.deepEqual((await c.query("select * from app.lead_board_dates($1)", [tat])).rows, []);
  });
});

test("lead bốn nấc: vai API không sửa bốn cột mới, không gọi hàm lên bảng toàn sàn và hàm số đo", { skip }, async () => {
  await withBonNac(async (c) => {
    await lamNguoi(c, BN_DC_A, COMPANY_A);
    for (const cot of ["returned_at = now()", "returned_by = 'x'", "resubmitted_at = now()", `resubmitted_lead_id = '${BN_MOI}'`]) {
      await expectError(c, `update leads set ${cot} where id = $1`, [BN_TRA], /permission denied/);
    }
    await expectError(c, "select * from app.lead_board_at_all($1)", [COMPANY_A], /permission denied/);
    await expectError(c, "select * from app.lead_board_metric($1, now() - interval '1 day', now() + interval '1 day')", [COMPANY_A], /permission denied/);
    // Đối chứng dương: kết nối chủ chạy được hàm số đo và thấy lead đã lên bảng.
    await c.query("reset role");
    const r = await c.query("select * from app.lead_board_metric($1, now() - interval '1 day', now() + interval '1 day')", [COMPANY_A]);
    assert.deepEqual(r.fields.map((f) => f.name), ["lead_id", "first_created_at", "board_at", "days"]);
    assert.deepEqual(r.rows.map((x) => x.lead_id), [BN_LEN]);
  });
});

// ---- Liên hệ (016_lien_he, hàng 85: AC-2) ----
const LH = {
  DC1: "u-lh-dau-chu-1",
  DC2: "u-lh-dau-chu-2",
  TN: "u-lh-truong-nhom",
  TS: "u-lh-telesales",
  QT: "u-lh-quan-tri",
  MAT: "u-lh-mat-vai", // người giữ cũ đã mất vai Đầu chủ
  B: "u-lh-nguoi-b",
};
const K1 = "00000000-0000-4000-8000-0000000006a1"; // liên hệ A, người giữ DC1
const K2 = "00000000-0000-4000-8000-0000000006a2"; // liên hệ A, người giữ đã mất vai
const K0 = "00000000-0000-4000-8000-0000000006a3"; // liên hệ A chưa có người giữ
const KB = "00000000-0000-4000-8000-0000000006b1"; // liên hệ B
const banMa = () => Buffer.concat([Buffer.from([1]), randomBytes(38)]);
const ctxCua = (san) => `leads:${san}:00000000-0000-4000-8000-0000000006ff`;

async function withLienHe(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    for (const [id, san, vai] of [
      [LH.DC1, COMPANY_A, ["listing_agent"]],
      [LH.DC2, COMPANY_A, ["listing_agent"]],
      [LH.TN, COMPANY_A, ["team_lead"]],
      [LH.TS, COMPANY_A, ["telesales"]],
      [LH.QT, COMPANY_A, ["company_admin"]],
      [LH.MAT, COMPANY_A, ["telesales"]],
      [LH.B, COMPANY_B, ["listing_agent", "team_lead", "telesales"]],
    ]) {
      await c.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [id, `${id}@example.test`]);
      await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [san, id, vai]);
    }
    for (const [id, san, giu] of [[K1, COMPANY_A, LH.DC1], [K2, COMPANY_A, LH.MAT], [K0, COMPANY_A, null], [KB, COMPANY_B, LH.B]]) {
      await c.query("insert into contacts (company_id, id, contact_types, owner_member_user_id, created_by) values ($1, $2, '{Seller}', $3, 'x')", [san, id, giu]);
      await c.query(
        "insert into contact_phones (company_id, contact_id, phone_enc, phone_hash, enc_context, is_primary, added_by) values ($1, $2, $3, $4, $5, true, 'x')",
        [san, id, banMa(), randomBytes(32), ctxCua(san)],
      );
    }
    await c.query("set local role quy_hang_app");
    return await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}
const chuChay = async (c, sql, params, quayVe) => {
  await c.query("reset role");
  try {
    return await c.query(sql, params);
  } finally {
    await c.query("set local role quy_hang_app");
    if (quayVe) await lamNguoi(c, quayVe[0], quayVe[1]);
  }
};

test("liên hệ: hai bảng mới nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      "select relname, relrowsecurity r, relforcerowsecurity f from pg_class where relname in ('contacts', 'contact_phones') order by relname",
    );
    assert.deepEqual(rows, [
      { relname: "contact_phones", r: true, f: true },
      { relname: "contacts", r: true, f: true },
    ]);
  } finally {
    await client.end();
  }
});

test("liên hệ: sàn B không đọc, không ghi liên hệ và số của sàn A", { skip }, async () => {
  await withLienHe(async (c) => {
    await lamNguoi(c, LH.TN, COMPANY_A);
    assert.ok((await c.query("select 1 from contacts where company_id = $1", [COMPANY_A])).rowCount >= 3, "đối chứng dưới A rỗng");
    assert.ok((await c.query("select 1 from contact_phones where company_id = $1", [COMPANY_A])).rowCount >= 3);
    for (const ai of [LH.TN, LH.B]) {
      await lamNguoi(c, ai, COMPANY_B);
      assert.equal((await c.query("select 1 from contacts where company_id = $1", [COMPANY_A])).rowCount, 0, `liên hệ A lộ sang B (${ai})`);
      assert.equal((await c.query("select 1 from contact_phones where company_id = $1", [COMPANY_A])).rowCount, 0);
      await expectError(c, "select app.set_contact_types($1, '{Seller,Buyer}')", [K1], /không có liên hệ này/);
      await expectError(c, "select app.contact_for_phone($1, $2, $3, '{Seller}', null, $4)", [randomBytes(32), banMa(), ctxCua(COMPANY_B), K1], /không có liên hệ này/);
    }
    const sau = await chuChay(c, "select contact_types from contacts where id = $1", [K1], [LH.B, COMPANY_B]);
    assert.deepEqual(sau.rows[0].contact_types, ["Seller"], "B đổi được loại liên hệ của A");
  });
});

test("liên hệ: một dấu vết một liên hệ", { skip }, async () => {
  await withLienHe(async (c) => {
    const h = randomBytes(32);
    const chen = (san, k) =>
      chuChay(c, "insert into contact_phones (company_id, contact_id, phone_enc, phone_hash, enc_context, is_primary, added_by) values ($1, $2, $3, $4, $5, false, 'x')", [san, k, banMa(), h, ctxCua(san)]);
    await chen(COMPANY_A, K1);
    await c.query("reset role");
    await c.query("savepoint sp");
    await assert.rejects(c.query("insert into contact_phones (company_id, contact_id, phone_enc, phone_hash, enc_context, is_primary, added_by) values ($1, $2, $3, $4, $5, false, 'x')", [COMPANY_A, K2, banMa(), h, ctxCua(COMPANY_A)]), /contact_phones_one_hash/);
    await c.query("rollback to savepoint sp");
    await c.query("set local role quy_hang_app");
    assert.equal((await chen(COMPANY_B, KB)).rowCount, 1, "đối chứng: cùng dấu vết ở sàn khác bị chặn");
  });
});

test("liên hệ: nhãn số và số chính", { skip }, async () => {
  await withLienHe(async (c) => {
    const chen = (nhan, chinh) =>
      c.query("insert into contact_phones (company_id, contact_id, phone_enc, phone_hash, enc_context, label, is_primary, added_by) values ($1, $2, $3, $4, $5, $6, $7, 'x')", [COMPANY_A, K1, banMa(), randomBytes(32), ctxCua(COMPANY_A), nhan, chinh]);
    await c.query("reset role");
    for (const [ten, nhan, chinh, loi] of [["nhãn lạ", "Fax", false, /contact_phones_label_check/], ["số chính thứ hai", "Mobile", true, /contact_phones_one_primary/]]) {
      await c.query("savepoint sp");
      await assert.rejects(chen(nhan, chinh), loi, ten);
      await c.query("rollback to savepoint sp");
    }
    assert.equal((await chen("Work", false)).rowCount, 1, "đối chứng: số phụ thứ hai bị chặn");
    await c.query("set local role quy_hang_app");
  });
});

test("liên hệ: vai API không đọc ba cột số, không ghi thẳng hai bảng", { skip }, async () => {
  await withLienHe(async (c) => {
    await lamNguoi(c, LH.TN, COMPANY_A);
    for (const cot of ["phone_enc", "phone_hash", "enc_context"]) {
      await expectError(c, `select ${cot} from contact_phones`, [], /permission denied/);
    }
    for (const sql of [
      "insert into contacts (company_id, contact_types, created_by) values ($1, '{Seller}', 'x')",
      "update contacts set owner_member_user_id = 'x' where company_id = $1",
      "delete from contacts where company_id = $1",
      "update contact_phones set is_primary = false where company_id = $1",
    ]) {
      await expectError(c, sql, [COMPANY_A], /permission denied/);
    }
    assert.equal((await c.query("select label, is_primary from contact_phones where contact_id = $1", [K1])).rowCount, 1, "đối chứng: cột nhãn đọc được");
  });
});

test("liên hệ: ai đọc liên hệ chủ nhà", { skip }, async () => {
  await withLienHe(async (c) => {
    // [dòng, người, liên hệ, thấy]
    const BANG = [
      ["người giữ còn vai Đầu chủ", LH.DC1, K1, true],
      ["người giữ đã mất vai", LH.MAT, K2, false],
      ["trưởng nhóm", LH.TN, K1, true],
      ["đầu chủ khác", LH.DC2, K1, false],
      ["telesales", LH.TS, K1, false],
      ["quản trị", LH.QT, K1, false],
      ["chưa có người giữ × đầu chủ", LH.DC1, K0, false],
      ["chưa có người giữ × trưởng nhóm", LH.TN, K0, true],
      ["chưa có người giữ × telesales", LH.TS, K0, false],
    ];
    let so = 0;
    for (const [ten, ai, k, mong] of BANG) {
      await lamNguoi(c, ai, COMPANY_A);
      const thay = (await c.query("select 1 from contacts where id = $1", [k])).rowCount === 1;
      const thaySo = (await c.query("select 1 from contact_phones where contact_id = $1", [k])).rowCount === 1;
      assert.deepEqual([thay, thaySo], [mong, mong], `dòng «${ten}»`);
      so++;
    }
    assert.equal(so, BANG.length);
  });
});

test("liên hệ: chỗ trường riêng giữ rỗng", { skip }, async () => {
  await withLienHe(async (c) => {
    await c.query("reset role");
    await c.query("savepoint sp");
    await assert.rejects(c.query(`update contacts set custom = '{"a":1}' where id = $1`, [K1]), /contacts_custom_check/);
    await c.query("rollback to savepoint sp");
    await c.query("set local role quy_hang_app");
  });
});

test("liên hệ: chỉ người giữ và trưởng nhóm sửa loại, kể cả liên hệ chưa có người giữ", { skip }, async () => {
  await withLienHe(async (c) => {
    // [dòng, người, liên hệ, được sửa]
    const BANG = [
      ["chưa có người giữ × đầu chủ", LH.DC1, K0, false],
      ["chưa có người giữ × telesales", LH.TS, K0, false],
      ["có người giữ × đầu chủ khác", LH.DC2, K1, false],
      ["có người giữ × người giữ", LH.DC1, K1, true],
      ["chưa có người giữ × trưởng nhóm", LH.TN, K0, true],
    ];
    let so = 0;
    for (const [ten, ai, k, duoc] of BANG) {
      await lamNguoi(c, ai, COMPANY_A);
      if (duoc) await c.query("select app.set_contact_types($1, '{Seller,Buyer}')", [k]);
      else await expectError(c, "select app.set_contact_types($1, '{Seller,Tenant}')", [k], /không có liên hệ này/);
      const loai = (await chuChay(c, "select contact_types from contacts where id = $1", [k], [ai, COMPANY_A])).rows[0].contact_types;
      assert.equal(loai.includes("Tenant"), false, `dòng «${ten}»: sửa trái phép đã ghi`);
      so++;
    }
    assert.equal(so, BANG.length);
  });
});

// ---- Ảnh căn ba ngăn (012_anh_can, hàng 18: E5, E9) ----
// Bảng 8 người × 5 ô là tệp dữ liệu viết tay của lõi — kiểm lõi (canSeeUnitInternal) và kiểm cơ sở dữ liệu nạp CÙNG tệp.
const BANG_XEM_NOI_BO = JSON.parse(
  readFileSync(new URL("../../core/src/photos/bang-xem-noi-bo.json", import.meta.url), "utf8"),
);
const U_ANH_DC = "u-anh-dau-chu-giu-khac"; // giữ các căn «không giữ» của bảng
const U_ANH_B = "u-anh-truong-nhom-b";
const nguoiAnh = (i) => `u-anh-o-${i}`;
const hangAnh = (i) => `00000000-0000-4000-8000-0000000003${String(i).padStart(2, "0")}`;
const canAnh = (i) => `A-${String(i + 1).padStart(2, "0")}.01`;
const anhId = (i, ngan, san = "a") => `00000000-0000-4000-8000-${san === "a" ? "000000" : "0000b0"}${ngan === "internal" ? "4" : "5"}${String(i).padStart(5, "0")}`;
const TOA_ANH = "[Toà ảnh]";
const BYTE = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

/** Dựng hai sàn; sàn A có mỗi ô của bảng một căn (có hoặc không lần rao), mỗi căn một ảnh mỗi ngăn kèm byte và sự kiện;
 *  sàn B có căn trùng toà và mã với căn 0 của A. Rồi chuyển sang vai API ở sàn A. */
async function withAnh(fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    const nguoi = [[U_ANH_DC, COMPANY_A, ["listing_agent"]], [U_ANH_B, COMPANY_B, ["team_lead"]], ...BANG_XEM_NOI_BO.map((o, i) => [nguoiAnh(i), COMPANY_A, o.vai])];
    for (const [id, san, vai] of nguoi) {
      await client.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [id, `${id}@example.test`]);
      await client.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [san, id, vai]);
    }
    const can = [...BANG_XEM_NOI_BO.map((o, i) => ({ san: COMPANY_A, i, ma: canAnh(i), rao: o.coLanRao, giu: o.giu ? nguoiAnh(i) : U_ANH_DC, s: "a" })), { san: COMPANY_B, i: 0, ma: canAnh(0), rao: true, giu: U_ANH_B, s: "b" }];
    for (const c of can) {
      if (c.rao) {
        const id = c.s === "a" ? hangAnh(c.i) : "00000000-0000-4000-8000-0000000003b0";
        await client.query(
          `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
           values ($1, $2, 1, 'created', '{"buildingName":"[Toà ảnh]"}', $3, '{listing_agent}', false)`,
          [c.san, id, c.giu],
        );
        await client.query("insert into listings (id, company_id, building_name, unit_number, standard_status, version) values ($1, $2, $3, $4, 'Incomplete', 1)", [id, c.san, TOA_ANH, c.ma]);
        await client.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, $3)", [c.san, id, c.giu]);
      }
      for (const ngan of ["internal", "shareable"]) {
        const pid = anhId(c.i, ngan, c.s);
        await client.query(
          `insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by)
           values ($1, $2, $3, $4, $5, 'image/jpeg', 7, 10, 10, $6)`,
          [pid, c.san, TOA_ANH, c.ma, ngan, c.giu],
        );
        for (const v of ["original", "thumb"]) await client.query("insert into unit_photo_files (company_id, photo_id, variant, content) values ($1, $2, $3, $4)", [c.san, pid, v, BYTE]);
        await client.query("insert into unit_photo_events (company_id, photo_id, type, actor_user_id) values ($1, $2, 'added', $3)", [c.san, pid, c.giu]);
      }
    }
    await client.query("set local role quy_hang_app");
    await client.query("select set_config('app.company_id', $1, true)", [COMPANY_A]);
    return await fn(client);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}
/** Thử một câu ghi trong savepoint: trả true nếu ghi được. */
async function ghiDuoc(c, sql, params) {
  await c.query("savepoint thu_ghi");
  try {
    await c.query(sql, params);
    await c.query("rollback to savepoint thu_ghi");
    return true;
  } catch {
    await c.query("rollback to savepoint thu_ghi");
    return false;
  }
}
const themAnh = (c, i, ngan, nguoi) =>
  ghiDuoc(
    c,
    `insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by)
     values (gen_random_uuid(), $1, $2, $3, $4, 'image/png', 9, 10, 10, $5)`,
    [COMPANY_A, TOA_ANH, canAnh(i), ngan, nguoi],
  );

test("ảnh căn: ba bảng mới nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relname, c.relrowsecurity and c.relforcerowsecurity as ep from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname in ('unit_photos', 'unit_photo_files', 'unit_photo_events') order by c.relname`,
    );
    assert.deepEqual(rows, [
      { relname: "unit_photo_events", ep: true },
      { relname: "unit_photo_files", ep: true },
      { relname: "unit_photos", ep: true },
    ]);
  } finally {
    await client.end();
  }
});

test("ảnh căn: ngăn nội bộ theo người — 8 người × 5 ô từ bang-xem-noi-bo.json (E5)", { skip }, async () => {
  await withAnh(async (c) => {
    let o = 0;
    for (const [i, ca] of BANG_XEM_NOI_BO.entries()) {
      await lamNguoi(c, nguoiAnh(i));
      const docNoiBo = (await c.query("select count(*)::int n from unit_photos where id = $1", [anhId(i, "internal")])).rows[0].n === 1;
      const docByte = (await c.query("select count(*)::int n from unit_photo_files where photo_id = $1", [anhId(i, "internal")])).rows[0].n === 2;
      const docGui = (await c.query("select count(*)::int n from unit_photos where id = $1", [anhId(i, "shareable")])).rows[0].n === 1;
      const thucTe = {
        doc_noi_bo: docNoiBo,
        doc_byte_noi_bo: docByte,
        them_noi_bo: await themAnh(c, i, "internal", nguoiAnh(i)),
        them_gui_duoc: await themAnh(c, i, "shareable", nguoiAnh(i)),
        doc_gui_duoc: docGui,
      };
      for (const k of Object.keys(thucTe)) {
        assert.equal(thucTe[k], ca[k], `người ${ca.o} × ô ${k}`);
        o++;
      }
    }
    assert.equal(o, 40);
  });
});

test("ảnh căn: gán lại đầu chủ giữ căn thì quyền nội bộ đổi chỗ (E5)", { skip }, async () => {
  await withAnh(async (c) => {
    const giu = nguoiAnh(0);
    await lamNguoi(c, U_ANH_DC);
    assert.equal((await c.query("select count(*)::int n from unit_photos where id = $1", [anhId(0, "internal")])).rows[0].n, 0, "trước khi gán: người khác không thấy");
    await c.query("reset role");
    await c.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 2, $3, $3)", [COMPANY_A, hangAnh(0), U_ANH_DC]);
    await c.query("set local role quy_hang_app");
    await lamNguoi(c, U_ANH_DC);
    assert.equal((await c.query("select count(*)::int n from unit_photos where id = $1", [anhId(0, "internal")])).rows[0].n, 1, "sau khi gán: người mới thấy");
    await lamNguoi(c, giu);
    assert.equal((await c.query("select count(*)::int n from unit_photos where id = $1", [anhId(0, "internal")])).rows[0].n, 0, "sau khi gán: người cũ thôi thấy");
  });
});

test("ảnh căn: sàn khác không đọc, không ghi được ảnh, byte, sự kiện — kể cả căn trùng toà và mã (E9)", { skip }, async () => {
  await withAnh(async (c) => {
    await lamNguoi(c, U_ANH_B, COMPANY_B);
    for (const bang of ["unit_photos", "unit_photo_files", "unit_photo_events"]) {
      const col = bang === "unit_photos" ? "id" : "photo_id";
      const n = (await c.query(`select count(*)::int n from ${bang} where ${col} in ($1, $2)`, [anhId(0, "internal"), anhId(0, "shareable")])).rows[0].n;
      assert.equal(n, 0, `${bang}: sàn B đọc được ảnh của sàn A`);
    }
    assert.equal((await c.query("select count(*)::int n from unit_photos")).rows[0].n, 2, "sàn B chỉ thấy hai ảnh của mình");
    assert.equal(await themAnh(c, 0, "shareable", U_ANH_B), false, "sàn B ghi được ảnh mang mã sàn A");
    const sua = await c.query("update unit_photos set display_order = 9 where id = $1", [anhId(0, "shareable")]);
    assert.equal(sua.rowCount, 0, "sàn B sửa được ảnh của sàn A");
    assert.equal((await c.query("select app.can_see_unit_internal($1, $2) ok", [TOA_ANH, canAnh(0)])).rows[0].ok, true, "trưởng nhóm B thấy nội bộ căn của chính B");
    await lamNguoi(c, U_ANH_B, COMPANY_A);
    assert.equal((await c.query("select app.can_see_unit_internal($1, $2) ok", [TOA_ANH, canAnh(0)])).rows[0].ok, false, "người không thuộc sàn A thấy nội bộ căn của A");
  });
});

test("ảnh căn: ràng buộc nội bộ không bìa, một bìa mỗi căn, sự kiện chỉ thêm (E3b, E4)", { skip }, async () => {
  await withAnh(async (c) => {
    await lamNguoi(c, nguoiAnh(0));
    await expectError(c, "update unit_photos set is_sample = true where id = $1", [anhId(0, "internal")], /unit_photos_internal_plain/);
    await c.query("update unit_photos set is_cover = true where id = $1", [anhId(0, "shareable")]);
    await expectError(
      c,
      `insert into unit_photos (id, company_id, building_name, unit_number, compartment, is_cover, content_type, byte_size, width, height, added_by)
       values (gen_random_uuid(), $1, $2, $3, 'shareable', true, 'image/png', 9, 10, 10, $4)`,
      [COMPANY_A, TOA_ANH, canAnh(0), nguoiAnh(0)],
      /unit_photos_one_cover/,
    );
    await expectError(c, "update unit_photo_events set type = 'removed' where photo_id = $1", [anhId(0, "shareable")], /permission denied|chỉ thêm/);
    await expectError(c, "delete from unit_photo_events where photo_id = $1", [anhId(0, "shareable")], /permission denied|chỉ thêm/);
    await expectError(c, "delete from unit_photos where id = $1", [anhId(0, "shareable")], /permission denied/);
    await c.query("reset role");
    await expectError(c, "update unit_photo_events set type = 'removed' where photo_id = $1", [anhId(0, "shareable")], /chỉ thêm/);
    await expectError(c, "delete from unit_photo_events where photo_id = $1", [anhId(0, "shareable")], /chỉ thêm/);
  });
});

// ---- Bảng nối lead với hàng (lead_listings, 016 — hàng va-lien-he: AC-1) ----
// Dữ liệu dựng withBonNac: sàn A có dòng nối BN_LEN → BN_HANG; mỗi sàn thêm một hàng chưa nối (dựng bằng vai chủ).
const NOI_HANG_A = "00000000-0000-4000-8000-0000000005c1";
const NOI_HANG_B = "00000000-0000-4000-8000-0000000005c2";
async function themHangChuaNoi(c) {
  await c.query("reset role");
  await c.query(
    "insert into listings (id, company_id, building_name, standard_status, version) values ($1, $2, 'Toà A', 'Incomplete', 1), ($3, $4, 'Toà A', 'Incomplete', 1)",
    [NOI_HANG_A, COMPANY_A, NOI_HANG_B, COMPANY_B],
  );
  await c.query("set local role quy_hang_app");
}
const chenNoi = (c, san, lead, hang, nguoi) =>
  c.query("insert into lead_listings (company_id, lead_id, listing_id, created_by) values ($1, $2, $3, $4)", [san, lead, hang, nguoi]);

test("bảng nối lead với hàng: bật và ép luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relrowsecurity r, c.relforcerowsecurity f from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname = 'lead_listings'`,
    );
    assert.deepEqual(rows, [{ r: true, f: true }]);
  } finally {
    await client.end();
  }
});

test("bảng nối lead với hàng: sàn B không đọc, không ghi nối của sàn A", { skip }, async () => {
  await withBonNac(async (c) => {
    await themHangChuaNoi(c);
    // Bảng viết trước: (người, sàn, việc) → kết quả. Mỗi dòng so đúng một lần.
    const BANG = [
      ["sàn B đọc dòng nối của sàn A", BN_NG_B, COMPANY_B, async () => (await c.query("select lead_id from lead_listings where lead_id = $1", [BN_LEN])).rowCount, 0],
      ["sàn B chèn dòng mang mã sàn A", BN_NG_B, COMPANY_B, () => chenNoi(c, COMPANY_A, BN_TRA, NOI_HANG_A, BN_NG_B), /row-level security/],
      ["sàn B chèn dòng sàn B ghi tên người khác", BN_NG_B, COMPANY_B, () => chenNoi(c, COMPANY_B, BN_B, NOI_HANG_B, BN_DC_A), /row-level security/],
      ["sàn B chèn dòng sàn B trỏ lead của sàn A", BN_NG_B, COMPANY_B, () => chenNoi(c, COMPANY_B, BN_TRA, NOI_HANG_B, BN_NG_B), /lead_listings_lead_fkey/],
      ["sàn B chèn dòng sàn B trỏ hàng của sàn A", BN_NG_B, COMPANY_B, () => chenNoi(c, COMPANY_B, BN_B, NOI_HANG_A, BN_NG_B), /lead_listings_listing_fkey/],
      ["sàn A đọc dòng nối của sàn A", BN_DC_A, COMPANY_A, async () => (await c.query("select lead_id, listing_id from lead_listings")).rows, [{ lead_id: BN_LEN, listing_id: BN_HANG }]],
      ["đối chứng: sàn A chèn dòng ghi tên mình", BN_DC_A, COMPANY_A, async () => (await chenNoi(c, COMPANY_A, BN_TRA, NOI_HANG_A, BN_DC_A)).rowCount, 1],
    ];
    let so = 0;
    for (const [ten, nguoi, san, viec, mong] of BANG) {
      await lamNguoi(c, nguoi, san);
      await c.query("savepoint noi");
      if (mong instanceof RegExp) await assert.rejects(viec(), mong, `dòng «${ten}»: không bị chặn đúng lỗi`);
      else assert.deepEqual(await viec(), mong, `dòng «${ten}»`);
      await c.query("rollback to savepoint noi");
      so++;
    }
    assert.equal(so, 7);
  });
});

test("bảng nối lead với hàng: vai API không sửa, không xoá", { skip }, async () => {
  await withBonNac(async (c) => {
    await lamNguoi(c, BN_DC_A, COMPANY_A);
    await expectError(c, "update lead_listings set created_by = $1 where lead_id = $2", [BN_DC_A, BN_LEN], /permission denied/);
    await expectError(c, "delete from lead_listings where lead_id = $1", [BN_LEN], /permission denied/);
  });
});

// ---- Thông báo lead (018_thong_bao_lead, hàng 26) ----
const DAY_TOI = "u-day-toi"; // đầu chủ sàn A
const DAY_KHAC = "u-day-khac"; // đầu chủ khác sàn A
const DAY_TN = "u-day-tn"; // trưởng nhóm sàn A
const DAY_B = "u-day-b"; // đầu chủ sàn B
const DAY_P256 = "B".repeat(87);
const DAY_AUTH = "A".repeat(22);
const dayEndpoint = (ai) => `https://push.example.test/${ai}`;

/** Dựng hai sàn, bốn người, mỗi người một đăng ký bằng vai chủ; rồi chuyển sang vai API. Đổi người bằng `dat`. */
async function withDay(fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    for (const u of [DAY_TOI, DAY_KHAC, DAY_TN, DAY_B]) {
      await client.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [u, `${u}@example.test`]);
    }
    await client.query(
      `insert into company_members (company_id, user_id, roles) values
         ($1, $3, '{listing_agent}'), ($1, $4, '{listing_agent}'), ($1, $5, '{team_lead}'), ($2, $6, '{listing_agent}')`,
      [COMPANY_A, COMPANY_B, DAY_TOI, DAY_KHAC, DAY_TN, DAY_B],
    );
    for (const [san, u] of [[COMPANY_A, DAY_TOI], [COMPANY_A, DAY_KHAC], [COMPANY_A, DAY_TN], [COMPANY_B, DAY_B]]) {
      await client.query("insert into push_subscriptions (company_id, user_id, endpoint, p256dh, auth) values ($1, $2, $3, $4, $5)", [
        san, u, dayEndpoint(u), DAY_P256, DAY_AUTH,
      ]);
    }
    await client.query("set local role quy_hang_app");
    const dat = (nguoi, san) =>
      client.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [nguoi, san]);
    return await fn(client, dat);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

test("đăng ký đẩy: bật và ép luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relname, c.relrowsecurity r, c.relforcerowsecurity f from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname in ('push_subscriptions', 'push_outbox', 'push_vapid') order by c.relname`,
    );
    assert.deepEqual(rows, [
      { relname: "push_outbox", r: true, f: true },
      { relname: "push_subscriptions", r: true, f: true },
      { relname: "push_vapid", r: true, f: true },
    ]);
  } finally {
    await client.end();
  }
});

test("đăng ký đẩy: ai đọc được", { skip }, async () => {
  await withDay(async (c, dat) => {
    const doc = async () => (await c.query("select user_id from push_subscriptions where user_id = $1", [DAY_TOI])).rowCount;
    const them = async () =>
      (await c.query(
        "insert into push_subscriptions (company_id, user_id, endpoint, p256dh, auth) values ($1, $2, $3, $4, $5)",
        [COMPANY_A, DAY_TOI, dayEndpoint("thiet-bi-2"), DAY_P256, DAY_AUTH],
      )).rowCount;
    const xoa = async () => (await c.query("delete from push_subscriptions where user_id = $1", [DAY_TOI])).rowCount;
    // Bảng viết trước: (người, sàn) × (đọc, thêm dòng ghi tên «tôi», xoá) đăng ký của «tôi» → kết quả.
    const BANG = [
      ["chính người", DAY_TOI, COMPANY_A, 1, 1, 1],
      ["người khác cùng sàn", DAY_KHAC, COMPANY_A, 0, /row-level security/, 0],
      ["trưởng nhóm cùng sàn", DAY_TN, COMPANY_A, 0, /row-level security/, 0],
      ["người sàn khác", DAY_B, COMPANY_B, 0, /row-level security/, 0],
    ];
    let so = 0;
    for (const [ten, nguoi, san, ...mong] of BANG) {
      for (const [viec, ham, m] of [["đọc", doc, mong[0]], ["thêm", them, mong[1]], ["xoá", xoa, mong[2]]]) {
        await dat(nguoi, san);
        await c.query("savepoint day");
        if (m instanceof RegExp) await assert.rejects(ham(), m, `dòng «${ten} × ${viec}»: không bị chặn đúng lỗi`);
        else assert.equal(await ham(), m, `dòng «${ten} × ${viec}»`);
        await c.query("rollback to savepoint day");
        so++;
      }
    }
    assert.equal(so, BANG.length * 3);
    assert.equal(so, 12);
  });
});

test("đăng ký đẩy: hàm lấy đăng ký cho lối gửi", { skip }, async () => {
  await withDay(async (c, dat) => {
    const PAYLOAD = { title: "Lead mới", body: "[Toà A] · Bán", url: "/today", tag: "lead:x" };
    const lay = async () => {
      await c.query("select app.push_outbox_add($1, $2)", [DAY_TOI, PAYLOAD]);
      return (await c.query("select endpoint from app.push_outbox_claim(now(), 3, 15)")).rows.map((r) => r.endpoint);
    };
    // Bảng viết trước: lối gọi → đăng ký trả về (số dòng) hay lỗi.
    const BANG = [
      ["gọi cho người cùng sàn", DAY_TN, COMPANY_A, lay, [dayEndpoint(DAY_TOI)]],
      ["gọi với sàn đang làm khác", DAY_B, COMPANY_B, lay, []],
      ["vai API gọi thẳng hàm đăng ký", DAY_TN, COMPANY_A, () => c.query("select * from app.push_targets($1)", [DAY_TOI]), /permission denied/],
      ["vai API đọc thẳng hộp thư đi", DAY_TN, COMPANY_A, () => c.query("select * from push_outbox"), /permission denied/],
      ["vai API đọc thẳng bảng khoá", DAY_TN, COMPANY_A, () => c.query("select * from push_vapid"), /permission denied/],
    ];
    let so = 0;
    for (const [ten, nguoi, san, viec, mong] of BANG) {
      await dat(nguoi, san);
      await c.query("savepoint day");
      if (mong instanceof RegExp) await assert.rejects(viec(), mong, `dòng «${ten}»: không bị chặn đúng lỗi`);
      else assert.deepEqual(await viec(), mong, `dòng «${ten}»`);
      await c.query("rollback to savepoint day");
      so++;
    }
    assert.equal(so, 5);
  });
});

// ---- Vết mở số của lead (017_mo_so_lead, hàng mo-so-lead) ----
const MS_DC = "u-ms-dc"; // đầu chủ được giao, sàn A
const MS_KHAC = "u-ms-khac"; // đầu chủ khác, sàn A
const MS_TN = "u-ms-tn"; // trưởng nhóm, sàn A
const MS_B = "u-ms-b"; // đầu chủ sàn B
const MS_LEAD = "00000000-0000-4000-8000-0000000000e1";

/** Dựng hai sàn, bốn người, một lead của A giao cho MS_DC; MS_DC mở số một lần (qua hàm) để có một vết. */
async function withMoSo(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    for (const [id, san, vai] of [
      [MS_DC, COMPANY_A, ["listing_agent"]],
      [MS_KHAC, COMPANY_A, ["listing_agent"]],
      [MS_TN, COMPANY_A, ["team_lead"]],
      [MS_B, COMPANY_B, ["listing_agent"]],
    ]) {
      await c.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [id, `${id}@example.test`]);
      await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [san, id, vai]);
    }
    await c.query(
      `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time,
                          owner_phone_enc, owner_phone_hash, outcome, matched_agent_user_id)
       values ($1, $2, $3, 'Toà A', 'sale', 1, 'included', 'now', $4, $5, 'owner_has_agent', $3)`,
      [MS_LEAD, COMPANY_A, MS_DC, Buffer.concat([Buffer.from([1]), randomBytes(38)]), randomBytes(32)],
    );
    await c.query("set local role quy_hang_app");
    const dat = (nguoi, san) =>
      c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [nguoi, san]);
    await dat(MS_DC, COMPANY_A);
    await c.query("select app.reveal_lead_phone($1)", [MS_LEAD]);
    return await fn(c, dat);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}

test("vết mở số lead: bật và ép luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relrowsecurity r, c.relforcerowsecurity f from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname = 'lead_phone_reveals'`,
    );
    assert.deepEqual(rows, [{ r: true, f: true }]);
  } finally {
    await client.end();
  }
});

test("vết mở số lead: ai đọc được", { skip }, async () => {
  await withMoSo(async (c, dat) => {
    // Bảng viết trước: người đọc vết của người mở (MS_DC) → số dòng.
    const BANG = [
      ["người mở", MS_DC, COMPANY_A, 1],
      ["trưởng nhóm cùng sàn", MS_TN, COMPANY_A, 1],
      ["đầu chủ khác cùng sàn", MS_KHAC, COMPANY_A, 0],
      ["người sàn khác", MS_B, COMPANY_B, 0],
    ];
    let so = 0;
    for (const [ten, nguoi, san, mong] of BANG) {
      await dat(nguoi, san);
      const n = (await c.query("select 1 from lead_phone_reveals where actor_user_id = $1", [MS_DC])).rowCount;
      assert.equal(n, mong, `dòng «${ten}»`);
      so++;
    }
    assert.equal(so, 4);
  });
});

test("vết mở số lead: chỉ thêm", { skip }, async () => {
  await withMoSo(async (c, dat) => {
    await dat(MS_DC, COMPANY_A);
    // Bảng viết trước: lối ghi thẳng → lỗi viết trước.
    const BANG = [
      ["vai API thêm thẳng", () => c.query("insert into lead_phone_reveals (company_id, lead_id, actor_user_id, actor_roles) values ($1, $2, $3, '{listing_agent}')", [COMPANY_A, MS_LEAD, MS_DC]), /permission denied|row-level security/],
      ["vai API sửa", () => c.query("update lead_phone_reveals set actor_user_id = $1", [MS_KHAC]), /permission denied/],
      ["vai API xoá", () => c.query("delete from lead_phone_reveals"), /permission denied/],
      ["vai chủ sửa", async () => { await c.query("reset role"); return c.query("update lead_phone_reveals set actor_user_id = $1", [MS_KHAC]); }, /chỉ thêm/],
      ["vai chủ xoá", async () => { await c.query("reset role"); return c.query("delete from lead_phone_reveals"); }, /chỉ thêm/],
    ];
    let so = 0;
    for (const [ten, viec, mong] of BANG) {
      await c.query("savepoint ms");
      await assert.rejects(viec(), mong, `dòng «${ten}»: không bị chặn đúng lỗi`);
      await c.query("rollback to savepoint ms");
      so++;
    }
    assert.equal(so, 5);
  });
});

// ---- Liên hệ khách (021_lien_he_khach, hàng 86: AC-2) ----
const LK = {
  DK1: "u-lk-dau-khach-1",
  DK2: "u-lk-dau-khach-2",
  MAT: "u-lk-mat-vai", // đầu khách giữ cũ đã mất vai Đầu khách
  GUI: "u-lk-nguoi-gui", // người gửi không giữ nhu cầu
  TN: "u-lk-truong-nhom",
  DC: "u-lk-dau-chu",
  TS: "u-lk-telesales",
  QT: "u-lk-quan-tri",
  B: "u-lk-nguoi-b",
};
const LKC = { A: "00000000-0000-4000-8000-0000000007a1", B: "00000000-0000-4000-8000-0000000007b1" }; // liên hệ khách
const LKP = { A: "00000000-0000-4000-8000-0000000007a2", M: "00000000-0000-4000-8000-0000000007a3", B: "00000000-0000-4000-8000-0000000007b2" }; // nhu cầu
const LKS = { A: "00000000-0000-4000-8000-0000000007a4", M: "00000000-0000-4000-8000-0000000007a5", B: "00000000-0000-4000-8000-0000000007b4" }; // Lần gửi
const LKL = { A: "00000000-0000-4000-8000-0000000007a6", B: "00000000-0000-4000-8000-0000000007b6" }; // hàng đã lên bảng
const BON_BANG = ["prospects", "prospect_events", "shares", "share_listings"];

async function withLienHeKhach(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    for (const [id, san, vai] of [
      [LK.DK1, COMPANY_A, ["buyer_agent"]],
      [LK.DK2, COMPANY_A, ["buyer_agent"]],
      [LK.MAT, COMPANY_A, ["telesales"]],
      [LK.GUI, COMPANY_A, ["telesales"]],
      [LK.TN, COMPANY_A, ["team_lead"]],
      [LK.DC, COMPANY_A, ["listing_agent"]],
      [LK.TS, COMPANY_A, ["telesales"]],
      [LK.QT, COMPANY_A, ["company_admin"]],
      [LK.B, COMPANY_B, ["buyer_agent", "team_lead", "listing_agent"]],
    ]) {
      await c.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [id, `${id}@example.test`]);
      await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [san, id, vai]);
    }
    for (const [k, san, giu] of [["A", COMPANY_A, LK.DK1], ["B", COMPANY_B, LK.B]]) {
      await c.query("insert into contacts (company_id, id, contact_types, created_by) values ($1, $2, '{Buyer}', 'x')", [san, LKC[k]]);
      await c.query(
        "insert into contact_phones (company_id, contact_id, phone_enc, phone_hash, enc_context, is_primary, added_by) values ($1, $2, $3, $4, $5, true, 'x')",
        [san, LKC[k], banMa(), randomBytes(32), `prospects:${san}:${LKP[k]}`],
      );
      await c.query(
        "insert into prospects (company_id, id, contact_id, owner_member_user_id, display_name, need, created_by) values ($1, $2, $3, $4, '[Tên]', 'purchase', $4)",
        [san, LKP[k], LKC[k], giu],
      );
      await c.query(
        "insert into prospect_events (company_id, prospect_id, type, actor_user_id, actor_roles) values ($1, $2, 'inquiry_received', $3, '{buyer_agent}')",
        [san, LKP[k], giu],
      );
      await c.query(
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, $2, 1, 'created', '{"buildingName":"[Toà A]"}', 'x', '{listing_agent}', false),
                ($1, $2, 2, 'status_changed', '{"to":"Active"}', 'x', '{listing_agent}', false)`,
        [san, LKL[k]],
      );
      await c.query("insert into listings (id, company_id, building_name, standard_status, version) values ($1, $2, '[Toà A]', 'Active', 2)", [LKL[k], san]);
      await c.query(
        "insert into shares (company_id, id, code, sender_user_id, audience, prospect_id) values ($1, $2, $3, $4, 'client', $5)",
        [san, LKS[k], `ma${k}0000000001`.slice(0, 12), k === "A" ? LK.GUI : LK.B, LKP[k]],
      );
      await c.query("insert into share_listings (company_id, share_id, listing_id, position) values ($1, $2, $3, 0)", [san, LKS[k], LKL[k]]);
    }
    // Nhu cầu của đầu khách đã mất vai, và Lần gửi của nó (người gửi DK1).
    await c.query(
      "insert into prospects (company_id, id, contact_id, owner_member_user_id, display_name, need, created_by) values ($1, $2, $3, $4, '[Tên]', 'lease', $4)",
      [COMPANY_A, LKP.M, LKC.A, LK.MAT],
    );
    await c.query("insert into shares (company_id, id, code, sender_user_id, audience, prospect_id) values ($1, $2, 'maM000000001', $3, 'client', $4)", [COMPANY_A, LKS.M, LK.DK1, LKP.M]);
    await c.query("set local role quy_hang_app");
    return await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}

test("liên hệ khách: bốn bảng mới nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query("select relname, relrowsecurity r, relforcerowsecurity f from pg_class where relname = any ($1) order by relname", [BON_BANG]);
    assert.deepEqual(rows, [
      { relname: "prospect_events", r: true, f: true },
      { relname: "prospects", r: true, f: true },
      { relname: "share_listings", r: true, f: true },
      { relname: "shares", r: true, f: true },
    ]);
  } finally {
    await client.end();
  }
});

test("liên hệ khách: sàn B không đọc, không ghi nhu cầu, sự kiện và Lần gửi của sàn A", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    await lamNguoi(c, LK.TN, COMPANY_A);
    for (const bang of BON_BANG) assert.ok((await c.query(`select 1 from ${bang} where company_id = $1`, [COMPANY_A])).rowCount >= 1, `đối chứng dưới A rỗng: ${bang}`);
    for (const ai of [LK.TN, LK.B]) {
      await lamNguoi(c, ai, COMPANY_B);
      for (const bang of BON_BANG) {
        assert.equal((await c.query(`select 1 from ${bang} where company_id = $1`, [COMPANY_A])).rowCount, 0, `${bang} của A lộ sang B (${ai})`);
      }
      await expectError(c, "select app.add_prospect_phone($1, $2, $3)", [LKP.A, randomBytes(32), banMa()], /không có nhu cầu khách này/);
      await expectError(c, "select app.close_prospect($1)", [LKP.A], /không có nhu cầu khách này/);
      await expectError(c, "select app.reassign_prospect($1, $2)", [LKP.A, LK.B], /không có nhu cầu khách này/);
      await expectError(c, "select app.create_share(gen_random_uuid(), 'maX000000001', 'client', $1, $2)", [LKP.A, [LKL.B]], /không có nhu cầu khách này|cần vai Đầu khách/);
    }
    const sau = await chuChay(c, "select owner_member_user_id, closed_at from prospects where id = $1", [LKP.A], [LK.B, COMPANY_B]);
    assert.deepEqual(sau.rows[0], { owner_member_user_id: LK.DK1, closed_at: null }, "B đổi được nhu cầu của A");
  });
});

test("liên hệ khách: vai API không ghi thẳng bốn bảng", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    await lamNguoi(c, LK.TN, COMPANY_A);
    let so = 0;
    for (const sql of [
      "insert into prospects (company_id, contact_id, owner_member_user_id, display_name, need, created_by) values ($1, gen_random_uuid(), 'x', 'x', 'purchase', 'x')",
      "update prospects set owner_member_user_id = 'x' where company_id = $1",
      "delete from prospects where company_id = $1",
      "insert into prospect_events (company_id, prospect_id, type, actor_user_id, actor_roles) values ($1, gen_random_uuid(), 'closed', 'x', '{}')",
      "update prospect_events set type = 'closed' where company_id = $1",
      "delete from prospect_events where company_id = $1",
      "insert into shares (company_id, code, sender_user_id, audience) values ($1, 'maZ000000001', 'x', 'agents')",
      "update shares set sender_user_id = 'x' where company_id = $1",
      "delete from shares where company_id = $1",
      "insert into share_listings (company_id, share_id, listing_id, position) values ($1, gen_random_uuid(), gen_random_uuid(), 1)",
      "update share_listings set position = 1 where company_id = $1",
      "delete from share_listings where company_id = $1",
    ]) {
      await expectError(c, sql, [COMPANY_A], /permission denied/);
      so++;
    }
    // Ma trận viết trước: bốn bảng × chèn, sửa, xoá.
    assert.equal(so, 12);
    assert.equal((await c.query("select 1 from prospect_events where prospect_id = $1", [LKP.A])).rowCount, 1, "đối chứng: trưởng nhóm đọc được sự kiện");
  });
});

test("liên hệ khách: ai đọc nhu cầu và Lần gửi", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    // [dòng, người, nhu cầu, Lần gửi, thấy nhu cầu, thấy Lần gửi]
    const BANG = [
      ["đầu khách giữ", LK.DK1, LKP.A, LKS.A, true, true],
      ["đầu khách giữ đã mất vai", LK.MAT, LKP.M, LKS.M, false, false],
      ["người gửi không giữ nhu cầu", LK.GUI, LKP.A, LKS.A, false, true],
      ["trưởng nhóm", LK.TN, LKP.A, LKS.A, true, true],
      ["đầu khách khác", LK.DK2, LKP.A, LKS.A, false, false],
      ["đầu chủ", LK.DC, LKP.A, LKS.A, false, false],
      ["telesales", LK.TS, LKP.A, LKS.A, false, false],
      ["quản trị", LK.QT, LKP.A, LKS.A, false, false],
    ];
    let so = 0;
    for (const [ten, ai, p, s, mongP, mongS] of BANG) {
      await lamNguoi(c, ai, COMPANY_A);
      const thayP = (await c.query("select 1 from prospects where id = $1", [p])).rowCount === 1;
      const thayE = (await c.query("select 1 from prospect_events where prospect_id = $1", [p])).rowCount >= 1;
      const thayS = (await c.query("select 1 from shares where id = $1", [s])).rowCount === 1;
      const thayL = (await c.query("select 1 from share_listings where share_id = $1", [s])).rowCount === 1;
      assert.deepEqual([thayP, thayS, thayL], [mongP, mongS, mongS], `dòng «${ten}»`);
      if (p === LKP.A) assert.equal(thayE, mongP, `dòng «${ten}»: sự kiện đi theo nhu cầu`);
      so++;
    }
    assert.equal(so, BANG.length);
    assert.equal(so, 8);
  });
});

test("liên hệ khách: khán giả và nhu cầu đi cặp", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    await c.query("reset role");
    const chen = (ma, aud, p) => c.query("insert into shares (company_id, code, sender_user_id, audience, prospect_id) values ($1, $2, 'x', $3, $4)", [COMPANY_A, ma, aud, p]);
    for (const [ten, ma, aud, p] of [["client thiếu nhu cầu", "maC000000001", "client", null], ["agents có nhu cầu", "maC000000002", "agents", LKP.A]]) {
      await c.query("savepoint sp");
      await assert.rejects(chen(ma, aud, p), /shares_audience_prospect/, ten);
      await c.query("rollback to savepoint sp");
    }
    assert.equal((await chen("maC000000003", "client", LKP.A)).rowCount, 1, "đối chứng: client có nhu cầu bị chặn");
    assert.equal((await chen("maC000000004", "agents", null)).rowCount, 1, "đối chứng: agents không nhu cầu bị chặn");
    await c.query("set local role quy_hang_app");
  });
});

test("liên hệ khách: mã link duy nhất toàn hệ", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    await c.query("reset role");
    await c.query("savepoint sp");
    await assert.rejects(
      c.query("insert into shares (company_id, code, sender_user_id, audience) values ($1, $2, 'x', 'agents')", [COMPANY_B, "maA000000000"]),
      /shares_code_unique/,
    );
    await c.query("rollback to savepoint sp");
    assert.equal((await c.query("insert into shares (company_id, code, sender_user_id, audience) values ($1, 'maU000000001', 'x', 'agents')", [COMPANY_B])).rowCount, 1, "đối chứng: mã mới bị chặn");
    await c.query("set local role quy_hang_app");
  });
});

test("liên hệ khách: ngữ cảnh số của nhu cầu", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    await c.query("reset role");
    const chen = (ctx) =>
      c.query("insert into contact_phones (company_id, contact_id, phone_enc, phone_hash, enc_context, is_primary, added_by) values ($1, $2, $3, $4, $5, false, 'x')", [COMPANY_A, LKC.A, banMa(), randomBytes(32), ctx]);
    assert.equal((await chen(`prospects:${COMPANY_A}:${LKP.A}`)).rowCount, 1, "ngữ cảnh prospects bị chặn");
    await c.query("savepoint sp");
    await assert.rejects(chen(`prospectz:${COMPANY_A}:${LKP.A}`), /contact_phones_enc_context_check/);
    await c.query("rollback to savepoint sp");
    await c.query("set local role quy_hang_app");
  });
});

// Hàng 38 (tab-toi, AC-9): dấu «máy bị báo mất» ở schema identity — vai API của công ty không đọc, không ghi được.
/** Trả tên bảng khi vai quy_hang_app đọc hay ghi được dấu; null khi cả hai bị từ chối. */
async function dauMoChoApi(c) {
  for (const sql of [
    "select * from identity.reported_device",
    "insert into identity.reported_device (token_hash, user_id, expires_at) values (repeat('a', 64), 'x', now() + interval '1 day')",
  ]) {
    await c.query("savepoint dau");
    try {
      await c.query(sql);
      await c.query("rollback to savepoint dau");
      return "identity.reported_device";
    } catch (e) {
      await c.query("rollback to savepoint dau");
      if (!/permission denied/.test(String(e?.message))) throw e;
    }
  }
  return null;
}

test("máy bị báo: quy_hang_app không đọc, không ghi được identity.reported_device", { skip }, async () => {
  await asCompany(COMPANY_A, async (c) => {
    assert.equal(await dauMoChoApi(c), null);
  });
});

test("máy bị báo: chiều đỏ — cấp quyền bảng dấu cho quy_hang_app thì ca nêu tên bảng", { skip }, async () => {
  await asCompany(COMPANY_A, async (c) => {
    await c.query("reset role");
    await c.query("grant usage on schema identity to quy_hang_app");
    await c.query("grant select, insert on identity.reported_device to quy_hang_app");
    await c.query("set local role quy_hang_app");
    assert.equal(await dauMoChoApi(c), "identity.reported_device");
  });
});

// ---- Lần nhập (024_lan_nhap, hàng 65a) ----
const IMPORT_A = "00000000-0000-4000-8000-0000000065a1";
const IMPORT_B = "00000000-0000-4000-8000-0000000065b1";
const BAM = "a".repeat(64);

/** Thêm mỗi sàn một lần nhập và một dòng nhập bằng vai chủ, trên dựng của `withListings`. */
async function withImports(companyId, fn) {
  return withListings(companyId, async (c) => {
    await c.query("reset role");
    await c.query(
      `insert into imports (company_id, id, created_by, created_roles, file_name, file_hash, file_kind, header_row, plan)
       values ($1, $3, $5, '{listing_agent}', '[Tệp A].xlsx', $7, 'xlsx', '0', '{}'),
              ($2, $4, $6, '{listing_agent}', '[Tệp B].xlsx', $7, 'xlsx', '0', '{}')`,
      [COMPANY_A, COMPANY_B, IMPORT_A, IMPORT_B, USER_1, USER_2, BAM],
    );
    await c.query(
      `insert into import_rows (company_id, import_id, row_number, action, reason, listing_id)
       values ($1, $3, 2, 'create', 'căn mới', $5), ($2, $4, 2, 'create', 'căn mới', $6)`,
      [COMPANY_A, COMPANY_B, IMPORT_A, IMPORT_B, LISTING_A, LISTING_B],
    );
    await c.query("set local role quy_hang_app");
    return fn(c);
  });
}

test("lần nhập: A không thấy, không ghi được lần nhập và dòng nhập của B", { skip }, async () => {
  await withImports(COMPANY_A, async (c) => {
    // Đối chứng: lần nhập và dòng nhập của chính A đọc được.
    assert.deepEqual((await c.query("select id from imports")).rows.map((r) => r.id), [IMPORT_A]);
    assert.deepEqual((await c.query("select import_id from import_rows")).rows.map((r) => r.import_id), [IMPORT_A]);
    assert.equal((await c.query("select 1 from imports where id = $1", [IMPORT_B])).rowCount, 0, "không đọc lần nhập của B");
    assert.equal((await c.query("select 1 from import_rows where import_id = $1", [IMPORT_B])).rowCount, 0, "không đọc dòng nhập của B");
    await expectError(
      c,
      "insert into import_rows (company_id, import_id, row_number, action, reason) values ($1, $2, 3, 'skip', 'x')",
      [COMPANY_B, IMPORT_B],
      /row-level security/,
    );
    await expectError(
      c,
      "insert into import_rows (company_id, import_id, row_number, action, reason) values ($1, $2, 3, 'skip', 'x')",
      [COMPANY_A, IMPORT_B],
      /row-level security|violates foreign key/,
    );
    assert.equal((await c.query("update imports set status = 'committed' where id = $1", [IMPORT_B])).rowCount, 0, "không sửa lần nhập của B");
    assert.equal((await c.query("update imports set status = 'committed' where id = $1", [IMPORT_A])).rowCount, 1, "đối chứng: sửa được lần nhập của chính A");
    await expectError(
      c,
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, import_id)
       values ($1, $2, 2, 'owner_confirmed', '{}', $3, '{listing_agent}', false, $4)`,
      [COMPANY_A, LISTING_A, USER_1, IMPORT_B],
      /violates foreign key/,
    );
    // Đối chứng: sự kiện mang lần nhập của chính A thì ghi được.
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, import_id)
       values ($1, $2, 2, 'owner_confirmed', '{}', $3, '{listing_agent}', false, $4)`,
      [COMPANY_A, LISTING_A, USER_1, IMPORT_A],
    );
  });
});

test("lần nhập: dòng nhập không giữ ô nguyên văn", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'import_rows' order by ordinal_position",
    );
    assert.deepEqual(rows.map((r) => r.column_name), [
      "company_id",
      "import_id",
      "row_number",
      "action",
      "reason",
      "listing_id",
      "lead_id",
      "listing_version_before",
      "created_at",
      "undo_outcome",
      "undone_at",
    ]);
  } finally {
    await client.end();
  }
});

test("hoàn tác lần nhập (025): A không đánh dấu hoàn tác lần nhập hay dòng nhập của B", { skip }, async () => {
  await withImports(COMPANY_A, async (c) => {
    assert.equal(
      (await c.query("update imports set status = 'undone', undone_at = now(), undone_by = $2 where id = $1", [IMPORT_B, USER_1])).rowCount,
      0,
      "không hoàn tác lần nhập của B",
    );
    assert.equal((await c.query("update import_rows set undo_outcome = 'go', undone_at = now() where import_id = $1", [IMPORT_B])).rowCount, 0, "không ghi kết cục dòng của B");
    // Đối chứng: lần nhập và dòng của chính A thì ghi được.
    assert.equal((await c.query("update import_rows set undo_outcome = 'go', undone_at = now() where import_id = $1", [IMPORT_A])).rowCount, 1);
    assert.equal(
      (await c.query("update imports set status = 'undone', undone_at = now(), undone_by = $2 where id = $1", [IMPORT_A, USER_1])).rowCount,
      1,
    );
    await expectError(c, "update import_rows set undo_outcome = 'xoa' where import_id = $1", [IMPORT_A], /violates check constraint/);
  });
});

// ---- Lượt mất mạng (028_thiet_bi_va_mat_mang, E2) ----
const LUOT_MM = `insert into offline_sessions (company_id, user_id, device, started_at, ended_at, queued_ops)
                 values ($1, $2, $3, $4, $5, $6)`;

test("offline_sessions: sàn khác không đọc, không ghi hộ", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relrowsecurity r, c.relforcerowsecurity f from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname = 'offline_sessions'`,
    );
    assert.deepEqual(rows, [{ r: true, f: true }]);
  } finally {
    await client.end();
  }

  await asUser(null, null, async (c) => {
    // Vai chủ dựng: hai lượt của A (U1, U2), một lượt của B (U2).
    await c.query("reset role");
    for (const [san, nguoi, bd] of [
      [COMPANY_A, USER_1, "2026-11-03T08:00:00Z"],
      [COMPANY_A, USER_2, "2026-11-03T08:10:00Z"],
      [COMPANY_B, USER_2, "2026-11-03T08:20:00Z"],
    ]) {
      await c.query(LUOT_MM, [san, nguoi, "mobile", bd, "2026-11-03T09:00:00Z", 1]);
    }
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [USER_1, COMPANY_A]);

    // Đọc: đúng hai lượt của A, không lượt nào của B.
    const doc = await c.query("select company_id, user_id from offline_sessions order by started_at");
    assert.equal(doc.rowCount, 2, "U1 ở sàn A phải đọc đúng hai lượt của A");
    assert.deepEqual(doc.rows, [
      { company_id: COMPANY_A, user_id: USER_1 },
      { company_id: COMPANY_A, user_id: USER_2 },
    ]);
    assert.equal((await c.query("select 1 from offline_sessions where company_id = $1", [COMPANY_B])).rowCount, 0);

    // Đối chứng dương: ghi lượt của chính mình ở A được.
    await c.query(LUOT_MM, [COMPANY_A, USER_1, "desktop", "2026-11-03T10:00:00Z", "2026-11-03T10:01:00Z", 0]);
    assert.equal((await c.query("select 1 from offline_sessions where user_id = $1", [USER_1])).rowCount, 2);

    // Ghi hộ: sàn B, hay người khác trong A → luật theo dòng từ chối (42501).
    const BANG = [
      ["company_id của sàn B", [COMPANY_B, USER_1, "mobile", "2026-11-03T11:00:00Z", "2026-11-03T11:01:00Z", 1]],
      ["user_id người khác", [COMPANY_A, USER_2, "mobile", "2026-11-03T11:00:00Z", "2026-11-03T11:01:00Z", 1]],
    ];
    let so = 0;
    for (const [ten, params] of BANG) {
      await c.query("savepoint mm");
      let err = null;
      try {
        await c.query(LUOT_MM, params);
      } catch (e) {
        err = e;
      }
      await c.query("rollback to savepoint mm");
      assert.ok(err, `ghi hộ «${ten}» được nhận — ${ten} được ghi`);
      assert.equal(err.code, "42501", `ghi hộ «${ten}»: mã lỗi ${err.code} (${err.message})`);
      so++;
    }
    assert.equal(so, 2);

    // Vai API không sửa, không xoá lượt.
    await expectError(c, "update offline_sessions set queued_ops = 9", [], /permission denied/);
    await expectError(c, "delete from offline_sessions", [], /permission denied/);
  });
});

// ---- Trang khách (hàng 35, migration 031): sự kiện của Lần gửi và hai hàm theo mã link ----
// Lần gửi A (mã maA000000000, người gửi LK.GUI của sàn A) và B (maB000000000, sàn B) dựng sẵn ở withLienHeKhach.

test("trang khách: share_events nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query("select relname, relrowsecurity r, relforcerowsecurity f from pg_class where relname = 'share_events'");
    assert.deepEqual(rows, [{ relname: "share_events", r: true, f: true }]);
  } finally {
    await client.end();
  }
});

// ---- Căn đã gỡ không vào Lần gửi, không nhận «Quan tâm» (037, hàng vá va-gui-can-da-go) ----
/** Lời gọi phải lỗi đúng mã Postgres (mã là hợp đồng với API: 22023 → 400, 23514 → 409). */
async function loiMa(client, sql, params, ma, nhan) {
  await client.query("savepoint loi_ma");
  await assert.rejects(client.query(sql, params), (e) => {
    assert.equal(e.code, ma, `${nhan}: mã lỗi`);
    return true;
  });
  await client.query("rollback to savepoint loi_ma");
}
test("gửi căn đã gỡ (037): hàm chặn ở tầng dữ liệu", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    await lamNguoi(c, LK.DK1, COMPANY_A);
    const demShares = async () => (await c.query("select count(*)::int n from shares where company_id = $1", [COMPANY_A])).rows[0].n;
    const demSuKien = async () => (await c.query("select count(*)::int n from share_events where share_id = $1", [LKS.A])).rows[0].n;
    // Đối chứng dương: căn chưa gỡ gửi được, «Quan tâm» ghi được.
    const truoc = await demShares();
    await c.query("select app.create_share(gen_random_uuid(), 'maG000000001', 'agents', null, $1)", [[LKL.A]]);
    assert.equal(await demShares(), truoc + 1, "đối chứng: căn chưa gỡ gửi được");
    assert.equal((await c.query("select app.record_share_event('maA000000000', 'interest', $1, 'may-thu-0901') as r", [LKL.A])).rows[0].r, true, "đối chứng: căn chưa gỡ nhận Quan tâm");
    // Gỡ căn (cờ của bản gấp, hàng 66) bằng vai chủ bảng.
    await c.query("reset role");
    await c.query("update listings set voided = true where id = $1", [LKL.A]);
    await c.query("set local role quy_hang_app");
    await lamNguoi(c, LK.DK1, COMPANY_A);
    const n0 = await demShares();
    await loiMa(c, "select app.create_share(gen_random_uuid(), 'maG000000002', 'agents', null, $1)", [[LKL.A]], "22023", "Lần gửi có căn đã gỡ");
    assert.equal(await demShares(), n0, "căn đã gỡ: không thêm Lần gửi");
    const e0 = await demSuKien();
    await loiMa(c, "select app.record_share_event('maA000000000', 'interest', $1, 'may-thu-0902')", [LKL.A], "23514", "Quan tâm căn đã gỡ");
    assert.equal(await demSuKien(), e0, "căn đã gỡ: không thêm sự kiện");
    // Cách ly: sàn B không gửi được căn của sàn A.
    await lamNguoi(c, LK.B, COMPANY_B);
    await loiMa(c, "select app.create_share(gen_random_uuid(), 'maG000000003', 'agents', null, $1)", [[LKL.A]], "22023", "sàn B gửi căn của sàn A");
  });
});

test("gửi căn đã gỡ (037): hàm giữ chữ ký và quyền", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select p.proname, p.prosecdef, p.proconfig, pg_get_userbyid(p.proowner) as chu,
              array(select distinct (aclexplode(p.proacl)).grantee::regrole::text) as duoc
         from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'app' and p.proname in ('create_share', 'record_share_event') order by p.proname`,
    );
    assert.deepEqual(rows.map((r) => r.proname), ["create_share", "record_share_event"]);
    for (const r of rows) {
      assert.equal(r.prosecdef, true, `${r.proname}: prosecdef`);
      assert.deepEqual(r.proconfig, ['search_path=""'], `${r.proname}: search_path rỗng`);
      assert.deepEqual([...r.duoc].sort(), [r.chu, "quy_hang_app"].sort(), `${r.proname}: chỉ chủ hàm và quy_hang_app được gọi`);
      assert.ok(r.duoc.includes("quy_hang_app"), `${r.proname}: quy_hang_app có quyền`);
    }
    // Chạy hai lần không áp lại: packages/api/test-db/va-gui-can-da-go/migrate-hai-lan.test.ts (cơ sở dữ liệu tạm) — bộ này
    // còn chạy trỏ bản thật, chỉ đọc và rollback.
    const m = await client.query("select count(*)::int n from schema_migrations where name like '037_%'");
    assert.equal(m.rows[0].n, 1, "037 đã áp");
  } finally {
    await client.end();
  }
});

test("trang khách: hàm theo mã không vượt sàn", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    await lamNguoi(c, LK.TN, COMPANY_A);
    // Hàm theo mã trả đúng một dòng của Lần gửi B, chỉ các cột viết trước — không cột căn, không cột nguồn.
    const b = await c.query("select * from app.share_by_code('maB000000000')");
    assert.equal(b.rowCount, 1, "mã của sàn B phải ra đúng một dòng");
    assert.deepEqual(Object.keys(b.rows[0]), ["company_id", "share_id", "sender_user_id", "audience", "active"]);
    assert.deepEqual([b.rows[0].company_id, b.rows[0].share_id, b.rows[0].active], [COMPANY_B, LKS.B, true]);
    // Mã sai, mã sai khuôn, chuỗi liệt kê: không dòng nào.
    for (const ma of ["maQ000000001", "%", "maB00000000", "' or true --"]) {
      assert.equal((await c.query("select * from app.share_by_code($1)", [ma])).rowCount, 0, `mã «${ma}» ra dòng`);
    }
    // Ghi sự kiện cho mã của B: dòng thuộc sàn B, A không đọc được; B đọc được.
    assert.equal((await c.query("select app.record_share_event('maB000000000', 'link_opened', null, 'may-thu-0001') as r")).rows[0].r, true);
    assert.equal((await c.query("select 1 from share_events where share_id = $1", [LKS.B])).rowCount, 0, "share_events của B lộ sang A");
    await lamNguoi(c, LK.B, COMPANY_B);
    assert.equal((await c.query("select 1 from share_events where share_id = $1", [LKS.B])).rowCount, 1, "đối chứng: B đọc sự kiện của mình");
    // Mã sai thì không ghi được.
    await expectError(c, "select app.record_share_event('maQ000000001', 'link_opened', null, 'may-thu-0001')", [], /không có Lần gửi này/);
    // Vai API không ghi thẳng bảng.
    for (const sql of [
      "insert into share_events (company_id, share_id, type, visitor) values ($1, gen_random_uuid(), 'link_opened', 'may-thu-0002')",
      "update share_events set visitor = 'may-thu-0003' where company_id = $1",
      "delete from share_events where company_id = $1",
    ]) await expectError(c, sql, [COMPANY_B], /permission denied/);
  });
});

test("trang khách: link tắt hay người gửi rời sàn thì không mở được", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    await lamNguoi(c, LK.TN, COMPANY_A);
    assert.equal((await c.query("select active from app.share_by_code('maA000000000')")).rows[0].active, true, "đối chứng: Lần gửi A đang mở");
    // Người gửi bị gỡ khỏi sàn (vai chủ).
    await chuChay(c, "delete from company_members where company_id = $1 and user_id = $2", [COMPANY_A, LK.GUI], [LK.TN, COMPANY_A]);
    assert.equal((await c.query("select active from app.share_by_code('maA000000000')")).rows[0].active, false, "người gửi rời sàn mà link vẫn mở");
    await expectError(c, "select app.record_share_event('maA000000000', 'link_opened', null, 'may-thu-0001')", [], /không có Lần gửi này/);
    // Link B đặt disabled_at (vai chủ).
    await chuChay(c, "update shares set disabled_at = now() where id = $1", [LKS.B], [LK.TN, COMPANY_A]);
    assert.equal((await c.query("select active from app.share_by_code('maB000000000')")).rows[0].active, false, "link đã tắt mà vẫn mở");
  });
});

// ---- Lần xuất bảng hàng (030_lan_xuat, hàng 43 phat-hang, E8) ----
const LAN_XUAT = `insert into exports (company_id, user_id, format, recipient, listing_count) values ($1, $2, $3, $4, $5)`;

/** Vai chủ dựng một lần xuất của A (U1) và một của B (U2), rồi chuyển sang vai API là U1 ở sàn A. */
async function dungLanXuat(c) {
  await c.query("reset role");
  await c.query(LAN_XUAT, [COMPANY_A, USER_1, "post_zalo", "nhom_moi_gioi", 3]);
  await c.query(LAN_XUAT, [COMPANY_B, USER_2, "xlsx", "khach_rieng", 2]);
  await c.query("set local role quy_hang_app");
  await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [USER_1, COMPANY_A]);
}

/** Trả tên bảng khi người ở sàn A đọc được lần xuất của sàn B; null khi không. */
async function docCheoLanXuat(c) {
  const { rowCount } = await c.query("select 1 from exports where company_id = $1", [COMPANY_B]);
  return rowCount > 0 ? "exports" : null;
}

test("exports: bảng bật và ép luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relrowsecurity r, c.relforcerowsecurity f from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname = 'exports'`,
    );
    assert.deepEqual(rows, [{ r: true, f: true }]);
  } finally {
    await client.end();
  }
});

test("exports: sàn khác không đọc, không ghi hộ; vai API không sửa, không xoá", { skip }, async () => {
  await asUser(null, null, async (c) => {
    await dungLanXuat(c);

    // Đọc: đúng lần xuất của A, không lần nào của B.
    const doc = await c.query("select company_id, user_id from exports");
    assert.deepEqual(doc.rows, [{ company_id: COMPANY_A, user_id: USER_1 }]);
    assert.equal(await docCheoLanXuat(c), null, "sàn A đọc được lần xuất của sàn B");

    // Đối chứng dương: ghi lần xuất của chính mình ở A được.
    await c.query(LAN_XUAT, [COMPANY_A, USER_1, "pdf", "khach_rieng", 1]);
    assert.equal((await c.query("select 1 from exports")).rowCount, 2);

    // Ghi hộ: sàn B, hay người khác trong A → luật theo dòng từ chối (42501).
    const BANG = [
      ["company_id của sàn B", [COMPANY_B, USER_1, "png", "khach_rieng", 1]],
      ["user_id người khác", [COMPANY_A, USER_2, "png", "khach_rieng", 1]],
    ];
    let so = 0;
    for (const [ten, params] of BANG) {
      await c.query("savepoint lx");
      let err = null;
      try {
        await c.query(LAN_XUAT, params);
      } catch (e) {
        err = e;
      }
      await c.query("rollback to savepoint lx");
      assert.ok(err, `ghi hộ «${ten}» được nhận — ${ten} được ghi`);
      assert.equal(err.code, "42501", `ghi hộ «${ten}»: mã lỗi ${err.code} (${err.message})`);
      so++;
    }
    assert.equal(so, 2);

    // Vai API không sửa, không xoá lần xuất.
    await expectError(c, "update exports set listing_count = 9", [], /permission denied/);
    await expectError(c, "delete from exports", [], /permission denied/);
  });
});

test("exports: chiều đỏ — luật đọc không lọc sàn thì ca đọc chéo nêu tên bảng", { skip }, async () => {
  await asUser(null, null, async (c) => {
    await c.query("reset role");
    await c.query("drop policy exports_read on exports");
    await c.query("create policy exports_read on exports for select using (true)");
    await dungLanXuat(c);
    assert.equal(await docCheoLanXuat(c), "exports");
  });
});

// ---- Nhật ký cấu hình sàn (026_cau_hinh_su_kien, hàng 82 cau-hinh-theo-san: E6, E7, E9) ----
const CHEN_CAU_HINH = "insert into company_settings (company_id, key, value, updated_by, data_class) values ($1, $2, $3::jsonb, $4, $5)";
const demSuKien = (c, quayVe) =>
  docChu(c, "select count(*)::int n from company_settings_events where company_id = $1", [COMPANY_A], quayVe).then((r) => r[0].n);
/** Trả tên bảng khi người ở sàn B đọc được nhật ký của sàn A; null khi không. */
async function docCheoNhatKy(c) {
  const { rowCount } = await c.query("select 1 from company_settings_events where company_id = $1", [COMPANY_A]);
  return rowCount > 0 ? "company_settings_events" : null;
}

test("company_settings_events: bảng bật và ép luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relrowsecurity r, c.relforcerowsecurity f from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relname = 'company_settings_events'`,
    );
    assert.deepEqual(rows, [{ r: true, f: true }]);
  } finally {
    await client.end();
  }
});

test("company_settings_events: vai API không sửa, không xoá, không chèn thẳng", { skip }, async () => {
  await withChia(async (c) => {
    await lamNguoi(c, QT_A, COMPANY_A);
    // Đối chứng dương: quản trị A đọc được nhật ký của A (dòng dựng sẵn của withChia sinh một sự kiện).
    assert.ok((await c.query("select 1 from company_settings_events")).rowCount >= 1, "nhật ký của A rỗng");
    const truoc = await demSuKien(c, [QT_A, COMPANY_A]);
    await expectError(c, "update company_settings_events set value = '1'", [], /permission denied/);
    await expectError(c, "delete from company_settings_events", [], /permission denied/);
    await expectError(
      c,
      "insert into company_settings_events (company_id, key, value, data_class, actor_user_id) values ($1, 'queue.call_back_after_days', '20', 'company_internal', $2)",
      [COMPANY_A, QT_A],
      /permission denied/,
    );
    // Đối chứng dương: ghi cấu hình qua bảng hiện hành thêm đúng một sự kiện.
    await c.query(CHEN_CAU_HINH, [COMPANY_A, "queue.call_back_after_days", "20", QT_A, "company_internal"]);
    assert.equal(await demSuKien(c, [QT_A, COMPANY_A]), truoc + 1);
  });
});

test("company_settings_events: chủ bảng cũng không sửa, không xoá", { skip }, async () => {
  await withChia(async (c) => {
    await c.query("reset role");
    assert.ok((await c.query("select 1 from company_settings_events where company_id = $1", [COMPANY_A])).rowCount >= 1, "chủ không thấy sự kiện");
    await expectError(c, "update company_settings_events set value = '1' where company_id = $1", [COMPANY_A], /nhật ký cấu hình chỉ thêm, không sửa, không xoá/);
    await expectError(c, "delete from company_settings_events where company_id = $1", [COMPANY_A], /nhật ký cấu hình chỉ thêm, không sửa, không xoá/);
  });
});

test("cấu hình sàn: không dòng nào lớp source", { skip }, async () => {
  await withChia(async (c) => {
    await lamNguoi(c, QT_A, COMPANY_A);
    await expectError(c, CHEN_CAU_HINH, [COMPANY_A, "queue.call_back_after_days", "20", QT_A, "source"], /company_settings_data_class_check/);
    assert.equal((await c.query(CHEN_CAU_HINH, [COMPANY_A, "queue.call_back_after_days", "20", QT_A, "company_internal"])).rowCount, 1);
    await c.query("reset role");
    const chenSuKien = "insert into company_settings_events (company_id, key, value, data_class, actor_user_id) values ($1, 'queue.call_back_after_days', '20', $2, $3)";
    await expectError(c, chenSuKien, [COMPANY_A, "source", QT_A], /company_settings_events_data_class_check/);
    assert.equal((await c.query(chenSuKien, [COMPANY_A, "company_internal", QT_A])).rowCount, 1);
  });
});

test("company_settings_events: sàn khác không đọc, không ghi hộ", { skip }, async () => {
  await withChia(async (c) => {
    await lamNguoi(c, QT_A, COMPANY_A);
    assert.ok((await c.query("select 1 from company_settings_events")).rowCount >= 1, "đối chứng: A không thấy nhật ký của mình");
    const truoc = await demSuKien(c, [NG_B, COMPANY_B]);
    assert.equal(await docCheoNhatKy(c), null);
    assert.equal((await c.query("select 1 from company_settings where company_id = $1", [COMPANY_A])).rowCount, 0, "company_settings của A lộ sang B");
    await expectError(c, CHEN_CAU_HINH, [COMPANY_A, "queue.call_back_after_days", "20", NG_B, "company_internal"], /row-level security/);
    assert.equal(await demSuKien(c, [NG_B, COMPANY_B]), truoc);
  });
});

test("company_settings_events: chiều đỏ — luật đọc không lọc sàn thì ca đọc chéo nêu tên bảng", { skip }, async () => {
  await withChia(async (c) => {
    await c.query("reset role");
    await c.query("drop policy company_settings_events_read on company_settings_events");
    await c.query("create policy company_settings_events_read on company_settings_events for select using (true)");
    await c.query("set local role quy_hang_app");
    await lamNguoi(c, NG_B, COMPANY_B);
    assert.equal(await docCheoNhatKy(c), "company_settings_events");
  });
});

// ---- Đã gửi (hàng 36, migration 032): hàm tắt link ----
// Lần gửi A (người gửi LK.GUI, sàn A), M (người gửi LK.DK1, sàn A) và B (sàn B) dựng sẵn ở withLienHeKhach.
test("đã gửi: hàm tắt link không vượt sàn, không vượt người", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    const tat = async (id) => (await chuChay(c, "select disabled_at from shares where id = $1", [id], null)).rows[0].disabled_at;
    // Người gửi của sàn A tắt Lần gửi của sàn B → lỗi, B vẫn mở.
    await lamNguoi(c, LK.GUI, COMPANY_A);
    await expectError(c, "select app.disable_share($1)", [LKS.B], /không có Lần gửi này/);
    // Đầu khách khác của sàn A tắt Lần gửi A (của LK.GUI) → lỗi.
    await lamNguoi(c, LK.DK2, COMPANY_A);
    await expectError(c, "select app.disable_share($1)", [LKS.A], /không được tắt link này/);
    await lamNguoi(c, LK.TN, COMPANY_A);
    assert.equal(await tat(LKS.A), null, "đầu khách khác tắt được link");
    // Người gửi tắt Lần gửi A → được; tắt lại → lỗi riêng.
    await lamNguoi(c, LK.GUI, COMPANY_A);
    await c.query("select app.disable_share($1)", [LKS.A]);
    await expectError(c, "select app.disable_share($1)", [LKS.A], /link đã tắt/);
    await lamNguoi(c, LK.TN, COMPANY_A);
    assert.notEqual(await tat(LKS.A), null, "người gửi không tắt được link");
    // Trưởng nhóm sàn A tắt Lần gửi M (của LK.DK1) → được.
    await c.query("select app.disable_share($1)", [LKS.M]);
    assert.notEqual(await tat(LKS.M), null, "trưởng nhóm không tắt được link của sàn mình");
    // Trưởng nhóm sàn B (LK.B) tắt Lần gửi của sàn A → lỗi.
    await lamNguoi(c, LK.B, COMPANY_B);
    await expectError(c, "select app.disable_share($1)", [LKS.M], /không có Lần gửi này/);
    // Vai API không update thẳng bảng.
    await expectError(c, "update shares set disabled_at = now() where company_id = $1", [COMPANY_B], /permission denied/);
    await lamNguoi(c, LK.TN, COMPANY_A);
    assert.equal(await tat(LKS.B), null, "Lần gửi của sàn B bị tắt");
  });
});

test("đã gửi: phiên có sàn mà không người không tắt được link (migration 033)", { skip }, async () => {
  await withLienHeKhach(async (c) => {
    const tat = async (id) => (await chuChay(c, "select disabled_at from shares where id = $1", [id], null)).rows[0].disabled_at;
    // app.user_id rỗng, app.company_id là sàn B: trước bản vá phép so người ra NULL và hàm tắt được Lần gửi B.
    await lamNguoi(c, "", COMPANY_B);
    await expectError(c, "select app.disable_share($1)", [LKS.B], /không được tắt link này/);
    await lamNguoi(c, LK.TN, COMPANY_A);
    assert.equal(await tat(LKS.B), null, "phiên không người tắt được Lần gửi B");
    // Đối chứng: trưởng nhóm sàn B (LK.B) vẫn tắt được Lần gửi của sàn mình.
    await lamNguoi(c, LK.B, COMPANY_B);
    await c.query("select app.disable_share($1)", [LKS.B]);
    await lamNguoi(c, LK.TN, COMPANY_A);
    assert.notEqual(await tat(LKS.B), null, "trưởng nhóm sàn B không tắt được link của sàn mình");
  });
});

// ---- Đổi đầu chủ hàng loạt (027_doi_dau_chu, hàng 89: AC-6) ----
const DD = {
  L1: "00000000-0000-4000-8000-000000000891", // căn A của chủ K1, đầu chủ DC1
  L2: "00000000-0000-4000-8000-000000000892", // căn A của chủ K1, đầu chủ DC1
  LB: "00000000-0000-4000-8000-000000000893", // căn B, chủ KB
  DK: "u-dd-dau-khach", // đầu khách sàn A
};
async function withDoiDauChu(fn) {
  await withLienHe(async (c) => {
    await c.query("reset role");
    for (const [id, san, chu, dau] of [[DD.L1, COMPANY_A, K1, LH.DC1], [DD.L2, COMPANY_A, K1, LH.DC1], [DD.LB, COMPANY_B, KB, LH.B]]) {
      await c.query("insert into listings (id, company_id, building_name, standard_status, version) values ($1, $2, '[Toà]', 'Incomplete', 1)", [id, san]);
      await c.query("insert into listing_owners (company_id, listing_id, owner_name, updated_by, contact_id) values ($1, $2, '[Tên]', 'x', $3)", [san, id, chu]);
      await c.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, 'x')", [san, id, dau]);
    }
    await c.query("set local role quy_hang_app");
    return fn(c);
  });
}

test("đổi đầu chủ: hai bảng lần đổi nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      "select relname, relrowsecurity r, relforcerowsecurity f from pg_class where relname in ('listing_agent_reassignments', 'listing_agent_reassignment_items') order by relname",
    );
    assert.deepEqual(rows, [
      { relname: "listing_agent_reassignment_items", r: true, f: true },
      { relname: "listing_agent_reassignments", r: true, f: true },
    ]);
  } finally {
    await client.end();
  }
});

test("đổi đầu chủ: sàn B không đọc, không đổi, không hoàn tác của sàn A; vai API không ghi thẳng", { skip }, async () => {
  await withDoiDauChu(async (c) => {
    await lamNguoi(c, LH.TN, COMPANY_A);
    const lan = (await c.query("select app.reassign_listing_agents($1, $2) id", [[DD.L1], LH.DC2])).rows[0].id;
    assert.ok((await c.query("select 1 from listing_agent_reassignments where id = $1", [lan])).rowCount === 1, "đối chứng: A đọc lần đổi của mình");
    assert.equal((await c.query("select 1 from listing_agent_reassignment_items where reassignment_id = $1", [lan])).rowCount, 3, "đối chứng: 2 căn cùng chủ + 1 liên hệ");
    await lamNguoi(c, LH.B, COMPANY_B);
    assert.equal((await c.query("select 1 from listing_agent_reassignments where company_id = $1", [COMPANY_A])).rowCount, 0, "lần đổi A lộ sang B");
    assert.equal((await c.query("select 1 from listing_agent_reassignment_items where company_id = $1", [COMPANY_A])).rowCount, 0);
    await expectError(c, "select * from app.preview_listing_agent_reassignment($1)", [[DD.L1]], /không có hàng này/);
    await expectError(c, "select app.reassign_listing_agents($1, $2)", [[DD.L1], LH.B], /không có hàng này/);
    await expectError(c, "select * from app.undo_listing_agent_reassignment($1)", [lan], /không có lần đổi này/);
    for (const sql of [
      "insert into listing_agent_reassignments (company_id, to_user_id, reassigned_by) values ($1, 'x', 'x')",
      "update listing_agent_reassignments set undone_at = now() where company_id = $1",
      "delete from listing_agent_reassignment_items where company_id = $1",
      "update contacts set owner_member_user_id = 'x' where company_id = $1",
    ]) {
      await lamNguoi(c, LH.TN, COMPANY_A);
      await expectError(c, sql, [COMPANY_A], /permission denied/);
    }
  });
});

test("đổi đầu chủ: chỉ trưởng nhóm gọi được ba hàm", { skip }, async () => {
  await withDoiDauChu(async (c) => {
    await c.query("reset role");
    await c.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [DD.DK, `${DD.DK}@example.test`]);
    await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{buyer_agent}')", [COMPANY_A, DD.DK]);
    await c.query("set local role quy_hang_app");
    // Một lần đổi thật của trưởng nhóm để có mã cho ô hoàn tác.
    await lamNguoi(c, LH.TN, COMPANY_A);
    const lan = (await c.query("select app.reassign_listing_agents($1, $2) id", [[DD.L1], LH.DC2])).rows[0].id;
    // Bốn vai không phải trưởng nhóm × ba hàm.
    for (const ai of [LH.DC1, LH.TS, LH.QT, DD.DK]) {
      await lamNguoi(c, ai, COMPANY_A);
      await expectError(c, "select * from app.preview_listing_agent_reassignment($1)", [[DD.L1]], /không có quyền đổi đầu chủ/);
      await expectError(c, "select app.reassign_listing_agents($1, $2)", [[DD.L1], LH.DC2], /không có quyền đổi đầu chủ/);
      await expectError(c, "select * from app.undo_listing_agent_reassignment($1)", [lan], /không có lần đổi này/);
    }
    // Đối chứng dương: trưởng nhóm gọi được cả ba.
    await lamNguoi(c, LH.TN, COMPANY_A);
    assert.equal((await c.query("select * from app.preview_listing_agent_reassignment($1)", [[DD.L1]])).rowCount, 2, "đối chứng: trưởng nhóm xem trước được, căn cùng chủ đi theo");
    assert.equal((await c.query("select * from app.undo_listing_agent_reassignment($1)", [lan])).rowCount, 1, "đối chứng: trưởng nhóm hoàn tác được");
  });
});

// Mật khẩu do sàn cấp (034, hàng dang-nhap-mat-khau). Ba bảng ở `identity` — vai API không với tới; quản trị chỉ cấp
// qua app.cap_mat_khau_tam, và hàm từ chối người còn thuộc sàn khác.
const MK = { QT: "mk-quan-tri-a", CHI_A: "mk-chi-a", HAI_SAN: "mk-hai-san", NGOAI: "mk-ngoai", QT_B: "mk-quan-tri-b" };
async function withMatKhau(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("insert into companies (id, name) values ($1, '[Sàn A]'), ($2, '[Sàn B]')", [COMPANY_A, COMPANY_B]);
    for (const id of Object.values(MK)) {
      await c.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $1 || '@example.test', true)`, [id]);
    }
    await c.query(
      `insert into company_members (company_id, user_id, roles) values
         ($1, $3, '{company_admin}'), ($1, $4, '{telesales}'), ($1, $5, '{telesales}'), ($2, $5, '{telesales}'),
         ($2, $6, '{company_admin}')`,
      [COMPANY_A, COMPANY_B, MK.QT, MK.CHI_A, MK.HAI_SAN, MK.QT_B],
    );
    await c.query("set local role quy_hang_app");
    await lamNguoi(c, MK.QT, COMPANY_A);
    return await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}
const HAN_TAM = "now() + interval '72 hours'";
const trangThaiMk = async (c, u) =>
  (await chuChay(c, "select kind, origin, disabled_reason from identity.password_state where user_id = $1", [u], [MK.QT, COMPANY_A])).rows[0];

test("mật khẩu: quy_hang_app không đọc ghi identity.password_state, password_failures, password_events", { skip }, async () => {
  await withMatKhau(async (c) => {
    for (const bang of ["identity.password_state", "identity.password_failures", "identity.password_events"]) {
      await expectError(c, `select * from ${bang}`, [], /permission denied/);
      const cot = bang.endsWith("password_failures") ? "email" : "user_id";
      await expectError(c, `update ${bang} set ${cot} = ${cot}`, [], /permission denied/);
    }
    await expectError(c, "insert into identity.password_failures (email) values ('x@example.test')", [], /permission denied/);
    await expectError(c, "insert into identity.password_events (user_id, kind) values ($1, 'cap')", [MK.CHI_A], /permission denied/);
    await expectError(c, "insert into identity.password_state (user_id, kind, origin) values ($1, 'tu-dat', 'tu-doi')", [MK.CHI_A], /permission denied/);
  });
});

test("cap_mat_khau_tam: quản trị sàn A không cấp được cho người cũng ở sàn B", { skip }, async () => {
  await withMatKhau(async (c) => {
    await expectError(c, `select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.HAI_SAN], /user_in_other_company/);
    const tk = await chuChay(c, `select 1 from identity.account where "userId" = $1`, [MK.HAI_SAN], [MK.QT, COMPANY_A]);
    assert.equal(tk.rowCount, 0, "hàm ghi mật khẩu cho người ở hai sàn");
    // Không phải quản trị, không phải thành viên.
    await lamNguoi(c, MK.CHI_A, COMPANY_A);
    await expectError(c, `select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.CHI_A], /chỉ quản trị/);
    await lamNguoi(c, MK.QT, COMPANY_A);
    await expectError(c, `select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.NGOAI], /không có người này/);
    // Quản trị sàn B không cấp được cho người chỉ ở sàn A.
    await lamNguoi(c, MK.QT_B, COMPANY_B);
    await expectError(c, `select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.CHI_A], /không có người này/);
    // Đối chứng dương: quản trị A cấp cho người chỉ ở A.
    await lamNguoi(c, MK.QT, COMPANY_A);
    await c.query(`select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.CHI_A]);
    const tk2 = await chuChay(c, `select "password" from identity.account where "userId" = $1 and "providerId" = 'credential'`, [MK.CHI_A], [MK.QT, COMPANY_A]);
    assert.equal(tk2.rows[0]?.password, "bam-thu");
    assert.deepEqual(await trangThaiMk(c, MK.CHI_A), { kind: "tam", origin: "san-cap", disabled_reason: null });
    const sk = await chuChay(c, "select company_id, actor_user_id, kind from identity.password_events where user_id = $1", [MK.CHI_A], [MK.QT, COMPANY_A]);
    assert.deepEqual(sk.rows, [{ company_id: COMPANY_A, actor_user_id: MK.QT, kind: "cap" }]);
  });
});

test("mật khẩu: vào sàn khác vô hiệu mật khẩu gốc sàn cấp, giữ mật khẩu tự đổi", { skip }, async () => {
  // Ba hình viết trước: tạm chưa dùng · đặt lần đầu từ tạm · tự đổi ở Cá nhân.
  const hinh = [
    { ten: "tạm chưa dùng", kind: "tam", origin: "san-cap", voHieu: true },
    { ten: "đặt lần đầu từ tạm", kind: "tu-dat", origin: "san-cap", voHieu: true },
    { ten: "tự đổi ở Cá nhân", kind: "tu-dat", origin: "tu-doi", voHieu: false },
  ];
  for (const h of hinh) {
    await withMatKhau(async (c) => {
      await c.query(`select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.CHI_A]);
      await chuChay(c, "update identity.password_state set kind = $2, origin = $3 where user_id = $1", [MK.CHI_A, h.kind, h.origin], null);
      await chuChay(c, "insert into company_members (company_id, user_id, roles) values ($1, $2, '{telesales}')", [COMPANY_B, MK.CHI_A], [MK.QT, COMPANY_A]);
      const tt = await trangThaiMk(c, MK.CHI_A);
      assert.equal(tt.disabled_reason, h.voHieu ? "vao-san-khac" : null, `hình «${h.ten}»`);
      const sk = await chuChay(c, "select count(*)::int n from identity.password_events where user_id = $1 and kind = 'vo-hieu-san-khac'", [MK.CHI_A], [MK.QT, COMPANY_A]);
      assert.equal(sk.rows[0].n, h.voHieu ? 1 : 0, `sự kiện của hình «${h.ten}»`);
    });
  }
});

test("mật khẩu: mời lại vào đúng sàn đã cấp không vô hiệu; bỏ rồi vào sàn khác thì vô hiệu", { skip }, async () => {
  await withMatKhau(async (c) => {
    await c.query(`select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.CHI_A]);
    await chuChay(c, "delete from company_members where company_id = $1 and user_id = $2", [COMPANY_A, MK.CHI_A], null);
    await chuChay(c, "insert into company_members (company_id, user_id, roles) values ($1, $2, '{telesales}')", [COMPANY_A, MK.CHI_A], [MK.QT, COMPANY_A]);
    assert.equal((await trangThaiMk(c, MK.CHI_A)).disabled_reason, null, "mời lại cùng sàn mà mật khẩu bị vô hiệu");
    // Bỏ khỏi A rồi vào B — không còn dòng A nào, nhưng mật khẩu do A cấp vẫn phải thôi dùng.
    await chuChay(c, "delete from company_members where company_id = $1 and user_id = $2", [COMPANY_A, MK.CHI_A], null);
    await chuChay(c, "insert into company_members (company_id, user_id, roles) values ($1, $2, '{telesales}')", [COMPANY_B, MK.CHI_A], [MK.QT, COMPANY_A]);
    assert.equal((await trangThaiMk(c, MK.CHI_A)).disabled_reason, "vao-san-khac");
  });
});

// Hàng va-dang-nhap-mat-khau (migration 038): vô hiệu mật khẩu gốc sàn cấp vì vào sàn khác thì thu mọi phiên của người.
async function themPhien(c, userId, n) {
  for (let i = 0; i < n; i++) {
    await chuChay(
      c,
      `insert into identity.session (id, "expiresAt", token, "updatedAt", "userId") values ($1, now() + interval '30 days', $1, now(), $2)`,
      [`phien-${userId}-${i}-${randomBytes(4).toString("hex")}`, userId],
      null,
    );
  }
}
const soPhienMk = async (c, u) => (await chuChay(c, `select count(*)::int n from identity.session where "userId" = $1`, [u], null)).rows[0].n;

test("vào sàn khác: thu phiên khi vô hiệu mật khẩu gốc sàn cấp", { skip }, async () => {
  const hinh = [
    { ten: "tạm chưa dùng", kind: "tam" },
    { ten: "đặt lần đầu từ tạm", kind: "tu-dat" },
  ];
  assert.equal(hinh.length, 2);
  for (const h of hinh) {
    await withMatKhau(async (c) => {
      await c.query(`select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.CHI_A]);
      await chuChay(c, "update identity.password_state set kind = $2 where user_id = $1", [MK.CHI_A, h.kind], null);
      await themPhien(c, MK.CHI_A, 2);
      await chuChay(c, "insert into company_members (company_id, user_id, roles) values ($1, $2, '{telesales}')", [COMPANY_B, MK.CHI_A], null);
      assert.equal((await trangThaiMk(c, MK.CHI_A)).disabled_reason, "vao-san-khac", `hình «${h.ten}»`);
      assert.equal(await soPhienMk(c, MK.CHI_A), 0, `hình «${h.ten}»: phiên còn sau khi vào sàn khác`);
      const sk = await chuChay(c, "select count(*)::int n from identity.password_events where user_id = $1 and kind = 'vo-hieu-san-khac'", [MK.CHI_A], null);
      assert.equal(sk.rows[0].n, 1, `hình «${h.ten}»: sự kiện`);
    });
  }
});

test("vào sàn khác: phiên của người khác không bị đụng", { skip }, async () => {
  await withMatKhau(async (c) => {
    await c.query(`select app.cap_mat_khau_tam($1, 'bam-thu', ${HAN_TAM})`, [MK.CHI_A]);
    await themPhien(c, MK.CHI_A, 1);
    await themPhien(c, MK.NGOAI, 2);
    await chuChay(c, "insert into company_members (company_id, user_id, roles) values ($1, $2, '{telesales}')", [COMPANY_B, MK.CHI_A], null);
    assert.equal(await soPhienMk(c, MK.CHI_A), 0);
    assert.equal(await soPhienMk(c, MK.NGOAI), 2, "phiên của người thứ ba bị xoá");
  });
});

// ---- Màn Liên hệ (036_man_lien_he, hàng 103: AC-9) ----
// Dùng bộ dựng withLienHe: K1 (DC1 giữ), K2 (người giữ đã mất vai Đầu chủ), K0 (chưa người giữ) ở sàn A; KB ở sàn B.
const demMoSoLienHe = async (c, contactId, quayVe) =>
  Number((await chuChay(c, "select count(*)::int n from contact_phone_reveals where contact_id = $1", [contactId], quayVe)).rows[0].n);
const soCua = async (c, contactId, quayVe) =>
  (await chuChay(c, "select id, phone_hash from contact_phones where contact_id = $1 order by added_at limit 1", [contactId], quayVe)).rows[0];

test("màn liên hệ: bảng sự kiện mở số nằm trong phép kiểm luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query("select relrowsecurity, relforcerowsecurity from pg_class where relname = 'contact_phone_reveals'");
    assert.deepEqual(rows, [{ relrowsecurity: true, relforcerowsecurity: true }]);
  } finally {
    await client.end();
  }
});

test("màn liên hệ: mở số và tìm theo số không vượt sàn, không vượt vai", { skip }, async () => {
  await withLienHe(async (c) => {
    const pK1 = await soCua(c, K1, [LH.DC1, COMPANY_A]);
    const pKB = await soCua(c, KB, [LH.DC1, COMPANY_A]);
    // Đối chứng dương: người giữ còn vai mở số liên hệ sàn mình → một dòng bản mã, một sự kiện.
    await lamNguoi(c, LH.DC1, COMPANY_A);
    assert.equal((await c.query("select * from app.contact_phone_for_reveal($1, $2)", [K1, pK1.id])).rows.length, 1);
    assert.equal(await demMoSoLienHe(c, K1, [LH.DC1, COMPANY_A]), 1);
    const tim = await c.query("select * from app.contact_lookup_by_phone_hash($1)", [pK1.phone_hash]);
    assert.deepEqual(tim.rows.map((r) => [r.contact_id, r.readable, r.holder_user_id]), [[K1, true, LH.DC1]]);
    // Sàn A dò và mở liên hệ sàn B → rỗng, không sự kiện.
    assert.equal((await c.query("select * from app.contact_lookup_by_phone_hash($1)", [pKB.phone_hash])).rows.length, 0, "sàn A dò ra liên hệ sàn B");
    assert.equal((await c.query("select * from app.contact_phone_for_reveal($1, $2)", [KB, pKB.id])).rows.length, 0, "sàn A mở được số sàn B");
    assert.equal(await demMoSoLienHe(c, KB, [LH.DC1, COMPANY_A]), 0);
    // Bảng viết trước: người × mở số K1 → có đọc được (đếm bằng số dòng).
    const BANG = [
      [LH.DC2, false], // đầu chủ khác
      [LH.TN, true], // trưởng nhóm
      [LH.TS, false], // telesales
      [LH.QT, false], // quản trị sàn
    ];
    let so = 0;
    for (const [ai, duoc] of BANG) {
      await lamNguoi(c, ai, COMPANY_A);
      const truoc = await demMoSoLienHe(c, K1, [ai, COMPANY_A]);
      const r = await c.query("select * from app.contact_phone_for_reveal($1, $2)", [K1, pK1.id]);
      assert.equal(r.rows.length, duoc ? 1 : 0, `dòng ${ai}: mở số sai quyền`);
      assert.equal(await demMoSoLienHe(c, K1, [ai, COMPANY_A]), truoc + (duoc ? 1 : 0), `dòng ${ai}: số sự kiện sai`);
      so++;
    }
    assert.equal(so, BANG.length);
    // Người giữ đã mất vai Đầu chủ không mở được số liên hệ mình từng giữ.
    const pK2 = await soCua(c, K2, [LH.MAT, COMPANY_A]);
    await lamNguoi(c, LH.MAT, COMPANY_A);
    assert.equal((await c.query("select * from app.contact_phone_for_reveal($1, $2)", [K2, pK2.id])).rows.length, 0, "người giữ đã mất vai mở được số");
    assert.deepEqual((await c.query("select readable from app.contact_lookup_by_phone_hash($1)", [pK2.phone_hash])).rows, [{ readable: false }]);
    // Số không thuộc liên hệ → rỗng, không sự kiện.
    await lamNguoi(c, LH.DC1, COMPANY_A);
    assert.equal((await c.query("select * from app.contact_phone_for_reveal($1, $2)", [K1, pK2.id])).rows.length, 0);
    // Sàn B không đọc sự kiện mở số của sàn A; vai API không ghi thẳng bảng.
    await lamNguoi(c, LH.B, COMPANY_B);
    assert.equal((await c.query("select count(*)::int n from contact_phone_reveals")).rows[0].n, 0, "sàn B đọc sự kiện mở số của sàn A");
    await expectError(c, "insert into contact_phone_reveals (company_id, contact_id, phone_id, revealed_by) values ($1, $2, $3, 'x')", [COMPANY_A, K1, pK1.id], /permission denied/);
  });
});

test("màn liên hệ: số che chỉ cho người đọc được, không vượt sàn", { skip }, async () => {
  await withLienHe(async (c) => {
    const BANG = [
      [LH.DC1, COMPANY_A, K1, 1],
      [LH.TN, COMPANY_A, K1, 1],
      [LH.DC2, COMPANY_A, K1, 0],
      [LH.MAT, COMPANY_A, K2, 0],
      [LH.DC1, COMPANY_A, KB, 0],
      [LH.B, COMPANY_B, K1, 0],
    ];
    let so = 0;
    for (const [ai, san, k, mong] of BANG) {
      await lamNguoi(c, ai, san);
      assert.equal((await c.query("select * from app.contact_phones_for_mask($1)", [k])).rows.length, mong, `dòng ${ai} × ${k}`);
      so++;
    }
    assert.equal(so, BANG.length);
    assert.equal(await demMoSoLienHe(c, K1, [LH.DC1, COMPANY_A]), 0, "xem số che ghi sự kiện mở số");
  });
});

// ---- Sổ chi phí AI và thoả thuận «Xử lý bằng AI» (035, hàng 68) ----
test("ai_usage: ép luật theo dòng; sàn B không đọc, không chèn dòng của sàn A; chỉ thêm", { skip }, async () => {
  const chu = new pg.Client({ connectionString: url });
  await chu.connect();
  try {
    const { rows } = await chu.query("select relrowsecurity, relforcerowsecurity from pg_class where relname = 'ai_usage'");
    assert.equal(rows[0]?.relrowsecurity, true, "ai_usage chưa bật luật theo dòng");
    assert.equal(rows[0]?.relforcerowsecurity, true, "ai_usage chưa ép luật theo dòng");
  } finally {
    await chu.end();
  }
  await asCompany(null, async (c) => {
    await c.query("reset role");
    await c.query(
      "insert into ai_usage (company_id, user_id, model, cost_usd, result) values ($1, 'u-ai-a', 'claude-opus-5-5', 0.5, 'ok')",
      [COMPANY_A],
    );
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.company_id', $1, true)", [COMPANY_B]);
    await c.query("select set_config('app.user_id', 'u-ai-b', true)");
    assert.equal((await c.query("select count(*)::int n from ai_usage")).rows[0].n, 0, "sàn B đọc sổ chi phí AI của sàn A");
    await expectError(
      c,
      "insert into ai_usage (company_id, user_id, model, result) values ($1, 'u-ai-b', 'claude-opus-5-5', 'ok')",
      [COMPANY_A],
      /row-level security/,
    );
    await c.query("select set_config('app.company_id', $1, true)", [COMPANY_A]);
    await c.query("select set_config('app.user_id', 'u-ai-a', true)");
    assert.equal((await c.query("select count(*)::int n from ai_usage")).rows[0].n, 1, "sàn A không đọc được sổ của mình");
    await expectError(c, "update ai_usage set cost_usd = 0", [], /permission denied/);
    await expectError(c, "delete from ai_usage", [], /permission denied/);
  });
});

test("thoả thuận ai_processing: nhận loại mới, vẫn chặn nguồn và loại lạ, chỉ quản trị sàn tạo", { skip }, async () => {
  await asCompany(COMPANY_A, async (c) => {
    const them = (lop, kind = "ai_processing") =>
      c.query(
        `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by)
         values ($1, $2, 'outbound', 'anthropic', $3, now(), '[Tên]')`,
        [COMPANY_A, kind, lop],
      );
    // Không phải quản trị sàn: luật hạn chế từ chối.
    await c.query("select set_config('app.user_id', 'u-ai-dc', true)");
    await c.query("savepoint truoc_vai");
    await assert.rejects(them("{catalog,shareable_listing}"), /row-level security/);
    await c.query("rollback to savepoint truoc_vai");
    // Ràng buộc (vai chủ, không luật dòng): nhận loại mới; nguồn và loại lạ vẫn bị từ chối.
    await c.query("reset role");
    // Nguồn bị chặn TRƯỚC khi sàn có thoả thuận AI nào — mục «một thoả thuận mỗi sàn» chưa thể là lý do từ chối.
    await c.query("savepoint nguon");
    await assert.rejects(them("{catalog,source}"), /agreements_never_source/);
    await c.query("rollback to savepoint nguon");
    // Đối chứng dương: cùng câu chèn, bỏ lớp nguồn, được nhận.
    await them("{catalog,shareable_listing}");
    await c.query("savepoint la");
    await assert.rejects(them("{catalog}", "ai_magic"), /agreements_kind_check/);
    await c.query("rollback to savepoint la");
    // Một sàn một thoả thuận AI.
    await c.query("savepoint hai");
    await assert.rejects(them("{catalog}"), /agreements_mot_thoa_thuan_ai/);
    await c.query("rollback to savepoint hai");
  });
});


// ---- import_templates (045, hàng 50 mau-nhap-va-bai): sổ sửa mẫu file nhập ----
const chenMau = "insert into import_templates (company_id, header_key, action, target, transform, value_map) values ($1, $2, $3, $4, $5, $6)";

test("import_templates (045): cách ly", { skip }, async () => {
  // Quản trị A ghi một dòng; đối chứng: A đọc thấy.
  await asRole(UA, COMPANY_A, async (c) => {
    await c.query(chenMau, [COMPANY_A, "gia", "set", "listPrice", null, null]);
    assert.equal((await c.query("select count(*)::int n from import_templates")).rows[0].n, 1, "đối chứng: A thấy dòng của mình");
    // Cùng giao dịch, chuyển sang quản trị B ở sàn B: không thấy dòng của A, không chèn được vào A.
    await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [UB, COMPANY_B]);
    assert.equal((await c.query("select count(*)::int n from import_templates")).rows[0].n, 0, "sàn B đọc được mẫu của A");
    await expectError(c, chenMau, [COMPANY_A, "gia", "delete", null, null, null], /row-level security/);
  });
});

test("import_templates (045): chặn ở bảng", { skip }, async () => {
  // Vai không quản trị → chính sách chặn.
  await asRole(UN, COMPANY_A, async (c) => {
    await expectError(c, chenMau, [COMPANY_A, "gia", "delete", null, null, null], /row-level security/);
  });
  await asRole(UA, COMPANY_A, async (c) => {
    // Bảng viết trước: [ca, tham số, ràng buộc ghim].
    const BANG = [
      ["quy đổi ở trường lớp nguồn", ["so-chu", "set", "ownerPhone", null, '{"a":"b"}'], /import_templates_quy_doi_truong_dong/],
      ["quy đổi ở trường thường", ["gia", "set", "listPrice", null, '{"a":"b"}'], /import_templates_quy_doi_truong_dong/],
      ["xoá kèm đích", ["gia", "delete", "listPrice", null, null], /import_templates_xoa_khong_dich/],
      ["sửa thiếu đích", ["gia", "set", null, null, null], /import_templates_sua_co_dich/],
    ];
    let so = 0;
    for (const [, ts, ghim] of BANG) {
      await expectError(c, chenMau, [COMPANY_A, ...ts], ghim);
      so++;
    }
    assert.equal(so, BANG.length);
    // Đối chứng dương: quy đổi ở Trạng thái chèn được.
    await c.query(chenMau, [COMPANY_A, "trang-thai", "set", "standardStatus", null, '{"con":"Active"}']);
    assert.equal((await c.query("select count(*)::int n from import_templates")).rows[0].n, 1);
  });
});

test("import_templates (045): bảng chỉ thêm, quyền hẹp", { skip }, async () => {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    const r = (await c.query("select relrowsecurity, relforcerowsecurity from pg_class where relname = 'import_templates'")).rows[0];
    assert.equal(r.relrowsecurity, true, "chưa bật luật theo dòng");
    assert.equal(r.relforcerowsecurity, true, "chưa ép luật theo dòng");
    const quyen = (await c.query("select privilege_type p from information_schema.role_table_grants where table_name = 'import_templates' and grantee = 'quy_hang_app'")).rows.map((x) => x.p).sort();
    assert.deepEqual(quyen, ["INSERT", "SELECT"], "quy_hang_app sửa được sổ mẫu");
    const rang = (await c.query("select conname from pg_constraint where conrelid = 'import_templates'::regclass and contype = 'c'")).rows.map((x) => x.conname);
    for (const ten of ["import_templates_xoa_khong_dich", "import_templates_sua_co_dich", "import_templates_quy_doi_truong_dong"]) assert.ok(rang.includes(ten), `thiếu ràng buộc ${ten}`);
  } finally {
    await c.end();
  }
  await asRole(UA, COMPANY_A, async (c) => {
    await c.query(chenMau, [COMPANY_A, "gia", "set", "listPrice", null, null]);
    await expectError(c, "update import_templates set target = 'unitNumber'", [], /permission denied/);
    await expectError(c, "delete from import_templates", [], /permission denied/);
  });
});
// ---- Bảng quyền hàng (046, hàng bang-quyen-theo-vai) ----
// Cùng bảng 56 ô với lõi (packages/core/src/access/bang-quyen-hang.json) — đọc tệp, không chép bảng vào bài.
const BANG_QUYEN = JSON.parse(readFileSync(new URL("../../core/src/access/bang-quyen-hang.json", import.meta.url), "utf8"));
const THAO_TAC = ["xem", "tao", "sua", "dua_len_dang_ban"];
const BQ_GIU = "u-bq-giu"; // đầu chủ khác đang giữ căn
const BQ_TN = "u-bq-tn"; // trưởng nhóm đổi đầu chủ cho ca «từng giữ»
const BQ_B = "u-bq-b"; // người có Bảng hàng của sàn B
const bqNguoi = (i) => `u-bq-${i}`;
const bqHang = (i) => `00000000-0000-4000-8000-${(0xbb0000 + i).toString(16).padStart(12, "0")}`;

/** Đặt người và sàn của phiên dưới vai API. */
async function bqLa(c, nguoi, san = COMPANY_A) {
  await c.query("reset role");
  await c.query("set local role quy_hang_app");
  await c.query("select set_config('app.user_id', $1, true)", [nguoi]);
  await c.query("select set_config('app.company_id', $1, true)", [san]);
}

/**
 * Mỗi dòng bảng một thành viên đúng vai ở sàn A và một hàng riêng do người giữ theo «giu»: minh — chính người ấy, chua —
 * chưa ai, khac — đầu chủ khác, tung — chính người ấy rồi trưởng nhóm đổi sang đầu chủ khác bằng hàm đổi đầu chủ thật (027).
 */
async function withBangQuyen(fn) {
  return asUser(null, null, async (c) => {
    await c.query("reset role");
    const nguoi = [...BANG_QUYEN.map((_, i) => bqNguoi(i)), BQ_GIU, BQ_TN, BQ_B];
    for (const id of nguoi) {
      await c.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên]', $2, true)`, [id, `${id}@example.test`]);
    }
    for (const [i, o] of BANG_QUYEN.entries()) {
      await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [COMPANY_A, bqNguoi(i), o.vai]);
    }
    await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{listing_agent}'), ($1, $3, '{team_lead}'), ($4, $5, '{listing_agent,team_lead}')", [
      COMPANY_A,
      BQ_GIU,
      BQ_TN,
      COMPANY_B,
      BQ_B,
    ]);
    for (const [i, o] of BANG_QUYEN.entries()) {
      const h = bqHang(i);
      await c.query(
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, $2, 1, 'created', '{"buildingName":"[Toà Q]"}', $3, '{listing_agent}', false)`,
        [COMPANY_A, h, BQ_GIU],
      );
      await c.query("insert into listings (id, company_id, building_name, standard_status, version) values ($1, $2, '[Toà Q]', 'Hold', 1)", [h, COMPANY_A]);
      const dau = o.giu === "minh" || o.giu === "tung" ? bqNguoi(i) : o.giu === "khac" ? BQ_GIU : null;
      if (dau) {
        await c.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, $4)", [COMPANY_A, h, dau, BQ_TN]);
      }
    }
    // Ca «từng giữ»: trưởng nhóm đổi đầu chủ bằng đường thật — dòng gán mới nhất thành đầu chủ khác.
    const tung = BANG_QUYEN.flatMap((o, i) => (o.giu === "tung" ? [bqHang(i)] : []));
    if (tung.length) {
      await bqLa(c, BQ_TN);
      await c.query("select app.reassign_listing_agents($1, $2)", [tung, BQ_GIU]);
    }
    return fn(c);
  });
}

/** Một câu ghi trong savepoint: true khi qua (và mọi câu sửa trúng ≥1 dòng), false khi luật từ chối; luôn huỷ phần đã ghi. */
async function bqThu(c, cau) {
  await c.query("savepoint bq");
  try {
    for (const [sql, params] of cau) {
      const r = await c.query(sql, params);
      if (/^\s*update/i.test(sql) && r.rowCount === 0) return false;
    }
    return true;
  } catch (e) {
    if (!/row-level security/.test(String(e?.message))) throw e;
    return false;
  } finally {
    await c.query("rollback to savepoint bq");
  }
}

const BQ_CAU = {
  xem: async (c, h) => (await c.query("select 1 from listings where id = $1", [h])).rowCount === 1,
  tao: (c, _h, ai) =>
    bqThu(c, [
      [
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, '00000000-0000-4000-8000-00000000bbff', 1, 'created', '{"buildingName":"[Toà Q]"}', $2, '{}', false)`,
        [COMPANY_A, ai],
      ],
      ["insert into listings (id, company_id, building_name, standard_status, version) values ('00000000-0000-4000-8000-00000000bbff', $1, '[Toà Q]', 'Incomplete', 1)", [COMPANY_A]],
    ]),
  sua: (c, h, ai) =>
    bqThu(c, [
      [
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, $2, 2, 'price_changed', '{"listPrice":1000000000,"feeInclusion":"included"}', $3, '{}', false)`,
        [COMPANY_A, h, ai],
      ],
      ["update listings set list_price = 1000000000, fee_inclusion = 'included', version = 2 where id = $1", [h]],
    ]),
  dua_len_dang_ban: (c, h, ai) =>
    bqThu(c, [
      [
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, $2, 2, 'status_changed', '{"to":"Active"}', $3, '{}', false)`,
        [COMPANY_A, h, ai],
      ],
    ]),
};

test("bảng quyền hàng (046): luật theo dòng đếm khớp từng ô", { skip }, async () => {
  await withBangQuyen(async (c) => {
    assert.equal(BANG_QUYEN.length, 14);
    const lech = [];
    let so = 0;
    for (const [i, o] of BANG_QUYEN.entries()) {
      await bqLa(c, bqNguoi(i));
      for (const t of THAO_TAC) {
        const ra = await BQ_CAU[t](c, bqHang(i), bqNguoi(i));
        if (ra === o[t]) so++;
        else lech.push(`«${o.o}» × ${t}: mong ${o[t] ? "✓" : "✗"}, được ${ra ? "✓" : "✗"}`);
      }
    }
    assert.deepEqual(lech, [], "ô lệch giữa luật theo dòng và bảng quyền");
    assert.equal(so, BANG_QUYEN.length * THAO_TAC.length);
    assert.equal(so, 56);
  });
});

test("bảng quyền hàng (046): luật theo dòng xét vai", { skip }, async () => {
  await withBangQuyen(async (c) => {
    const ca = (ten) => {
      const i = BANG_QUYEN.findIndex((o) => o.o === ten);
      assert.ok(i >= 0, `bảng thiếu ca «${ten}»`);
      return [bqNguoi(i), bqHang(i)];
    };
    for (const ten of ["Telesales", "Quản trị sàn"]) {
      const [ai, h] = ca(ten);
      await bqLa(c, ai);
      assert.equal((await c.query("select 1 from listings where id = $1", [h])).rowCount, 0, `${ten} đọc listings`);
      assert.equal((await c.query("select 1 from listing_events where listing_id = $1", [h])).rowCount, 0, `${ten} đọc listing_events`);
      await expectError(c, "insert into listings (id, company_id, building_name, standard_status, version) values (gen_random_uuid(), $1, '[Toà]', 'Incomplete', 1)", [COMPANY_A], /row-level security/);
      await expectError(
        c,
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, gen_random_uuid(), 1, 'created', '{}', $2, '{}', false)`,
        [COMPANY_A, ai],
        /row-level security/,
      );
      await expectError(
        c,
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
         values ($1, $2, 2, 'price_changed', '{}', $3, '{}', false)`,
        [COMPANY_A, h, ai],
        /row-level security/,
      );
      assert.equal((await c.query("update listings set furnished = 'full' where id = $1", [h])).rowCount, 0, `${ten} sửa listings`);
    }
    for (const ten of ["Đầu khách", "Đầu khách · căn chưa ai giữ", "Đầu chủ · người khác giữ", "Đầu chủ từng giữ, căn đã đổi sang người khác"]) {
      const [ai, h] = ca(ten);
      await bqLa(c, ai);
      assert.equal(await BQ_CAU.dua_len_dang_ban(c, h, ai), false, `${ten} đưa lên Đang bán`);
      assert.equal(await BQ_CAU.sua(c, h, ai), true, `${ten} đổi giá (đối chứng)`);
    }
    const [tn, hTn] = ca("Trưởng nhóm · người khác giữ");
    await bqLa(c, tn);
    assert.equal(await BQ_CAU.dua_len_dang_ban(c, hTn, tn), true, "Trưởng nhóm đưa lên Đang bán");
    // Cách ly công ty giữ nguyên: người có Bảng hàng của sàn B không thấy hàng của sàn A.
    await bqLa(c, BQ_B, COMPANY_B);
    assert.equal((await c.query("select 1 from listings where id = $1", [hTn])).rowCount, 0, "sàn B đọc hàng của sàn A");
  });
});

test("bảng quyền hàng (046): hàm giữ khoá", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select p.proname, p.prosecdef, p.proconfig, pg_get_userbyid(p.proowner) as chu,
              array(select distinct (aclexplode(p.proacl)).grantee::regrole::text) as duoc
         from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'app' and p.proname in ('can_activate_listing', 'works_listings') order by p.proname`,
    );
    assert.deepEqual(rows.map((r) => r.proname), ["can_activate_listing", "works_listings"]);
    for (const r of rows) {
      assert.equal(r.prosecdef, true, `${r.proname}: prosecdef`);
      assert.deepEqual(r.proconfig, ['search_path=""'], `${r.proname}: search_path rỗng`);
      assert.deepEqual([...r.duoc].sort(), [r.chu, "quy_hang_app"].sort(), `${r.proname}: chỉ chủ hàm và quy_hang_app được gọi`);
    }
  } finally {
    await client.end();
  }
});

// ---- Dấu định nghĩa bao phí (050, hàng 49 thue-phi) ----
const PHI_HANG_A = "00000000-0000-4000-8000-0000000049a1";
const PHI_HANG_A2 = "00000000-0000-4000-8000-0000000049a2";
const PHI_HANG_B = "00000000-0000-4000-8000-0000000049b1";
const MAC_DINH_PHI = { personalIncomeTax: 200, registrationFee: 50, brokerageFee: 100 };
const BA_KHOAN = ["personalIncomeTax", "registrationFee", "brokerageFee"];

/** Hàng `h` của sàn `san` (vai chủ): sự kiện created rồi một price_changed với điều kiện phí `phi`. */
async function phiHang(c, san, h, phi, nguoi = USER_1) {
  await c.query(
    `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
     values ($1, $2, 1, 'created', '{"buildingName":"[Toà Q]"}', $3, '{listing_agent}', false),
            ($1, $2, 2, 'price_changed', $4, $3, '{listing_agent}', false)`,
    [san, h, nguoi, JSON.stringify({ listPrice: 3_000_000_000, feeInclusion: phi })],
  );
  await c.query("insert into listings (id, company_id, building_name, standard_status, version) values ($1, $2, '[Toà Q]', 'Hold', 2)", [h, san]);
}

const dauCua = async (c, h) =>
  (await c.query("select included_items, rates, computed_at, (select occurred_at from listing_events e where e.listing_id = d.listing_id and e.seq = d.seq) as luc from listing_price_fee_basis d where listing_id = $1 order by seq", [h])).rows;

test("thuế phí: điền dấu cho giá cũ", { skip }, async () => {
  await asUser(null, null, async (c) => {
    await c.query("reset role");
    await c.query("alter table listing_events disable trigger dong_dau_phi");
    await phiHang(c, COMPANY_A, PHI_HANG_A, "included");
    await phiHang(c, COMPANY_A, PHI_HANG_A2, "excluded");
    await c.query("alter table listing_events enable trigger dong_dau_phi");
    assert.equal((await dauCua(c, PHI_HANG_A)).length, 0, "trigger tắt thì chưa có dấu");
    assert.ok((await c.query("select app.dien_dau_phi_cu() as n")).rows[0].n >= 1);
    const [d, ...thua] = await dauCua(c, PHI_HANG_A);
    assert.equal(thua.length, 0, "đúng một dấu cho sự kiện bao phí");
    assert.deepEqual(d.included_items, BA_KHOAN);
    assert.deepEqual(d.rates, MAC_DINH_PHI);
    assert.equal(d.computed_at.toISOString(), d.luc.toISOString(), "ngày tính = lúc ghi sự kiện");
    assert.equal((await dauCua(c, PHI_HANG_A2)).length, 0, "giá không bao phí không có dấu");
    assert.equal((await c.query("select app.dien_dau_phi_cu() as n")).rows[0].n, 0, "chạy lại không thêm dòng");
    assert.equal((await dauCua(c, PHI_HANG_A)).length, 1);
  });
});

test("listing_price_fee_basis: công ty này không đọc, không ghi được dấu của công ty kia", { skip }, async () => {
  await asUser(null, null, async (c) => {
    await c.query("reset role");
    await c.query("update company_members set roles = '{listing_agent}' where user_id in ($1, $2)", [USER_1, USER_2]);
    await c.query("insert into company_settings (company_id, key, value, updated_by) values ($1, 'fee.brokerage_pct', '2', $2)", [COMPANY_A, USER_1]);
    await phiHang(c, COMPANY_A, PHI_HANG_A, "included");
    await phiHang(c, COMPANY_B, PHI_HANG_B, "included", USER_2);
    // Đổi của sàn A không chạm dấu của sàn B.
    assert.deepEqual((await dauCua(c, PHI_HANG_A))[0].rates, { ...MAC_DINH_PHI, brokerageFee: 200 });
    assert.deepEqual((await dauCua(c, PHI_HANG_B))[0].rates, MAC_DINH_PHI);

    await bqLa(c, USER_1, COMPANY_A);
    assert.equal((await c.query("select 1 from listing_price_fee_basis where listing_id = $1", [PHI_HANG_A])).rowCount, 1, "sàn A đọc dấu của mình");
    assert.equal((await c.query("select 1 from listing_price_fee_basis where company_id = $1", [COMPANY_B])).rowCount, 0, "sàn A đọc dấu của sàn B");
    await expectError(c, "insert into listing_price_fee_basis (company_id, listing_id, seq, included_items, rates, computed_at) values ($1, $2, 2, '{}', '{}', now())", [COMPANY_A, PHI_HANG_A], /permission denied/);
    await expectError(c, "update listing_price_fee_basis set rates = '{}' where listing_id = $1", [PHI_HANG_A], /permission denied/);
    await expectError(c, "delete from listing_price_fee_basis where listing_id = $1", [PHI_HANG_A], /permission denied/);

    await bqLa(c, USER_2, COMPANY_B);
    assert.equal((await c.query("select 1 from listing_price_fee_basis where listing_id = $1", [PHI_HANG_B])).rowCount, 1, "sàn B đọc dấu của mình");
    assert.equal((await c.query("select 1 from listing_price_fee_basis where company_id = $1", [COMPANY_A])).rowCount, 0, "sàn B đọc dấu của sàn A");
    assert.equal((await c.query("select value from company_settings where company_id = $1", [COMPANY_A])).rowCount, 0, "sàn B đọc cấu hình phí của sàn A");
  });
});
