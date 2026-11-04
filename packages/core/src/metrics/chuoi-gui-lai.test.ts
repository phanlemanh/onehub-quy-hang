// Chuỗi gửi lại trong số đo dòng vào (hàng va-moc-goi-dau-lead-tra-lai, luật 37 · Ngoài-5 hàng 52) — E4. Bảng viết trước
// sáu hình chuỗi × hai số đo, chạy qua tinhSoDo thật: một chủ nhà đếm một lần, kỳ và gốc thời gian theo lead đầu chuỗi,
// gọi đầu là cuộc gọi sớm nhất trong chuỗi, Sẵn sàng bán là lúc lead cuối lên bảng; xét tại `den`.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { GiaTriSoDo, LeadVao, MetricCode } from "./kieu";
import { tinhSoDo } from "./so-do";

const TU = "2026-11-03T00:00:00Z";
const DEN = "2026-11-17T00:00:00Z";
const ngay = (n: number, gio = 2) => new Date(Date.UTC(2026, 10, 3 + n, gio)).toISOString();
const lead = (id: string, o: Partial<LeadVao>): LeadVao => ({
  id,
  createdAt: ngay(0),
  unitNumber: null,
  outcome: "new",
  matchedAgentUserId: "dau-chu-1",
  routedAt: null,
  acceptedAt: null,
  firstCalledAt: null,
  boardAt: null,
  returnedAt: null,
  resubmittedAt: null,
  resubmittedLeadId: null,
  discardedAt: null,
  ...o,
});
/** Lead `a` trả lại ngày `tra`, gửi lại thành `b` ngày `gui`. */
const traGui = (a: Partial<LeadVao>, b: string, tra: number, gui: number): Partial<LeadVao> => ({
  ...a,
  returnedAt: ngay(tra),
  resubmittedAt: ngay(gui),
  resubmittedLeadId: b,
});

type O = { n: number; giaTri: number[]; chiTiet: { chuaChia: number; daChia: number; traLai: number } };
const so = (lead: LeadVao[], ma: MetricCode): O => {
  const d = tinhSoDo({ tu: TU, den: DEN, hang: [], lead, danhMuc: { subdivisions: [] } }).find((r) => r.ma === ma)!;
  const g = d as unknown as Extract<GiaTriSoDo, { kieu: "thoi-luong" }>;
  return { n: g.n, giaTri: g.giaTri, chiTiet: g.chiTiet };
};
const KHONG = { chuaChia: 0, daChia: 0, traLai: 0 };

type Hinh = { ten: string; lead: LeadVao[]; goiDau: O; sanSang: O };
// Bảng viết trước: sáu hình chuỗi; mỗi hình mong cả lead → cuộc gọi đầu (ngày quy ra phút) và lead → Sẵn sàng bán (ngày).
const P = 24 * 60;
const BANG: Hinh[] = [
  {
    ten: "không gửi lại",
    lead: [lead("a", { firstCalledAt: ngay(1), boardAt: ngay(4) })],
    goiDau: { n: 1, giaTri: [P], chiTiet: KHONG },
    sanSang: { n: 1, giaTri: [4], chiTiet: KHONG },
  },
  {
    ten: "gửi lại một lần trước mốc",
    lead: [lead("a", traGui({}, "b", 2, 3)), lead("b", { createdAt: ngay(3), firstCalledAt: ngay(4), boardAt: ngay(9) })],
    goiDau: { n: 1, giaTri: [4 * P], chiTiet: KHONG },
    sanSang: { n: 1, giaTri: [9], chiTiet: KHONG },
  },
  {
    ten: "gửi lại hai lần",
    lead: [
      lead("a", traGui({}, "b", 1, 2)),
      lead("b", traGui({ createdAt: ngay(2) }, "c", 3, 4)),
      lead("c", { createdAt: ngay(4), firstCalledAt: ngay(5), boardAt: ngay(10) }),
    ],
    goiDau: { n: 1, giaTri: [5 * P], chiTiet: KHONG },
    sanSang: { n: 1, giaTri: [10], chiTiet: KHONG },
  },
  {
    ten: "gửi lại sau mốc",
    lead: [lead("a", { ...traGui({}, "b", 5, 20) }), lead("b", { createdAt: ngay(20) })],
    goiDau: { n: 0, giaTri: [], chiTiet: { ...KHONG, traLai: 1 } },
    sanSang: { n: 0, giaTri: [], chiTiet: { ...KHONG, traLai: 1 } },
  },
  {
    ten: "lead đầu nhập trước kỳ, gửi lại trong kỳ",
    lead: [lead("a", traGui({ createdAt: ngay(-3) }, "b", -1, 1)), lead("b", { createdAt: ngay(1), firstCalledAt: ngay(2), boardAt: ngay(6) })],
    goiDau: { n: 0, giaTri: [], chiTiet: KHONG },
    sanSang: { n: 0, giaTri: [], chiTiet: KHONG },
  },
  {
    ten: "lead đầu đã gọi rồi trả lại, gửi lại, người mới gọi sau",
    lead: [lead("a", traGui({ firstCalledAt: ngay(0, 5) }, "b", 1, 10)), lead("b", { createdAt: ngay(10), firstCalledAt: ngay(11), boardAt: ngay(12) })],
    goiDau: { n: 1, giaTri: [3 * 60], chiTiet: KHONG },
    sanSang: { n: 1, giaTri: [12], chiTiet: KHONG },
  },
];

test("chuỗi gửi lại: bảng sáu hình đủ", () => assert.equal(BANG.length, 6));

for (const h of BANG) {
  test(`chuỗi gửi lại: ${h.ten}`, () => {
    assert.deepEqual(so(h.lead, "lead_to_first_call"), h.goiDau, `${h.ten} — lead → cuộc gọi đầu`);
    assert.deepEqual(so(h.lead, "lead_to_ready"), h.sanSang, `${h.ten} — lead → Sẵn sàng bán`);
  });
}
