/**
 * Máy đang đăng nhập và «Báo mất máy» (hàng 38, tab Tôi). Phiên là của better-auth (ADR-0005): đọc và thu qua API của nó
 * trong tiến trình. «Báo mất máy» (Hỏi-1: một nút) thu mọi phiên khác của người, ghi dấu cho từng phiên bị thu
 * (`auth/may-bi-bao.ts`), và ở mọi sàn người là thành viên: gửi tin «xoá máy» tới từng đăng ký thông báo khác máy đang
 * bấm rồi mới gỡ nó (Hỏi-3). Gửi hỏng không chặn việc thu phiên và gỡ đăng ký.
 */
import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { PushPayload } from "@quy-hang/core/push";
import { loaiMay, trinhDuyet } from "@quy-hang/core/thiet-bi";
import type { ApiDeps } from "../app";
import { listCompanies } from "../auth/company";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { loiLuat } from "../auth/dang-nhap-mat-khau";
import { ghiDau } from "../auth/may-bi-bao";
import { chuanHoa, kiemMatKhau } from "../auth/mat-khau";
import { SAI_TOI_DA } from "../auth/constants";
import { coMatKhauDung, datTuDoi, demSai, docTheoNguoi, ghiSai, thuPhien, voHieuBaoMat, xoaChuoiSai } from "../auth/trang-thai-mat-khau";
import { withCompany } from "../db";
import { API_ERRORS } from "../errors";
import { khoaSoChu } from "../owners/khoa";
import { webPushSender } from "../push/gui";
import { khoaVapid } from "../push/khoa-vapid";
import { goDangKy } from "../push/store";

const BASE = "/api/v1/me/devices";

const Device = z
  .object({
    id: z.string(),
    kind: z.enum(["iphone", "android", "may-tinh", "khac"]),
    browser: z.string(),
    lastUsedAt: z.string(),
    current: z.boolean(),
  })
  .openapi("Device");
const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const BaoMat = z.object({ pushEndpoint: z.string().max(2048).optional() }).strict();

/** Tin «xoá máy»: đúng bốn khoá của hộp thư đẩy; mã người đi trong đường để service worker biết xoá kho nào. */
export const tinXoaMay = (userId: string): PushPayload => ({
  title: "Quỹ hàng",
  body: "Quỹ hàng đã đăng xuất trên máy này",
  url: `/login?bi-bao-mat=1&u=${encodeURIComponent(userId)}`,
  tag: "xoa-may",
});

type PhienBa = { id: string; token: string; userAgent?: string | null; updatedAt: Date | string; expiresAt: Date | string };

