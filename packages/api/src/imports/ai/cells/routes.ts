import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { mayFlow } from "@quy-hang/core";
import { FIELD_CLASS, kiemDeXuatOLa, kiemKhuonGoiOLa, loaiTrungOLa, quetGoiOLa, type GoiOLa } from "@quy-hang/core/import";
import type { Context } from "hono";
import type { ApiDeps } from "../../../app";
import { withCompany } from "../../../db";
import { API_ERRORS, type ApiErrorEntry } from "../../../errors";
import { khachOLaMacDinh, LoiAi, MO_HINH_O_LA, TRAN_MS, type KhachOLa, type TraLoiAi } from "../claude";
import { tinhTien } from "../gia";
import { dungVao, laQuaGio, LY_DO } from "../routes";
import { docTinhTrang, ghiDongAi, thoaThuanMo, VAI_GOI, type DongAi, type ThoaThuanAi } from "../store";

/**
 * Ô lạ còn lại (hàng 69, Kiến trúc «Nhập dữ liệu» §5): `POST /api/v1/imports/ai/cells` nhận gói ô lạ dựng trên trình duyệt,
 * đi cùng các cửa của đường đề xuất cột theo đúng thứ tự — phiên → khuôn → vai → thoả thuận → lớp mở → khoá → trần → quét lại
 * — rồi gọi Claude một lần, ghi `ai_usage`, kiểm nghĩa từng đề xuất. Mọi ca không dùng được AI trả 200 «tất định» kèm lý do;
 * đường này không ghi gì ngoài `ai_usage` (không lần nhập, không hàng).
 */
const PATH = "/api/v1/imports/ai/cells";
const LUONG = { kind: "ai_processing", direction: "outbound" } as const;

const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const KetQua = z.union([
  z.object({
    cheDo: z.literal("ai"),
    deXuat: z.array(z.object({ id: z.string(), giaTri: z.string(), lyDo: z.string() })),
    loi: z.array(z.object({ id: z.string().nullable(), lyDo: z.string() })),
  }),
  z.object({ cheDo: z.literal("tat-dinh"), lyDo: z.string() }),
]);

/** Mọi ô mang trường thuộc lớp mà thoả thuận đang mở. */
const lopQuaThoaThuan = (goi: GoiOLa, t: ThoaThuanAi, at: Date) => goi.o.every((o) => mayFlow(t, FIELD_CLASS[o.truong], { at, ...LUONG }).ok);

/** Ngày hôm nay `YYYY-MM-DD` theo giờ Việt Nam — ngữ cảnh của bộ chuẩn hoá khi kiểm đề xuất. */
const homNay = (d: Date) => new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);

export function registerOLaRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const vao = dungVao(deps);
  const khach = (): KhachOLa | null => (deps.khachOLa === undefined ? khachOLaMacDinh() : deps.khachOLa);
  const tra = (c: Context, l: ApiErrorEntry, reason?: string) => c.json({ error: l.code, ...(reason && { reason }) }, l.status as 400);
  const tatDinh = (c: Context, lyDo: string) => c.json({ cheDo: "tat-dinh" as const, lyDo }, 200);

  api.openapi(
    createRoute({
      method: "post",
      path: PATH,
      summary: "Đề xuất cho các ô máy chưa đọc được — gói đã lọc; không dùng được AI thì trả chế độ tất định kèm lý do",
      request: { body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: {
        200: { description: "Đề xuất hay lý do tất định", content: { "application/json": { schema: KetQua } } },
        400: err("Gói sai khuôn"),
        401: err("Chưa đăng nhập"),
        403: err("Không đúng vai, hay chưa thuộc sàn nào"),
        409: err("Chọn sàn"),
      },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const k = kiemKhuonGoiOLa(await c.req.json().catch(() => null));
      if ("loi" in k) return tra(c, API_ERRORS.invalidPayload, k.loi);
      const goi = k.goi;
      const tt = await withCompany(deps.appPool, ctx, docTinhTrang);
      if (!tt.vai.some((v) => VAI_GOI.includes(v))) return tra(c, API_ERRORS.importRoleRequired);
      if (!tt.thoaThuan) return tatDinh(c, LY_DO.chuaBat);
      if (tt.thoaThuan.status !== "active") return tatDinh(c, LY_DO.tamNgung);
      if (!thoaThuanMo(tt.thoaThuan, tt.at)) return tatDinh(c, LY_DO.hetHieuLuc);
      if (!lopQuaThoaThuan(goi, tt.thoaThuan, tt.at)) return tra(c, API_ERRORS.invalidPayload, "ô ngoài lớp thoả thuận mở");
      const goiAi = khach();
      if (!goiAi) return tatDinh(c, LY_DO.thieuKhoa);
      if (tt.daDungUsd >= tt.tranUsd) return tatDinh(c, LY_DO.hetTran);
      const ghi = (d: Omit<DongAi, "userId">) => withCompany(deps.appPool, ctx, (tx) => ghiDongAi(tx, { ...d, userId: ctx.userId }));

      // Chặn lần hai: trúng là không gửi, sổ chỉ ghi LOẠI trúng.
      const trung = quetGoiOLa(goi);
      if (trung.length) {
        await ghi({ model: MO_HINH_O_LA, costUsd: 0, durationMs: 0, result: "blocked_pii", blockedKinds: loaiTrungOLa(trung) });
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
        const model = (e instanceof LoiAi && e.model) || MO_HINH_O_LA;
        await ghi({
          model,
          ...(u && { usage: u }),
          costUsd: u ? tinhTien(u, model) : 0,
          durationMs: performance.now() - batDau,
          result: quaGio ? "timeout" : saiKhuon ? "invalid_output" : "provider_error",
        });
        return tatDinh(c, quaGio ? LY_DO.quaGio : saiKhuon ? LY_DO.saiKhuon : LY_DO.loi);
      }
      const kq = kiemDeXuatOLa(goi, tl.json, homNay(tt.at));
      const hongGoc = kq.loi.some((l) => l.id === null && l.lyDo === "đầu ra sai khuôn");
      await ghi({ model: tl.model, usage: tl.usage, costUsd: tinhTien(tl.usage, tl.model), durationMs: performance.now() - batDau, result: hongGoc ? "invalid_output" : "ok" });
      if (hongGoc) return tatDinh(c, LY_DO.saiKhuon);
      return c.json({ cheDo: "ai" as const, deXuat: kq.deXuat, loi: kq.loi }, 200);
    },
  );
}
