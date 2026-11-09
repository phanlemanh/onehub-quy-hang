// Bốn nơi đọc danh mục đọc vùng dùng chung trên Postgres thật (hàng 99, hồ sơ doc-vung-danh-muc) — E1–E6, E8. Gói nạp qua
// cửa nhận thật. Các ca chạy nối tiếp trong một tệp và phụ thuộc thứ tự: vùng rỗng trước, rồi nạp.
// Mã thử thuộc khu `mau-du-an-thu` vì khu này có cách đọc mã trong lõi; Toà P tầng 20 không có trong gói mẫu.
import { parseCatalogFeed } from "@quy-hang/connect";
import { planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createApi } from "../../src/app";
import { taoNguonDanhMuc } from "../../src/catalog/nguon";
import { SAMPLE_CATALOG } from "../../src/catalog/sample";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

const { auth, sent } = makeAuth();
const deps = { appPool, identityPool, auth };
/** Hai bản API dựng riêng: nạp ở A, đọc ở B — như hai máy chủ, không báo nhau. */
const appA = createApi(deps);
const appB = createApi(deps);

const NGUON = `[Mẫu] Nguồn thử ${RUN} doc-vung`;
const KHU = "mau-du-an-thu";
const KHU_KHONG_CACH_DOC = `thu-${RUN}-khong-cach-doc`;
const sanDaMo: string[] = [];
after(async () => {
  await appPool.query("delete from catalog_units where provider = $1", [NGUON]);
  await appPool.query("delete from catalog_subdivisions where provider = $1", [NGUON]);
  await appPool.query("delete from catalog_trusted_companies where company_id = any ($1::uuid[])", [sanDaMo]);
  await appPool.query("delete from agreements where company_id = any ($1::uuid[])", [sanDaMo]);
  await cleanup();
});

