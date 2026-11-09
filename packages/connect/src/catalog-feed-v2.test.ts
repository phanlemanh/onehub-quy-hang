import { CATALOG_CONFIDENCE_FIELDS, CATALOG_CONFIDENCE_LEVELS } from "@quy-hang/core";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CATALOG_FEED_VERSIONS, parseCatalogFeed, type CatalogFeedV2 } from "./catalog-feed";
import { goiMauV2 } from "./catalog-feed-v2-mau";

type Goi = CatalogFeedV2 & Record<string, unknown>;
const mau = () => goiMauV2() as Goi;
const CAN = ["subdivisions", 0, "buildings", 0, "units", 0];
const can0 = (g: Goi) => g.subdivisions[0]!.buildings[0]!.units[0]! as unknown as Record<string, unknown> & { fieldConfidence: Record<string, unknown> };
const doan0 = (g: Goi) => g.marketStats[0]!.segments[0]! as unknown as Record<string, unknown>;
const tin0 = (g: Goi) => g.publicListings[0]!.listings[0]! as unknown as Record<string, unknown>;
const DOAN = ["marketStats", 0, "segments", 0];
const TIN = ["publicListings", 0, "listings", 0];

/** Đúng một lỗi, đúng đường khoá. */
function motLoi(g: unknown, path: (string | number)[], ten: string, chua?: string) {
  const r = parseCatalogFeed(g);
  assert.ok(!r.ok, `${ten}: phải bị từ chối`);
  assert.equal(r.errors.length, 1, `${ten}: đúng một lỗi, có ${JSON.stringify(r.errors)}`);
  assert.deepEqual(r.errors[0]!.path, path, ten);
  if (chua) assert.ok(r.errors[0]!.message.includes(chua), `${ten}: thông điệp phải nêu «${chua}»: ${r.errors[0]!.message}`);
}
const lanh = () => assert.ok(parseCatalogFeed(mau()).ok, `đối chứng dương: gói lành nhận — ${JSON.stringify(parseCatalogFeed(mau()))}`);

test("phiên bản khuôn", () => {
  const maTran: unknown[] = [0, 3, "2", undefined];
  let soLan = 0;
  for (const v of maTran) {
    const g: Record<string, unknown> = mau();
    if (v === undefined) delete g.schemaVersion;
    else g.schemaVersion = v;
    motLoi(g, ["schemaVersion"], `schemaVersion ${String(v)}`);
    soLan += 1;
  }
  assert.equal(soLan, maTran.length);
  assert.equal(soLan, 4);
  lanh();
  // Bản v1 của cùng gói (bỏ nhãn và hai phần mới) vẫn đọc được.
  const v1 = structuredClone(mau()) as Record<string, unknown> & CatalogFeedV2;
  for (const s of v1.subdivisions) for (const b of s.buildings) for (const u of b.units) delete (u as { fieldConfidence?: unknown }).fieldConfidence;
  delete (v1 as { marketStats?: unknown }).marketStats;
  delete (v1 as { publicListings?: unknown }).publicListings;
  assert.ok(parseCatalogFeed({ ...v1, schemaVersion: 1 }).ok, "v1 phải đọc được");
});

test("độ chắc: ma trận lệch luật", () => {
  const maTran: { ten: string; sua: (g: Goi) => void; path: (string | number)[]; chua: string }[] = [
    { ten: "nhãn ngoài ba nhãn", sua: (g) => void (can0(g).fieldConfidence.floor = "maybe"), path: [...CAN, "fieldConfidence", "floor"], chua: "inferred" },
    { ten: "giá trị khác null thiếu nhãn", sua: (g) => void delete can0(g).fieldConfidence.livingArea, path: [...CAN, "fieldConfidence", "livingArea"], chua: "livingArea" },
    { ten: "nhãn cho giá trị null", sua: (g) => void Object.assign(can0(g), { livingArea: null }), path: [...CAN, "fieldConfidence", "livingArea"], chua: "livingArea" },
    { ten: "nhãn cho giá trị vắng", sua: (g) => void (can0(g).fieldConfidence.lotSizeArea = "verified"), path: [...CAN, "fieldConfidence", "lotSizeArea"], chua: "lotSizeArea" },
    { ten: "nhãn cho trường ngoài chín trường", sua: (g) => void (can0(g).fieldConfidence.propertyType = "verified"), path: [...CAN, "fieldConfidence"], chua: "propertyType" },
    { ten: "nhãn cho upi", sua: (g) => void (can0(g).fieldConfidence.upi = "verified"), path: [...CAN, "fieldConfidence"], chua: "upi" },
  ];
  let soLan = 0;
  for (const o of maTran) {
    const g = mau();
    o.sua(g);
    motLoi(g, o.path, o.ten, o.chua);
    soLan += 1;
  }
  assert.equal(soLan, 6);
  lanh();
});

