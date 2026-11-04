import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { disableShare, listShares, readShare } from "./store";

/** Đã gửi (hàng 36): Lần gửi của người xem — đầu khách của mình, trưởng nhóm của cả sàn; vai khác 403. */
const BASE = "/api/v1/shares";
const DUOC_XEM = ["buyer_agent", "team_lead"];

export function registerDaGuiRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string; truongNhom: boolean } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    const vai = r.active.roles ?? [];
    if (!vai.some((v) => DUOC_XEM.includes(v))) return API_ERRORS.buyerAgentRequired;
    return { userId: user.id, companyId: r.active.id, truongNhom: vai.includes("team_lead") };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);
  const laMa = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

  api.get(BASE, async (c) => {
    const ctx = await vao(c);
    if ("code" in ctx) return tra(c, ctx);
    return c.json(await withCompany(appPool, ctx, (tx) => listShares(tx, ctx.userId, ctx.truongNhom)), 200);
  });

  api.get(`${BASE}/:id`, async (c) => {
    const ctx = await vao(c);
    if ("code" in ctx) return tra(c, ctx);
    const id = c.req.param("id");
    if (!laMa(id)) return tra(c, API_ERRORS.notFound);
    const v = await withCompany(appPool, ctx, (tx) => readShare(tx, ctx.userId, ctx.truongNhom, id));
    return v ? c.json(v, 200) : tra(c, API_ERRORS.notFound);
  });

  api.post(`${BASE}/:id/disable`, async (c) => {
    const ctx = await vao(c);
    if ("code" in ctx) return tra(c, ctx);
    const id = c.req.param("id");
    if (!laMa(id)) return tra(c, API_ERRORS.notFound);
    const kq = await withCompany(appPool, ctx, (tx) => disableShare(tx, id));
    if (kq === "ok") return c.json({ ok: true }, 200);
    if (kq === "khong-co") return tra(c, API_ERRORS.notFound);
    if (kq === "khong-duoc") return tra(c, API_ERRORS.teamLeadRequired);
    return c.json({ error: API_ERRORS.versionConflict.code }, 409);
  });
}