export function registerDeviceRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, identityPool, auth } = deps;

  async function doc(headers: Headers) {
    const phien = await auth.api.getSession({ headers });
    if (!phien) return null;
    const ds = ((await auth.api.listSessions({ headers })) as PhienBa[]).filter((s) => new Date(s.expiresAt) > new Date());
    return { userId: phien.user.id, token: phien.session.token, ds };
  }

  api.openapi(
    createRoute({
      method: "get",
      path: BASE,
      summary: "Máy đang đăng nhập của người — không trả mã phiên",
      responses: {
        200: { description: "Danh sách máy", content: { "application/json": { schema: z.object({ devices: z.array(Device) }) } } },
        401: err("Chưa đăng nhập"),
      },
    }),
    async (c) => {
      const v = await doc(c.req.raw.headers);
      if (!v) return c.json({ error: API_ERRORS.unauthenticated.code }, 401);
      const devices = v.ds.map((s) => ({
        id: s.id,
        kind: loaiMay(s.userAgent),
        browser: trinhDuyet(s.userAgent),
        lastUsedAt: new Date(s.updatedAt).toISOString(),
        current: s.token === v.token,
      }));
      return c.json({ devices }, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/report-lost`,
      summary: "Báo mất máy: đăng xuất mọi máy khác, gửi lệnh xoá rồi gỡ thông báo của các máy ấy ở mọi sàn",
      request: { body: { content: { "application/json": { schema: BaoMat } }, required: false } },
      responses: {
        200: { description: "Đã báo", content: { "application/json": { schema: z.object({ revoked: z.number() }) } } },
        401: err("Chưa đăng nhập"),
      },
    }),
    async (c) => {
      const headers = c.req.raw.headers;
      const v = await doc(headers);
      if (!v) return c.json({ error: API_ERRORS.unauthenticated.code }, 401);
      const than = BaoMat.safeParse(await c.req.json().catch(() => ({})));
      const giu = than.success ? than.data.pushEndpoint : undefined;
      const khac = v.ds.filter((s) => s.token !== v.token).map((s) => s.token);

      await ghiDau(identityPool, { tokens: khac, userId: v.userId, now: new Date() });
      const gui = deps.pushSender ?? webPushSender;
      for (const san of await listCompanies(appPool, v.userId)) {
        await withCompany(appPool, { userId: v.userId, companyId: san.id }, async (tx) => {
          const { rows } = await tx.query<{ endpoint: string; p256dh: string; auth: string }>(
            "select endpoint, p256dh, auth from push_subscriptions where user_id = app.current_user_id() and ($1::text is null or endpoint <> $1)",
            [giu ?? null],
          );
          if (rows.length === 0) return;
          const vapid = await khoaVapid(tx, khoaSoChu()).catch((e: unknown) => {
            console.error("báo mất máy: không dựng được khoá đẩy", e instanceof Error ? e.message.slice(0, 200) : "");
            return null;
          });
          for (const r of rows) {
            if (vapid) {
              const kq = await gui({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, tinXoaMay(v.userId), vapid).catch(
                (e: unknown) => ({ ok: false as const, error: e instanceof Error ? e.message : "lỗi gửi" }),
              );
              if (!kq.ok) console.error("báo mất máy: gửi lệnh xoá hỏng", kq.error.slice(0, 200));
            }
            await goDangKy(tx, r.endpoint);
          }
        });
      }
      // Máy mất có thể đang nhớ mật khẩu: mật khẩu thôi dùng, người vào lại bằng mã rồi đặt mới (dang-nhap-mat-khau).
      await voHieuBaoMat(identityPool, v.userId);
      if (khac.length > 0) await auth.api.revokeOtherSessions({ headers });
      return c.json({ revoked: khac.length }, 200);
    },
  );

  // Đặt hay đổi mật khẩu của chính mình (dang-nhap-mat-khau, AC-7). Có mật khẩu dùng được thì phải đúng mật khẩu hiện
  // tại; chưa có, mật khẩu tạm hay đã vô hiệu thì đặt không cần — người đã vào bằng mã. Thu mọi phiên khác, giữ phiên này.
  // Thân mang mật khẩu: đọc tay, không in.
  api.put("/api/v1/me/password", async (c) => {
    const headers = c.req.raw.headers;
    const phien = await auth.api.getSession({ headers });
    if (!phien) return c.json({ error: API_ERRORS.unauthenticated.code }, 401);
    const than: unknown = await c.req.json().catch(() => null);
    const moi = (than as { newPassword?: unknown } | null)?.newPassword;
    const hienTai = (than as { currentPassword?: unknown } | null)?.currentPassword;
    if (typeof moi !== "string" || moi.length > 1024 || (hienTai !== undefined && typeof hienTai !== "string")) {
      return c.json({ error: API_ERRORS.invalidPayload.code }, 400);
    }
    const tk = await docTheoNguoi(identityPool, phien.user.id);
    if (tk && coMatKhauDung(tk)) {
      // Cùng bộ đếm với đăng nhập (va-dang-nhap-mat-khau): cửa sổ theo email, chuỗi sai của tài khoản; đủ 5 lần trong
      // cửa sổ thì chờ, kể cả khi mật khẩu hiện tại đúng.
      if ((await demSai(identityPool, tk.email)) >= SAI_TOI_DA) return c.json({ error: API_ERRORS.passwordRateLimited.code }, 429);
      const dung = typeof hienTai === "string" && hienTai.length <= 1024 && (await verifyPassword({ hash: tk.hash!, password: chuanHoa(hienTai) }));
      if (!dung) {
        await ghiSai(identityPool, tk.email, tk.userId);
        return c.json({ error: API_ERRORS.invalidCurrentPassword.code }, 403);
      }
      await xoaChuoiSai(identityPool, tk.userId);
    }
    const pw = chuanHoa(moi);
    const kq = kiemMatKhau(pw, phien.user.email);
    if (!kq.ok) {
      const l = loiLuat(kq.code);
      return c.json({ error: l.code }, l.status as 400);
    }
    await datTuDoi(identityPool, { userId: phien.user.id, hash: await hashPassword(pw) });
    await thuPhien(identityPool, phien.user.id, phien.session.token);
    return c.json({ password: "co" as const }, 200);
  });
}
