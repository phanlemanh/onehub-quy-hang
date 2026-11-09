// Vùng danh mục dùng chung (010_danh_muc_dung_chung, 014_danh_muc_doc_cua_minh): mọi sàn đọc chung cột danh mục; chỉ sàn được tin, ghi bằng thoả thuận
// `catalog_source` chiều vào đang hiệu lực của chính mình, mới ghi được; không ai tự thêm mình vào danh sách tin, không
// ai xoá. Chạy trên Postgres thật đã áp migration; mỗi ca một giao dịch rồi rollback.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bộ kiểm danh mục dùng chung cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

// Sàn riêng của tệp này, không đụng sàn của isolation.test.mjs khi các tệp chạy song song.
const TRUSTED = "00000000-0000-4000-8000-0000000c0a01"; // được tin
const TRUSTED_OTHER = "00000000-0000-4000-8000-0000000c0a02"; // được tin, sàn khác
const UNTRUSTED = "00000000-0000-4000-8000-0000000c0a03"; // không được tin

const nhan = () => randomBytes(4).toString("hex");

/**
 * Dựng ba sàn, các thoả thuận của sàn được tin và danh sách tin bằng vai chủ, rồi chuyển sang vai của API.
 * `ag` gom mã thoả thuận: `valid` hợp lệ; `bad` là 9 phần tử không cho ghi đối với sàn TRUSTED.
 */
