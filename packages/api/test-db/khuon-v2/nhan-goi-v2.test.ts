// Cửa nhận gói v2 trên Postgres thật (hàng 94) — E1, E2, E9, E13.
import type { CatalogFeedV2 } from "@quy-hang/connect";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { app, BASE_URL, canCua, chup, demNhatKy, donDepV2, dongNhatKy, FEED, goi, goiV2, khuCua, lechNhan, sanCoToken, sanMoi, soDong, themThoaThuan, tin } from "./chung";

after(donDepV2);

const docLoi = async (res: Response) => ((await res.json()) as { error: string }).error;
const dem = (g: CatalogFeedV2) => ({
  subdivisions: g.subdivisions.length,
  buildings: g.subdivisions.flatMap((s) => s.buildings).length,
  units: canCua(g).length,
});
async function sanPhien(ten: string) {
  const s = await sanMoi(ten);
  await tin(s.companyId);
  return { ...s, agreementId: await themThoaThuan(s.companyId) };
}
async function kiemGhiDu(g: CatalogFeedV2, agreementId: string, ten: string) {
  const c = await chup(khuCua(g));
  assert.equal(c.can.length, canCua(g).length, `${ten}: số căn`);
  assert.deepEqual(lechNhan(g, c.can), [], `${ten}: nhãn lệch`);
  assert.ok(c.can.every((r) => r.agreement_id === agreementId), `${ten}: thoả thuận của căn`);
  assert.equal(c.thiTruong.length, g.marketStats.length, `${ten}: số ảnh thị trường`);
  for (const m of g.marketStats) {
    const dong = c.thiTruong.find((r) => r.subdivision_key === m.subdivisionKey)!;
    assert.deepEqual(dong.segments, m.segments, `${ten}: đoạn của ${m.subdivisionKey}`);
    assert.equal(dong.agreement_id, agreementId);
  }
  assert.equal(c.tin.length, g.publicListings.length, `${ten}: số ảnh tin`);
  for (const m of g.publicListings) {
    const dong = c.tin.find((r) => r.subdivision_key === m.subdivisionKey)!;
    assert.deepEqual(dong.listings, m.listings, `${ten}: tin của ${m.subdivisionKey}`);
  }
}

test("v2: nhận gói mẫu bằng phiên và bằng token", async () => {
  const phien = await sanPhien("v2-p");
  const gP = goiV2("p");
  const resP = await goi("POST", FEED, { cookie: phien.cookie, body: gP });
  assert.equal(resP.status, 200, JSON.stringify(await resP.clone().json()));
  const mong = (g: CatalogFeedV2) => ({ ...dem(g), created: canCua(g).length, updated: 0, marketSnapshots: g.marketStats.length, publicListingSnapshots: g.publicListings.length, staleSnapshotsSkipped: 0 });
  assert.deepEqual(await resP.json(), mong(gP));
  await kiemGhiDu(gP, phien.agreementId, "phiên");

  const t = await sanCoToken("v2-t");
  const gT = goiV2("t");
  const resT = await goi("POST", FEED, { bearer: t.token, body: gT });
  assert.equal(resT.status, 200, JSON.stringify(await resT.clone().json()));
  assert.deepEqual(await resT.json(), mong(gT));
  await kiemGhiDu(gT, t.agreementId, "token");

  // Giá tiền tỷ giữ đúng từng đồng trong ảnh chụp.
  const c = await chup(khuCua(gT));
  const dauTien = (c.thiTruong[0]!.segments as { listPriceHigh: number }[])[0]!.listPriceHigh;
  assert.equal(dauTien, gT.marketStats.find((m) => m.subdivisionKey === c.thiTruong[0]!.subdivision_key)!.segments[0]!.listPriceHigh);
  assert.ok(dauTien > 2 ** 31, "đối chứng: giá thử vượt số nguyên 32 bit");
  // Chiều đỏ: bản ghi thiếu nhãn thì phép so đỏ và nêu UPI.
  const hong = c.can.map((r, i) => (i === 0 ? { ...r, field_confidence: null } : r));
  assert.deepEqual(lechNhan(gT, hong), [String(c.can[0]!.upi)]);
});

