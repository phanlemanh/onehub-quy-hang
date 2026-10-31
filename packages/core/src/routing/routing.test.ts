// Chia lead và hạn ở lõi (hàng 25: AC-1, AC-2). Bảng ca viết trước; mỗi dòng một lần so.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyLeadRoutingPatch,
  chooseAgent,
  DEFAULT_LEAD_ROUTING,
  dueAlerts,
  readLeadRoutingSettings,
  poolVisibleTo,
  ROUTING_STRATEGIES,
  sameBuilding,
  unroutedDue,
  type DeadlineFact,
  type RoutingCandidate,
  type RoutingChoice,
  type RoutingStrategyKey,
} from ".";

const nguoi = (userId: string, o: Partial<RoutingCandidate> = {}): RoutingCandidate => ({
  userId,
  roles: ["listing_agent"],
  zoneNames: ["Toà A"],
  onLeave: false,
  joinedAt: "2026-10-01T00:00:00Z",
  lastRoutedSeq: null,
  openLeads: 0,
  ...o,
});

type DongChon = { ten: string; prior?: string; toa?: string; ung: RoutingCandidate[]; ra: RoutingChoice };
function chayBang(strategy: RoutingStrategyKey, bang: DongChon[]) {
  let so = 0;
  for (const d of bang) {
    const lead = { buildingName: d.toa ?? "Toà A", priorAgentUserId: d.prior ?? null };
    assert.deepEqual(chooseAgent(lead, d.ung, strategy), d.ra, `${strategy}: ${d.ten}`);
    so++;
  }
  assert.equal(so, bang.length);
}

test("chia: luật chủ trùng đứng trước mọi cách chia", () => {
  for (const s of ROUTING_STRATEGIES) {
    const ung = [nguoi("a"), nguoi("cu", { zoneNames: ["Toà B"], lastRoutedSeq: 9, openLeads: 9 })];
    assert.deepEqual(chooseAgent({ buildingName: "Toà A", priorAgentUserId: "cu" }, ung, s), { userId: "cu", reason: "same_owner" }, s);
    const nghi = [nguoi("a"), nguoi("cu", { onLeave: true })];
    const thuong = chooseAgent({ buildingName: "Toà A", priorAgentUserId: null }, nghi, s);
    assert.deepEqual(chooseAgent({ buildingName: "Toà A", priorAgentUserId: "cu" }, nghi, s), thuong, `${s}: người cũ nghỉ`);
    const matVai = [nguoi("a"), nguoi("cu", { roles: ["buyer_agent"] })];
    assert.deepEqual(chooseAgent({ buildingName: "Toà A", priorAgentUserId: "cu" }, matVai, s), thuong, `${s}: người cũ mất vai`);
  }
});

test("chia: theo khu lần lượt — bảng viết trước", () => {
  chayBang("zone_round_robin", [
    { ten: "người nghỉ bị bỏ qua", ung: [nguoi("nghi", { onLeave: true }), nguoi("lam", { lastRoutedSeq: 50 })], ra: { userId: "lam", reason: "building" } },
    { ten: "số thứ tự chia nhỏ nhất thắng", ung: [nguoi("moi", { lastRoutedSeq: 7 }), nguoi("cu", { lastRoutedSeq: 3 })], ra: { userId: "cu", reason: "building" } },
    { ten: "chưa nhận lần nào đứng đầu", ung: [nguoi("da", { lastRoutedSeq: 1 }), nguoi("chua")], ra: { userId: "chua", reason: "building" } },
    {
      ten: "hoà thì người vào sàn trước",
      ung: [nguoi("sau", { joinedAt: "2026-10-02T00:00:00Z" }), nguoi("truoc", { joinedAt: "2026-10-01T00:00:00Z" })],
      ra: { userId: "truoc", reason: "building" },
    },
    {
      ten: "telesales hay trưởng nhóm có khu trùng toà không được chọn",
      ung: [nguoi("ts", { roles: ["telesales"] }), nguoi("tn", { roles: ["team_lead"] })],
      ra: { userId: null, reason: "no_agent_for_building" },
    },
    { ten: "người phụ trách toà khác không được chọn", ung: [nguoi("b", { zoneNames: ["Toà B"] })], ra: { userId: null, reason: "no_agent_for_building" } },
    {
      ten: "mọi người phụ trách đều nghỉ",
      ung: [nguoi("x", { onLeave: true }), nguoi("y", { onLeave: true })],
      ra: { userId: null, reason: "no_agent_for_building" },
    },
  ]);
});

