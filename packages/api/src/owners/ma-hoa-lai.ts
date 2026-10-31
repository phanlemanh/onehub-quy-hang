import { pathToFileURL } from "node:url";
import pg from "pg";
import { khoaSoChu } from "./khoa";
import { dauVetSo, maHoaSo, nguCanhChuNha, type KhoaSoChu } from "./ma-hoa";

/**
 * Mã hoá lại số chủ còn ở dạng chữ rõ (hàng 62, ADR-0013). Chạy bằng vai chủ (`DATABASE_URL` như migration) cùng khoá
 * thật của môi trường đó:
 *
 *   node --env-file-if-exists=.env.local --import tsx packages/api/src/owners/ma-hoa-lai.ts
 *
 * Không bao giờ rơi về khoá dev: lệnh xoá số rõ trong cùng giao dịch, mã hoá nhầm bằng khoá dev là mất số (API thật không
 * giải được) và lộ số (khoá dev công khai). Chạy lại không đổi gì — dòng đã có bản mã giữ nguyên từng byte. Đầu ra chỉ có
 * số dòng, không số chủ, không khoá.
 */

/** Phần lõi: bên gọi giữ giao dịch. Cuối cùng validate ràng buộc — từ đây cơ sở dữ liệu bảo đảm không còn số rõ. */
export async function maHoaLai(client: pg.ClientBase, khoa: KhoaSoChu): Promise<{ daMaHoa: number; daCoBanMa: number }> {
  const cot = await client.query(
    "select 1 from information_schema.columns where table_schema = 'public' and table_name = 'listing_owners' and column_name = 'owner_phone_enc'",
  );
  if (!cot.rowCount) throw new Error("chưa áp migration 008 — không có cột bản mã số chủ");
  const { rows } = await client.query<{ company_id: string; listing_id: string; owner_phone: string }>(
    "select company_id, listing_id, owner_phone from public.listing_owners where owner_phone is not null for update",
  );
  for (const r of rows) {
    await client.query(
      "update public.listing_owners set owner_phone = null, owner_phone_enc = $3, owner_phone_hash = $4 where company_id = $1 and listing_id = $2",
      [r.company_id, r.listing_id, maHoaSo(r.owner_phone, nguCanhChuNha(r.company_id, r.listing_id), khoa), dauVetSo(r.owner_phone, r.company_id, khoa)],
    );
  }
  await client.query("alter table public.listing_owners validate constraint listing_owners_phone_chi_ban_ma");
  const tong = await client.query<{ n: number }>("select count(*)::int n from public.listing_owners where owner_phone_enc is not null");
  return { daMaHoa: rows.length, daCoBanMa: tong.rows[0]!.n - rows.length };
}

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
    console.log(`đã mã hoá ${kq.daMaHoa} dòng, ${kq.daCoBanMa} dòng đã là bản mã`);
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  chay().catch((e: unknown) => {
    // Chỉ thông điệp — không in đối tượng lỗi (chi tiết của Postgres có thể mang giá trị dòng).
    console.error(`ma-hoa-lai: ${e instanceof Error ? e.message : "lỗi không rõ"}`);
    process.exit(1);
  });
}
