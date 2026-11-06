// Vá cặp hạn hỏng ở lối chung PATCH /api/v1/company/settings (hàng luat-chia-lead-cap-han-hong: E1, E2, E3, E3b, E4). Sàn,
// người, lead dựng qua lối API thật; dòng «có từ trước» chèn thẳng bằng kết nối chủ (không qua lối kiểm), như ca E5c của
// cau-hinh-theo-san. Số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../src/app";
import { runLeadTick } from "../src/jobs/lead-tick";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

const NHAN = "lead_routing.accept_minutes";
const GOI = "lead_routing.first_call_minutes";

type San = { companyId: string; qt: { userId: string; cookie: string }; ts: { cookie: string }; so: number };
let soSan = 0;
async function sanMoi(): Promise<San> {
  const nhan = `chh${soSan++}`;
  const qtEmail = mail(`${nhan}-qt`);
  const s = await openCompany(`[Sàn ${RUN} cap-han-hong ${nhan}]`, qtEmail);
  const tsEmail = mail(`${nhan}-ts`);
  const tsId = await createLoneUser(tsEmail);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, tsId, ["telesales"]]);
  return {
    companyId: s.companyId,
    qt: { userId: s.userId, cookie: `${await login(qtEmail)}; qh_san=${s.companyId}` },
    ts: { cookie: `${await login(tsEmail)}; qh_san=${s.companyId}` },
    so: 60,
  };
}

