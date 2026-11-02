// Bộ nạp dữ liệu mẫu cho bản thật (hàng 87): sàn «[Mẫu] Sàn thử» có hàng sáu trạng thái, chủ nhà số mã hoá, người phụ
// trách, lead và tài khoản chủ kho. Chạy trên kết nối vai chủ, MỘT giao dịch; hàng, chủ nhà, lead đi qua chính hàm ghi
// của API dưới vai quy_hang_app với người mẫu đúng vai — luật vai, sự kiện, kiểm trùng áp như khi người bấm.
//   node --import tsx packages/db/seed/nap-ban-that.ts --nap --email <email> | --go
// Nút trên GitHub: .github/workflows/nap-mau.yml. Khoá OWNER_PHONE_KEY thật bắt buộc (ADR-0013); không in email, số, khoá.
// Căn mẫu từng lên Đang bán có một ảnh vẽ bằng mã (hàng nap-mau-co-anh, luật ảnh thật của hàng 23), byte cất ở kho ảnh
// chọn như API: đủ ba khoá STORAGE_S3_* → Storage; bản thật thiếu khoá → dừng trước khi mở kết nối.
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import pg from "pg";
import { WITHDRAWN_REASONS } from "@quy-hang/core/listing";
import { createLead, isRefusal as laTuChoiLead } from "../../api/src/leads/store";
import { chonKhoAnh, type KhoAnh } from "../../api/src/photos/kho";
import { addPhoto, isRefusal as laTuChoiAnh } from "../../api/src/photos/store";
import { applyCommand, createListing, isRefusal, viewerOf, type Command } from "../../api/src/listings/store";
import { khoaSoChu } from "../../api/src/owners/khoa";
import { dauVetSo, type KhoaSoChu } from "../../api/src/owners/ma-hoa";
import { isRefusal as laTuChoiChu, putOwner } from "../../api/src/owners/store";
import { anhMau } from "./anh-mau.mjs";
import { MIEN_EMAIL, TEN_SAN } from "./du-lieu-mau.mjs";
import { napMau } from "./nap.mjs";
import { THU_MUC_MAU } from "./sinh.mjs";

type Can = { upi: string; unitNumber: string };
type Toa = { buildingKey: string; buildingName: string; units: Can[] };
export type GoiMau = {
  san: { ten: string };
  nguoi: { khoa: string; email: string; vai: string[] }[];
  khu: { ten: string }[];
  danhMuc: { subdivisions: { buildings: Toa[] }[] };
  chuNha: { ma: string; ten: string; soDienThoai: string }[];
  hang: { ma: string; maCan: string; upi: string; trangThai: string; gia: number; dieuKienPhi: string; dauChu: string; chuNha: string }[];
  lead: { ma: string; soDienThoai: string; toa: string; maCan: string | null }[];
};

/** Vai của tài khoản chủ kho trong sàn mẫu (Hỏi-2 hàng 87): đủ mọi vai để mọi màn có dữ liệu. */
export const VAI_CHU_KHO: readonly string[] = ["company_admin", "team_lead", "listing_agent", "buyer_agent", "telesales"];
const EMAIL_QUAN_TRI_MAU = `quan-tri@${MIEN_EMAIL}`;
const EMAIL_DUNG = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Trường hàng và lead mà gói không có — điền tất định, không đổi gói (sổ quyết định hàng 87).
const CHI_TIET_DANG_BAN = { legalStatus: "Sổ hồng", occupantType: "Chủ ở" };
const NGAY_CHOT = "2026-10-30";
const PHI: Record<string, string> = { bao_phi: "included", khong_bao_phi: "excluded" };

const boKhoangTrang = (so: string) => so.replace(/\s/g, "");

/** Chuẩn hoá email chủ kho; ném trước mọi câu ghi khi sai dạng hay thuộc miền mẫu. Thông điệp không chứa email. */
export function chuanHoaEmail(tho: string): string {
  // Ký tự điều khiển (kể cả xuống dòng, \r, \x7f) và dấu tách dòng Unicode bị từ chối TRƯỚC khi gọt khoảng trắng: gọt
  // trước thì «a@b.co\r» lọt qua (hàng va-nap-mau, lớp chặn thứ hai sau bước kiểm của nút).
  if (/[\p{Cc}\u2028\u2029]/u.test(tho.replace(/^ +| +$/g, ""))) throw new Error("email chủ kho sai dạng");
  const email = tho.trim().toLowerCase();
  if (!EMAIL_DUNG.test(email)) throw new Error("email chủ kho sai dạng");
  if (email.endsWith(`@${MIEN_EMAIL}`)) throw new Error("email chủ kho thuộc miền mẫu — cần email thật của chủ kho");
  return email;
}

