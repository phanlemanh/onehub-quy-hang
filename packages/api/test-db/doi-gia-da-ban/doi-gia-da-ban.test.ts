// Đổi giá căn Đã bán qua lệnh API trên Postgres thật (hàng va-doi-gia-can-da-ban) — E2.
import { DOI_GIA_DA_BAN, LY_DO_DOI_GIA_DA_BAN, type StandardStatus } from "@quy-hang/core/listing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { API_ERRORS } from "../../src/errors";
import { appPool, BASE_URL, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN, themAnhThat } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const req = (path: string, cookie = "", init: RequestInit = {}) =>
  app.request(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
  });
const send = (method: string, path: string, body: unknown, cookie = "") => req(path, cookie, { method, body: JSON.stringify(body) });
const lenh = (cookie: string, id: string, body: unknown) => send("POST", `/api/v1/listings/${id}/events`, body, cookie);

async function sanMoi(ten: string) {
  const email = mail(`doi-gia-${ten.toLowerCase()}`);
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, email);
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return `${cookieOf(res)}; qh_san=${s.companyId}`;
}

let soCan = 0;
/** Tạo một hàng và đưa tới trạng thái `toi` qua đúng lệnh API; trả id và phiên bản hiện tại. */
async function hangO(cookie: string, toi: StandardStatus): Promise<{ id: string; version: number }> {
  const tao = await send("POST", "/api/v1/listings", { buildingName: "[Toà mẫu]", unitNumber: `A-20${String(++soCan).padStart(2, "0")}` }, cookie);
  assert.equal(tao.status, 201);
  const { id } = (await tao.json()) as { id: string };
  let v = 1;
  const buoc = async (body: Record<string, unknown>) => {
    const r = await lenh(cookie, id, { ...body, expectedVersion: v });
    assert.equal(r.status, 200, `${toi}: ${JSON.stringify(body)} → ${await r.clone().text()}`);
    v++;
  };
  if (toi === "Incomplete") return { id, version: v };
  if (toi === "Hold") {
    await buoc({ type: "status_changed", payload: { to: "Hold" } });
    return { id, version: v };
  }
  if (toi === "Withdrawn") {
    await buoc({ type: "status_changed", payload: { to: "Withdrawn", withdrawnReason: "owner_changed_mind" } });
    return { id, version: v };
  }
  await buoc({ type: "price_changed", payload: { listPrice: 3_500_000_000, feeInclusion: "excluded" } });
  await buoc({ type: "details_changed", payload: { legalStatus: "pink_book", occupantType: "vacant" } });
  await themAnhThat(id);
  await buoc({ type: "status_changed", payload: { to: "Active" } });
  if (toi === "Pending") await buoc({ type: "status_changed", payload: { to: "Pending" } });
  if (toi === "Closed") await buoc({ type: "status_changed", payload: { to: "Closed", closePrice: 3_400_000_000, closeDate: "2026-10-30" } });
  return { id, version: v };
}

const demSuKien = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;
const cot = async (id: string) => (await appPool.query<{ version: number; list_price: string | null }>("select version, list_price from listings where id = $1", [id])).rows[0]!;

test("đổi giá căn Đã bán: 422 nêu lý do, không ghi", async () => {
  const cookie = await sanMoi("DB1");
  const { id, version } = await hangO(cookie, "Closed");
  assert.equal(API_ERRORS.priceLockedClosed.code, DOI_GIA_DA_BAN, "mã máy chủ bằng mã của lõi");
  const MONG = { error: API_ERRORS.priceLockedClosed.code, reason: LY_DO_DOI_GIA_DA_BAN };
  let so = 0;
  for (const [nhan, ver] of [["đúng phiên bản", version], ["phiên bản cũ", version - 2]] as const) {
    const [n, truoc] = [await demSuKien(id), await cot(id)];
    const res = await lenh(cookie, id, { type: "price_changed", payload: { listPrice: 3_900_000_000, feeInclusion: "included" }, expectedVersion: ver });
    assert.deepEqual([res.status, await res.json()], [API_ERRORS.priceLockedClosed.status, MONG], nhan);
    assert.equal(await demSuKien(id), n, `${nhan}: không được ghi sự kiện`);
    assert.deepEqual(await cot(id), truoc, `${nhan}: phiên bản và giá không được đổi`);
    so++;
  }
  assert.equal(so, 2);
});

test("đổi giá ở năm trạng thái khác: nhận", async () => {
  const cookie = await sanMoi("DB2");
  const KHAC: StandardStatus[] = ["Incomplete", "Active", "Pending", "Hold", "Withdrawn"];
  let so = 0;
  for (const s of KHAC) {
    const { id, version } = await hangO(cookie, s);
    const res = await lenh(cookie, id, { type: "price_changed", payload: { listPrice: 4_100_000_000, feeInclusion: "included" }, expectedVersion: version });
    assert.equal(res.status, 200, `${s}: ${await res.clone().text()}`);
    const doc = (await (await req(`/api/v1/listings/${id}`, cookie)).json()) as { listPrice: number; standardStatus: string };
    assert.deepEqual([doc.standardStatus, doc.listPrice], [s, 4_100_000_000], `${s}: GET hàng`);
    so++;
  }
  assert.equal(so, 5);
});
