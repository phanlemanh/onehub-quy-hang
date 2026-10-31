// Ô nhận lead và kiểm trùng ở lõi (hàng 24: AC-1, AC-2, AC-7). Số chủ là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { SOURCE_KEYS, STANDARD_STATUSES } from "../listing";
import {
  canDiscard,
  decideOutcome,
  leadResultView,
  OPEN_STATUSES,
  understoodPrice,
  validateLeadInput,
  type DedupeFacts,
  type LeadRecord,
} from ".";

const DU = {
  ownerPhone: "0900 000 031",
  buildingName: "Toà A",
  unitNumber: "A-02.06",
  need: "sale",
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  desiredListingTime: "now",
};

test("lead: năm mục đủ thì hợp lệ, số chuẩn hoá", () => {
  assert.deepEqual(validateLeadInput(DU), { ok: true, value: { ...DU, ownerPhone: "0900000031" } });
  for (const so of ["+84 900 000 031", "0900.000.031", "84900000031", "0900-000-031"]) {
    const r = validateLeadInput({ ...DU, ownerPhone: so });
    assert.ok(r.ok, so);
    assert.equal(r.value.ownerPhone, "0900000031", so);
  }
  // Chỉ biết toà: căn tuỳ chọn.
  const { unitNumber: _c, ...chiToa } = DU;
  const r = validateLeadInput(chiToa);
  assert.ok(r.ok);
  assert.equal(r.value.unitNumber, undefined);
});

test("lead: thiếu hay sai từng mục nêu đúng khoá", () => {
  const thieu = (k: keyof typeof DU) => {
    const p: Record<string, unknown> = { ...DU };
    delete p[k];
    return p;
  };
  // Bảng viết trước: mỗi dòng một mục sai, đúng một lỗi ở đúng khoá.
  const BANG: [string, Record<string, unknown>, string][] = [
    ["thiếu số chủ", thieu("ownerPhone"), "ownerPhone"],
    ["số 9 chữ số", { ...DU, ownerPhone: "090000003" }, "ownerPhone"],
    ["số có chữ", { ...DU, ownerPhone: "0900abc031" }, "ownerPhone"],
    ["thiếu toà", thieu("buildingName"), "buildingName"],
    ["toà rỗng", { ...DU, buildingName: "  " }, "buildingName"],
    ["căn rỗng", { ...DU, unitNumber: "" }, "unitNumber"],
    ["thiếu nhu cầu", thieu("need"), "need"],
    ["nhu cầu lạ", { ...DU, need: "buy" }, "need"],
    ["thiếu giá", thieu("listPrice"), "listPrice"],
    ["giá 0", { ...DU, listPrice: 0 }, "listPrice"],
    ["giá âm", { ...DU, listPrice: -1 }, "listPrice"],
    ["giá thập phân", { ...DU, listPrice: 1.5 }, "listPrice"],
    ["giá chuỗi", { ...DU, listPrice: "3200000000" }, "listPrice"],
    ["thiếu điều kiện phí", thieu("feeInclusion"), "feeInclusion"],
    ["điều kiện phí lạ", { ...DU, feeInclusion: "partial" }, "feeInclusion"],
    ["thiếu thời gian", thieu("desiredListingTime"), "desiredListingTime"],
    ["thời gian lạ", { ...DU, desiredListingTime: "next_year" }, "desiredListingTime"],
  ];
  let dem = 0;
  for (const [ten, p, khoa] of BANG) {
    const r = validateLeadInput(p);
    assert.equal(r.ok, false, ten);
    if (!r.ok) assert.deepEqual(r.errors.map((e) => e.path), [khoa], ten);
    dem++;
  }
  assert.equal(dem, 17);
  const rong = validateLeadInput({});
  assert.ok(!rong.ok);
  if (!rong.ok) assert.deepEqual(rong.errors.map((e) => e.path).sort(), ["buildingName", "desiredListingTime", "feeInclusion", "listPrice", "need", "ownerPhone"]);
});

test("lead: khoá lạ bị từ chối", () => {
  for (const k of ["ownerName", "floorPrice", "foo"]) {
    const r = validateLeadInput({ ...DU, [k]: "x" });
    assert.ok(!r.ok, k);
    if (!r.ok) assert.deepEqual(r.errors, [{ path: k, reason: "khoá lạ" }], k);
  }
});

