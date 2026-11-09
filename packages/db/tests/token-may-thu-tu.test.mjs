// 041_token_may_ket_noi (hàng 96) phải cho cùng luật, quyền, ràng buộc dù áp trước 042–052 (cơ sở dữ liệu mới) hay sau 052
// (bản thật). Dựng cơ sở dữ liệu tạm từ chính các tệp migration; luôn xoá lại.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bộ kiểm thứ tự migration cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

const THU_MUC = fileURLToPath(new URL("../migrations/", import.meta.url));
const TEP = readdirSync(THU_MUC).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
const so = (f) => Number(f.slice(0, 3));
const docTep = (f) => readFileSync(THU_MUC + f, "utf8");
const TEP_041 = TEP.find((f) => so(f) === 41);
const DEN_40 = TEP.filter((f) => so(f) <= 40);
const SAU_41 = TEP.filter((f) => so(f) > 41);
const LUOT = randomBytes(4).toString("hex");
const BANG = ["machine_tokens", "machine_token_calls"];

function urlCua(ten) {
  const u = new URL(url);
  u.pathname = `/${ten}`;
  return u.toString();
}

async function coSoTam(hauTo, fn) {
  const ten = `token_may_${LUOT}_${hauTo}`;
  const goc = new pg.Client({ connectionString: url });
  await goc.connect();
  try {
    await goc.query(`create database ${ten}`);
    const c = new pg.Client({ connectionString: urlCua(ten) });
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

/** Danh sách luật, quyền, ràng buộc, chỉ mục, trigger, hàm của phần 041 tạo — mỗi mục một chuỗi, sắp xếp. */
async function chup(c) {
  const hang = async (nhan, sql) => (await c.query(sql, [BANG])).rows.map((r) => `${nhan}: ${Object.values(r).join(" | ")}`);
  const ds = [
    ...(await hang("luật", "select tablename, policyname, cmd, roles::text, qual, with_check from pg_policies where tablename = any ($1)")),
    ...(await hang("quyền bảng", "select table_name, grantee, privilege_type from information_schema.role_table_grants where table_name = any ($1) and grantee <> 'postgres'")),
    ...(await hang("quyền cột", "select table_name, column_name, grantee, privilege_type from information_schema.column_privileges where table_name = any ($1) and grantee = 'quy_hang_app'")),
    ...(await hang("ràng buộc", "select conrelid::regclass::text, conname, pg_get_constraintdef(oid) from pg_constraint where conrelid::regclass::text = any ($1)")),
    ...(await hang("chỉ mục", "select tablename, indexname, indexdef from pg_indexes where tablename = any ($1) or indexname = 'agreements_id_company_uq' and $1::text[] is not null")),
    ...(await hang("ép luật", "select relname, relrowsecurity, relforcerowsecurity from pg_class where relname = any ($1)")),
  ];
  const trg = await c.query("select tgname, pg_get_triggerdef(oid) d from pg_trigger where tgrelid = 'agreements'::regclass and not tgisinternal and tgname like 'machine_token%'");
  ds.push(...trg.rows.map((r) => `trigger: ${r.tgname} | ${r.d}`));
  const ham = await c.query("select proname, pg_get_functiondef(p.oid) d, proacl::text a from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'app' and proname like 'machine_token%'");
  ds.push(...ham.rows.map((r) => `hàm: ${r.proname} | ${r.a} | ${r.d}`));
  return ds.sort();
}
const lech = (a, b) => [...a.filter((x) => !b.includes(x)).map((x) => `chỉ bên trái: ${x}`), ...b.filter((x) => !a.includes(x)).map((x) => `chỉ bên phải: ${x}`)];

test("hai thứ tự áp migration", { skip, timeout: 180_000 }, async () => {
  assert.ok(TEP_041, "có migration 041");
  assert.ok(SAU_41.length > 0, "có migration sau 041");

  const truoc = await coSoTam("truoc", async (c) => {
    await ap(c, [...DEN_40, TEP_041, ...SAU_41]);
    const dau = await chup(c);
    // Áp lại 041 lần hai: không lỗi, danh sách không đổi.
    await c.query(docTep(TEP_041));
    assert.deepEqual(lech(await chup(c), dau), [], "áp lại 041 làm đổi luật hay quyền");
    return dau;
  });
  const sau = await coSoTam("sau", async (c) => {
    await ap(c, [...DEN_40, ...SAU_41, TEP_041]);
    return chup(c);
  });
  assert.ok(truoc.length >= 20, `danh sách quá ngắn (${truoc.length} mục)`);
  assert.ok(truoc.some((x) => x.startsWith("luật: ")) && truoc.some((x) => x.startsWith("trigger: ")) && truoc.some((x) => x.startsWith("hàm: ")));
  assert.deepEqual(lech(truoc, sau), [], "hai thứ tự cho kết quả khác nhau");

  // Đối chứng dương: bản sao 041 bỏ một luật thì phép so phải đỏ và nêu tên luật.
  const LUAT_BO = "machine_token_calls_insert";
  const banBo = docTep(TEP_041).replace(new RegExp(`create policy ${LUAT_BO}[\\s\\S]*?;`), "");
  assert.notEqual(banBo, docTep(TEP_041), "không tìm thấy câu tạo luật để bỏ");
  const saiLech = await coSoTam("doi_chung", async (c) => {
    await ap(c, [...DEN_40, ...SAU_41]);
    await c.query(banBo);
    return lech(truoc, await chup(c));
  });
  assert.ok(saiLech.some((x) => x.includes(LUAT_BO)), `phép so không nêu tên luật bị bỏ: ${JSON.stringify(saiLech)}`);
});
