// Kiểm môi trường thật (ADR-0009) từ bên ngoài, chỉ đọc. Cần biến môi trường:
//   DATABASE_URL              kết nối vai chủ tới Supabase thật (secret — không in ra)
//   SUPABASE_URL              https://<ref>.supabase.co
//   SUPABASE_PUBLISHABLE_KEY  khoá công khai của dự án
//   APP_URL                   gốc app, vd https://quyhang.onehub.center (chỉ cho --suc-khoe)
//   VERCEL_BYPASS             (tuỳ) mã vượt bảo vệ khi APP_URL là bản xem trước có Vercel Authentication
// Mặc định: cơ sở dữ liệu + Data API. --suc-khoe: chỉ /api/v1/health phải trả 200.
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../../packages/db/package.json", import.meta.url));
const pg = require("pg");

const loi = [];
const dat = (ok, ten) => {
  console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`);
  if (!ok) loi.push(ten);
};
const can = (n) => {
  const v = process.env[n];
  if (!v) {
    console.error(`thiếu ${n}`);
    process.exit(2);
  }
  return v;
};

if (process.argv.includes("--suc-khoe")) {
  const app = can("APP_URL");
  const bypass = process.env.VERCEL_BYPASS;
  const res = await fetch(`${app}/api/v1/health`, { headers: bypass ? { "x-vercel-protection-bypass": bypass } : {} });
  dat(res.status === 200, `GET /api/v1/health trả 200 (nhận ${res.status})`);
} else {
  const url = can("DATABASE_URL");
  const sb = can("SUPABASE_URL");
  const key = can("SUPABASE_PUBLISHABLE_KEY");

  dat(new URL(url).hostname.includes("ap-southeast-1"), "kết nối tới vùng ap-southeast-1");

  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    const q = async (sql, p) => (await c.query(sql, p)).rows;

    // Migration: mọi tệp trong kho đã có trong sổ của môi trường (trước khi gộp: 005 áp tay, kiểm bằng vật bên dưới).
    const dir = fileURLToPath(new URL("../../../packages/db/migrations/", import.meta.url));
    const tep = (await readdir(dir)).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
    const so = new Set((await q("select name from public.schema_migrations")).map((r) => r.name));
    const thieu = tep.filter((f) => !so.has(f));
    console.log(`sổ migration: ${so.size} tệp; kho: ${tep.length}; chưa ghi sổ: ${thieu.join(", ") || "không"}`);
    dat(thieu.every((f) => f === "005_khoa_ham_va_gop_luat.sql"), "mọi migration của kho đã ghi sổ (005 chờ job deploy)");

    // Vật của 005 có mặt.
    const ham = await q(
      `select p.proname, p.proconfig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'app' and p.proname in ('current_company_id', 'current_user_id')`,
    );
    dat(ham.length === 2 && ham.every((h) => (h.proconfig ?? []).some((s) => s.startsWith("search_path="))),
      "hai hàm của luật theo dòng khoá search_path");
    const luat = await q(`select polname from pg_policy where polrelid = 'public.companies'::regclass and polcmd = 'r'`);
    dat(luat.length === 1, `companies có đúng một luật đọc (${luat.map((l) => l.polname).join(", ")})`);

    // Bảng của công ty: bật và ép luật theo dòng.
    const bang = await q(
      `select c.relname, c.relrowsecurity, c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' and c.relname <> 'schema_migrations'`,
    );
    dat(bang.length > 0 && bang.every((b) => b.relrowsecurity && b.relforcerowsecurity),
      `mọi bảng của công ty bật và ép luật theo dòng (${bang.length} bảng)`);

    // Không vai công khai nào của Supabase có quyền trên bảng của Quỹ hàng.
    const mo = await q(
      `select n.nspname || '.' || c.relname as bang, r.rolname from pg_class c join pg_namespace n on n.oid = c.relnamespace
       cross join (values ('anon'), ('authenticated'), ('service_role')) r(rolname)
       where n.nspname in ('public', 'app', 'identity') and c.relkind in ('r', 'v', 'm')
         and (has_table_privilege(r.rolname, c.oid, 'select') or has_table_privilege(r.rolname, c.oid, 'insert')
           or has_table_privilege(r.rolname, c.oid, 'update') or has_table_privilege(r.rolname, c.oid, 'delete'))`,
    );
    dat(mo.length === 0, `anon, authenticated, service_role không có quyền trên bảng nào${mo.length ? ": " + mo.map((m) => `${m.rolname}→${m.bang}`).join(", ") : ""}`);

    // Vai API không vượt luật; vai chủ không phải superuser.
    const vai = await q(`select rolname, rolsuper, rolbypassrls from pg_roles where rolname in ('quy_hang_app', 'quy_hang_owner')`);
    const app = vai.find((v) => v.rolname === "quy_hang_app");
    const chu = vai.find((v) => v.rolname === "quy_hang_owner");
    dat(app && !app.rolsuper && !app.rolbypassrls, "quy_hang_app không superuser, không bypassrls");
    dat(chu && !chu.rolsuper, "quy_hang_owner không superuser");

    // Không dữ liệu ngoài dữ liệu mẫu: mọi sàn mang nhãn mẫu (hay chưa có sàn nào).
    const san = await q(`select name from public.companies`);
    dat(san.every((s) => /\[(Mẫu|Sàn [A-Z])\]/.test(s.name)), `chỉ sàn mẫu (${san.length} sàn)`);
  } finally {
    await c.end();
  }

  // Data API: khoá công khai không đọc được bảng nào; GraphQL không bật.
  for (const t of ["companies", "company_members", "agreements", "company_zones", "member_zones", "schema_migrations"]) {
    const r = await fetch(`${sb}/rest/v1/${t}?select=*`, { headers: { apikey: key } });
    const body = await r.text();
    dat(r.status >= 400 && !body.startsWith("["), `REST ${t} bị từ chối với khoá công khai (${r.status})`);
  }
  const g = await fetch(`${sb}/graphql/v1`, {
    method: "POST",
    headers: { apikey: key, "content-type": "application/json" },
    body: JSON.stringify({ query: "{__schema{queryType{fields{name}}}}" }),
  });
  const gt = await g.text();
  dat(!/"fields"\s*:\s*\[\s*\{/.test(gt), "GraphQL không lộ bảng nào");
}

console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
