// Vá thông báo lead trên Postgres thật (hồ sơ va-thong-bao-lead: E4, E5, E6, E14, E15). Người theo bộ mẫu hàng 5 qua sàn
// thử của hàng 27; gửi đi qua bộ gửi giả bơm vào API — không gọi dịch vụ đẩy thật.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, test } from "node:test";
import { PUSH_SEND } from "@quy-hang/core/push";
import { createApi } from "../src/app";
import { withCompany } from "../src/db";
import { HAN_NHIP_MAC_DINH, runLeadTick } from "../src/jobs/lead-tick";
import type { PushResult, PushSender } from "../src/push/gui";
import { luuDangKy } from "../src/push/store";
import { appPool, BASE_URL, cleanup, identityPool, makeAuth, RUN } from "./helpers";
import { hangCoChu, nam, sanMoi, soMoi, type San } from "./san-thu";

after(cleanup);

const daGui: string[] = [];
let traLoi: (endpoint: string) => Promise<PushResult> = async () => ({ ok: true });
const guiGia: PushSender = (t) => {
  daGui.push(t.endpoint);
  return traLoi(t.endpoint);
};
const treo = () => new Promise<PushResult>(() => {});
const { auth } = makeAuth();
const app = createApi({ appPool, identityPool, auth, pushSender: guiGia });
const send = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

const DOI = { ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] }, dc2: { vai: ["listing_agent"], khu: ["Toà B"] } };
const fcm = (s: San, k: string, t = "1") => `https://fcm.googleapis.com/fcm/send/${RUN}/${s.companyId}/${k}/${t}`;
const khoa = () => ({ p256dh: randomBytes(65).toString("base64url"), auth: randomBytes(16).toString("base64url") });
const dangKy = (s: San, k: string, endpoint: string, cookie = s.nguoi[k]!.cookie) =>
  send("POST", "/api/v1/me/push-subscriptions", { endpoint, expirationTime: null, keys: khoa() }, cookie);
const dangKyCua = async (s: San, k: string) =>
  (await appPool.query<{ endpoint: string }>("select endpoint from push_subscriptions where company_id = $1 and user_id = $2 order by endpoint", [
    s.companyId,
    s.nguoi[k]!.userId,
  ])).rows.map((r) => r.endpoint);
type DongHop = { id: string; attempts: number; sent_at: Date | null; last_error: string | null };
const hopThuDi = async (s: San) =>
  (await appPool.query<DongHop>("select id, attempts, sent_at, last_error from push_outbox where company_id = $1 order by id", [s.companyId])).rows;
async function nhapLeadVe(s: San, k: string, can: string) {
  const so = soMoi(s);
  await hangCoChu(s, k, can, so);
  const bd = Date.now();
  const r = await send("POST", "/api/v1/leads", nam(so, "Toà A"), s.nguoi.ts!.cookie);
  const ms = Date.now() - bd;
  assert.equal(r.status, 201, await r.clone().text());
  return { ...((await r.json()) as { id: string; outcome: string }), ms };
}

test("AC-2 đăng ký địa chỉ lạ bị từ chối, không lưu dòng nào", async () => {
  const s = await sanMoi(DOI);
  const LA = [
    `https://push.example.test/${RUN}/la`,
    "https://169.254.169.254/latest/meta-data",
    `https://fcm.googleapis.com.evil.test/${RUN}`,
    `http://fcm.googleapis.com/fcm/send/${RUN}`,
  ];
  for (const d of LA) {
    const truoc = (await dangKyCua(s, "dc1")).length;
    const r = await dangKy(s, "dc1", d);
    assert.equal(r.status, 400, `ô ${d}: ${await r.clone().text()}`);
    assert.equal((await dangKyCua(s, "dc1")).length, truoc, `ô ${d} lưu dòng`);
  }
  const r = await dangKy(s, "dc1", fcm(s, "dc1"));
  assert.equal(r.status, 201, await r.clone().text());
  assert.deepEqual(await dangKyCua(s, "dc1"), [fcm(s, "dc1")], "đối chứng dương: địa chỉ fcm lưu được");
});

