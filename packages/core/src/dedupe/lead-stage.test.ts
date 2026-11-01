// Bốn nấc của lead đã nhập ở lõi (hàng 27: AC-1). Số chủ là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AWAITING_ROUTING_LABEL,
  LEAD_STAGE_LABELS,
  leadStage,
  MY_LEAD_VIEW_KEYS,
  myLeadView,
  RETURN_REASON_LABEL,
  type LeadStageFacts,
  type MyLeadRecord,
} from ".";

const T = "2026-11-01T02:00:00.000Z";
const NGUOI = "u-dau-chu-1";
const GOC: LeadStageFacts = {
  outcome: "new",
  matchedAgentUserId: null,
  routedAt: null,
  acceptedAt: null,
  firstCalledAt: null,
  boardAt: null,
  returnedAt: null,
  resubmittedAt: null,
  discardedAt: null,
};

test("nấc: bảng viết trước", () => {
  const coNguoi = { matchedAgentUserId: NGUOI, routedAt: T };
  // [tên dòng, dữ kiện, trạng thái mong đợi, chờ chia]
  const BANG: [string, Partial<LeadStageFacts>, string, boolean][] = [
    ["mới nhập, chưa chia", {}, "sent", true],
    ["đã chia, chưa nhận", coNguoi, "sent", false],
    ["chủ trùng, có người ngay lúc nhập", { outcome: "owner_has_agent", matchedAgentUserId: NGUOI }, "sent", false],
    ["đã nhận", { ...coNguoi, acceptedAt: T }, "accepted", false],
    ["gọi thắng nhận", { ...coNguoi, acceptedAt: T, firstCalledAt: T }, "called", false],
    ["lên bảng thắng gọi", { ...coNguoi, acceptedAt: T, firstCalledAt: T, boardAt: T }, "on_board", false],
    ["trả lại khi chưa gọi", { ...coNguoi, returnedAt: T }, "returned", false],
    ["trả lại sau khi gọi", { ...coNguoi, acceptedAt: T, firstCalledAt: T, returnedAt: T }, "returned", false],
    ["trả lại rồi hàng lên bảng", { ...coNguoi, returnedAt: T, boardAt: T }, "returned", false],
    ["gửi lại thắng trả lại", { ...coNguoi, returnedAt: T, resubmittedAt: T }, "resubmitted", false],
    ["căn trùng là tin bổ sung", { outcome: "unit_has_open_listing", matchedAgentUserId: NGUOI }, "supplement", false],
    ["căn trùng không chờ chia dù chưa có người", { outcome: "unit_has_open_listing" }, "supplement", false],
    ["bỏ thắng căn trùng", { outcome: "unit_has_open_listing", discardedAt: T }, "discarded", false],
    ["gửi lại thắng bỏ", { discardedAt: T, resubmittedAt: T }, "resubmitted", false],
    ["căn trùng thắng trả lại", { outcome: "unit_has_open_listing", returnedAt: T }, "supplement", false],
  ];
  let so = 0;
  for (const [ten, d, nac, cho] of BANG) {
    const f = { ...GOC, ...d };
    assert.deepEqual(leadStage(f), nac, `dòng «${ten}»`);
    const v = myLeadView({ ...ban(), ...f, resubmittedLeadId: null }, "[Tên]");
    assert.deepEqual([v.stage, v.awaitingRouting], [nac, cho], `dòng «${ten}» (bản telesales)`);
    so++;
  }
  assert.equal(so, BANG.length);
  assert.equal(so, 15);
});

test("nấc: nhãn tiếng Việt", () => {
  assert.deepEqual(LEAD_STAGE_LABELS, {
    sent: "Đã gửi",
    accepted: "Đã nhận",
    called: "Đã gọi",
    on_board: "Lên bảng",
    returned: "Trả lại",
    resubmitted: "Đã gửi lại",
    supplement: "Tin bổ sung",
    discarded: "Đã bỏ",
  });
  assert.equal(AWAITING_ROUTING_LABEL, "Chờ chia");
  assert.equal(RETURN_REASON_LABEL, "Số không liên lạc được");
});

function ban(): MyLeadRecord {
  return {
    id: "l-1",
    outcome: "new",
    matchedAgentUserId: NGUOI,
    matchedListingId: "h-1",
    ownerPhone: "0900 000 031",
    buildingName: "Toà A",
    unitNumber: "A-02.06",
    need: "sale",
    listPrice: 3_200_000_000,
    feeInclusion: "included",
    desiredListingTime: "now",
    createdAt: T,
    discardedAt: null,
    routedAt: T,
    acceptedAt: null,
    firstCalledAt: null,
    boardAt: null,
    returnedAt: T,
    resubmittedAt: null,
    resubmittedLeadId: null,
  };
}

test("nấc: bản của telesales không có số, không hàng", () => {
  const v = myLeadView(ban(), "[Tên]");
  assert.deepEqual(Object.keys(v), [...MY_LEAD_VIEW_KEYS]);
  assert.deepEqual(Object.keys(v), [
    "id",
    "outcome",
    "agentName",
    "buildingName",
    "unitNumber",
    "need",
    "listPrice",
    "feeInclusion",
    "desiredListingTime",
    "createdAt",
    "discarded",
    "stage",
    "awaitingRouting",
    "routedAt",
    "acceptedAt",
    "firstCalledAt",
    "boardAt",
    "returnedAt",
    "returnReason",
    "resubmittedAt",
    "resubmittedLeadId",
  ]);
  assert.ok(!("ownerPhone" in v) && !("matchedListingId" in v) && !("matchedAgentUserId" in v));
  assert.ok(!JSON.stringify(v).includes("000 031"));
  assert.equal(v.stage, "returned");
  assert.equal(v.returnReason, "Số không liên lạc được");
  assert.equal(v.agentName, "[Tên]");
  assert.equal(myLeadView({ ...ban(), matchedAgentUserId: null }, "[Tên]").agentName, null);
});
