import { docCanNgoaiKhu, type CanNgoaiKhuMoi } from "@quy-hang/core/property";
import { lamViecVoiHang } from "@quy-hang/core/access";
import type pg from "pg";
import { API_ERRORS } from "../errors";
import type { Refusal } from "../listings/store";

/**
 * Căn ngoài khu của sàn (hàng 76 can-ngoai-khu, ADR-0016 quyết định 4, 5). Đọc và ghi qua luật theo dòng (052): người không
 * có Bảng hàng như không có căn nào; căn của sàn khác và mã không tồn tại cùng một câu trả lời.
 */
export type CanNgoaiKhu = CanNgoaiKhuMoi & { id: string; createdAt: string };

const COT = `id, property_sub_type as "propertySubType", state_or_province_code as "stateOrProvinceCode", ward_code as "wardCode",
  street_name as "streetName", street_number as "streetNumber", unparsed_address as "unparsedAddress", address_key as "addressKey",
  created_at as "createdAt"`;

const raCan = (r: Record<string, unknown>): CanNgoaiKhu => ({ ...(r as CanNgoaiKhu), createdAt: (r.createdAt as Date).toISOString() });

async function vaiLucLam(tx: pg.PoolClient): Promise<string[]> {
  const { rows } = await tx.query<{ roles: string[] }>(
    "select roles from company_members where company_id = app.current_company_id() and user_id = app.current_user_id()",
  );
  return rows[0]?.roles ?? [];
}

/** Một căn ngoài khu của sàn đang làm; `null` khi không có (kể cả căn của sàn khác — luật theo dòng). */
export async function docCan(tx: pg.PoolClient, id: string): Promise<CanNgoaiKhu | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const { rows } = await tx.query(`select ${COT} from off_compound_units where company_id = app.current_company_id() and id = $1`, [id]);
  return rows[0] ? raCan(rows[0]) : null;
}

/** Một dòng của danh sách căn ngoài khu cho Bảng hàng (hàng 79): mã, loại hình, địa chỉ đã gõ — không gì khác. */
export type DongCanNgoaiKhu = { id: string; propertySubType: string; unparsedAddress: string };

/**
 * Mọi căn ngoài khu của sàn đang làm (hàng 79 bang-hang-theo-loai-hinh): Bảng hàng ghép loại hình của hàng ngoài khu từ đây,
 * giữ bản cuối trên máy như danh mục. Luật theo dòng (052) chỉ trả căn của sàn này; người không có Bảng hàng → `null`.
 */
export async function danhSachCan(tx: pg.PoolClient): Promise<DongCanNgoaiKhu[] | null> {
  if (!lamViecVoiHang({ roles: await vaiLucLam(tx) })) return null;
  const { rows } = await tx.query<DongCanNgoaiKhu>(
    `select id, property_sub_type as "propertySubType", unparsed_address as "unparsedAddress"
       from off_compound_units where company_id = app.current_company_id() order by created_at, id`,
  );
  return rows.map((r) => ({ id: r.id, propertySubType: r.propertySubType, unparsedAddress: r.unparsedAddress }));
}

/**
 * Tìm hay tạo căn ngoài khu từ thân `{ address, propertySubType }`: cùng khoá địa chỉ trong sàn → căn đã có (`moi: false`);
 * chưa có, hay căn chưa có số nhà (khoá null — không gộp) → căn mới. Khoá xung đột do hai lệnh cùng lúc: đọc lại căn thắng.
 */
export async function timHayTaoCan(tx: pg.PoolClient, than: unknown): Promise<{ can: CanNgoaiKhu; moi: boolean } | Refusal> {
  if (!lamViecVoiHang({ roles: await vaiLucLam(tx) })) return { error: API_ERRORS.notFound };
  const kq = docCanNgoaiKhu(than);
  if (!kq.ok) return { error: API_ERRORS.invalidPayload, details: kq.loi, reason: kq.loi.map((l) => l.reason).join("; ") };
  const c = kq.can;
  if (c.addressKey) {
    const { rows } = await tx.query(`select ${COT} from off_compound_units where company_id = app.current_company_id() and address_key = $1`, [c.addressKey]);
    if (rows[0]) return { can: raCan(rows[0]), moi: false };
  }
  const { rows } = await tx.query(
    `insert into off_compound_units (company_id, property_sub_type, state_or_province_code, ward_code, street_name, street_number, unparsed_address, address_key)
     values (app.current_company_id(), $1, $2, $3, $4, $5, $6, $7)
     on conflict (company_id, address_key) where address_key is not null do nothing
     returning ${COT}`,
    [c.propertySubType, c.stateOrProvinceCode, c.wardCode, c.streetName, c.streetNumber, c.unparsedAddress, c.addressKey],
  );
  if (rows[0]) return { can: raCan(rows[0]), moi: true };
  const lai = await tx.query(`select ${COT} from off_compound_units where company_id = app.current_company_id() and address_key = $1`, [c.addressKey]);
  return { can: raCan(lai.rows[0]!), moi: false };
}