/** Sàn mẫu = sàn tên đúng TEN_SAN CÙNG có quản trị mẫu là thành viên (Hỏi-3) — tên một mình có thể là sàn thật. */
export async function timSanMau(client: pg.ClientBase): Promise<string[]> {
  const { rows } = await client.query<{ id: string }>(
    `select c.id from companies c
     where c.name = $1 and exists (
       select 1 from company_members m join identity."user" u on u.id = m.user_id where m.company_id = c.id and u.email = $2)
     order by c.created_at, c.id`,
    [TEN_SAN, EMAIL_QUAN_TRI_MAU],
  );
  return rows.map((r) => r.id);
}

/** Chạy `fn` với vai API, người và sàn đặt cục bộ — như withCompany nhưng trong giao dịch của người gọi. */
async function trongVai<T>(client: pg.ClientBase, userId: string, sanId: string, fn: (tx: pg.PoolClient) => Promise<T>): Promise<T> {
  await client.query("set local role quy_hang_app");
  await client.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [userId, sanId]);
  // Lỗi SQL làm hỏng giao dịch — người gọi rollback, không reset role ở đây.
  const kq = await fn(client as pg.PoolClient);
  await client.query("reset role");
  return kq;
}

function tuChoi(ma: string, r: { error: { code: string } }): never {
  throw new Error(`${ma}: ${r.error.code}`);
}

type KetQuaNap = { san: string; moi: { hang: number; chuNha: number; lead: number } };

/**
 * Nạp trong giao dịch người gọi mở. Dòng đã có (theo khoá tự nhiên) thì bỏ qua — chạy lại không đổi gì. Byte ảnh ở
 * Storage không nằm trong giao dịch: mỗi lệnh ghi của kho vào sổ của lần chạy TRƯỚC khi xuống kho, lần chạy ném lỗi thì
 * xoá mọi mã trong sổ rồi mới ném lại lỗi gốc (Hỏi-2) — người gọi rollback phần cơ sở dữ liệu.
 */
export async function napBanThat(
  client: pg.ClientBase,
  goi: GoiMau,
  opts: { khoa: KhoaSoChu; email: string; kho: KhoAnh },
): Promise<KetQuaNap> {
  const so: { companyId: string; photoId: string }[] = [];
  const kho: KhoAnh = {
    ...opts.kho,
    async ghi(tx, companyId, photoId, bien, bytes, type) {
      if (!so.some((x) => x.photoId === photoId)) so.push({ companyId, photoId });
      await opts.kho.ghi(tx, companyId, photoId, bien, bytes, type);
    },
  };
  try {
    return await napTrongSo(client, goi, { ...opts, kho });
  } catch (e) {
    // Cố gắng hết: lỗi xoá của từng ảnh nuốt riêng, không che lỗi gốc — chỉ báo số ảnh còn sót trên kho.
    let sot = 0;
    for (const x of so) await opts.kho.xoa(client as pg.PoolClient, x.companyId, x.photoId).catch(() => sot++);
    if (sot) console.error(`nap-ban-that: dọn sau lỗi không xoá được ${sot}/${so.length} ảnh khỏi kho ảnh`);
    throw e;
  }
}

