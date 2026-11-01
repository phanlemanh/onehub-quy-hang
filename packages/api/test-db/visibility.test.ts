// Trục ai thấy hàng qua API trên Postgres thật (hàng 12: AC-3..AC-10). Hai sàn; sàn A có người mở sàn (quản trị), X
// (đầu chủ, người tạo hàng), Y (đầu khách), T (trưởng nhóm); sàn B có Z.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { visibilityOf, factsFromEvents } from "@quy-hang/core/visibility";
import type { ListingEvent } from "@quy-hang/core/listing";
import { createApi } from "../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN, themAnhThat } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const req = (path: string, cookie = "", init: RequestInit = {}) =>
  app.request(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
  });
const send = (method: string, path: string, body: unknown, cookie = "") => req(path, cookie, { method, body: JSON.stringify(body) });

async function login(email: string): Promise<string> {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

type View = { id: string; version: number; standardStatus: string; visibility: string; events?: ListingEvent[] };
type Nguoi = { cookie: string };
let A: Nguoi, X: Nguoi, Y: Nguoi, T: Nguoi, Z: Nguoi;

before(async () => {
  const qtA = mail("truc-qt-a");
  const sA = await openCompany(`[Sàn ${RUN} trục A]`, qtA);
  A = { cookie: `${await login(qtA)}; qh_san=${sA.companyId}` };
  const thanhVien = async (ai: string, roles: string[]) => {
    const email = mail(`truc-${ai}`);
    const r = await send("POST", "/api/v1/company/members", { email, roles }, A.cookie);
    assert.equal(r.status, 201, `mời ${ai}: ${await r.clone().text()}`);
    return { cookie: `${await login(email)}; qh_san=${sA.companyId}` };
  };
  X = await thanhVien("x", ["listing_agent"]);
  Y = await thanhVien("y", ["buyer_agent"]);
  T = await thanhVien("t", ["team_lead"]);
  const qtB = mail("truc-qt-b");
  const sB = await openCompany(`[Sàn ${RUN} trục B]`, qtB);
  Z = { cookie: `${await login(qtB)}; qh_san=${sB.companyId}` };
});

const GIA = { listPrice: 3_500_000_000, feeInclusion: "excluded" };
const DU = { legalStatus: "pink_book", occupantType: "vacant" };
const danhSach = async (n: Nguoi) => {
  const r = await req("/api/v1/listings", n.cookie);
  assert.equal(r.status, 200);
  return (await r.json()) as View[];
};
const docMot = (n: Nguoi, id: string) => req(`/api/v1/listings/${id}`, n.cookie);
const lenh = (n: Nguoi, id: string, body: unknown) => send("POST", `/api/v1/listings/${id}/events`, body, n.cookie);
const demSuKien = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;
const banTinh = async (id: string) => (await appPool.query("select to_jsonb(l) j from listings l where id = $1", [id])).rows[0]!.j;
const than = async (r: Response) => ({ status: r.status, body: await r.json() });

async function taoHang(n: Nguoi): Promise<View> {
  const r = await send("POST", "/api/v1/listings", { buildingName: "[Toà mẫu]", unitNumber: "A-1201" }, n.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as View;
}
/** Gửi một lệnh hợp lệ của người tạo, trả hàng sau lệnh. */
async function buoc(n: Nguoi, h: View, type: string, payload: object): Promise<View> {
  const r = await lenh(n, h.id, { type, payload, expectedVersion: h.version });
  assert.equal(r.status, 200, `${type}: ${await r.clone().text()}`);
  return (await r.json()) as View;
}
async function lenDangBan(n: Nguoi, h: View): Promise<View> {
  await themAnhThat(h.id); // hàng 23: vào Đang bán cần ảnh thật
  h = await buoc(n, h, "price_changed", GIA);
  h = await buoc(n, h, "details_changed", DU);
  return buoc(n, h, "status_changed", { to: "Active" });
}

test("danh sách: Chỉ tôi chỉ người tạo thấy, lên Toàn sàn thì cả sàn thấy", async () => {
  let h = await taoHang(X);
  assert.equal(h.visibility, "Private", "hàng mới không ra Chỉ tôi");
  // Đối chứng dương: người tạo thấy hàng của mình.
  assert.equal((await danhSach(X)).find((v) => v.id === h.id)?.visibility, "Private", "danh sách của X thiếu hàng Chỉ tôi của X");
  assert.ok(!(await danhSach(Y)).some((v) => v.id === h.id), "danh sách của Y lộ hàng Chỉ tôi");
  h = await lenDangBan(X, h);
  assert.equal(h.visibility, "Company");
  assert.equal((await danhSach(Y)).find((v) => v.id === h.id)?.visibility, "Company", "lên Toàn sàn mà Y vẫn không thấy");
});

test("đọc một hàng: Chỉ tôi của người khác trả 404 như hàng không có", async () => {
  let h = await taoHang(X);
  assert.equal((await docMot(X, h.id)).status, 200, "người tạo không đọc được hàng của mình");
  const khongCo = await than(await docMot(Y, randomUUID()));
  assert.equal(khongCo.status, 404);
  assert.deepEqual(await than(await docMot(Y, h.id)), khongCo, "Y đọc hàng Chỉ tôi của X không nhận đúng câu trả lời của hàng không có");
  h = await lenDangBan(X, h);
  const r = await docMot(Y, h.id);
  assert.equal(r.status, 200, "lên Toàn sàn mà Y vẫn không đọc được");
  const v = (await r.json()) as View;
  assert.equal(v.visibility, "Company");
  assert.equal(v.events?.length, 4, "Y đọc được hàng nhưng thiếu lịch sử sự kiện");
});

test("lệnh vào hàng Chỉ tôi của người khác trả 404, không ghi", async () => {
  let h = await taoHang(X);
  const LENH: [string, (v: number) => unknown][] = [
    ["hợp lệ đúng phiên bản", (v) => ({ type: "owner_confirmed", payload: {}, expectedVersion: v })],
    ["sai phiên bản", (v) => ({ type: "owner_confirmed", payload: {}, expectedVersion: v + 7 })],
    ["sai khuôn", (v) => ({ type: "price_changed", payload: { ownerPhone: "0900 000 001" }, expectedVersion: v })],
  ];
  const truocSuKien = await demSuKien(h.id);
  const truocBanTinh = await banTinh(h.id);
  for (const [ten, body] of LENH) {
    const khongCo = await than(await lenh(Y, randomUUID(), body(h.version)));
    assert.equal(khongCo.status, 404, `${ten}: mã không có không trả 404`);
    const kq = await than(await lenh(Y, h.id, body(h.version)));
    assert.deepEqual(kq, khongCo, `${ten}: Y gửi lệnh vào hàng Chỉ tôi nhận ${kq.status} ${JSON.stringify(kq.body)}, không như hàng không có`);
  }
  assert.equal(await demSuKien(h.id), truocSuKien, "lệnh của Y vẫn để lại sự kiện");
  assert.deepEqual(await banTinh(h.id), truocBanTinh, "lệnh của Y đổi bản tính");
  // Đối chứng dương cùng hàng: người tạo ghi được.
  h = await buoc(X, h, "owner_confirmed", {});
  h = await lenDangBan(X, h);
  // Lên Toàn sàn: mọi thành viên sàn gửi lệnh được (Hỏi-2).
  const r = await lenh(Y, h.id, { type: "owner_confirmed", payload: {}, expectedVersion: h.version });
  assert.equal(r.status, 200, `lên Toàn sàn mà lệnh của Y bị từ chối: ${await r.clone().text()}`);
});

test("đã lên Toàn sàn thì giữ: tạm ngừng vẫn cả sàn thấy", async () => {
  let h = await lenDangBan(X, await taoHang(X));
  h = await buoc(X, h, "status_changed", { to: "Hold" });
  const v = (await danhSach(Y)).find((x) => x.id === h.id);
  assert.ok(v, "Y mất hàng sau Hold");
  assert.deepEqual([v.visibility, v.standardStatus], ["Company", "Hold"]);
  assert.equal((await docMot(Y, h.id)).status, 200, "Y không đọc được hàng sau Hold");
});

test("sàn khác không thấy hàng ở cả hai nấc", async () => {
  let h = await taoHang(X);
  const kiemZ = async (nac: string) => {
    assert.ok(!(await danhSach(Z)).some((v) => v.id === h.id), `sàn B thấy hàng sàn A (${nac})`);
    assert.deepEqual(await than(await docMot(Z, h.id)), await than(await docMot(Z, randomUUID())), `sàn B đọc mã hàng sàn A (${nac}) không như hàng không có`);
  };
  await kiemZ("Chỉ tôi");
  h = await lenDangBan(X, h);
  // Đối chứng dương: cùng lúc ấy Y ở sàn A thấy hàng.
  assert.ok((await danhSach(Y)).some((v) => v.id === h.id), "Y cùng sàn không thấy hàng đã lên Toàn sàn");
  await kiemZ("Toàn sàn");
});

test("vai không mở Chỉ tôi: quản trị sàn, trưởng nhóm", async () => {
  const h = await taoHang(X);
  assert.equal((await docMot(X, h.id)).status, 200, "người tạo không đọc được hàng của mình");
  for (const [vai, n] of [["company_admin", A], ["team_lead", T]] as const) {
    assert.ok(!(await danhSach(n)).some((v) => v.id === h.id), `vai ${vai} thấy hàng Chỉ tôi trong danh sách`);
    assert.deepEqual(await than(await docMot(n, h.id)), await than(await docMot(n, randomUUID())), `vai ${vai} đọc được hàng Chỉ tôi`);
    const body = { type: "owner_confirmed", payload: {}, expectedVersion: h.version };
    assert.deepEqual(await than(await lenh(n, h.id, body)), await than(await lenh(n, randomUUID(), body)), `vai ${vai} gửi lệnh vào hàng Chỉ tôi`);
  }
  assert.equal(await demSuKien(h.id), 1, "lệnh của vai cao để lại sự kiện");
});

test("nấc của danh sách khớp nấc gấp từ sự kiện", async () => {
  const DUONG: [string, (h: View) => Promise<View>, string][] = [
    ["chỉ tạo", async (h) => h, "Private"],
    ["tạo→Hold", (h) => buoc(X, h, "status_changed", { to: "Hold" }), "Private"],
    ["tạo→Active", (h) => lenDangBan(X, h), "Company"],
    ["tạo→Active→Hold", async (h) => buoc(X, await lenDangBan(X, h), "status_changed", { to: "Hold" }), "Company"],
    [
      "tạo→Hold→Active",
      async (h) => {
        h = await buoc(X, h, "price_changed", GIA);
        h = await buoc(X, h, "details_changed", DU);
        h = await buoc(X, h, "status_changed", { to: "Hold" });
        await themAnhThat(h.id);
        return buoc(X, h, "status_changed", { to: "Active" });
      },
      "Company",
    ],
  ];
  const hang: [string, string, string][] = [];
  for (const [ten, di, mong] of DUONG) hang.push([ten, (await di(await taoHang(X))).id, mong]);
  const ds = await danhSach(X);
  let soDanhSach = 0;
  let soGap = 0;
  for (const [ten, id, mong] of hang) {
    const trongDanhSach = ds.find((v) => v.id === id)?.visibility;
    const events = ((await (await docMot(X, id)).json()) as View).events!;
    const gap = visibilityOf(factsFromEvents(events));
    assert.equal(trongDanhSach, mong, `${ten}: nấc trong danh sách`);
    soDanhSach++;
    assert.equal(gap, mong, `${ten}: nấc gấp từ sự kiện`);
    soGap++;
  }
  assert.deepEqual([soDanhSach, soGap], [DUONG.length, DUONG.length]);
});

test("lời gọi chủ nhà vào hàng Chỉ tôi của người khác trả 404", async () => {
  const h = await taoHang(X);
  const CHU = { ownerName: "[Tên chủ mẫu]", ownerPhone: "0900 000 012" };
  assert.equal((await send("PUT", `/api/v1/listings/${h.id}/owner`, CHU, X.cookie)).status, 200, "người tạo không đặt được chủ nhà");
  for (const [m, duoi, body] of [
    ["GET", "/owner", undefined],
    ["PUT", "/owner", CHU],
    ["POST", "/owner/phone-reveal", undefined],
    ["PUT", "/listing-agent", { userId: randomUUID() }],
  ] as const) {
    const khongCo = await than(await send(m, `/api/v1/listings/${randomUUID()}${duoi}`, body, T.cookie));
    assert.equal(khongCo.status, 404, `${m} ${duoi}: mã không có không trả 404`);
    assert.deepEqual(await than(await send(m, `/api/v1/listings/${h.id}${duoi}`, body, T.cookie)), khongCo, `${m} ${duoi}: lộ hàng Chỉ tôi`);
  }
});

/** Mọi cặp (phương thức, đường) của tài liệu OpenAPI chạm hàng: chữ listings trong đường hay tham số listingId. */
function duongHang(doc: { paths: Record<string, Record<string, unknown>> }): string[] {
  return Object.entries(doc.paths)
    .filter(([p]) => /listings|\{listingId\}/.test(p))
    .flatMap(([p, ops]) => Object.keys(ops).map((m) => `${m} ${p}`))
    .sort();
}

test("mọi đường chạm hàng nằm trong bảng bốn đường", async () => {
  const r = await req("/api/v1/openapi.json");
  assert.equal(r.status, 200);
  const doc = (await r.json()) as { paths: Record<string, Record<string, unknown>> };
  const BANG = [
    "get /api/v1/listings",
    "get /api/v1/listings/{listingId}",
    "post /api/v1/listings",
    "post /api/v1/listings/{listingId}/events",
    // Bốn lời gọi chủ nhà của hàng 11 — ca «lời gọi chủ nhà vào hàng Chỉ tôi của người khác trả 404» dưới.
    "get /api/v1/listings/{listingId}/owner",
    "put /api/v1/listings/{listingId}/owner",
    "post /api/v1/listings/{listingId}/owner/phone-reveal",
    "put /api/v1/listings/{listingId}/listing-agent",
  ].sort();
  assert.deepEqual(duongHang(doc), BANG, "có đường chạm hàng ngoài bảng — thêm vào bảng kèm ca kiểm trục ai thấy hàng");
  // Đối chứng dương trên cùng hàm liệt: đường cấy thêm bị bắt.
  const cay = { paths: { ...doc.paths, "/api/v1/listings/{listingId}/history": { get: {} } } };
  assert.ok(duongHang(cay).includes("get /api/v1/listings/{listingId}/history"), "hàm liệt không bắt đường hàng cấy thêm");
});
