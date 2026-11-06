// Kiểm nhanh sau migration trên cơ sở dữ liệu bản thật (hàng va-deploy-csdl-tam, ADR-0009 §7 sửa đổi 06/11): chỉ ĐỌC
// danh mục hệ thống, một kết nối, một giao dịch read only. Bộ kiểm cách ly (ghi rồi rollback) không chạy trên bản thật
// nữa — nó chạy trên Postgres tạm của job isolation cùng commit. Ở đây chỉ soi trạng thái thật mà Postgres tạm không có:
//   · mọi bảng của public (trừ schema_migrations) bật VÀ ép luật theo dòng (bất biến 1);
//   · vai của API quy_hang_app không là chủ bảng nào, không bypassrls, không superuser — cả ba đều bỏ qua luật theo dòng.
// Có lỗi → in từng dòng, thoát 1 (job deploy dừng trước khi gọi Vercel). Thiếu DATABASE_URL → thoát 2, không kết nối.
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const VAI_API = "quy_hang_app";

/**
 * Phần xét thuần: từ ảnh danh mục ra danh sách lỗi.
 * @param {{ bang: { ten: string, bat: boolean, ep: boolean, chu: string }[],
 *           vai: { ton_tai: boolean, bypassrls: boolean, superuser: boolean } }} anh
 * @returns {{ loi: { ve: string, ten?: string }[], soBang: number }}
 */
export function xet({ bang, vai }) {
  const loi = [];
  for (const b of bang) {
    if (!b.bat) loi.push({ ve: "chưa bật", ten: b.ten });
    else if (!b.ep) loi.push({ ve: "chưa ép", ten: b.ten });
    if (b.chu === VAI_API) loi.push({ ve: "chủ bảng", ten: b.ten });
  }
  if (!vai.ton_tai) loi.push({ ve: "thiếu vai" });
  else {
    if (vai.bypassrls) loi.push({ ve: "bypassrls" });
    if (vai.superuser) loi.push({ ve: "superuser" });
  }
  return { loi, soBang: bang.length };
}

/** Đọc ảnh danh mục trên client đã cho (không mở giao dịch) rồi xét. */
export async function soi(client) {
  const { rows: bang } = await client.query(
    `select c.relname as ten, c.relrowsecurity as bat, c.relforcerowsecurity as ep, pg_get_userbyid(c.relowner) as chu
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r', 'p') and c.relname <> 'schema_migrations'
      order by c.relname`,
  );
  const { rows: vai } = await client.query(
    "select rolbypassrls as bypassrls, rolsuper as superuser from pg_roles where rolname = $1",
    [VAI_API],
  );
  return xet({
    bang,
    vai: vai.length ? { ton_tai: true, bypassrls: vai[0].bypassrls, superuser: vai[0].superuser } : { ton_tai: false, bypassrls: false, superuser: false },
  });
}

/** Mở giao dịch chỉ đọc có trần thời gian cho từng câu. */
export async function moGiaoDich(client) {
  await client.query("begin read only");
  await client.query("set local statement_timeout = '15s'");
}

/**
 * Một kết nối, một giao dịch read only, soi, rollback, đóng. `moc(client)` (cho bài kiểm) chạy trên đúng kết nối ấy,
 * trong giao dịch, sau khi soi.
 */
export async function chay(url, { moc, Client } = {}) {
  // Nạp pg muộn: nhánh thiếu DATABASE_URL thoát trước khi chạm thư viện kết nối.
  const Lop = Client ?? (await import("pg")).default.Client;
  const client = new Lop({ connectionString: url, application_name: "kiem-nhanh" });
  await client.connect();
  try {
    await moGiaoDich(client);
    try {
      const kq = await soi(client);
      if (moc) await moc(client);
      return kq;
    } finally {
      await client.query("rollback").catch(() => {});
    }
  } finally {
    await client.end();
  }
}

/** Câu báo một dòng cho mỗi lỗi. */
export function cauLoi(l) {
  switch (l.ve) {
    case "chưa bật":
      return `bảng ${l.ten}: chưa bật luật theo dòng`;
    case "chưa ép":
      return `bảng ${l.ten}: bật luật theo dòng nhưng chưa ép (force)`;
    case "chủ bảng":
      return `bảng ${l.ten}: ${VAI_API} là chủ bảng — vai chủ bỏ qua luật theo dòng`;
    case "thiếu vai":
      return `không có vai ${VAI_API}`;
    default:
      return `vai ${VAI_API} có ${l.ve} — bỏ qua luật theo dòng`;
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Thiếu DATABASE_URL — kiểm nhanh không kết nối đi đâu.");
    process.exit(2);
  }
  const { loi, soBang } = await chay(url);
  if (loi.length) {
    for (const l of loi) console.error(`kiểm nhanh: ${cauLoi(l)}`);
    console.error(`kiểm nhanh: ĐỎ — ${loi.length} lỗi trên ${soBang} bảng`);
    process.exit(1);
  }
  console.log(`kiểm nhanh: ${soBang} bảng · luật theo dòng bật và ép · ${VAI_API} không là chủ, không bypassrls, không superuser`);
}
