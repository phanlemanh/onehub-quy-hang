import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import { COMPARTMENTS, loaiTuByteDau, type Compartment } from "@quy-hang/core/photos";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { chonKhoAnh, type KhoAnh, type KhoAnhVang } from "./kho";
import { addPhoto, isRefusal, listPhotos, patchPhoto, readPhoto, removePhoto, type Refusal, type SuaVao } from "./store";

/**
 * Ảnh căn ba ngăn (hàng 18, ADR-0014): `/api/v1/units/photos`. Không đi qua bộ đồng bộ; ngăn nội bộ trả no-store; link tới
 * kho ảnh chỉ ký sau khi đọc được dòng ảnh dưới luật theo dòng. Ẩn ở cơ sở dữ liệu và ở đây, không ở giao diện.
 */
const BASE = "/api/v1/units/photos";
const NGAY = /^\d{4}-\d{2}-\d{2}$/;

export function registerPhotoRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps, khoTruyen?: KhoAnh | KhoAnhVang) {
  const kho = khoTruyen ?? chonKhoAnh();
  if (kho.ten === "vang") console.error(kho.lyDo);

  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }

  /** Một lệnh trong giao dịch của sàn đang làm; bị từ chối thì huỷ giao dịch. */
  async function chay<T extends object>(c: Context, fn: (tx: pg.PoolClient, ctx: { companyId: string }, kho: KhoAnh) => Promise<T | Refusal>, ra: (c: Context, kq: T) => Response = (c, kq) => c.json(kq, 200)) {
    const ctx = await vao(c);
    if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400);
    if (kho.ten === "vang") return c.json({ error: API_ERRORS.photoStorageMissing.code }, 503);
    const k = kho;
    const kq = await withCompany(appPool, ctx, async (tx) => {
      const r = await fn(tx, ctx, k);
      if (isRefusal(r)) throw r;
      return r;
    }).catch((e: unknown) => {
      if (isRefusal(e)) return e;
      throw e;
    });
    if (isRefusal(kq)) return c.json({ error: kq.error.code }, kq.error.status as 400);
    return ra(c, kq);
  }

  api.get(BASE, (c) => {
    const toa = c.req.query("toa")?.trim() ?? "";
    const ma = c.req.query("ma")?.trim() ?? "";
    if (!toa || !ma) return c.json({ error: API_ERRORS.invalidPayload.code }, 400);
    return chay(c, (tx) => listPhotos(tx, toa, ma), (c, kq) => {
      c.header("Cache-Control", "private, no-store");
      return c.json(kq, 200);
    });
  });

  api.post(BASE, async (c) => {
    const f = await c.req.parseBody().catch(() => null);
    const original = f?.original;
    const thumb = f?.thumb;
    const ngan = String(f?.compartment ?? "");
    const takenAt = typeof f?.takenAt === "string" && NGAY.test(f.takenAt) ? f.takenAt : null;
    const w = Number(f?.width), h = Number(f?.height);
    if (!(original instanceof File) || !(thumb instanceof File) || !(COMPARTMENTS as readonly string[]).includes(ngan) || !(w > 0) || !(h > 0)
      || typeof f?.toa !== "string" || typeof f?.ma !== "string" || !f.toa.trim() || !f.ma.trim()) {
      return c.json({ error: API_ERRORS.invalidPayload.code }, 400);
    }
    const t = {
      toa: f.toa.trim(), ma: f.ma.trim(), ngan: ngan as Compartment, takenAt, width: Math.round(w), height: Math.round(h),
      original: Buffer.from(await original.arrayBuffer()), thumb: Buffer.from(await thumb.arrayBuffer()),
    };
    return chay(c, (tx, ctx, k) => addPhoto(tx, k, ctx.companyId, t), (c, kq) => c.json(kq, 201));
  });

  api.patch(`${BASE}/:id`, async (c) => {
    const b = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
    const s: SuaVao = {};
    if (b?.compartment !== undefined) {
      if (!(COMPARTMENTS as readonly unknown[]).includes(b.compartment)) return c.json({ error: API_ERRORS.invalidPayload.code }, 400);
      s.compartment = b.compartment as Compartment;
    }
    if (b?.order !== undefined) {
      if (!Array.isArray(b.order) || !b.order.every((x) => typeof x === "string")) return c.json({ error: API_ERRORS.invalidPayload.code }, 400);
      s.order = b.order as string[];
    }
    if (b?.isCover === true) s.isCover = true;
    if (typeof b?.isSample === "boolean") s.isSample = b.isSample;
    if (!Object.keys(s).length) return c.json({ error: API_ERRORS.invalidPayload.code }, 400);
    return chay(c, (tx) => patchPhoto(tx, c.req.param("id"), s));
  });

  api.delete(`${BASE}/:id`, (c) => chay(c, (tx, ctx, k) => removePhoto(tx, k, ctx.companyId, c.req.param("id"))));

  api.get(`${BASE}/:id/:bien{original|thumb}`, (c) =>
    chay(
      c,
      (tx, ctx, k) => readPhoto(tx, k, ctx.companyId, c.req.param("id"), c.req.param("bien") as "original" | "thumb"),
      (c, kq) => {
        // Ngăn nội bộ: trình duyệt không giữ đệm (AC-6); ngăn gửi được giữ ngắn.
        c.header("Cache-Control", kq.noiBo ? "private, no-store" : "private, max-age=300");
        if (kq.doc!.kind === "link") return c.redirect(kq.doc!.url, 302);
        const bytes = kq.doc!.bytes;
        c.header("Content-Type", loaiTuByteDau(bytes.subarray(0, 64)) ?? kq.type);
        return c.body(new Uint8Array(bytes), 200);
      },
    ),
  );
}
