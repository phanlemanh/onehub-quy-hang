import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "./app";
import { emailsOf, ensureAccount } from "./auth/accounts";
import { resolveCompany } from "./auth/company";
import { ACTIVE_COMPANY_COOKIE } from "./auth/constants";
import { withCompany } from "./db";

/** Năm vai của Tham chiếu §2 (ADR-0006). Cơ sở dữ liệu giữ cùng danh sách ở ràng buộc company_members_roles_valid. */
export const ROLES = ["telesales", "listing_agent", "buyer_agent", "team_lead", "company_admin"] as const;

const BASE = "/api/v1/san";
const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const Zone = z.object({ id: z.string(), name: z.string() });
const Member = z.object({ userId: z.string(), email: z.string(), roles: z.array(z.string()), zones: z.array(Zone) });
const json = (schema: z.ZodTypeAny) => ({ body: { content: { "application/json": { schema } } } });
/** Mọi đường quản người có thể trả các mã lỗi này (đăng nhập, sàn đang làm, quyền, dữ liệu, trigger). */
const loi = {
  400: err("Sai dữ liệu"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn hoặc cần quản trị sàn"),
  404: err("Không có người này"),
  409: err("Chọn sàn, đã là thành viên, tên khu trùng, hoặc sàn cần một quản trị"),
};

type Ctx = { userId: string; companyId: string };
type Loi = { status: 400 | 403 | 404 | 409; error: string };

/** Lỗi Postgres → mã lỗi của API. Luật theo dòng và trigger là lưới cuối; API kiểm trước để trả mã rõ. */
function loiPg(e: unknown): Loi | null {
  const x = e as { code?: string; constraint?: string };
  if (x.code === "P0001" && x.constraint === "can_mot_quan_tri") return { status: 409, error: "can-mot-quan-tri" };
  if (x.code === "23514") return { status: 400, error: "vai-khong-hop-le" };
  if (x.code === "23503") return { status: 400, error: "khu-khong-thuoc-san" };
  if (x.code === "23505" && x.constraint === "company_zones_name_unique") return { status: 409, error: "khu-trung-ten" };
  if (x.code === "42501") return { status: 403, error: "can-quan-tri" };
  return null;
}

export function registerMemberRoutes(api: OpenAPIHono, { appPool, identityPool, auth }: ApiDeps) {
  /** Người, sàn đang làm và có là quản trị không — đọc lại mỗi lời gọi, không lưu trong phiên. */
  async function vao(c: Context): Promise<{ ctx: Ctx; admin: boolean } | Loi | { status: 401; error: string }> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return { status: 401, error: "chua-dang-nhap" };
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === "chon-san" ? { status: 409, error: "chon-san" } : { status: 403, error: "chua-gan-san" };
    const ctx = { userId: user.id, companyId: r.active.id };
    const admin = await withCompany(appPool, ctx, async (tx) => {
      const { rows } = await tx.query<{ a: boolean }>("select app.current_user_is_admin() as a");
      return rows[0]?.a === true;
    });
    return { ctx, admin };
  }
  const tra = (c: Context, l: { status: number; error: string }) => c.json({ error: l.error }, l.status as 400);
  const quanTri = async (c: Context) => {
    const v = await vao(c);
    if ("status" in v) return v;
    if (!v.admin) return { status: 403 as const, error: "can-quan-tri" };
    return v.ctx;
  };

  async function datKhu(tx: import("pg").PoolClient, userId: string, zoneIds: string[]) {
    await tx.query("delete from member_zones where company_id = app.current_company_id() and user_id = $1", [userId]);
    for (const zoneId of zoneIds) {
      await tx.query("insert into member_zones (company_id, user_id, zone_id) values (app.current_company_id(), $1, $2)", [
        userId,
        zoneId,
      ]);
    }
  }
  const vaiHopLe = (roles: string[]) => roles.every((r) => (ROLES as readonly string[]).includes(r));
  const uuidHopLe = (ids: string[]) => ids.every((i) => /^[0-9a-f-]{36}$/i.test(i));

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/thanh-vien`,
      summary: "Người của sàn đang làm — chỉ quản trị sàn",
      responses: { 200: ok("Người", z.array(Member)), ...loi },
    }),
    async (c) => {
      const q = await quanTri(c);
      if ("status" in q) return tra(c, q);
      const rows = await withCompany(appPool, q, async (tx) =>
        (
          await tx.query<{ userId: string; roles: string[]; zones: { id: string; name: string }[] }>(
            `select m.user_id as "userId", m.roles,
                    coalesce(json_agg(json_build_object('id', z.id, 'name', z.name) order by z.name)
                             filter (where z.id is not null), '[]') as zones
             from company_members m
             left join member_zones mz on mz.company_id = m.company_id and mz.user_id = m.user_id
             left join company_zones z on z.company_id = mz.company_id and z.id = mz.zone_id
             where m.company_id = app.current_company_id()
             group by m.user_id, m.roles`,
          )
        ).rows,
      );
      const emails = await emailsOf(identityPool, rows.map((r) => r.userId));
      const ds = rows.map((r) => ({ ...r, email: emails.get(r.userId) ?? "" })).sort((a, b) => a.email.localeCompare(b.email));
      return c.json(ds, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/thanh-vien`,
      summary: "Mời người vào sàn — vào ngay, tạo tài khoản khi chưa có (ADR-0006)",
      request: json(z.object({ email: z.string().email(), roles: z.array(z.string()), zoneIds: z.array(z.string()).default([]) })),
      responses: { 201: ok("Đã mời", z.object({ userId: z.string() })), ...loi },
    }),
    async (c) => {
      const q = await quanTri(c);
      if ("status" in q) return tra(c, q);
      const { email, roles, zoneIds } = c.req.valid("json");
      if (roles.length === 0) return c.json({ error: "can-it-nhat-mot-vai" }, 400);
      if (!vaiHopLe(roles)) return c.json({ error: "vai-khong-hop-le" }, 400);
      if (!uuidHopLe(zoneIds)) return c.json({ error: "khu-khong-thuoc-san" }, 400);
      const userId = await ensureAccount(identityPool, email);
      try {
        const kq = await withCompany(appPool, q, async (tx) => {
          const co = await tx.query("select 1 from company_members where company_id = app.current_company_id() and user_id = $1", [userId]);
          if (co.rowCount) return "trung";
          await tx.query("insert into company_members (company_id, user_id, roles) values (app.current_company_id(), $1, $2)", [
            userId,
            roles,
          ]);
          await datKhu(tx, userId, zoneIds);
          return "ok";
        });
        if (kq === "trung") return c.json({ error: "da-la-thanh-vien" }, 409);
        // Câu trả lời như nhau dù email đã có tài khoản hay chưa: quản trị không dò được ai đang dùng Quỹ hàng.
        return c.json({ userId }, 201);
      } catch (e) {
        const l = loiPg(e);
        if (l) return tra(c, l);
        throw e;
      }
    },
  );

  api.openapi(
    createRoute({
      method: "patch",
      path: `${BASE}/thanh-vien/{userId}`,
      summary: "Đổi vai, khu phụ trách của một người",
      request: { params: z.object({ userId: z.string() }), ...json(z.object({ roles: z.array(z.string()).optional(), zoneIds: z.array(z.string()).optional() })) },
      responses: { 200: ok("Đã đổi", z.object({ userId: z.string() })), ...loi },
    }),
    async (c) => {
      const q = await quanTri(c);
      if ("status" in q) return tra(c, q);
      const { userId } = c.req.valid("param");
      const { roles, zoneIds } = c.req.valid("json");
      if (roles && roles.length === 0) return c.json({ error: "can-it-nhat-mot-vai" }, 400);
      if (roles && !vaiHopLe(roles)) return c.json({ error: "vai-khong-hop-le" }, 400);
      if (zoneIds && !uuidHopLe(zoneIds)) return c.json({ error: "khu-khong-thuoc-san" }, 400);
      try {
        const co = await withCompany(appPool, q, async (tx) => {
          const m = await tx.query("select 1 from company_members where company_id = app.current_company_id() and user_id = $1", [userId]);
          if (!m.rowCount) return false;
          if (roles) {
            await tx.query("update company_members set roles = $2 where company_id = app.current_company_id() and user_id = $1", [userId, roles]);
          }
          if (zoneIds) await datKhu(tx, userId, zoneIds);
          return true;
        });
        return co ? c.json({ userId }, 200) : c.json({ error: "khong-thay" }, 404);
      } catch (e) {
        const l = loiPg(e);
        if (l) return tra(c, l);
        throw e;
      }
    },
  );

  api.openapi(
    createRoute({
      method: "delete",
      path: `${BASE}/thanh-vien/{userId}`,
      summary: "Bỏ một người khỏi sàn — khu phụ trách của họ ở sàn mất theo",
      request: { params: z.object({ userId: z.string() }) },
      responses: { 204: { description: "Đã bỏ" }, ...loi },
    }),
    async (c) => {
      const q = await quanTri(c);
      if ("status" in q) return tra(c, q);
      const { userId } = c.req.valid("param");
      try {
        const n = await withCompany(appPool, q, async (tx) =>
          (await tx.query("delete from company_members where company_id = app.current_company_id() and user_id = $1", [userId])).rowCount,
        );
        return n ? c.body(null, 204) : c.json({ error: "khong-thay" }, 404);
      } catch (e) {
        const l = loiPg(e);
        if (l) return tra(c, l);
        throw e;
      }
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/khu`,
      summary: "Khu của sàn đang làm",
      responses: { 200: ok("Khu", z.array(Zone)), ...loi },
    }),
    async (c) => {
      const v = await vao(c);
      if ("status" in v) return tra(c, v);
      const rows = await withCompany(appPool, v.ctx, async (tx) =>
        (await tx.query<{ id: string; name: string }>("select id, name from company_zones where company_id = app.current_company_id() order by name")).rows,
      );
      return c.json(rows, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/khu`,
      summary: "Tạo khu theo tên — chỉ quản trị sàn",
      request: json(z.object({ name: z.string() })),
      responses: { 201: ok("Đã tạo", Zone), ...loi },
    }),
    async (c) => {
      const q = await quanTri(c);
      if ("status" in q) return tra(c, q);
      const name = c.req.valid("json").name.trim();
      if (!name) return c.json({ error: "ten-khu-rong" }, 400);
      try {
        const row = await withCompany(appPool, q, async (tx) =>
          (await tx.query<{ id: string; name: string }>("insert into company_zones (company_id, name) values (app.current_company_id(), $1) returning id, name", [name])).rows[0],
        );
        return c.json(row, 201);
      } catch (e) {
        const l = loiPg(e);
        if (l) return tra(c, l);
        throw e;
      }
    },
  );
}