async function napTrongSo(client: pg.ClientBase, goi: GoiMau, opts: { khoa: KhoaSoChu; email: string; kho: KhoAnh }): Promise<KetQuaNap> {
  const email = chuanHoaEmail(opts.email);
  // createLead đọc khoá từ môi trường: phải trùng khoá đã kiểm, không thì số lead mã hoá bằng khoá khác.
  if (!khoaSoChu().key.equals(opts.khoa.key)) throw new Error("OWNER_PHONE_KEY của môi trường khác khoá đã kiểm");

  const ds = await timSanMau(client);
  if (ds.length > 1) throw new Error(`có ${ds.length} sàn mẫu khớp — không nạp`);
  const san = ds[0] ?? (await client.query<{ id: string }>("insert into companies (name) values ($1) returning id", [TEN_SAN])).rows[0]!.id;
  await napMau(client, goi, san);

  const nguoi = new Map<string, string>();
  for (const n of goi.nguoi) {
    nguoi.set(n.khoa, (await client.query<{ id: string }>('select id from identity."user" where email = $1', [n.email])).rows[0]!.id);
  }
  const id = (khoa: string) => nguoi.get(khoa) ?? tuChoi(khoa, { error: { code: "khong-co-nguoi-mau" } });

  // Tài khoản chủ kho: giữ tài khoản và mọi dòng thành viên ở sàn khác, chỉ đặt dòng của sàn mẫu.
  await client.query(
    `insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, split_part($1, '@', 1), $1, true)
     on conflict (email) do nothing`,
    [email],
  );
  const chuKho = (await client.query<{ id: string }>('select id from identity."user" where email = $1', [email])).rows[0]!.id;
  await client.query(
    `insert into company_members (company_id, user_id, roles) values ($1, $2, $3)
     on conflict (company_id, user_id) do update set roles = excluded.roles where company_members.roles is distinct from excluded.roles`,
    [san, chuKho, VAI_CHU_KHO],
  );

  const toaCuaCan = new Map<string, string>();
  const toaTheoKhoa = new Map<string, string>();
  for (const s of goi.danhMuc.subdivisions) {
    for (const t of s.buildings) {
      toaTheoKhoa.set(t.buildingKey, t.buildingName);
      for (const c of t.units) toaCuaCan.set(c.upi, t.buildingName);
    }
  }
  const chuNha = new Map(goi.chuNha.map((c) => [c.ma, c]));
  const moi = { hang: 0, chuNha: 0, lead: 0 };

  const ghiChu = async (h: GoiMau["hang"][number], listingId: string) => {
    const cn = chuNha.get(h.chuNha) ?? tuChoi(h.ma, { error: { code: "khong-co-chu-nha" } });
    const ghi = await trongVai(client, id(h.dauChu), san, (tx) =>
      putOwner(tx, listingId, { ownerName: cn.ten, ownerPhone: boKhoangTrang(cn.soDienThoai) }, opts.khoa),
    );
    if (laTuChoiChu(ghi)) tuChoi(h.ma, ghi);
    moi.chuNha++;
  };

  let thuTuNgung = 0;
  for (const [thuTu, h] of goi.hang.entries()) {
    const buildingName = toaCuaCan.get(h.upi) ?? tuChoi(h.ma, { error: { code: "can-khong-co-trong-danh-muc" } });
    const lyDoNgung = h.trangThai === "Withdrawn" ? WITHDRAWN_REASONS[thuTuNgung++ % WITHDRAWN_REASONS.length] : undefined;
    const co = await client.query<{ id: string }>(
      "select id from listings where company_id = $1 and building_name = $2 and unit_number = $3",
      [san, buildingName, h.maCan],
    );
    let listingId = co.rows[0]?.id;
    if (!listingId) {
      const dauChu = id(h.dauChu);
      const tao = await trongVai(client, dauChu, san, (tx) => createListing(tx, { buildingName, unitNumber: h.maCan }));
      if (isRefusal(tao)) tuChoi(h.ma, tao);
      listingId = tao.listingId;
      let version = tao.state.version;
      // Đầu chủ ghi chủ nhà khi hàng chưa có ai giữ thì tự thành người phụ trách (putOwner) — hàng Chưa đủ chỉ người
      // tạo thấy, nên trưởng nhóm chưa gán được ở bước này.
      await ghiChu(h, listingId);
      const lenh = async (cmd: Omit<Command, "expectedVersion">) => {
        const r = await trongVai(client, dauChu, san, async (tx) => applyCommand(tx, await viewerOf(tx, dauChu), listingId!, { ...cmd, expectedVersion: version }));
        if (isRefusal(r)) tuChoi(h.ma, r);
        version = r.state.version;
      };
      await lenh({ type: "price_changed", payload: { listPrice: h.gia, feeInclusion: PHI[h.dieuKienPhi] } });
      if (h.trangThai === "Withdrawn") {
        await lenh({ type: "status_changed", payload: { to: "Withdrawn", withdrawnReason: lyDoNgung } });
      } else if (h.trangThai !== "Incomplete") {
        await lenh({ type: "details_changed", payload: CHI_TIET_DANG_BAN });
        // Luật lõi (hàng 23): vào Đang bán cần một ảnh thật ngăn Gửi được — ảnh vẽ theo thứ tự hàng, qua API ảnh.
        const a = anhMau(thuTu);
        const anh = await trongVai(client, dauChu, san, (tx) =>
          addPhoto(tx, opts.kho, san, { toa: buildingName, ma: h.maCan, ngan: "shareable", takenAt: null, width: a.width, height: a.height, thumb: a.nhe, original: a.goc }),
        );
        if (laTuChoiAnh(anh)) tuChoi(h.ma, anh);
        await lenh({ type: "status_changed", payload: { to: "Active" } });
        if (h.trangThai === "Closed") await lenh({ type: "status_changed", payload: { to: "Closed", closePrice: h.gia, closeDate: NGAY_CHOT } });
        else if (h.trangThai !== "Active") await lenh({ type: "status_changed", payload: { to: h.trangThai } });
      }
      moi.hang++;
    }
    const daCoChu = await client.query("select 1 from listing_owners where company_id = $1 and listing_id = $2", [san, listingId]);
    if (!daCoChu.rowCount) await ghiChu(h, listingId);
  }

  // Lead nạp sau mọi hàng để luật kiểm trùng thấy hàng mở và số chủ đã có.
  for (const [i, l] of goi.lead.entries()) {
    const buildingName = toaTheoKhoa.get(l.toa) ?? tuChoi(l.ma, { error: { code: "toa-khong-co" } });
    const so = boKhoangTrang(l.soDienThoai);
    const co = await client.query(
      `select 1 from leads where company_id = $1 and building_name = $2 and unit_number is not distinct from $3 and owner_phone_hash = $4`,
      [san, buildingName, l.maCan, /^0\d{9}$/.test(so) ? dauVetSo(so, san, opts.khoa) : Buffer.alloc(0)],
    );
    if (co.rowCount) continue;
    const tao = await trongVai(client, id("telesales"), san, (tx) =>
      createLead(tx, {
        buildingName,
        ...(l.maCan !== null && { unitNumber: l.maCan }),
        need: "sale",
        listPrice: 3_000_000_000 + 10_000_000 * i,
        feeInclusion: "excluded",
        desiredListingTime: "now",
        ownerPhone: so,
      }),
    );
    if (laTuChoiLead(tao)) tuChoi(l.ma, tao);
    moi.lead++;
  }
  return { san, moi };
}

