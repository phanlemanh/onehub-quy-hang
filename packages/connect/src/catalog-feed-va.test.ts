// Vá khuôn v2 (hàng va-khuon-v2-moc-tuong-lai): mốc đo tương lai, tên miền đuôi lạ, mốc đo cơ sở dữ liệu không nhận.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CATALOG_FEED_FUTURE_TOLERANCE_MS, parseCatalogFeed, type CatalogFeedV2 } from "./catalog-feed";
import { goiMauV2 } from "./catalog-feed-v2-mau";

type Duong = (string | number)[];
type Parse = (g: unknown) => ReturnType<typeof parseCatalogFeed>;

const NOW = new Date("2026-11-09T12:00:00Z");
const doc: Parse = (g) => parseCatalogFeed(g, { now: NOW });
const luc = (ms: number) => new Date(NOW.getTime() + ms).toISOString();

function dat(g: unknown, p: Duong, v: unknown) {
  let o = g as Record<string | number, unknown>;
  for (const k of p.slice(0, -1)) o = o[k] as Record<string | number, unknown>;
  o[p.at(-1)!] = v;
}

function motLoi(g: unknown, path: Duong, ten: string, chua: string, parse: Parse = doc) {
  const r = parse(g);
  assert.ok(!r.ok, `${ten}: phải bị từ chối`);
  assert.equal(r.errors.length, 1, `${ten}: đúng một lỗi, có ${JSON.stringify(r.errors)}`);
  assert.deepEqual(r.errors[0]!.path, path, ten);
  assert.ok(r.errors[0]!.message.includes(chua), `${ten}: thông điệp phải nêu «${chua}»: ${r.errors[0]!.message}`);
}
function nhan(g: unknown, ten: string, parse: Parse = doc) {
  const r = parse(g);
  assert.ok(r.ok, `${ten}: phải được nhận — ${JSON.stringify(r)}`);
}

// ---- Bốn vị trí của mốc đo ----
const mauV1 = () => ({ schemaVersion: 1, provider: "[Mẫu]", measuredAt: "2026-11-09T08:00:00+07:00", subdivisions: [] });
type ViTri = { ten: string; path: Duong; tao: () => unknown };
const VI_TRI: ViTri[] = [
  { ten: "đầu gói v1", path: ["measuredAt"], tao: mauV1 },
  { ten: "đầu gói v2", path: ["measuredAt"], tao: goiMauV2 },
  { ten: "số thị trường", path: ["marketStats", 0, "measuredAt"], tao: goiMauV2 },
  { ten: "tin rao", path: ["publicListings", 0, "measuredAt"], tao: goiMauV2 },
];
const mocTai = (c: ViTri, moc: string) => {
  const g = c.tao();
  dat(g, c.path, moc);
  return g;
};

test("mốc tương lai: ma trận", () => {
  assert.equal(CATALOG_FEED_FUTURE_TOLERANCE_MS, 3_600_000);
  let soLan = 0;
  for (const c of VI_TRI) {
    motLoi(mocTai(c, luc(CATALOG_FEED_FUTURE_TOLERANCE_MS + 1000)), c.path, c.ten, "tương lai");
    soLan += 1;
    nhan(mocTai(c, luc(CATALOG_FEED_FUTURE_TOLERANCE_MS)), `${c.ten}: đúng biên`);
    nhan(mocTai(c, luc(-86_400_000)), `${c.ten}: quá khứ`);
  }
  assert.equal(soLan, VI_TRI.length);

  // Vắng tham số thì dùng giờ máy: mốc năm 2099 bị từ chối, gói mẫu đã qua được nhận.
  motLoi(mocTai(VI_TRI[1]!, "2099-01-01T00:00:00Z"), ["measuredAt"], "giờ máy", "tương lai", (g) => parseCatalogFeed(g));
  nhan(goiMauV2(), "giờ máy: gói mẫu", (g) => parseCatalogFeed(g));

  // Chiều đỏ: lùi giờ một năm thì mọi mốc của gói mẫu thành tương lai, đúng các đường mốc.
  const mau = goiMauV2();
  const r = parseCatalogFeed(mau, { now: new Date(NOW.getTime() - 365 * 86_400_000) });
  assert.ok(!r.ok, "chiều đỏ: gói mẫu phải đỏ");
  const mong = ["measuredAt", ...mau.marketStats.map((_, i) => `marketStats/${i}/measuredAt`), ...mau.publicListings.map((_, i) => `publicListings/${i}/measuredAt`)];
  assert.deepEqual(r.errors.map((e) => e.path.join("/")).sort(), mong.sort());
});