test("AC-3 đăng ký cũ địa chỉ lạ: không gửi tới, bị gỡ; thiết bị thật vẫn nhận", async () => {
  const s = await sanMoi(DOI);
  assert.equal((await dangKy(s, "dc1", fcm(s, "dc1"))).status, 201);
  const la = `https://push.example.test/${RUN}/${s.companyId}/cu`;
  // Dòng lưu trước bản vá: đi thẳng hàm lưu của kho dưới ngữ cảnh người ấy (không qua khuôn của đường API).
  await withCompany(appPool, { userId: s.nguoi.dc1!.userId, companyId: s.companyId }, (tx) => luuDangKy(tx, { endpoint: la, keys: khoa() }));
  assert.equal((await dangKyCua(s, "dc1")).length, 2, "đối chứng: đăng ký lạ có mặt trước khi gửi");
  const tu = daGui.length;
  await nhapLeadVe(s, "dc1", "A-21.01");
  assert.deepEqual(daGui.slice(tu), [fcm(s, "dc1")], "bộ gửi được gọi tới");
  assert.deepEqual(await dangKyCua(s, "dc1"), [fcm(s, "dc1")], "đăng ký còn lại");
});

test("AC-6 dịch vụ đẩy treo: nhập lead trả lời trong hạn lối giao, một dòng thử, hai dòng chờ", async () => {
  const s = await sanMoi(DOI);
  for (const t of ["1", "2", "3"]) assert.equal((await dangKy(s, "dc1", fcm(s, "dc1", t))).status, 201);
  traLoi = treo;
  try {
    const l = await nhapLeadVe(s, "dc1", "A-22.01");
    const ms = l.ms;
    assert.equal(l.outcome, "owner_has_agent", "lead giao ngay cho dc1");
    assert.ok(ms < 8_000, `nhập lead mất ${ms} ms`);
    const dongs = await hopThuDi(s);
    const thu = dongs.filter((d) => d.attempts === 1);
    const cho = dongs.filter((d) => d.attempts === 0);
    assert.equal(dongs.length, 3, "ba dòng");
    assert.equal(thu.length, 1, `số dòng đã thử ${thu.length}, ${ms} ms`);
    assert.ok(thu[0]!.sent_at === null && thu[0]!.last_error?.includes("quá hạn gửi"), `dòng thử: ${JSON.stringify(thu[0])}`);
    assert.equal(cho.length, 2, "hai dòng chưa thử");
    // Giữ chỗ một phút của migration 018, hai chiều: chưa quá một phút không nhận lại, quá thì nhận.
    const nhan = (luc: Date) =>
      withCompany(appPool, { userId: "", companyId: s.companyId }, async (tx) =>
        (await tx.query<{ id: string }>("select id from app.push_outbox_claim($1, 3, 15, false)", [luc])).rows.map((r) => r.id),
      );
    const idCho = cho.map((d) => d.id).sort();
    const giu = (await appPool.query<{ t: Date }>("select max(claimed_at) t from push_outbox where id = any($1)", [idCho])).rows[0]!.t;
    assert.ok(giu instanceof Date, "dòng chưa thử không mang mốc giữ");
    assert.deepEqual((await nhan(new Date(giu.getTime() + 59_000))).filter((id) => idCho.includes(id)), [], "nhận lại ở t + 59 giây");
    assert.deepEqual((await nhan(new Date(giu.getTime() + 61_000))).filter((id) => idCho.includes(id)).sort(), idCho, "nhận lại ở t + 61 giây");
  } finally {
    traLoi = async () => ({ ok: true });
  }
});

