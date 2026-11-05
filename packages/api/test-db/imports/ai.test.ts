// «Xử lý bằng AI» trên Postgres dãy (hàng 68: AC-3, AC-4, AC-5, AC-8, AC-9, AC-11 — E3b, E4b, E5, E8, E9, E11). Khách AI
// trong mọi ca là khách giả tiêm qua `deps.khachAi` — không ca nào gọi mạng. Gói dựng bằng mã thật từ file lạ của hàng 68.
import { buildProfile, classifyColumns, dungGoiDeXuat, planFromDictionary, readTable, type Cell, type GoiDeXuat } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { sinhBoLa } from "../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/bo-la";
import { createApi } from "../../src/app";
import type { KhachAi } from "../../src/imports/ai/claude";
import { LY_DO } from "../../src/imports/ai/routes";
import { API_ERRORS } from "../../src/errors";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

// Thoả thuận không có xoá dây chuyền (001): gỡ thoả thuận của các sàn thử trước khi dọn sàn, như da-gui.test.ts.
after(async () => {
  await appPool.query("delete from agreements where company_id in (select id from companies where name like $1)", [`%${RUN}%`]);
  await cleanup();
});

const { auth, sent } = makeAuth();
const goiCua = (ten: string): GoiDeXuat => {
  const t = sinhBoLa().find((x) => x.ten === ten)!;
  const table = readTable(t.grid!);
  return dungGoiDeXuat(buildProfile(table, classifyColumns(table)).columns, planFromDictionary(table));
};
const GOI = goiCua("la-a-dong-nghia");
const DE_XUAT = { de_xuat: [{ cot: 1, dich: "buildingName", ly_do: "Tiêu đề «Khối nhà» là toà" }] };

