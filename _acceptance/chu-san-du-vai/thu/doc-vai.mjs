// Đọc vai của một email trên Postgres của dãy Q (hàng chu-san-du-vai, E3): in mỗi sàn một dòng, vai đã sắp.
import pg from "pg";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("dùng: doc-vai.mjs <email>");
  process.exit(2);
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL || "postgres://postgres:quyhang@localhost:5577/postgres" });
await client.connect();
try {
  const { rows } = await client.query(
    `select c.name, m.roles from company_members m join companies c on c.id = m.company_id
     join identity."user" u on u.id = m.user_id where u.email = $1 order by c.name`,
    [email],
  );
  if (rows.length === 0) console.log(`(không có ${email})`);
  for (const r of rows) console.log(`${r.name}: {${[...r.roles].sort().join(", ")}}`);
} finally {
  await client.end();
}
