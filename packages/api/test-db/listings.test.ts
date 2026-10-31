// Hàng và sự kiện qua lệnh API trên Postgres thật (hàng 8: AC-1, AC-5, AC-8, AC-9, AC-10 — ADR-0008).
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { foldListing, type ListingEvent } from "@quy-hang/core/listing";
import { createApi } from "../src/app";
import { API_ERRORS } from "../src/errors";
import { STATE_COLUMNS } from "../src/listings/store";
import { appPool, BASE_URL, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

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
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}
async function sanMoi(ten: string) {
  const email = mail(`hang-${ten.toLowerCase()}`);
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, email);
  return { ...s, cookie: `${await login(email)}; qh_san=${s.companyId}` };
}

type View = { id: string; version: number; standardStatus: string; closePrice: number | null; closeDate: string | null };
const taoHang = async (cookie: string, toa = "[Toà mẫu]") => {
  const res = await send("POST", "/api/v1/listings", { buildingName: toa, unitNumber: "A-1201" }, cookie);
  assert.equal(res.status, 201);
  return (await res.json()) as View;
};
const lenh = (cookie: string, id: string, body: unknown) => send("POST", `/api/v1/listings/${id}/events`, body, cookie);
const GIA = { listPrice: 3_500_000_000, feeInclusion: "excluded" };
const DU = { legalStatus: "pink_book", occupantType: "vacant" };
const demSuKien = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;
const banTinh = async (id: string) => (await appPool.query("select to_jsonb(l) - 'id' - 'company_id' j from listings l where id = $1", [id])).rows[0]!.j;

/** Đưa hàng tới «Đang bán» qua lệnh; trả phiên bản cuối. */
async function denDangBan(cookie: string, id: string) {
  assert.equal((await lenh(cookie, id, { type: "price_changed", payload: GIA, expectedVersion: 1 })).status, 200);
  assert.equal((await lenh(cookie, id, { type: "details_changed", payload: DU, expectedVersion: 2 })).status, 200);
  const r = await lenh(cookie, id, { type: "status_changed", payload: { to: "Active" }, expectedVersion: 3 });
  assert.equal(r.status, 200, await r.clone().text());
  return 4;
}

test("lệnh đổi hàng: mỗi lệnh ghi đúng một sự kiện và bản tính trong cùng giao dịch", async () => {
  const a = await sanMoi("L1");
  const h = await taoHang(a.cookie);
  const BUOC = [
    { type: "details_changed", payload: { furnished: "full" } },
    { type: "price_changed", payload: GIA },
    { type: "owner_confirmed", payload: {} },
  ];
  for (const [i, b] of BUOC.entries()) {
    const res = await lenh(a.cookie, h.id, { ...b, expectedVersion: i + 1 });
    assert.equal(res.status, 200, `${b.type}: ${await res.clone().text()}`);
    const { rows } = await appPool.query<{ seq: number; actor_user_id: string; actor_roles: string[] }>(
      "select seq, actor_user_id, actor_roles from listing_events where listing_id = $1 order by seq",
      [h.id],
    );
    assert.deepEqual(rows.map((r) => r.seq), Array.from({ length: i + 2 }, (_, k) => k + 1), `sau ${b.type}: seq liền`);
    assert.deepEqual([rows.at(-1)!.actor_user_id, rows.at(-1)!.actor_roles], [a.userId, ["company_admin"]], "người và vai lúc làm");
    const events = await suKien(h.id);
    const mong = foldListing(events);
    assert.deepEqual(chuanHoa(await banTinh(h.id)), chuanHoa(veCot(mong)), `sau ${b.type}: bản tính khớp hàm gấp`);
  }
});

test("lệnh bị từ chối không ghi gì", async () => {
  const a = await sanMoi("L2");
  const h = await taoHang(a.cookie);
  // Đối chứng dương: lệnh hợp lệ tăng đúng một sự kiện.
  assert.equal((await lenh(a.cookie, h.id, { type: "owner_confirmed", payload: {}, expectedVersion: 1 })).status, 200);
  assert.equal(await demSuKien(h.id), 2);
  const truoc = await banTinh(h.id);
  const res = await lenh(a.cookie, h.id, { type: "deleted", payload: {}, expectedVersion: 2 });
  assert.equal(res.status, 400);
  assert.equal(((await res.json()) as { error: string }).error, API_ERRORS.invalidPayload.code);
  assert.equal(await demSuKien(h.id), 2, "lệnh sai vẫn để lại sự kiện");
  assert.deepEqual(await banTinh(h.id), truoc, "lệnh sai đổi bản tính");
});