/** Khách giả đếm lần gọi; `tl` quyết trả gì. */
function khachGia(tl: (n: number) => Promise<unknown> | unknown = () => DE_XUAT, usage = { input_tokens: 2000, output_tokens: 1500 }) {
  const dem = { n: 0 };
  const khach: KhachAi = async () => {
    dem.n++;
    return { json: await tl(dem.n), model: "claude-opus-5-5", usage };
  };
  return { khach, dem };
}
const appVoi = (khachAi: KhachAi | null) => createApi({ appPool, identityPool, auth, khachAi });
const APP = appVoi(khachGia().khach);
const send = (app: ReturnType<typeof createApi>, method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await send(APP, "POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send(APP, "POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

type Nguoi = { userId: string; cookie: string };
async function sanMoi(ten: string) {
  const k = `ai-${ten.toLowerCase()}`;
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, mail(`${k}-qt`));
  const them = async (vai: string[], nhan: string): Promise<Nguoi> => {
    const email = mail(`${k}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return {
    companyId: s.companyId as string,
    quanTri: { userId: s.userId as string, cookie: `${await login(mail(`${k}-qt`))}; qh_san=${s.companyId}` },
    dauChu: await them(["listing_agent"], "dc"),
    truongNhom: await them(["team_lead"], "tn"),
    dauKhach: await them(["buyer_agent"], "dk"),
  };
}
type San = Awaited<ReturnType<typeof sanMoi>>;
const bat = (s: San, b = true) => send(APP, "PUT", "/api/v1/imports/ai/agreement", { bat: b }, s.quanTri.cookie);
const dongAi = async (companyId: string) =>
  (await appPool.query<{ result: string; t: string; model: string; input_tokens: number; output_tokens: number; cost_usd: string; duration_ms: number; user_id: string; company_id: string }>(
    "select *, row_to_json(a)::text t from ai_usage a where company_id = $1 order by created_at", [companyId],
  )).rows;
const deXuat = async (app: ReturnType<typeof createApi>, goi: unknown, cookie: string) => {
  const r = await send(app, "POST", "/api/v1/imports/ai/plan", goi, cookie);
  return { status: r.status, body: (await r.json().catch(() => null)) as Record<string, unknown> | null };
};

test("đề xuất: chặn lần hai ở máy chủ", async () => {
  const s = await sanMoi("E3");
  assert.equal((await bat(s)).status, 204);
  const { khach, dem } = khachGia();
  const app = appVoi(khach);
  const coSo: GoiDeXuat = structuredClone(GOI);
  coSo.cot[5] = { ...coSo.cot[5]!, lop: "shareable_listing", giaTri: ["4.65", "0900 000 011"] };
  const r = await deXuat(app, coSo, s.dauChu.cookie);
  assert.equal(dem.n, 0, "khách AI bị gọi với gói có dữ liệu cá nhân");
  assert.equal(r.status, 200);
  assert.equal(r.body?.cheDo, "tat-dinh");
  assert.match(String(r.body?.lyDo), /dữ liệu cá nhân/);
  const d = await dongAi(s.companyId);
  assert.deepEqual(d.map((x) => x.result), ["blocked_pii"]);
  assert.ok(!d[0]!.t.includes("0900") && !d[0]!.t.includes("000 011"), "sổ chứa chuỗi đã trúng");
  const nguon: GoiDeXuat = structuredClone(GOI);
  nguon.cot[8] = { ...nguon.cot[8]!, lop: "source", giaTri: ["x"] };
  assert.equal((await deXuat(app, nguon, s.dauChu.cookie)).status, 400, "giá trị ở cột lớp nguồn");
  assert.equal((await deXuat(app, { ...GOI, them: 1 }, s.dauChu.cookie)).status, 400, "khoá lạ ở gốc");
  assert.equal(dem.n, 0);
  const sach = await deXuat(app, GOI, s.dauChu.cookie);
  assert.equal(sach.body?.cheDo, "ai");
  assert.equal(dem.n, 1, "gói sạch gọi đúng một lần");
  assert.deepEqual((await dongAi(s.companyId)).map((x) => x.result), ["blocked_pii", "ok"]);
});

test("thoả thuận ai_processing ở cơ sở dữ liệu", async () => {
  const s = await sanMoi("E4");
  const them = (kind: string, lop: string) =>
    appPool.query(
      `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by)
       values ($1, $2, 'outbound', 'anthropic', $3, now(), '[Tên]')`,
      [s.companyId, kind, lop],
    );
  await assert.rejects(them("ai_processing", "{catalog,shareable_listing,source}"), /agreements_never_source/);
  await assert.rejects(them("ai_magic", "{catalog}"), /agreements_kind_check/);
  const { khach, dem } = khachGia();
  const truoc = await deXuat(appVoi(khach), GOI, s.dauChu.cookie);
  assert.deepEqual(truoc.body, { cheDo: "tat-dinh", lyDo: LY_DO.chuaBat }, "chưa có thoả thuận");
  assert.equal(dem.n, 0);
  await them("ai_processing", "{catalog,shareable_listing}");
  assert.equal((await deXuat(appVoi(khach), GOI, s.dauChu.cookie)).body?.cheDo, "ai");
});

test("bật tắt Xử lý bằng AI", async () => {
  const s = await sanMoi("E5");
  const B = await sanMoi("E5b");
  const hang = async () =>
    (await appPool.query<{ id: string; status: string; approved_by: string; data_classes: string[]; counterparty: string }>(
      "select id, status, approved_by, data_classes, counterparty from agreements where company_id = $1 and kind = 'ai_processing'", [s.companyId],
    )).rows;
  assert.equal((await bat(s)).status, 204);
  let h = await hang();
  assert.equal(h.length, 1);
  assert.equal(h[0]!.status, "active");
  assert.equal(h[0]!.approved_by, s.quanTri.userId);
  assert.deepEqual(h[0]!.data_classes, ["catalog", "shareable_listing"]);
  assert.equal(h[0]!.counterparty, "anthropic");
  const id = h[0]!.id;
  assert.equal((await bat(s, false)).status, 204);
  h = await hang();
  assert.deepEqual([h.length, h[0]!.status], [1, "paused"]);
  assert.equal((await bat(s)).status, 204);
  h = await hang();
  assert.deepEqual([h.length, h[0]!.id, h[0]!.status], [1, id, "active"]);
  const tt = (await (await send(APP, "GET", "/api/v1/imports/ai", undefined, s.quanTri.cookie)).json()) as Record<string, unknown>;
  assert.deepEqual([tt.bat, tt.tranThangUsd, tt.daDungUsd, tt.laQuanTri], [true, 10, 0, true]);
  for (const [ten, n] of [["Đầu chủ", s.dauChu], ["Trưởng nhóm", s.truongNhom]] as const) {
    const r = await send(APP, "PUT", "/api/v1/imports/ai/agreement", { bat: false }, n.cookie);
    assert.equal(r.status, 403, ten);
    assert.equal(((await r.json()) as { error: string }).error, API_ERRORS.adminRequired.code);
  }
  await send(APP, "PUT", "/api/v1/imports/ai/agreement", { bat: false }, B.quanTri.cookie);
  assert.equal((await hang())[0]!.status, "active", "quản trị sàn B đổi được thoả thuận của sàn A");
});

/** Lần nhập vẫn mở và ghi được sau mỗi ca không AI. */
async function nhapDuoc(cookie: string, so: number) {
  const tieuDe = ["Toà", "Mã căn", "Giá"];
  const dong: Cell[][] = [["Toà A", `A-0${so}.01`, "3,5 tỷ"], ["Toà A", `A-0${so}.02`, "3,6 tỷ"]];
  const bang = readTable([tieuDe, ...dong]);
  const mo = await send(APP, "POST", "/api/v1/imports", {
    fileName: `[Tệp ai ${so}].xlsx`,
    fileHash: createHash("sha256").update(`${RUN}-ai-${so}`).digest("hex"),
    fileKind: "xlsx",
    headers: bang.headers,
    headerRow: 0,
    plan: planFromDictionary(bang),
    units: dong.map((d, i) => ({ row: i + 2, buildingName: d[0] as string, unitNumber: d[1] as string })),
  }, cookie);
  if (mo.status !== 201) return false;
  const id = ((await mo.json()) as { id: string }).id;
  const g = await send(APP, "POST", `/api/v1/imports/${id}/rows`, { dryRun: false, rows: dong.map((cells, i) => ({ row: i + 2, cells })) }, cookie);
  return g.status === 200;
}

test("không AI vẫn nhập", async () => {
  const quaGio = () => {
    const e = new Error("quá giờ");
    e.name = "TimeoutError";
    throw e;
  };
  // Ma trận viết tay sáu ca: [tên, chuẩn bị sàn, khách, lý do, kết quả sổ mong đợi (null = không dòng)].
  const CA: [string, (s: San) => Promise<unknown>, KhachAi | null, string, string | null][] = [
    ["chưa có thoả thuận", async () => {}, khachGia().khach, LY_DO.chuaBat, null],
    ["thoả thuận tạm ngừng", async (s) => { await bat(s); await bat(s, false); }, khachGia().khach, LY_DO.tamNgung, null],
    ["thiếu khoá", (s) => bat(s), null, LY_DO.thieuKhoa, null],
    ["nhà cung cấp lỗi", (s) => bat(s), khachGia(() => { throw new Error("mạng hỏng"); }).khach, LY_DO.loi, "provider_error"],
    ["quá 240 giây", (s) => bat(s), khachGia(quaGio).khach, LY_DO.quaGio, "timeout"],
    ["đầu ra sai khuôn", (s) => bat(s), khachGia(() => ({ ke_hoach: [] })).khach, LY_DO.saiKhuon, "invalid_output"],
  ];
  let so = 1;
  for (const [ten, chuan, khach, lyDo, ketQua] of CA) {
    const s = await sanMoi(`E8-${so}`);
    await chuan(s);
    const r = await deXuat(appVoi(khach), GOI, s.dauChu.cookie);
    assert.deepEqual([r.status, r.body], [200, { cheDo: "tat-dinh", lyDo }], ten);
    assert.deepEqual((await dongAi(s.companyId)).map((x) => x.result), ketQua ? [ketQua] : [], `${ten}: sổ ai_usage`);
    assert.ok(await nhapDuoc(s.dauChu.cookie, so), `${ten}: lần nhập không mở hay không ghi được`);
    so++;
  }
});

test("trần chi phí theo sàn", async () => {
  const s = await sanMoi("E9");
  await bat(s);
  const { khach, dem } = khachGia();
  const app = appVoi(khach);
  assert.equal((await deXuat(app, GOI, s.dauChu.cookie)).body?.cheDo, "ai");
  const d = (await dongAi(s.companyId))[0]!;
  assert.deepEqual([d.model, d.input_tokens, d.output_tokens, Number(d.cost_usd), d.result], ["claude-opus-5-5", 2000, 1500, 0.038, "ok"]);
  assert.ok(d.duration_ms >= 0);
  const chen = (usd: number, luc = "now()") =>
    appPool.query(`insert into ai_usage (company_id, user_id, model, cost_usd, result, created_at) values ($1, 'u-mau', 'claude-opus-5-5', $2, 'ok', ${luc})`, [s.companyId, usd]);
  await chen(9.952); // cộng 0,038 = 9,99
  assert.equal((await deXuat(app, GOI, s.dauChu.cookie)).body?.cheDo, "ai", "9,99 USD còn gọi được");
  assert.equal(dem.n, 2);
  await chen(0.5);
  assert.deepEqual((await deXuat(app, GOI, s.dauChu.cookie)).body, { cheDo: "tat-dinh", lyDo: LY_DO.hetTran });
  assert.equal(dem.n, 2, "hết trần mà vẫn gọi");
  // Ranh tháng theo giờ Việt Nam: một sàn khác, dòng 15 USD lúc 23:30 giờ VN ngày cuối tháng trước không tính.
  const T = await sanMoi("E9b");
  await bat(T);
  await appPool.query(
    `insert into ai_usage (company_id, user_id, model, cost_usd, result, created_at)
     values ($1, 'u-mau', 'claude-opus-5-5', 15, 'ok',
             (date_trunc('month', now() at time zone 'Asia/Ho_Chi_Minh') - interval '30 minutes') at time zone 'Asia/Ho_Chi_Minh')`,
    [T.companyId],
  );
  assert.equal((await deXuat(app, GOI, T.dauChu.cookie)).body?.cheDo, "ai", "dòng tháng trước (giờ VN) bị tính");
  await appPool.query("insert into company_settings (company_id, key, value, updated_by) values ($1, 'ai.monthly_budget_usd', '0', 'u-mau')", [T.companyId]);
  assert.deepEqual((await deXuat(app, GOI, T.dauChu.cookie)).body, { cheDo: "tat-dinh", lyDo: LY_DO.hetTran }, "trần 0");
  // Chỉ thêm: vai API không sửa, không xoá.
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.company_id', $1, true)", [s.companyId]);
    await c.query("savepoint a");
    await assert.rejects(c.query("update ai_usage set cost_usd = 0"), /permission denied/);
    await c.query("rollback to savepoint a");
    await assert.rejects(c.query("delete from ai_usage"), /permission denied/);
  } finally {
    await c.query("rollback").catch(() => {});
    c.release();
  }
});

test("vai gọi đường đề xuất", async () => {
  const A = await sanMoi("E11");
  const B = await sanMoi("E11b");
  await bat(A);
  const { khach } = khachGia();
  const app = appVoi(khach);
  const BANG: [string, string, number, string | null][] = [
    ["Đầu chủ", A.dauChu.cookie, 200, "ai"],
    ["Trưởng nhóm", A.truongNhom.cookie, 200, "ai"],
    ["Quản trị sàn", A.quanTri.cookie, 403, null],
    ["Đầu khách", A.dauKhach.cookie, 403, null],
    ["chưa đăng nhập", "", 401, null],
  ];
  for (const [ten, cookie, status, cheDo] of BANG) {
    const r = await deXuat(app, GOI, cookie);
    assert.equal(r.status, status, ten);
    if (cheDo) assert.equal(r.body?.cheDo, cheDo, ten);
  }
  const truocA = (await dongAi(A.companyId)).length;
  const rB = await deXuat(app, GOI, B.dauChu.cookie);
  assert.deepEqual(rB.body, { cheDo: "tat-dinh", lyDo: LY_DO.chuaBat }, "sàn B dùng được thoả thuận của sàn A");
  assert.equal((await dongAi(A.companyId)).length, truocA, "lời gọi của sàn B ghi vào sổ sàn A");
  const dc = (await dongAi(A.companyId)).find((x) => x.user_id === A.dauChu.userId);
  assert.ok(dc && dc.company_id === A.companyId, "dòng của Đầu chủ mang sàn A và người gọi");
});
