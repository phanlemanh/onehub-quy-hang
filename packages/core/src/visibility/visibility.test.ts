// Trục ai thấy hàng (hàng 12: AC-1, AC-2). Bảng ca viết tay — không sinh từ hàm đang kiểm.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { EventType, ListingEvent } from "../listing/events";
import { canRead, factsFromEvents, VISIBILITY_LEVELS, visibilityOf, type Visibility, type VisibilityFacts } from "./index";

const NGUOI_TAO = "u-tao";
const GIA = { listPrice: 3_500_000_000, feeInclusion: "excluded" };

/** Dãy sự kiện như API ghi: `created` của người tạo, rồi các bước; `"→X"` là đổi trạng thái sang X. */
function day(buoc: (string | [EventType, Record<string, unknown>])[]): ListingEvent[] {
  const ds: [EventType, Record<string, unknown>][] = [["created", { buildingName: "[Toà mẫu]" }]];
  for (const b of buoc) ds.push(typeof b === "string" ? ["status_changed", { to: b.slice(1) }] : b);
  return ds.map(([type, payload], i) => ({
    seq: i + 1,
    type,
    payload,
    actorUserId: i === 0 ? NGUOI_TAO : "u-khac",
    actorRoles: ["listing_agent"],
    confirmedWithOwner: false,
    occurredAt: `2026-10-${String(i + 1).padStart(2, "0")}T09:00:00.000Z`,
  }));
}

test("nấc: bảng dãy sự kiện viết trước", () => {
  // [tên ca, lối ADR-0008 phủ, các bước sau created, nấc mong]
  const BANG: [string, string, (string | [EventType, Record<string, unknown>])[], Visibility][] = [
    ["vừa tạo", "—", [], "Private"],
    ["có giá và điều kiện", "—", [["price_changed", GIA], ["details_changed", { legalStatus: "pink_book", occupantType: "vacant" }]], "Private"],
    ["Incomplete→Hold", "Incomplete→Hold", ["→Hold"], "Private"],
    ["Incomplete→Withdrawn", "Incomplete→Withdrawn", ["→Withdrawn"], "Private"],
    ["Incomplete→Hold→Withdrawn", "Hold→Withdrawn", ["→Hold", "→Withdrawn"], "Private"],
    ["Incomplete→Active", "Incomplete→Active", ["→Active"], "Company"],
    ["Incomplete→Hold→Active", "Hold→Active", ["→Hold", "→Active"], "Company"],
    ["Active→Pending", "Active→Pending", ["→Active", "→Pending"], "Company"],
    ["Active→Pending→Active", "Pending→Active", ["→Active", "→Pending", "→Active"], "Company"],
    ["Active→Pending→Closed", "Pending→Closed", ["→Active", "→Pending", "→Closed"], "Company"],
    ["Active→Pending→Withdrawn", "Pending→Withdrawn", ["→Active", "→Pending", "→Withdrawn"], "Company"],
    ["Active→Closed", "Active→Closed", ["→Active", "→Closed"], "Company"],
    ["Active→Hold", "Active→Hold", ["→Active", "→Hold"], "Company"],
    ["Active→Withdrawn", "Active→Withdrawn", ["→Active", "→Withdrawn"], "Company"],
    ["Active→Hold→Active", "Hold→Active", ["→Active", "→Hold", "→Active"], "Company"],
  ];
  let so = 0;
  for (const [ten, loi, buoc, mong] of BANG) {
    assert.equal(visibilityOf(factsFromEvents(day(buoc))), mong, `${ten} (lối ${loi}): nấc sai`);
    so++;
  }
  assert.equal(so, BANG.length);
  // Mọi lối vào hay ra khỏi Active của bảng 12 lối có ít nhất một dòng.
  const LOI_ACTIVE = ["Incomplete→Active", "Hold→Active", "Pending→Active", "Active→Pending", "Active→Closed", "Active→Hold", "Active→Withdrawn"];
  for (const l of LOI_ACTIVE) assert.ok(BANG.some(([, loi]) => loi === l), `bảng thiếu lối ${l}`);
});

test("nấc: chỉ hai giá trị", () => {
  assert.deepEqual([...VISIBILITY_LEVELS], ["Private", "Company"]);
});

test("nấc: người tạo là người của sự kiện created", () => {
  const f = factsFromEvents(day(["→Hold"]));
  assert.equal(f.creatorUserId, NGUOI_TAO);
  assert.throws(() => factsFromEvents([]), /created/);
});

const facts = (v: Visibility): VisibilityFacts => ({ creatorUserId: NGUOI_TAO, statusesReached: v === "Company" ? ["Active", "Hold"] : ["Hold"] });

test("quyền đọc: ma trận người xem × nấc viết trước", () => {
  // [người xem, nấc, đọc được]
  const MA_TRAN: [string, Visibility, boolean][] = [
    [NGUOI_TAO, "Private", true],
    [NGUOI_TAO, "Company", true],
    ["u-khac", "Company", true],
    ["u-khac", "Private", false],
  ];
  let so = 0;
  for (const [ai, nac, mong] of MA_TRAN) {
    assert.equal(canRead({ userId: ai, roles: ["listing_agent"] }, facts(nac)), mong, `${ai} xem ${nac}`);
    so++;
  }
  assert.equal(so, 4);
});

test("quyền đọc: vai không đổi kết quả", () => {
  for (const vai of ["company_admin", "team_lead", "listing_agent", "buyer_agent", "telesales"]) {
    assert.equal(canRead({ userId: "u-khac", roles: [vai] }, facts("Private")), false, `vai ${vai} mở được Chỉ tôi`);
  }
  assert.equal(canRead({ userId: "u-khac", roles: ["company_admin", "team_lead"] }, facts("Private")), false, "vai company_admin + team_lead mở được Chỉ tôi");
});

test("ai thấy hàng: đầu chủ giữ căn đọc hàng Chỉ tôi", () => {
  // Hàng 65a AC-11 — viết tay: người đọc × mức. Người tạo là Trưởng nhóm, đầu chủ giữ căn là người khác.
  const rieng: VisibilityFacts = { creatorUserId: "u-truong-nhom", statusesReached: [], listingAgentUserId: "u-dau-chu-a" };
  const san: VisibilityFacts = { ...rieng, statusesReached: ["Active"] };
  const CA: [string, string, VisibilityFacts, boolean][] = [
    ["người tạo", "u-truong-nhom", rieng, true],
    ["đầu chủ giữ căn", "u-dau-chu-a", rieng, true],
    ["thành viên khác", "u-dau-khach", rieng, false],
    ["sàn khác (chặn ở cơ sở dữ liệu, luật không mở)", "u-san-b", rieng, false],
    ["người tạo", "u-truong-nhom", san, true],
    ["đầu chủ giữ căn", "u-dau-chu-a", san, true],
    ["thành viên khác", "u-dau-khach", san, true],
    ["sàn khác (chặn ở cơ sở dữ liệu)", "u-san-b", san, true],
  ];
  let soLan = 0;
  for (const [ten, userId, f, mong] of CA) {
    assert.equal(canRead({ userId, roles: ["listing_agent"] }, f), mong, `${ten} · ${visibilityOf(f)}`);
    soLan++;
  }
  assert.equal(soLan, 8);
  // Đối chứng: chưa ai giữ căn (`null`) không mở cho ai ngoài người tạo.
  assert.equal(canRead({ userId: "u-dau-chu-a", roles: [] }, { ...rieng, listingAgentUserId: null }), false);
});
