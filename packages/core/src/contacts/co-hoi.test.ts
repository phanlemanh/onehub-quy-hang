// Bảng pha cơ hội (hàng 103, AC-6 — E6) và nhà Liên hệ (AC-1 — E1b).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { LeadState } from "../dedupe/lead-stage";
import type { StandardStatus } from "../listing/status";
import { navigationFor } from "../navigation";
import { laMo, PHA_NHAN, phaLead, phaNhuCau, type Pha } from "./co-hoi";

test("cơ hội: bảng pha", () => {
  const BANG: [string, Pha, Pha][] = [
    ["lead sent", phaLead("sent", null), "cultivate"],
    ["lead accepted", phaLead("accepted", null), "cultivate"],
    ["lead called", phaLead("called", null), "appointment"],
    ["on_board + Incomplete", phaLead("on_board", "Incomplete"), "active"],
    ["on_board + Active", phaLead("on_board", "Active"), "active"],
    ["on_board + Pending", phaLead("on_board", "Pending"), "under_contract"],
    ["on_board + Closed", phaLead("on_board", "Closed"), "closed"],
    ["returned", phaLead("returned" as LeadState, null), "closed_out"],
    ["discarded", phaLead("discarded" as LeadState, null), "closed_out"],
    ["on_board + Withdrawn", phaLead("on_board", "Withdrawn" as StandardStatus), "closed_out"],
    ["prospect mở", phaNhuCau(false), "cultivate"],
    ["prospect đóng", phaNhuCau(true), "closed_out"],
  ];
  let so = 0;
  for (const [ten, co, mong] of BANG) {
    assert.equal(co, mong, ten);
    so++;
  }
  assert.equal(so, 12, "số dòng bảng viết trước");
  assert.deepEqual(PHA_NHAN, {
    cultivate: "Mới",
    appointment: "Đã gọi",
    active: "Đang chào",
    under_contract: "Đang giao dịch",
    closed: "Đã chốt",
    closed_out: "Đã đóng",
  });
  assert.deepEqual((Object.keys(PHA_NHAN) as Pha[]).filter(laMo), ["cultivate", "appointment", "active", "under_contract", "closed"]);
});

test("điều hướng: nhà Liên hệ", () => {
  const BANG: [string[], boolean][] = [
    [["listing_agent"], true],
    [["team_lead"], true],
    [["telesales"], false],
    [["buyer_agent"], false],
    [["company_admin"], false],
    [["buyer_agent", "listing_agent"], true],
  ];
  let so = 0;
  for (const [vai, co] of BANG) {
    assert.equal(navigationFor(vai).homes.includes("contacts"), co, vai.join("+"));
    so++;
  }
  assert.equal(so, 6, "số dòng bảng viết trước");
});
