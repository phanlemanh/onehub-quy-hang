// Nạp mẫu hỏng cho lượt nhìn màn E7 (hàng man-mau-bao-mau-hong): ghi thẳng company_settings của sàn mẫu (sàn có
// quan-tri@mau.quy-hang.test) như một dòng cũ — ba mẫu bảng hàng (một trùng tên, một mang cột Người giữ) và mẫu bài có
// kênh lạ. Chạy lại được: ghi đè đúng hai khoá. Cần DATABASE_URL tới Postgres dãy (đã nạp sàn mẫu).
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("nap-mau-hong: thiếu DATABASE_URL");
  process.exit(2);
}
const c = new pg.Client({ connectionString: url });
await c.connect();
try {
  const r = await c.query(
    `select m.company_id, m.user_id from company_members m join identity."user" u on u.id = m.user_id
     where u.email = 'quan-tri@mau.quy-hang.test' limit 1`,
  );
  if (!r.rows[0]) throw new Error("chưa có sàn mẫu — nạp bằng packages/db/seed/nap.mjs --nap trước");
  const { company_id: san, user_id: ai } = r.rows[0];
  const ghi = (khoa, value) =>
    c.query(
      `insert into company_settings (company_id, key, value, data_class, updated_by) values ($1, $2, $3::jsonb, 'company_internal', $4)
       on conflict (company_id, key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
      [san, khoa, JSON.stringify(value), ai],
    );
  await ghi("export.templates", [
    { id: "00000000-0000-4000-8000-0000000000a1", name: "[Tên] gửi đội", columns: ["unitNumber", "listPrice", "livingArea"] },
    { id: "00000000-0000-4000-8000-0000000000a2", name: " [tên] gửi đội ", columns: ["livingArea"] },
    { id: "00000000-0000-4000-8000-0000000000a3", name: "[Tên] gửi khách", columns: ["listPrice", "holderName"] },
  ]);
  await ghi("share.post_templates", { tiktok: { opening: "x", closing: "" }, zalo: { opening: "Chào nhóm [Tên sàn]", closing: "Gọi em 0900 000 001" } });
  console.log(`nap-mau-hong: đã ghi mẫu hỏng cho sàn ${san}`);
} finally {
  await c.end();
}
