import type pg from "pg";
import { withCompany } from "../db";

export type CompanyRef = { id: string; name: string };
export type ActiveCompany = {
  companies: CompanyRef[];
  active: CompanyRef | null;
  /** Vì sao chưa có sàn đang làm: không thuộc sàn nào, hay thuộc nhiều sàn mà chưa chọn. */
  reason: "chua-gan-san" | "chon-san" | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Các sàn người là thành viên — đọc dưới luật theo dòng, chưa đặt sàn. */
export function listCompanies(pool: pg.Pool, userId: string): Promise<CompanyRef[]> {
  return withCompany(pool, { userId, companyId: null }, async (c) => {
    const { rows } = await c.query<CompanyRef>(
      `select c.id, c.name from companies c
       join company_members m on m.company_id = c.id and m.user_id = app.current_user_id()
       order by c.name, c.id`,
    );
    return rows;
  });
}

/**
 * Sàn đang làm của lời gọi: sàn trong cookie nếu người còn là thành viên; không thì sàn duy nhất; nhiều sàn mà chưa
 * chọn thì chưa có. Cookie chỉ là lựa chọn — mất thành viên thì lần gọi kế không còn vào sàn đó.
 */
export async function resolveCompany(pool: pg.Pool, userId: string, chosen: string | undefined): Promise<ActiveCompany> {
  const companies = await listCompanies(pool, userId);
  if (companies.length === 0) return { companies, active: null, reason: "chua-gan-san" };
  const picked = chosen && UUID.test(chosen) ? companies.find((c) => c.id === chosen) : undefined;
  if (picked) return { companies, active: picked, reason: null };
  if (companies.length === 1) return { companies, active: companies[0]!, reason: null };
  return { companies, active: null, reason: "chon-san" };
}
