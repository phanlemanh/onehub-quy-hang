// Vá ảnh bản thật qua API trên Postgres thật (va-anh-ban-that: E1, E2, E3, E4). Kho Storage là máy chủ S3 giả có lưu đối
// tượng (PUT, GET Range, DELETE) — không kiểm chữ ký như Supabase; thử khói kho thật là thu/khoi-storage.mjs (Hỏi-3).
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../src/app";
import { khoTuS3 } from "../src/photos/kho";
import { khoS3 } from "../src/photos/kho-s3";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const KH = "mlh";
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

/** Một sàn: đầu chủ giữ căn (một lần rao của căn), đầu khách, trưởng nhóm. */
async function san(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} ${KH}${ten}]`, mail(`${KH}-${ten}-qt`));
  const them = async (vai: string[], nhan: string) => {
    const email = mail(`${KH}-${ten}-${nhan}`);
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


/** Máy chủ S3 giả lưu đối tượng theo đường; ghi lại mọi yêu cầu (phương thức, đường). */
function khoGia() {
  const doiTuong = new Map<string, Buffer>();
  const nhan: { method: string; path: string }[] = [];
  const f: typeof fetch = async (url, init) => {
    const path = decodeURIComponent(new URL(String(url)).pathname);
    const method = init?.method ?? "GET";
    nhan.push({ method, path });
    if (method === "PUT") {
      doiTuong.set(path, Buffer.from(await new Response(init!.body as ConstructorParameters<typeof Response>[0]).arrayBuffer()));
      return new Response(null, { status: 200 });
    }
    if (method === "DELETE") {
      doiTuong.delete(path);
      return new Response(null, { status: 204 });
    }
    const b = doiTuong.get(path);
    if (!b) return new Response(null, { status: 404 });
    const dau = b.subarray(0, 64);
    return new Response(new Uint8Array(dau), { status: 206, headers: { "content-range": `bytes 0-${dau.length - 1}/${b.length}` } });
  };
  const cfg = { accessKey: "ak-thu", secretKey: "sk-thu", endpoint: "https://s3-gia.test/storage/v1/s3", region: "ap-southeast-1", bucket: "unit-photos" };
  return { doiTuong, nhan, app: createApi({ appPool, identityPool, auth, khoAnh: khoTuS3(khoS3(cfg, f)) }) };
}
const goc = (companyId: string, id: string) => `/storage/v1/s3/unit-photos/${companyId}/${id}/original`;
type Link = { truc_tiep: boolean; photoId?: string; url?: string };
async function xinLink(a: ReturnType<typeof createApi>, cookie: string, o: { byteSize: number; contentType?: string; ma?: string }) {
  return goi(a, "POST", "/api/v1/units/photos/upload-url", { toa: TOA, ma: o.ma ?? MA, contentType: o.contentType ?? "image/jpeg", byteSize: o.byteSize }, cookie);
}
function formXacNhan(photoId: string) {
  const f = new FormData();
  f.set("toa", TOA); f.set("ma", MA); f.set("compartment", "shareable"); f.set("width", "4000"); f.set("height", "3000");
  f.set("photoId", photoId);
  f.set("thumb", new File([new Uint8Array(PNG)], "nhe.png", { type: "image/png" }));
  return f;
}
const demDong = async (companyId: string) => [
  (await appPool.query<{ n: number }>("select count(*)::int n from unit_photos where company_id = $1", [companyId])).rows[0]!.n,
  (await appPool.query<{ n: number }>("select count(*)::int n from unit_photo_events where company_id = $1", [companyId])).rows[0]!.n,
];

test("E1 tải thẳng lên kho: link PUT 60 giây, bản gốc không qua thân yêu cầu, xác nhận chỉ mang mã ảnh và bản nhẹ", async () => {
  const s = await san("e1");
  const k = khoGia();
  const r = await xinLink(k.app, s.dauChu.cookie, { byteSize: 8_000_000 });
  assert.equal(r.status, 200);
  const l = (await r.json()) as Link;
  assert.equal(l.truc_tiep, true);
  const u = new URL(l.url!);
  assert.equal(u.searchParams.get("X-Amz-Expires"), "60");
  assert.equal(u.pathname, goc(s.companyId, l.photoId!));
  await khoGiaPut(k, u, JPEG(8_000_000, 5));
  const form = formXacNhan(l.photoId!);
  const than = (await new Request("http://x", { method: "POST", body: form }).arrayBuffer()).byteLength;
  assert.ok(than < 1_000_000, `thân xác nhận ${than} byte — bản gốc đi qua API`);
  const x = await goi(k.app, "POST", "/api/v1/units/photos", form, s.dauChu.cookie);
  assert.equal(x.status, 201, await x.clone().text());
  const row = (await appPool.query("select byte_size from unit_photos where id = $1", [l.photoId])).rows[0];
  assert.deepEqual(row, { byte_size: 8_000_000 });
  assert.deepEqual(k.nhan.slice(1).map((y) => `${y.method} ${y.path.split("/").at(-1)}`), ["GET original", "PUT thumb"]);
});
/** Trình duyệt PUT lên link (test giả lập) — ghi vào cùng kho giả. */
async function khoGiaPut(k: ReturnType<typeof khoGia>, u: URL, b: Buffer) {
  k.doiTuong.set(decodeURIComponent(u.pathname), b);
  k.nhan.push({ method: "PUT", path: decodeURIComponent(u.pathname) });
}

test("E2 kiểm bản gốc trên kho: sai loại, quá cỡ, không có, mã sàn khác, mã đã dùng, khai sai — không ghi, xoá đúng tiền tố", async () => {
  const s = await san("e2");
  const b = await san("e2b");
  const k = khoGia();
  const tu = async (byteSize: number, noiDung: Buffer | null) => {
    const l = (await (await xinLink(k.app, s.dauChu.cookie, { byteSize })).json()) as Link;
    if (noiDung) await khoGiaPut(k, new URL(l.url!), noiDung);
    return l.photoId!;
  };
  const truoc = await demDong(s.companyId);
  const ca: [string, Buffer | null, number, number, string][] = [
    ["văn bản", Buffer.from("day khong phai anh"), 18, 400, "photo-not-image"],
    ["quá cỡ", JPEG(10_485_761), 10_000_000, 400, "photo-too-large"],
    ["không có", null, 5000, 400, "photo-not-image"],
  ];
  const saiLoai: string[] = [];
  for (const [ten, nd, khai, ma, loi] of ca) {
    const id = await tu(khai, nd);
    if (nd) saiLoai.push(goc(s.companyId, id));
    const r = await goi(k.app, "POST", "/api/v1/units/photos", formXacNhan(id), s.dauChu.cookie);
    assert.deepEqual([r.status, await r.json()], [ma, { error: loi }], `ca ${ten}`);
    assert.deepEqual(await demDong(s.companyId), truoc, `ca ${ten}: còn dòng`);
    assert.equal(k.doiTuong.has(goc(s.companyId, id)), false, `ca ${ten}: đối tượng sai còn trên kho`);
  }
  // Mã ảnh do sàn B xin, sàn A xác nhận.
  const lb = (await (await xinLink(k.app, b.dauChu.cookie, { byteSize: 5000 })).json()) as Link;
  await khoGiaPut(k, new URL(lb.url!), JPEG(5000));
  let r = await goi(k.app, "POST", "/api/v1/units/photos", formXacNhan(lb.photoId!), s.dauChu.cookie);
  assert.equal(r.status, 400, "xác nhận mã của sàn khác");
  assert.ok(k.doiTuong.has(goc(b.companyId, lb.photoId!)), "bản gốc của sàn B bị xoá");
  // Mã đã có dòng.
  const ok = await tu(5000, JPEG(5000));
  assert.equal((await goi(k.app, "POST", "/api/v1/units/photos", formXacNhan(ok), s.dauChu.cookie)).status, 201);
  const sau = await demDong(s.companyId);
  r = await goi(k.app, "POST", "/api/v1/units/photos", formXacNhan(ok), s.dauChu.cookie);
  assert.deepEqual([r.status, await r.json()], [409, { error: "photo-already-confirmed" }]);
  assert.deepEqual(await demDong(s.companyId), sau, "xác nhận lần hai đổi số dòng");
  // Hai lần xác nhận song song cùng mã: một lần ghi, lần kia 409 — không vỡ khoá chính.
  const song = await tu(5000, JPEG(5000));
  const hai = await Promise.all([1, 2].map(() => goi(k.app, "POST", "/api/v1/units/photos", formXacNhan(song), s.dauChu.cookie)));
  assert.deepEqual(hai.map((x) => x.status).sort(), [201, 409], "xác nhận song song");
  // Mã sai khuôn uuid: 400, không chạm cơ sở dữ liệu hay kho.
  r = await goi(k.app, "POST", "/api/v1/units/photos", formXacNhan("-".repeat(36)), s.dauChu.cookie);
  assert.deepEqual([r.status, await r.json()], [400, { error: "invalid-payload" }]);
  // Khai sai ở bước xin link, và người không được thêm ảnh: kho không nhận yêu cầu nào.
  const truocKho = k.nhan.length;
  assert.deepEqual([(r = await xinLink(k.app, s.dauChu.cookie, { byteSize: 10_485_761 })).status, await r.json()], [400, { error: "photo-too-large" }]);
  assert.deepEqual([(r = await xinLink(k.app, s.dauChu.cookie, { byteSize: 100, contentType: "text/plain" })).status, await r.json()], [400, { error: "photo-not-image" }]);
  assert.equal((await xinLink(k.app, s.dauKhach.cookie, { byteSize: 5000 })).status, 403);
  // Đầu chủ sàn B xin link cho căn chỉ sàn A có → 403.
  const MA_A = "A-0602";
  assert.equal((await goi(app, "POST", "/api/v1/listings", { buildingName: TOA, unitNumber: MA_A }, s.dauChu.cookie)).status, 201);
  assert.equal((await xinLink(k.app, b.dauChu.cookie, { byteSize: 5000, ma: MA_A })).status, 403, "đầu chủ sàn khác xin link");
  // Đầu chủ sàn B khai cookie sàn A (không là thành viên A): phiên vẫn ở sàn B — link nằm dưới tiền tố B, không bao giờ A.
  const bVaoA = b.dauChu.cookie.replace(`qh_san=${b.companyId}`, `qh_san=${s.companyId}`);
  const lba = (await (await xinLink(k.app, bVaoA, { byteSize: 5000 })).json()) as Link;
  assert.ok(new URL(lba.url!).pathname.startsWith(`/storage/v1/s3/unit-photos/${b.companyId}/`), `link của B dưới tiền tố khác: ${lba.url}`);
  assert.equal(k.nhan.length, truocKho, "kho nhận yêu cầu khi xin link bị từ chối");
  const xoa = k.nhan.filter((y) => y.method === "DELETE").map((y) => y.path);
  assert.deepEqual(xoa, saiLoai, "DELETE đúng hai đối tượng sai, không gì khác");
});

test("E3 kho Postgres: xin link trả truc_tiep false, đường cũ vẫn chạy", async () => {
  const s = await san("e3");
  const r = await xinLink(app, s.dauChu.cookie, { byteSize: 5000 });
  assert.deepEqual([r.status, await r.json()], [200, { truc_tiep: false }]);
  await them(app, s.dauChu.cookie);
});

test("E4 chuyển hướng tới link ký không giữ đệm ở cả hai ngăn; byte của bản Postgres giữ như hàng 18", async () => {
  const s = await san("e4");
  const k = khoGia();
  const mo = async (a: ReturnType<typeof createApi>, ngan: string) => {
    const p = await them(a, s.dauChu.cookie, { ngan });
    const r = await goi(a, "GET", `/api/v1/units/photos/${p.id}/thumb`, undefined, s.dauChu.cookie);
    return [r.status, r.headers.get("cache-control")];
  };
  assert.deepEqual(await mo(k.app, "shareable"), [302, "private, no-store"], "S3 · gửi được");
  assert.deepEqual(await mo(k.app, "internal"), [302, "private, no-store"], "S3 · nội bộ");
  assert.deepEqual(await mo(app, "shareable"), [200, "private, max-age=300"], "Postgres · gửi được");
  assert.deepEqual(await mo(app, "internal"), [200, "private, no-store"], "Postgres · nội bộ");
});
