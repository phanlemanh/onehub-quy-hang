import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { createHash, timingSafeEqual } from "node:crypto";
import type { ApiDeps } from "../app";
import { API_ERRORS } from "../errors";
import { runLeadTick } from "./lead-tick";

/**
 * Lối việc nền (hàng 25, ADR-0017): ai cầm khoá `JOB_SECRET` gọi mỗi phút — trên bản thật là lịch pg_cron + pg_net của
 * Supabase (Hỏi-1). Thiếu khoá phía máy chủ → 503, sai khoá → 401. Kết quả chỉ là số đếm, không dữ liệu của sàn nào.
 */
const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const Tick = z.object({ companies: z.number(), routed: z.number(), alerts: z.number(), failed: z.number() });

/** So khoá theo thời gian hằng: băm hai bên cho cùng độ dài. */
const khop = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export function registerJobRoutes(api: OpenAPIHono, { appPool, jobSecret }: ApiDeps) {
  api.openapi(
    createRoute({
      method: "post",
      path: "/api/v1/jobs/lead-tick",
      summary: "Một nhịp chia lead và xét hạn cho mọi sàn — cần khoá việc nền",
      responses: {
        200: { description: "Đã chạy", content: { "application/json": { schema: Tick } } },
        401: err("Thiếu hay sai khoá"),
        503: err("Máy chủ chưa đặt khoá việc nền"),
      },
    }),
    async (c) => {
      if (!jobSecret) return c.json({ error: API_ERRORS.jobSecretMissing.code }, 503);
      const m = /^Bearer (.+)$/.exec(c.req.header("authorization") ?? "");
      if (!m || !khop(m[1]!, jobSecret)) return c.json({ error: API_ERRORS.badJobSecret.code }, 401);
      return c.json(await runLeadTick(appPool, new Date()), 200);
    },
  );
}