/** Sáu dòng chờ trong khung: đầu chủ có sáu thiết bị, lead giao khi dịch vụ đẩy trả lỗi tạm 500. */
async function sauDongCho() {
  const s = await sanMoi(DOI);
  for (const t of ["1", "2", "3", "4", "5", "6"]) assert.equal((await dangKy(s, "dc1", fcm(s, "dc1", t))).status, 201);
  traLoi = async () => ({ ok: false, status: 500, error: "500" });
  try {
    await nhapLeadVe(s, "dc1", "A-23.01");
  } finally {
    traLoi = async () => ({ ok: true });
  }
  const dongs = await hopThuDi(s);
  assert.deepEqual(dongs.map((d) => d.attempts), [1, 1, 1, 1, 1, 1], "sáu dòng lỗi tạm");
  return { s, t0: new Date() };
}

test("AC-5 nhịp chia dừng ở hạn chót của nó; dòng chưa thử giữ nguyên", async () => {
  assert.deepEqual(HAN_NHIP_MAC_DINH, { timeoutMs: PUSH_SEND.timeoutMs, budgetMs: PUSH_SEND.tickBudgetMs }, "thời hạn mặc định của nhịp");
  const { s, t0 } = await sauDongCho();
  const bd = Date.now();
  await runLeadTick(appPool, new Date(t0.getTime() + 61_000), [s.companyId], () => treo(), { timeoutMs: 500, budgetMs: 2_000 });
  const ms = Date.now() - bd;
  const thu = (await hopThuDi(s)).filter((d) => d.attempts === 2).length;
  assert.ok(ms < 3_000, `nhịp mất ${ms} ms`);
  assert.ok(thu >= 1 && thu < 6, `số dòng nhịp đã thử ${thu}`);
  assert.equal((await hopThuDi(s)).filter((d) => d.attempts === 1).length, 6 - thu, "dòng chưa thử giữ nguyên lần");
});

test("AC-5 đối chứng đỏ: bỏ hạn chót thì nhịp thử đủ sáu dòng và quá ba giây", async () => {
  const { s, t0 } = await sauDongCho();
  const bd = Date.now();
  await runLeadTick(appPool, new Date(t0.getTime() + 61_000), [s.companyId], () => treo(), { timeoutMs: 500, budgetMs: 600_000 });
  const ms = Date.now() - bd;
  const thu = (await hopThuDi(s)).filter((d) => d.attempts === 2).length;
  assert.equal(thu, 6, `bỏ hạn chót: ${thu} dòng, ${ms} ms`);
  assert.ok(ms >= 3_000, `bỏ hạn chót: ${thu} dòng, ${ms} ms`);
});

test("AC-8 đăng xuất với địa chỉ lạ vẫn hết phiên, không gỡ gì; địa chỉ fcm gỡ đúng thiết bị", async () => {
  const s = await sanMoi(DOI);
  assert.equal((await dangKy(s, "dc1", fcm(s, "dc1"))).status, 201);
  assert.equal((await dangKy(s, "dc2", fcm(s, "dc2"))).status, 201);
  let r = await send("POST", "/api/v1/auth/sign-out", { pushEndpoint: `https://push.example.test/${RUN}/x` }, s.nguoi.dc1!.cookie);
  assert.ok(r.status >= 200 && r.status < 300, `đăng xuất địa chỉ lạ: ${r.status} ${await r.clone().text()}`);
  assert.equal((await send("GET", "/api/v1/me", undefined, s.nguoi.dc1!.cookie)).status, 401, "phiên còn sau đăng xuất");
  assert.deepEqual(await dangKyCua(s, "dc1"), [fcm(s, "dc1")], "địa chỉ lạ gỡ mất đăng ký");
  r = await send("POST", "/api/v1/auth/sign-out", { pushEndpoint: fcm(s, "dc2") }, s.nguoi.dc2!.cookie);
  assert.ok(r.status >= 200 && r.status < 300, `đăng xuất địa chỉ fcm: ${r.status}`);
  assert.deepEqual(await dangKyCua(s, "dc2"), [], "đối chứng dương: địa chỉ fcm gỡ đúng thiết bị");
});
