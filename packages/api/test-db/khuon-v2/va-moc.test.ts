// Hàng vá khuôn v2: gói có mốc đo tương lai, tên miền đuôi lạ, mốc đo lạ bị từ chối mà khu không đóng băng — E2, E6.
import type { CatalogFeedV2 } from "@quy-hang/connect";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, chup, dongNhatKy, donDepV2, FEED, goi, goiMau, goiV2, khuCua, sanCoToken, soDong } from "./chung";

after(donDepV2);

const docLoi = async (res: Response) => ((await res.json()) as { error: string }).error;
type San = Awaited<ReturnType<typeof sanCoToken>>;
type Duong = { ten: "phiên" | "token"; than: (s: San) => { cookie?: string; bearer?: string } };
const DUONG: Duong[] = [
  { ten: "phiên", than: (s) => ({ cookie: s.cookie }) },
  { ten: "token", than: (s) => ({ bearer: s.token }) },
];
const soLoiKhuon = async (s: San) => (await dongNhatKy(s.tokenId)).filter((d) => d.outcome === "invalid_payload").length;

/** Mọi cột của ba bảng theo khu, để phép so nhìn thấy cả tên toà, nguồn, giờ ghi. */
async function chupDu(khu: string[]) {
  const doc = async (bang: string, sapXep: string) => (await appPool.query<Record<string, unknown>>(`select * from ${bang} where subdivision_key = any ($1) order by ${sapXep}`, [khu])).rows;
  return { can: await doc("catalog_units", "upi"), thiTruong: await doc("catalog_market_snapshots", "subdivision_key"), tin: await doc("catalog_public_listing_snapshots", "subdivision_key") };
}

const TOA_DOI = "[Mẫu] Toà đổi tên";
/** Cùng khoá khu, nội dung khác ở cả ba bảng, mốc đo mới hơn gói mẫu và vẫn ở quá khứ. */
function goiMoiHon(g: CatalogFeedV2): CatalogFeedV2 {
  const s = structuredClone(g);
  s.marketStats = s.marketStats.map((m) => ({ ...m, measuredAt: "2026-11-09T10:00:00+07:00", segments: m.segments.map((d) => ({ ...d, listingCount: d.listingCount + 1 })) }));
  s.publicListings = s.publicListings.map((m) => ({ ...m, measuredAt: "2026-11-09T10:00:00+07:00", listings: m.listings.map((t) => ({ ...t, listPrice: t.listPrice + 1 })) }));
  s.subdivisions[0]!.buildings[0]!.buildingName = TOA_DOI;
  return s;
}

