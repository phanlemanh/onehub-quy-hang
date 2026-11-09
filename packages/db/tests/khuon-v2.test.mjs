// Khuôn nguồn danh mục v2 (042_danh_muc_thi_truong_v2, hàng 94): quyền và luật của hai bảng ảnh chụp, ràng buộc nhãn độ chắc,
// và cùng kết quả dù 042 áp trước 043–052 hay sau 052. Chạy trên Postgres thật đã áp migration; mỗi ca một giao dịch rồi
// rollback, ca thứ tự dựng cơ sở dữ liệu tạm và luôn xoá lại.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bộ kiểm khuôn v2 cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

const SAN = "00000000-0000-4000-8000-0000000094a1";
const KHU = "khu-kiem-khuon-v2";
const BANG = [
  { ten: "catalog_market_snapshots", cot: "segments" },
  { ten: "catalog_public_listing_snapshots", cot: "listings" },
];

async function trongGiaoDich(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("insert into companies (id, name) values ($1, '[Sàn khuôn v2]')", [SAN]);
    await c.query("insert into catalog_trusted_companies (company_id) values ($1)", [SAN]);
    const tt = async (status) =>
      (
        await c.query(
          `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by, status)
           values ($1, 'catalog_source', 'inbound', 'onehub-invest', '{catalog}', now() - interval '1 day', '[Tên]', $2) returning id`,
          [SAN, status],
        )
      ).rows[0].id;
    const song = await tt("active");
    const tat = await tt("paused");
    await c.query("insert into catalog_subdivisions (subdivision_key, subdivision_name, provider, measured_at, agreement_id) values ($1, '[Mẫu] Khu', '[Mẫu]', now(), $2)", [KHU, song]);
    return await fn(c, { song, tat });
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}
const vaiApi = async (c) => {
  await c.query("set local role quy_hang_app");
  await c.query("select set_config('app.company_id', $1, true), set_config('app.user_id', '', true)", [SAN]);
};
async function duKienLoi(c, sql, params, kiem, nhan) {
  await c.query("savepoint du_kien_loi");
  await assert.rejects(c.query(sql, params), kiem, nhan);
  await c.query("rollback to savepoint du_kien_loi");
}
const biQuyen = (e) => e.code === "42501" && /permission denied/.test(e.message);
const biLuatDong = (e) => e.code === "42501" && /row-level security/.test(e.message);

test("ảnh chụp: quyền và luật", { skip }, async () => {
  await trongGiaoDich(async (c, tt) => {
    const { rows } = await c.query("select relname, relrowsecurity r, relforcerowsecurity f from pg_class where relname = any ($1) order by relname", [BANG.map((b) => b.ten)]);
    assert.deepEqual(rows.map((x) => [x.relname, x.r, x.f]), BANG.map((b) => [b.ten, true, true]).sort());
    let soLan = 0;
    for (const b of BANG) {
      const chen = `insert into ${b.ten} (subdivision_key, provider, measured_at, agreement_id, ${b.cot}) values ($1, '[Mẫu]', now(), $2, '[]'::jsonb)`;
      const sua = `update ${b.ten} set agreement_id = $2, measured_at = now() where subdivision_key = $1`;
      await vaiApi(c);
      await duKienLoi(c, chen, [KHU, tt.tat], biLuatDong, `${b.ten}: chèn với thoả thuận tắt`);
      assert.equal((await c.query(chen, [KHU, tt.song])).rowCount, 1, `${b.ten}: đối chứng chèn với thoả thuận hiệu lực`);
      for (const cot of [b.cot, "agreement_id"]) {
        await duKienLoi(c, `select ${cot} from ${b.ten}`, [], biQuyen, `${b.ten}: đọc ${cot}`);
        soLan += 1;
      }
      assert.equal((await c.query(`select subdivision_key, measured_at from ${b.ten}`)).rowCount, 1, `${b.ten}: đối chứng đọc được hai cột`);
      await duKienLoi(c, `delete from ${b.ten}`, [], biQuyen, `${b.ten}: xoá`);
      await duKienLoi(c, sua, [KHU, tt.tat], biLuatDong, `${b.ten}: sửa sang thoả thuận tắt`);
      assert.equal((await c.query(sua, [KHU, tt.song])).rowCount, 1, `${b.ten}: đối chứng sửa với thoả thuận hiệu lực`);
      // Dòng do thoả thuận đã tắt ghi: thoả thuận hiệu lực khác ghi đè được, không khoá khu vĩnh viễn.
      await c.query("reset role");
      await c.query(`update ${b.ten} set agreement_id = $1`, [tt.tat]);
      await vaiApi(c);
      assert.equal((await c.query(sua, [KHU, tt.song])).rowCount, 1, `${b.ten}: thoả thuận mới ghi đè dòng của thoả thuận đã tắt`);
      await c.query("reset role");
    }
    assert.equal(soLan, BANG.length * 2);
  });
});

