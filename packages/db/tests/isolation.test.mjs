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
    // Dưới B.
    await lamNguoi(c, NG_B, COMPANY_B);
    const ids = (rows) => rows.map((r) => r.lead_id);
    assert.deepEqual(ids((await c.query("select * from app.lead_routing_queue()")).rows).filter((x) => idA.includes(x)), []);
    assert.deepEqual((await c.query("select * from app.lead_routing_candidates()")).rows.map((r) => r.user_id).filter((x) => nguoiA.includes(x)), []);
    assert.deepEqual(ids((await c.query("select * from app.lead_deadline_facts()")).rows).filter((x) => idA.includes(x)), []);
    assert.deepEqual(ids((await c.query("select * from app.lead_pool()")).rows).filter((x) => idA.includes(x)), []);
    assert.deepEqual((await c.query("select * from app.lead_routing_settings_rows()")).rows, []);
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
