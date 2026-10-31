import pg from "pg";
import { khoaSoChu } from "../src/owners/khoa";
import { maHoaLai } from "../src/owners/ma-hoa-lai";

/**
 * Lệnh vận hành: mã hoá lại số chủ còn ở dạng chữ rõ (hàng 62, ADR-0013). Chạy bằng vai chủ (`DATABASE_URL` như
 * migration) cùng khoá thật của môi trường đó:
 *
 *   node --env-file-if-exists=.env.local --import tsx packages/api/van-hanh/ma-hoa-lai.ts
 *
 * Nằm ngoài `src` vì luật một cửa truy vấn của API cấm mở kết nối trong mã API; lệnh này là việc vận hành của vai chủ.
 * Không bao giờ rơi về khoá dev. Đầu ra chỉ có số dòng, không số chủ, không khoá.
 */
async function chay(): Promise<void> {
  const khoa = khoaSoChu(process.env, { choPhepKhoaDev: false });
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("thiếu DATABASE_URL của vai chủ");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    const kq = await maHoaLai(client, khoa);
    await client.query("commit");
    console.log(`đã mã hoá ${kq.daMaHoa} dòng, ${kq.daCoBanMa} dòng đã là bản mã, ${kq.daMaHoaLead} lead`);
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

chay().catch((e: unknown) => {
  // Chỉ thông điệp — không in đối tượng lỗi (chi tiết của Postgres có thể mang giá trị dòng).
  console.error(`ma-hoa-lai: ${e instanceof Error ? e.message : "lỗi không rõ"}`);
  process.exit(1);
});
