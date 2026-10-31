// Đường tra danh mục qua app Hono trên Postgres thật (hàng 9, hồ sơ danh-muc-go-ma-can) — E7b, E8, E9.
import { OpenAPIHono } from "@hono/zod-openapi";
import { CEILING, UNIT_ATTRIBUTE_CLASS, UNIT_ATTRIBUTE_FIELDS, type CatalogData } from "@quy-hang/core";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { registerCatalogRoutes } from "../../src/catalog/routes";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const deps = { appPool, identityPool, auth };
const app = createApi(deps);

/** Danh mục fixture hai dự án cùng có căn A-01.01; mỗi căn mang thêm khoá lạ để thử rò ra thân trả về. */
const can = (unitNumber: string, upi: string) => ({
  upi,
  unitNumber,
  stack: unitNumber.slice(-2),
  floor: Number(unitNumber.slice(2, 4)),
  livingArea: 60,
  bedroomsTotal: 2,
  directionFaces: "Đông",
  propertyType: "Residential",
  propertySubType: "Condominium",
  ghiChuNoiBo: "[Mẫu] không được ra ngoài",
});
const HAI_DU_AN = {
  subdivisions: [
    { subdivisionKey: "mau-du-an-thu", subdivisionName: "[Mẫu] Dự án căn hộ thử", complexName: null, buildings: [{ buildingKey: "A", buildingName: "Toà A", units: [can("A-01.01", "urn:onehub:upi:thu:1:A-01.01"), can("A-01.02", "urn:onehub:upi:thu:1:A-01.02")] }] },
    { subdivisionKey: "du-an-hai", subdivisionName: "[Mẫu] Dự án thứ hai", complexName: null, buildings: [{ buildingKey: "A", buildingName: "Toà A", units: [can("A-01.01", "urn:onehub:upi:thu:2:A-01.01")] }] },
  ],
} as unknown as CatalogData;
const appHai = new OpenAPIHono();
registerCatalogRoutes(appHai, deps, HAI_DU_AN);

const goi = (a: { request: (u: string, i?: RequestInit) => Response | Promise<Response> }, path: string, cookie = "") =>
  a.request(`${BASE_URL}${path}`, { headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) } });
const post = (path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) } });

