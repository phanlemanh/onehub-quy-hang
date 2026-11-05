import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import type pg from "pg";
import { withCompany } from "../../db";
import { API_ERRORS, type ApiErrorEntry } from "../../errors";
import { isRefusal, type Refusal } from "../store";
import { lamGoiHoanTac, lanNhapCuaToi, xemHoanTac } from "./store";

/**
 * Đường hoàn tác cả lần nhập (hàng 66): xem thử (chỉ đọc) hay ghi theo gói, mỗi gói một giao dịch — đứt giữa chừng thì
 * phần đã làm giữ nguyên, trả `import-undo-incomplete` để người bấm lại; gọi lại chỉ làm dòng chưa có kết cục.
 */

const BASE = "/api/v1/imports";
const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn, hoặc không phải Đầu chủ hay Trưởng nhóm"),
  404: err("Không có lần nhập đã ghi này của người gọi ở sàn đang làm"),
  409: err("Chọn sàn"),
  503: err("Hoàn tác đứt giữa chừng — phần đã làm giữ nguyên, gọi lại để làm tiếp"),
};
const KetQua = z.object({
  importId: z.string(),
  status: z.enum(["committed", "undone"]),
  go: z.number(),
  traGia: z.number(),
  khongDuoc: z.number(),
  danhSach: z.array(z.object({ rowNumber: z.number(), buildingName: z.string().nullable(), unitNumber: z.string().nullable(), lyDo: z.string() })),
});
const LanNhap = z.object({ id: z.string(), fileName: z.string(), createdAt: z.string(), status: z.enum(["committed", "undone"]), soDongGhi: z.number() });
const UndoBody = z.object({ dryRun: z.boolean().optional() }).strict();

type Vao = (c: Context) => Promise<{ userId: string; companyId: string } | ApiErrorEntry>;

/** Móc thử của bộ kiểm (E6): đứt sau đúng số dòng — chỉ đọc khi chạy test. */
const dutThu = (): { con: number } | undefined => {
  const n = process.env.NODE_ENV === "test" ? Number(process.env.QH_THU_DUT_HOAN_TAC_SAU) : NaN;
  return Number.isInteger(n) && n >= 0 ? { con: n } : undefined;
};

export function registerUndoRoutes(api: OpenAPIHono, appPool: pg.Pool, vao: Vao) {
  const tra = (c: Context, r: Refusal) => c.json({ error: r.error.code }, r.error.status as 400);

  api.openapi(
    createRoute({ method: "get", path: BASE, summary: "Lần nhập đã ghi của người gọi, mới nhất trước (tối đa 10)", responses: { 200: ok("Lần nhập", z.array(LanNhap)), ...loi } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400) as never;
      const kq = await withCompany(appPool, ctx, (tx) => lanNhapCuaToi(tx));
      if (isRefusal(kq)) return tra(c, kq) as never;
      return c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/{importId}/undo`,
      summary: "Hoàn tác cả lần nhập: xem thử (không ghi) hay ghi; gọi lại chỉ làm dòng chưa làm",
      request: { params: z.object({ importId: z.string() }), body: { content: { "application/json": { schema: UndoBody } } } },
      responses: { 200: ok("Kết quả hoàn tác", KetQua), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400) as never;
      const { importId } = c.req.valid("param");
      if (!c.req.valid("json").dryRun) {
        const dut = dutThu();
        for (;;) {
          const n = await withCompany(appPool, ctx, (tx) => lamGoiHoanTac(tx, importId, dut ? { dutSau: dut } : {})).catch(() => null);
          if (n === null) return tra(c, { error: API_ERRORS.importUndoIncomplete }) as never;
          if (isRefusal(n)) return tra(c, n) as never;
          if (typeof n === "object") return tra(c, { error: API_ERRORS.importUndoIncomplete }) as never;
          if (n === 0) break;
        }
      }
      const kq = await withCompany(appPool, ctx, (tx) => xemHoanTac(tx, importId));
      if (isRefusal(kq)) return tra(c, kq) as never;
      return c.json(kq, 200);
    },
  );
}