type App = typeof appA;
const send = (a: App, method: string, p: string, body?: unknown, cookie = "") =>
  a.request(`${BASE_URL}${p}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
async function login(email: string): Promise<string> {
  const truoc = sent.length;
  await send(appA, "POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const ma = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(ma, `không có mã cho ${email}`);
  const res = await send(appA, "POST", "/api/v1/auth/sign-in/email-otp", { email, otp: ma.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}
async function sanMoi(ten: string) {
  const email = mail(`dv-${ten}-qt`);
  const s = await openCompany(`[Sàn ${RUN} DV ${ten}]`, email);
  sanDaMo.push(s.companyId);
  const emailDc = mail(`dv-${ten}-dc`);
  const dc = await createLoneUser(emailDc);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, dc, ["listing_agent"]]);
  return {
    companyId: s.companyId,
    quanTri: `${await login(email)}; qh_san=${s.companyId}`,
    dauChu: `${await login(emailDc)}; qh_san=${s.companyId}`,
  };
}
const SAN_NAP = await sanMoi("nap");
const SAN_KHAC = await sanMoi("khac");
await appPool.query("insert into catalog_trusted_companies (company_id) values ($1)", [SAN_NAP.companyId]);
await appPool.query(
  `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, status, approved_by)
   values ($1, 'catalog_source', 'inbound', 'onehub-invest', '{catalog}', now() - interval '1 day', 'active', '[Tên]')`,
  [SAN_NAP.companyId],
);

const can = (ma: string, livingArea: number, floor = 20) => ({
  upi: `urn:onehub:upi:thu:${RUN}:${ma}`,
  unitNumber: ma,
  stack: ma.slice(-2),
  floor,
  livingArea,
  bedroomsTotal: 2,
  directionFaces: "Tây Bắc",
  propertyType: "Residential",
  propertySubType: "Condominium",
});
const TEN_KHU = "[Mẫu] Khu của gói";
const CAN_GOC = [can("P-20.01", 71.5), can("P-20.02", 66)];
const goi = (units: ReturnType<typeof can>[], tenKhu = TEN_KHU) => ({
  schemaVersion: 1,
  provider: NGUON,
  measuredAt: new Date().toISOString(),
  subdivisions: [
    { subdivisionKey: KHU, subdivisionName: tenKhu, complexName: null, buildings: [{ buildingKey: "P", buildingName: "[Mẫu] Toà P", units }] },
  ],
});
async function nap(body: unknown) {
  assert.ok(parseCatalogFeed(body).ok, "gói thử sai khuôn");
  const res = await send(appA, "POST", "/api/v1/catalog/feeds", body, SAN_NAP.quanTri);
  assert.equal(res.status, 200, await res.clone().text());
}
type Tra = { status: string; unit?: Record<string, unknown>; read?: { subdivisionKey: string; unitNumber: string }[] };
const tra = async (a: App, ma: string, cookie = SAN_NAP.quanTri): Promise<Tra> => {
  const res = await send(a, "GET", `/api/v1/catalog/units/${encodeURIComponent(ma)}`, undefined, cookie);
  assert.equal(res.status, 200, await res.clone().text());
  return (await res.json()) as Tra;
};
const danhSachToa = async (a: App) => (await (await send(a, "GET", "/api/v1/leads/buildings", undefined, SAN_NAP.dauChu)).json()) as string[];

const MA_MAU = SAMPLE_CATALOG.subdivisions[0]!.buildings[0]!.units[0]!.unitNumber;
const TOA_MAU = SAMPLE_CATALOG.subdivisions[0]!.buildings[0]!.buildingName;

let soTep = 0;
/** Ghi một lần nhập một căn; trả hành động của dòng và số hàng mang mã ấy sau khi ghi. */
async function nhap(toa: string, ma: string) {
  const dong: Cell[] = [toa, ma, "3 tỷ", "bao phí"];
  const bang = readTable([["Toà", "Mã căn", "Giá", "Phí"], dong]);
  const mo = await send(
    appB,
    "POST",
    "/api/v1/imports",
    {
      fileName: `[Tệp ${++soTep}].xlsx`,
      fileHash: createHash("sha256").update(`${RUN}-doc-vung-${soTep}`).digest("hex"),
      fileKind: "xlsx",
      headers: bang.headers,
      headerRow: 0,
      plan: planFromDictionary(bang),
      units: [{ row: 2, buildingName: toa, unitNumber: ma }],
    },
    SAN_NAP.dauChu,
  );
  assert.equal(mo.status, 201, await mo.clone().text());
  const { id } = (await mo.json()) as { id: string };
  const r = await send(appB, "POST", `/api/v1/imports/${id}/rows`, { dryRun: false, rows: [{ row: 2, cells: dong }] }, SAN_NAP.dauChu);
  assert.equal(r.status, 200, await r.clone().text());
  const kq = (await r.json()) as { rows: { action: string; reason: string }[] };
  const { rows } = await appPool.query<{ n: number }>("select count(*)::int n from listings where company_id = $1 and unit_number = $2", [SAN_NAP.companyId, ma]);
  return { action: kq.rows[0]!.action, reason: kq.rows[0]!.reason, soHang: rows[0]!.n };
}

/** Hàm ghép thật của Bảng hàng (`apps/web`): chạy trong gói web vì nó dùng đường tắt `@/` của gói đó. */
function ghepTheoWeb(danhMuc: unknown, toa: string, ma: string): { unitType: string; livingArea: number | null } {
  const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../apps/web");
  const lenh = `
    import { chiMuc, thuocTinhCan } from "./src/app/(app)/inventory/ghep-danh-muc.ts";
    let vao = ""; for await (const m of process.stdin) vao += m;
    const { danhMuc, toa, ma } = JSON.parse(vao);
    process.stdout.write(JSON.stringify(thuocTinhCan(chiMuc(danhMuc), toa, ma)));`;
  const r = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", lenh], {
    cwd: web,
    input: JSON.stringify({ danhMuc, toa, ma }),
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout) as { unitType: string; livingArea: number | null };
}
const caDanhMuc = async (a: App, cookie: string) => {
  const res = await send(a, "GET", "/api/v1/catalog", undefined, cookie);
  assert.equal(res.status, 200, await res.clone().text());
  return res.json() as Promise<unknown>;
};
function khoaCua(v: unknown, ra = new Set<string>()): Set<string> {
  if (Array.isArray(v)) v.forEach((x) => khoaCua(x, ra));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      ra.add(k);
      khoaCua(x, ra);
    }
  return ra;
}

test("E5b: vùng rỗng — gói mẫu phục vụ cả gõ mã, danh sách toà, Nhập Excel", async () => {
  const { rows } = await appPool.query<{ n: number }>("select count(*)::int n from catalog_subdivisions");
  assert.equal(rows[0]!.n, 0, "vùng không rỗng lúc bắt đầu");
  assert.equal((await tra(appA, MA_MAU)).status, "found");
  assert.ok((await danhSachToa(appA)).includes(TOA_MAU));
  const n = await nhap(TOA_MAU, MA_MAU);
  assert.equal(n.action, "create", n.reason);
  assert.equal(n.soHang, 1);
});

test("E1 chiều đỏ: trước khi nạp, mã của gói chưa found", async () => {
  assert.equal((await tra(appA, "P-20.01")).status, "not_in_catalog");
});

test("E1: nạp qua cửa nhận rồi tra mã — found, đủ thuộc tính của gói", async () => {
  await nap(goi(CAN_GOC));
  const kq = await tra(appA, "P-20.01");
  assert.equal(kq.status, "found");
  const u = kq.unit!;
  assert.deepEqual(
    [u.subdivisionName, u.buildingName, u.floor, u.livingArea, u.bedroomsTotal, u.directionFaces],
    [TEN_KHU, "[Mẫu] Toà P", 20, 71.5, 2, "Tây Bắc"],
  );
  assert.equal(typeof u.livingArea, "number");
});

test("E5b: có một khu thì gói mẫu tắt — cùng mã mẫu thành not_in_catalog", async () => {
  assert.equal((await tra(appA, MA_MAU)).status, "not_in_catalog");
  assert.equal((await tra(appB, MA_MAU)).status, "not_in_catalog");
});

test("E4: mã đọc được, không có trong vùng — not_in_catalog đúng khuôn", async () => {
  const kq = await tra(appA, "P-20.99");
  assert.equal(kq.status, "not_in_catalog");
  assert.deepEqual(kq.read, [{ subdivisionKey: KHU, unitNumber: "P-20.99" }]);
});

test("E2: cả danh mục có căn của gói; hàm ghép ra đúng loại căn và diện tích; gói khác thì giá trị khác", async () => {
  const dm = await caDanhMuc(appA, SAN_NAP.dauChu);
  assert.deepEqual(ghepTheoWeb(dm, "[Mẫu] Toà P", "P-20.01").unitType, "2PN");
  assert.equal(ghepTheoWeb(dm, "[Mẫu] Toà P", "P-20.01").livingArea, 71.5);
  const khac = { subdivisions: [{ subdivisionKey: KHU, subdivisionName: TEN_KHU, complexName: null, buildings: [{ buildingKey: "P", buildingName: "[Mẫu] Toà P", units: [can("P-20.01", 80)] }] }] };
  assert.equal(ghepTheoWeb(khac, "[Mẫu] Toà P", "P-20.01").livingArea, 80);
});

test("E3: chỉ đổi diện tích một căn — nạp ở A, đọc ở B thấy ngay", async () => {
  assert.equal((await tra(appB, "P-20.02")).unit!.livingArea, 66);
  await nap(goi([CAN_GOC[0]!, can("P-20.02", 67.25)]));
  assert.equal((await tra(appB, "P-20.02")).unit!.livingArea, 67.25);
});

test("E3: chỉ đổi tên khu — đọc ở B thấy ngay", async () => {
  assert.equal((await tra(appB, "P-20.01")).unit!.subdivisionName, TEN_KHU);
  await nap(goi([CAN_GOC[0]!, can("P-20.02", 67.25)], "[Mẫu] Khu đổi tên"));
  assert.equal((await tra(appB, "P-20.01")).unit!.subdivisionName, "[Mẫu] Khu đổi tên");
});

test("E3: thêm một căn — đọc ở B thấy ngay", async () => {
  assert.equal((await tra(appB, "P-20.03")).status, "not_in_catalog");
  await nap(goi([CAN_GOC[0]!, can("P-20.02", 67.25), can("P-20.03", 90)], "[Mẫu] Khu đổi tên"));
  assert.equal((await tra(appB, "P-20.03")).status, "found");
});

test("E3 đối chứng: dấu không đổi thì không dựng lại, nạp xong thì dựng lại", async () => {
  const nguon = taoNguonDanhMuc(appPool);
  await nguon.doc();
  await nguon.doc();
  assert.equal(nguon.soLanDung(), 1);
  await nap(goi([CAN_GOC[0]!, can("P-20.02", 68), can("P-20.03", 90)], "[Mẫu] Khu đổi tên"));
  await nguon.doc();
  assert.equal(nguon.soLanDung(), 2);
});

test("E6: Nhập Excel ghi được căn của gói, danh sách toà có toà của gói; căn không ở vùng không được ghi", async () => {
  const dung = await nhap("[Mẫu] Toà P", "P-20.01");
  assert.equal(dung.action, "create", dung.reason);
  assert.equal(dung.soHang, 1);
  assert.deepEqual(await danhSachToa(appA), ["[Mẫu] Toà P"]);
  const sai = await nhap("[Mẫu] Toà P", "P-20.77");
  assert.notEqual(sai.action, "create", sai.reason);
  assert.equal(sai.soHang, 0);
});

test("E8: sàn không nạp đọc được căn, thân trả không có agreement_id hay provider", async () => {
  assert.equal((await tra(appA, "P-20.01", SAN_KHAC.dauChu)).status, "found");
  const than = await caDanhMuc(appA, SAN_KHAC.dauChu);
  const khoa = khoaCua(than);
  assert.ok(khoa.has("unitNumber"), "đối chứng: thân trả phải có căn");
  for (const cam of ["agreement_id", "agreementId", "provider"]) assert.ok(!khoa.has(cam), `thân trả có khoá ${cam}`);
  const chu = JSON.stringify(than);
  assert.ok(!chu.includes(NGUON), "thân trả chứa tên nguồn");
});

test("khu chưa có cách đọc mã: mã của khu vẫn found; mã mẫu không còn found", async () => {
  await nap({
    ...goi([can("P-20.03", 90)], "[Mẫu] Khu đổi tên"),
    subdivisions: [
      { subdivisionKey: KHU_KHONG_CACH_DOC, subdivisionName: "[Mẫu] Khu mới", complexName: null, buildings: [{ buildingKey: "R", buildingName: "[Mẫu] Toà R", units: [can("R1205", 55)] }] },
    ],
  });
  assert.equal((await tra(appA, "R1205")).status, "found");
  assert.notEqual((await tra(appA, MA_MAU)).status, "found");
});