test("chia: lần lượt toàn sàn — bảng viết trước", () => {
  chayBang("company_round_robin", [
    {
      ten: "khu không xét — người phụ trách toà khác được chọn",
      ung: [nguoi("a", { lastRoutedSeq: 4 }), nguoi("b", { zoneNames: ["Toà B"], lastRoutedSeq: 2 })],
      ra: { userId: "b", reason: "company" },
    },
    { ten: "người không có khu nào vẫn được chọn", ung: [nguoi("a", { lastRoutedSeq: 1 }), nguoi("trong", { zoneNames: [] })], ra: { userId: "trong", reason: "company" } },
    { ten: "người nghỉ bị bỏ qua", ung: [nguoi("nghi", { onLeave: true }), nguoi("lam", { lastRoutedSeq: 9 })], ra: { userId: "lam", reason: "company" } },
    { ten: "không vai đầu chủ không được chọn", ung: [nguoi("ts", { roles: ["telesales"] })], ra: { userId: null, reason: "no_agent" } },
  ]);
});

test("chia: theo khu, ít lead đang mở — bảng viết trước", () => {
  chayBang("zone_least_open", [
    {
      ten: "ít lead đang mở thắng dù vừa được chia",
      ung: [nguoi("ban", { openLeads: 3, lastRoutedSeq: 1 }), nguoi("ranh", { openLeads: 1, lastRoutedSeq: 8 })],
      ra: { userId: "ranh", reason: "least_open" },
    },
    {
      ten: "bằng số lead đang mở thì lâu chưa được chia nhất",
      ung: [nguoi("moi", { openLeads: 2, lastRoutedSeq: 7 }), nguoi("cu", { openLeads: 2, lastRoutedSeq: 3 })],
      ra: { userId: "cu", reason: "least_open" },
    },
    {
      ten: "người phụ trách toà khác không được chọn dù rảnh",
      ung: [nguoi("a", { openLeads: 5 }), nguoi("b", { zoneNames: ["Toà B"], openLeads: 0 })],
      ra: { userId: "a", reason: "least_open" },
    },
    { ten: "người nghỉ bị bỏ qua", ung: [nguoi("nghi", { onLeave: true }), nguoi("lam", { openLeads: 4 })], ra: { userId: "lam", reason: "least_open" } },
    { ten: "không ai phụ trách", ung: [nguoi("b", { zoneNames: ["Toà B"] })], ra: { userId: null, reason: "no_agent_for_building" } },
  ]);
});

test("chia: kho chung và trưởng nhóm chia tay không tự chia", () => {
  chayBang("open_pool", [{ ten: "có người rảnh vẫn không chia", ung: [nguoi("a")], ra: { userId: null, reason: "pool" } }]);
  chayBang("manual", [{ ten: "có người rảnh vẫn không chia", ung: [nguoi("a")], ra: { userId: null, reason: "manual" } }]);
});

test("kho chung: ai thấy và nhận được — bảng viết trước", () => {
  const bang: { ten: string; c: RoutingCandidate; ra: boolean }[] = [
    { ten: "đầu chủ phụ trách toà", c: nguoi("a"), ra: true },
    { ten: "tên khu khác hoa thường", c: nguoi("a", { zoneNames: [" TOÀ a"] }), ra: true },
    { ten: "đầu chủ phụ trách toà khác", c: nguoi("b", { zoneNames: ["Toà B"] }), ra: false },
    { ten: "đầu chủ đang nghỉ", c: nguoi("a", { onLeave: true }), ra: false },
    { ten: "telesales có khu trùng", c: nguoi("ts", { roles: ["telesales"] }), ra: false },
  ];
  let so = 0;
  for (const d of bang) {
    assert.equal(poolVisibleTo({ buildingName: "Toà A" }, d.c), d.ra, d.ten);
    so++;
  }
  assert.equal(so, bang.length);
});

