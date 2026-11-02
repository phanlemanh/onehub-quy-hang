// Gắn mã căn qua API trên Postgres thật (hàng dien-ma-can-cho-hang: E2, E3, ADR-0026). Trạng thái của hàng cùng căn đặt
// thẳng cột bản tính bằng kết nối chủ — phép kiểm trùng đọc đúng cột ấy; lối chuyển trạng thái đã có bài kiểm riêng.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { OPEN_STATUSES } from "@quy-hang/core/dedupe";
import { STANDARD_STATUSES, type StandardStatus } from "@quy-hang/core/listing";
import { API_ERRORS } from "../src/errors";
import { createApi } from "../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const KH = "dmc";

const goi = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { origin: BASE_URL, ...(cookie ? { cookie } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await goi("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  return cookieOf(await goi("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp }));
}

async function san(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} ${KH}${ten}]`, mail(`${KH}-${ten}-qt`));
  const email = mail(`${KH}-${ten}-a`);
  const userId = await createLoneUser(email);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, ["listing_agent"]]);
  return { companyId: s.companyId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
}
type San = Awaited<ReturnType<typeof san>>;

async function tao(s: San, toa: string, ma?: string): Promise<string> {
  const r = await goi("POST", "/api/v1/listings", ma ? { buildingName: toa, unitNumber: ma } : { buildingName: toa }, s.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { id: string }).id;
}
/** Ràng buộc của bảng hàng: Đã bán có giá chốt, Ngừng hẳn có lý do — điền kèm như lệnh đổi trạng thái thật. */
const datTrangThai = (id: string, st: StandardStatus) =>
  appPool.query(
    `update listings set standard_status = $2,
       close_price = case when $2 = 'Closed' then 3000000000 end, close_date = case when $2 = 'Closed' then current_date end,
       withdrawn_reason = case when $2 = 'Withdrawn' then 'sold_elsewhere' end
     where id = $1`,
    [id, st],
  );
const gan = (s: San, id: string, ma: string, cookie = s.cookie) =>
  goi("POST", `/api/v1/listings/${id}/events`, { type: "unit_number_assigned", payload: { unitNumber: ma }, expectedVersion: 1 }, cookie);

test("loại sự kiện gắn mã căn", async () => {
  const s = await san("rb");
  const id = await tao(s, `[Toà ${RUN} rb]`);
  // Sự kiện chỉ thêm, không xoá — mỗi lần chèn một seq mới (bản tính không đọc lại ở ca này).
  const chen = (type: string, seq: number) =>
    appPool.query(
      "insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner) values ($1, $2, $3, $4, $5, 'u-x', '{}', false)",
      [s.companyId, id, seq, type, { unitNumber: "A-12.05" }],
    );
  await chen("unit_number_assigned", 2);
  // Chiều đỏ: loại lạ vẫn bị chặn — ghim tên ràng buộc.
  await assert.rejects(chen("lam-bay", 3), (e: { constraint?: string }) => e.constraint === "listing_events_type_check");
});

test("API gắn mã căn", async () => {
  const s = await san("api");
  const khac = await san("khac");
  const DONG = STANDARD_STATUSES.filter((st) => !OPEN_STATUSES.includes(st));
  let so = 0;

  // 1. Hàng chưa mã → 200 và đọc lại mang mã.
  {
    const id = await tao(s, `[Toà ${RUN} 1]`);
    const r = await gan(s, id, "A-12.05");
    assert.equal(r.status, 200, await r.clone().text());
    const doc = (await (await goi("GET", `/api/v1/listings/${id}`, undefined, s.cookie)).json()) as { unitNumber: string | null };
    assert.equal(doc.unitNumber, "A-12.05");
    so++;
  }
  // 2. Hàng đã có mã → 422 unit-number-already-set.
  {
    const id = await tao(s, `[Toà ${RUN} 2]`, "A-12.01");
    const r = await gan(s, id, "A-12.05");
    assert.equal(r.status, 422);
    assert.equal(((await r.json()) as { error: string }).error, API_ERRORS.unitNumberAlreadySet.code);
    so++;
  }
  // 3. Cùng căn ở MỖI trạng thái mở (mã khác hoa thường và dấu) → 422 kèm mã hàng kia, lý do nêu trạng thái, không mã.
  for (const st of OPEN_STATUSES) {
    const toa = `[Toà ${RUN} mo ${st}]`;
    const kia = await tao(s, toa, "A12.05");
    await datTrangThai(kia, st);
    const id = await tao(s, toa);
    const r = await gan(s, id, "a12-05");
    assert.equal(r.status, 422, st);
    const b = (await r.json()) as { error: string; reason: string; conflictListingId: string };
    assert.equal(b.error, API_ERRORS.unitAlreadyListed.code, st);
    assert.equal(b.conflictListingId, kia, st);
    assert.match(b.reason, /^Căn này đã có hàng đang mở \(.+\)$/, st);
    assert.ok(!b.reason.includes(kia), `${st}: lý do không in mã hàng`);
    so++;
  }
  // 4. Cùng căn ở MỖI trạng thái đóng → 200.
  for (const st of DONG) {
    const toa = `[Toà ${RUN} dong ${st}]`;
    await datTrangThai(await tao(s, toa, "A12.05"), st);
    const r = await gan(s, await tao(s, toa), "a12-05");
    assert.equal(r.status, 200, `${st}: ${await r.clone().text()}`);
    so++;
  }
  // 5. Cùng căn đang mở ở sàn khác → 200 (cách ly).
  {
    const toa = `[Toà ${RUN} 5]`;
    await datTrangThai(await tao(khac, toa, "A12.05"), "Active");
    const r = await gan(s, await tao(s, toa), "A12.05");
    assert.equal(r.status, 200, await r.clone().text());
    so++;
  }
  // 6. Người không thuộc sàn → 403.
  {
    const id = await tao(s, `[Toà ${RUN} 6]`);
    const email = mail(`${KH}-ngoai`);
    await createLoneUser(email);
    const r = await gan(s, id, "A-12.05", `${await login(email)}; qh_san=${s.companyId}`);
    assert.equal(r.status, 403);
    so++;
  }
  assert.equal(so, 3 + OPEN_STATUSES.length + DONG.length + 1, "số ca phải bằng ma trận dựng từ hai danh sách của lõi");
});
