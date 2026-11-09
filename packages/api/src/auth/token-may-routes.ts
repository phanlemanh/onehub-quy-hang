import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { MACHINE_TOKEN_LIMIT, machineTokenAllowed, mayFlow, type Agreement } from "@quy-hang/core";
import type { Context } from "hono";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { quanTriSan } from "./quan-tri-san";
import { taoToken } from "./token-may";

/**
 * Quản lý token máy của một thoả thuận (hàng 96, ADR-0015 sửa đổi 09/11): quản trị sàn cấp, đọc, thu hồi bằng API; màn ở
 * hàng 98. Đọc và thu hồi chạy ở mọi trạng thái của thoả thuận: token lộ lúc thoả thuận đang tạm dừng vẫn thu hồi được.
 */
const PATH = "/api/v1/agreements/{agreementId}/machine-tokens";

const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const Params = z.object({ agreementId: z.string() });
const ParamsToken = Params.extend({ tokenId: z.string() });
const TokenMoi = z
  .object({ id: z.string(), token: z.string(), displayPrefix: z.string(), createdAt: z.string() })
  .openapi("MachineTokenCreated");
const TokenDong = z
  .object({ id: z.string(), displayPrefix: z.string(), createdAt: z.string(), revokedAt: z.string().nullable() })
  .openapi("MachineToken");

// Đường dẫn là chuỗi tự do: id sai dạng phải ra 404 như id không có, không 500 ở câu ép kiểu uuid.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ThoaThuanDong = Pick<Agreement, "id" | "companyId" | "kind" | "direction" | "counterparty" | "dataClasses" | "validFrom" | "validUntil" | "status" | "approvedBy" | "specialTerms">;

/**
 * Thoả thuận của chính sàn đang làm. Luật theo dòng cho bên kia của thoả thuận hợp tác đọc được dòng, nên phải lọc thêm
 * `company_id`: bên kia không được quản lý token của thoả thuận này. `khoa`: giữ dòng để hai lời cấp song song không vượt
 * trần; `no key update` không đụng khoá của các câu ghi danh mục.
 */
async function docThoaThuan(tx: pg.PoolClient, id: string, khoa: boolean): Promise<ThoaThuanDong | null> {
  if (!UUID.test(id)) return null;
  const { rows } = await tx.query<{
    id: string;
    company_id: string;
    kind: Agreement["kind"];
    direction: Agreement["direction"];
    counterparty: string;
    data_classes: Agreement["dataClasses"];
    valid_from: Date;
    valid_until: Date | null;
    status: Agreement["status"];
    approved_by: string;
    special_terms: boolean;
  }>(
    `select id, company_id, kind, direction, counterparty, data_classes, valid_from, valid_until, status, approved_by, special_terms
     from agreements where id = $1 and company_id = app.current_company_id()${khoa ? " for no key update" : ""}`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    companyId: r.company_id,
    kind: r.kind,
    direction: r.direction,
    counterparty: r.counterparty,
    dataClasses: r.data_classes,
    validFrom: r.valid_from,
    validUntil: r.valid_until,
    status: r.status,
    approvedBy: r.approved_by,
    specialTerms: r.special_terms,
  };
}

