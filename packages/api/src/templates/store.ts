import { kiemSuaMau, type BanSuaMau, type CotMauDaSua } from "@quy-hang/core/import";
import type pg from "pg";
import { mauDaGop } from "../imports/store";

/** Mẫu file nhập của sàn (hàng 50): đọc, sửa, xoá một cột đã nhớ. Route đã kiểm vai Quản trị sàn; bảng kiểm lần nữa (045). */
export type KetQuaSua = { ok: CotMauDaSua } | { loi: "khong-co" } | { loi: "sai-luat"; lyDo: string };

const coKhoa = async (tx: pg.PoolClient, key: string) => (await mauDaGop(tx)).some((c) => c.headerKey === key);

export async function docMau(tx: pg.PoolClient): Promise<CotMauDaSua[]> {
  return mauDaGop(tx);
}

export async function suaMau(tx: pg.PoolClient, key: string, ban: BanSuaMau): Promise<KetQuaSua> {
  if (!(await coKhoa(tx, key))) return { loi: "khong-co" };
  const lyDo = kiemSuaMau(ban);
  if (lyDo.length) return { loi: "sai-luat", lyDo: lyDo.join("; ") };
  await tx.query(
    "insert into import_templates (company_id, header_key, action, target, transform, value_map) values (app.current_company_id(), $1, 'set', $2, $3, $4)",
    [key, ban.target, ban.transform === undefined ? null : JSON.stringify(ban.transform), ban.valueMap === undefined ? null : JSON.stringify(ban.valueMap)],
  );
  return { ok: (await mauDaGop(tx)).find((c) => c.headerKey === key)! };
}

export async function xoaMau(tx: pg.PoolClient, key: string): Promise<boolean> {
  if (!(await coKhoa(tx, key))) return false;
  await tx.query("insert into import_templates (company_id, header_key, action) values (app.current_company_id(), $1, 'delete')", [key]);
  return true;
}