test("field_confidence: ràng buộc", { skip }, async () => {
  await trongGiaoDich(async (c, tt) => {
    const chen = (upi, gt) =>
      c.query(
        `insert into catalog_units (upi, subdivision_key, building_key, building_name, unit_number, property_type, property_sub_type, provider, measured_at, agreement_id, field_confidence)
         values ($1, $2, 'a', '[Mẫu] Toà', 'A.1', 'Residential', 'Condominium', '[Mẫu]', now(), $3, $4::jsonb)`,
        [upi, KHU, tt.song, gt],
      );
    const sai = [
      { ten: "khoá lạ", gt: '{"propertyType":"verified"}' },
      { ten: "nhãn lạ", gt: '{"floor":"maybe"}' },
      { ten: "nhãn không phải chuỗi", gt: '{"floor":1}' },
      { ten: "mảng", gt: "[]" },
      { ten: "chuỗi", gt: '"verified"' },
    ];
    let soLan = 0;
    for (const [i, o] of sai.entries()) {
      await c.query("savepoint du_kien_loi");
      await assert.rejects(chen(`urn:onehub:upi:kiem:sai:${i}`, o.gt), (e) => e.code === "23514" && e.constraint === "catalog_units_field_confidence_check", o.ten);
      await c.query("rollback to savepoint du_kien_loi");
      soLan += 1;
    }
    assert.equal(soLan, sai.length);
    // Đối chứng dương: đúng khuôn, rỗng và null đều nhận; vai API đọc được cột.
    assert.equal((await chen("urn:onehub:upi:kiem:dung", '{"floor":"verified","livingArea":"inferred","stack":"single_source"}')).rowCount, 1);
    assert.equal((await chen("urn:onehub:upi:kiem:rong", "{}")).rowCount, 1);
    assert.equal((await chen("urn:onehub:upi:kiem:null", null)).rowCount, 1);
    await vaiApi(c);
    const { rows } = await c.query("select field_confidence from catalog_units where upi = 'urn:onehub:upi:kiem:dung'");
    assert.deepEqual(rows[0].field_confidence, { floor: "verified", livingArea: "inferred", stack: "single_source" });
  });
});

const THU_MUC = fileURLToPath(new URL("../migrations/", import.meta.url));
const TEP = readdirSync(THU_MUC).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
const so = (f) => Number(f.slice(0, 3));
const docTep = (f) => readFileSync(THU_MUC + f, "utf8");
const TEP_042 = TEP.find((f) => so(f) === 42);
const TRUOC = TEP.filter((f) => so(f) <= 41);
const SAU = TEP.filter((f) => so(f) > 42);
const LUOT = randomBytes(4).toString("hex");
const TEN_BANG = BANG.map((b) => b.ten);