test("mốc tương lai: so theo thời điểm", () => {
  // Biên là 13:00:00Z; viết ở múi giờ khác thì chuỗi khác hẳn nhưng cùng thời điểm.
  const maTran: [string, string][] = [
    ["2026-11-09T20:00:00+07:00", "2026-11-09T20:00:01+07:00"],
    ["2026-11-09T12:00:00-01:00", "2026-11-09T12:00:01-01:00"],
    ["2026-11-09T20:00:00+0700", "2026-11-09T20:00:01+0700"],
    ["2026-11-10T04:59:00+15:59", "2026-11-10T04:59:01+15:59"],
    ["2026-11-09T20:00:00.000000000+07:00", "2026-11-09T20:00:01.123456789+07:00"],
  ];
  let soLan = 0;
  for (const c of VI_TRI) {
    for (const [dung, vuot] of maTran) {
      nhan(mocTai(c, dung), `${c.ten}: ${dung}`);
      motLoi(mocTai(c, vuot), c.path, `${c.ten}: ${vuot}`, "tương lai");
      soLan += 1;
    }
  }
  assert.equal(soLan, VI_TRI.length * maTran.length);
});

test("mốc tương lai: cùng lỗi khác", () => {
  // Lỗi của lưới và mốc tương lai cùng được báo.
  const g = goiMauV2();
  g.provider = "muaban.xyz";
  g.marketStats[0]!.measuredAt = "2099-01-01T00:00:00Z";
  const r = doc(g);
  assert.ok(!r.ok);
  assert.deepEqual(r.errors.map((e) => e.path.join("/")).sort(), ["marketStats/0/measuredAt", "provider"]);

  // Sai kiểu: khuôn dừng ở lỗi kiểu, không ném và vẫn từ chối.
  const sai = goiMauV2() as unknown as Record<string, unknown>;
  sai.provider = 5;
  sai.measuredAt = "2099-01-01T00:00:00Z";
  const r2 = doc(sai);
  assert.ok(!r2.ok);
  assert.ok(r2.errors.some((e) => e.path.join("/") === "provider"), JSON.stringify(r2.errors));
});

// ---- Tên miền ----
const CAN: Duong = ["subdivisions", 0, "buildings", 0, "units", 0];
const SAU_DUONG: Duong[] = [
  ["provider"],
  ["subdivisions", 0, "subdivisionName"],
  ["subdivisions", 0, "complexName"],
  ["subdivisions", 0, "buildings", 0, "buildingName"],
  [...CAN, "unitNumber"],
  [...CAN, "directionFaces"],
];
const TEN_MIEN = ["zalo.me/mau", "t.me/kenh", "fb.me/mau", "nhadat.land", "muaban.xyz", "nha.shop", "ten.lavender", "ZALO.ME"];
const SACH = ["A.2305", "S1.02", "S1.Shop", "Toà 3.1", "Khu B.2", "Tp.HCM", "Q.1", "P.Bến Nghé", "H.Me Linh", "P.Co Giang"];
const chuTai = (p: Duong, v: string) => {
  const g = goiMauV2();
  dat(g, p, v);
  return g;
};

const LUOI = /Giá trị có dáng/;
function oLot(parse: Parse): { sot: string[]; soLan: number } {
  const sot: string[] = [];
  let soLan = 0;
  for (const p of SAU_DUONG) {
    for (const v of TEN_MIEN) {
      const r = parse(chuTai(p, v));
      soLan += 1;
      const dung = !r.ok && r.errors.length === 1 && r.errors[0]!.path.join("/") === p.join("/") && r.errors[0]!.message.includes("dáng tên miền");
      if (!dung) sot.push(`${p.join("/")} = ${v}`);
    }
  }
  return { sot, soLan };
}

test("tên miền: đuôi bất kỳ", () => {
  const that = oLot(doc);
  assert.deepEqual(that.sot, []);
  assert.equal(that.soLan, SAU_DUONG.length * TEN_MIEN.length);
  assert.equal(that.soLan, 48);
  nhan(goiMauV2(), "đối chứng dương: gói lành");

  // Chiều đỏ: tắt lưới trong bản sao hàm đọc thì mọi ô đỏ và nêu đường.
  const tatLuoi: Parse = (g) => {
    const r = doc(g);
    if (r.ok) return r;
    const con = r.errors.filter((e) => !LUOI.test(e.message));
    return con.length ? { ok: false, errors: con } : { ok: true, feed: g as CatalogFeedV2 };
  };
  const { sot } = oLot(tatLuoi);
  assert.equal(sot.length, 48, "tắt lưới thì mọi ô phải đỏ");
  assert.ok(sot.some((x) => x.startsWith("provider = ")), "phép đo phải nêu đường");
});