// Cùng một luồng lead dưới năm cách chia. Trước luồng: dc2 đã có một lead Toà B chưa gọi (lần chia 1), dc1 đã gọi xong
// một lead Toà A (lần chia 2). dc1 phụ trách A, dc2 phụ trách A và B, dc3 phụ trách B; vào sàn theo thứ tự dc1, dc2, dc3.
const LUONG = ["Toà A", "Toà A", "Toà B", "Toà A", "Toà B", "Toà A"] as const;
const LUONG_RA: Record<RoutingStrategyKey, readonly (string | null)[]> = {
  zone_round_robin: ["dc2", "dc1", "dc3", "dc2", "dc3", "dc1"],
  company_round_robin: ["dc3", "dc2", "dc1", "dc3", "dc2", "dc1"],
  zone_least_open: ["dc1", "dc2", "dc3", "dc1", "dc3", "dc2"],
  open_pool: [null, null, null, null, null, null],
  manual: [null, null, null, null, null, null],
};

test("chia: một luồng lead dưới từng cách chia", () => {
  let so = 0;
  for (const s of ROUTING_STRATEGIES) {
    const ds = [
      nguoi("dc1", { zoneNames: ["Toà A"], joinedAt: "2026-10-01T00:00:00Z", lastRoutedSeq: 2, openLeads: 0 }),
      nguoi("dc2", { zoneNames: ["Toà A", "Toà B"], joinedAt: "2026-10-02T00:00:00Z", lastRoutedSeq: 1, openLeads: 1 }),
      nguoi("dc3", { zoneNames: ["Toà B"], joinedAt: "2026-10-03T00:00:00Z" }),
    ];
    let seq = 2;
    const ra = LUONG.map((toa) => {
      const chon = chooseAgent({ buildingName: toa, priorAgentUserId: null }, ds, s);
      const c = ds.find((x) => x.userId === chon.userId);
      if (c) {
        c.lastRoutedSeq = ++seq;
        c.openLeads++;
      }
      return chon.userId;
    });
    assert.deepEqual(ra, LUONG_RA[s], s);
    so++;
  }
  assert.equal(so, ROUTING_STRATEGIES.length);
});

test("chia: khu khớp toà không phân hoa thường, khoảng trắng", () => {
  const toHop = "Toà A"; // «Toà A» viết bằng dấu tổ hợp
  for (const z of [" toà  a ", "TOÀ A", "Toà A", toHop]) assert.equal(sameBuilding(z, "Toà A"), true, JSON.stringify(z));
  assert.equal(sameBuilding("Toà B", "Toà A"), false);
});

const T = "2026-10-31T09:00:00.000Z";
const luc = (phut: number, giay = 0) => new Date(Date.parse(T) + phut * 60_000 + giay * 1000);
const su = (o: Partial<DeadlineFact> = {}): DeadlineFact => ({
  leadId: "l",
  deadlineFrom: T,
  acceptMinutes: 15,
  firstCallMinutes: 30,
  acceptedAt: null,
  firstCalledAt: null,
  raised: [],
  ...o,
});

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
    { ten: "hạn đóng dấu 5/10: 4:59", now: luc(4, 59), fact: su({ acceptMinutes: 5, firstCallMinutes: 10 }), ra: [] },
    { ten: "hạn đóng dấu 5/10: 5:00", now: luc(5), fact: su({ acceptMinutes: 5, firstCallMinutes: 10 }), ra: ["accept_overdue"] },
    {
      ten: "hạn đóng dấu 5/10: 10:00",
      now: luc(10),
      fact: su({ acceptMinutes: 5, firstCallMinutes: 10, raised: ["accept_overdue"] }),
      ra: ["first_call_overdue"],
    },
  ];
  let so = 0;
  for (const d of bang) {
    assert.deepEqual(dueAlerts(d.fact, d.now), d.ra, d.ten);
    so++;
  }
  assert.equal(so, bang.length);
});