export function registerMachineTokenRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool } = deps;
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 403);

  api.openapi(
    createRoute({
      method: "post",
      path: PATH,
      summary: "Cấp một token máy cho thoả thuận — token rõ chỉ hiện ở phản hồi này",
      request: { params: Params },
      responses: {
        201: { description: "Đã cấp", content: { "application/json": { schema: TokenMoi } } },
        400: err("Loại kết nối hay chiều không cấp được token"),
        401: err("Chưa đăng nhập"),
        403: err("Cần quản trị sàn, hoặc thoả thuận không hiệu lực"),
        404: err("Thoả thuận không thuộc sàn"),
        409: err("Thuộc nhiều sàn chưa chọn, hoặc đã đủ số token còn sống"),
      },
    }),
    async (c) => {
      const q = await quanTriSan(c, deps);
      if ("status" in q) return tra(c, q);
      const { agreementId } = c.req.valid("param");
      const kq = await withCompany(appPool, q, async (tx) => {
        const a = await docThoaThuan(tx, agreementId, true);
        if (!a) return API_ERRORS.notFound;
        if (!machineTokenAllowed(a.kind, a.direction)) return API_ERRORS.tokenKindNotSupported;
        const at = (await tx.query<{ now: Date }>("select now() as now")).rows[0]!.now;
        if (!mayFlow(a, "catalog", { at, kind: a.kind, direction: a.direction }).ok) return API_ERRORS.agreementInactive;
        const { rows } = await tx.query<{ n: number }>(
          "select count(*)::int as n from machine_tokens where agreement_id = $1 and revoked_at is null",
          [a.id],
        );
        if ((rows[0]?.n ?? 0) >= MACHINE_TOKEN_LIMIT) return API_ERRORS.tokenLimitReached;
        const moi = taoToken();
        const ghi = await tx.query<{ id: string; created_at: Date }>(
          `insert into machine_tokens (company_id, agreement_id, token_hash, display_prefix, created_by)
           values (app.current_company_id(), $1, $2, $3, $4) returning id, created_at`,
          [a.id, moi.hash, moi.displayPrefix, q.userId],
        );
        return { id: ghi.rows[0]!.id, token: moi.token, displayPrefix: moi.displayPrefix, createdAt: ghi.rows[0]!.created_at.toISOString() };
      });
      if ("status" in kq) return tra(c, kq);
      c.header("Cache-Control", "no-store");
      return c.json(kq, 201);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: PATH,
      summary: "Danh sách token máy của thoả thuận — không có token rõ, không có băm",
      request: { params: Params },
      responses: {
        200: { description: "Danh sách", content: { "application/json": { schema: z.object({ tokens: z.array(TokenDong) }) } } },
        401: err("Chưa đăng nhập"),
        403: err("Cần quản trị sàn"),
        404: err("Thoả thuận không thuộc sàn"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
      },
    }),
    async (c) => {
      const q = await quanTriSan(c, deps);
      if ("status" in q) return tra(c, q);
      const { agreementId } = c.req.valid("param");
      const kq = await withCompany(appPool, q, async (tx) => {
        const a = await docThoaThuan(tx, agreementId, false);
        if (!a) return null;
        const { rows } = await tx.query<{ id: string; display_prefix: string; created_at: Date; revoked_at: Date | null }>(
          "select id, display_prefix, created_at, revoked_at from machine_tokens where agreement_id = $1 order by created_at desc, id",
          [a.id],
        );
        return rows;
      });
      if (!kq) return tra(c, API_ERRORS.notFound);
      return c.json(
        {
          tokens: kq.map((r) => ({
            id: r.id,
            displayPrefix: r.display_prefix,
            createdAt: r.created_at.toISOString(),
            revokedAt: r.revoked_at?.toISOString() ?? null,
          })),
        },
        200,
      );
    },
  );

  api.openapi(
    createRoute({
      method: "delete",
      path: `${PATH}/{tokenId}`,
      summary: "Thu hồi một token máy — gọi lại vẫn 204, giữ nguyên mốc cũ",
      request: { params: ParamsToken },
      responses: {
        204: { description: "Đã thu hồi" },
        401: err("Chưa đăng nhập"),
        403: err("Cần quản trị sàn"),
        404: err("Thoả thuận hay token không có"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
      },
    }),
    async (c) => {
      const q = await quanTriSan(c, deps);
      if ("status" in q) return tra(c, q);
      const { agreementId, tokenId } = c.req.valid("param");
      const coToken = await withCompany(appPool, q, async (tx) => {
        const a = await docThoaThuan(tx, agreementId, false);
        if (!a || !UUID.test(tokenId)) return false;
        const sua = await tx.query(
          `update machine_tokens set revoked_at = now(), revoked_by = $3
           where id = $1 and agreement_id = $2 and revoked_at is null`,
          [tokenId, a.id, q.userId],
        );
        if ((sua.rowCount ?? 0) > 0) return true;
        // Không sửa dòng nào: hoặc đã thu hồi từ trước (vẫn 204), hoặc không có token này trên thoả thuận.
        const doc = await tx.query("select 1 from machine_tokens where id = $1 and agreement_id = $2", [tokenId, a.id]);
        return (doc.rowCount ?? 0) > 0;
      });
      if (!coToken) return tra(c, API_ERRORS.notFound);
      return c.body(null, 204);
    },
  );
}
