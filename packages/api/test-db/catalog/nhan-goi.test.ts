// Cửa nhận gói danh mục POST /api/v1/catalog/feeds trên Postgres thật (hồ sơ nhan-danh-muc-invest) — E4, E5, E6, E7, E9.
// Thoả thuận và danh sách tin do chủ bảng (appPool không đặt vai, như công cụ vận hành) chèn thẳng. Mỗi ca một nguồn
// (provider) và bộ khoá riêng, để đếm dòng của vùng dùng chung không lẫn giữa các ca.
import { OpenAPIHono } from "@hono/zod-openapi";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { registerFeedRoutes } from "../../src/catalog/feeds";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

const { auth, sent } = makeAuth();
const deps = { appPool, identityPool, auth };
const app = createApi(deps);

/** Sàn do tệp này mở — dọn vùng dùng chung, danh sách tin và thoả thuận của chúng trước khi helpers xoá sàn. */
const sanDaMo: string[] = [];
after(async () => {
  await appPool.query("delete from catalog_units where provider like $1", [`%${RUN}%`]);
  await appPool.query("delete from catalog_subdivisions where provider like $1", [`%${RUN}%`]);
  await appPool.query("delete from catalog_trusted_companies where company_id = any ($1::uuid[])", [sanDaMo]);
  await appPool.query("delete from agreements where company_id = any ($1::uuid[])", [sanDaMo]);
  await cleanup();
});

type Goi = { request: (u: string, i?: RequestInit) => Response | Promise<Response> };
const PATH = "/api/v1/catalog/feeds";
const postRaw = (a: Goi, path: string, body: string, cookie?: string) =>
  a.request(`${BASE_URL}${path}`, {
    method: "POST",
    body,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
  });
const post = (path: string, body: unknown, cookie?: string) => postRaw(app, path, JSON.stringify(body), cookie);
const nop = (body: unknown, cookie?: string, a: Goi = app) => postRaw(a, PATH, JSON.stringify(body), cookie);

