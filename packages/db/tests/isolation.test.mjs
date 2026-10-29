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