test("độ chắc: chín trường", () => {
  assert.deepEqual([...CATALOG_CONFIDENCE_LEVELS], ["inferred", "single_source", "verified"]);
  // Danh sách viết trước, không rút từ hằng của mã: đổi một tên trường thì ca này đỏ.
  assert.deepEqual([...CATALOG_CONFIDENCE_FIELDS], ["stack", "floor", "livingArea", "bedroomsTotal", "directionFaces", "lotSizeArea", "storiesTotal", "frontageLength", "accessRoadWidth"]);
  let soLan = 0;
  for (const f of CATALOG_CONFIDENCE_FIELDS) {
    const g = mau();
    Object.assign(can0(g), { [f]: f === "stack" || f === "directionFaces" ? "Nam" : 1 });
    delete can0(g).fieldConfidence[f];
    // Trường ngoài loại hình căn hộ còn báo thêm lỗi loại hình, nên tìm đúng đường nhãn trong danh sách lỗi.
    const r = parseCatalogFeed(g);
    assert.ok(!r.ok, `${f}: phải bị từ chối`);
    assert.ok(r.errors.some((e) => e.path.join("/") === [...CAN, "fieldConfidence", f].join("/") && e.message.includes(f)), `${f}: ${JSON.stringify(r.errors)}`);
    soLan += 1;
  }
  assert.equal(soLan, CATALOG_CONFIDENCE_FIELDS.length);
});

