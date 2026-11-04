// Lần xuất bảng hàng qua API trên Postgres thật (hàng 43 phat-hang, E8). Đọc lại dòng bằng kết nối chủ để thấy đúng điều
// cơ sở dữ liệu giữ, không qua bộ đọc của API.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { API_ERRORS } from "../../src/errors";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const KH = "lx";

const goi = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { origin: BASE_URL, ...(cookie ? { cookie } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await goi("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  return cookieOf(await goi("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp }));
}

/** Một sàn mới và một người mang vai đã cho; cookie đã chọn sàn. */
async function nguoi(ten: string, roles: string[]) {
  const s = await openCompany(`[Sàn ${RUN} ${KH}${ten}]`, mail(`${KH}-${ten}-qt`));
  const email = mail(`${KH}-${ten}-a`);
  const userId = await createLoneUser(email);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, roles]);
  return { companyId: s.companyId, userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
}

const demDong = async (companyId: string) =>
  Number((await appPool.query<{ n: string }>("select count(*) n from exports where company_id = $1", [companyId])).rows[0]!.n);

test("E8 đầu chủ ghi đúng một lần xuất mang sàn, người, mẫu, người nhận, số căn, lúc xuất", async () => {
  const a = await nguoi("dc", ["listing_agent"]);
  const truoc = Date.now();
  const r = await goi("POST", "/api/v1/exports", { format: "post_zalo", recipient: "nhom_moi_gioi", listingCount: 3 }, a.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  const { id } = (await r.json()) as { id: string };
  const { rows } = await appPool.query<{ id: string; company_id: string; user_id: string; format: string; recipient: string; listing_count: number; created_at: Date }>(
    "select id, company_id, user_id, format, recipient, listing_count, created_at from exports where company_id = $1",
    [a.companyId],
  );
  assert.equal(rows.length, 1, "phải đúng một dòng");
  const d = rows[0]!;
  assert.deepEqual(
    { id: d.id, company_id: d.company_id, user_id: d.user_id, format: d.format, recipient: d.recipient, listing_count: d.listing_count },
    { id, company_id: a.companyId, user_id: a.userId, format: "post_zalo", recipient: "nhom_moi_gioi", listing_count: 3 },
  );
  assert.ok(d.created_at.getTime() >= truoc - 5_000 && d.created_at.getTime() <= Date.now() + 5_000, "lúc xuất lệch");
});

test("E8 trưởng nhóm ghi được; vai khác 403, không ghi dòng", async () => {
  const tn = await nguoi("tn", ["team_lead"]);
  const r = await goi("POST", "/api/v1/exports", { format: "xlsx", recipient: "khach_rieng", listingCount: 1 }, tn.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  assert.equal(await demDong(tn.companyId), 1);

  for (const roles of [["buyer_agent"], ["telesales"], ["company_admin"], []]) {
    const k = await nguoi(`k${roles.join("") || "trong"}`, roles);
    const x = await goi("POST", "/api/v1/exports", { format: "pdf", recipient: "khach_rieng", listingCount: 2 }, k.cookie);
    assert.equal(x.status, 403, `vai ${roles.join(",") || "trống"}: ${x.status}`);
    assert.deepEqual(await x.json(), { error: API_ERRORS.exportRoleRequired.code });
    assert.equal(await demDong(k.companyId), 0, `vai ${roles.join(",") || "trống"} ghi được lần xuất`);
  }
});

test("E8 khoá lạ hay sai khuôn → 400, không ghi dòng", async () => {
  const a = await nguoi("kl", ["listing_agent"]);
  const DUNG = { format: "png", recipient: "khach_rieng", listingCount: 2 };
  const BANG: [string, unknown][] = [
    ["nội dung", { ...DUNG, content: "[Bài]" }],
    ["danh sách căn", { ...DUNG, listingIds: ["00000000-0000-4000-8000-000000000001"] }],
    ["mẫu lạ", { ...DUNG, format: "docx" }],
    ["người nhận lạ", { ...DUNG, recipient: "ca_nhan" }],
    ["số căn 0", { ...DUNG, listingCount: 0 }],
    ["số căn lẻ", { ...DUNG, listingCount: 1.5 }],
    ["thiếu số căn", { format: "png", recipient: "khach_rieng" }],
  ];
  for (const [ten, than] of BANG) {
    const r = await goi("POST", "/api/v1/exports", than, a.cookie);
    assert.equal(r.status, 400, `${ten}: ${r.status}`);
    assert.equal(((await r.json()) as { error: string }).error, API_ERRORS.invalidPayload.code, ten);
  }
  assert.equal(await demDong(a.companyId), 0);
});

test("E8 chưa đăng nhập → 401", async () => {
  const r = await goi("POST", "/api/v1/exports", { format: "png", recipient: "khach_rieng", listingCount: 1 });
  assert.equal(r.status, 401);
});
