// Gói sau thay gói trước của cùng khu (hàng 94) — E6.
import type { CatalogFeedV2 } from "@quy-hang/connect";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { chup, donDepV2, FEED, goi, goiV2, khuCua, sanCoToken } from "./chung";

after(donDepV2);

const T0 = "2026-11-09T08:00:00+07:00";

/** Thêm một tin cho khu thứ hai, để phép so «khu khác không đổi» có dữ liệu ở cả hai bảng. */
function coTinKhuHai(g: CatalogFeedV2): CatalogFeedV2 {
  const khu = g.subdivisions[1]!;
  g.publicListings.push({
    subdivisionKey: khu.subdivisionKey,
    measuredAt: T0,
    listings: [{ listingKey: "tin-mau-khu-hai", upi: khu.buildings[0]!.units[0]!.upi, listPrice: 6_000_000_000, feeInclusion: null, onMarketDate: "2026-11-01" }],
  });
  return g;
}

/** Gói sau: chỉ khu đầu, nội dung khác, mốc đo cho trước; đổi cả diện tích một căn. */
function goiSau(g: CatalogFeedV2, moc: string): CatalogFeedV2 {
  const s = structuredClone(g);
  s.marketStats = [{ ...s.marketStats[0]!, measuredAt: moc, segments: [{ ...s.marketStats[0]!.segments[0]!, bedroomsTotal: 3, listPriceMedian: 3_700_000_000 }] }];
  s.publicListings = [{ ...s.publicListings[0]!, measuredAt: moc, listings: [{ ...s.publicListings[0]!.listings[0]!, listingKey: "tin-sau-khi-doi", listPrice: 3_333_000_000 }] }];
  s.subdivisions[0]!.buildings[0]!.units[0]!.livingArea = 71;
  return s;
}

test("ảnh chụp: gói sau thay gói trước của cùng khu", async () => {
  const maTran = [
    { ten: "mới hơn", moc: "2026-11-09T09:00:00+07:00", thay: true },
    { ten: "bằng", moc: T0, thay: true },
    { ten: "cũ hơn", moc: "2026-11-09T07:00:00+07:00", thay: false },
  ];
  let soLan = 0;
  for (const [i, o] of maTran.entries()) {
    const t = await sanCoToken(`ac-${i}`);
    const g = coTinKhuHai(goiV2(`ac-${i}`));
    assert.equal((await goi("POST", FEED, { bearer: t.token, body: g })).status, 200, o.ten);
    const khu2 = khuCua(g)[1]!;
    const truocKhu2 = await chup([khu2]);
    assert.ok(truocKhu2.thiTruong.length === 1 && truocKhu2.tin.length === 1, "đối chứng: khu thứ hai có dữ liệu ở cả hai bảng");
    const sau = goiSau(g, o.moc);
    const res = await goi("POST", FEED, { bearer: t.token, body: sau });
    assert.equal(res.status, 200, `${o.ten}: ${JSON.stringify(await res.clone().json())}`);
    const b = (await res.json()) as { marketSnapshots: number; publicListingSnapshots: number; staleSnapshotsSkipped: number };
    assert.deepEqual([b.marketSnapshots, b.publicListingSnapshots, b.staleSnapshotsSkipped], o.thay ? [1, 1, 0] : [0, 0, 2], o.ten);
    const c = await chup([khuCua(g)[0]!]);
    assert.deepEqual(c.thiTruong[0]!.segments, (o.thay ? sau : g).marketStats[0]!.segments, `${o.ten}: đoạn`);
    assert.deepEqual(c.tin[0]!.listings, (o.thay ? sau : g).publicListings[0]!.listings, `${o.ten}: tin`);
    assert.ok(c.can.some((r) => Number(r.living_area) === 71), `${o.ten}: căn của gói vẫn phải cập nhật`);
    assert.deepEqual(await chup([khu2]), truocKhu2, `${o.ten}: khu thứ hai bị đổi`);
    soLan += 1;
  }
  assert.equal(soLan, maTran.length);
});

test("ảnh chụp: cùng thời điểm khác múi giờ", async () => {
  const t = await sanCoToken("ac-mg");
  const g = goiV2("ac-mg");
  assert.equal((await goi("POST", FEED, { bearer: t.token, body: g })).status, 200);
  const sau = goiSau(g, "2026-11-09T01:00:00Z");
  const res = await goi("POST", FEED, { bearer: t.token, body: sau });
  assert.equal(res.status, 200);
  assert.equal(((await res.json()) as { staleSnapshotsSkipped: number }).staleSnapshotsSkipped, 0);
  assert.deepEqual((await chup([khuCua(g)[0]!])).thiTruong[0]!.segments, sau.marketStats[0]!.segments);
});