test("số thị trường: ma trận lệch khuôn", () => {
  const dat = (g: Goi) => g.marketStats[1]!.segments[0]! as unknown as Record<string, unknown>;
  const maTran: { ten: string; sua: (g: Goi) => void; path: (string | number)[] }[] = [
    { ten: "khu không có trong gói", sua: (g) => void (g.marketStats[0]!.subdivisionKey = "khu-la"), path: ["marketStats", 0, "subdivisionKey"] },
    { ten: "toà không thuộc khu", sua: (g) => void (doan0(g).buildingKey = "lo-a"), path: [...DOAN, "buildingKey"] },
    { ten: "đoạn trùng khoá", sua: (g) => void g.marketStats[0]!.segments.push(structuredClone(g.marketStats[0]!.segments[0]!)), path: ["marketStats", 0, "segments", 1] },
    { ten: "khu lặp", sua: (g) => void (g.marketStats[1]!.subdivisionKey = g.marketStats[0]!.subdivisionKey, Object.assign(dat(g), { buildingKey: "a", propertyType: "Residential", propertySubType: "Townhouse", bedroomsTotal: 3 })), path: ["marketStats", 1, "subdivisionKey"] },
    { ten: "thấp > trung vị", sua: (g) => void (doan0(g).listPriceLow = 3_700_000_000), path: [...DOAN, "listPriceLow"] },
    { ten: "trung vị > cao", sua: (g) => void (doan0(g).listPriceMedian = 4_200_000_000), path: [...DOAN, "listPriceHigh"] },
    { ten: "giá không nguyên", sua: (g) => void (doan0(g).listPriceLow = 1.5), path: [...DOAN, "listPriceLow"] },
    { ten: "giá ≤ 0", sua: (g) => void (doan0(g).listPriceLow = 0), path: [...DOAN, "listPriceLow"] },
    { ten: "số tin ≤ 0", sua: (g) => void (doan0(g).listingCount = 0), path: [...DOAN, "listingCount"] },
    { ten: "loại hình ngoài bảng", sua: (g) => void (doan0(g).propertySubType = "Land"), path: [...DOAN, "propertySubType"] },
    { ten: "số phòng âm", sua: (g) => void (doan0(g).bedroomsTotal = -1), path: [...DOAN, "bedroomsTotal"] },
    { ten: "mốc đo sai dạng", sua: (g) => void (g.marketStats[0]!.measuredAt = "hôm qua"), path: ["marketStats", 0, "measuredAt"] },
    { ten: "null ở loại hình có dùng", sua: (g) => void (doan0(g).bedroomsTotal = null), path: [...DOAN, "bedroomsTotal"] },
    { ten: "số phòng ở loại hình không dùng", sua: (g) => void (dat(g).bedroomsTotal = 2), path: ["marketStats", 1, "segments", 0, "bedroomsTotal"] },
    { ten: "hai đoạn cùng khoá có null", sua: (g) => void g.marketStats[1]!.segments.push(structuredClone(g.marketStats[1]!.segments[0]!)), path: ["marketStats", 1, "segments", 1] },
  ];
  let soLan = 0;
  for (const o of maTran) {
    const g = mau();
    o.sua(g);
    motLoi(g, o.path, o.ten);
    soLan += 1;
  }
  assert.equal(soLan, 15);
  lanh();
  // Đối chứng biên.
  const bien = mau();
  Object.assign(doan0(bien), { listPriceLow: 3_000_000_000, listPriceMedian: 3_000_000_000, listPriceHigh: 3_000_000_000 });
  assert.ok(parseCatalogFeed(bien).ok, "thấp bằng trung vị bằng cao phải nhận");
  const r = parseCatalogFeed(mau());
  assert.ok(r.ok && r.feed.schemaVersion === 2 && r.feed.marketStats[1]!.segments[0]!.bedroomsTotal === null, "bedroomsTotal null ở đất phải nhận");
});

test("tin rao: ma trận lệch khuôn", () => {
  const maTran: { ten: string; sua: (g: Goi) => void; path: (string | number)[] }[] = [
    { ten: "upi không có trong gói", sua: (g) => void (tin0(g).upi = "urn:onehub:upi:mau:khac"), path: [...TIN, "upi"] },
    { ten: "upi thuộc khu khác", sua: (g) => void (tin0(g).upi = "urn:onehub:upi:mau:v2:lo-a:07"), path: [...TIN, "upi"] },
    { ten: "listingKey sai dạng", sua: (g) => void (tin0(g).listingKey = "ngắn"), path: [...TIN, "listingKey"] },
    { ten: "listingKey trùng trong khu", sua: (g) => void (g.publicListings[0]!.listings[1]!.listingKey = "tin-mau-so-mot"), path: ["publicListings", 0, "listings", 1, "listingKey"] },
    { ten: "giá ≤ 0", sua: (g) => void (tin0(g).listPrice = 0), path: [...TIN, "listPrice"] },
    { ten: "giá không nguyên", sua: (g) => void (tin0(g).listPrice = 1.5), path: [...TIN, "listPrice"] },
    { ten: "feeInclusion ngoài tập", sua: (g) => void (tin0(g).feeInclusion = "partly"), path: [...TIN, "feeInclusion"] },
    { ten: "ngày sai dạng", sua: (g) => void (tin0(g).onMarketDate = "02/11/2026"), path: [...TIN, "onMarketDate"] },
    { ten: "khu không có trong gói", sua: (g) => void (g.publicListings[0]!.subdivisionKey = "khu-la"), path: ["publicListings", 0, "subdivisionKey"] },
    { ten: "khu lặp", sua: (g) => void g.publicListings.push({ ...structuredClone(g.publicListings[0]!), listings: [] }), path: ["publicListings", 1, "subdivisionKey"] },
  ];
  let soLan = 0;
  for (const o of maTran) {
    const g = mau();
    o.sua(g);
    motLoi(g, o.path, o.ten);
    soLan += 1;
  }
  assert.equal(soLan, 10);
  lanh();
  const rong = mau();
  tin0(rong).feeInclusion = null;
  assert.ok(parseCatalogFeed(rong).ok, "feeInclusion null phải nhận");
  rong.publicListings[0]!.listings = [];
  assert.ok(parseCatalogFeed(rong).ok, "listings rỗng phải nhận");
});