async function login(email: string): Promise<string> {
  const before = sent.length;
  assert.equal((await post("/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200);
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await post("/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}
const voiSan = (cookie: string, companyId: string) => `${cookie}; qh_san=${companyId}`;

/** Một quản trị đã đăng nhập và chọn sàn. */
async function sanMoi(ten: string) {
  const email = mail(`qt-dm-${ten}`);
  const s = await openCompany(`[Sàn ${RUN} DM ${ten}]`, email);
  return { ...s, cookie: voiSan(await login(email), s.companyId) };
}

test("danh mục: cổng vào 401/403/409", async () => {
  const khong = await goi(app, "/api/v1/catalog/units/A-12.06");
  assert.equal(khong.status, 401);
  assert.deepEqual(await khong.json(), { error: "unauthenticated" });

  const le = mail("dm-le");
  await createLoneUser(le);
  const r403 = await goi(app, "/api/v1/catalog/units/A-12.06", await login(le));
  assert.equal(r403.status, 403);
  assert.deepEqual(await r403.json(), { error: "no-company" });

  const hai = mail("dm-hai-san");
  const s1 = await openCompany(`[Sàn ${RUN} DM X1]`, hai);
  await openCompany(`[Sàn ${RUN} DM X2]`, hai);
  const cookie = await login(hai);
  const r409 = await goi(app, "/api/v1/catalog/units/A-12.06", cookie);
  assert.equal(r409.status, 409);
  assert.deepEqual(await r409.json(), { error: "select-company" });
  const chon = await goi(app, "/api/v1/catalog/units/A-12.06", voiSan(cookie, s1.companyId));
  assert.equal(chon.status, 200, "đối chứng: cùng người chọn sàn thì đọc được");
});

test("danh mục: mọi vai đọc được", async () => {
  const qt = await sanMoi("vai");
  const VAI = ["telesales", "listing_agent", "buyer_agent", "team_lead", "company_admin"] as const;
  let so = 0;
  for (const vai of VAI) {
    let cookie = qt.cookie;
    if (vai !== "company_admin") {
      const email = mail(`dm-${vai}`);
      const moi = await post("/api/v1/company/members", { email, roles: [vai] }, qt.cookie);
      assert.equal(moi.status, 201, `mời ${vai}`);
      cookie = voiSan(await login(email), qt.companyId);
    }
    const res = await goi(app, "/api/v1/catalog/units/a1206", cookie);
    assert.equal(res.status, 200, `vai ${vai}`);
    const body = (await res.json()) as { status: string; unit?: { unitNumber: string } };
    assert.equal(body.status, "found", `vai ${vai}`);
    assert.equal(body.unit?.unitNumber, "A-12.06", `vai ${vai}`);
    so++;
  }
  assert.equal(so, 5);
});

test("danh mục: dự án lạ trả 404 not-found", async () => {
  const qt = await sanMoi("404");
  const la = await goi(app, "/api/v1/catalog/units/A-12.06?subdivision=khong-co", qt.cookie);
  assert.equal(la.status, 404);
  assert.deepEqual(await la.json(), { error: "not-found" });
  const dung = await goi(app, "/api/v1/catalog/units/A-12.06?subdivision=mau-du-an-thu", qt.cookie);
  assert.equal(dung.status, 200);
  assert.equal(((await dung.json()) as { status: string }).status, "found");
});

/** Mọi khoá ở mọi cấp của thân trả về. */
function moiKhoa(v: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(v)) v.forEach((x) => moiKhoa(x, out));
  else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) {
      out.add(k);
      moiKhoa(x, out);
    }
  }
  return out;
}
/** Tập khoá cho phép của từng kết cục, viết trước: khoá bao cộng mười trường thuộc tính khi kết cục mang căn. */
const BAO: Record<string, string[]> = {
  found: ["status", "unit"],
  not_in_catalog: ["status", "read", "subdivisionKey", "unitNumber"],
  unreadable: ["status", "input", "examples", "subdivisionKey", "subdivisionName", "example"],
  ambiguous: ["status", "candidates"],
};
function soKhoa(body: { status: string }): void {
  const cho = new Set([...BAO[body.status]!, ...(body.status === "found" || body.status === "ambiguous" ? UNIT_ATTRIBUTE_FIELDS : [])]);
  const thay = moiKhoa(body);
  const la = [...thay].filter((k) => !cho.has(k));
  assert.deepEqual(la, [], `kết cục ${body.status} có khoá ngoài danh sách cho phép: ${la.join(", ")}`);
  assert.deepEqual([...thay].sort(), [...cho].sort(), `kết cục ${body.status} thiếu khoá`);
}

test("danh mục: thân trả về chỉ mang khoá cho phép", async () => {
  for (const f of UNIT_ATTRIBUTE_FIELDS) {
    assert.equal(UNIT_ATTRIBUTE_CLASS[f], "catalog", f);
    assert.equal(CEILING[UNIT_ATTRIBUTE_CLASS[f]], "external", f);
  }
  const qt = await sanMoi("khoa");
  const CA: [string, string][] = [
    ["/api/v1/catalog/units/A-01.02?subdivision=mau-du-an-thu", "found"],
    ["/api/v1/catalog/units/A-16.01", "not_in_catalog"],
    ["/api/v1/catalog/units/XYZ", "unreadable"],
    ["/api/v1/catalog/units/A-01.01", "ambiguous"],
  ];
  for (const [duong, mong] of CA) {
    const res = await goi(appHai, duong, qt.cookie);
    assert.equal(res.status, 200, duong);
    const body = (await res.json()) as { status: string };
    assert.equal(body.status, mong, duong);
    soKhoa(body);
  }
  // Đối chứng âm trên cùng hàm so: một khoá lạ bất kỳ trong ứng viên bị bắt và gọi tên.
  const cay = { status: "ambiguous", candidates: [{ subdivisionKey: "x", subdivisionName: "x", buildingName: "x", unitNumber: "x", upi: "x", floor: 1, stack: "01", livingArea: 1, bedroomsTotal: 1, directionFaces: "x", ownerName: "[Tên]" }] };
  assert.throws(() => soKhoa(cay), /ownerName/);
});

test("danh mục mẫu: thân không mang khoá nào của chủ nhà mẫu", async () => {
  const qt = await sanMoi("mau");
  const res = await goi(app, "/api/v1/catalog/units/A-12.06", qt.cookie);
  assert.equal(res.status, 200);
  soKhoa((await res.json()) as { status: string });
});

test("danh mục: tham số project cũ bị từ chối 400", async () => {
  const qt = await sanMoi("ten-cu");
  const cu = await goi(app, "/api/v1/catalog/units/A-12.06?project=mau-du-an-thu", qt.cookie);
  assert.equal(cu.status, 400, `tham số tên cũ: nhận ${cu.status}`);
  assert.notEqual(((await cu.json()) as { status?: string }).status, "found");
  const khong = await goi(app, "/api/v1/catalog/units/A-12.06", qt.cookie);
  assert.equal(khong.status, 200, "đối chứng: không tham số");
  assert.equal(((await khong.json()) as { status: string }).status, "found");
});

/** Mười hai khoá của một căn tra ra — viết tay ở đây, không lấy từ hằng của lõi (hàng 72). */
const MUOI_HAI = [
  "subdivisionKey", "subdivisionName", "buildingName", "unitNumber", "upi", "floor", "stack", "livingArea",
  "bedroomsTotal", "directionFaces", "propertyType", "propertySubType",
];
test("loại hình: thân found qua API mang đúng mười hai khoá viết trước", async () => {
  const qt = await sanMoi("loai-hinh");
  const res = await goi(app, "/api/v1/catalog/units/A-12.06", qt.cookie);
  assert.equal(res.status, 200);
  const body = (await res.json()) as { status: string; unit: Record<string, unknown> };
  assert.equal(body.status, "found");
  const thua = Object.keys(body.unit).filter((k) => !MUOI_HAI.includes(k));
  assert.deepEqual(thua, [], `khoá thừa: ${thua.join(", ")}`);
  assert.deepEqual(Object.keys(body.unit).sort(), [...MUOI_HAI].sort());
  assert.equal(body.unit.propertyType, "Residential");
  assert.equal(body.unit.propertySubType, "Condominium");
});
