// Tab Tôi trên Postgres thật (hàng 38: E5, E6, E7, E9, E11b). Người X thuộc hai sàn, đăng nhập trên ba máy; người Y là
// người khác cùng sàn. Gửi đẩy đi qua bộ gửi giả ghi thứ tự — không gọi dịch vụ đẩy thật.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { NextRequest, NextResponse } from "next/server";
import { refreshSessionCookie } from "../../../../apps/web/src/lib/session-refresh";
import { SESSION_EXPIRES_SEC } from "../../src/auth/constants";
import { bamPhien, docDau, ghiDau, maPhienTuCookie } from "../../src/auth/may-bi-bao";
import { createApi } from "../../src/app";
import type { PushSender } from "../../src/push/gui";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

type Lan = { loai: "gui" | "go"; endpoint: string; tag?: string; keys?: string[] };
const nhatKy: Lan[] = [];
let guiHong = false;
const guiGia: PushSender = async (t, payload) => {
  if (guiHong) throw new Error("dịch vụ đẩy giả hỏng");
  nhatKy.push({ loai: "gui", endpoint: t.endpoint, tag: payload.tag, keys: Object.keys(payload).sort() });
  return { ok: true };
};
const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth, pushSender: guiGia });

const UA = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
};

const send = (method: string, path: string, cookie: string, body?: unknown, ua = UA.mac) =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, "user-agent": ua, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function dangNhap(email: string, ua: string): Promise<string> {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", "", { email, type: "sign-in" }, ua);
  const ma = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(ma, `không có mã cho ${email}`);
  const r = await send("POST", "/api/v1/auth/sign-in/email-otp", "", { email, otp: ma.otp }, ua);
  assert.equal(r.status, 200);
  return cookieOf(r);
}

const diaChi = (k: string) => `https://fcm.googleapis.com/fcm/send/${RUN}/${k}`;
async function bat(cookie: string, san: string, k: string) {
  const r = await send("POST", "/api/v1/me/push-subscriptions", `${cookie}; qh_san=${san}`, {
    endpoint: diaChi(k),
    expirationTime: null,
    keys: { p256dh: "B".repeat(87), auth: "A".repeat(22) },
  });
  assert.equal(r.status, 201, await r.clone().text());
}
const dangKyCon = async (endpoint: string) =>
  (await appPool.query("select company_id::text from push_subscriptions where endpoint = $1 order by 1", [endpoint])).rows.map((r) => r.company_id);
const conPhien = async (cookie: string) => (await auth.api.getSession({ headers: new Headers({ cookie }) })) !== null;

/** X thuộc S1, S2, đăng nhập trên A (Mac), B (iPhone), C (Android) và có một phiên đã hết hạn; Y cùng S1, một máy. */
async function dung(nhan: string) {
  const xEmail = mail(`${nhan}-x`);
  const s1 = await openCompany(`[Sàn ${RUN} tab-toi ${nhan} 1]`, mail(`${nhan}-qt1`));
  const s2 = await openCompany(`[Sàn ${RUN} tab-toi ${nhan} 2]`, mail(`${nhan}-qt2`));
  const x = await createLoneUser(xEmail);
  const yEmail = mail(`${nhan}-y`);
  const y = await createLoneUser(yEmail);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{listing_agent}'), ($3, $2, '{listing_agent}'), ($1, $4, '{listing_agent}')", [
    s1.companyId,
    x,
    s2.companyId,
    y,
  ]);
  const A = await dangNhap(xEmail, UA.mac);
  const B = await dangNhap(xEmail, UA.iphone);
  const C = await dangNhap(xEmail, UA.android);
  const Y = await dangNhap(yEmail, UA.mac);
  await identityPool.query(
    `insert into identity.session (id, "expiresAt", token, "updatedAt", "userAgent", "userId") values ($1, now() - interval '1 day', $2, now() - interval '40 days', $3, $4)`,
    [`het-${RUN}-${nhan}`, `het${RUN}${nhan}`.padEnd(32, "0"), UA.iphone, x],
  );
  return { s1: s1.companyId, s2: s2.companyId, x, y, A, B, C, Y };
}

test("E5 danh sách máy: đúng ba máy còn sống của người, một «máy này», không mã phiên, không máy của người khác", async () => {
  const d = await dung("e5");
  const r = await send("GET", "/api/v1/me/devices", d.A);
  assert.equal(r.status, 200);
  const than = await r.text();
  const { devices } = JSON.parse(than) as { devices: { kind: string; current: boolean; lastUsedAt: string; browser: string }[] };
  assert.equal(devices.length, 3, than);
  assert.deepEqual(devices.map((x) => x.kind).sort(), ["android", "iphone", "may-tinh"]);
  assert.equal(devices.filter((x) => x.current).length, 1);
  assert.equal(devices.find((x) => x.current)!.kind, "may-tinh");
  for (const x of devices) assert.ok(!Number.isNaN(Date.parse(x.lastUsedAt)));
  for (const c of [d.A, d.B, d.C, d.Y]) assert.ok(!than.includes(maPhienTuCookie(c)!), "lộ mã phiên trong thân trả");
  const cuaY = JSON.parse(await (await send("GET", "/api/v1/me/devices", d.Y)).text()) as { devices: unknown[] };
  assert.equal(cuaY.devices.length, 1, "lộ phiên người khác");
});