async function coSoTam(hauTo, fn) {
  const ten = `khuon_v2_${LUOT}_${hauTo}`;
  const goc = new pg.Client({ connectionString: url });
  await goc.connect();
  try {
    await goc.query(`create database ${ten}`);
    const u = new URL(url);
    u.pathname = `/${ten}`;
    const c = new pg.Client({ connectionString: u.toString() });
    await c.connect();
    try {
      return await fn(c);
    } finally {
      await c.end();
    }
  } finally {
    await goc.query(`drop database if exists ${ten} with (force)`);
    await goc.end();
  }
}
async function ap(c, teps) {
  for (const f of teps) {
    try {
      await c.query(docTep(f));
    } catch (e) {
      throw new Error(`${f}: ${e.message}`);
    }
  }
}
async function chup(c) {
  const hang = async (nhan, sql) => (await c.query(sql, [TEN_BANG])).rows.map((r) => `${nhan}: ${Object.values(r).join(" | ")}`);
  const ds = [
    ...(await hang("luật", "select tablename, policyname, cmd, roles::text, qual, with_check from pg_policies where tablename = any ($1)")),
    ...(await hang("quyền bảng", "select table_name, grantee, privilege_type from information_schema.role_table_grants where table_name = any ($1) and grantee <> 'postgres'")),
    ...(await hang("quyền cột", "select table_name, column_name, grantee, privilege_type from information_schema.column_privileges where table_name = any ($1) and grantee = 'quy_hang_app'")),
    ...(await hang("ràng buộc", "select conrelid::regclass::text, conname, pg_get_constraintdef(oid) from pg_constraint where conrelid::regclass::text = any ($1)")),
    ...(await hang("ép luật", "select relname, relrowsecurity, relforcerowsecurity from pg_class where relname = any ($1)")),
  ];
  const cot = await c.query("select column_name, data_type from information_schema.columns where table_name = 'catalog_units' and column_name = 'field_confidence'");
  ds.push(...cot.rows.map((r) => `cột: ${r.column_name} | ${r.data_type}`));
  const quyen = await c.query("select grantee, privilege_type from information_schema.column_privileges where table_name = 'catalog_units' and column_name = 'field_confidence' and grantee = 'quy_hang_app'");
  ds.push(...quyen.rows.map((r) => `quyền cột nhãn: ${r.grantee} | ${r.privilege_type}`));
  const rb = await c.query("select conname, pg_get_constraintdef(oid) d from pg_constraint where conname = 'catalog_units_field_confidence_check'");
  ds.push(...rb.rows.map((r) => `ràng buộc nhãn: ${r.conname} | ${r.d}`));
  const ham = await c.query("select pg_get_functiondef(p.oid) d from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'app' and proname = 'catalog_field_confidence_ok'");
  ds.push(...ham.rows.map((r) => `hàm: ${r.d}`));
  return ds.sort();
}
const lech = (a, b) => [...a.filter((x) => !b.includes(x)).map((x) => `chỉ bên trái: ${x}`), ...b.filter((x) => !a.includes(x)).map((x) => `chỉ bên phải: ${x}`)];

test("hai thứ tự áp migration 042", { skip, timeout: 180_000 }, async () => {
  assert.ok(TEP_042, "có migration 042");
  assert.ok(SAU.length > 0, "có migration sau 042");
  const truoc = await coSoTam("truoc", async (c) => {
    await ap(c, [...TRUOC, TEP_042, ...SAU]);
    const dau = await chup(c);
    await c.query(docTep(TEP_042));
    assert.deepEqual(lech(await chup(c), dau), [], "áp lại 042 làm đổi luật hay quyền");
    return dau;
  });
  const sau = await coSoTam("sau", async (c) => {
    await ap(c, [...TRUOC, ...SAU, TEP_042]);
    return chup(c);
  });
  assert.ok(truoc.length >= 20, `danh sách quá ngắn (${truoc.length} mục)`);
  assert.deepEqual(lech(truoc, sau), [], "hai thứ tự cho kết quả khác nhau");

  // Đối chứng dương: bản sao 042 bỏ một luật thì phép so đỏ và nêu tên luật.
  const LUAT_BO = "catalog_public_listing_snapshots_insert";
  const banBo = docTep(TEP_042).replace(new RegExp(`create policy ${LUAT_BO}[\\s\\S]*?;`), "");
  assert.notEqual(banBo, docTep(TEP_042), "không tìm thấy câu tạo luật để bỏ");
  const saiLech = await coSoTam("doi_chung", async (c) => {
    await ap(c, [...TRUOC, ...SAU]);
    await c.query(banBo);
    return lech(truoc, await chup(c));
  });
  assert.ok(saiLech.some((x) => x.includes(LUAT_BO)), `phép so không nêu tên luật bị bỏ: ${JSON.stringify(saiLech)}`);
});
