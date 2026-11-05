// Căn đã gỡ không vào Lần gửi, không nhận «Quan tâm» qua API trên Postgres thật (hàng vá va-gui-can-da-go, E1, E2). Căn
// lên Đang bán qua lệnh hàng rồi gỡ qua cửa voidListing của store hàng — cùng cửa đường hoàn tác lần nhập gọi.
import { SU_KIEN_LAN_GUI } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { withCompany } from "../../src/db";
import { API_ERRORS } from "../../src/errors";
import { voidListing } from "../../src/listings/store";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN, themAnhThat } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

type Nguoi = { userId: string; cookie: string };
async function sanMoi(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} gc ${ten}]`, mail(`gc-${ten}-qt`));
  const them = async (vai: string[], nhan: string): Promise<Nguoi> => {
    const email = mail(`gc-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return {
    companyId: s.companyId,
    dauChu: await them(["listing_agent"], "dc"),
    dauChuB: await them(["listing_agent"], "dc2"),
    dauKhach: await them(["buyer_agent"], "dk"),
    truongNhom: await them(["team_lead"], "tn"),
  };
}

const toaCua = (ma: string) => (ma.startsWith("B") ? "Toà B" : "Toà A");
const CAN = ["A", "B"].flatMap((t) => Array.from({ length: 90 }, (_, i) => `${t}-${String(Math.floor(i / 6) + 1).padStart(2, "0")}.${String((i % 6) + 1).padStart(2, "0")}`));
let soCan = 0;
const maMoi = () => CAN[soCan++ % CAN.length]!;

/** Hàng có sẵn qua API, người tạo giữ căn; `dangBan` thì lên Đang bán (giá 3 tỷ, không bao phí). */
async function hangCo(cookie: string, ma: string, dangBan: boolean): Promise<string> {
  const tao = await send("POST", "/api/v1/listings", { buildingName: toaCua(ma), unitNumber: ma }, cookie);
  assert.equal(tao.status, 201);
  let h = (await tao.json()) as { id: string; version: number };
  const id = h.id;
  const buoc = async (type: string, payload: Record<string, unknown>) => {
    const r = await send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: h.version }, cookie);
    assert.equal(r.status, 200, await r.clone().text());
    h = (await r.json()) as { id: string; version: number };
  };
  const chu = await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Tên] Có sẵn" }, cookie);
  assert.equal(chu.status, 200, await chu.clone().text());
  if (dangBan) {
    await themAnhThat(id);
    await buoc("price_changed", { listPrice: 3_000_000_000, feeInclusion: "excluded" });
    await buoc("details_changed", { legalStatus: "pink_book", occupantType: "vacant" });
    await buoc("status_changed", { to: "Active" });
  }
  return id;
}
const go = async (s: { userId: string; companyId: string }, id: string) => {
  const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
  await withCompany(appPool, s, (tx) => voidListing(tx, id, v));
};
const dem = async (sql: string, args: unknown[]) => (await appPool.query<{ n: number }>(sql, args)).rows[0]!.n;

test("gửi căn đã gỡ: Lần gửi mới bị từ chối", async () => {
  const s = await sanMoi("e1");
  const [a, b] = [await hangCo(s.dauChu.cookie, maMoi(), true), await hangCo(s.dauChu.cookie, maMoi(), true)];
  await go({ userId: s.dauChu.userId, companyId: s.companyId }, a);
  const shares0 = await dem("select count(*)::int n from shares where company_id = $1", [s.companyId]);
  const sl0 = await dem("select count(*)::int n from share_listings where company_id = $1", [s.companyId]);
  const r = await send("POST", "/api/v1/shares", { audience: "agents", prospectId: null, listingIds: [a, b] }, s.dauKhach.cookie);
  assert.equal(r.status, 400, "Lần gửi có căn đã gỡ: 400");
  assert.deepEqual(await r.json(), { error: API_ERRORS.listingNotShareable.code }, "listing-not-shareable");
  assert.equal(await dem("select count(*)::int n from shares where company_id = $1", [s.companyId]), shares0, "không thêm Lần gửi");
  assert.equal(await dem("select count(*)::int n from share_listings where company_id = $1", [s.companyId]), sl0, "không thêm căn của Lần gửi");
  // Đối chứng: chỉ căn còn lại thì gửi được.
  const ok = await send("POST", "/api/v1/shares", { audience: "agents", prospectId: null, listingIds: [b] }, s.dauKhach.cookie);
  assert.equal(ok.status, 201, "đối chứng: căn chưa gỡ gửi được");
  const id = ((await ok.json()) as { id: string }).id;
  assert.deepEqual((await appPool.query<{ listing_id: string }>("select listing_id from share_listings where share_id = $1", [id])).rows.map((x) => x.listing_id), [b]);
});

test("gửi căn đã gỡ: khách không quan tâm được", async () => {
  const s = await sanMoi("e2");
  const [a, b] = [await hangCo(s.dauChu.cookie, maMoi(), true), await hangCo(s.dauChu.cookie, maMoi(), true)];
  const g = await send("POST", "/api/v1/shares", { audience: "agents", prospectId: null, listingIds: [a, b] }, s.dauKhach.cookie);
  assert.equal(g.status, 201, await g.clone().text());
  const lan = (await g.json()) as { id: string; code: string };
  await go({ userId: s.dauChu.userId, companyId: s.companyId }, a);
  const P = `/api/v1/public/shares/${lan.code}/events`;
  assert.equal((await send("POST", P, { type: SU_KIEN_LAN_GUI.quanTam, visitor: "may-khach-GGGA", listingId: a })).status, 409, "Quan tâm căn đã gỡ: 409");
  assert.equal(await dem("select count(*)::int n from share_events where share_id = $1 and type = 'interest' and listing_id = $2", [lan.id, a]), 0, "không ghi Quan tâm căn đã gỡ");
  // Đối chứng: căn còn lại và lượt mở link vẫn ghi.
  assert.equal((await send("POST", P, { type: SU_KIEN_LAN_GUI.quanTam, visitor: "may-khach-GGGB", listingId: b })).status, 201, "đối chứng: Quan tâm căn còn lại");
  assert.equal(await dem("select count(*)::int n from share_events where share_id = $1 and type = 'interest' and listing_id = $2", [lan.id, b]), 1);
  assert.equal((await send("POST", P, { type: SU_KIEN_LAN_GUI.mo, visitor: "may-khach-GGGC" })).status, 201, "đối chứng: lượt mở link");
});