async function login(email: string): Promise<string> {
  const before = sent.length;
  assert.equal((await post("/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200);
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await post("/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}
/** Một quản trị đã đăng nhập và chọn sàn mới. */
async function sanMoi(ten: string): Promise<{ cookie: string; companyId: string }> {
  const email = mail(`qt-ng-${ten}`);
  const s = await openCompany(`[Sàn ${RUN} NG ${ten}]`, email);
  sanDaMo.push(s.companyId);
  return { cookie: `${await login(email)}; qh_san=${s.companyId}`, companyId: s.companyId };
}

const NGAY = 24 * 3600 * 1000;
type ThoaThuan = { kind?: string; direction?: string; classes?: string[]; from?: Date; until?: Date | null; status?: string };
/** Chủ bảng thêm một thoả thuận cho sàn; mặc định là thoả thuận hợp lệ để nhận danh mục. */
async function themThoaThuan(companyId: string, t: ThoaThuan = {}): Promise<string> {
  const { rows } = await appPool.query<{ id: string }>(
    `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, valid_until, status,
                             approved_by)
     values ($1, $2, $3, 'onehub-invest', $4, $5, $6, $7, '[Tên]') returning id`,
    [
      companyId,
      t.kind ?? "catalog_source",
      t.direction ?? "inbound",
      t.classes ?? ["catalog"],
      t.from ?? new Date(Date.now() - NGAY),
      t.until === undefined ? null : t.until,
      t.status ?? "active",
    ],
  );
  return rows[0]!.id;
}
const tin = (companyId: string) =>
  appPool.query("insert into catalog_trusted_companies (company_id) values ($1) on conflict do nothing", [companyId]);
const doiTrangThai = (id: string, status: string) => appPool.query("update agreements set status = $2 where id = $1", [id, status]);

/** Số dòng của một nguồn ở hai bảng của vùng dùng chung. */
async function dem(provider: string): Promise<{ units: number; subdivisions: number }> {
  const u = await appPool.query<{ n: string }>("select count(*) n from catalog_units where provider = $1", [provider]);
  const s = await appPool.query<{ n: string }>("select count(*) n from catalog_subdivisions where provider = $1", [provider]);
  return { units: Number(u.rows[0]!.n), subdivisions: Number(s.rows[0]!.n) };
}

const upi = (tag: string, can: string) => `urn:onehub:upi:thu:${RUN}:${tag}:${can}`;
const condo = (tag: string, can: string, floor: number, livingArea: number) => ({
  upi: upi(tag, can),
  unitNumber: can,
  stack: can.slice(-2),
  floor,
  livingArea,
  bedroomsTotal: 2,
  directionFaces: "Đông Nam",
  propertyType: "Residential",
  propertySubType: "Condominium",
});
const townhouse = (tag: string) => ({
  upi: upi(tag, "LK-07"),
  unitNumber: "LK-07",
  stack: null,
  floor: null,
  livingArea: 240,
  bedroomsTotal: 4,
  directionFaces: "Nam",
  propertyType: "Residential",
  propertySubType: "Townhouse",
  lotSizeArea: 90,
  storiesTotal: 4,
  frontageLength: 6,
  accessRoadWidth: 13.5,
});
type Feed = {
  schemaVersion: number;
  provider: string;
  measuredAt: string;
  subdivisions: {
    subdivisionKey: string;
    subdivisionName: string;
    complexName: string | null;
    buildings: { buildingKey: string; buildingName: string; units: Record<string, unknown>[] }[];
  }[];
};
const khuKey = (tag: string, n: number) => `thu-${RUN}-${tag}-khu-${n}`;
const nguon = (tag: string) => `[Mẫu] Nguồn thử ${RUN} ${tag}`;
/** Gói mẫu v1: 2 khu, 3 toà, 4 căn — ba căn hộ và một nhà phố đủ bốn trường thấp tầng. */
const goiMau = (tag: string): Feed => ({
  schemaVersion: 1,
  provider: nguon(tag),
  measuredAt: "2026-10-29T08:00:00+07:00",
  subdivisions: [
    {
      subdivisionKey: khuKey(tag, 1),
      subdivisionName: "[Mẫu] Khu căn hộ",
      complexName: null,
      buildings: [
        { buildingKey: "a", buildingName: "[Mẫu] Toà A", units: [condo(tag, "A.2305", 23, 42.9), condo(tag, "A.1201", 12, 68.5)] },
        { buildingKey: "b", buildingName: "[Mẫu] Toà B", units: [condo(tag, "B.0708", 7, 55)] },
      ],
    },
    {
      subdivisionKey: khuKey(tag, 2),
      subdivisionName: "[Mẫu] Khu liền kề",
      complexName: "[Mẫu] Phân khu 1",
      buildings: [{ buildingKey: "lk", buildingName: "[Mẫu] Dãy LK", units: [townhouse(tag)] }],
    },
  ],
});
const SO_GOI_MAU = { subdivisions: 2, buildings: 3, units: 4 };

/** Danh sách cột viết trước của bảng căn (E11), không lấy từ migration; mốc cập nhật không so. */
const COT_CAN = [
  "upi", "subdivision_key", "building_key", "building_name", "unit_number", "stack", "floor", "living_area",
  "bedrooms_total", "direction_faces", "property_type", "property_sub_type", "lot_size_area", "stories_total",
  "frontage_length", "access_road_width", "provider", "measured_at", "agreement_id",
] as const;
const SO = new Set(["living_area", "lot_size_area", "frontage_length", "access_road_width"]);

/** Bảng căn của một nguồn, theo UPI, giá trị số đã đổi về number. */
async function docCan(provider: string): Promise<Map<string, Record<string, unknown>>> {
  const { rows } = await appPool.query<Record<string, unknown>>(
    `select ${COT_CAN.join(", ")} from catalog_units where provider = $1`,
    [provider],
  );
  return new Map(
    rows.map((r) => {
      const o: Record<string, unknown> = {};
      for (const k of COT_CAN) {
        const v = r[k];
        o[k] = SO.has(k) && v !== null ? Number(v) : k === "measured_at" ? (v as Date).toISOString() : v;
      }
      return [String(r.upi), o];
    }),
  );
}
/** Dòng mong đợi của từng căn trong gói, theo UPI. */
function canMongDoi(feed: Feed, agreementId: string): Map<string, Record<string, unknown>> {
  const m = new Map<string, Record<string, unknown>>();
  for (const s of feed.subdivisions)
    for (const b of s.buildings)
      for (const u of b.units)
        m.set(String(u.upi), {
          upi: u.upi,
          subdivision_key: s.subdivisionKey,
          building_key: b.buildingKey,
          building_name: b.buildingName,
          unit_number: u.unitNumber,
          stack: u.stack,
          floor: u.floor,
          living_area: u.livingArea,
          bedrooms_total: u.bedroomsTotal,
          direction_faces: u.directionFaces,
          property_type: u.propertyType,
          property_sub_type: u.propertySubType,
          lot_size_area: u.lotSizeArea ?? null,
          stories_total: u.storiesTotal ?? null,
          frontage_length: u.frontageLength ?? null,
          access_road_width: u.accessRoadWidth ?? null,
          provider: feed.provider,
          measured_at: new Date(feed.measuredAt).toISOString(),
          agreement_id: agreementId,
        });
  return m;
}
const theoUpi = (m: Map<string, Record<string, unknown>>) => Object.fromEntries([...m].sort(([a], [b]) => a.localeCompare(b)));

/** Sàn được tin có thoả thuận hợp lệ. */
async function sanDuocTin(ten: string) {
  const s = await sanMoi(ten);
  await tin(s.companyId);
  const agreementId = await themThoaThuan(s.companyId);
  return { ...s, agreementId };
}

test("nhận gói: thoả thuận đang bật, gói đúng khuôn vào vùng dùng chung", async () => {
  const s = await sanDuocTin("e4");
  const feed = goiMau("e4");
  const res = await nop(feed, s.cookie);
  assert.equal(res.status, 200, JSON.stringify(await res.clone().json()));
  assert.deepEqual(await res.json(), { ...SO_GOI_MAU, created: 4, updated: 0 });

  assert.deepEqual(await dem(feed.provider), { units: 4, subdivisions: 2 }, "đường trả 200 mà số dòng không khớp");
  const thay = await docCan(feed.provider);
  assert.deepEqual(theoUpi(thay), theoUpi(canMongDoi(feed, s.agreementId)));
  // Nhà phố mang đủ bốn trường thấp tầng, khác null và khác nhau.
  const lk = thay.get(upi("e4", "LK-07"))!;
  const thapTang = [lk.lot_size_area, lk.stories_total, lk.frontage_length, lk.access_road_width];
  assert.deepEqual(thapTang, [90, 4, 6, 13.5]);
  assert.equal(new Set(thapTang).size, 4);
  // Căn hộ không mang trường thấp tầng.
  assert.deepEqual([thay.get(upi("e4", "A.2305"))!.lot_size_area, thay.get(upi("e4", "A.2305"))!.stories_total], [null, null]);

  const { rows } = await appPool.query<{ subdivision_key: string; subdivision_name: string; complex_name: string | null }>(
    "select subdivision_key, subdivision_name, complex_name from catalog_subdivisions where provider = $1 order by subdivision_key",
    [feed.provider],
  );
  assert.deepEqual(rows, [
    { subdivision_key: khuKey("e4", 1), subdivision_name: "[Mẫu] Khu căn hộ", complex_name: null },
    { subdivision_key: khuKey("e4", 2), subdivision_name: "[Mẫu] Khu liền kề", complex_name: "[Mẫu] Phân khu 1" },
  ]);
});

test("nhận gói: gửi lại không nhân đôi, đổi một căn thì cập nhật đúng căn ấy", async () => {
  const s = await sanDuocTin("e5");
  const feed = goiMau("e5");
  const KHOA = ["subdivisions", "buildings", "units", "created", "updated"].sort();

  const dau = await nop(feed, s.cookie);
  assert.equal(dau.status, 200);
  const b1 = (await dau.json()) as Record<string, number>;
  assert.deepEqual(Object.keys(b1).sort(), KHOA, "thân trả về sai tập khoá");
  assert.deepEqual([b1.created, b1.updated], [4, 0], "lần đầu");
  const soDau = await dem(feed.provider);
  assert.deepEqual(soDau, { units: 4, subdivisions: 2 });
  const truoc = await docCan(feed.provider);

  const lai = await nop(feed, s.cookie);
  assert.equal(lai.status, 200);
  const b2 = (await lai.json()) as Record<string, number>;
  assert.deepEqual(Object.keys(b2).sort(), KHOA);
  assert.deepEqual([b2.created, b2.updated], [0, 0], "gửi lại y nguyên");
  assert.deepEqual(await dem(feed.provider), soDau, "gửi lại nhân đôi dòng");
  assert.deepEqual(theoUpi(await docCan(feed.provider)), theoUpi(truoc));

  // Đổi diện tích đúng một căn.
  const doi = structuredClone(feed);
  doi.subdivisions[0]!.buildings[1]!.units[0]!.livingArea = 56.5;
  const r3 = await nop(doi, s.cookie);
  assert.equal(r3.status, 200);
  const b3 = (await r3.json()) as Record<string, number>;
  assert.deepEqual([b3.created, b3.updated], [0, 1], "đổi một căn");
  assert.deepEqual(await dem(feed.provider), soDau);
  const sau = await docCan(feed.provider);
  const doiUpi = upi("e5", "B.0708");
  assert.equal(sau.get(doiUpi)!.living_area, 56.5);
  for (const [k, v] of truoc) if (k !== doiUpi) assert.deepEqual(sau.get(k), v, `căn ${k} không được đổi`);

  // Review Focus 3: cùng UPI chuyển sang khu khác → cập nhật subdivision_key, đếm là updated.
  const chuyen = structuredClone(doi);
  const can = chuyen.subdivisions[0]!.buildings[1]!.units.pop()!;
  chuyen.subdivisions[1]!.buildings[0]!.units.push(can);
  chuyen.subdivisions[0]!.buildings.pop();
  const r4 = await nop(chuyen, s.cookie);
  assert.equal(r4.status, 200);
  const b4 = (await r4.json()) as Record<string, number>;
  assert.deepEqual([b4.created, b4.updated], [0, 1], "căn đổi khu");
  const sauChuyen = await docCan(feed.provider);
  assert.equal(sauChuyen.get(doiUpi)!.subdivision_key, khuKey("e5", 2));
  assert.equal(sauChuyen.get(doiUpi)!.building_key, "lk");
  assert.deepEqual(await dem(feed.provider), soDau);
});

test("nhận gói: thoả thuận không đang bật thì 403 và không ghi dòng nào", async () => {
  const qua = new Date(Date.now() - 2 * NGAY);
  const homQua = new Date(Date.now() - NGAY);
  const mai = new Date(Date.now() + NGAY);
  // Ma trận viết trước: chín trạng thái không cho nhận.
  const MA_TRAN: { ten: string; tin: boolean; thoaThuan: ThoaThuan | null }[] = [
    { ten: "paused", tin: true, thoaThuan: { status: "paused" } },
    { ten: "ended", tin: true, thoaThuan: { status: "ended" } },
    { ten: "het-han", tin: true, thoaThuan: { from: qua, until: homQua } },
    { ten: "chua-toi", tin: true, thoaThuan: { from: mai } },
    { ten: "thieu-lop", tin: true, thoaThuan: { classes: ["shareable_listing"] } },
    { ten: "khac-loai", tin: true, thoaThuan: { kind: "lead_source" } },
    { ten: "chieu-ra", tin: true, thoaThuan: { direction: "outbound" } },
    { ten: "khong-co", tin: true, thoaThuan: null },
    { ten: "khong-tin", tin: false, thoaThuan: {} },
  ];
  // Cửa nhận phải tự từ chối, không dựa vào lưới của cơ sở dữ liệu: móc trước khi ghi không được chạy tới.
  let toiGhi = false;
  const appDo = new OpenAPIHono();
  registerFeedRoutes(appDo, deps, { truocKhiGhi: async () => void (toiGhi = true) });
  let so = 0;
  for (const p of MA_TRAN) {
    const s = await sanMoi(`e6-${p.ten}`);
    if (p.tin) await tin(s.companyId);
    if (p.thoaThuan) await themThoaThuan(s.companyId, p.thoaThuan);
    const feed = goiMau(`e6-${p.ten}`);
    toiGhi = false;
    const res = await nop(feed, s.cookie, appDo);
    assert.equal(res.status, 403, `${p.ten}: nhận ${res.status}`);
    assert.deepEqual(await res.json(), { error: "agreement-inactive" }, p.ten);
    assert.equal(toiGhi, false, `${p.ten}: cửa nhận cho qua tới câu ghi (chỉ cơ sở dữ liệu chặn)`);
    assert.deepEqual(await dem(feed.provider), { units: 0, subdivisions: 0 }, `${p.ten}: có dòng bị ghi`);
    so++;
  }
  assert.equal(so, 9);

  // Giữa giao dịch: hợp lệ lúc cửa nhận kiểm, chủ bảng tạm dừng ngay trước câu ghi → cơ sở dữ liệu từ chối.
  const g = await sanDuocTin("e6-giua");
  const appGiua = new OpenAPIHono();
  let daChay = false;
  registerFeedRoutes(appGiua, deps, {
    truocKhiGhi: async () => {
      await doiTrangThai(g.agreementId, "paused");
      daChay = true;
    },
  });
  const feed = goiMau("e6-giua");
  const giua = await nop(feed, g.cookie, appGiua);
  assert.ok(daChay, "móc trước khi ghi không chạy");
  assert.equal(giua.status, 403, `giữa giao dịch: nhận ${giua.status}`);
  assert.deepEqual(await giua.json(), { error: "agreement-inactive" });
  assert.deepEqual(await dem(feed.provider), { units: 0, subdivisions: 0 }, "giữa giao dịch: có dòng bị ghi");

  // Đối chứng dương: bật lại thì cùng gói được nhận.
  await doiTrangThai(g.agreementId, "active");
  const lai = await nop(feed, g.cookie);
  assert.equal(lai.status, 200, "bật lại mà không nhận");
  assert.deepEqual(await dem(feed.provider), { units: 4, subdivisions: 2 });

  // Review Focus 4: hai thoả thuận catalog_source, một tạm dừng (tạo trước) một đang bật → nhận bằng cái đang bật.
  const h = await sanMoi("e6-hai");
  await tin(h.companyId);
  await themThoaThuan(h.companyId, { status: "paused" });
  const bat = await themThoaThuan(h.companyId);
  const feedHai = goiMau("e6-hai");
  const hai = await nop(feedHai, h.cookie);
  assert.equal(hai.status, 200, "hai thoả thuận một dừng một bật");
  const ids = new Set([...(await docCan(feedHai.provider)).values()].map((r) => r.agreement_id));
  assert.deepEqual([...ids], [bat], "ghi không bằng thoả thuận đang bật");
});

test("nhận gói: gói sai khuôn thì 422 và không ghi dòng nào", async () => {
  const s = await sanDuocTin("e7");
  const feed = goiMau("e7");
  // Căn cuối của toà cuối: khu 2, toà 0, căn 0.
  const cuoi = ["subdivisions", 1, "buildings", 0, "units", 0];
  const sua = (f: (g: Feed) => void) => {
    const g = structuredClone(feed);
    f(g);
    return g;
  };
  const lastUnit = (g: Feed) => g.subdivisions[1]!.buildings[0]!.units[0]!;
  type Ca = { ten: string; body: unknown; path: (string | number)[]; nhac: string };
  const MA_TRAN: Ca[] = [
    { ten: "khoá lạ căn cuối", body: sua((g) => void (lastUnit(g).ownerPhone = "0900 000 001")), path: cuoi, nhac: "ownerPhone" },
    { ten: "schemaVersion 0", body: sua((g) => void (g.schemaVersion = 0)), path: ["schemaVersion"], nhac: "" },
    {
      ten: "Residential/Land",
      body: sua((g) => void Object.assign(lastUnit(g), { propertySubType: "Land", lotSizeArea: null, storiesTotal: null, frontageLength: null, accessRoadWidth: null })),
      path: [...cuoi, "propertySubType"],
      nhac: "Land",
    },
    {
      ten: "căn hộ mang lotSizeArea",
      body: sua((g) => void (g.subdivisions[0]!.buildings[0]!.units[0]!.lotSizeArea = 50)),
      path: ["subdivisions", 0, "buildings", 0, "units", 0, "lotSizeArea"],
      nhac: "lotSizeArea",
    },
  ];
  let so = 0;
  for (const p of MA_TRAN) {
    const res = await nop(p.body, s.cookie);
    assert.equal(res.status, 422, `${p.ten}: nhận ${res.status}`);
    const b = (await res.json()) as { error: string; errors: { path: (string | number)[]; message: string }[] };
    assert.equal(b.error, "invalid-feed", p.ten);
    assert.equal(b.errors.length, 1, `${p.ten}: ${JSON.stringify(b.errors)}`);
    assert.deepEqual(b.errors[0]!.path, p.path, p.ten);
    if (p.nhac) assert.match(b.errors[0]!.message, new RegExp(p.nhac), p.ten);
    assert.deepEqual(await dem(feed.provider), { units: 0, subdivisions: 0 }, `${p.ten}: có dòng bị ghi`);
    so++;
  }
  assert.equal(so, 4);

  // Review Focus 5: thân không phải JSON hay không phải object → 422 invalid-feed, không 500.
  const THAN = ["không phải json", "[]", "42", "null", '"chuỗi"'];
  for (const than of THAN) {
    const res = await postRaw(app, PATH, than, s.cookie);
    assert.equal(res.status, 422, `thân ${than}: nhận ${res.status}`);
    const b = (await res.json()) as { error: string; errors: unknown[] };
    assert.equal(b.error, "invalid-feed", than);
    assert.ok(Array.isArray(b.errors) && b.errors.length > 0, `thân ${than}: thiếu errors`);
  }
  assert.deepEqual(await dem(feed.provider), { units: 0, subdivisions: 0 });

  // Đối chứng dương: cùng gói đúng khuôn được nhận.
  assert.equal((await nop(feed, s.cookie)).status, 200);
});

test("nhận gói: cổng vào 401/403 và OpenAPI", async () => {
  const feed = goiMau("e9");
  const vang = await nop(feed);
  assert.equal(vang.status, 401);
  assert.deepEqual(await vang.json(), { error: "unauthenticated" });

  const le = mail("ng-le");
  await createLoneUser(le);
  const khongSan = await nop(feed, await login(le));
  assert.equal(khongSan.status, 403);
  assert.deepEqual(await khongSan.json(), { error: "no-company" });

  const s = await sanDuocTin("e9");
  const dau = mail("ng-dau-chu");
  assert.equal((await post("/api/v1/company/members", { email: dau, roles: ["listing_agent"] }, s.cookie)).status, 201);
  const khongQt = await nop(feed, `${await login(dau)}; qh_san=${s.companyId}`);
  assert.equal(khongQt.status, 403);
  assert.deepEqual(await khongQt.json(), { error: "admin-required" });
  assert.deepEqual(await dem(feed.provider), { units: 0, subdivisions: 0 });

  const qt = await nop(feed, s.cookie);
  assert.equal(qt.status, 200, "đối chứng: quản trị cùng sàn");

  const doc = (await (await app.request(`${BASE_URL}/api/v1/openapi.json`)).json()) as { paths: Record<string, { post?: unknown }> };
  assert.ok(doc.paths[PATH]?.post, "OpenAPI thiếu POST /api/v1/catalog/feeds");
});

test("nhận gói: gói rỗng nhận 200 với mọi số đếm 0", async () => {
  const s = await sanDuocTin("rong");
  const feed = { ...goiMau("rong"), subdivisions: [] };
  const res = await nop(feed, s.cookie);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { subdivisions: 0, buildings: 0, units: 0, created: 0, updated: 0 });
  assert.deepEqual(await dem(feed.provider), { units: 0, subdivisions: 0 });
});