test("tên miền: địa danh viết thường là giá đã duyệt", () => {
  const p: Duong = ["subdivisions", 0, "subdivisionName"];
  motLoi(chuTai(p, "tp.hcm"), p, "tp.hcm", "dáng tên miền");
  nhan(chuTai(p, "Tp.HCM"), "đối chứng: Tp.HCM");
});

test("tên miền: chữ thường có dấu tiếng Việt", () => {
  const p: Duong = ["subdivisions", 0, "subdivisionName"];
  for (const v of ["q.thủ đức", "Phường.an phú", "p.bến nghé"]) nhan(chuTai(p, v), v);
  motLoi(chuTai(p, "q.thu duc"), p, "đối chứng: không dấu", "dáng tên miền");
});

test("tên miền: đuôi bỏ khỏi danh sách cứng", () => {
  let soLan = 0;
  for (const p of SAU_DUONG) {
    for (const v of ["nhadat.io", "nhadat.co"]) {
      motLoi(chuTai(p, v), p, `${p.join("/")} = ${v}`, "dáng tên miền");
      soLan += 1;
    }
  }
  assert.equal(soLan, SAU_DUONG.length * 2);
});

test("tên miền: chuỗi sạch có dấu chấm", () => {
  let soLan = 0;
  for (const p of SAU_DUONG) {
    for (const v of SACH) {
      nhan(chuTai(p, v), `${p.join("/")} = ${v}`);
      soLan += 1;
    }
    motLoi(chuTai(p, "nhadat.land"), p, `đối chứng ${p.join("/")}`, "dáng tên miền");
  }
  assert.equal(soLan, SAU_DUONG.length * SACH.length);
  assert.equal(soLan, 60);
});

test("tên miền: khoá máy cấp có dấu chấm", () => {
  const goc = goiMauV2();
  const can = goc.subdivisions[0]!.buildings[0]!.units[0]!;
  const maTran: { ten: string; cu: string; moi: string }[] = [
    { ten: "khoá khu", cu: goc.subdivisions[0]!.subdivisionKey, moi: "khu-a.toa-b" },
    { ten: "khoá toà", cu: goc.subdivisions[0]!.buildings[0]!.buildingKey, moi: "khu-a.toa-b" },
    { ten: "UPI", cu: can.upi, moi: "urn:onehub:upi:khu-a.toa-b" },
  ];
  let soO = 0;
  for (const o of maTran) {
    const g = JSON.parse(JSON.stringify(goc).replaceAll(`"${o.cu}"`, `"${o.moi}"`));
    nhan(g, o.ten);
    soO += 1;
  }
  assert.equal(soO, 3);
  const p: Duong = ["subdivisions", 0, "buildings", 0, "buildingName"];
  motLoi(chuTai(p, "khu-a.toa-b"), p, "đối chứng: cùng chuỗi ở trường chữ", "dáng tên miền");
});

// ---- Mốc đo cơ sở dữ liệu không nhận ----
const DANG_LA = [
  "2026-11-09T08:00:00+07:60",
  "2026-11-09T08:00:00+07:99",
  "2026-11-09T08:00:00+0760",
  "2026-11-09T08:00:00-00:75",
  "2026-11-09T08:00:00.1234567890+07:00",
  `2026-11-09T08:00:00.${"1".repeat(300)}+07:00`,
];

test("mốc đo cơ sở dữ liệu không nhận: phút và phần lẻ", () => {
  let soLan = 0;
  for (const c of VI_TRI) {
    for (const m of DANG_LA) {
      motLoi(mocTai(c, m), c.path, `${c.ten} = ${m.slice(0, 40)}`, "Mốc đo");
      soLan += 1;
    }
  }
  assert.equal(soLan, 24);
  for (const c of VI_TRI) {
    for (const m of ["2026-11-09T08:00:00+15:59", "2026-11-09T08:00:00+07:59", "2026-11-09T08:00:00.123456789+07:00"]) {
      nhan(mocTai(c, m), `${c.ten}: biên ${m}`);
    }
  }
});
