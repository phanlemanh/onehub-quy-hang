// Thoả thuận «Xác nhận danh mục» (040_xac_nhan_danh_muc, hàng 95): cơ sở dữ liệu chỉ nhận loại này ở chiều ra, đúng lớp
// danh mục, không điều khoản riêng — kể cả khi 040 áp sau 052 như trên bản thật. Chạy trên Postgres thật đã áp migration;
// mỗi ca một giao dịch rồi rollback.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bộ kiểm xác nhận danh mục cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

const MIGRATIONS = fileURLToPath(new URL("../migrations/", import.meta.url));
const TEP_040 = readdirSync(MIGRATIONS).find((f) => f.startsWith("040_"));
const SQL_040 = readFileSync(MIGRATIONS + TEP_040, "utf8");

// Sàn riêng của tệp này, không đụng sàn của tệp khác khi các tệp chạy song song.
const SAN = "00000000-0000-4000-8000-0000000c0b01";
const MOI = "agreements_xac_nhan_chi_danh_muc";
const SAU_DANH_MUC = ["shareable_listing", "company_internal", "custom_field", "source", "transaction", "behavior"];
// Hai lớp có ràng buộc cũ (001) báo trước ràng buộc mới — Postgres kiểm check theo thứ tự tên.
const RANG_BUOC_CU = { source: "agreements_never_source", company_internal: "agreements_internal_stays" };

/** Các loại trong check `kind in (…)` của `agreements_kind_check` ở một đoạn SQL. */
export function rutLoai(sql) {
  const m = sql.match(/add constraint agreements_kind_check\s+check \(kind in \(([^)]*)\)\)/);
  if (!m) return [];
  return [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]);
}

/** Tệp migration số > 040 nhắc tới một trong hai ràng buộc của 040. */
export function timGhiDe(teps) {
  return teps
    .filter(({ ten }) => Number(ten.slice(0, 3)) > 40)
    .filter(({ sql }) => /agreements_kind_check|agreements_xac_nhan_chi_danh_muc/.test(sql))
    .map(({ ten }) => ten);
}

const INSERT = `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by,
                                        special_terms)
                values ($1, $2, $3, 'onehub-invest', $4, now() - interval '1 day', '[Tên]', $5) returning id`;

