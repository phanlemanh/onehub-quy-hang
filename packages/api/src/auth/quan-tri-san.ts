import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { resolveCompany } from "./company";
import { ACTIVE_COMPANY_COOKIE } from "./constants";

export type QuanTriSan = { userId: string; companyId: string };

/** Quản trị của sàn đang làm, đọc lại mỗi lời gọi; không phải quản trị thì trả mã lỗi của API. */
export async function quanTriSan(c: Context, { appPool, auth }: Pick<ApiDeps, "appPool" | "auth">): Promise<QuanTriSan | ApiErrorEntry> {
  const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
  if (!user) return API_ERRORS.unauthenticated;
  const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
  if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
  const ctx = { userId: user.id, companyId: r.active.id };
  const admin = await withCompany(appPool, ctx, async (tx) => {
    const { rows } = await tx.query<{ a: boolean }>("select app.current_user_is_admin() as a");
    return rows[0]?.a === true;
  });
  return admin ? ctx : API_ERRORS.adminRequired;
}
