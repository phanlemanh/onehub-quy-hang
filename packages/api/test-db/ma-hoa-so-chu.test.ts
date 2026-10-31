// Mã hoá số chủ qua API trên Postgres thật (hàng 62: AC-6..AC-9 — ADR-0013). Số mẫu `0900 000 0xx`, tên `[Tên]`.
// Test chạy không có OWNER_PHONE_KEY nên API dùng khoá dev; lệnh mã hoá lại dòng lệnh luôn cần khoá tường minh.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { createApi } from "../src/app";
import { KHOA_DEV } from "../src/owners/khoa";
import { maHoaLai } from "../src/owners/ma-hoa-lai";
import { timDangSo } from "../src/owners/ma-hoa";
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

async function login(email: string): Promise<string> {
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  return cookieOf(await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp }));
}

/** Một sàn có một đầu chủ đã đăng nhập (cookie trỏ sàn). */
async function sanMoi(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} mh-${ten}]`, mail(`mh-${ten}-qt`));
  const email = mail(`mh-${ten}-dc`);
  const userId = await createLoneUser(email);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{listing_agent}')", [s.companyId, userId]);
  return { companyId: s.companyId, dauChu: { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` } };
}
type San = Awaited<ReturnType<typeof sanMoi>>;
const SAN_A = sanMoi("a");
const SAN_B = sanMoi("b");

/** Hàng «Chỉ tôi» của đầu chủ, có chủ nhà mang số `so`. */
async function hangCoSo(s: San, so: string): Promise<string> {
  const res = await send("POST", "/api/v1/listings", { buildingName: "[Toà mẫu]", unitNumber: "A-1201" }, s.dauChu.cookie);
  assert.equal(res.status, 201);
  const id = ((await res.json()) as { id: string }).id;
  const put = await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Tên]", ownerPhone: so }, s.dauChu.cookie);
  assert.equal(put.status, 200, await put.clone().text());
  return id;
}
const moSo = (id: string, s: San) => send("POST", `/api/v1/listings/${id}/owner/phone-reveal`, undefined, s.dauChu.cookie);
const demMoSo = async (id: string) =>
  (await appPool.query<{ n: number }>("select count(*)::int n from owner_phone_reveals where listing_id = $1", [id])).rows[0]!.n;

/** Chữ của mọi dòng ba bảng của hàng, đọc bằng vai chủ — row::text cùng hex, base64, escape của từng cột bytea. */
async function chuCuaHang(id: string): Promise<string> {
  const cau = [
    `select t::text c, encode(t.owner_phone_enc, 'base64') b, encode(t.owner_phone_enc, 'escape') e,
            encode(t.owner_phone_hash, 'base64') hb, encode(t.owner_phone_hash, 'escape') he from listing_owners t where listing_id = $1`,
    "select t::text c from owner_phone_reveals t where listing_id = $1",
    "select t::text c from listing_events t where listing_id = $1",
  ];
  const phan: string[] = [];
  for (const q of cau) for (const r of (await appPool.query(q, [id])).rows) phan.push(...Object.values(r).map(String));
  return phan.join("\n");
}

test("mã hoá số chủ: ghi qua API chỉ để lại bản mã", async () => {
  const a = await SAN_A;
  const id = await hangCoSo(a, "0900 000 012");
  const { rows } = await appPool.query("select owner_phone, owner_phone_enc, owner_phone_hash from listing_owners where listing_id = $1", [id]);
  assert.equal(rows[0].owner_phone, null);
  assert.equal(rows[0].owner_phone_enc.length, 39);
  assert.equal(rows[0].owner_phone_enc[0], 1);
  assert.equal(rows[0].owner_phone_hash.length, 32);
  await moSo(id, a); // có cả dòng sự kiện mở số trong phép quét
  const chu = await chuCuaHang(id);
  assert.equal(timDangSo(chu, "0900000012"), null, "đọc thẳng bằng vai chủ thấy số");
  // Đối chứng dương cùng hàm quét: chữ cấy số thì bị bắt.
  assert.equal(timDangSo(`${chu}\n0900000012`, "0900000012"), "0900000012");
  const get = await send("GET", `/api/v1/listings/${id}/owner`, undefined, a.dauChu.cookie);
  const view = (await get.json()) as Record<string, unknown>;
  assert.equal(view.hasPhone, true);
  assert.ok(!("ownerPhone" in view));
});