type Ban = { items: { key: string; value: unknown }[]; errors: string[] };
const doc = async (s: San): Promise<Ban> => {
  const r = await send("GET", "/api/v1/company/settings", undefined, s.qt.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as Ban;
};
const haiHan = (b: Ban) => [NHAN, GOI].map((k) => b.items.find((x) => x.key === k)?.value);
const doi = (s: San, body: unknown) => send("PATCH", "/api/v1/company/settings", body, s.qt.cookie);
/** Dòng «có từ trước», không qua lối kiểm. */
const chenThang = (s: San, khoa: string, v: number) =>
  appPool.query(
    `insert into company_settings (company_id, key, value, updated_by) values ($1, $2, $3::jsonb, $4)
     on conflict (company_id, key) do update set value = excluded.value`,
    [s.companyId, khoa, JSON.stringify(v), s.qt.userId],
  );
const bang = async (s: San) =>
  Object.fromEntries(
    (
      await appPool.query<{ key: string; value: unknown; updated_at: Date }>(
        "select key, value, updated_at from company_settings where company_id = $1 and key = any($2) order by key",
        [s.companyId, [NHAN, GOI]],
      )
    ).rows.map((r) => [r.key, r]),
  );
const suKien = async (s: San) =>
  (
    await appPool.query<{ key: string; value: unknown; actor_user_id: string; actor_roles: string[] }>(
      "select key, value, actor_user_id, actor_roles from company_settings_events where company_id = $1 order by id",
      [s.companyId],
    )
  ).rows;
async function leadMoi(s: San): Promise<{ accept_minutes: number | null; first_call_minutes: number | null }> {
  const r = await send(
    "POST",
    "/api/v1/leads",
    { ownerPhone: `0900 000 0${s.so++}`, buildingName: "Toà A", need: "sale", listPrice: 3_200_000_000, feeInclusion: "included", desiredListingTime: "now" },
    s.ts.cookie,
  );
  assert.equal(r.status, 201, await r.clone().text());
  const id = ((await r.json()) as { id: string }).id;
  await runLeadTick(appPool, new Date(), [s.companyId]);
  return (await appPool.query("select accept_minutes, first_call_minutes from leads where id = $1", [id])).rows[0]!;
}

// ---- E1 ----
test("cặp hạn hỏng: sửa hạn gọi khi hạn nhận hỏng", async () => {
  const s = await sanMoi();
  await chenThang(s, NHAN, 60);
  const truoc = await doc(s);
  assert.equal(truoc.errors.length, 1, `đối chứng: cặp hỏng phải báo — ${truoc.errors.join(" | ")}`);
  assert.deepEqual(haiHan(truoc), [15, 30], "đối chứng: cặp hỏng chạy theo mặc định");
  const n0 = (await suKien(s)).length;

  const r = await doi(s, { [GOI]: 40 });
  assert.equal(r.status, 200, await r.clone().text());
  const sau = await doc(s);
  assert.deepEqual(haiHan(sau), [15, 40], "cặp vẫn hỏng sau lưu: hai hạn phải đọc ra 15/40");
  assert.deepEqual(sau.errors, [], "cặp vẫn hỏng sau lưu: GET còn báo lỗi");
  const b = await bang(s);
  assert.deepEqual([b[NHAN]?.value, b[GOI]?.value], [15, 40], "bảng phải khớp cặp đã kiểm");
  const sk = (await suKien(s)).slice(n0);
  assert.deepEqual(sk.map((e) => `${e.key}=${JSON.stringify(e.value)}`).sort(), [`${GOI}=40`, `${NHAN}=15`].sort(), "nhật ký đúng hai dòng");
  for (const e of sk) {
    assert.equal(e.actor_user_id, s.qt.userId, e.key);
    assert.ok(e.actor_roles.includes("company_admin"), e.key);
  }
  const l = await leadMoi(s);
  assert.deepEqual([l.accept_minutes, l.first_call_minutes], [15, 40], "lead mới theo cặp vừa lưu");
});

// ---- E2 ----
test("cặp hạn hỏng: sửa hạn nhận khi hạn gọi hỏng", async () => {
  const s = await sanMoi();
  await chenThang(s, GOI, 10);
  const truoc = await doc(s);
  assert.equal(truoc.errors.length, 1, truoc.errors.join(" | "));
  assert.deepEqual(haiHan(truoc), [15, 30]);

  const r = await doi(s, { [NHAN]: 5 });
  assert.equal(r.status, 200, await r.clone().text());
  const sau = await doc(s);
  assert.notEqual(haiHan(sau)[1], 10, "giá trị cũ ẩn có hiệu lực: hạn gọi 10 quản trị chưa từng thấy");
  assert.deepEqual(haiHan(sau), [5, 30]);
  assert.deepEqual(sau.errors, []);
  const l = await leadMoi(s);
  assert.deepEqual([l.accept_minutes, l.first_call_minutes], [5, 30]);
});

// ---- E3 ----
test("cặp hạn hỏng: ra cặp trái luật thì 400, không ghi", async () => {
  const s = await sanMoi();
  await chenThang(s, NHAN, 60);
  const n0 = (await suKien(s)).length;
  const r = await doi(s, { [GOI]: 10 });
  assert.equal(r.status, 400);
  const lyDo = ((await r.json()) as { reason: string }).reason;
  assert.ok(lyDo.startsWith(`${GOI} `) && lyDo.includes(NHAN), lyDo);
  const b = await bang(s);
  assert.deepEqual(Object.keys(b), [NHAN], "bảng giữ đúng một dòng hạn nhận");
  assert.equal(b[NHAN]!.value, 60);
  assert.equal((await suKien(s)).length, n0, "nhật ký không thêm dòng");
});

// ---- E3b ----
test("cặp hạn hỏng: hạn gọi hỏng, hạn nhận ra cặp trái luật", async () => {
  const s = await sanMoi();
  await chenThang(s, GOI, 10);
  const n0 = (await suKien(s)).length;
  const r = await doi(s, { [NHAN]: 40 });
  assert.equal(r.status, 400);
  const lyDo = ((await r.json()) as { reason: string }).reason;
  assert.ok(lyDo.startsWith(`${GOI} `) && lyDo.includes(NHAN), lyDo);
  const b = await bang(s);
  assert.deepEqual(Object.keys(b), [GOI]);
  assert.equal(b[GOI]!.value, 10);
  assert.equal((await suKien(s)).length, n0);
  // Đối chứng dương: hạn nhận 20 hợp luật với 30 đang hiện.
  const ok = await doi(s, { [NHAN]: 20 });
  assert.equal(ok.status, 200, `kiểm so với giá trị lưu hỏng thay vì giá trị đang áp: ${await ok.clone().text()}`);
  assert.deepEqual(haiHan(await doc(s)), [20, 30]);
});

// ---- E4 ----
test("cặp không hỏng: lưu một hạn chỉ ghi hạn ấy", async () => {
  const s = await sanMoi();
  let n0 = (await suKien(s)).length;
  let r = await doi(s, { [GOI]: 45 });
  assert.equal(r.status, 200, await r.clone().text());
  let b = await bang(s);
  assert.deepEqual(Object.keys(b), [GOI], "sàn mới: không có dòng hạn nhận");
  assert.equal(b[GOI]!.value, 45);
  assert.equal((await suKien(s)).length, n0 + 1);

  const t = await sanMoi();
  r = await doi(t, { [NHAN]: 20, [GOI]: 40 });
  assert.equal(r.status, 200, await r.clone().text());
  const truoc = (await bang(t))[NHAN]!.updated_at.getTime();
  n0 = (await suKien(t)).length;
  r = await doi(t, { [GOI]: 45 });
  assert.equal(r.status, 200, await r.clone().text());
  b = await bang(t);
  assert.equal(b[NHAN]!.value, 20);
  assert.equal(b[NHAN]!.updated_at.getTime(), truoc, "cặp lành: hạn nhận không bị ghi lại");
  assert.equal((await suKien(t)).length, n0 + 1, "nhật ký đúng một dòng");
});
