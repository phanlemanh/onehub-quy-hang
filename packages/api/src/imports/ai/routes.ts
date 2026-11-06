import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { kiemDeXuat, kiemKhuonGoi, loaiTrung, quetGoi, type KetQuaDeXuat } from "@quy-hang/core/import";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../../app";
import { resolveCompany } from "../../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../../auth/constants";
import { withCompany } from "../../db";
import { API_ERRORS, type ApiErrorEntry } from "../../errors";
import { khachMacDinh, LoiAi, MO_HINH, TRAN_MS, type KhachAi, type TraLoiAi } from "./claude";
import { tinhTien } from "./gia";
import { batTat, docTinhTrang, ghiDongAi, giaTriQuaThoaThuan, thoaThuanMo, VAI_GOI, type DongAi } from "./store";

/**
 * «Xử lý bằng AI» (hàng 68, ADR-0011 quyết định 1–5, 10, 11). `POST /plan` nhận gói đề xuất (hồ sơ cột đã che, dựng trên
 * trình duyệt), đi qua cửa — khuôn → vai → thoả thuận → khoá → trần → quét lại dữ liệu cá nhân — rồi mới gọi Claude một
 * lần; mọi ca không dùng được AI trả 200 «tất định» kèm một câu lý do để màn ghép như hàng 65. `GET` cho màn biết trạng
 * thái; `PUT /agreement` cho Quản trị sàn bật, tắt.
 */
const BASE = "/api/v1/imports/ai";

export const LY_DO = {
  chuaBat: "Sàn chưa bật Xử lý bằng AI",
  tamNgung: "Xử lý bằng AI đang tạm ngừng",
  hetHieuLuc: "Thoả thuận Xử lý bằng AI chưa hay hết hiệu lực",
  thieuKhoa: "AI chưa sẵn sàng trên máy chủ",
  hetTran: "Hết trần AI tháng này",
  loi: "AI đang lỗi, thử lại sau",
  quaGio: "AI trả lời quá lâu",
  saiKhuon: "AI trả lời sai khuôn",
  chan: "Gói có dữ liệu cá nhân — không gửi",
} as const;

const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = { 400: err("Gói sai khuôn"), 401: err("Chưa đăng nhập"), 403: err("Không đúng vai, hay chưa thuộc sàn nào"), 409: err("Chọn sàn") };

const KetQua = z.union([
  z.object({
    cheDo: z.literal("ai"),
    deXuat: z.array(z.object({ cot: z.number(), target: z.string(), transform: z.unknown().optional(), valueMap: z.record(z.string()).optional(), lyDo: z.string() })),
    loi: z.array(z.object({ cot: z.number().nullable(), lyDo: z.string() })),
  }),
  z.object({ cheDo: z.literal("tat-dinh"), lyDo: z.string() }),
]);
const TrangThai = z.object({
  bat: z.boolean(),
  tamNgung: z.boolean(),
  sanSang: z.boolean(),
  conTran: z.boolean(),
  tranThangUsd: z.number(),
  daDungUsd: z.number().nullable(),
  laQuanTri: z.boolean(),
});

const laQuaGio = (e: unknown) => e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");

