import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { parseCatalogFeed, type CatalogFeedError } from "@quy-hang/connect";
import { mayFlow } from "@quy-hang/core";
import type { Context } from "hono";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { quanTriSan } from "../auth/quan-tri-san";
import { docBearer } from "../auth/token-may";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { demGoi, ghiGoi, toAgreement, type AgreementRow, type FeedHooks } from "./feeds-ghi";
import { nhanBangToken } from "./feeds-token";

/**
 * Cửa nhận gói danh mục theo khuôn v1 (ADR-0015) vào vùng danh mục dùng chung. Hai đường: quản trị sàn bằng phiên, hoặc
 * máy bên kia bằng token gắn một thoả thuận (`feeds-token.ts`, hàng 96). Đường phiên chỉ nhận khi
 * sàn nằm trong danh sách tin và có thoả thuận `catalog_source` chiều vào đang hiệu lực mang lớp `catalog`. Gói sai
 * khuôn hay thoả thuận không hiệu lực thì không một dòng nào: kiểm cả gói trước, ghi một giao dịch, và luật theo dòng
 * của cơ sở dữ liệu là lưới cuối (thoả thuận đổi trạng thái giữa lúc kiểm và lúc ghi vẫn bị chặn).
 */
const PATH = "/api/v1/catalog/feeds";

const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const FeedResult = z
  .object({
    subdivisions: z.number().int(),
    buildings: z.number().int(),
    units: z.number().int(),
    /** Căn mới vào vùng dùng chung. */
    created: z.number().int(),
    /** Căn đã có mà gói đổi ít nhất một thuộc tính. */
    updated: z.number().int(),
  })
  .openapi("CatalogFeedResult");
const InvalidFeed = z
  .object({
    error: z.literal(API_ERRORS.invalidFeed.code),
    errors: z.array(z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() })),
  })
  .openapi("CatalogFeedInvalid");

export type FeedResult = z.infer<typeof FeedResult>;

export type { FeedHooks };

/** Ném ra khỏi giao dịch để rollback và trả mã lỗi của API. */
class FeedRefused extends Error {
  constructor(readonly entry: ApiErrorEntry) {
    super(entry.code);
  }
}

/** Thoả thuận đầu tiên của sàn đang đặt mở được luồng danh mục chiều vào lúc này; không có thì `null`. */
async function chonThoaThuan(tx: pg.PoolClient): Promise<string | null> {
  const at = (await tx.query<{ now: Date }>("select now() as now")).rows[0]!.now;
  const { rows } = await tx.query<AgreementRow>(
    `select id, company_id, kind, direction, counterparty, data_classes, valid_from, valid_until, status, approved_by,
            special_terms
     from agreements where company_id = app.current_company_id() order by created_at, id`,
  );
  const hop = rows.map(toAgreement).find((a) => mayFlow(a, "catalog", { at, kind: "catalog_source", direction: "inbound" }).ok);
  return hop?.id ?? null;
}

export function registerFeedRoutes(api: OpenAPIHono, deps: ApiDeps, hooks: FeedHooks = {}) {
  const { appPool } = deps;
  api.openAPIRegistry.registerComponent("securitySchemes", "machineToken", { type: "http", scheme: "bearer" });
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 403);
  const saiKhuon = (c: Context, errors: CatalogFeedError[]) =>
    c.json({ error: API_ERRORS.invalidFeed.code, errors }, API_ERRORS.invalidFeed.status);

  api.openapi(
    createRoute({
      method: "post",
      path: PATH,
      summary: "Nhận một gói danh mục theo khuôn v1 vào vùng danh mục dùng chung — quản trị sàn được tin, hoặc máy có token của thoả thuận",
      // Một trong hai: Bearer token máy, hoặc phiên quản trị (cookie, không khai ở tài liệu).
      security: [{ machineToken: [] }, {}],
      // Thân không khai ở đây để thân hỏng (không phải JSON, không phải object) ra 422 invalid-feed thay vì 400 của
      // bộ kiểm tự động; khuôn đầy đủ ở packages/connect (CatalogFeed, schemaVersion 1).
      description:
        "Thân: gói CatalogFeed v1 (`schemaVersion`, `provider`, `measuredAt`, `subdivisions` → `buildings` → `units`). " +
        "Cả gói hoặc không gì: sai khuôn 422, thoả thuận catalog_source chiều vào không hiệu lực 403.",
      responses: {
        200: { description: "Đã nhận", content: { "application/json": { schema: FeedResult } } },
        401: err("Chưa đăng nhập, hoặc token máy sai, lạ, đã thu hồi (invalid-machine-token)"),
        403: err("Chưa gắn sàn, cần quản trị sàn, thoả thuận không hiệu lực, hoặc token ngoài phạm vi (token-scope)"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
        422: { description: "Gói sai khuôn", content: { "application/json": { schema: InvalidFeed } } },
        500: err("Lỗi máy chủ ở đường token (internal-error)"),
      },
    }),
    async (c) => {
      // Có Bearer thì chỉ đi đường token, không rơi về phiên kể cả khi token hỏng và cookie quản trị còn sống.
      const bearer = docBearer(c.req.header("authorization"));
      if (bearer) return nhanBangToken(c, bearer.token, deps, hooks);

      const q = await quanTriSan(c, deps);
      if ("status" in q) return tra(c, q);

      let raw: unknown;
      try {
        raw = await c.req.json();
      } catch {
        return saiKhuon(c, [{ path: [], message: "Thân gói không phải JSON." }]);
      }
      const parsed = parseCatalogFeed(raw);
      if (!parsed.ok) return saiKhuon(c, parsed.errors);
      const { feed } = parsed;

      try {
        const { created, updated } = await withCompany(appPool, q, async (tx) => {
          const tin = (
            await tx.query<{ t: boolean }>(
              "select exists (select 1 from catalog_trusted_companies where company_id = app.current_company_id()) as t",
            )
          ).rows[0]?.t;
          const agreementId = tin ? await chonThoaThuan(tx) : null;
          if (!agreementId) throw new FeedRefused(API_ERRORS.agreementInactive);
          await hooks.truocKhiGhi?.();
          return ghiGoi(tx, feed, agreementId);
        });
        return c.json({ ...demGoi(feed), created, updated }, 200);
      } catch (e) {
        if (e instanceof FeedRefused) return tra(c, e.entry);
        // Luật theo dòng từ chối câu ghi: thoả thuận hết hiệu lực giữa lúc kiểm và lúc ghi.
        if ((e as { code?: string }).code === "42501") return tra(c, API_ERRORS.agreementInactive);
        throw e;
      }
    },
  );
}