test("E6, E11b báo mất máy: thu B, C; gửi lệnh xoá rồi gỡ ở cả hai sàn; giữ A; không đụng Y; dấu là băm", async () => {
  const d = await dung("e6");
  await bat(d.A, d.s1, "e6-A");
  await bat(d.B, d.s1, "e6-B");
  await bat(d.C, d.s2, "e6-C");
  await bat(d.Y, d.s1, "e6-Y");
  // Bộ gửi giả ghi «gửi»; dòng «gỡ» ghi khi thấy đăng ký mất khỏi bảng sau lời gọi.
  nhatKy.length = 0;
  const r = await send("POST", "/api/v1/me/devices/report-lost", `${d.A}; qh_san=${d.s1}`, { pushEndpoint: diaChi("e6-A") });
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual(await r.json(), { revoked: 2 });

  assert.equal(await conPhien(d.B), false, "phiên B còn");
  assert.equal(await conPhien(d.C), false, "phiên C còn");
  assert.equal(await conPhien(d.A), true, "máy đang bấm mất phiên");
  assert.equal(await conPhien(d.Y), true, "phiên người khác bị thu");
  assert.deepEqual(await dangKyCon(diaChi("e6-B")), [], "đăng ký B ở S1 còn");
  assert.deepEqual(await dangKyCon(diaChi("e6-C")), [], "đăng ký C ở S2 còn");
  assert.deepEqual(await dangKyCon(diaChi("e6-A")), [d.s1], "đăng ký máy đang bấm bị gỡ");
  assert.deepEqual(await dangKyCon(diaChi("e6-Y")), [d.s1], "đăng ký người khác bị gỡ");

  // E11b: mỗi máy bị báo đúng một tin xoa-may, đúng bốn khoá; máy đang bấm và người khác không nhận.
  const gui = nhatKy.filter((l) => l.loai === "gui");
  assert.deepEqual(gui.map((l) => l.endpoint).sort(), [diaChi("e6-B"), diaChi("e6-C")].sort(), "B không nhận lệnh");
  for (const l of gui) {
    assert.equal(l.tag, "xoa-may");
    assert.deepEqual(l.keys, ["body", "tag", "title", "url"]);
  }

  const dau = await identityPool.query<{ token_hash: string }>("select token_hash from identity.reported_device where user_id = $1 order by 1", [d.x]);
  assert.deepEqual(dau.rows.map((x) => x.token_hash), [maPhienTuCookie(d.B)!, maPhienTuCookie(d.C)!].map(bamPhien).sort());
  const tho = await identityPool.query("select 1 from identity.reported_device where token_hash = any($1)", [[maPhienTuCookie(d.B), maPhienTuCookie(d.C)]]);
  assert.equal(tho.rowCount, 0, "lưu mã phiên thô");
});

test("E11b gửi trước khi gỡ: lúc bộ gửi nhận tin, đăng ký của máy bị báo còn trong bảng; gửi hỏng vẫn thu và gỡ", async () => {
  const d = await dung("e11");
  await bat(d.B, d.s1, "e11-B");
  const conLucGui: boolean[] = [];
  const app2 = createApi({
    appPool,
    identityPool,
    auth,
    pushSender: async (t) => {
      conLucGui.push((await dangKyCon(t.endpoint)).length > 0);
      return { ok: true };
    },
  });
  const r = await app2.request(`${BASE_URL}/api/v1/me/devices/report-lost`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE_URL, cookie: d.A },
    body: "{}",
  });
  assert.equal(r.status, 200);
  assert.deepEqual(conLucGui, [true], "gỡ đăng ký trước rồi mới gửi");

  const d2 = await dung("e11h");
  await bat(d2.B, d2.s1, "e11h-B");
  guiHong = true;
  try {
    const r2 = await send("POST", "/api/v1/me/devices/report-lost", d2.A, {});
    assert.equal(r2.status, 200);
  } finally {
    guiHong = false;
  }
  assert.equal(await conPhien(d2.B), false, "gửi hỏng chặn việc thu phiên");
  assert.deepEqual(await dangKyCon(diaChi("e11h-B")), [], "gửi hỏng chặn việc gỡ đăng ký");
});