test("hạn: lúc báo lead chưa có người", () => {
  const bang: { ten: string; strategy: RoutingStrategyKey; now: Date; ra: boolean }[] = [
    { ten: "theo khu: ngay", strategy: "zone_round_robin", now: luc(0), ra: true },
    { ten: "toàn sàn: ngay", strategy: "company_round_robin", now: luc(0), ra: true },
    { ten: "ít lead đang mở: ngay", strategy: "zone_least_open", now: luc(0), ra: true },
    { ten: "chia tay: ngay", strategy: "manual", now: luc(0), ra: true },
    { ten: "kho chung: 14:59 chưa", strategy: "open_pool", now: luc(14, 59), ra: false },
    { ten: "kho chung: 15:00 báo", strategy: "open_pool", now: luc(15), ra: true },
  ];
  let so = 0;
  for (const d of bang) {
    assert.equal(unroutedDue({ strategy: d.strategy, createdAt: T, acceptMinutes: 15 }, d.now), d.ra, d.ten);
    so++;
  }
  assert.equal(so, bang.length);
});

test("cấu hình: mặc định của sàn", () => {
  assert.deepEqual(DEFAULT_LEAD_ROUTING, { strategy: "zone_round_robin", acceptMinutes: 15, firstCallMinutes: 30, alertTo: "team_lead" });
  assert.deepEqual(readLeadRoutingSettings([]), DEFAULT_LEAD_ROUTING);
});

test("cấu hình: đọc và đổi — bảng viết trước", () => {
  assert.deepEqual(
    readLeadRoutingSettings([
      { key: "lead_routing.strategy", value: "open_pool" },
      { key: "lead_routing.accept_minutes", value: 5 },
      { key: "nhom_khac.khoa", value: "bất kỳ" },
    ]),
    { ...DEFAULT_LEAD_ROUTING, strategy: "open_pool", acceptMinutes: 5 },
  );
  assert.throws(() => readLeadRoutingSettings([{ key: "lead_routing.strategy", value: "script" }]), /lead_routing\.strategy/);

  const bang: { ten: string; vao: unknown; ra: { ok: true; rows: { key: string; value: unknown }[] } | { ok: false; loi: RegExp } }[] = [
    { ten: "đổi cách chia", vao: { strategy: "manual" }, ra: { ok: true, rows: [{ key: "lead_routing.strategy", value: "manual" }] } },
    {
      ten: "đổi hai hạn",
      vao: { acceptMinutes: 10, firstCallMinutes: 20 },
      ra: { ok: true, rows: [{ key: "lead_routing.accept_minutes", value: 10 }, { key: "lead_routing.first_call_minutes", value: 20 }] },
    },
    { ten: "người đọc báo", vao: { alertTo: "team_lead_and_admin" }, ra: { ok: true, rows: [{ key: "lead_routing.alert_to", value: "team_lead_and_admin" }] } },
    { ten: "cách chia ngoài thực đơn", vao: { strategy: "script" }, ra: { ok: false, loi: /thực đơn/ } },
    { ten: "khoá lạ", vao: { strategy: "manual", rule: "x" }, ra: { ok: false, loi: /khoá lạ/ } },
    { ten: "phút không nguyên", vao: { acceptMinutes: 1.5 }, ra: { ok: false, loi: /số phút nguyên/ } },
    { ten: "phút 0", vao: { acceptMinutes: 0 }, ra: { ok: false, loi: /số phút nguyên/ } },
    { ten: "phút quá một ngày", vao: { firstCallMinutes: 1441 }, ra: { ok: false, loi: /số phút nguyên/ } },
    { ten: "hạn gọi ngắn hơn hạn nhận", vao: { acceptMinutes: 40 }, ra: { ok: false, loi: /hạn gọi ngắn hơn/ } },
    { ten: "thân rỗng", vao: {}, ra: { ok: false, loi: /không có khoá/ } },
    { ten: "thân không phải đối tượng", vao: ["manual"], ra: { ok: false, loi: /đối tượng/ } },
  ];
  let so = 0;
  for (const d of bang) {
    const kq = applyLeadRoutingPatch(DEFAULT_LEAD_ROUTING, d.vao);
    if (d.ra.ok) {
      assert.equal(kq.ok, true, d.ten);
      if (kq.ok) assert.deepEqual(kq.rows, d.ra.rows, d.ten);
    } else {
      assert.equal(kq.ok, false, d.ten);
      if (!kq.ok) assert.match(kq.error, d.ra.loi, d.ten);
    }
    so++;
  }
  assert.equal(so, bang.length);
});
