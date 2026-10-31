// Bộ kiểm cách ly: «công ty này không thấy gì của công ty kia» — check bắt buộc trước mỗi lần phát hành.
// Chạy trên Postgres thật đã áp migration. Mỗi ca trong một giao dịch rồi rollback, không để lại dữ liệu.
import assert from "node:assert/strict";
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
