// «Sẵn sàng bán» qua API trên Postgres thật (hàng 23: E2, E3). Ảnh thêm qua API ảnh (kho Postgres), cấu hình sàn ghi
// thẳng bảng company_settings bằng kết nối chủ (chưa có lệnh ghi khoá — OOS-2).
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { API_ERRORS } from "../src/errors";
import { createApi } from "../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const KH = "ssb";
const TOA = "[Toà sẵn sàng]";
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(1996, 1)]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

const goi = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { origin: BASE_URL, ...(cookie ? { cookie } : {}), ...(body && !(body instanceof FormData) ? { "content-type": "application/json" } : {}) },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await goi("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  return cookieOf(await goi("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp }));
}

type Nguoi = { userId: string; cookie: string };
async function san(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} ${KH}${ten}]`, mail(`${KH}-${ten}-qt`));
  const them = async (vai: string[], nhan: string): Promise<Nguoi> => {
    const email = mail(`${KH}-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return { companyId: s.companyId, a: await them(["listing_agent"], "a"), b: await them(["listing_agent"], "b") };
}

/** Hàng của đầu chủ A, đủ giá, điều kiện phí, pháp lý, tình trạng sử dụng — chưa đổi trạng thái. */
async function hangDu(s: Awaited<ReturnType<typeof san>>, ma: string) {
  const r = await goi("POST", "/api/v1/listings", { buildingName: TOA, unitNumber: ma }, s.a.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  const { id } = (await r.json()) as { id: string };
  await appPool.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, $3)", [s.companyId, id, s.a.userId]);
  let v = 1;
  for (const body of [
    { type: "price_changed", payload: { listPrice: 3_200_000_000, feeInclusion: "included" } },
    { type: "details_changed", payload: { legalStatus: "pink_book", occupantType: "vacant" } },
  ]) {
    const x = await goi("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v++ }, s.a.cookie);
    assert.equal(x.status, 200, await x.clone().text());
  }
  return { id, ma, version: v };
}

async function themAnh(s: Awaited<ReturnType<typeof san>>, ma: string, ngan = "shareable"): Promise<string> {
  const f = new FormData();
  for (const [k, v] of Object.entries({ toa: TOA, ma, compartment: ngan, width: "2000", height: "1500" })) f.set(k, v);
  f.set("original", new File([new Uint8Array(JPEG)], "a.jpg", { type: "image/jpeg" }));
  f.set("thumb", new File([new Uint8Array(PNG)], "n.png", { type: "image/png" }));
  const r = await goi("POST", "/api/v1/units/photos", f, s.a.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { anh: { id: string } }).anh.id;
}

const lenDangBan = (s: Awaited<ReturnType<typeof san>>, h: { id: string; version: number }) =>
  goi("POST", `/api/v1/listings/${h.id}/events`, { type: "status_changed", payload: { to: "Active" }, expectedVersion: h.version }, s.a.cookie);
const demSuKien = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;
const trangThai = async (id: string) => (await appPool.query<{ s: string }>("select standard_status s from listings where id = $1", [id])).rows[0]!.s;
const datToiThieu = (companyId: string, userId: string, n: number) =>
  appPool.query(
    `insert into company_settings (company_id, key, value, updated_by) values ($1, 'listing.ready_min_real_photos', $2::jsonb, $3)
     on conflict (company_id, key) do update set value = excluded.value`,
    [companyId, JSON.stringify(n), userId],
  );

test("E2 máy chủ đòi ảnh thật: bốn ca không ảnh thật bị từ chối, một ảnh thật thì lên", async () => {
  const s = await san("e2");
  // [ca, dựng ảnh cho căn]
  const CA: [string, (ma: string) => Promise<void>][] = [
    ["không ảnh", async () => {}],
    ["chỉ ảnh mẫu Gửi được", async (ma) => {
      const id = await themAnh(s, ma);
      assert.equal((await goi("PATCH", `/api/v1/units/photos/${id}`, { isSample: true }, s.a.cookie)).status, 200);
    }],
    ["chỉ ảnh Nội bộ", async (ma) => void (await themAnh(s, ma, "internal"))],
    ["ảnh Gửi được đã xoá", async (ma) => {
      const id = await themAnh(s, ma);
      assert.equal((await goi("DELETE", `/api/v1/units/photos/${id}`, undefined, s.a.cookie)).status, 200);
    }],
  ];
  let i = 0;
  for (const [ten, dung] of CA) {
    const h = await hangDu(s, `B-10.0${++i}`);
    await dung(h.ma);
    const n = await demSuKien(h.id);
    const r = await lenDangBan(s, h);
    assert.deepEqual([r.status, await r.json()], [400, { error: API_ERRORS.missingRequirement.code, missing: ["realPhoto"] }], `${ten}: mã trả về`);
    assert.equal(await demSuKien(h.id), n, `${ten}: không được ghi sự kiện`);
    assert.equal(await trangThai(h.id), "Incomplete", `${ten}: trạng thái đổi`);
  }
  // Đối chứng dương: một ảnh thật ngăn Gửi được.
  const h = await hangDu(s, "B-10.09");
  await themAnh(s, h.ma);
  const r = await lenDangBan(s, h);
  assert.equal(r.status, 200, `một ảnh thật: ${await r.clone().text()}`);
  assert.equal(await trangThai(h.id), "Active");
  const lenh = await appPool.query("select 1 from listing_events where listing_id = $1 and type = 'status_changed' and payload ->> 'to' = 'Active'", [h.id]);
  assert.equal(lenh.rowCount, 1, "đúng một sự kiện lên Đang bán");
});

test("E2 cấu hình số ảnh tối thiểu của sàn: đặt 2 thì một ảnh bị từ chối, sàn khác vẫn mặc định 1", async () => {
  const s = await san("e2c");
  const khac = await san("e2k");
  await datToiThieu(s.companyId, s.a.userId, 2);
  const h = await hangDu(s, "C-11.01");
  await themAnh(s, h.ma);
  const r1 = await lenDangBan(s, h);
  assert.deepEqual([r1.status, await r1.json()], [400, { error: API_ERRORS.missingRequirement.code, missing: ["realPhoto"] }], "tối thiểu 2, có 1");
  await themAnh(s, h.ma);
  assert.equal((await lenDangBan(s, h)).status, 200, "tối thiểu 2, có 2");
  const hk = await hangDu(khac, "C-11.01");
  await themAnh(khac, hk.ma);
  assert.equal((await lenDangBan(khac, hk)).status, 200, "sàn không đặt khoá, một ảnh");
});

test("E3 lên Toàn sàn sau Sẵn sàng bán; sàn khác không đọc được", async () => {
  const s = await san("e3");
  const khac = await san("e3k");
  const h = await hangDu(s, "D-12.01");
  const doc = (n: Nguoi) => goi("GET", `/api/v1/listings/${h.id}`, undefined, n.cookie);
  assert.equal((await doc(s.b)).status, 404, "B cùng sàn đọc trước khi lên");
  assert.equal((await doc(khac.a)).status, 404, "sàn khác đọc trước khi lên");
  await themAnh(s, h.ma);
  assert.equal((await lenDangBan(s, h)).status, 200);
  const r = await doc(s.b);
  assert.equal(r.status, 200, "B cùng sàn đọc sau khi lên");
  assert.equal(((await r.json()) as { id: string }).id, h.id);
  assert.equal((await doc(khac.a)).status, 404, "sàn khác đọc sau khi lên");
});