async function withCatalog(fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query(
      "insert into companies (id, name) values ($1, '[Sàn tin]'), ($2, '[Sàn tin khác]'), ($3, '[Sàn ngoài]')",
      [TRUSTED, TRUSTED_OTHER, UNTRUSTED],
    );
    const them = async (company, kind, direction, classes, from, until, status) =>
      (
        await client.query(
          `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, valid_until,
                                   status, approved_by)
           values ($1, $2, $3, 'onehub-invest', $4, $5, $6, $7, '[Tên]') returning id`,
          [company, kind, direction, classes, from, until, status],
        )
      ).rows[0].id;
    const t = (d) => new Date(Date.now() + d * 86_400_000).toISOString();
    const ag = {
      valid: await them(TRUSTED, "catalog_source", "inbound", "{catalog}", t(-1), null, "active"),
      otherValid: await them(TRUSTED_OTHER, "catalog_source", "inbound", "{catalog}", t(-1), null, "active"),
    };
    ag.bad = {
      "không có": "00000000-0000-4000-8000-0000000c0aff",
      paused: await them(TRUSTED, "catalog_source", "inbound", "{catalog}", t(-1), null, "paused"),
      ended: await them(TRUSTED, "catalog_source", "inbound", "{catalog}", t(-1), null, "ended"),
      "valid_until qua": await them(TRUSTED, "catalog_source", "inbound", "{catalog}", t(-2), t(-1), "active"),
      "valid_from chưa tới": await them(TRUSTED, "catalog_source", "inbound", "{catalog}", t(1), null, "active"),
      "thiếu catalog": await them(TRUSTED, "catalog_source", "inbound", "{shareable_listing}", t(-1), null, "active"),
      lead_source: await them(TRUSTED, "lead_source", "inbound", "{catalog}", t(-1), null, "active"),
      outbound: await them(TRUSTED, "catalog_source", "outbound", "{catalog}", t(-1), null, "active"),
      "thoả thuận hợp lệ của sàn được tin khác": ag.otherValid,
    };
    await client.query("insert into catalog_trusted_companies (company_id) values ($1), ($2)", [TRUSTED, TRUSTED_OTHER]);
    await client.query("set local role quy_hang_app");
    return await fn(client, ag);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

const datSan = (c, company) => c.query("select set_config('app.company_id', $1, true)", [company ?? ""]);

/** Chạy một câu dự kiến lỗi mang SQLSTATE `code` mà không làm hỏng giao dịch của ca. */
async function expectCode(c, sql, params, code, nhanCa) {
  await c.query("savepoint expect_error");
  await assert.rejects(c.query(sql, params), (err) => {
    assert.equal(err.code, code, `${nhanCa}: SQLSTATE ${err.code} (${err.message})`);
    return true;
  });
  await c.query("rollback to savepoint expect_error");
}

const INSERT_KHU = `insert into catalog_subdivisions (subdivision_key, subdivision_name, provider, measured_at, agreement_id)
                    values ($1, '[Mẫu] Khu', 'onehub-invest', now(), $2)`;
const INSERT_CAN = `insert into catalog_units (upi, subdivision_key, building_key, building_name, unit_number, property_type,
                                               property_sub_type, provider, measured_at, agreement_id)
                    values ($1, $2, 'toa-1', '[Mẫu] Toà', 'A-01', 'Residential', 'Apartment', 'onehub-invest', now(), $3)`;

/** Ghi một khu và một căn bằng thoả thuận hợp lệ của sàn được tin (đi qua luật, không lách bằng vai chủ). */
async function ghiMau(c, ag) {
  const khu = `thu-${nhan()}`;
  const upi = `urn:onehub:upi:thu:${nhan()}`;
  await datSan(c, TRUSTED);
  await c.query(INSERT_KHU, [khu, ag.valid]);
  await c.query(INSERT_CAN, [upi, khu, ag.valid]);
  return { khu, upi };
}

test("danh mục dùng chung: thoả thuận không hợp lệ thì không ghi được", { skip }, async () => {
  await withCatalog(async (c, ag) => {
    const { khu, upi } = await ghiMau(c, ag); // đối chứng dương: cùng dữ liệu, thoả thuận hợp lệ ghi được
    const daXet = { insertKhu: 0, insertCan: 0, updateKhu: 0, updateCan: 0 };
    for (const [ten, id] of Object.entries(ag.bad)) {
      await expectCode(c, INSERT_KHU, [`thu-${nhan()}`, id], "42501", `insert khu · ${ten}`);
      daXet.insertKhu++;
      await expectCode(c, INSERT_CAN, [`urn:onehub:upi:thu:${nhan()}`, khu, id], "42501", `insert căn · ${ten}`);
      daXet.insertCan++;
      await expectCode(c, "update catalog_subdivisions set agreement_id = $1 where subdivision_key = $2", [id, khu], "42501",
        `update khu · ${ten}`);
      daXet.updateKhu++;
      await expectCode(c, "update catalog_units set agreement_id = $1 where upi = $2", [id, upi], "42501", `update căn · ${ten}`);
      daXet.updateCan++;
    }
    assert.deepEqual(daXet, { insertKhu: 9, insertCan: 9, updateKhu: 9, updateCan: 9 });
    // Đối chứng dương cho update: thoả thuận hợp lệ sửa được.
    assert.equal((await c.query("update catalog_subdivisions set subdivision_name = '[Mẫu] Khu mới' where subdivision_key = $1",
      [khu])).rowCount, 1);
    assert.equal((await c.query("update catalog_units set floor = 2 where upi = $1", [upi])).rowCount, 1);
    // Sàn được tin khác ghi được bằng thoả thuận của chính nó.
    await datSan(c, TRUSTED_OTHER);
    assert.equal((await c.query(INSERT_KHU, [`thu-${nhan()}`, ag.otherValid])).rowCount, 1);
  });
});

test("danh mục dùng chung: sàn tự tạo thoả thuận mà không được tin không ghi được", { skip }, async () => {
  await withCatalog(async (c) => {
    await datSan(c, UNTRUSTED);
    const tuTao = (
      await c.query(
        `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by)
         values ($1, 'catalog_source', 'inbound', 'onehub-invest', '{catalog}', now() - interval '1 day', '[Tên]')
         returning id`,
        [UNTRUSTED],
      )
    ).rows[0].id;
    const khu = `thu-${nhan()}`;
    await expectCode(c, INSERT_KHU, [khu, tuTao], "42501", "sàn ngoài tự tạo thoả thuận");
    // Đối chứng dương: vận hành thêm sàn vào danh sách tin thì cùng thoả thuận ghi được.
    await c.query("reset role");
    await c.query("insert into catalog_trusted_companies (company_id) values ($1)", [UNTRUSTED]);
    await c.query("set local role quy_hang_app");
    await datSan(c, UNTRUSTED);
    assert.equal((await c.query(INSERT_KHU, [khu, tuTao])).rowCount, 1);
  });
});

test("danh mục dùng chung: không ai tự thêm mình vào danh sách tin", { skip }, async () => {
  await withCatalog(async (c) => {
    for (const san of [UNTRUSTED, TRUSTED, null]) {
      await datSan(c, san);
      await expectCode(c, "insert into catalog_trusted_companies (company_id) values ($1)", [UNTRUSTED], "42501",
        `tự thêm · sàn ${san ?? "chưa đặt"}`);
    }
    await c.query("reset role");
    assert.equal((await c.query("select 1 from catalog_trusted_companies where company_id = $1", [UNTRUSTED])).rowCount, 0);
  });
});

test("danh mục dùng chung: không ai xoá được", { skip }, async () => {
  await withCatalog(async (c, ag) => {
    const { khu, upi } = await ghiMau(c, ag);
    for (const san of [TRUSTED, UNTRUSTED, null]) {
      await datSan(c, san);
      for (const [sql, p] of [
        ["delete from catalog_units where upi = $1", [upi]],
        ["delete from catalog_subdivisions where subdivision_key = $1", [khu]],
        ["delete from catalog_trusted_companies where company_id = $1", [TRUSTED]],
      ]) {
        await c.query("savepoint xoa");
        try {
          const r = await c.query(sql, p);
          assert.equal(r.rowCount, 0, `${sql} xoá được ${r.rowCount} dòng`);
        } catch (err) {
          assert.equal(err.code, "42501", `${sql}: ${err.message}`);
        }
        await c.query("rollback to savepoint xoa");
      }
    }
    await c.query("reset role");
    assert.equal((await c.query("select 1 from catalog_units where upi = $1", [upi])).rowCount, 1, "căn mất");
    assert.equal((await c.query("select 1 from catalog_subdivisions where subdivision_key = $1", [khu])).rowCount, 1, "khu mất");
    assert.equal((await c.query("select 1 from catalog_trusted_companies where company_id = $1", [TRUSTED])).rowCount, 1);
  });
});

test("danh mục dùng chung: mọi sàn và lời gọi chưa đặt sàn đọc được", { skip }, async () => {
  await withCatalog(async (c, ag) => {
    const { khu, upi } = await ghiMau(c, ag);
    for (const san of [TRUSTED, TRUSTED_OTHER, UNTRUSTED, null]) {
      await datSan(c, san);
      const ten = san ?? "chưa đặt";
      assert.equal((await c.query("select 1 from catalog_subdivisions where subdivision_key = $1", [khu])).rowCount, 1, `khu · ${ten}`);
      assert.equal((await c.query("select 1 from catalog_units where upi = $1", [upi])).rowCount, 1, `căn · ${ten}`);
    }
  });
});

test("danh mục dùng chung: mỗi sàn chỉ thấy dòng tin của mình, không ai đọc mã thoả thuận", { skip }, async () => {
  await withCatalog(async (c, ag) => {
    const a = await ghiMau(c, ag);
    const khuB = `thu-${nhan()}`;
    const upiB = `urn:onehub:upi:thu:${nhan()}`;
    await datSan(c, TRUSTED_OTHER);
    await c.query(INSERT_KHU, [khuB, ag.otherValid]);
    await c.query(INSERT_CAN, [upiB, khuB, ag.otherValid]);

    // Danh sách tin: mỗi sàn đúng một dòng là của mình; lời gọi chưa đặt sàn không thấy dòng nào.
    for (const [san, mong] of [[TRUSTED, [TRUSTED]], [TRUSTED_OTHER, [TRUSTED_OTHER]], [null, []]]) {
      await datSan(c, san);
      const { rows } = await c.query("select company_id from catalog_trusted_companies order by company_id");
      assert.deepEqual(rows.map((r) => r.company_id), mong, `danh sách tin · ${san ?? "chưa đặt"}`);
    }

    // Mã thoả thuận: bốn phép đọc viết trước, mỗi phép bị từ chối bằng lỗi quyền.
    const DOC = [
      [TRUSTED, "select agreement_id from catalog_subdivisions where subdivision_key = $1", [khuB], "A đọc khu của B"],
      [TRUSTED, "select agreement_id from catalog_units where upi = $1", [upiB], "A đọc căn của B"],
      [TRUSTED, "select agreement_id from catalog_subdivisions where subdivision_key = $1", [a.khu], "A đọc khu của A"],
      [null, "select agreement_id from catalog_units where upi = $1", [a.upi], "chưa đặt sàn đọc căn của A"],
    ];
    let daSo = 0;
    for (const [san, sql, params, ten] of DOC) {
      await datSan(c, san);
      await expectCode(c, sql, params, "42501", ten);
      daSo++;
    }
    assert.equal(daSo, 4);

    // Đối chứng dương: MỌI cột danh mục (danh sách viết trước, trừ agreement_id) của dòng sàn B đọc được bằng vai API.
    const DOC_KHU = ["subdivision_key", "subdivision_name", "complex_name", "provider", "measured_at", "updated_at"];
    const DOC_CAN = ["upi", "subdivision_key", "building_key", "building_name", "unit_number", "stack", "floor", "living_area",
      "bedrooms_total", "direction_faces", "property_type", "property_sub_type", "lot_size_area", "stories_total",
      "frontage_length", "access_road_width", "provider", "measured_at", "updated_at", "field_confidence"];
    await datSan(c, TRUSTED);
    const khu = await c.query(`select ${DOC_KHU.join(", ")} from catalog_subdivisions where subdivision_key = $1`, [khuB]);
    assert.equal(khu.rowCount, 1);
    assert.deepEqual(Object.keys(khu.rows[0]), DOC_KHU);
    assert.deepEqual(
      { subdivision_key: khu.rows[0].subdivision_key, subdivision_name: khu.rows[0].subdivision_name,
        complex_name: khu.rows[0].complex_name, provider: khu.rows[0].provider },
      { subdivision_key: khuB, subdivision_name: "[Mẫu] Khu", complex_name: null, provider: "onehub-invest" },
    );
    assert.ok(khu.rows[0].measured_at instanceof Date && khu.rows[0].updated_at instanceof Date);
    const can = await c.query(`select ${DOC_CAN.join(", ")} from catalog_units where upi = $1`, [upiB]);
    assert.equal(can.rowCount, 1);
    assert.deepEqual(Object.keys(can.rows[0]), DOC_CAN);
    const { measured_at, updated_at, ...giaTri } = can.rows[0];
    assert.ok(measured_at instanceof Date && updated_at instanceof Date);
    assert.deepEqual(giaTri, {
      upi: upiB, subdivision_key: khuB, building_key: "toa-1", building_name: "[Mẫu] Toà", unit_number: "A-01",
      stack: null, floor: null, living_area: null, bedrooms_total: null, direction_faces: null,
      property_type: "Residential", property_sub_type: "Apartment", lot_size_area: null, stories_total: null,
      frontage_length: null, access_road_width: null, provider: "onehub-invest",
    });
    // Đối chiếu: tập cột vai API đọc được (quyền theo cột) đúng bằng hai danh sách trên — không thiếu, không thừa.
    for (const [bang, mong] of [["catalog_subdivisions", DOC_KHU], ["catalog_units", DOC_CAN]]) {
      const { rows } = await c.query(
        `select column_name from information_schema.columns
          where table_schema = 'public' and table_name = $1
            and has_column_privilege('quy_hang_app', format('public.%I', table_name), column_name, 'SELECT')
          order by column_name`,
        [bang],
      );
      assert.deepEqual(rows.map((r) => r.column_name), [...mong].sort(), `cột đọc được · ${bang}`);
    }
  });
});

test("danh mục dùng chung: ba bảng bật và ép luật theo dòng", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity and c.relforcerowsecurity
         and c.relname in ('catalog_subdivisions', 'catalog_units', 'catalog_trusted_companies')
       order by c.relname`,
    );
    assert.deepEqual(rows.map((r) => r.relname), ["catalog_subdivisions", "catalog_trusted_companies", "catalog_units"]);
    assert.equal(rows.length, 3);
  } finally {
    await client.end();
  }
});

// Danh sách viết tay trước khi viết migration: thêm cột là sửa danh sách này có chủ ý.
const COT_DU_KIEN = {
  catalog_subdivisions: ["subdivision_key", "subdivision_name", "complex_name", "provider", "measured_at", "agreement_id",
    "updated_at"],
  catalog_units: ["upi", "subdivision_key", "building_key", "building_name", "unit_number", "stack", "floor", "living_area",
    "bedrooms_total", "direction_faces", "property_type", "property_sub_type", "lot_size_area", "stories_total",
    "frontage_length", "access_road_width", "provider", "measured_at", "agreement_id", "updated_at", "field_confidence"],
  catalog_trusted_companies: ["company_id"],
};

test("danh mục dùng chung: tập cột đúng danh sách viết trước", { skip }, async () => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    for (const [bang, cot] of Object.entries(COT_DU_KIEN)) {
      const { rows } = await client.query(
        "select column_name from information_schema.columns where table_schema = 'public' and table_name = $1",
        [bang],
      );
      const thuc = rows.map((r) => r.column_name).sort();
      assert.deepEqual(thuc, [...cot].sort(), `cột của ${bang}`);
      const lo = thuc.filter((t) => /owner|phone|price|photo/.test(t));
      assert.deepEqual(lo, [], `${bang} có cột mang dữ liệu nguồn`);
    }
  } finally {
    await client.end();
  }
});
