import type { OpenAPIHono } from "@hono/zod-openapi";
import { dungTin } from "@quy-hang/core/today";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS } from "../errors";
import { docVaoDungTin } from "./store";

/** Hôm nay của đầu khách (hàng 37): tin 7 ngày về link của chính người xem; chỉ vai Đầu khách, vai khác 403. */
export function registerTodayBuyerRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  api.get("/api/v1/today/buyer", async (c) => {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    const loi = (l: { code: string; status: number }) => c.json({ error: l.code }, l.status as 400);
    if (!user) return loi(API_ERRORS.unauthenticated);
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return loi(r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany);
    if (!(r.active.roles ?? []).includes("buyer_agent")) return loi(API_ERRORS.buyerAgentRequired);
    const ctx = { userId: user.id, companyId: r.active.id };
    const bay = new Date();
    const vao = await withCompany(appPool, ctx, (tx) => docVaoDungTin(tx, user.id, bay));
    return c.json({ items: dungTin(vao, bay) }, 200);
  });
}