test("E7 máy bị báo chạm máy chủ: 401 mang device_reported_lost ở /me, đường đọc và đường ghi; hết phiên thường không mang mã", async () => {
  const d = await dung("e7");
  await send("POST", "/api/v1/me/devices/report-lost", d.A, {});
  for (const [m, p, b] of [
    ["GET", "/api/v1/me", undefined],
    ["GET", "/api/v1/listings", undefined],
    ["POST", "/api/v1/me/push-subscriptions", { endpoint: diaChi("e7-B"), expirationTime: null, keys: { p256dh: "B".repeat(87), auth: "A".repeat(22) } }],
  ] as const) {
    const r = await send(m, p, `${d.B}; qh_san=${d.s1}`, b);
    assert.equal(r.status, 401, `${m} ${p}`);
    assert.deepEqual(await r.json(), { error: "device_reported_lost", userId: d.x }, `401 không mã ở ${m} ${p}`);
  }
  // Đối chứng: phiên của Y bị xoá thẳng (không qua báo mất) → 401 không mã.
  await identityPool.query("delete from identity.session where token = $1", [maPhienTuCookie(d.Y)]);
  const r = await send("GET", "/api/v1/me", d.Y);
  assert.equal(r.status, 401);
  assert.notEqual(((await r.json()) as { error: string }).error, "device_reported_lost");
  // Đăng nhập lại trên B dùng bình thường.
  const moi = await dangNhap(mail("e7-x"), UA.iphone);
  assert.equal((await send("GET", "/api/v1/me", moi)).status, 200);
});

test("E7 bước chặn đầu của trang giữ cookie của phiên bị báo cho màn đăng nhập; hết phiên thường vẫn xoá cookie", async () => {
  const d = await dung("e7-coc");
  await send("POST", "/api/v1/me/devices/report-lost", d.A, {});
  const cookieXoa = async (cookie: string) =>
    (await refreshSessionCookie(new NextRequest(`${BASE_URL}/today`, { headers: { cookie } }), NextResponse.next(), app)).headers
      .getSetCookie()
      .filter((c) => c.includes("session_token"));
  assert.deepEqual(await cookieXoa(d.B), [], "phiên bị báo mà trang vẫn xoá cookie — màn đăng nhập không còn biết máy bị báo");
  // Đối chứng: phiên của Y bị xoá thẳng (hết phiên thường) → better-auth xoá cookie như cũ.
  await identityPool.query("delete from identity.session where token = $1", [maPhienTuCookie(d.Y)]);
  const xoaY = await cookieXoa(d.Y);
  assert.ok(xoaY.length > 0 && xoaY.every((c) => /Max-Age=0/i.test(c)), `hết phiên thường mà cookie không bị xoá: ${xoaY.join(" | ")}`);
});

test("E9 hạn dấu bằng lúc thu cộng hạn phiên; dấu quá hạn không làm máy bị xoá; chiều đỏ dấu ngắn hơn phiên", async () => {
  const d = await dung("e9");
  const truoc = Date.now();
  await send("POST", "/api/v1/me/devices/report-lost", d.A, {});
  const { rows } = await identityPool.query<{ reported_at: Date; expires_at: Date }>(
    "select reported_at, expires_at from identity.reported_device where token_hash = $1",
    [bamPhien(maPhienTuCookie(d.B)!)],
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.expires_at.getTime() - rows[0]!.reported_at.getTime(), SESSION_EXPIRES_SEC * 1000);
  assert.ok(rows[0]!.expires_at.getTime() >= truoc + SESSION_EXPIRES_SEC * 1000 - 5000, "dấu hết trước phiên");

  // Dấu quá hạn: lời gọi bằng mã ấy trả 401 không mã.
  const tokenC = maPhienTuCookie(d.C)!;
  await identityPool.query("update identity.reported_device set reported_at = now() - interval '61 days', expires_at = now() - interval '1 second' where token_hash = $1", [bamPhien(tokenC)]);
  const r = await send("GET", "/api/v1/me", d.C);
  assert.equal(r.status, 401);
  assert.notEqual(((await r.json()) as { error: string }).error, "device_reported_lost");
  assert.equal(await docDau(identityPool, tokenC, new Date()), null);

  // Chiều đỏ: một bộ ghi dấu đặt hạn ngắn hơn hạn phiên thì thước trên đỏ.
  const banSao = async (token: string, now: Date) =>
    identityPool.query("insert into identity.reported_device (token_hash, user_id, reported_at, expires_at) values ($1, $2, $3, $4)", [
      bamPhien(token),
      d.x,
      now,
      new Date(now.getTime() + (SESSION_EXPIRES_SEC - 86400) * 1000),
    ]);
  const gia = `gia${RUN}`.padEnd(32, "0");
  const luc = new Date();
  await banSao(gia, luc);
  const g = await identityPool.query<{ reported_at: Date; expires_at: Date }>("select reported_at, expires_at from identity.reported_device where token_hash = $1", [bamPhien(gia)]);
  assert.notEqual(g.rows[0]!.expires_at.getTime() - g.rows[0]!.reported_at.getTime(), SESSION_EXPIRES_SEC * 1000, "thước không bắt được dấu hết trước phiên");
  await ghiDau(identityPool, { tokens: [gia], userId: d.x, now: luc });
  const g2 = await identityPool.query<{ reported_at: Date; expires_at: Date }>("select reported_at, expires_at from identity.reported_device where token_hash = $1", [bamPhien(gia)]);
  assert.equal(g2.rows[0]!.expires_at.getTime() - g2.rows[0]!.reported_at.getTime(), SESSION_EXPIRES_SEC * 1000);
});
