// Mục chia lead của Cài đặt sàn trên Postgres thật (hàng 48: E2b, E3, E5c, E6b, E7c). Màn lưu qua lối chung PATCH
// /api/v1/company/settings (hàng 82) với sáu khoá của sổ mang `man: "48"`; bộ kiểm này đi đúng lối ấy. Sàn, người và lead
// dựng qua lối API thật (mở sàn, nhập lead, nhịp chia); kết nối chủ chỉ đọc nhật ký và dấu trên lead. Số mẫu `0900 000 0xx`.
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

type Vai = "qt" | "tn" | "dc" | "ts";
type San = { companyId: string; nguoi: Record<Vai, { userId: string; cookie: string }>; so: number };
let soSan = 0;
async function sanMoi(): Promise<San> {
  const nhan = `lcl${soSan++}`;
  const qtEmail = mail(`${nhan}-qt`);
  const s = await openCompany(`[Sàn ${RUN} luat-chia-lead ${nhan}]`, qtEmail);
  const nguoi = { qt: { userId: s.userId, cookie: `${await login(qtEmail)}; qh_san=${s.companyId}` } } as San["nguoi"];
  for (const [k, vai] of [
    ["tn", ["team_lead"]],
    ["dc", ["listing_agent"]],
    ["ts", ["telesales"]],
  ] as const) {
    const email = mail(`${nhan}-${k}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    nguoi[k] = { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  }
  return { companyId: s.companyId, nguoi, so: 40 };
}

/** Sáu khoá của màn, viết tay theo thứ tự dòng (đối chiếu `KHOA_MAN` của màn). */
const SAU_KHOA = [
  "lead_routing.strategy",
  "lead_routing.accept_minutes",
  "lead_routing.first_call_minutes",
  "lead_routing.alert_to",
  "queue.call_back_after_days",
  "queue.price_negotiation_after_days",
] as const;
/** Lý do 400 của lối chung — khuôn màn dựa vào để gắn lý do về đúng dòng. */
const KHUON_LY_DO = /^(lead_routing|queue)\.[a-z_]+[: ]/;

type Ban = { items: { key: string; value: unknown; source: string }[]; errors: string[] };
const doc = async (san: San): Promise<Ban> => {
  const r = await send("GET", "/api/v1/company/settings", undefined, san.nguoi.qt.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as Ban;
};
const giaTri = (ban: Ban) => Object.fromEntries(SAU_KHOA.map((k) => [k, ban.items.find((x) => x.key === k)?.value]));
const doi = (san: San, body: unknown, vai: Vai = "qt") => send("PATCH", "/api/v1/company/settings", body, san.nguoi[vai].cookie);
const suKien = async (san: San) =>
  (
    await appPool.query<{ key: string; actor_user_id: string; actor_roles: string[] }>(
      "select key, actor_user_id, actor_roles from company_settings_events where company_id = $1 order by id",
      [san.companyId],
    )
  ).rows;

async function nhap(san: San): Promise<string> {
  const r = await send(
    "POST",
    "/api/v1/leads",
    { ownerPhone: `0900 000 0${san.so++}`, buildingName: "Toà A", need: "sale", listPrice: 3_200_000_000, feeInclusion: "included", desiredListingTime: "now" },
    san.nguoi.ts.cookie,
  );
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { id: string }).id;
}
const nhip = (san: San) => runLeadTick(appPool, new Date(), [san.companyId]);
const dauLead = async (id: string) =>
  (
    await appPool.query<{ routing_strategy: string | null; accept_minutes: number | null; first_call_minutes: number | null }>(
      "select routing_strategy, accept_minutes, first_call_minutes from leads where id = $1",
      [id],
    )
  ).rows[0]!;

test("luật chia lead: lưu sáu điểm nguyên khối, mỗi khoá một sự kiện", async () => {
  const s = await sanMoi();
  const moi = {
    "lead_routing.strategy": "open_pool",
    "lead_routing.accept_minutes": 25,
    "lead_routing.first_call_minutes": 45,
    "lead_routing.alert_to": "team_lead_and_admin",
    "queue.call_back_after_days": 20,
    "queue.price_negotiation_after_days": 12,
  };
  const truoc = (await suKien(s)).length;
  const r = await doi(s, moi);
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual(giaTri(await doc(s)), moi);
  const them = (await suKien(s)).slice(truoc);
  assert.deepEqual(them.map((e) => e.key).sort(), [...SAU_KHOA].sort(), "mỗi khoá đúng một sự kiện");
  for (const e of them) {
    assert.equal(e.actor_user_id, s.nguoi.qt.userId, e.key);
    assert.ok(e.actor_roles.includes("company_admin"), e.key);
  }

  // Chiều đỏ: năm khoá đúng cộng một khoá ngoài khoảng → 400 nêu đúng khoá, không khoá nào ghi, nhật ký không thêm.
  const daCo = (await suKien(s)).length;
  const hong = await doi(s, { ...moi, "lead_routing.accept_minutes": 30, "queue.call_back_after_days": 6 });
  assert.equal(hong.status, 400);
  const lyDo = ((await hong.json()) as { reason: string }).reason;
  assert.match(lyDo, KHUON_LY_DO, lyDo);
  assert.ok(lyDo.startsWith("queue.call_back_after_days: "), lyDo);
  assert.deepEqual(giaTri(await doc(s)), moi, "nguyên khối: không khoá nào được ghi");
  assert.equal((await suKien(s)).length, daCo, "nhật ký không thêm dòng nào");
  // Cặp hạn trái luật: lý do mở đầu bằng khoá hạn gọi — khoá màn gắn lý do vào.
  const cap = await doi(s, { "lead_routing.first_call_minutes": 10 });
  assert.equal(cap.status, 400);
  const lyDoCap = ((await cap.json()) as { reason: string }).reason;
  assert.match(lyDoCap, KHUON_LY_DO, lyDoCap);
  assert.ok(lyDoCap.startsWith("lead_routing.first_call_minutes "), lyDoCap);
});

test("luật chia lead: đổi qua lối màn chỉ áp cho lead mới", async () => {
  const s = await sanMoi();
  const a = await nhap(s);
  await nhip(s);
  const CU = { routing_strategy: "zone_round_robin", accept_minutes: 15, first_call_minutes: 30 };
  assert.deepEqual(await dauLead(a), CU, "lead A đóng dấu theo mặc định lúc chia");

  const r = await doi(s, { "lead_routing.strategy": "company_round_robin", "lead_routing.accept_minutes": 20, "lead_routing.first_call_minutes": 40 });
  assert.equal(r.status, 200, await r.clone().text());
  const b = await nhap(s);
  await nhip(s);
  assert.deepEqual(await dauLead(b), { routing_strategy: "company_round_robin", accept_minutes: 20, first_call_minutes: 40 }, "lead mới theo luật mới");
  assert.deepEqual(await dauLead(a), CU, "lead đã chia đổi theo luật mới");
});

test("luật chia lead: vai khác 403 với từng khoá của màn", async () => {
  const s = await sanMoi();
  const hopLe: Record<(typeof SAU_KHOA)[number], unknown> = {
    "lead_routing.strategy": "manual",
    "lead_routing.accept_minutes": 20,
    "lead_routing.first_call_minutes": 50,
    "lead_routing.alert_to": "team_lead_and_admin",
    "queue.call_back_after_days": 21,
    "queue.price_negotiation_after_days": 11,
  };
  const banDau = giaTri(await doc(s));
  const truoc = (await suKien(s)).length;
  const ketQua: string[] = [];
  for (const vai of ["tn", "dc", "ts"] as const)
    for (const k of SAU_KHOA) ketQua.push(`${vai} ${k} ${(await doi(s, { [k]: hopLe[k] }, vai)).status}`);
  assert.deepEqual(
    ketQua,
    (["tn", "dc", "ts"] as const).flatMap((vai) => SAU_KHOA.map((k) => `${vai} ${k} 403`)),
  );
  assert.deepEqual(giaTri(await doc(s)), banDau, "vai khác không đổi được giá trị nào");
  assert.equal((await suKien(s)).length, truoc, "nhật ký không thêm dòng");
  // Đối chứng dương: quản trị đổi cùng khoá → 200.
  for (const k of SAU_KHOA) assert.equal((await doi(s, { [k]: hopLe[k] })).status, 200, k);
});

// ---- E5c ---- AC-5 phía máy chủ: từng giá trị sai màn chặn thì lối chung cũng từ chối 400, lý do mở đầu bằng đúng khoá
// (màn gắn lý do về dòng theo khoá ấy), không khoá nào được ghi, nhật ký không thêm dòng.
test("luật chia lead: giá trị sai bị máy chủ từ chối, không ghi gì", async () => {
  const s = await sanMoi();
  const banDau = giaTri(await doc(s));
  const truoc = (await suKien(s)).length;
  const ca: [string, Record<string, unknown>, string][] = [
    ["hạn nhận 0", { "lead_routing.accept_minutes": 0 }, "lead_routing.accept_minutes"],
    ["hạn nhận 1441", { "lead_routing.accept_minutes": 1441 }, "lead_routing.accept_minutes"],
    ["hạn nhận 15.5", { "lead_routing.accept_minutes": 15.5 }, "lead_routing.accept_minutes"],
    ["hạn nhận trống", { "lead_routing.accept_minutes": "" }, "lead_routing.accept_minutes"],
    ["hạn gọi nhỏ hơn hạn nhận", { "lead_routing.accept_minutes": 15, "lead_routing.first_call_minutes": 10 }, "lead_routing.first_call_minutes"],
    ["cần gọi lại 6", { "queue.call_back_after_days": 6 }, "queue.call_back_after_days"],
    ["cần gọi lại 31", { "queue.call_back_after_days": 31 }, "queue.call_back_after_days"],
    ["thương lượng giá 15", { "queue.price_negotiation_after_days": 15 }, "queue.price_negotiation_after_days"],
  ];
  for (const [ten, body, khoa] of ca) {
    const r = await doi(s, body);
    assert.equal(r.status, 400, `${ten}: ${await r.clone().text()}`);
    const lyDo = ((await r.json()) as { reason: string }).reason;
    assert.match(lyDo, KHUON_LY_DO, `${ten}: ${lyDo}`);
    assert.ok(lyDo.startsWith(khoa), `${ten}: lý do phải mở đầu bằng ${khoa}, nhận «${lyDo}»`);
  }
  assert.deepEqual(giaTri(await doc(s)), banDau, "không khoá nào được ghi");
  assert.equal((await suKien(s)).length, truoc, "nhật ký không thêm dòng");
  // Đối chứng dương: bộ đúng của màn (15/30/14/10) → 200 và được ghi.
  const dung = { "lead_routing.accept_minutes": 15, "lead_routing.first_call_minutes": 30, "queue.call_back_after_days": 14, "queue.price_negotiation_after_days": 10 };
  const ok = await doi(s, dung);
  assert.equal(ok.status, 200, await ok.clone().text());
  const sau = giaTri(await doc(s));
  for (const [k, v] of Object.entries(dung)) assert.equal(sau[k], v, k);
});

// ---- E7c ---- AC-7 phía máy chủ: (a) sàn có bộ nhóm Hôm nay riêng → lối bộ nhóm trả nguồn «company» (màn khoá hai
// ngưỡng theo nguồn này); (b) dòng cặp hạn trái luật có từ trước → lối chung trả `errors` nêu khoá hạn gọi, hai hạn chạy
// theo mặc định và lead mới mang mặc định. Ca (c) «lối chung không trả lời» không có hiệu ứng máy chủ để đo.
test("luật chia lead: hai trạng thái đặc biệt từ máy chủ", async () => {
  const s = await sanMoi();
  const nguon = async () => {
    const r = await send("GET", "/api/v1/company/settings/queue", undefined, s.nguoi.qt.cookie);
    assert.equal(r.status, 200, await r.clone().text());
    return (await r.json()) as { source: string; groups: unknown };
  };
  const dau = await nguon();
  assert.equal(dau.source, "default", "đối chứng: sàn mới dùng bộ nhóm mặc định");
  const r = await send("PUT", "/api/v1/company/settings/queue", { groups: dau.groups }, s.nguoi.qt.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  assert.equal((await nguon()).source, "company", "(a) sàn có bộ nhóm riêng → nguồn company");

  // (b) Dòng «có từ trước», không qua lối kiểm: hạn gọi 10 nhỏ hơn hạn nhận mặc định 15.
  assert.deepEqual((await doc(s)).errors, [], "đối chứng: chưa có dòng hỏng thì không báo");
  await appPool.query(
    `insert into company_settings (company_id, key, value, updated_by) values ($1, 'lead_routing.first_call_minutes', '10'::jsonb, $2)
     on conflict (company_id, key) do update set value = excluded.value`,
    [s.companyId, s.nguoi.qt.userId],
  );
  const ban = await doc(s);
  assert.equal(ban.errors.length, 1, ban.errors.join(" | "));
  assert.ok(ban.errors[0]!.startsWith("lead_routing.first_call_minutes"), ban.errors[0]);
  const v = giaTri(ban);
  assert.deepEqual([v["lead_routing.accept_minutes"], v["lead_routing.first_call_minutes"]], [15, 30], "hai hạn chạy theo mặc định");
  const id = await nhap(s);
  await nhip(s);
  const d = await dauLead(id);
  assert.deepEqual([d.accept_minutes, d.first_call_minutes], [15, 30], "lead mới mang mặc định, không mang 10");
});