test("v2: đẩy lại không nhân đôi", async () => {
  const t = await sanCoToken("v2-lai");
  const g = goiV2("lai");
  const dau = await goi("POST", FEED, { bearer: t.token, body: g });
  assert.equal(dau.status, 200);
  assert.ok(((await dau.json()) as { created: number }).created > 0, "đối chứng: lần đầu phải có căn mới");
  const truoc = soDong(await chup(khuCua(g)));
  const lai = await goi("POST", FEED, { bearer: t.token, body: g });
  assert.equal(lai.status, 200);
  const b = (await lai.json()) as { created: number; updated: number };
  assert.deepEqual([b.created, b.updated], [0, 0]);
  assert.equal(soDong(await chup(khuCua(g))), truoc, "gửi lại nhân đôi dòng");
});

test("v2: gói rỗng", async () => {
  const t = await sanCoToken("v2-rong");
  const res = await goi("POST", FEED, { bearer: t.token, body: { ...goiV2("rong"), subdivisions: [], marketStats: [], publicListings: [] } });
  assert.equal(res.status, 200, JSON.stringify(await res.clone().json()));
  assert.deepEqual(await res.json(), { subdivisions: 0, buildings: 0, units: 0, created: 0, updated: 0, marketSnapshots: 0, publicListingSnapshots: 0, staleSnapshotsSkipped: 0 });
});

/** Bản v1 của cùng gói: bỏ nhãn và hai phần mới. */
function banV1(g: CatalogFeedV2): Record<string, unknown> {
  const c = structuredClone(g) as unknown as { schemaVersion: number; marketStats?: unknown; publicListings?: unknown; subdivisions: { buildings: { units: { fieldConfidence?: unknown }[] }[] }[] };
  c.schemaVersion = 1;
  delete c.marketStats;
  delete c.publicListings;
  for (const s of c.subdivisions) for (const b of s.buildings) for (const u of b.units) delete u.fieldConfidence;
  return c as unknown as Record<string, unknown>;
}

test("v1: phản hồi giữ tập khoá cũ", async () => {
  const s = await sanPhien("v1-khoa");
  const res = await goi("POST", FEED, { cookie: s.cookie, body: banV1(goiV2("v1-khoa")) });
  assert.equal(res.status, 200, JSON.stringify(await res.clone().json()));
  assert.deepEqual(Object.keys((await res.json()) as object).sort(), ["buildings", "created", "subdivisions", "units", "updated"]);
});

test("v1 ghi lại căn thì xoá nhãn", async () => {
  const s = await sanPhien("v1-nhan");
  const g = goiV2("v1-nhan");
  assert.equal((await goi("POST", FEED, { cookie: s.cookie, body: g })).status, 200);
  const truoc = await chup(khuCua(g));
  assert.ok(truoc.can.every((r) => r.field_confidence !== null), "đối chứng: trước khi gửi v1 phải có nhãn");
  const res = await goi("POST", FEED, { cookie: s.cookie, body: banV1(g) });
  assert.equal(res.status, 200);
  assert.equal(((await res.json()) as { updated: number }).updated, canCua(g).length, "đổi nhãn tính là cập nhật");
  const sau = await chup(khuCua(g));
  assert.ok(sau.can.every((r) => r.field_confidence === null), "gói v1 phải xoá nhãn");
  assert.deepEqual(sau.can.map((r) => r.living_area), truoc.can.map((r) => r.living_area), "giá trị đúng theo v1");
  assert.deepEqual(sau.thiTruong.map((r) => r.segments), truoc.thiTruong.map((r) => r.segments), "gói v1 không đụng ảnh chụp");
});

test("phiên bản lạ qua cửa nhận", async () => {
  const s = await sanPhien("v-la");
  const maTran: unknown[] = [0, 3, "2", undefined];
  let soLan = 0;
  for (const [i, v] of maTran.entries()) {
    const g = goiV2(`v-la-${i}`);
    const than: Record<string, unknown> = { ...g, schemaVersion: v };
    if (v === undefined) delete than.schemaVersion;
    const res = await goi("POST", FEED, { cookie: s.cookie, body: than });
    assert.equal(res.status, 422, `schemaVersion ${String(v)}`);
    assert.equal(await docLoi(res), "invalid-feed");
    assert.equal(soDong(await chup(khuCua(g))), 0, `schemaVersion ${String(v)}: có dòng ghi`);
    soLan += 1;
  }
  assert.equal(soLan, 4);
});

