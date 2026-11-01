// Ảnh căn ba ngăn qua API trên Postgres thật (hàng 18: E1b, E2b, E3b, E4, E5b, E6, E6b — ADR-0014). Ảnh là byte viết bằng
// mã (đầu JPEG/PNG + đệm), không ảnh thật.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { createApi } from "../src/app";
import { khoTuS3 } from "../src/photos/kho";
import { khoS3 } from "../src/photos/kho-s3";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const goi = (a: ReturnType<typeof createApi>, method: string, path: string, body?: unknown, cookie = "") =>
  a.request(`${BASE_URL}${path}`, {
    method,
    headers: { origin: BASE_URL, ...(cookie ? { cookie } : {}), ...(body && !(body instanceof FormData) ? { "content-type": "application/json" } : {}) },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await goi(app, "POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await goi(app, "POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

const TOA = "[Toà ảnh]";
const MA = "A-0601";
const JPEG = (n: number, seed = 1) => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(n - 4, seed)]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
const bam = (b: Buffer) => createHash("sha256").update(b).digest("hex");

/** Một sàn: đầu chủ giữ căn (một lần rao của căn), đầu khách, trưởng nhóm. */
async function san(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, mail(`anh-${ten}-qt`));
  const them = async (vai: string[], nhan: string) => {
    const email = mail(`anh-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  const dauChu = await them(["listing_agent"], "dc");
  const dauKhach = await them(["buyer_agent"], "dk");
  const truongNhom = await them(["team_lead"], "tn");
  const r = await goi(app, "POST", "/api/v1/listings", { buildingName: TOA, unitNumber: MA }, dauChu.cookie);
  assert.equal(r.status, 201);
  const { id } = (await r.json()) as { id: string };
  await appPool.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, $3)", [s.companyId, id, dauChu.userId]);
  return { companyId: s.companyId, dauChu, dauKhach, truongNhom };
}

function form(o: { ngan?: string; original?: Buffer; thumb?: Buffer; takenAt?: string; ma?: string }) {
  const f = new FormData();
  f.set("toa", TOA);
  f.set("ma", o.ma ?? MA);
  f.set("compartment", o.ngan ?? "shareable");
  f.set("width", "2000");
  f.set("height", "1500");
  if (o.takenAt) f.set("takenAt", o.takenAt);
  f.set("original", new File([new Uint8Array(o.original ?? JPEG(2000))], "zalo.jpg", { type: "image/jpeg" }));
  f.set("thumb", new File([new Uint8Array(o.thumb ?? PNG)], "nhe.png", { type: "image/png" }));
  return f;
}
type Anh = { id: string; compartment: string; displayOrder: number; isCover: boolean; isSample: boolean };
const them = async (a: ReturnType<typeof createApi>, cookie: string, o: Parameters<typeof form>[0] = {}) => {
  const r = await goi(a, "POST", "/api/v1/units/photos", form(o), cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { anh: Anh }).anh;
};
const danhSach = async (cookie: string) => {
  const r = await goi(app, "GET", `/api/v1/units/photos?toa=${encodeURIComponent(TOA)}&ma=${MA}`, undefined, cookie);
  assert.equal(r.status, 200);
  return (await r.json()) as { anh: Anh[]; noiBo: string; suaDuoc: boolean };
};
const dem = async (bang: string, cot: string, id: string) =>
  (await appPool.query<{ n: number }>(`select count(*)::int n from ${bang} where ${cot} = $1`, [id])).rows[0]!.n;

test("E1b ghi ảnh: dòng, hai biến thể, byte gốc nguyên vẹn, sự kiện added, thứ tự theo lượt gửi", async () => {
  const s = await san("e1");
  const goc = [JPEG(3000, 7), JPEG(3001, 8), JPEG(3002, 9)];
  const ids = [];
  for (const b of goc) ids.push((await them(app, s.dauChu.cookie, { original: b })).id);
  const { anh } = await danhSach(s.dauChu.cookie);
  assert.deepEqual(anh.map((p) => p.id), ids);
  assert.deepEqual(anh.map((p) => p.displayOrder), [0, 1, 2]);
  for (const [i, id] of ids.entries()) {
    assert.equal(await dem("unit_photo_files", "photo_id", id), 2, `ảnh ${i}: thiếu biến thể`);
    assert.equal(await dem("unit_photo_events", "photo_id", id), 1);
    const r = await goi(app, "GET", `/api/v1/units/photos/${id}/original`, undefined, s.dauChu.cookie);
    assert.equal(r.headers.get("content-type"), "image/jpeg");
    assert.equal(bam(Buffer.from(await r.arrayBuffer())), bam(goc[i]!), `ảnh ${i}: byte gốc đổi`);
  }
});

test("E2b API từ chối tệp hỏng mà không ghi dòng nào", async () => {
  const s = await san("e2");
  const truoc = async () => [
    (await appPool.query<{ n: number }>("select count(*)::int n from unit_photos where company_id = $1", [s.companyId])).rows[0]!.n,
    (await appPool.query<{ n: number }>("select count(*)::int n from unit_photo_files where company_id = $1", [s.companyId])).rows[0]!.n,
    (await appPool.query<{ n: number }>("select count(*)::int n from unit_photo_events where company_id = $1", [s.companyId])).rows[0]!.n,
  ];
  const t0 = await truoc();
  let r = await goi(app, "POST", "/api/v1/units/photos", form({ original: Buffer.from("day khong phai anh") }), s.dauChu.cookie);
  assert.deepEqual([r.status, await r.json()], [400, { error: "photo-not-image" }]);
  assert.deepEqual(await truoc(), t0, "tệp văn bản .jpg để lại dòng");
  r = await goi(app, "POST", "/api/v1/units/photos", form({ original: JPEG(10_485_761) }), s.dauChu.cookie);
  assert.deepEqual([r.status, await r.json()], [400, { error: "photo-too-large" }]);
  assert.deepEqual(await truoc(), t0, "ảnh quá cỡ để lại dòng");
});

test("E3b đổi thứ tự, một bìa, ảnh mẫu không ở ngăn nội bộ", async () => {
  const s = await san("e3");
  const [a, b, c] = [await them(app, s.dauChu.cookie), await them(app, s.dauChu.cookie), await them(app, s.dauChu.cookie)];
  let r = await goi(app, "PATCH", `/api/v1/units/photos/${c.id}`, { order: [c.id, a.id, b.id] }, s.dauChu.cookie);
  assert.equal(r.status, 200);
  assert.deepEqual((await danhSach(s.dauChu.cookie)).anh.map((p) => p.id), [c.id, a.id, b.id]);
  await goi(app, "PATCH", `/api/v1/units/photos/${b.id}`, { isCover: true }, s.dauChu.cookie);
  await goi(app, "PATCH", `/api/v1/units/photos/${a.id}`, { isCover: true }, s.dauChu.cookie);
  const bia = (await appPool.query<{ id: string }>("select id from unit_photos where company_id = $1 and is_cover", [s.companyId])).rows;
  assert.deepEqual(bia.map((x) => x.id), [a.id], "số bìa khác 1");
  const nb = await them(app, s.dauChu.cookie, { ngan: "internal" });
  r = await goi(app, "PATCH", `/api/v1/units/photos/${nb.id}`, { isSample: true }, s.dauChu.cookie);
  assert.deepEqual([r.status, await r.json()], [400, { error: "photo-internal-no-sample" }]);
});

test("E4 đổi ngăn, xoá hẳn byte, sáu lệnh sáu sự kiện", async () => {
  const s = await san("e4");
  const p = await them(app, s.dauChu.cookie);
  const q = await them(app, s.dauChu.cookie);
  const ok = async (body: unknown) => assert.equal((await goi(app, "PATCH", `/api/v1/units/photos/${p.id}`, body, s.dauChu.cookie)).status, 200);
  await ok({ isSample: true });
  await ok({ isCover: true });
  await ok({ order: [p.id, q.id] });
  await ok({ compartment: "internal" });
  const sau = (await danhSach(s.dauChu.cookie)).anh.find((x) => x.id === p.id)!;
  assert.deepEqual([sau.compartment, sau.isCover, sau.isSample], ["internal", false, false]);
  const r = await goi(app, "DELETE", `/api/v1/units/photos/${p.id}`, undefined, s.dauChu.cookie);
  assert.equal(r.status, 200);
  assert.ok(!(await danhSach(s.dauChu.cookie)).anh.some((x) => x.id === p.id), "ảnh đã xoá còn trong danh sách");
  assert.equal((await goi(app, "GET", `/api/v1/units/photos/${p.id}/original`, undefined, s.dauChu.cookie)).status, 404);
  assert.equal(await dem("unit_photo_files", "photo_id", p.id), 0, "byte của ảnh đã xoá còn lại (Hỏi-6)");
  assert.equal(await dem("unit_photo_files", "photo_id", q.id), 2);
  const row = (await appPool.query("select removed_at is not null xoa, removed_by from unit_photos where id = $1", [p.id])).rows[0];
  assert.deepEqual(row, { xoa: true, removed_by: s.dauChu.userId });
  const ev = (await appPool.query("select type, actor_user_id from unit_photo_events where photo_id = $1 order by id", [p.id])).rows;
  assert.deepEqual(ev, ["added", "sample_set", "cover_set", "reordered", "compartment_changed", "removed"].map((type) => ({ type, actor_user_id: s.dauChu.userId })));
});

test("E5b API ẩn ngăn nội bộ với người không giữ căn", async () => {
  const s = await san("e5");
  const g = await them(app, s.dauChu.cookie);
  const nb = await them(app, s.dauChu.cookie, { ngan: "internal" });
  const dk = await danhSach(s.dauKhach.cookie);
  assert.deepEqual(dk.anh.map((p) => p.id), [g.id]);
  assert.equal(dk.noiBo, "an");
  assert.equal(dk.suaDuoc, false);
  assert.ok(!JSON.stringify(dk).includes(nb.id), "lộ id ảnh nội bộ");
  assert.equal((await goi(app, "GET", `/api/v1/units/photos/${nb.id}/original`, undefined, s.dauKhach.cookie)).status, 404);
  assert.equal((await goi(app, "PATCH", `/api/v1/units/photos/${g.id}`, { isCover: true }, s.dauKhach.cookie)).status, 403);
  assert.equal((await goi(app, "DELETE", `/api/v1/units/photos/${g.id}`, undefined, s.dauKhach.cookie)).status, 403);
  const dc = await danhSach(s.dauChu.cookie);
  assert.equal(dc.noiBo, "thay");
  assert.deepEqual(dc.anh.map((p) => p.id).sort(), [g.id, nb.id].sort());
  const tn = await danhSach(s.truongNhom.cookie);
  assert.equal(tn.noiBo, "thay");
});

test("E6 không đệm ngăn nội bộ, không mở được khi không có phiên", async () => {
  const s = await san("e6");
  const g = await them(app, s.dauChu.cookie);
  const nb = await them(app, s.dauChu.cookie, { ngan: "internal" });
  const h = async (id: string, cookie: string) => (await goi(app, "GET", `/api/v1/units/photos/${id}/thumb`, undefined, cookie));
  assert.equal((await h(nb.id, s.dauChu.cookie)).headers.get("cache-control"), "private, no-store");
  assert.equal((await h(g.id, s.dauChu.cookie)).headers.get("cache-control"), "private, max-age=300");
  assert.equal((await h(nb.id, "")).status, 401);
  assert.equal((await h(g.id, "")).status, 401);
});

test("E6b bản Storage: kiểm quyền trước khi ký, đường mang mã sàn, xoá gửi hai lệnh", async () => {
  const s = await san("e6b");
  const nhan: { method: string; path: string }[] = [];
  const gia: typeof fetch = async (url, init) => {
    nhan.push({ method: init?.method ?? "GET", path: new URL(String(url)).pathname });
    return new Response(null, { status: 200 });
  };
  const cfg = { accessKey: "ak-thu", secretKey: "sk-thu", endpoint: "https://s3-gia.test/storage/v1/s3", region: "ap-southeast-1", bucket: "unit-photos" };
  // Ký link là phép tính tại chỗ (không gọi máy chủ) — đếm thêm số lần kho được xin link.
  const kho = khoTuS3(khoS3(cfg, gia));
  let xinLink = 0;
  const khoDem = { ...kho, doc: (...a: Parameters<typeof kho.doc>) => (xinLink++, kho.doc(...a)) };
  const appS3 = createApi({ appPool, identityPool, auth, khoAnh: khoDem });
  const nb = await them(appS3, s.dauChu.cookie, { ngan: "internal" });
  const goc = `/storage/v1/s3/unit-photos/${s.companyId}/${nb.id}`;
  assert.deepEqual(nhan, [{ method: "PUT", path: `${goc}/original` }, { method: "PUT", path: `${goc}/thumb` }]);
  assert.equal(await dem("unit_photo_files", "photo_id", nb.id), 0, "bản Storage vẫn ghi byte vào Postgres");
  const truoc = nhan.length;
  assert.equal((await goi(appS3, "GET", `/api/v1/units/photos/${nb.id}/original`, undefined, s.dauKhach.cookie)).status, 404);
  assert.equal(nhan.length, truoc, "máy chủ giả nhận yêu cầu khi người không được xem xin link");
  assert.equal(xinLink, 0, `kho ký link ${xinLink} lần cho người không được xem`);
  const r = await goi(appS3, "GET", `/api/v1/units/photos/${nb.id}/original`, undefined, s.dauChu.cookie);
  assert.equal(r.status, 302);
  assert.equal(r.headers.get("cache-control"), "private, no-store");
  const link = new URL(r.headers.get("location")!);
  assert.equal(link.pathname, `${goc}/original`);
  assert.equal(link.searchParams.get("X-Amz-Expires"), "60");
  assert.equal((await goi(appS3, "DELETE", `/api/v1/units/photos/${nb.id}`, undefined, s.dauChu.cookie)).status, 200);
  assert.deepEqual(nhan.slice(truoc), [{ method: "DELETE", path: `${goc}/original` }, { method: "DELETE", path: `${goc}/thumb` }]);
});