test("mã hoá số chủ: hàm mở số trả bản mã, không trả số", async () => {
  const a = await SAN_A;
  const id = await hangCoSo(a, "0900000014");
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.company_id', $1, true), set_config('app.user_id', $2, true)", [a.companyId, a.dauChu.userId]);
    const banMa = (await c.query("select app.reveal_owner_phone($1) b", [id])).rows[0].b;
    assert.ok(Buffer.isBuffer(banMa), "hàm trả bytea");
    assert.equal(banMa[0], 1);
    assert.equal(timDangSo(banMa.toString("latin1"), "0900000014"), null);
  } finally {
    await c.query("rollback");
    c.release();
  }
  const res = await moSo(id, a);
  assert.deepEqual(await res.json(), { ownerPhone: "0900000014" }, "API giải ra đúng số");
});

test("mã hoá số chủ: bản mã chép sang hàng khác hay bị sửa không ra số", async () => {
  const a = await SAN_A;
  const hA = await hangCoSo(a, "0900000021");
  const hB = await hangCoSo(a, "0900000022");
  const doc = async (id: string) =>
    (await appPool.query("select owner_phone_enc e from listing_owners where listing_id = $1", [id])).rows[0].e as Buffer;
  const goc = await doc(hB);
  const datB = (b: Buffer) => appPool.query("update listing_owners set owner_phone_enc = $2 where listing_id = $1", [hB, b]);
  const sua = Buffer.from(goc);
  sua[30] = sua[30]! ^ 0xff;
  for (const [ten, banMa] of [["chép bản mã của A", await doc(hA)], ["đổi một byte", sua]] as const) {
    await datB(banMa);
    const truoc = await demMoSo(hB);
    const res = await moSo(hB, a);
    assert.ok(res.status >= 400, `${ten}: mở số phải lỗi, ra ${res.status}`);
    const than = await res.text();
    assert.equal(timDangSo(than, "0900000021"), null, `${ten}: lộ số A`);
    assert.equal(timDangSo(than, "0900000022"), null, `${ten}: lộ số B`);
    assert.equal(await demMoSo(hB), truoc, `${ten}: không còn sự kiện mở số`);
  }
  await datB(goc);
  assert.deepEqual(await (await moSo(hB, a)).json(), { ownerPhone: "0900000022" }, "đối chứng dương: bản mã gốc ra số B");
});

const RANG_BUOC = "listing_owners_phone_chi_ban_ma";
/** Cấy dòng số rõ như dữ liệu trước migration 008: tạm gỡ ràng buộc, đặt số rõ, dựng lại NOT VALID. */
async function cayDongSoRo(dong: [string, string][]) {
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query(`alter table listing_owners drop constraint ${RANG_BUOC}`);
    for (const [id, so] of dong) {
      await c.query("update listing_owners set owner_phone = $2, owner_phone_enc = null, owner_phone_hash = null where listing_id = $1", [id, so]);
    }
    await c.query(`alter table listing_owners add constraint ${RANG_BUOC} check (owner_phone is null) not valid`);
    await c.query("commit");
  } finally {
    c.release();
  }
}
const demSoRo = async () => (await appPool.query<{ n: number }>("select count(*)::int n from listing_owners where owner_phone is not null")).rows[0]!.n;
const LENH = fileURLToPath(new URL("../van-hanh/ma-hoa-lai.ts", import.meta.url));
function chayLenh(khoa: string | undefined) {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.NODE_ENV;
  if (khoa === undefined) delete env.OWNER_PHONE_KEY;
  else env.OWNER_PHONE_KEY = khoa;
  const r = spawnSync(process.execPath, ["--import", "tsx", LENH], { env, encoding: "utf8" });
  return { ma: r.status, ra: `${r.stdout}\n${r.stderr}`, loi: r.stderr };
}
const SO_MAU_LAI = ["0900000031", "0900000032", "0900000033"];