test("ngày không có thật", () => {
  const g = mau();
  tin0(g).onMarketDate = "2026-02-30";
  motLoi(g, [...TIN, "onMarketDate"], "30/02", "có thật");
});

test("giá tiền tỷ", () => {
  const g = mau();
  tin0(g).listPrice = 125_000_000_000;
  const r = parseCatalogFeed(g);
  assert.ok(r.ok && r.feed.schemaVersion === 2 && r.feed.publicListings[0]!.listings[0]!.listPrice === 125_000_000_000, "giá vượt 32 bit phải giữ đúng");
  assert.ok(125_000_000_000 > 2 ** 31, "đối chứng: giá thử vượt số nguyên 32 bit");
});

const KHOA_CAM = ["sourceUrl", "sourceName", "domain", "photos", "imageUrl", "listAgentFullName", "ownerPhone"];
const CAP: { ten: string; path: (string | number)[]; lay: (g: Goi) => object }[] = [
  { ten: "gốc", path: [], lay: (g) => g },
  { ten: "khu", path: ["subdivisions", 0], lay: (g) => g.subdivisions[0]! },
  { ten: "toà", path: ["subdivisions", 0, "buildings", 0], lay: (g) => g.subdivisions[0]!.buildings[0]! },
  { ten: "căn", path: CAN, lay: (g) => g.subdivisions[0]!.buildings[0]!.units[0]! },
  { ten: "phần tử số thị trường", path: ["marketStats", 0], lay: (g) => g.marketStats[0]! },
  { ten: "đoạn", path: DOAN, lay: (g) => g.marketStats[0]!.segments[0]! },
  { ten: "phần tử tin rao", path: ["publicListings", 0], lay: (g) => g.publicListings[0]! },
  { ten: "tin", path: TIN, lay: (g) => g.publicListings[0]!.listings[0]! },
];

test("cấm: khoá lạ", () => {
  let soLan = 0;
  for (const k of KHOA_CAM) {
    for (const c of CAP) {
      const g = mau();
      Object.assign(c.lay(g), { [k]: "[Mẫu]" });
      motLoi(g, c.path, `${k} ở ${c.ten}`, k);
      soLan += 1;
    }
  }
  assert.equal(soLan, 56);
  lanh();
});

const KHONG_SOAT = new Set(["schemaVersion", "measuredAt", "onMarketDate", "feeInclusion", "propertyType", "propertySubType", "fieldConfidence"]);
function laChuoi(gt: unknown, path: (string | number)[] = []): (string | number)[][] {
  if (typeof gt === "string") return [path];
  if (Array.isArray(gt)) return gt.flatMap((x, i) => laChuoi(x, [...path, i]));
  if (gt && typeof gt === "object") return Object.entries(gt).flatMap(([k, v]) => (KHONG_SOAT.has(k) ? [] : laChuoi(v, [...path, k])));
  return [];
}
function dat(o: unknown, path: (string | number)[], v: string) {
  let cur = o as Record<string | number, unknown>;
  for (const p of path.slice(0, -1)) cur = cur[p] as Record<string | number, unknown>;
  cur[path[path.length - 1]!] = v;
}
const DANG = ["https://vi-du.vn/tin", "www.vi-du", "vi-du.com.vn", "0900 000 012"];