test("cấm: cả gói không vào", async () => {
  const t = await sanCoToken("cam");
  const g = goiV2("cam");
  /** Đổi UPI của tin cuối và của chính căn nó trỏ tới, nên chỉ còn hậu tố là khác gói lành. */
  const voiHauTo = (hauTo: string) => {
    const c = structuredClone(g) as unknown as CatalogFeedV2;
    const tinCuoi = c.publicListings[0]!.listings.at(-1)!;
    const can = canCua(c).find((u) => u.upi === tinCuoi.upi)!;
    can.upi = tinCuoi.upi = `${tinCuoi.upi}${hauTo}`;
    return c;
  };
  const res1 = await goi("POST", FEED, { bearer: t.token, body: voiHauTo(":0900000012") });
  assert.equal(res1.status, 422);
  const than1 = (await res1.json()) as { error: string; errors: { path: (string | number)[]; message: string }[] };
  assert.equal(than1.error, "invalid-feed");
  const duong = ["publicListings", 0, "listings", g.publicListings[0]!.listings.length - 1, "upi"].join("/");
  assert.ok(than1.errors.some((e) => e.path.join("/") === duong && /dáng số điện thoại/.test(e.message)), `phải do lưới giá trị: ${JSON.stringify(than1.errors)}`);
  assert.equal(soDong(await chup(khuCua(g))), 0, "giá trị cấm: có dòng ghi");

  const khoa = structuredClone(g) as unknown as { publicListings: { listings: Record<string, unknown>[] }[] };
  khoa.publicListings[0]!.listings.at(-1)!.sourceUrl = "[Mẫu]";
  const res2 = await goi("POST", FEED, { bearer: t.token, body: khoa });
  assert.equal(res2.status, 422);
  const than2 = (await res2.json()) as { errors: { message: string }[] };
  assert.ok(than2.errors.some((e) => e.message.includes("sourceUrl")), `phải do khoá lạ: ${JSON.stringify(than2.errors)}`);
  assert.equal(soDong(await chup(khuCua(g))), 0, "khoá cấm: có dòng ghi");

  // Đối chứng: cùng cách đổi nhưng hậu tố sạch thì nhận, nên lý do từ chối ở trên chính là giá trị cấm.
  assert.equal((await goi("POST", FEED, { bearer: t.token, body: voiHauTo(":khac") })).status, 200);
  assert.ok(soDong(await chup(khuCua(g))) > 0);
});

test("mốc đo lạ qua cửa nhận", async () => {
  const t = await sanCoToken("moc");
  const g = goiV2("moc");
  const sai = structuredClone(g);
  sai.marketStats[0]!.measuredAt = "2026-11-09T08:00:00+99:00";
  const res = await goi("POST", FEED, { bearer: t.token, body: sai });
  assert.equal(res.status, 422, "phải là lỗi khuôn, không phải lỗi máy chủ");
  assert.equal(await docLoi(res), "invalid-feed");
  assert.equal(soDong(await chup(khuCua(g))), 0);
  assert.equal((await goi("POST", FEED, { bearer: t.token, body: g })).status, 200, "đối chứng");
});

test("v2 trên đường token: nhật ký", async () => {
  const t = await sanCoToken("nk");
  assert.equal((await goi("POST", FEED, { bearer: t.token, body: goiV2("nk") })).status, 200);
  assert.equal(await demNhatKy(t.tokenId), 1);
  const sai = { ...goiV2("nk-sai"), marketStats: [{ subdivisionKey: "khu-la", measuredAt: "2026-11-09T08:00:00+07:00", segments: [] }] };
  assert.equal((await goi("POST", FEED, { bearer: t.token, body: sai })).status, 422);
  const dong = await dongNhatKy(t.tokenId);
  assert.equal(dong.length, 2);
  assert.deepEqual(dong.map((r) => [r.outcome, r.http_status]).sort(), [["accepted", 200], ["invalid_payload", 422]]);
  assert.ok(dong.every((r) => r.token_id === t.tokenId && r.agreement_id === t.agreementId));
});

test("OpenAPI khai phản hồi v2", async () => {
  const doc = (await (await app.request(`${BASE_URL}/api/v1/openapi.json`)).json()) as {
    paths: Record<string, { post: { responses: Record<string, { content: Record<string, { schema: { $ref: string } }> }> } }>;
    components: { schemas: Record<string, { properties: Record<string, unknown> }> };
  };
  const ref = doc.paths[FEED]!.post.responses["200"]!.content["application/json"]!.schema.$ref.split("/").pop()!;
  const cot = Object.keys(doc.components.schemas[ref]!.properties);
  for (const k of ["marketSnapshots", "publicListingSnapshots", "staleSnapshotsSkipped"]) assert.ok(cot.includes(k), `thiếu ${k}`);
});
