// Lớp trường nguồn qua API trên Postgres thật (hàng 11: AC-4..AC-7, AC-9, AC-10 — ADR-0010). Số mẫu `0900 000 012`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { findSourceLeaks } from "@quy-hang/core/access";
import { createApi } from "../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

const TEN = "[Tên chủ mẫu]";
const SO = "0900000012";
const GIA_DAY = 3_200_000_000;
const MAU = [TEN, SO, "0900 000 012", "+84900000012", String(GIA_DAY)];
const CHU = { ownerName: TEN, ownerPhone: "0900 000 012", floorPrice: GIA_DAY };

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
/** Một sàn với một người cho mỗi vai cần dùng; người của sàn đăng nhập sẵn, cookie trỏ sàn đó. */
async function sanMoi(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, mail(`ng-${ten.toLowerCase()}-qt`));
  const them = async (vai: string[], nhan: string): Promise<Nguoi> => {
    const email = mail(`ng-${ten.toLowerCase()}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  const quanTri = { userId: s.userId, cookie: `${await login(mail(`ng-${ten.toLowerCase()}-qt`))}; qh_san=${s.companyId}` };
  return {
    companyId: s.companyId,
    quanTri,
    dauChu: await them(["listing_agent"], "dc"),
    dauChuKhac: await them(["listing_agent"], "dc2"),
    dauKhach: await them(["buyer_agent"], "dk"),
    telesales: await them(["telesales"], "ts"),
    truongNhom: await them(["team_lead"], "tn"),
  };
}
/** Hàng «Chỉ tôi» mới của người tạo (hàng 12): chỉ người tạo đọc được. */
const taoHangChiToi = async (cookie: string) => {
  const res = await send("POST", "/api/v1/listings", { buildingName: "[Toà mẫu]", unitNumber: "A-1201" }, cookie);
  assert.equal(res.status, 201);
  return (await res.json()) as { id: string; version: number };
};
/** Hàng đã lên «Toàn sàn» (lần đầu Đang bán), để mọi thành viên của sàn đọc được hàng — nguồn chỉ thấy trên hàng đọc được. */
const taoHang = async (cookie: string) => {
  let h = await taoHangChiToi(cookie);
  for (const [type, payload] of [
    ["price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }],
    ["details_changed", { legalStatus: "pink_book", occupantType: "vacant" }],
    ["status_changed", { to: "Active" }],
  ] as const) {
    const res = await send("POST", `/api/v1/listings/${h.id}/events`, { type, payload, expectedVersion: h.version }, cookie);
    assert.equal(res.status, 200, `${type}: ${await res.clone().text()}`);
    h = (await res.json()) as { id: string; version: number };
  }
  return h.id;
};
const chuNha = (id: string) => `/api/v1/listings/${id}/owner`;
const moSo = (id: string) => `/api/v1/listings/${id}/owner/phone-reveal`;
const ganDauChu = (id: string) => `/api/v1/listings/${id}/listing-agent`;
const dem = async (bang: string, id: string) =>
  (await appPool.query<{ n: number }>(`select count(*)::int n from ${bang} where listing_id = $1`, [id])).rows[0]!.n;
const json = async (res: Response) => (await res.json()) as Record<string, unknown>;

const SAN = sanMoi("A");
const SAN_B = sanMoi("B");

test("đặt chủ nhà: đầu chủ đặt trên hàng chưa có đầu chủ thành đầu chủ giữ căn", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  const res = await send("PUT", chuNha(h), CHU, a.dauChu.cookie);
  assert.equal(res.status, 200, await res.clone().text());
  const gan = await appPool.query("select seq, user_id, assigned_by from listing_agent_assignments where listing_id = $1", [h]);
  assert.deepEqual(gan.rows, [{ seq: 1, user_id: a.dauChu.userId, assigned_by: a.dauChu.userId }]);
  // Hàng 62: số chủ chỉ ở dạng bản mã 39 byte và dấu vết 32 byte; cột số rõ luôn rỗng.
  const chu = await appPool.query(
    "select owner_name, owner_phone, octet_length(owner_phone_enc) ban_ma, octet_length(owner_phone_hash) dau_vet, floor_price::float8 gia from listing_owners where listing_id = $1",
    [h],
  );
  assert.deepEqual(chu.rows, [{ owner_name: TEN, owner_phone: null, ban_ma: 39, dau_vet: 32, gia: GIA_DAY }]);
});

test("đặt chủ nhà sai khuôn trả 400 và không lưu gì", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  for (const body of [{ ...CHU, ghiChu: "x" }, { ...CHU, ownerPhone: "090000001" }, { ...CHU, floorPrice: 0 }, { ...CHU, floorPrice: "1" }]) {
    const res = await send("PUT", chuNha(h), body, a.dauChu.cookie);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.equal((await json(res)).error, "invalid-payload");
  }
  assert.equal(await dem("listing_owners", h), 0);
  assert.equal(await dem("listing_agent_assignments", h), 0);
});

test("không có vai Đầu chủ thì 403 trên hàng chưa có đầu chủ", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  for (const ai of [a.dauKhach, a.quanTri, a.truongNhom]) {
    const res = await send("PUT", chuNha(h), CHU, ai.cookie);
    assert.equal(res.status, 403);
    assert.equal((await json(res)).error, "listing-agent-required");
  }
  assert.equal(await dem("listing_owners", h), 0);
  assert.equal(await dem("listing_agent_assignments", h), 0);
});

test("đầu chủ giữ căn và trưởng nhóm đọc được tên, giá đáy, cờ có số", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(h), CHU, a.dauChu.cookie)).status, 200);
  for (const ai of [a.dauChu, a.truongNhom]) {
    const res = await send("GET", chuNha(h), undefined, ai.cookie);
    assert.equal(res.status, 200);
    const than = await res.text();
    assert.deepEqual(JSON.parse(than), { visible: true, ownerName: TEN, floorPrice: GIA_DAY, hasPhone: true });
    for (const so of [SO, "0900 000 012", "012"]) assert.ok(!than.includes(so), `lộ «${so}»`);
  }
});

test("chỉ người thấy nguồn sửa được chủ nhà", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(h), CHU, a.dauChu.cookie)).status, 200);
  assert.equal((await send("PUT", chuNha(h), { ...CHU, floorPrice: 3_100_000_000 }, a.truongNhom.cookie)).status, 200);
  const giaSau = async () => (await appPool.query("select floor_price::float8 g from listing_owners where listing_id = $1", [h])).rows[0]!.g;
  assert.equal(await giaSau(), 3_100_000_000);
  let tuChoi = 0;
  for (const ai of [a.dauChuKhac, a.telesales, a.quanTri]) {
    const res = await send("PUT", chuNha(h), { ...CHU, floorPrice: 1_000 }, ai.cookie);
    assert.equal(res.status, 403);
    assert.equal(await giaSau(), 3_100_000_000);
    tuChoi++;
  }
  assert.equal(tuChoi, 3);
});

test("người không thấy nguồn: ba lời gọi không lộ trường nguồn", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(h), CHU, a.dauChu.cookie)).status, 200);
  // Đối chứng dương cùng hàm quét: thân của đầu chủ giữ căn có tên chủ.
  assert.ok(findSourceLeaks(await json(await send("GET", chuNha(h), undefined, a.dauChu.cookie)), MAU).length > 0);
  let soThan = 0;
  for (const [ten, ai] of [["đầu khách", a.dauKhach], ["đầu chủ khác", a.dauChuKhac], ["telesales", a.telesales], ["quản trị sàn", a.quanTri]] as const) {
    for (const duong of [chuNha(h), `/api/v1/listings/${h}`, "/api/v1/listings"]) {
      const res = await send("GET", duong, undefined, ai.cookie);
      assert.equal(res.status, 200, `${ten} ${duong}`);
      const than = await res.json();
      assert.deepEqual(findSourceLeaks(than, MAU), [], `${ten} ${duong}`);
      if (duong === chuNha(h)) assert.deepEqual(than, { visible: false, listingAgentUserId: a.dauChu.userId }, ten);
      soThan++;
    }
  }
  assert.equal(soThan, 12);
});

test("mở số: n lời gọi thành đúng n sự kiện", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(h), CHU, a.dauChu.cookie)).status, 200);
  const phienBan = async () => (await appPool.query("select version from listings where id = $1", [h])).rows[0]!.version;
  const truoc = await dem("owner_phone_reveals", h);
  const v0 = await phienBan();
  for (const ai of [a.dauChu, a.dauChu, a.dauChu, a.truongNhom]) {
    const res = await send("POST", moSo(h), undefined, ai.cookie);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ownerPhone: SO });
  }
  assert.equal(await dem("owner_phone_reveals", h), truoc + 4);
  const dong = await appPool.query("select actor_user_id, actor_roles, occurred_at from owner_phone_reveals where listing_id = $1 order by id", [h]);
  assert.deepEqual(dong.rows.map((r) => [r.actor_user_id, r.actor_roles]), [
    [a.dauChu.userId, ["listing_agent"]],
    [a.dauChu.userId, ["listing_agent"]],
    [a.dauChu.userId, ["listing_agent"]],
    [a.truongNhom.userId, ["team_lead"]],
  ]);
  assert.ok(dong.rows.every((r) => r.occurred_at instanceof Date));
  assert.equal(await phienBan(), v0, "mở số không đổi phiên bản hàng");
});

test("mở số bị từ chối không ghi gì", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(h), CHU, a.dauChu.cookie)).status, 200);
  for (const ai of [a.dauKhach, a.quanTri]) {
    const res = await send("POST", moSo(h), undefined, ai.cookie);
    assert.equal(res.status, 403);
    assert.equal((await json(res)).error, "listing-agent-required");
  }
  assert.equal(await dem("owner_phone_reveals", h), 0);
  const h2 = await taoHang(a.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(h2), { ownerName: TEN }, a.dauChu.cookie)).status, 200);
  const res = await send("POST", moSo(h2), undefined, a.dauChu.cookie);
  assert.equal(res.status, 404);
  assert.equal((await json(res)).error, "owner-not-set");
  assert.equal(await dem("owner_phone_reveals", h2), 0);
});

test("sàn khác: mọi lời gọi chủ nhà vào hàng của sàn B trả 404", async () => {
  const [a, b] = [await SAN, await SAN_B];
  const hb = await taoHang(b.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(hb), CHU, b.dauChu.cookie)).status, 200);
  const truoc = await Promise.all(["listing_owners", "listing_agent_assignments", "owner_phone_reveals"].map((t) => dem(t, hb)));
  let soLoi = 0;
  for (const [m, duong, body] of [
    ["GET", chuNha(hb), undefined],
    ["PUT", chuNha(hb), CHU],
    ["POST", moSo(hb), undefined],
    ["PUT", ganDauChu(hb), { userId: a.dauChu.userId }],
  ] as const) {
    const res = await send(m, duong, body, a.truongNhom.cookie);
    assert.equal(res.status, 404, `${m} ${duong}`);
    soLoi++;
  }
  assert.equal(soLoi, 4);
  assert.deepEqual(await Promise.all(["listing_owners", "listing_agent_assignments", "owner_phone_reveals"].map((t) => dem(t, hb))), truoc);
  // Mã không phải uuid cũng là 404, không lỗi máy chủ.
  assert.equal((await send("GET", chuNha("khong-phai-ma"), undefined, a.truongNhom.cookie)).status, 404);
});

test("trưởng nhóm gán lại đầu chủ: người mới thấy, người cũ hết thấy", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(h), CHU, a.dauChu.cookie)).status, 200);
  const thay = async (ai: Nguoi) => (await json(await send("GET", chuNha(h), undefined, ai.cookie))).visible;
  assert.equal(await thay(a.dauChu), true);
  assert.equal(await thay(a.dauChuKhac), false);
  const truoc = await dem("listing_agent_assignments", h);
  const res = await send("PUT", ganDauChu(h), { userId: a.dauChuKhac.userId }, a.truongNhom.cookie);
  assert.equal(res.status, 200, await res.clone().text());
  assert.equal(await dem("listing_agent_assignments", h), truoc + 1);
  const dong = await appPool.query("select seq, user_id, assigned_by from listing_agent_assignments where listing_id = $1 order by seq", [h]);
  assert.deepEqual(dong.rows, [
    { seq: 1, user_id: a.dauChu.userId, assigned_by: a.dauChu.userId },
    { seq: 2, user_id: a.dauChuKhac.userId, assigned_by: a.truongNhom.userId },
  ]);
  assert.equal(await thay(a.dauChuKhac), true);
  assert.equal((await send("POST", moSo(h), undefined, a.dauChuKhac.cookie)).status, 200);
  assert.equal(await thay(a.dauChu), false);
  assert.equal((await send("POST", moSo(h), undefined, a.dauChu.cookie)).status, 403);
});

test("gán sai bị từ chối, không thêm dòng", async () => {
  const [a, b] = [await SAN, await SAN_B];
  const h = await taoHang(a.dauChu.cookie);
  assert.equal((await send("PUT", chuNha(h), CHU, a.dauChu.cookie)).status, 200);
  const truoc = await dem("listing_agent_assignments", h);
  for (const [ai, userId, ma] of [
    [a.truongNhom, a.dauKhach.userId, 400],
    [a.truongNhom, b.dauChu.userId, 400],
    [a.dauChu, a.dauChuKhac.userId, 403],
  ] as const) {
    const res = await send("PUT", ganDauChu(h), { userId }, ai.cookie);
    assert.equal(res.status, ma, `${userId}`);
    assert.equal(await dem("listing_agent_assignments", h), truoc);
    assert.equal((await json(await send("GET", chuNha(h), undefined, a.dauChu.cookie))).visible, true);
  }
});

test("hàng Chỉ tôi của người khác: bốn lời gọi chủ nhà trả 404 như hàng không có, không ghi", async () => {
  const a = await SAN;
  const h = (await taoHangChiToi(a.dauChu.cookie)).id;
  // Đối chứng dương: người tạo vẫn đặt và đọc được chủ nhà của hàng mình.
  assert.equal((await send("PUT", chuNha(h), CHU, a.dauChu.cookie)).status, 200);
  assert.equal((await json(await send("GET", chuNha(h), undefined, a.dauChu.cookie))).visible, true);
  const truoc = await Promise.all(["listing_owners", "listing_agent_assignments", "owner_phone_reveals"].map((t) => dem(t, h)));
  const khongCo = "00000000-0000-4000-8000-000000000000";
  let soLoi = 0;
  for (const ai of [a.truongNhom, a.dauChuKhac, a.quanTri]) {
    for (const [m, duong, body] of [
      ["GET", chuNha, undefined],
      ["PUT", chuNha, CHU],
      ["POST", moSo, undefined],
      ["PUT", ganDauChu, { userId: a.dauChuKhac.userId }],
    ] as const) {
      const res = await send(m, duong(h), body, ai.cookie);
      const goc = await send(m, duong(khongCo), body, ai.cookie);
      assert.equal(res.status, 404, `${m} ${duong(h)}`);
      assert.deepEqual(await res.json(), await goc.json(), `${m}: khác câu trả lời của hàng không có`);
      soLoi++;
    }
  }
  assert.equal(soLoi, 12);
  assert.deepEqual(await Promise.all(["listing_owners", "listing_agent_assignments", "owner_phone_reveals"].map((t) => dem(t, h))), truoc);
});

test("hai đầu chủ nhận cùng lúc: đúng một người giữ", async () => {
  const a = await SAN;
  const h = await taoHang(a.dauChu.cookie);
  const kq = await Promise.all([a.dauChu, a.dauChuKhac].map((ai) => send("PUT", chuNha(h), CHU, ai.cookie)));
  assert.deepEqual(kq.map((r) => r.status).sort(), [200, 403]);
  assert.equal(await dem("listing_agent_assignments", h), 1);
});