type Parse = (g: unknown) => ReturnType<typeof parseCatalogFeed>;
const LUOI = /Giá trị có dáng/;
/** Những ô (lá chuỗi × dáng) mà lưới giá trị không báo đúng đường, trả về để phép đo đọc được cả chiều đỏ. */
function oKhongBiChan(la: (string | number)[][], parse: Parse): { sot: string[]; soLan: number } {
  const sot: string[] = [];
  let soLan = 0;
  for (const p of la) {
    for (const d of DANG) {
      const g = mau();
      dat(g, p, d);
      const r = parse(g);
      soLan += 1;
      if (r.ok || !r.errors.some((e) => e.path.join("/") === p.join("/") && LUOI.test(e.message))) sot.push(`${p.join("/")} = ${d}`);
    }
  }
  return { sot, soLan };
}

test("cấm: giá trị trong mọi chuỗi", () => {
  // Mã tin có mẫu riêng nên không qua lưới giá trị; đo riêng ở dưới.
  const tatCa = laChuoi(mau());
  const la = tatCa.filter((p) => p.at(-1) !== "listingKey");
  const maTin = tatCa.filter((p) => p.at(-1) === "listingKey");
  assert.ok(la.length >= 15, `chỉ có ${la.length} lá chuỗi`);
  assert.ok(maTin.length >= 1, "đối chứng: gói mẫu có mã tin");
  const that = oKhongBiChan(la, parseCatalogFeed);
  assert.deepEqual(that.sot, []);
  assert.equal(that.soLan, la.length * DANG.length);
  for (const p of maTin) {
    for (const d of DANG) {
      const g = mau();
      dat(g, p, d);
      const r = parseCatalogFeed(g);
      assert.ok(!r.ok && r.errors.some((e) => e.path.join("/") === p.join("/") && e.message.includes("listingKey")), `${p.join("/")} = ${d}`);
    }
  }
  lanh();
  // Chiều đỏ: tắt lưới giá trị trong bản sao hàm đọc thì phép đo đỏ và nêu đường lá.
  const tatLuoi: Parse = (g) => {
    const r = parseCatalogFeed(g);
    if (r.ok) return r;
    const con = r.errors.filter((e) => !LUOI.test(e.message));
    return con.length ? { ok: false, errors: con } : { ok: true, feed: g as CatalogFeedV2 };
  };
  const { sot } = oKhongBiChan(la, tatLuoi);
  assert.equal(sot.length, la.length * DANG.length, "tắt lưới thì mọi ô phải đỏ");
  assert.ok(sot.some((x) => x.startsWith("provider = ")), "phép đo phải nêu đường lá");
});

test("cấm: số dính chữ ở trường chữ tự do", () => {
  const dang = ["SĐT0900000012", "Zalo0900000012", "[Mẫu] Toà A LH0900000012", "(090) 000 0012"];
  const o: { ten: string; path: (string | number)[] }[] = [
    { ten: "provider", path: ["provider"] },
    { ten: "tên khu", path: ["subdivisions", 0, "subdivisionName"] },
    { ten: "tên phân khu", path: ["subdivisions", 0, "complexName"] },
    { ten: "tên toà", path: ["subdivisions", 0, "buildings", 0, "buildingName"] },
    { ten: "mã căn", path: [...CAN, "unitNumber"] },
    { ten: "hướng", path: [...CAN, "directionFaces"] },
  ];
  let soLan = 0;
  for (const c of o) {
    for (const d of dang) {
      const g = mau();
      dat(g, c.path, d);
      const r = parseCatalogFeed(g);
      assert.ok(!r.ok && r.errors.some((e) => e.path.join("/") === c.path.join("/") && LUOI.test(e.message)), `${c.ten} = ${d}: ${JSON.stringify(r)}`);
      soLan += 1;
    }
  }
  assert.equal(soLan, o.length * dang.length);
  // Đối chứng: khoá do máy cấp được phép có dãy số dính chữ như ULID.
  const ulid = mau();
  ulid.subdivisions[1]!.buildings[0]!.buildingKey = "01HZX0900000012ABCD";
  ulid.marketStats[1]!.segments[0]!.buildingKey = "01HZX0900000012ABCD";
  assert.ok(parseCatalogFeed(ulid).ok, JSON.stringify(parseCatalogFeed(ulid)));
});

