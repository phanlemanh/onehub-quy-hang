// Căn trùng mã ở hai toà qua đường tra trên Postgres thật (hàng 63, hồ sơ can-trung-ma-hai-toa) — E5, E9.
import { OpenAPIHono } from "@hono/zod-openapi";
import { UNIT_ATTRIBUTE_FIELDS, type CatalogData } from "@quy-hang/core";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { registerCatalogRoutes } from "../../src/catalog/routes";
import { appPool, BASE_URL, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const deps = { appPool, identityPool, auth };
const app = createApi(deps);

/** Căn danh mục thử; mỗi căn mang thêm khoá lạ để thử rò ra thân trả về. */
const can = (unitNumber: string, upi: string) => ({
  upi,
  unitNumber,
  stack: null,
  floor: null,
  livingArea: 60,
  bedroomsTotal: 2,
  directionFaces: "Đông",
  propertyType: "Residential",
  propertySubType: "Condominium",
  ghiChuNoiBo: "[Mẫu] không được ra ngoài",
});
const TRUNG = {
  subdivisionKey: "mau-trung-ma",
  subdivisionName: "[Mẫu] Dự án trùng mã",
  complexName: null,
  buildings: [
    { buildingKey: "A1", buildingName: "[Mẫu] Toà A1", units: [can("1206", "urn:onehub:upi:thu:trung:A1-1206")] },
    { buildingKey: "A2", buildingName: "[Mẫu] Toà A2", units: [can("1206", "urn:onehub:upi:thu:trung:A2-1206")] },
  ],
};
const MAU = {
  subdivisionKey: "mau-du-an-thu",
  subdivisionName: "[Mẫu] Dự án căn hộ thử",
  complexName: null,
  buildings: [{ buildingKey: "A", buildingName: "Toà A", units: [can("A-12.06", "urn:onehub:upi:thu:A-12.06")] }],
};
const appTrung = new OpenAPIHono();
registerCatalogRoutes(appTrung, deps, { subdivisions: [TRUNG] } as unknown as CatalogData);
const appHai = new OpenAPIHono();
registerCatalogRoutes(appHai, deps, { subdivisions: [TRUNG, MAU] } as unknown as CatalogData);

type Goi = { request: (u: string, i?: RequestInit) => Response | Promise<Response> };
const goi = (a: Goi, path: string, cookie: string) =>
  a.request(`${BASE_URL}${path}`, { headers: { "content-type": "application/json", origin: BASE_URL, cookie } });
const post = (path: string, body: unknown) =>
  app.request(`${BASE_URL}${path}`, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json", origin: BASE_URL } });

async function login(email: string): Promise<string> {
  const before = sent.length;
  assert.equal((await post("/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200);
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await post("/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}
/** Một quản trị đã đăng nhập và chọn sàn. */
async function sanMoi(ten: string): Promise<string> {
  const email = mail(`qt-tm-${ten}`);
  const s = await openCompany(`[Sàn ${RUN} TM ${ten}]`, email);
  return `${await login(email)}; qh_san=${s.companyId}`;
}

type Than = { status: string; unit?: { upi: string; buildingName: string }; candidates?: { upi: string; buildingName: string }[] };

test("trùng mã hai toà qua API: ambiguous, chọn toà ra found", async () => {
  const cookie = await sanMoi("chon");
  const nhieu = await goi(appTrung, "/api/v1/catalog/units/1206", cookie);
  assert.equal(nhieu.status, 200);
  const b = (await nhieu.json()) as Than;
  assert.equal(b.status, "ambiguous", `không chọn toà: nhận ${b.status}`);
  assert.equal(b.candidates?.length, 2);
  assert.deepEqual(new Set(b.candidates?.map((c) => c.buildingName)), new Set(["[Mẫu] Toà A1", "[Mẫu] Toà A2"]));

  for (const [toa, upi] of [
    ["[Mẫu] Toà A1", "urn:onehub:upi:thu:trung:A1-1206"],
    ["A2", "urn:onehub:upi:thu:trung:A2-1206"],
  ] as const) {
    const res = await goi(appTrung, `/api/v1/catalog/units/1206?building=${encodeURIComponent(toa)}`, cookie);
    assert.equal(res.status, 200, `toà ${toa}`);
    const t = (await res.json()) as Than;
    assert.equal(t.status, "found", `toà ${toa}: nhận ${t.status}`);
    assert.equal(t.unit?.upi, upi, `toà ${toa} ra căn khác`);
  }
});

test("toà lạ qua API: 404 not-found", async () => {
  const cookie = await sanMoi("la");
  const la = await goi(appTrung, `/api/v1/catalog/units/1206?building=${encodeURIComponent("Toà Z")}`, cookie);
  assert.equal(la.status, 404, `toà lạ: nhận ${la.status}`);
  assert.deepEqual(await la.json(), { error: "not-found" });

  const duAnKhac = await goi(appHai, "/api/v1/catalog/units/A-12.06?subdivision=mau-trung-ma&building=A", cookie);
  assert.equal(duAnKhac.status, 404, `toà của dự án khác: nhận ${duAnKhac.status}`);
  assert.deepEqual(await duAnKhac.json(), { error: "not-found" });

  const dung = await goi(appHai, "/api/v1/catalog/units/A-12.06?building=A", cookie);
  assert.equal(dung.status, 200, "đối chứng: toà A không chọn dự án");
  assert.equal(((await dung.json()) as Than).status, "found");
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

test("thân trả về khi trùng mã chỉ mang khoá cho phép", async () => {
  const cookie = await sanMoi("khoa");
  const BAO: Record<string, string[]> = { found: ["status", "unit"], ambiguous: ["status", "candidates"] };
  for (const path of ["/api/v1/catalog/units/1206", "/api/v1/catalog/units/1206?building=A1"]) {
    const body = (await (await goi(appTrung, path, cookie)).json()) as Than;
    const cho = new Set([...(BAO[body.status] ?? []), ...UNIT_ATTRIBUTE_FIELDS]);
    const thay = moiKhoa(body);
    assert.deepEqual([...thay].filter((k) => !cho.has(k)), [], `${path}: khoá ngoài danh sách cho phép`);
    assert.deepEqual([...thay].sort(), [...cho].sort(), `${path}: thiếu khoá`);
  }

  const doc = (await (await app.request(`${BASE_URL}/api/v1/openapi.json`)).json()) as {
    paths: Record<string, { get?: { parameters?: { name: string; in: string }[] } }>;
  };
  const thamSo = doc.paths["/api/v1/catalog/units/{code}"]?.get?.parameters ?? [];
  assert.ok(thamSo.some((p) => p.name === "building" && p.in === "query"), "OpenAPI thiếu tham số query building");
});