test("từ chối: khu không đổi", async () => {
  const LOI: { ten: string; sua: (g: CatalogFeedV2) => void }[] = [
    { ten: "mốc năm 2099", sua: (g) => void (g.marketStats[0]!.measuredAt = "2099-01-01T00:00:00+07:00") },
    { ten: "tên miền ở tên toà", sua: (g) => void (g.subdivisions[0]!.buildings[0]!.buildingName = "zalo.me/mau") },
    { ten: "phút múi giờ 60", sua: (g) => void (g.marketStats[0]!.measuredAt = "2026-11-09T09:00:00+07:60") },
  ];
  let soO = 0;
  for (const [i, o] of LOI.entries()) {
    for (const d of DUONG) {
      const tag = `tc-${i}-${d.ten === "token" ? "t" : "p"}`;
      const s = await sanCoToken(tag);
      const g = goiV2(tag);
      const khu = khuCua(g);
      assert.equal((await goi("POST", FEED, { ...d.than(s), body: g })).status, 200, `${o.ten}/${d.ten}: đối chứng`);
      const truoc = await chupDu(khu);
      assert.ok(truoc.thiTruong.length > 0 && truoc.tin.length > 0, "đối chứng: đã có ảnh chụp");
      const nhatKyTruoc = await soLoiKhuon(s);

      const sai = goiMoiHon(g);
      o.sua(sai);
      const res = await goi("POST", FEED, { ...d.than(s), body: sai });
      assert.equal(res.status, 422, `${o.ten}/${d.ten}`);
      assert.equal(await docLoi(res), "invalid-feed", `${o.ten}/${d.ten}`);
      assert.deepEqual(await chupDu(khu), truoc, `${o.ten}/${d.ten}: toàn nội dung không đổi`);
      assert.equal(await soLoiKhuon(s), nhatKyTruoc + (d.ten === "token" ? 1 : 0), `${o.ten}/${d.ten}: nhật ký`);

      // Khu không bị đóng băng: gói đúng mới hơn vẫn thay được ảnh chụp.
      const dung = goiMoiHon(g);
      assert.equal((await goi("POST", FEED, { ...d.than(s), body: dung })).status, 200, `${o.ten}/${d.ten}: gói đúng sau đó`);
      const sau = await chupDu(khu);
      const dongMoi = sau.thiTruong.find((r) => r.subdivision_key === dung.marketStats[0]!.subdivisionKey)!;
      assert.deepEqual(dongMoi.segments, dung.marketStats[0]!.segments, `${o.ten}/${d.ten}: đoạn đã thay`);
      assert.notDeepEqual(dongMoi.segments, g.marketStats[0]!.segments, `${o.ten}/${d.ten}: đoạn phải khác gói đầu`);
      const tinMoi = sau.tin.find((r) => r.subdivision_key === dung.publicListings[0]!.subdivisionKey)!;
      assert.deepEqual(tinMoi.listings, dung.publicListings[0]!.listings, `${o.ten}/${d.ten}: tin rao đã thay`);
      assert.notDeepEqual(tinMoi.listings, g.publicListings[0]!.listings, `${o.ten}/${d.ten}: tin rao phải khác gói đầu`);
      // Đối chứng dương cho bảng căn: phép so mọi cột thấy được gói đúng đã đổi tên toà.
      assert.notDeepEqual(sau.can, truoc.can, `${o.ten}/${d.ten}: bảng căn phải đổi sau gói đúng`);
      assert.ok(sau.can.some((r) => r.building_name === TOA_DOI), `${o.ten}/${d.ten}: tên toà mới đã ghi`);
      assert.ok(!truoc.can.some((r) => r.building_name === TOA_DOI), `${o.ten}/${d.ten}: đối chứng: trước đó chưa có tên toà mới`);
      soO += 1;
    }
  }
  assert.equal(soO, 6);
});

const DANG_LA = [
  "2026-11-09T08:00:00+07:60",
  "2026-11-09T08:00:00+07:99",
  "2026-11-09T08:00:00+0760",
  "2026-11-09T08:00:00-00:75",
  "2026-11-09T08:00:00.1234567890+07:00",
  `2026-11-09T08:00:00.${"1".repeat(300)}+07:00`,
];

test("mốc đo lạ: 422 không phải 500", async () => {
  const s = await sanCoToken("la");
  let soLan = 0;
  for (const [i, m] of DANG_LA.entries()) {
    for (const d of DUONG) {
      const g = goiV2(`la-${i}-${d.ten === "token" ? "t" : "p"}`);
      g.marketStats[0]!.measuredAt = m;
      const res = await goi("POST", FEED, { ...d.than(s), body: g });
      assert.equal(res.status, 422, `${m.slice(0, 40)}/${d.ten}: phải là lỗi khuôn`);
      assert.equal(await docLoi(res), "invalid-feed");
      assert.equal(soDong(await chup(khuCua(g))), 0, `${m.slice(0, 40)}/${d.ten}: không ghi dòng nào`);
      soLan += 1;
    }
  }
  assert.equal(soLan, 12);
});

