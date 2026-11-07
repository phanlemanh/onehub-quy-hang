// Kiểm nhanh sau migration trên cơ sở dữ liệu bản thật (hàng va-deploy-csdl-tam, ADR-0009 §7 sửa đổi 06/11): chỉ ĐỌC
// danh mục hệ thống, một kết nối, một giao dịch read only. Bộ kiểm cách ly (ghi rồi rollback) không chạy trên bản thật
// nữa — nó chạy trên Postgres tạm của job isolation cùng commit. Ở đây chỉ soi trạng thái thật mà Postgres tạm không có:
//   · mọi bảng của public (trừ schema_migrations) bật VÀ ép luật theo dòng (bất biến 1);
//   · vai của API quy_hang_app không là chủ bảng nào, không bypassrls, không superuser — cả ba đều bỏ qua luật theo dòng;
//   · bất biến 2 (hàng kiem-nhanh-rang-buoc-ban-ma): bảng chủ nhà và bảng lead sạch số rõ thì ràng buộc chặn số rõ phải
//     đã bật — cùng luật với kiemTrangThai của tests/bat-rang-buoc.test.mjs. Chỉ ĐẾM dòng, không đọc giá trị số.
// Có lỗi → in từng dòng, thoát 1 (job deploy dừng trước khi gọi Vercel). Thiếu DATABASE_URL → thoát 2, không kết nối.
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const VAI_API = "quy_hang_app";

/** Bảng chứa số chủ nhà và ràng buộc chặn số rõ của nó (migration 008, 009, 013) — phạm vi bất biến 2, giữ cứng. */
export const CAP_BAN_MA = [
  ["listing_owners", "listing_owners_phone_chi_ban_ma"],
  ["leads", "leads_phone_chi_ban_ma"],
];

/**
 * Phần xét thuần: từ ảnh danh mục ra danh sách lỗi.
 * @param {{ bang: { ten: string, bat: boolean, ep: boolean, chu: string }[],
 *           vai: { ton_tai: boolean, bypassrls: boolean, superuser: boolean },
 *           banMa?: { bang: string, rangBuoc: string, conSo: number, bat: boolean | null }[],
 *           vaiKetNoi?: { ten: string, thayHet: boolean } }} anh
 * @returns {{ loi: { ve: string, ten?: string, rangBuoc?: string }[], soBang: number }}
 */
export function xet({ bang, vai, banMa = [], vaiKetNoi = { ten: "", thayHet: true } }) {
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
  if (banMa.length && !vaiKetNoi.thayHet) {
    // Vai chịu luật theo dòng đếm ra số sai — không suy «bảng sạch» từ nó.
    loi.push({ ve: "vai kết nối chịu luật theo dòng", ten: vaiKetNoi.ten });
  } else {
    for (const m of banMa) {
      if (m.bat === null) loi.push({ ve: "thiếu ràng buộc", ten: m.bang, rangBuoc: m.rangBuoc });
      else if (m.conSo === 0 && !m.bat) loi.push({ ve: "bảng sạch mà ràng buộc chưa bật", ten: m.bang, rangBuoc: m.rangBuoc });
      else if (m.conSo > 0 && m.bat) loi.push({ ve: "ràng buộc bật mà còn số rõ", ten: m.bang, rangBuoc: m.rangBuoc });
    }
  }
  return { loi, soBang: bang.length };
}

/** Một dòng trạng thái ràng buộc bản mã của từng bảng, theo thứ tự CAP_BAN_MA. */
export function dongBanMa(banMa) {
  const phan = banMa.map((m) =>
    m.bat === null
      ? `${m.bang} thiếu ${m.rangBuoc}`
      : m.conSo > 0 && !m.bat
        ? `${m.bang} còn ${m.conSo} số rõ (chưa bật — chờ mã hoá lại)`
        : `${m.bang} ${m.bat ? "bật" : "chưa bật"}`,
  );
  return `ràng buộc bản mã: ${phan.join(" · ")}`;
}

/** Đọc ảnh danh mục trên client đã cho (không mở giao dịch) rồi xét. Bảng chủ nhà chỉ ĐẾM, không đọc giá trị số. */
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
  const { rows: toi } = await client.query(
    "select current_user as ten, (rolsuper or rolbypassrls) as thay_het from pg_roles where rolname = current_user",
  );
  const vaiKetNoi = { ten: toi[0]?.ten ?? "", thayHet: Boolean(toi[0]?.thay_het) };
  const banMa = [];
  for (const [ten, rangBuoc] of CAP_BAN_MA) {
    const { rows: rb } = await client.query("select convalidated as bat from pg_constraint where conname = $1", [rangBuoc]);
    let conSo = 0;
    if (vaiKetNoi.thayHet) {
      const { rows: dem } = await client.query(`select count(*) as n from public.${ten} where owner_phone is not null`);
      conSo = Number(dem[0].n);
    }
    banMa.push({ bang: ten, rangBuoc, conSo, bat: rb.length ? rb[0].bat : null });
  }
  return {
    ...xet({
      bang,
      vai: vai.length ? { ton_tai: true, bypassrls: vai[0].bypassrls, superuser: vai[0].superuser } : { ton_tai: false, bypassrls: false, superuser: false },
      banMa,
      vaiKetNoi,
    }),
    banMa,
  };
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
    case "bảng sạch mà ràng buộc chưa bật":
      return `bảng ${l.ten}: bảng sạch mà ràng buộc chưa bật — ${l.rangBuoc} chưa bật dù không còn số rõ`;
    case "ràng buộc bật mà còn số rõ":
      return `bảng ${l.ten}: ràng buộc bật mà còn số rõ — ${l.rangBuoc}`;
    case "thiếu ràng buộc":
      return `bảng ${l.ten}: thiếu ràng buộc ${l.rangBuoc}`;
    case "vai kết nối chịu luật theo dòng":
      return `vai kết nối chịu luật theo dòng — không đếm được số rõ (vai ${l.ten})`;
    default:
      return `vai ${VAI_API} có ${l.ve} — bỏ qua luật theo dòng`;
  }
}

/** Mã thoát và các dòng in của CLI từ kết quả soi. */
export function ketQuaCli({ loi, soBang, banMa = [] }) {
  if (loi.length) {
    return { ma: 1, dong: [...loi.map((l) => `kiểm nhanh: ${cauLoi(l)}`), `kiểm nhanh: ĐỎ — ${loi.length} lỗi trên ${soBang} bảng`] };
  }
  const dong = [`kiểm nhanh: ${soBang} bảng · luật theo dòng bật và ép · ${VAI_API} không là chủ, không bypassrls, không superuser`];
  if (banMa.length) dong.push(`kiểm nhanh: ${dongBanMa(banMa)}`);
  return { ma: 0, dong };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Thiếu DATABASE_URL — kiểm nhanh không kết nối đi đâu.");
    process.exit(2);
  }
  const { ma, dong } = ketQuaCli(await chay(url));
  for (const d of dong) (ma ? console.error : console.log)(d);
  process.exit(ma);
}