export function registerAiRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, auth } = deps;
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const khach = (): KhachAi | null => (deps.khachAi === undefined ? khachMacDinh() : deps.khachAi);
  const tra = (c: Context, l: ApiErrorEntry, reason?: string) => c.json({ error: l.code, ...(reason && { reason }) }, l.status as 400);
  const tatDinh = (c: Context, lyDo: string) => c.json({ cheDo: "tat-dinh" as const, lyDo }, 200);

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/plan`,
      summary: "Đề xuất ghép cho các cột chưa ghép — gói đã che; không dùng được AI thì trả chế độ tất định kèm lý do",
      request: { body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: { 200: ok("Đề xuất hay lý do tất định", KetQua), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const k = kiemKhuonGoi(await c.req.json().catch(() => null));
      if ("loi" in k) return tra(c, API_ERRORS.invalidPayload, k.loi);
      const goi = k.goi;
      const tt = await withCompany(appPool, ctx, docTinhTrang);
      if (!tt.vai.some((v) => VAI_GOI.includes(v))) return tra(c, API_ERRORS.importRoleRequired);
      if (!tt.thoaThuan) return tatDinh(c, LY_DO.chuaBat);
      if (tt.thoaThuan.status !== "active") return tatDinh(c, LY_DO.tamNgung);
      if (!thoaThuanMo(tt.thoaThuan, tt.at)) return tatDinh(c, LY_DO.hetHieuLuc);
      if (!giaTriQuaThoaThuan(goi, tt.thoaThuan, tt.at)) return tra(c, API_ERRORS.invalidPayload, "giá trị ngoài lớp thoả thuận mở");
      const goiAi = khach();
      if (!goiAi) return tatDinh(c, LY_DO.thieuKhoa);
      if (tt.daDungUsd >= tt.tranUsd) return tatDinh(c, LY_DO.hetTran);
      const ghi = (d: Omit<DongAi, "userId">) => withCompany(appPool, ctx, (tx) => ghiDongAi(tx, { ...d, userId: ctx.userId }));

      // Chặn lần hai: trúng là không gửi, sổ chỉ ghi LOẠI trúng.
      const trung = quetGoi(goi);
      if (trung.length) {
        await ghi({ model: MO_HINH, costUsd: 0, durationMs: 0, result: "blocked_pii", blockedKinds: loaiTrung(trung) });
        return tatDinh(c, LY_DO.chan);
      }

      const batDau = performance.now();
      let tl: TraLoiAi;
      try {
        tl = await goiAi(goi, AbortSignal.timeout(TRAN_MS));
      } catch (e) {
        const quaGio = laQuaGio(e);
        const saiKhuon = e instanceof LoiAi && e.loai === "invalid_output";
        const u = e instanceof LoiAi ? e.usage : undefined;
        await ghi({
          model: (e instanceof LoiAi && e.model) || MO_HINH,
          ...(u && { usage: u }),
          costUsd: u ? tinhTien(u) : 0,
          durationMs: performance.now() - batDau,
          result: quaGio ? "timeout" : saiKhuon ? "invalid_output" : "provider_error",
        });
        return tatDinh(c, quaGio ? LY_DO.quaGio : saiKhuon ? LY_DO.saiKhuon : LY_DO.loi);
      }
      const kq: KetQuaDeXuat = kiemDeXuat(goi, tl.json);
      const hongGoc = kq.loi.some((l) => l.cot === null && /sai khuôn/.test(l.lyDo));
      await ghi({ model: tl.model, usage: tl.usage, costUsd: tinhTien(tl.usage), durationMs: performance.now() - batDau, result: hongGoc ? "invalid_output" : "ok" });
      if (hongGoc) return tatDinh(c, LY_DO.saiKhuon);
      return c.json({ cheDo: "ai" as const, deXuat: kq.deXuat, loi: kq.loi }, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: BASE,
      summary: "Trạng thái Xử lý bằng AI của sàn đang làm — tiền đã dùng chỉ hiện cho Quản trị sàn",
      responses: { 200: ok("Trạng thái", TrangThai), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const tt = await withCompany(appPool, ctx, docTinhTrang);
      const laQuanTri = tt.vai.includes("company_admin");
      return c.json(
        {
          bat: !!tt.thoaThuan && thoaThuanMo(tt.thoaThuan, tt.at),
          tamNgung: !!tt.thoaThuan && tt.thoaThuan.status !== "active",
          sanSang: khach() !== null,
          conTran: tt.daDungUsd < tt.tranUsd,
          tranThangUsd: tt.tranUsd,
          daDungUsd: laQuanTri ? tt.daDungUsd : null,
          laQuanTri,
        },
        200,
      );
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: `${BASE}/agreement`,
      summary: "Quản trị sàn bật hay tắt Xử lý bằng AI (thoả thuận ai_processing)",
      request: { body: { content: { "application/json": { schema: z.object({ bat: z.boolean() }).strict() } } } },
      responses: { 204: { description: "Đã đổi" }, ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { bat } = c.req.valid("json");
      const r = await withCompany(appPool, ctx, async (tx) => {
        const tt = await docTinhTrang(tx);
        if (!tt.vai.includes("company_admin")) return API_ERRORS.adminRequired;
        await batTat(tx, ctx.userId, bat);
        return null;
      });
      if (r) return tra(c, r);
      return c.body(null, 204);
    },
  );
}