test("mã hoá lại: số rõ thành bản mã, chạy lại không đổi byte", async () => {
  const [a, b] = [await SAN_A, await SAN_B];
  const dong: [string, string][] = [
    [await hangCoSo(a, "0900000099"), SO_MAU_LAI[0]!],
    [await hangCoSo(a, "0900000099"), SO_MAU_LAI[1]!],
    [await hangCoSo(b, "0900000099"), SO_MAU_LAI[2]!],
  ];
  await cayDongSoRo(dong);
  assert.equal(await demSoRo(), 3);
  const lan = async () => {
    const c = await appPool.connect();
    try {
      await c.query("begin");
      const kq = await maHoaLai(c, KHOA_DEV);
      await c.query("commit");
      return kq;
    } finally {
      c.release();
    }
  };
  assert.equal((await lan()).daMaHoa, 3);
  const doc = async () =>
    (await appPool.query("select listing_id, owner_phone, owner_phone_enc, owner_phone_hash from listing_owners where listing_id = any($1) order by listing_id", [dong.map((d) => d[0])])).rows;
  const sau1 = await doc();
  assert.ok(sau1.every((r) => r.owner_phone === null && r.owner_phone_enc?.length === 39 && r.owner_phone_hash?.length === 32));
  const hopLe = (await appPool.query("select convalidated v from pg_constraint where conname = $1", [RANG_BUOC])).rows[0].v;
  assert.equal(hopLe, true, "ràng buộc đã validate");
  for (const [i, [id, so]] of dong.entries()) {
    const s = i < 2 ? a : b;
    const truoc = await demMoSo(id);
    assert.deepEqual(await (await moSo(id, s)).json(), { ownerPhone: so }, `mở số qua API ra số của dòng ${i}`);
    assert.equal(await demMoSo(id), truoc + 1);
  }
  assert.equal((await lan()).daMaHoa, 0);
  assert.deepEqual(await doc(), sau1, "lần hai giữ nguyên từng byte");
});

test("mã hoá lại: thiếu khoá hay khoá dev thì từ chối, không chạm dòng", async () => {
  const a = await SAN_A;
  await cayDongSoRo([[await hangCoSo(a, "0900000099"), "0900000041"]]);
  const truoc = await demSoRo();
  assert.ok(truoc >= 1);
  for (const [ten, khoa] of [["không khoá", undefined], ["khoá sai dạng", "abc"], ["khoá dev", KHOA_DEV.key.toString("base64")]] as const) {
    const r = chayLenh(khoa);
    assert.notEqual(r.ma, 0, `${ten}: phải thoát khác 0`);
    assert.match(r.loi, /OWNER_PHONE_KEY/, ten);
    assert.equal(await demSoRo(), truoc, `${ten}: không chạm dòng`);
  }
  // Đối chứng dương: khoá thử hợp lệ → thoát 0, hết số rõ.
  const r = chayLenh(randomBytes(32).toString("base64"));
  assert.equal(r.ma, 0, r.ra);
  assert.equal(await demSoRo(), 0);
  assert.equal(timDangSo(r.ra, "0900000041"), null);
});

test("mã hoá lại: lệnh dòng lệnh chạy hai lần", async () => {
  const khoa = randomBytes(32).toString("base64");
  for (const lan of [1, 2]) {
    const r = chayLenh(khoa);
    assert.equal(r.ma, 0, `lần ${lan}: ${r.ra}`);
    assert.match(r.ra, /đã mã hoá 0 dòng/, `lần ${lan}`);
    for (const so of [...SO_MAU_LAI, "0900000041"]) assert.equal(timDangSo(r.ra, so), null, `lần ${lan}: lộ số`);
    assert.ok(!r.ra.includes(khoa), `lần ${lan}: lộ khoá`);
  }
});