export type KetQuaGo = { ket: "khong-co" } | { ket: "da-go"; san: string; nguoi: number } | { ket: "tu-choi"; soSan: number };

/**
 * Gỡ đúng một sàn mẫu theo id, rồi tài khoản miền mẫu không còn thuộc sàn nào. Sàn thật trùng tên không bị chạm. Byte
 * ảnh xoá khỏi kho TRƯỚC khi xoá sàn, chỉ mã ảnh của đúng sàn mẫu, mỗi lệnh mang mã sàn mẫu (Hỏi-2).
 */
export async function goBanThat(client: pg.ClientBase, kho: KhoAnh): Promise<KetQuaGo> {
  const ds = await timSanMau(client);
  if (ds.length === 0) return { ket: "khong-co" };
  if (ds.length > 1) return { ket: "tu-choi", soSan: ds.length };
  const san = ds[0]!;
  const anh = await client.query<{ id: string }>("select id from unit_photos where company_id = $1 order by id", [san]);
  for (const a of anh.rows) await kho.xoa(client as pg.PoolClient, san, a.id);
  await client.query("delete from companies where id = $1", [san]);
  const xoa = await client.query(
    `delete from identity."user" u where u.email like $1
       and not exists (select 1 from company_members m where m.user_id = u.id)`,
    [`%@${MIEN_EMAIL}`],
  );
  return { ket: "da-go", san, nguoi: xoa.rowCount ?? 0 };
}

async function chay(): Promise<number> {
  const { values } = parseArgs({ options: { nap: { type: "boolean" }, go: { type: "boolean" }, email: { type: "string" } } });
  if (!values.nap === !values.go) {
    console.error("Cách dùng: node --import tsx packages/db/seed/nap-ban-that.ts --nap --email <email> | --go");
    return 2;
  }
  // Kiểm khoá và email TRƯỚC khi mở kết nối: sai thì không câu nào chạm cơ sở dữ liệu.
  const khoa = values.nap ? khoaSoChu(process.env, { choPhepKhoaDev: false }) : null;
  if (values.nap) chuanHoaEmail(values.email ?? "");
  // Kho ảnh chọn như API, cả khi nạp lẫn khi gỡ; bản thật thiếu khoá thì dừng ở đây, lời báo nêu đúng biến thiếu.
  const kho = chonKhoAnh(process.env);
  if (kho.ten === "vang") throw new Error(kho.lyDo);
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("thiếu DATABASE_URL của vai chủ");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    let ma = 0;
    if (khoa) {
      const goi = JSON.parse(readFileSync(path.join(THU_MUC_MAU, "du-lieu-mau.json"), "utf8")) as GoiMau;
      const { moi } = await napBanThat(client, goi, { khoa, email: values.email!, kho });
      console.log(`đã nạp ${TEN_SAN}: ${moi.hang} hàng, ${moi.chuNha} chủ nhà, ${moi.lead} lead mới`);
    } else {
      const kq = await goBanThat(client, kho);
      if (kq.ket === "khong-co") console.log("không có gì để gỡ");
      else if (kq.ket === "da-go") console.log(`đã gỡ ${TEN_SAN} và ${kq.nguoi} tài khoản mẫu`);
      else {
        console.error(`có ${kq.soSan} sàn mẫu khớp — không gỡ gì, cần người xem lại`);
        ma = 1;
      }
    }
    await client.query(ma === 0 ? "commit" : "rollback");
    return ma;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  chay().then(
    (ma) => process.exit(ma),
    (e: unknown) => {
      // Chỉ thông điệp — đối tượng lỗi của Postgres có thể mang giá trị dòng.
      console.error(`nap-ban-that: ${e instanceof Error ? e.message : "lỗi không rõ"}`);
      process.exit(1);
    },
  );
}