test("đổi trạng thái: thiếu điều kiện trả 400 và không ghi", async () => {
  const a = await sanMoi("L3");
  const h = await taoHang(a.cookie);
  // Vào Đang bán thiếu từng điều kiện — ba ca riêng.
  const CA: [string, object, string[]][] = [
    ["thiếu giá kèm điều kiện phí", { details: DU }, ["listPrice", "feeInclusion"]],
    ["thiếu pháp lý", { price: GIA, details: { legalStatus: null } }, ["legalStatus"]],
    ["thiếu tình trạng sử dụng", { details: { legalStatus: "pink_book", occupantType: null } }, ["occupantType"]],
  ];
  let v = 1;
  for (const [ten, chuan, missing] of CA) {
    const c = chuan as { price?: object; details?: object };
    if (c.price) assert.equal((await lenh(a.cookie, h.id, { type: "price_changed", payload: c.price, expectedVersion: v++ })).status, 200);
    if (c.details) assert.equal((await lenh(a.cookie, h.id, { type: "details_changed", payload: c.details, expectedVersion: v++ })).status, 200);
    const n = await demSuKien(h.id);
    const res = await lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Active" }, expectedVersion: v });
    assert.equal(res.status, 400, ten);
    assert.deepEqual(await res.json(), { error: API_ERRORS.missingRequirement.code, missing }, ten);
    assert.equal(await demSuKien(h.id), n, `${ten}: không được ghi`);
  }
  // Đối chứng dương: đủ điều kiện thì vào Đang bán.
  assert.equal((await lenh(a.cookie, h.id, { type: "details_changed", payload: { occupantType: "vacant" }, expectedVersion: v++ })).status, 200);
  assert.equal((await lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Active" }, expectedVersion: v++ })).status, 200);
  // Đã bán thiếu giá chốt; Ngừng hẳn thiếu lý do.
  for (const [ten, payload, missing] of [
    ["Closed thiếu giá chốt", { to: "Closed" }, ["closePrice"]],
    ["Withdrawn thiếu lý do", { to: "Withdrawn" }, ["withdrawnReason"]],
  ] as const) {
    const n = await demSuKien(h.id);
    const res = await lenh(a.cookie, h.id, { type: "status_changed", payload, expectedVersion: v });
    assert.deepEqual([res.status, await res.json()], [400, { error: API_ERRORS.missingRequirement.code, missing }], ten);
    assert.equal(await demSuKien(h.id), n, `${ten}: không được ghi`);
  }
});

test("hàng đã bán giữ giá chốt và ngày bán", async () => {
  const a = await sanMoi("L4");
  const h = await taoHang(a.cookie);
  const v = await denDangBan(a.cookie, h.id);
  const res = await lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Closed", closePrice: 3_400_000_000, closeDate: "2026-10-30" }, expectedVersion: v });
  assert.equal(res.status, 200);
  const doc = (await (await req(`/api/v1/listings/${h.id}`, a.cookie)).json()) as View;
  assert.deepEqual([doc.standardStatus, doc.closePrice, doc.closeDate], ["Closed", 3_400_000_000, "2026-10-30"]);
});

test("phiên bản cũ trả 409 version-conflict, không ghi", async () => {
  const a = await sanMoi("L5");
  const h = await taoHang(a.cookie);
  assert.equal((await lenh(a.cookie, h.id, { type: "owner_confirmed", payload: {}, expectedVersion: 1 })).status, 200);
  const res = await lenh(a.cookie, h.id, { type: "details_changed", payload: { furnished: "basic" }, expectedVersion: 1 });
  assert.deepEqual([res.status, await res.json()], [409, { error: API_ERRORS.versionConflict.code }]);
  assert.equal(await demSuKien(h.id), 2);
  // Đối chứng: cùng lệnh với phiên bản đúng thì ghi.
  assert.equal((await lenh(a.cookie, h.id, { type: "details_changed", payload: { furnished: "basic" }, expectedVersion: 2 })).status, 200);
});

test("Đã cọc và Đã bán thắng ngay dù phiên bản cũ", async () => {
  const a = await sanMoi("L6");
  const h = await taoHang(a.cookie);
  await denDangBan(a.cookie, h.id);
  assert.equal((await lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Pending" }, expectedVersion: 1 })).status, 200);
  const res = await lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Closed", closePrice: 3_300_000_000 }, expectedVersion: 1 });
  assert.equal(res.status, 200, await res.clone().text());
  assert.equal(((await res.json()) as View).standardStatus, "Closed");
});

/**
 * Ép hai lệnh chồng nhau: một kết nối riêng giữ khoá dòng hàng, hai lệnh được bắn ra và kịp đọc trước khi khoá nhả —
 * không có quãng này, lệnh thứ hai thường bắt đầu sau khi lệnh đầu commit và ca xanh cả khi API thiếu khoá theo hàng.
 */
async function chongNhau(id: string, a: () => Response | Promise<Response>, b: () => Response | Promise<Response>) {
  const giu = await appPool.connect();
  try {
    await giu.query("begin");
    await giu.query("select 1 from listings where id = $1 for update", [id]);
    const p = Promise.all([a(), b()]);
    await new Promise((r) => setTimeout(r, 300));
    await giu.query("commit");
    return await p;
  } finally {
    giu.release();
  }
}

test("hai lệnh đồng thời không cùng seq", async () => {
  const a = await sanMoi("L7");
  const h = await taoHang(a.cookie);
  const kq = await chongNhau(
    h.id,
    () => lenh(a.cookie, h.id, { type: "details_changed", payload: { furnished: "full" }, expectedVersion: 1 }),
    () => lenh(a.cookie, h.id, { type: "details_changed", payload: { furnished: "basic" }, expectedVersion: 1 }),
  );
  assert.deepEqual(kq.map((r) => r.status).sort(), [200, 409], "đúng một thành công, một 409");
  const { rows } = await appPool.query<{ seq: number }>("select seq from listing_events where listing_id = $1 order by seq", [h.id]);
  assert.deepEqual(rows.map((r) => r.seq), [1, 2], "seq trùng hay hở");
});

test("hai lệnh thắng ngay đồng thời không cùng seq", async () => {
  const a = await sanMoi("L8");
  const h = await taoHang(a.cookie);
  await denDangBan(a.cookie, h.id);
  const kq = await chongNhau(
    h.id,
    () => lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Pending" }, expectedVersion: 1 }),
    () => lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Closed", closePrice: 3_300_000_000 }, expectedVersion: 1 }),
  );
  // Mỗi lệnh hoặc ghi (200), hoặc bị bảng chuyển từ chối (400) khi lệnh kia đã đưa hàng tới nấc cuối — không lỗi máy.
  assert.ok(kq.every((r) => r.status === 200 || r.status === 400), kq.map((r) => r.status).join(","));
  const thanhCong = kq.filter((r) => r.status === 200).length;
  assert.ok(thanhCong >= 1, "ít nhất một lệnh thắng");
  const { rows } = await appPool.query<{ seq: number }>("select seq from listing_events where listing_id = $1 order by seq", [h.id]);
  assert.deepEqual(rows.map((r) => r.seq), Array.from({ length: 4 + thanhCong }, (_, k) => k + 1), "seq trùng hay hở");
  const cuoi = (await (await req(`/api/v1/listings/${h.id}`, a.cookie)).json()) as View;
  assert.ok(["Pending", "Closed"].includes(cuoi.standardStatus), cuoi.standardStatus);
});

test("thắng ngay vẫn xét bảng chuyển", async () => {
  const a = await sanMoi("L9");
  const h = await taoHang(a.cookie);
  assert.equal((await lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Withdrawn", withdrawnReason: "unreachable" }, expectedVersion: 1 })).status, 200);
  const n = await demSuKien(h.id);
  const res = await lenh(a.cookie, h.id, { type: "status_changed", payload: { to: "Closed", closePrice: 3_000_000_000 }, expectedVersion: 1 });
  assert.equal(res.status, 400);
  assert.equal(((await res.json()) as { error: string }).error, API_ERRORS.invalidTransition.code);
  assert.equal(await demSuKien(h.id), n);
});

/** Bản tính → đúng tên cột của bảng. */
function veCot(s: ReturnType<typeof foldListing>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(STATE_COLUMNS).map(([k, col]) => [col, s[k as keyof typeof s]]));
}
/** Chuẩn hoá giá trị để so: mốc thời gian so theo mili giây. */
function chuanHoa(o: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(o).map(([k, v]) => [k, typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) ? Date.parse(v) : v]),
  );
}
async function suKien(id: string): Promise<ListingEvent[]> {
  const { rows } = await appPool.query(
    `select seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, occurred_at from listing_events where listing_id = $1 order by seq`,
    [id],
  );
  return rows.map((r) => ({
    seq: r.seq,
    type: r.type,
    payload: r.payload,
    actorUserId: r.actor_user_id,
    actorRoles: r.actor_roles,
    confirmedWithOwner: r.confirmed_with_owner,
    occurredAt: (r.occurred_at as Date).toISOString(),
  }));
}

test("gấp lại: xoá trắng bảng hàng rồi gấp từ sự kiện ra đúng bảng cũ", async () => {
  const a = await sanMoi("L10");
  const ids: string[] = [];
  for (const toa of ["[Toà G1]", "[Toà G2]", "[Toà G3]"]) ids.push((await taoHang(a.cookie, toa)).id);
  await denDangBan(a.cookie, ids[0]!);
  assert.equal((await lenh(a.cookie, ids[0]!, { type: "status_changed", payload: { to: "Closed", closePrice: 3_100_000_000 }, expectedVersion: 4 })).status, 200);
  assert.equal((await lenh(a.cookie, ids[1]!, { type: "owner_confirmed", payload: {}, expectedVersion: 1 })).status, 200);
  assert.equal((await lenh(a.cookie, ids[1]!, { type: "status_changed", payload: { to: "Withdrawn", withdrawnReason: "sold_elsewhere" }, expectedVersion: 2 })).status, 200);
  assert.equal((await lenh(a.cookie, ids[2]!, { type: "price_changed", payload: GIA, expectedVersion: 1, confirmedWithOwner: false })).status, 200);

  // Danh sách cột lấy từ information_schema của bảng thật, không từ đầu ra hàm gấp.
  const cot = (
    await appPool.query<{ column_name: string }>(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'listings' and column_name not in ('id', 'company_id') order by ordinal_position",
    )
  ).rows.map((r) => r.column_name);
  assert.deepEqual([...cot].sort(), Object.values(STATE_COLUMNS).sort(), "bảng hàng có cột không tính từ sự kiện");

  const chup = new Map<string, Record<string, unknown>>();
  for (const id of ids) chup.set(id, chuanHoa(await banTinh(id)));
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("delete from listings where company_id = $1", [a.companyId]);
    const gap = new Map<string, Record<string, unknown>>();
    for (const id of ids) {
      const s = veCot(foldListing(await suKien(id)));
      await c.query(
        `insert into listings (id, company_id, ${cot.join(", ")}) values ($1, $2, ${cot.map((_, i) => `$${i + 3}`).join(", ")})`,
        [id, a.companyId, ...cot.map((k) => s[k])],
      );
      gap.set(id, chuanHoa((await c.query("select to_jsonb(l) - 'id' - 'company_id' j from listings l where id = $1", [id])).rows[0].j));
    }
    for (const id of ids) {
      const truoc = chup.get(id)!;
      const sau = gap.get(id)!;
      for (const k of cot) assert.deepEqual(sau[k], truoc[k], `hàng ${id}, cột ${k}`);
    }
    // Đối chứng dương: sửa tay một cột trước khi so thì phép so phải đỏ và nêu cột.
    const hong: Record<string, unknown> = { ...chup.get(ids[0]!)!, furnished: "sua-tay" };
    assert.throws(
      () => {
        for (const k of cot) assert.deepEqual(gap.get(ids[0]!)![k], hong[k], `cột ${k}`);
      },
      /cột furnished/,
    );
  } finally {
    await c.query("rollback").catch(() => {});
    c.release();
  }
});

test("lệnh vào mã hàng của sàn B qua API trả 404, sàn B không đổi", async () => {
  const a = await sanMoi("L11");
  const b = await sanMoi("L12");
  const hb = await taoHang(b.cookie);
  const truoc = await banTinh(hb.id);
  const res = await lenh(a.cookie, hb.id, { type: "owner_confirmed", payload: {}, expectedVersion: 1 });
  assert.deepEqual([res.status, await res.json()], [404, { error: API_ERRORS.notFound.code }]);
  assert.equal((await req(`/api/v1/listings/${hb.id}`, a.cookie)).status, 404);
  assert.deepEqual(await banTinh(hb.id), truoc);
  assert.equal(await demSuKien(hb.id), 1);
  const ds = (await (await req("/api/v1/listings", a.cookie)).json()) as View[];
  assert.ok(!ds.some((x) => x.id === hb.id), "danh sách của A lộ hàng của B");
});

test("payload theo khuôn chặt qua API: khoá lạ và khoá chủ nhà bị từ chối", async () => {
  const a = await sanMoi("L13");
  const h = await taoHang(a.cookie);
  for (const payload of [{ furnished: "full", ownerPhone: "0900 000 001" }, { furnished: { ownerName: "[Tên]" } }, { furnished: "full", khoaLa: 1 }]) {
    const res = await lenh(a.cookie, h.id, { type: "details_changed", payload, expectedVersion: 1 });
    assert.equal(res.status, 400, JSON.stringify(payload));
    assert.equal(((await res.json()) as { error: string }).error, API_ERRORS.invalidPayload.code);
  }
  const tao = await send("POST", "/api/v1/listings", { buildingName: "[Toà]", floorPrice: 1 }, a.cookie);
  assert.equal(tao.status, 400, "tạo hàng mang giá đáy");
  assert.equal(await demSuKien(h.id), 1, "không lệnh sai nào được ghi");
  // Đối chứng: payload cùng hình không có khoá ấy được ghi.
  assert.equal((await lenh(a.cookie, h.id, { type: "details_changed", payload: { furnished: "full" }, expectedVersion: 1 })).status, 200);
});
