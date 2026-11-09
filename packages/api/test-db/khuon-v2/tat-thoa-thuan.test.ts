// Tắt thoả thuận thì dừng nhận gói v2 (hàng 94) — E10.
import { OpenAPIHono } from "@hono/zod-openapi";
import type { CatalogFeedV2 } from "@quy-hang/connect";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { registerFeedRoutes, type FeedHooks } from "../../src/catalog/feeds";
import { appPool, boTin, choQuaHan, chup, deps, doiTrangThai, donDepV2, FEED, goi, goiV2, khuCua, sanCoToken } from "./chung";

after(donDepV2);

/** Cùng khoá khu với gói đầu, nội dung khác: nếu lọt thì ghi đè được. */
function goiKhac(g: CatalogFeedV2): CatalogFeedV2 {
  const s = structuredClone(g);
  s.marketStats = s.marketStats.map((m) => ({ ...m, measuredAt: "2026-11-09T10:00:00+07:00", segments: m.segments.map((d) => ({ ...d, listingCount: d.listingCount + 1 })) }));
  s.publicListings = s.publicListings.map((m) => ({ ...m, measuredAt: "2026-11-09T10:00:00+07:00", listings: [] }));
  s.subdivisions[0]!.buildings[0]!.units[0]!.fieldConfidence.floor = "inferred";
  return s;
}
const docLoi = async (res: Response) => ((await res.json()) as { error: string }).error;
type San = Awaited<ReturnType<typeof sanCoToken>>;
type Duong = { ten: "phiên" | "token"; than: (s: San) => { cookie?: string; bearer?: string } };
const DUONG: Duong[] = [
  { ten: "phiên", than: (s) => ({ cookie: s.cookie }) },
  { ten: "token", than: (s) => ({ bearer: s.token }) },
];

test("tắt thoả thuận: dừng nhận v2", async () => {
  type O = { ten: string; tat: (s: San) => unknown; ma: Record<Duong["ten"], string> };
  const INACTIVE = { phiên: "agreement-inactive", token: "agreement-inactive" };
  const maTran: O[] = [
    { ten: "paused", tat: (s) => doiTrangThai(s.agreementId, "paused"), ma: INACTIVE },
    { ten: "ended", tat: (s) => doiTrangThai(s.agreementId, "ended"), ma: INACTIVE },
    { ten: "quá hạn", tat: (s) => choQuaHan(s.agreementId), ma: INACTIVE },
    { ten: "sai loại", tat: (s) => appPool.query("update agreements set kind = 'lead_source' where id = $1", [s.agreementId]), ma: { phiên: "agreement-inactive", token: "token-scope" } },
    { ten: "rời danh sách tin", tat: (s) => boTin(s.companyId), ma: INACTIVE },
  ];
  let soLan = 0;
  for (const [i, o] of maTran.entries()) {
    for (const d of DUONG) {
      const tag = `tat-${i}-${d.ten === "token" ? "t" : "p"}`;
      const s = await sanCoToken(tag);
      const g = goiV2(tag);
      // Đối chứng dương ngay trước: khu nhờ đó đã có ảnh chụp.
      assert.equal((await goi("POST", FEED, { ...d.than(s), body: g })).status, 200, `${o.ten}/${d.ten}: đối chứng`);
      const truoc = await chup(khuCua(g));
      assert.ok(truoc.thiTruong.length > 0 && truoc.tin.length > 0, "đối chứng: đã có ảnh chụp");
      await o.tat(s);
      const res = await goi("POST", FEED, { ...d.than(s), body: goiKhac(g) });
      assert.equal(res.status, 403, `${o.ten}/${d.ten}`);
      assert.equal(await docLoi(res), o.ma[d.ten], `${o.ten}/${d.ten}`);
      assert.deepEqual(await chup(khuCua(g)), truoc, `${o.ten}/${d.ten}: nội dung bị đổi`);
      soLan += 1;
    }
  }
  assert.equal(soLan, maTran.length * DUONG.length);
});

test("tắt giữa lúc kiểm và ghi", async () => {
  let soLan = 0;
  for (const d of DUONG) {
    const tag = `giua-${d.ten === "token" ? "t" : "p"}`;
    const s = await sanCoToken(tag);
    const g = goiV2(tag);
    let daChay = false;
    const hooks: FeedHooks = {
      truocKhiGhi: async () => {
        await doiTrangThai(s.agreementId, "paused");
        daChay = true;
      },
    };
    const a = new OpenAPIHono();
    registerFeedRoutes(a, deps, hooks);
    const res = await goi("POST", FEED, { ...d.than(s), body: g, a });
    assert.ok(daChay, "móc phải chạy");
    assert.equal(res.status, 403, d.ten);
    assert.equal(await docLoi(res), "agreement-inactive", d.ten);
    const c = await chup(khuCua(g));
    assert.deepEqual([c.can.length, c.thiTruong.length, c.tin.length], [0, 0, 0], `${d.ten}: có phần của gói đã vào`);
    soLan += 1;
  }
  assert.equal(soLan, DUONG.length);
});
