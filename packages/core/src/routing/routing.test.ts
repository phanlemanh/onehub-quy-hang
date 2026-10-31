// Chia lead và hạn ở lõi (hàng 25: AC-1, AC-2). Bảng ca viết trước; mỗi dòng một lần so.
import assert from "node:assert/strict";
import { test } from "node:test";
import { chooseAgent, DEFAULT_LEAD_DEADLINES, dueAlerts, sameBuilding, type DeadlineFact, type RoutingCandidate } from ".";

const nguoi = (userId: string, o: Partial<RoutingCandidate> = {}): RoutingCandidate => ({
  userId,
  roles: ["listing_agent"],
  zoneNames: ["Toà A"],
  onLeave: false,
  joinedAt: "2026-10-01T00:00:00Z",
  lastRoutedSeq: null,
  ...o,
});

test("chia: bảng chọn người viết trước", () => {
  const bang: { ten: string; prior: string | null; toa: string; ung: RoutingCandidate[]; ra: ReturnType<typeof chooseAgent> }[] = [
    {
      ten: "người của lead cùng số thắng người phụ trách toà",
      prior: "cu",
      toa: "Toà A",
      ung: [nguoi("a"), nguoi("cu", { zoneNames: ["Toà B"], lastRoutedSeq: 9 })],
      ra: { userId: "cu", reason: "same_owner" },
    },
    {
      ten: "người của lead cùng số đang nghỉ thì về người phụ trách toà",
      prior: "cu",
      toa: "Toà A",
      ung: [nguoi("a"), nguoi("cu", { onLeave: true })],
      ra: { userId: "a", reason: "building" },
    },
    {
      ten: "người của lead cùng số mất vai đầu chủ thì về người phụ trách toà",
      prior: "cu",
      toa: "Toà A",
      ung: [nguoi("a"), nguoi("cu", { roles: ["buyer_agent"] })],
      ra: { userId: "a", reason: "building" },
    },
    {
      ten: "người nghỉ bị bỏ qua",
      prior: null,
      toa: "Toà A",
      ung: [nguoi("nghi", { onLeave: true }), nguoi("lam", { lastRoutedSeq: 50 })],
      ra: { userId: "lam", reason: "building" },
    },
    {
      ten: "số thứ tự chia nhỏ nhất thắng",
      prior: null,
      toa: "Toà A",
      ung: [nguoi("moi", { lastRoutedSeq: 7 }), nguoi("cu", { lastRoutedSeq: 3 })],
      ra: { userId: "cu", reason: "building" },
    },
    {
      ten: "chưa nhận lần nào đứng đầu",
      prior: null,
      toa: "Toà A",
      ung: [nguoi("da", { lastRoutedSeq: 1 }), nguoi("chua")],
      ra: { userId: "chua", reason: "building" },
    },
    {
      ten: "hoà thì người vào sàn trước",
      prior: null,
      toa: "Toà A",
      ung: [nguoi("sau", { joinedAt: "2026-10-02T00:00:00Z" }), nguoi("truoc", { joinedAt: "2026-10-01T00:00:00Z" })],
      ra: { userId: "truoc", reason: "building" },
    },
    {
      ten: "telesales hay trưởng nhóm có khu trùng toà không được chọn",
      prior: null,
      toa: "Toà A",
      ung: [nguoi("ts", { roles: ["telesales"] }), nguoi("tn", { roles: ["team_lead"] })],
      ra: { userId: null, reason: "no_agent_for_building" },
    },
    {
      ten: "người phụ trách toà khác không được chọn",
      prior: null,
      toa: "Toà A",
      ung: [nguoi("b", { zoneNames: ["Toà B"] })],
      ra: { userId: null, reason: "no_agent_for_building" },
    },
    {
      ten: "mọi người phụ trách đều nghỉ",
      prior: null,
      toa: "Toà A",
      ung: [nguoi("x", { onLeave: true }), nguoi("y", { onLeave: true })],
      ra: { userId: null, reason: "no_agent_for_building" },
    },
  ];
  let so = 0;
  for (const d of bang) {
    assert.deepEqual(chooseAgent({ buildingName: d.toa, priorAgentUserId: d.prior }, d.ung), d.ra, d.ten);
    so++;
  }
  assert.equal(so, bang.length);
});

test("chia: khu khớp toà không phân hoa thường, khoảng trắng", () => {
  const toHop = "Toà A"; // «Toà A» viết bằng dấu tổ hợp
  for (const z of [" toà  a ", "TOÀ A", "Toà A", toHop]) assert.equal(sameBuilding(z, "Toà A"), true, JSON.stringify(z));
  assert.equal(sameBuilding("Toà B", "Toà A"), false);
});

const T = "2026-10-31T09:00:00.000Z";
const luc = (phut: number, giay = 0) => new Date(Date.parse(T) + phut * 60_000 + giay * 1000);
const su = (o: Partial<DeadlineFact> = {}): DeadlineFact => ({ leadId: "l", deadlineFrom: T, acceptedAt: null, firstCalledAt: null, raised: [], ...o });

test("hạn: bảng mốc viết trước", () => {
  const bang: { ten: string; now: Date; fact: DeadlineFact; ra: string[] }[] = [
    { ten: "14:59 chưa nhận", now: luc(14, 59), fact: su(), ra: [] },
    { ten: "15:00 chưa nhận", now: luc(15), fact: su(), ra: ["accept_overdue"] },
    { ten: "15:00 đã nhận", now: luc(15), fact: su({ acceptedAt: luc(3).toISOString() }), ra: [] },
    { ten: "29:59 đã báo nhận", now: luc(29, 59), fact: su({ raised: ["accept_overdue"] }), ra: [] },
    { ten: "30:00 đã báo nhận", now: luc(30), fact: su({ raised: ["accept_overdue"] }), ra: ["first_call_overdue"] },
    { ten: "30:00 chưa báo gì", now: luc(30), fact: su(), ra: ["accept_overdue", "first_call_overdue"] },
    { ten: "30:00 đã nhận chưa gọi", now: luc(30), fact: su({ acceptedAt: luc(1).toISOString() }), ra: ["first_call_overdue"] },
    {
      ten: "30:00 đã gọi",
      now: luc(30),
      fact: su({ acceptedAt: luc(1).toISOString(), firstCalledAt: luc(20).toISOString() }),
      ra: [],
    },
    { ten: "45:00 đã báo cả hai", now: luc(45), fact: su({ raised: ["accept_overdue", "first_call_overdue"] }), ra: [] },
  ];
  let so = 0;
  for (const d of bang) {
    assert.deepEqual(dueAlerts(d.fact, d.now), d.ra, d.ten);
    so++;
  }
  assert.equal(so, bang.length);
});

test("hạn: mặc định 15 và 30 phút", () => {
  assert.deepEqual(DEFAULT_LEAD_DEADLINES, { acceptMinutes: 15, firstCallMinutes: 30 });
});
