// Ngày bán không có thật qua lệnh API trên Postgres thật (hàng 57, hồ sơ bao-ro-ngay-ban-sai) — E3, E4.
import { NGAY_KHONG_CO_THAT, validatePayload } from "@quy-hang/core/listing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
// Cùng hai ma trận lõi kiểm — một danh sách, không chép lại.
import { NGAY_CO_THAT, NGAY_KHONG_CO_THAT_CA } from "../../../core/src/listing/ngay-ca.fixture";
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
  const email = mail(`ngay-${ten.toLowerCase()}`);
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, email);
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return `${cookieOf(res)}; qh_san=${s.companyId}`;
}

/** Postgres có nhận chuỗi là một `date` không; từ chối thì trả mã lỗi. */
async function postgresNhan(d: string): Promise<true | string> {
  try {
    await appPool.query("select $1::date", [d]);
    return true;
  } catch (e) {
    return (e as { code?: string }).code ?? String(e);
  }
}

test("Postgres và lõi nhận cùng một tập ngày", async () => {
  const MA_NGOAI_MIEN = ["22008", "22007"];
  let so = 0;
  for (const [nhan, ds] of [
    ["có thật", NGAY_CO_THAT],
    ["không có thật", NGAY_KHONG_CO_THAT_CA],
  ] as const) {
    for (const d of ds) {
      const pg = await postgresNhan(d);
      // Vế (a): nhãn ma trận khớp Postgres.
      if (nhan === "có thật") assert.equal(pg, true, `ngày ${d} ghi «có thật» mà Postgres từ chối (${pg})`);
      else assert.ok(pg !== true && MA_NGOAI_MIEN.includes(pg), `ngày ${d} ghi «không có thật» mà Postgres ${pg === true ? "nhận" : `báo ${pg}`}`);
      // Vế (b): lõi nhận ⇔ Postgres nhận.
      const loiNhan = validatePayload("status_changed", { to: "Closed", closePrice: 3_200_000_000, closeDate: d }).length === 0;
      assert.equal(loiNhan, pg === true, `ngày ${d}: lõi ${loiNhan ? "nhận" : "từ chối"}, Postgres ${pg === true ? "nhận" : "từ chối"}`);
      so++;
    }
  }
  assert.equal(so, NGAY_CO_THAT.length + NGAY_KHONG_CO_THAT_CA.length, "số lần so phải bằng tổng hai ma trận");
});

test("chốt bán với ngày không có thật: 400 nêu closeDate, không ghi", async () => {
  const cookie = await sanMoi("N1");
  const tao = await send("POST", "/api/v1/listings", { buildingName: "[Toà mẫu]", unitNumber: "A-1201" }, cookie);
  assert.equal(tao.status, 201);
  const { id } = (await tao.json()) as { id: string };
  // Đưa hàng tới «Đang bán» — chỗ người thật chốt bán.
  assert.equal((await lenh(cookie, id, { type: "price_changed", payload: { listPrice: 3_500_000_000, feeInclusion: "excluded" }, expectedVersion: 1 })).status, 200);
  assert.equal((await lenh(cookie, id, { type: "details_changed", payload: { legalStatus: "pink_book", occupantType: "vacant" }, expectedVersion: 2 })).status, 200);
  await themAnhThat(id); // hàng 23: vào Đang bán cần ảnh thật
  assert.equal((await lenh(cookie, id, { type: "status_changed", payload: { to: "Active" }, expectedVersion: 3 })).status, 200);

  const demSuKien = async () => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;
  const banTinh = async () => (await appPool.query("select to_jsonb(l) j from listings l where id = $1", [id])).rows[0]!.j;
  const MONG = { error: API_ERRORS.invalidPayload.code, details: [{ path: "closeDate", reason: NGAY_KHONG_CO_THAT }] };
  let so = 0;
  for (const d of NGAY_KHONG_CO_THAT_CA) {
    const [n, truoc] = [await demSuKien(), await banTinh()];
    const res = await lenh(cookie, id, { type: "status_changed", payload: { to: "Closed", closePrice: 3_400_000_000, closeDate: d }, expectedVersion: 4 });
    assert.deepEqual([res.status, await res.json()], [API_ERRORS.invalidPayload.status, MONG], `ngày ${d}`);
    assert.equal(await demSuKien(), n, `ngày ${d}: không được ghi sự kiện`);
    assert.deepEqual(await banTinh(), truoc, `ngày ${d}: bản tính của hàng không được đổi`);
    so++;
  }
  assert.equal(so, NGAY_KHONG_CO_THAT_CA.length, "số lần gửi phải bằng ma trận viết trước");

  // Đối chứng dương trên cùng hàng: ngày nhuận có thật được ghi đúng, đọc ở hai chỗ.
  const ok = await lenh(cookie, id, { type: "status_changed", payload: { to: "Closed", closePrice: 3_400_000_000, closeDate: "2024-02-29" }, expectedVersion: 4 });
  assert.equal(ok.status, 200, await ok.clone().text());
  const doc = (await (await req(`/api/v1/listings/${id}`, cookie)).json()) as { standardStatus: string; closeDate: string | null };
  assert.deepEqual([doc.standardStatus, doc.closeDate], ["Closed", "2024-02-29"], "GET hàng");
  const cot = (await appPool.query<{ d: string }>("select close_date::text d from listings where id = $1", [id])).rows[0]!.d;
  assert.equal(cot, "2024-02-29", "cột close_date");
});
