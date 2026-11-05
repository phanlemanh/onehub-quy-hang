import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { API_ERRORS, type ApiErrorEntry } from "../errors";

/**
 * Cửa vào chung của các đường tra danh mục (mã căn hàng 9, mã lô hàng 74): đã đăng nhập và có sàn đang làm, ở mọi vai.
 * Một hàm cho cả hai đường để hai đường không bao giờ trả khác nhau ở cửa.
 */
export function taoCuaVao({ appPool, auth }: Pick<ApiDeps, "appPool" | "auth">) {
  async function vao(c: Context): Promise<ApiErrorEntry | null> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return null;
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 401);
  return { vao, tra };
}
