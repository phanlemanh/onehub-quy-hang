// Mẫu file của sàn (hàng 67, AC-3, AC-4, E4): chỉ lần nhập đã ghi dạy mẫu, mỗi khoá tiêu đề giữ lần mới nhất, chỉ vai nhập
// đọc, không thấy mẫu của sàn khác, cột nguồn và cột tên chủ không mang bảng quy đổi. Lần nhập ghi thẳng vào bảng bằng vai
// chủ bảng của bộ kiểm (đi vòng validatePlan) để chứng máy chủ tự bỏ bảng quy đổi, không trông vào bên gửi. Postgres dãy.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { khoaMau } from "@quy-hang/core/import";
import { createApi } from "../../src/app";
import { API_ERRORS } from "../../src/errors";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const get = (path: string, cookie: string) => app.request(`${BASE_URL}${path}`, { headers: { origin: BASE_URL, cookie } });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await app.request(`${BASE_URL}/api/v1/auth/email-otp/send-verification-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE_URL },
    body: JSON.stringify({ email, type: "sign-in" }),
  });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await app.request(`${BASE_URL}/api/v1/auth/sign-in/email-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE_URL },
    body: JSON.stringify({ email, otp: code.otp }),
  });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

async function sanMoi(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} mau ${ten}]`, mail(`mau-${ten}-qt`));
  const them = async (vai: string[], nhan: string) => {
    const email = mail(`mau-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, email, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return { companyId: s.companyId, dauChu: await them(["listing_agent"], "dc"), truongNhom: await them(["team_lead"], "tn"), dauKhach: await them(["buyer_agent"], "dk") };
}

type Cot = { column: string; target: string; transform?: unknown; valueMap?: Record<string, string>; confidence: string; reason: string };
let soTep = 0;
async function lanNhap(companyId: string, userId: string, cot: Cot[], status: "planned" | "committed", luc: string) {
  const plan = { headerRow: 0, columns: cot, questions: [], headers: cot.map((c) => c.column) };
  const { rows } = await appPool.query<{ id: string }>(
    `insert into imports (company_id, created_by, created_roles, file_name, file_hash, file_kind, header_row, plan, status, created_at)
     values ($1, $2, '{listing_agent}', $3, $4, 'xlsx', '0', $5, $6, $7) returning id`,
    [companyId, userId, `[Tệp ${++soTep}].xlsx`, createHash("sha256").update(`${RUN}-mau-${soTep}`).digest("hex"), JSON.stringify(plan), status, luc],
  );
  return rows[0]!.id;
}
const cot = (column: string, target: string, them: Partial<Cot> = {}): Cot => ({ column, target, confidence: "high", reason: "người chọn ở bước ghép cột", ...them });

test("mẫu của sàn: chỉ lần đã ghi, mới nhất thắng, cách ly", async () => {
  const A = await sanMoi("a");
  const B = await sanMoi("b");
  const lan1 = await lanNhap(A.companyId, A.dauChu.userId, [
    cot("Trạng thái", "standardStatus", { transform: { name: "status" }, valueMap: { "đã cọc rồi": "Đã cọc" } }),
    cot("SĐT chủ", "ownerPhone", { transform: { name: "phone" }, valueMap: { "0900 000 012": "0900 000 099" } }),
    cot("Tên chủ", "ownerName", { valueMap: { "[Tên chủ mẫu]": "[Tên]" } }),
  ], "committed", "2026-11-01T01:00:00Z");
  const lan2 = await lanNhap(A.companyId, A.dauChu.userId, [cot("Trạng thái", "keep_as_note")], "committed", "2026-11-03T01:00:00Z");
  await lanNhap(A.companyId, A.dauChu.userId, [cot("Ghi chú", "privateRemarks")], "planned", "2026-11-04T01:00:00Z");

  const kq: Record<string, Record<string, unknown>[]> = {};
  for (const [ten, nguoi] of [["Đầu chủ", A.dauChu], ["Trưởng nhóm", A.truongNhom]] as const) {
    const res = await get("/api/v1/imports/templates", nguoi.cookie);
    assert.equal(res.status, 200, ten);
    kq[ten] = (await res.json()) as Record<string, unknown>[];
  }
  const ds = kq["Đầu chủ"]!;
  assert.deepEqual(kq["Trưởng nhóm"], ds, "Trưởng nhóm đọc cùng danh sách");
  const theo = (h: string) => ds.find((d) => d.headerKey === khoaMau(h));
  assert.equal(theo("Trạng thái")?.target, "keep_as_note", "«trang thai» phải mang đích của lần 2");
  assert.equal(theo("Trạng thái")?.importId, lan2);
  assert.equal(theo("Ghi chú"), undefined, "«ghi chu» của lần chỉ xem thử không được dạy mẫu");
  const KHOA = new Set(["headerKey", "target", "transform", "valueMap", "importId", "at"]);
  for (const d of ds) for (const k of Object.keys(d)) assert.ok(KHOA.has(k), `khoá lạ ${k} ở ${String(d.headerKey)}`);
  assert.ok(theo("SĐT chủ"), "cột nguồn của lần 1 có trong mẫu");
  assert.ok(!("valueMap" in theo("SĐT chủ")!), "cột nguồn không mang bảng quy đổi");
  assert.ok(!("valueMap" in theo("Tên chủ")!), "«ten chu» không mang bảng quy đổi");
  const than = JSON.stringify(ds);
  for (const v of ["0900 000 0", "[Tên chủ mẫu]"]) assert.ok(!than.includes(v), `thân chứa «${v}»`);
  assert.equal(theo("SĐT chủ")?.importId, lan1);

  // Đối chứng dương: cột trạng thái của lần 1 (ở sàn khác cùng dữ liệu) giữ bảng quy đổi.
  await lanNhap(B.companyId, B.dauChu.userId, [cot("Trạng thái", "standardStatus", { transform: { name: "status" }, valueMap: { "đã cọc rồi": "Đã cọc" } })], "committed", "2026-11-01T01:00:00Z");
  const resB = await get("/api/v1/imports/templates", B.dauChu.cookie);
  const dsB = (await resB.json()) as Record<string, unknown>[];
  assert.deepEqual(dsB.find((d) => d.headerKey === khoaMau("Trạng thái"))?.valueMap, { "đã cọc rồi": "Đã cọc" }, "cột trạng thái giữ bảng quy đổi");
  assert.ok(!dsB.some((d) => d.importId === lan1 || d.importId === lan2), "sàn B thấy mẫu của sàn A");

  const sanRong = await sanMoi("c");
  const resC = await get("/api/v1/imports/templates", sanRong.dauChu.cookie);
  assert.deepEqual(await resC.json(), [], "sàn chưa ghi lần nhập nào: mẫu rỗng");

  const tuChoi = await get("/api/v1/imports/templates", A.dauKhach.cookie);
  assert.equal(tuChoi.status, 403);
  assert.deepEqual(await tuChoi.json(), { error: API_ERRORS.importRoleRequired.code });
});
