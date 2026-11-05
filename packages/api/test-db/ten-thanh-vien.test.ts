// E7c (hàng 105, AC-7): đường đọc tên thành viên cho cột «Đầu chủ» của Bảng hàng — mọi vai của sàn đọc được danh sách
// thành viên sàn mình, mỗi phần tử chỉ có mã và tên (không email, không số); người sàn khác không thấy ai của sàn này;
// không đăng nhập là 401. Chạy qua API thật trên Postgres đã áp migration (luật theo dòng, vai quy_hang_app).
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const get = (path: string, cookie = "") => app.request(`${BASE_URL}${path}`, { headers: { origin: BASE_URL, ...(cookie ? { cookie } : {}) } });

async function login(email: string): Promise<string> {
  const truoc = sent.length;
  const r = await app.request(`${BASE_URL}/api/v1/auth/email-otp/send-verification-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE_URL },
    body: JSON.stringify({ email, type: "sign-in" }),
  });
  assert.equal(r.status, 200, await r.clone().text());
  const code = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await app.request(`${BASE_URL}/api/v1/auth/sign-in/email-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE_URL },
    body: JSON.stringify({ email, otp: code.otp }),
  });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

type Nguoi = { userId: string; cookie: string };
async function san(nhan: string, vai: Record<string, string[]>) {
  const qt = mail(`${nhan}-qt`);
  const s = await openCompany(`[Sàn ${RUN} ten-thanh-vien ${nhan}]`, qt);
  const nguoi: Record<string, Nguoi> = { qt: { userId: s.userId, cookie: `${await login(qt)}; qh_san=${s.companyId}` } };
  for (const [k, roles] of Object.entries(vai)) {
    const email = mail(`${nhan}-${k.toLowerCase()}`);
    const userId = await createLoneUser(email);
    // Tên hiển thị mồi, không dữ liệu thật.
    await identityPool.query('update identity."user" set name = $2 where id = $1', [userId, `[Tên] ${nhan} ${k}`]);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, roles]);
    nguoi[k] = { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  }
  return { companyId: s.companyId, nguoi };
}

/** Khoá ngoài {id, name} của các phần tử — rỗng là đạt. */
const khoaLa = (ds: Record<string, unknown>[]) => [...new Set(ds.flatMap((x) => Object.keys(x).filter((k) => k !== "id" && k !== "name")))].sort();

test("tên thành viên: mọi vai của sàn đọc được, chỉ mã và tên", async () => {
  const a = await san("a", { dauChu: ["listing_agent"], dauKhach: ["buyer_agent"], truongNhom: ["team_lead"], telesales: ["telesales"] });
  const b = await san("b", { dauChu: ["listing_agent"] });
  const thanhVienA = Object.values(a.nguoi).map((n) => n.userId).sort();

  // Ma trận viết trước: bốn vai của sàn A → 200, đủ thành viên của A, mỗi phần tử đúng tập khoá {id, name}.
  for (const vai of ["dauChu", "dauKhach", "truongNhom", "telesales"]) {
    const r = await get("/api/v1/company/member-names", a.nguoi[vai]!.cookie);
    assert.equal(r.status, 200, `${vai}: ${await r.clone().text()}`);
    const ds = (await r.json()) as Record<string, unknown>[];
    assert.deepEqual(ds.map((x) => x.id).sort(), thanhVienA, `${vai}: danh sách thành viên sàn A`);
    for (const x of ds) assert.deepEqual(Object.keys(x).sort(), ["id", "name"], `${vai}: phần tử có khoá ngoài {id, name}: ${khoaLa([x]).join(", ")}`);
    assert.deepEqual(khoaLa(ds), [], `${vai}: khoá lạ`);
    const ten = new Map(ds.map((x) => [x.id, x.name]));
    assert.equal(ten.get(a.nguoi.dauChu!.userId), "[Tên] a dauChu", `${vai}: tên đầu chủ`);
    const chu = JSON.stringify(ds);
    assert.ok(!chu.includes("@"), `${vai}: bản trả chở email`);
  }

  // Người sàn B: danh sách không chứa thành viên nào của A.
  const rb = await get("/api/v1/company/member-names", b.nguoi.dauChu!.cookie);
  assert.equal(rb.status, 200);
  const dsB = ((await rb.json()) as { id: string }[]).map((x) => x.id);
  assert.deepEqual(dsB.filter((id) => thanhVienA.includes(id)), [], "sàn B thấy thành viên sàn A");
  assert.deepEqual(dsB.sort(), Object.values(b.nguoi).map((n) => n.userId).sort());

  // Không đăng nhập: 401.
  assert.equal((await get("/api/v1/company/member-names")).status, 401);

  // Chiều đỏ cùng ca: phần tử mang thêm khoá email thì bài so tập khoá gọi tên «email».
  const r = await get("/api/v1/company/member-names", a.nguoi.dauKhach!.cookie);
  const pha = ((await r.json()) as Record<string, unknown>[]).map((x) => ({ ...x, email: "[email]" }));
  assert.deepEqual(khoaLa(pha), ["email"]);
  assert.throws(() => assert.deepEqual(Object.keys(pha[0]!).sort(), ["id", "name"], `khoá ngoài {id, name}: ${khoaLa(pha).join(", ")}`), /email/);
});