test("mốc đo biên ghi được", async () => {
  const s = await sanCoToken("bien");
  let soLan = 0;
  for (const [i, m] of ["2026-11-09T08:00:00+15:59", "2026-11-09T08:00:00.123456789+07:00"].entries()) {
    for (const d of DUONG) {
      const g = goiV2(`bien-${i}-${d.ten === "token" ? "t" : "p"}`);
      g.marketStats[0]!.measuredAt = m;
      assert.equal((await goi("POST", FEED, { ...d.than(s), body: g })).status, 200, `${m}/${d.ten}`);
      const dong = (await chup(khuCua(g))).thiTruong.find((r) => r.subdivision_key === g.marketStats[0]!.subdivisionKey)!;
      assert.equal((dong.measured_at as Date).getTime(), new Date(m).getTime(), `${m}/${d.ten}: đọc lại đúng thời điểm`);
      soLan += 1;
    }
  }
  assert.equal(soLan, 4);
});

// Ba vị trí mốc còn lại đi đường ghi khác số thị trường: đầu gói vào bảng căn, tin rao vào bảng ảnh chụp tin.
type GoiThu = { khu: string[]; than: unknown };
const VI_TRI_KHAC: { ten: string; tao: (tag: string, moc: string) => GoiThu; doc: (khu: string[]) => Promise<unknown[]> }[] = [
  {
    ten: "đầu gói v1",
    tao: (tag, moc) => {
      const g = { ...goiMau(tag), measuredAt: moc };
      return { khu: g.subdivisions.map((x) => x.subdivisionKey), than: g };
    },
    doc: async (khu) => (await chupDu(khu)).can.map((r) => r.measured_at),
  },
  {
    ten: "đầu gói v2",
    tao: (tag, moc) => {
      const g = goiV2(tag);
      g.measuredAt = moc;
      return { khu: khuCua(g), than: g };
    },
    doc: async (khu) => (await chupDu(khu)).can.map((r) => r.measured_at),
  },
  {
    ten: "tin rao",
    tao: (tag, moc) => {
      const g = goiV2(tag);
      g.publicListings = g.publicListings.map((m) => ({ ...m, measuredAt: moc }));
      return { khu: khuCua(g), than: g };
    },
    doc: async (khu) => (await chupDu(khu)).tin.map((r) => r.measured_at),
  },
];

test("mốc đo lạ: đủ các vị trí qua cửa nhận", async () => {
  const s = await sanCoToken("la-du");
  let soLan = 0;
  for (const [v, c] of VI_TRI_KHAC.entries()) {
    for (const [i, m] of DANG_LA.entries()) {
      for (const d of DUONG) {
        const { khu, than } = c.tao(`lv-${v}-${i}-${d.ten === "token" ? "t" : "p"}`, m);
        const res = await goi("POST", FEED, { ...d.than(s), body: than });
        assert.equal(res.status, 422, `${c.ten}/${m.slice(0, 40)}/${d.ten}: phải là lỗi khuôn`);
        assert.equal(await docLoi(res), "invalid-feed");
        assert.equal(soDong(await chup(khu)), 0, `${c.ten}/${m.slice(0, 40)}/${d.ten}: không ghi dòng nào`);
        soLan += 1;
      }
    }
  }
  assert.equal(soLan, VI_TRI_KHAC.length * DANG_LA.length * DUONG.length);
  assert.equal(soLan, 36);
});

test("mốc đo biên ghi được: đủ các vị trí", async () => {
  const s = await sanCoToken("bien-du");
  let soLan = 0;
  for (const [v, c] of VI_TRI_KHAC.entries()) {
    for (const [i, m] of ["2026-11-09T08:00:00+15:59", "2026-11-09T08:00:00.123456789+07:00"].entries()) {
      for (const d of DUONG) {
        const { khu, than } = c.tao(`bv-${v}-${i}-${d.ten === "token" ? "t" : "p"}`, m);
        assert.equal((await goi("POST", FEED, { ...d.than(s), body: than })).status, 200, `${c.ten}/${m}/${d.ten}`);
        const giaTri = await c.doc(khu);
        assert.ok(giaTri.length > 0, `${c.ten}/${m}/${d.ten}: đối chứng: có dòng để đọc`);
        for (const t of giaTri) assert.equal((t as Date).getTime(), new Date(m).getTime(), `${c.ten}/${m}/${d.ten}: đọc lại đúng thời điểm`);
        soLan += 1;
      }
    }
  }
  assert.equal(soLan, 12);
});