test("mốc đo cơ sở dữ liệu không nhận", () => {
  const moc = ["2026-11-09T08:00:00+99:00", "2026-11-09T08:00:00+16:00", "2026-11-09T08:00:00-16:30", "0000-01-01T00:00:00Z"];
  const cho: { ten: string; path: (string | number)[]; dat: (g: Goi, v: string) => void }[] = [
    { ten: "đầu gói", path: ["measuredAt"], dat: (g, v) => void (g.measuredAt = v) },
    { ten: "số thị trường", path: ["marketStats", 0, "measuredAt"], dat: (g, v) => void (g.marketStats[0]!.measuredAt = v) },
    { ten: "tin rao", path: ["publicListings", 0, "measuredAt"], dat: (g, v) => void (g.publicListings[0]!.measuredAt = v) },
  ];
  let soLan = 0;
  for (const c of cho) {
    for (const m of moc) {
      const g = mau();
      c.dat(g, m);
      motLoi(g, c.path, `${c.ten} = ${m}`, "Mốc đo");
      soLan += 1;
    }
  }
  assert.equal(soLan, cho.length * moc.length);
  const bien = mau();
  bien.marketStats[0]!.measuredAt = "2026-11-09T08:00:00+15:59";
  assert.ok(parseCatalogFeed(bien).ok, "đối chứng: độ lệch 15:59 nhận được");
  // Khuôn v1 cùng luật.
  const v1 = { schemaVersion: 1, provider: "[Mẫu]", measuredAt: moc[0], subdivisions: [] };
  motLoi(v1, ["measuredAt"], "v1", "Mốc đo");
  assert.ok(parseCatalogFeed({ ...v1, measuredAt: "2026-11-09T08:00:00+07:00" }).ok, "đối chứng v1");
});

test("cấm: mã tin dáng số điện thoại", () => {
  const g = mau();
  tin0(g).listingKey = "0900000012";
  motLoi(g, [...TIN, "listingKey"], "mã tin dáng số điện thoại", "số điện thoại");
  const lanhMa = mau();
  tin0(lanhMa).listingKey = "mau_ma_mo_thuong";
  assert.ok(parseCatalogFeed(lanhMa).ok, "đối chứng: mã mờ thường được nhận");
});

test("đối chứng: chuỗi sạch có dấu chấm", () => {
  const g = mau();
  g.subdivisions[0]!.subdivisionName = "Khu B.2";
  g.subdivisions[0]!.buildings[0]!.buildingName = "Toà 3.1";
  assert.equal(can0(g).unitNumber, "A.2305");
  assert.ok(parseCatalogFeed(g).ok, JSON.stringify(parseCatalogFeed(g)));
});

test("gói mẫu: sinh từ khuôn, khớp tệp", () => {
  const goi = goiMauV2();
  const r = parseCatalogFeed(goi);
  assert.ok(r.ok, JSON.stringify(!r.ok && r.errors));
  const tep = readFileSync(fileURLToPath(new URL("./catalog-feed-v2.example.json", import.meta.url)), "utf8");
  const sinh = `${JSON.stringify(goi, null, 2)}\n`;
  assert.equal(tep, sinh, "tệp ví dụ lệch hàm sinh");
  // Đối chứng: đổi một giá trị thì phép so byte khác.
  const lech = structuredClone(goi);
  lech.provider = "[Mẫu] Khác";
  assert.notEqual(tep, `${JSON.stringify(lech, null, 2)}\n`);
  const nhan = new Set(goi.subdivisions.flatMap((s) => s.buildings.flatMap((b) => b.units.flatMap((u) => Object.values(u.fieldConfidence)))));
  assert.deepEqual([...nhan].sort(), [...CATALOG_CONFIDENCE_LEVELS].sort());
  assert.ok(goi.marketStats.flatMap((m) => m.segments).length >= 1);
  assert.ok(goi.publicListings.flatMap((m) => m.listings).length >= 1);
  assert.doesNotMatch(tep, /\b0\d(?:[ .-]?\d){8}\b/, "gói mẫu có dáng số điện thoại");
});

test("danh sách phiên bản", () => {
  assert.deepEqual([...CATALOG_FEED_VERSIONS], [1, 2]);
});
