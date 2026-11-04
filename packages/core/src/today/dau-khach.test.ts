// Hôm nay của đầu khách (hàng 37: AC-2, AC-3, AC-4 — E4). Bảng viết trước.
import assert from "node:assert/strict";
import { test } from "node:test";
import { dungTin, khopBoDaGui, ngayVN, type CanTrongBo, type VaoDungTin } from "./dau-khach";

const TY = 1_000_000_000;

test("khớp bộ đã gửi", () => {
  const bo = [{ id: "goc", buildingName: "Toà A", bedroomsTotal: 2, gia: 3 * TY }];
  const trongBo = new Set(["goc"]);
  const ung = (id: string, buildingName: string, bedroomsTotal: number, listPrice: number) => ({ id, buildingName, bedroomsTotal, listPrice });
  const BANG: [string, boolean][] = [
    ["a-32", khopBoDaGui(ung("a-32", "Toà A", 2, 3.2 * TY), bo, trongBo)],
    ["a-36", khopBoDaGui(ung("a-36", "Toà A", 2, 3.6 * TY), bo, trongBo)],
    ["a-3pn", khopBoDaGui(ung("a-3pn", "Toà A", 3, 3 * TY), bo, trongBo)],
    ["b-30", khopBoDaGui(ung("b-30", "Toà B", 2, 3 * TY), bo, trongBo)],
    ["goc", khopBoDaGui(ung("goc", "Toà A", 2, 3 * TY), bo, trongBo)],
    ["gốc không giá", khopBoDaGui(ung("a-30", "Toà A", 2, 3 * TY), [{ ...bo[0]!, gia: null }], trongBo)],
  ];
  assert.deepEqual(BANG, [
    ["a-32", true],
    ["a-36", false],
    ["a-3pn", false],
    ["b-30", false],
    ["goc", false],
    ["gốc không giá", false],
  ]);
  assert.equal(BANG.length, 6, "số dòng viết trước");
});

test("ngày Việt Nam", () => {
  assert.equal(ngayVN("2026-11-03T23:30:00Z"), "2026-11-04");
  assert.equal(ngayVN("2026-11-03T16:59:59Z"), "2026-11-03");
});

const can = (id: string, o: Partial<CanTrongBo> = {}): CanTrongBo => ({ id, name: `Toà A · ${id}`, buildingName: "Toà A", bedroomsTotal: 2, giaLucGui: 3 * TY, suSau: [], suSauAt: null, ...o });

test("dựng tin", () => {
  const bay = new Date("2026-11-04T12:00:00Z");
  const vao: VaoDungTin = {
    shares: [
      {
        id: "s1",
        recipient: "[Tên] khách 1",
        createdAt: "2026-11-02T01:00:00Z",
        disabledAt: null,
        listings: [
          can("c1"),
          can("c2", { suSau: [{ type: "price_changed", payload: { listPrice: 2.9 * TY } }, { type: "status_changed", payload: { to: "Pending" } }], suSauAt: "2026-11-04T02:00:00Z" }),
          can("c3"),
        ],
      },
      { id: "s2", recipient: "[Tên] khách 2", createdAt: "2026-11-02T02:00:00Z", disabledAt: "2026-11-03T05:00:00Z", listings: [can("d1", { suSau: [{ type: "price_changed", payload: { listPrice: 2.5 * TY } }], suSauAt: "2026-11-03T06:00:00Z" })] },
      { id: "s3", recipient: "[Tên] khách 3", createdAt: "2026-11-02T03:00:00Z", disabledAt: null, listings: [can("e1", { giaLucGui: 3.1 * TY })] },
    ],
    events: [
      { shareId: "s1", type: "link_opened", listingId: null, createdAt: "2026-11-04T01:00:00Z" },
      { shareId: "s1", type: "link_opened", listingId: null, createdAt: "2026-11-04T01:10:00Z" },
      { shareId: "s1", type: "interest", listingId: "c3", createdAt: "2026-11-04T01:20:00Z" },
      { shareId: "s1", type: "interest", listingId: "c1", createdAt: "2026-11-04T01:30:00Z" },
      { shareId: "s1", type: "link_opened", listingId: null, createdAt: "2026-11-02T23:30:00Z" },
      { shareId: "s2", type: "link_opened", listingId: null, createdAt: "2026-11-03T04:00:00Z" },
      { shareId: "s1", type: "link_opened", listingId: null, createdAt: "2026-10-20T01:00:00Z" },
    ],
    activeSau: [
      { id: "m1", name: "Toà A · m1", buildingName: "Toà A", bedroomsTotal: 2, listPrice: 3.05 * TY, activeAt: "2026-11-03T09:00:00Z" },
      { id: "m2", name: "Toà A · m2", buildingName: "Toà A", bedroomsTotal: 2, listPrice: 3 * TY, activeAt: "2026-11-01T09:00:00Z" },
      { id: "m3", name: "Toà B · m3", buildingName: "Toà B", bedroomsTotal: 2, listPrice: 3 * TY, activeAt: "2026-11-03T10:00:00Z" },
    ],
  };
  const s1 = { id: "s1", recipient: "[Tên] khách 1" };
  assert.deepEqual(dungTin(vao, bay), [
    { kind: "changed", at: "2026-11-04T02:00:00Z", day: "2026-11-04", share: s1, listing: { id: "c2", name: "Toà A · c2" }, changed: { status: { to: "Pending" } } },
    { kind: "reaction", at: "2026-11-04T01:30:00Z", day: "2026-11-04", share: s1, opens: 2, interested: [{ id: "c1", name: "Toà A · c1" }, { id: "c3", name: "Toà A · c3" }] },
    // m1 khớp hai bộ còn mở → một tin, người nhận theo thứ tự gửi; m2 lên bán trước lúc gửi, m3 khác toà → không tin.
    { kind: "new_match", at: "2026-11-03T09:00:00Z", day: "2026-11-03", shares: [s1, { id: "s3", recipient: "[Tên] khách 3" }], listing: { id: "m1", name: "Toà A · m1" }, listPrice: 3.05 * TY },
    // Link s2 đã tắt: phản ứng trước lúc tắt vẫn hiện, căn đổi giá không sinh tin «Vừa đổi».
    { kind: "reaction", at: "2026-11-03T04:00:00Z", day: "2026-11-03", share: { id: "s2", recipient: "[Tên] khách 2" }, opens: 1, interested: [] },
    // 23:30 UTC ngày 2 là ngày 3 giờ Việt Nam; lượt mở cũ hơn 7 ngày không sinh tin.
    { kind: "reaction", at: "2026-11-02T23:30:00Z", day: "2026-11-03", share: s1, opens: 1, interested: [] },
  ]);
});

test("dựng tin: căn trở lại Đang bán sau Pending là căn mới", () => {
  const vao: VaoDungTin = {
    shares: [{ id: "s1", recipient: "[Tên] khách 1", createdAt: "2026-11-02T01:00:00Z", disabledAt: null, listings: [can("c1")] }],
    events: [],
    activeSau: [{ id: "r1", name: "Toà A · r1", buildingName: "Toà A", bedroomsTotal: 2, listPrice: 3 * TY, activeAt: "2026-11-03T09:00:00Z" }],
  };
  assert.deepEqual(dungTin(vao, new Date("2026-11-04T00:00:00Z")).map((t) => [t.kind, "listing" in t ? t.listing.id : null]), [["new_match", "r1"]]);
});
