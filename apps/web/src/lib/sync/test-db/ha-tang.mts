// Hạ tầng cho bài kiểm bộ đồng bộ trên API thật (hàng 13): dựng app trong tiến trình như packages/api/test-db, đăng nhập
// bằng mã OTP bắt được, và hàm gọi API có công tắc mất mạng / mất phản hồi. Cần DATABASE_URL tới Postgres dãy.
import assert from "node:assert/strict";
import { createApi } from "@quy-hang/api";
import * as h from "../../../../../../packages/api/test-db/helpers";
import type { Goi } from "../types";

type Helpers = {
  appPool: import("pg").Pool;
  identityPool: import("pg").Pool;
  BASE_URL: string;
  RUN: string;
  mail(who: string): string;
  makeAuth(): { auth: unknown; sent: { email: string; otp: string }[] };
  openCompany(name: string, email: string): Promise<{ companyId: string; userId: string }>;
  createLoneUser(email: string): Promise<string>;
  cleanup(): Promise<void>;
  cookieOf(res: Response): string;
};
export const H = h as unknown as Helpers;

const { auth, sent } = H.makeAuth();
export const app = createApi({ appPool: H.appPool, identityPool: H.identityPool, auth } as Parameters<typeof createApi>[0]);

async function goiThang(method: string, path: string, body: unknown, cookie: string) {
  return app.request(`${H.BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: H.BASE_URL, cookie },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

async function dangNhap(email: string): Promise<string> {
  const truoc = sent.length;
  await goiThang("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" }, "");
  const ma = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(ma, `không có mã cho ${email}`);
  const r = await goiThang("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: ma.otp }, "");
  assert.equal(r.status, 200);
  return H.cookieOf(r);
}

export type Nguoi = { userId: string; phien: string; cookie(companyId: string): string; goi(method: string, path: string, body?: unknown, companyId?: string): Promise<{ status: number; body: any }> };

export async function nguoi(nhan: string, san: { companyId: string; vai: string[] }[]): Promise<Nguoi> {
  const email = H.mail(`dongbo-${nhan}`);
  const userId = await H.createLoneUser(email);
  for (const s of san) await H.appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, s.vai]);
  const phien = await dangNhap(email);
  const cookie = (cid: string) => `${phien}; qh_san=${cid}`;
  return {
    userId,
    phien,
    cookie,
    async goi(method, path, body, companyId = san[0]!.companyId) {
      const r = await goiThang(method, path, body, cookie(companyId));
      return { status: r.status, body: await r.json().catch(() => null) };
    },
  };
}

export async function sanMoi(ten: string) {
  return H.openCompany(`[Sàn ${H.RUN} đồng bộ ${ten}]`, H.mail(`dongbo-qt-${ten}`));
}

/**
 * Hàm gọi API cho bộ đồng bộ của một người, sàn theo `sanHienTai()` (như cookie sàn của trình duyệt). Công tắc: mất mạng
 * (ném lỗi trước khi gửi), mất phản hồi lần tới (gửi tới máy chủ rồi ném lỗi thay cho phản hồi).
 */
export function goiCua(n: Nguoi, sanHienTai: () => string) {
  let matMang = false;
  let matPhanHoi = false;
  const goi: Goi = async (method, path, body) => {
    if (matMang) throw new Error("mất mạng");
    const r = await n.goi(method, path, body, sanHienTai());
    if (matPhanHoi && method === "POST") {
      matPhanHoi = false;
      throw new Error("mất phản hồi");
    }
    return r;
  };
  return { goi, matMang: (v: boolean) => void (matMang = v), matPhanHoiLanToi: () => void (matPhanHoi = true) };
}

export const demSuKien = async (listingId: string) =>
  (await H.appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [listingId])).rows[0]!.n;

export const suKienMoi = async (listingId: string, sauSeq: number) =>
  (
    await H.appPool.query<{ seq: number; type: string; payload: Record<string, unknown>; actor_user_id: string }>(
      "select seq, type, payload, actor_user_id from listing_events where listing_id = $1 and seq > $2 order by seq",
      [listingId, sauSeq],
    )
  ).rows;

/** Tạo căn bằng người `n`; `dangBan` thì đưa lên Đang bán («Toàn sàn»). Trả mã căn. */
export async function taoCan(n: Nguoi, dangBan: boolean, companyId?: string): Promise<string> {
  let r = await n.goi("POST", "/api/v1/listings", { buildingName: "[Toà mẫu]", unitNumber: `A-${Math.floor(Math.random() * 9000) + 1000}` }, companyId);
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const id = r.body.id as string;
  if (!dangBan) return id;
  let v = r.body.version as number;
  for (const [type, payload] of [
    ["price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }],
    ["details_changed", { legalStatus: "pink_book", occupantType: "vacant" }],
    ["status_changed", { to: "Active" }],
  ] as const) {
    r = await n.goi("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: v }, companyId);
    assert.equal(r.status, 200, `${type}: ${JSON.stringify(r.body)}`);
    v = r.body.version;
  }
  return id;
}