async function trongGiaoDich(fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("insert into companies (id, name) values ($1, '[Sàn mẫu xác nhận]')", [SAN]);
    return await fn(client);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

const vaiApi = async (c) => {
  await c.query("set local role quy_hang_app");
  await c.query("select set_config('app.company_id', $1, true)", [SAN]);
};

/** Chạy một câu dự kiến vi phạm ràng buộc, trả tên ràng buộc, không làm hỏng giao dịch của ca. */
async function tenRangBuoc(c, sql, params, nhanCa) {
  await c.query("savepoint du_kien_loi");
  let ten = null;
  await assert.rejects(c.query(sql, params), (err) => {
    assert.equal(err.code, "23514", `${nhanCa}: SQLSTATE ${err.code} (${err.message})`);
    ten = err.constraint;
    return true;
  });
  await c.query("rollback to savepoint du_kien_loi");
  return ten;
}

/** Ma trận chính của E2 trên giao dịch đang mở; trả số lần so. */
async function maTranChiDanhMuc(c) {
  let dem = 0;
  for (const lop of SAU_DANH_MUC) {
    const ten = await tenRangBuoc(c, INSERT, [SAN, "catalog_confirmation", "outbound", `{catalog,${lop}}`, false], lop);
    assert.equal(ten, RANG_BUOC_CU[lop] ?? MOI, `lớp ${lop}: ràng buộc báo`);
    dem++;
  }
  assert.equal(
    await tenRangBuoc(c, INSERT, [SAN, "catalog_confirmation", "inbound", "{catalog}", false], "chiều vào"),
    MOI,
    "chiều vào",
  );
  assert.equal(
    await tenRangBuoc(c, INSERT, [SAN, "catalog_confirmation", "outbound", "{catalog}", true], "điều khoản riêng"),
    MOI,
    "điều khoản riêng",
  );
  // Đối chứng dương: chiều ra, chỉ danh mục, không điều khoản riêng.
  const hop = await c.query(INSERT, [SAN, "catalog_confirmation", "outbound", "{catalog}", false]);
  assert.equal(hop.rowCount, 1, "thoả thuận đúng thêm được");
  assert.equal(
    await tenRangBuoc(c, "update agreements set data_classes = '{catalog,transaction}' where id = $1", [hop.rows[0].id], "update"),
    MOI,
    "update sang giá chốt",
  );
  return dem + 3;
}

test("xác nhận danh mục: cơ sở dữ liệu chỉ nhận lớp danh mục", { skip }, async () => {
  await trongGiaoDich(async (c) => {
    await vaiApi(c);
    assert.equal(await maTranChiDanhMuc(c), SAU_DANH_MUC.length + 3);
    // Hai lớp có ràng buộc cũ: gỡ ràng buộc cũ (chủ bảng) thì vẫn bị chặn đúng bằng ràng buộc mới.
    await c.query("reset role");
    await c.query("alter table agreements drop constraint agreements_never_source, drop constraint agreements_internal_stays");
    await vaiApi(c);
    let dem = 0;
    for (const lop of Object.keys(RANG_BUOC_CU)) {
      const ten = await tenRangBuoc(c, INSERT, [SAN, "catalog_confirmation", "outbound", `{catalog,${lop}}`, false], `${lop} (gỡ ràng buộc cũ)`);
      assert.equal(ten, MOI, `lớp ${lop} khi gỡ ràng buộc cũ`);
      dem++;
    }
    assert.equal(dem, 2);
  });
});

test("xác nhận danh mục: mọi loại kết nối đều thêm được", { skip }, async () => {
  const loai = rutLoai(SQL_040);
  assert.equal(loai.length, 8, `040 khai ${loai.length} loại`);
  await trongGiaoDich(async (c) => {
    let dem = 0;
    for (const kind of loai) {
      // Chủ bảng (bỏ qua luật theo dòng — ca này đo ràng buộc check, không đo quyền vai).
      const r = await c.query(INSERT, [SAN, kind, "outbound", "{catalog}", false]);
      dem += r.rowCount;
    }
    assert.equal(dem, loai.length);
    assert.equal(dem, 8);
  });
});

test("xác nhận danh mục: thứ tự của bản thật: áp lại 040 sau 052", { skip }, async () => {
  await trongGiaoDich(async (c) => {
    await c.query(SQL_040); // cơ sở dữ liệu đã có mọi migration tới 052: áp lại không lỗi
    await vaiApi(c);
    const tx = await tenRangBuoc(c, INSERT, [SAN, "catalog_confirmation", "outbound", "{catalog,transaction}", false], "transaction");
    assert.equal(tx, MOI, "giá chốt vẫn bị chặn sau khi áp lại");
    assert.equal((await c.query(INSERT, [SAN, "catalog_confirmation", "outbound", "{catalog}", false])).rowCount, 1);
  });
});

test("xác nhận danh mục: không migration nào sau 040 đổi lại ràng buộc", () => {
  const teps = readdirSync(MIGRATIONS)
    .filter((f) => /^\d{3}_.+\.sql$/.test(f))
    .map((ten) => ({ ten, sql: readFileSync(MIGRATIONS + ten, "utf8") }));
  assert.ok(teps.some((t) => Number(t.ten.slice(0, 3)) > 40), "có migration sau 040 để quét");
  assert.deepEqual(timGhiDe(teps), []);
  // Đối chứng âm cùng hàm quét.
  assert.deepEqual(timGhiDe([{ ten: "099_thu.sql", sql: "alter table agreements drop constraint agreements_kind_check;" }]), [
    "099_thu.sql",
  ]);
});