test("kiểm trùng: bảng bốn ô của kết quả", () => {
  const HANG = { listingId: "hang-1", agentUserId: "dau-chu-cua-hang" };
  const CHU = "dau-chu-cua-chu-nha";
  // Ma trận viết trước: (hàng mở, đầu chủ của chủ nhà) → kết quả. Đầu chủ của hàng khác đầu chủ của chủ nhà để phân biệt.
  const BANG: [DedupeFacts, ReturnType<typeof decideOutcome>][] = [
    [{ openListing: HANG, ownerAgentUserId: CHU }, { outcome: "unit_has_open_listing", agentUserId: "dau-chu-cua-hang", listingId: "hang-1" }],
    [{ openListing: HANG, ownerAgentUserId: null }, { outcome: "unit_has_open_listing", agentUserId: "dau-chu-cua-hang", listingId: "hang-1" }],
    [{ openListing: null, ownerAgentUserId: CHU }, { outcome: "owner_has_agent", agentUserId: CHU, listingId: null }],
    [{ openListing: null, ownerAgentUserId: null }, { outcome: "new", agentUserId: null, listingId: null }],
  ];
  let dem = 0;
  for (const [facts, mong] of BANG) {
    assert.deepEqual(decideOutcome(facts), mong, `ô (hàng mở ${facts.openListing ? "có" : "không"}, đầu chủ ${facts.ownerAgentUserId ? "có" : "không"})`);
    dem++;
  }
  assert.equal(dem, 4);
});

test("kiểm trùng: hàng mở là bốn trạng thái chưa nấc cuối", () => {
  assert.deepEqual([...OPEN_STATUSES].sort(), ["Active", "Hold", "Incomplete", "Pending"]);
  assert.deepEqual(STANDARD_STATUSES.filter((s) => !OPEN_STATUSES.includes(s)).sort(), ["Closed", "Withdrawn"]);
});

/** Quét đệ quy: đường khoá nào nằm trong danh sách cấm, hay giá trị chuỗi nào chứa một mẩu cấm. */
function timRo(v: unknown, khoaCam: readonly string[], manhCam: readonly string[], duong = ""): string[] {
  if (typeof v === "string") return manhCam.some((m) => v.includes(m)) ? [duong] : [];
  if (!v || typeof v !== "object") return [];
  return Object.entries(v).flatMap(([k, con]) => {
    const d = duong ? `${duong}.${k}` : k;
    return [...(khoaCam.includes(k) ? [d] : []), ...timRo(con, khoaCam, manhCam, d)];
  });
}

const KHOA_HANG = ["matchedListingId", "listingId", "standardStatus", "version", "lastConfirmedAt", "closePrice", ...SOURCE_KEYS];
const MANH_SO = ["0900000031", "0900 000 031", "031"];

test("bản của telesales: không hàng, không số", () => {
  const lead: LeadRecord = {
    id: "lead-1",
    buildingName: "Toà A",
    unitNumber: "A-02.06",
    need: "sale",
    listPrice: 3_200_000_000,
    feeInclusion: "included",
    desiredListingTime: "now",
    outcome: "unit_has_open_listing",
    matchedAgentUserId: "dau-chu-1",
    matchedListingId: "hang-1",
    createdAt: "2026-10-31T00:00:00.000Z",
    discardedAt: null,
    ownerPhone: "0900000031",
  };
  const ban = leadResultView(lead, "[Mẫu] Đầu chủ 1");
  assert.deepEqual(ban, {
    id: "lead-1",
    outcome: "unit_has_open_listing",
    agentName: "[Mẫu] Đầu chủ 1",
    buildingName: "Toà A",
    unitNumber: "A-02.06",
    need: "sale",
    listPrice: 3_200_000_000,
    feeInclusion: "included",
    desiredListingTime: "now",
    createdAt: "2026-10-31T00:00:00.000Z",
    discarded: false,
  });
  assert.deepEqual(timRo(ban, KHOA_HANG, MANH_SO), []);
  // Đối chứng dương cùng hàm quét.
  assert.deepEqual(timRo({ a: { ownerPhone: "0900000031" } }, KHOA_HANG, MANH_SO), ["a.ownerPhone", "a.ownerPhone"]);
  assert.deepEqual(timRo({ b: "gọi 0900 000 031" }, KHOA_HANG, MANH_SO), ["b"]);
  // Lead không người nhận thì không tên, dù có truyền tên.
  assert.equal(leadResultView({ ...lead, outcome: "new", matchedAgentUserId: null, matchedListingId: null }, "[Tên]").agentName, null);
});

test("bỏ lead: chỉ căn trùng, chỉ một lần", () => {
  assert.deepEqual(canDiscard({ outcome: "unit_has_open_listing", discardedAt: null }), { ok: true });
  assert.deepEqual(canDiscard({ outcome: "unit_has_open_listing", discardedAt: "2026-10-31T00:00:00Z" }), { ok: false, reason: "already-discarded" });
  assert.deepEqual(canDiscard({ outcome: "owner_has_agent", discardedAt: null }), { ok: false, reason: "not-duplicate-unit" });
  assert.deepEqual(canDiscard({ outcome: "new", discardedAt: null }), { ok: false, reason: "not-duplicate-unit" });
});

test("giá: máy nói lại «Hiểu là…»", () => {
  assert.equal(understoodPrice(3_200_000_000, "included"), "3,2 tỷ, đã bao phí");
  assert.equal(understoodPrice(2_750_000_000, "excluded"), "2,75 tỷ, chưa bao phí");
  assert.equal(understoodPrice(18_000_000, "excluded"), "18 triệu, chưa bao phí");
});
