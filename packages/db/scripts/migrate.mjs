// Áp các migration chưa chạy, theo thứ tự số, mỗi tệp một giao dịch. Sổ ghi ở public.schema_migrations.
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Thiếu DATABASE_URL — xem .env.example.");
  process.exit(1);
}

const dir = fileURLToPath(new URL("../migrations/", import.meta.url));
const files = (await readdir(dir)).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(
    "create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const { rows } = await client.query("select name from public.schema_migrations");
  const done = new Set(rows.map((r) => r.name));
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = await readFile(new URL(file, `file://${dir}`), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public.schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`đã áp ${file}`);
    } catch (err) {
      await client.query("rollback");
      throw new Error(`${file}: ${err.message}`);
    }
  }
  console.log(`xong — ${files.length} migration`);
} finally {
  await client.end();
}
