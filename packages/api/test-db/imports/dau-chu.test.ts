// Đầu chủ của sàn cho Trưởng nhóm chọn khi nhập hộ (hàng man-nhap-excel, AC-8, E8): chỉ vai nhập đọc, chỉ mã người và tên,
// không thấy đầu chủ của sàn khác. Postgres dãy, như lan-nhap.test.ts.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { API_ERRORS } from "../../src/errors";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const get = (path: string, cookie: string) => app.request(`${BASE_URL}${path}`, { headers: { origin: BASE_URL, cookie } });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await app.request(`${BASE_URL}/api/v1/auth/email-otp/send-verification-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE_URL },
    body: JSON.stringify({ email, type: "sign-in" }),
  });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await app.request(`${BASE_URL}/api/v1/auth/sign-in/email-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE_URL },
    body: JSON.stringify({ email, otp: code.otp }),
  });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

async function sanMoi(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} dc ${ten}]`, mail(`dcs-${ten}-qt`));
  const them = async (vai: string[], nhan: string) => {
    const email = mail(`dcs-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, email, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return { dauChu: await them(["listing_agent"], "dc"), dauChu2: await them(["listing_agent", "team_lead"], "dc2"), truongNhom: await them(["team_lead"], "tn"), dauKhach: await them(["buyer_agent"], "dk") };
}

test("đầu chủ của sàn: chỉ vai nhập, chỉ mã và tên", async () => {
  const A = await sanMoi("a");
  const B = await sanMoi("b");
  const mong = [A.dauChu, A.dauChu2].map((n) => n.userId).sort();
  for (const [ten, nguoi] of [["Đầu chủ", A.dauChu], ["Trưởng nhóm", A.truongNhom]] as const) {
    const res = await get("/api/v1/imports/agents", nguoi.cookie);
    assert.equal(res.status, 200, ten);
    const ds = (await res.json()) as Record<string, unknown>[];
    assert.deepEqual(ds.map((d) => d.userId).sort(), mong, `${ten}: tập đầu chủ của sàn A`);
    for (const d of ds) assert.deepEqual(Object.keys(d).sort(), ["name", "userId"], `${ten}: khoá thừa ${Object.keys(d).join(",")}`);
    assert.ok(!ds.some((d) => d.userId === B.dauChu.userId), `${ten}: thấy đầu chủ sàn B`);
  }
  const tuChoi = await get("/api/v1/imports/agents", A.dauKhach.cookie);
  assert.equal(tuChoi.status, 403);
  assert.deepEqual(await tuChoi.json(), { error: API_ERRORS.importRoleRequired.code });
});
